using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Shared;

namespace Server.AviscribeApi;

public sealed class AviscribeSessionManager
{
    private const string JoinAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private readonly object _sync = new();
    private readonly Logger _logger = new("Aviscribe");
    private readonly SemaphoreSlim _persistenceGate = new(1, 1);
    private readonly TimeProvider _timeProvider;
    private readonly Dictionary<Guid, SessionState> _sessions = [];
    private readonly Dictionary<string, Queue<DateTimeOffset>> _rateLimits = [];
    private bool _loaded;

    public AviscribeSessionManager(TimeProvider? timeProvider = null)
    {
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    private DateTimeOffset UtcNow => _timeProvider.GetUtcNow();

    public async Task EnsureLoadedAsync(CancellationToken cancellationToken)
    {
        lock (_sync)
        {
            if (_loaded) return;
            _loaded = true;
        }

        var path = Settings.Aviscribe.StateFilename;
        if (!File.Exists(path)) return;

        try
        {
            var json = await File.ReadAllTextAsync(path, cancellationToken);
            var store = JsonSerializer.Deserialize<PersistedStore>(
                json,
                AviscribeProtocol.JsonOptions);
            if (store == null) return;

            var now = UtcNow;
            lock (_sync)
            {
                foreach (var session in store.Sessions)
                {
                    if (session.Ended || session.Participants.Count == 0) continue;
                    session.Waiters = [];
                    session.RestoreGraceUntilUtc = now.AddSeconds(
                        Math.Max(5, Settings.Aviscribe.OwnerTimeoutSeconds));
                    foreach (var participant in session.Participants.Values)
                        participant.IsOnline = false;
                    _sessions[session.SessionId] = session;
                }
            }

            await SweepAsync(cancellationToken);
            _logger.Info($"Restored {_sessions.Count} Aviscribe run(s).");
        }
        catch (Exception ex)
        {
            _logger.Error($"Could not restore Aviscribe runs: {ex}");
        }
    }

    public object GetCapabilities() => new
    {
        enabled = Settings.Aviscribe.Enabled,
        protocolVersions = new[] { AviscribeProtocol.Version },
        allowClientRunCreation = true,
        maximumActiveRuns = 1,
        maximumParticipantsPerRun = Settings.Server.MaxPlayers,
        idleExpirationMinutes = Settings.Aviscribe.IdleExpirationMinutes,
        maximumRunHours = Settings.Aviscribe.MaximumRunHours,
        waitTimeoutSeconds = Settings.Aviscribe.WaitTimeoutSeconds,
        maximumRequestBytes = AviscribeProtocol.MaximumRequestSize,
        maximumResponseBytes = AviscribeProtocol.MaximumResponseSize,
        maximumEventsPerPublish = 50,
        maximumEventsPerRun = Settings.Aviscribe.MaximumEventsPerRun,
        retainedChanges = Settings.Aviscribe.RetainedChangeCount,
        retainedFeedItems = Settings.Aviscribe.RetainedEventFeedCount
    };

    public async Task<SessionConnectionResult> CreateRunAsync(
        CreateRunRequest request,
        IPAddress remoteAddress,
        CancellationToken cancellationToken)
    {
        ValidateDisplayName(request.DisplayName);
        ValidateCatalogHash(request.CatalogHash);
        ValidateConfiguration(request.Configuration);

        string joinCode;
        string participantToken;
        SessionState session;
        ParticipantState participant;
        var now = UtcNow;

        lock (_sync)
        {
            ThrowIfDisabled();
            SweepExpiredLocked(now);
            if (!AllowRateLocked($"create:{remoteAddress}", 3, TimeSpan.FromHours(1), now))
                throw new AviscribeApiException("rateLimited", "Too many runs were created from this address.");
            if (_sessions.Values.Any(item => !item.Ended))
                throw new AviscribeApiException(
                    "capacityReached",
                    "This server port already has an active Aviscribe run.");

            do joinCode = GenerateJoinCode();
            while (_sessions.Values.Any(item =>
                       !item.Ended && FixedEquals(
                           item.JoinCodeHash,
                           HashSecret(NormalizeJoinCode(joinCode)))));

            participantToken = GenerateToken();
            participant = new ParticipantState
            {
                ParticipantId = Guid.NewGuid(),
                DisplayName = request.DisplayName.Trim(),
                TokenHash = HashSecret(participantToken),
                JoinedSequence = 1,
                JoinedAtUtc = now,
                LastSeenUtc = now,
                IsOnline = true
            };
            session = new SessionState
            {
                SessionId = Guid.NewGuid(),
                Generation = 1,
                CatalogHash = request.CatalogHash.Trim().ToUpperInvariant(),
                JoinCode = joinCode,
                JoinCodeHash = HashSecret(NormalizeJoinCode(joinCode)),
                Configuration = Clone(request.Configuration),
                CreatedAtUtc = now,
                LastActivityUtc = now,
                OwnerParticipantId = participant.ParticipantId,
                NextJoinSequence = 2
            };
            session.Participants[participant.ParticipantId] = participant;
            AddChangeLocked(session, new RunChange
            {
                Kind = "runCreated",
                ActorParticipantId = participant.ParticipantId,
                ActorDisplayName = participant.DisplayName,
                Participant = View(session, participant)
            }, feedMessage: $"{participant.DisplayName} created the run.");
            _sessions[session.SessionId] = session;
        }

        await PersistAsync(cancellationToken);
        lock (_sync)
        {
            return ConnectionResult(session, participant, participantToken, joinCode);
        }
    }

    public async Task<SessionConnectionResult> JoinRunAsync(
        JoinRunRequest request,
        IPAddress remoteAddress,
        CancellationToken cancellationToken)
    {
        ValidateDisplayName(request.DisplayName);
        ValidateCatalogHash(request.CatalogHash);
        var normalizedCode = NormalizeJoinCode(request.JoinCode);
        var now = UtcNow;
        string participantToken;
        SessionState session;
        ParticipantState participant;

        lock (_sync)
        {
            ThrowIfDisabled();
            SweepExpiredLocked(now);
            var hash = HashSecret(normalizedCode);
            session = _sessions.Values.FirstOrDefault(item =>
                !item.Ended && FixedEquals(item.JoinCodeHash, hash))!;
            if (session == null)
            {
                if (!AllowRateLocked($"joinFail:{remoteAddress}", 5, TimeSpan.FromMinutes(1), now))
                    throw new AviscribeApiException("rateLimited", "Too many failed join attempts.");
                throw new AviscribeApiException("invalidJoinCode", "The run code is invalid or expired.");
            }
            if (!FixedEquals(session.CatalogHash, request.CatalogHash.Trim().ToUpperInvariant()))
                throw new AviscribeApiException("catalogMismatch", "This run uses a different moon catalog.");
            if (session.Participants.Count >= Math.Max(1, (int)Settings.Server.MaxPlayers))
                throw new AviscribeApiException(
                    "capacityReached",
                    "This run has reached the SMOO+ server player limit.");

            participantToken = GenerateToken();
            participant = new ParticipantState
            {
                ParticipantId = Guid.NewGuid(),
                DisplayName = request.DisplayName.Trim(),
                TokenHash = HashSecret(participantToken),
                JoinedSequence = session.NextJoinSequence++,
                JoinedAtUtc = now,
                LastSeenUtc = now,
                IsOnline = true
            };
            session.Participants[participant.ParticipantId] = participant;
            if (session.OwnerParticipantId == null)
                session.OwnerParticipantId = participant.ParticipantId;
            AddChangeLocked(session, new RunChange
            {
                Kind = "participantJoined",
                ActorParticipantId = participant.ParticipantId,
                ActorDisplayName = participant.DisplayName,
                Participant = View(session, participant),
                OwnerParticipantId = session.OwnerParticipantId
            }, feedMessage: $"{participant.DisplayName} joined.");
        }

        await PersistAsync(cancellationToken);
        lock (_sync)
        {
            return ConnectionResult(session, participant, participantToken, null);
        }
    }

    public async Task<SessionConnectionResult> ResumeRunAsync(
        AviscribeRequest request,
        CancellationToken cancellationToken)
    {
        var resume = request.Data.ValueKind == JsonValueKind.Object
            ? request.Data.Deserialize<ResumeRunRequest>(AviscribeProtocol.JsonOptions) ?? new ResumeRunRequest()
            : new ResumeRunRequest();
        SessionState session;
        ParticipantState participant;
        bool changed;
        lock (_sync)
        {
            (session, participant) = AuthenticateLocked(request, UtcNow);
            changed = TouchParticipantLocked(session, participant, UtcNow);
            if (session.JoinCode == null && !string.IsNullOrWhiteSpace(resume.JoinCode))
            {
                var normalizedCode = NormalizeJoinCode(resume.JoinCode);
                if (normalizedCode.Length == 8 &&
                    FixedEquals(session.JoinCodeHash, HashSecret(normalizedCode)))
                {
                    session.JoinCode = FormatJoinCode(normalizedCode);
                    changed = true;
                }
            }
        }
        if (changed) await PersistAsync(cancellationToken);
        lock (_sync)
        {
            return ConnectionResult(
                session,
                participant,
                request.ParticipantToken!,
                session.JoinCode);
        }
    }

    public async Task<PublishResult> PublishAsync(
        AviscribeRequest envelope,
        PublishEventsRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Events.Count is < 1 or > 50)
            throw new AviscribeApiException("invalidRequest", "Publish between 1 and 50 events.");

        SessionState session;
        ParticipantState participant;
        var receipts = new List<EventReceipt>();
        lock (_sync)
        {
            (session, participant) = AuthenticateLocked(envelope, UtcNow);
            TouchParticipantLocked(session, participant, UtcNow);
            EnsureGeneration(session, request.Generation);

            foreach (var runEvent in request.Events) ValidateEvent(runEvent);
            var newEventCount = request.Events
                .Select(item => item.EventId)
                .Distinct()
                .Count(eventId => !session.ProcessedEvents.ContainsKey(eventId));
            if (session.ProcessedEvents.Count + newEventCount >
                Math.Max(1, Settings.Aviscribe.MaximumEventsPerRun))
                throw new AviscribeApiException("capacityReached", "This run has reached its event limit.");

            foreach (var runEvent in request.Events)
            {
                if (session.ProcessedEvents.TryGetValue(runEvent.EventId, out var existingRevision))
                {
                    receipts.Add(new EventReceipt
                    {
                        EventId = runEvent.EventId,
                        Revision = existingRevision,
                        WasDuplicate = true
                    });
                    continue;
                }
                ApplyEventLocked(session, runEvent);
                AddChangeLocked(session, new RunChange
                {
                    Kind = "runEvent",
                    ActorParticipantId = participant.ParticipantId,
                    ActorDisplayName = participant.DisplayName,
                    Event = Clone(runEvent)
                }, runEvent.ToMoonKey(), Describe(runEvent, participant.DisplayName));
                session.ProcessedEvents[runEvent.EventId] = session.Revision;
                receipts.Add(new EventReceipt
                {
                    EventId = runEvent.EventId,
                    Revision = session.Revision
                });
            }
        }

        await PersistAsync(cancellationToken);
        lock (_sync)
        {
            return new PublishResult
            {
                Generation = session.Generation,
                Revision = session.Revision,
                Events = receipts
            };
        }
    }

    public async Task<WaitResult> WaitForChangesAsync(
        AviscribeRequest envelope,
        WaitForChangesRequest request,
        CancellationToken cancellationToken)
    {
        TaskCompletionSource<long>? waiter = null;
        SessionState session;
        bool presenceChanged;
        WaitResult? immediate;
        lock (_sync)
        {
            (session, var participant) = AuthenticateLocked(envelope, UtcNow, allowEnded: true);
            if (session.Ended)
                return new WaitResult { Kind = "ended", Generation = session.Generation, Revision = session.Revision };
            presenceChanged = TouchParticipantLocked(session, participant, UtcNow);
            immediate = BuildWaitResultLocked(session, request);
            if (immediate == null)
            {
                waiter = new TaskCompletionSource<long>(TaskCreationOptions.RunContinuationsAsynchronously);
                session.Waiters.Add(waiter);
            }
        }

        if (presenceChanged) await PersistAsync(cancellationToken);
        if (immediate != null) return immediate;

        try
        {
            var timeout = TimeSpan.FromSeconds(Math.Clamp(Settings.Aviscribe.WaitTimeoutSeconds, 1, 60));
            await Task.WhenAny(waiter!.Task, Task.Delay(timeout, cancellationToken));
        }
        finally
        {
            lock (_sync) session.Waiters.Remove(waiter!);
        }

        lock (_sync)
        {
            return BuildWaitResultLocked(session, request) ?? new WaitResult
            {
                Kind = "heartbeat",
                Generation = session.Generation,
                Revision = session.Revision
            };
        }
    }

    public async Task<object> LeaveRunAsync(AviscribeRequest request, CancellationToken cancellationToken)
    {
        Guid sessionId;
        lock (_sync)
        {
            var (session, participant) = AuthenticateLocked(request, UtcNow);
            sessionId = session.SessionId;
            session.Participants.Remove(participant.ParticipantId);
            if (session.Participants.Count == 0)
            {
                EndAndRemoveLocked(session, "emptyRoom", participant.ParticipantId, participant.DisplayName);
            }
            else
            {
                AddChangeLocked(session, new RunChange
                {
                    Kind = "participantLeft",
                    ActorParticipantId = participant.ParticipantId,
                    ActorDisplayName = participant.DisplayName
                }, feedMessage: $"{participant.DisplayName} left.");
                if (session.OwnerParticipantId == participant.ParticipantId)
                    TransferOwnershipLocked(session);
            }
        }
        await PersistAsync(cancellationToken);
        return new { sessionId, left = true };
    }

    public async Task<RunSnapshot> ResetRunAsync(
        AviscribeRequest envelope,
        ResetRunRequest request,
        CancellationToken cancellationToken)
    {
        ValidateConfiguration(request.Configuration);
        SessionState session;
        lock (_sync)
        {
            (session, var participant) = AuthenticateLocked(envelope, UtcNow);
            TouchParticipantLocked(session, participant, UtcNow);
            EnsureOwner(session, participant);
            session.Generation++;
            session.Configuration = Clone(request.Configuration);
            session.MoonFacts.Clear();
            session.ProcessedEvents.Clear();
            session.Changes.Clear();
            session.RecentEvents.Clear();
            AddChangeLocked(session, new RunChange
            {
                Kind = "runReset",
                Generation = session.Generation,
                ActorParticipantId = participant.ParticipantId,
                ActorDisplayName = participant.DisplayName
            }, feedMessage: $"{participant.DisplayName} reset the run.");
        }
        await PersistAsync(cancellationToken);
        lock (_sync) return SnapshotLocked(session);
    }

    public async Task<RunSnapshot> UpdateConfigurationAsync(
        AviscribeRequest envelope,
        UpdateConfigurationRequest request,
        CancellationToken cancellationToken)
    {
        ValidateConfiguration(request.Configuration);
        SessionState session;
        lock (_sync)
        {
            (session, var participant) = AuthenticateLocked(envelope, UtcNow);
            TouchParticipantLocked(session, participant, UtcNow);
            EnsureOwner(session, participant);
            session.Configuration = Clone(request.Configuration);
            AddChangeLocked(session, new RunChange
            {
                Kind = "configurationChanged",
                ActorParticipantId = participant.ParticipantId,
                ActorDisplayName = participant.DisplayName,
                Configuration = Clone(session.Configuration)
            }, feedMessage: $"{participant.DisplayName} updated the run settings.");
        }
        await PersistAsync(cancellationToken);
        lock (_sync) return SnapshotLocked(session);
    }

    public async Task<object> EndRunAsync(AviscribeRequest envelope, CancellationToken cancellationToken)
    {
        Guid sessionId;
        lock (_sync)
        {
            var (session, participant) = AuthenticateLocked(envelope, UtcNow);
            TouchParticipantLocked(session, participant, UtcNow);
            EnsureOwner(session, participant);
            sessionId = session.SessionId;
            EndAndRemoveLocked(session, "ended", participant.ParticipantId, participant.DisplayName);
        }
        await PersistAsync(cancellationToken);
        return new { sessionId, ended = true };
    }

    public async Task SweepAsync(CancellationToken cancellationToken)
    {
        bool changed;
        lock (_sync) changed = SweepExpiredLocked(UtcNow);
        if (changed) await PersistAsync(cancellationToken);
    }

    public string[] GetOperatorSummary()
    {
        lock (_sync)
        {
            var now = UtcNow;
            var active = _sessions.Values.Where(item => !item.Ended).OrderBy(item => item.CreatedAtUtc).ToList();
            if (active.Count == 0) return ["No active Aviscribe multiplayer rooms."];
            return active.Select(session =>
            {
                var online = session.Participants.Values.Count(item => item.IsOnline);
                var owner = session.OwnerParticipantId.HasValue &&
                            session.Participants.TryGetValue(session.OwnerParticipantId.Value, out var participant)
                    ? participant.DisplayName
                    : "none";
                var code = session.JoinCode ?? "unavailable";
                var idleFor = now - session.LastActivityUtc;
                var idleLimit = TimeSpan.FromMinutes(Math.Max(1, Settings.Aviscribe.IdleExpirationMinutes));
                var expiresIn = idleLimit > idleFor ? idleLimit - idleFor : TimeSpan.Zero;
                return $"room={code} session={session.SessionId} run={session.Generation} revision={session.Revision} " +
                       $"category={session.Configuration.Category} postgame={session.Configuration.IncludePostGame} " +
                       $"players={online}/{session.Participants.Count} owner={owner} moons={session.MoonFacts.Count} " +
                       $"lastEvent={session.LastActivityUtc:u} expiresIn={FormatDuration(expiresIn)}";
            }).ToArray();
        }
    }

    public string[] GetOperatorDetails()
    {
        lock (_sync)
        {
            var session = ActiveRoomLocked();
            if (session == null)
                return ["No active Aviscribe multiplayer room."];
            var owner = session.OwnerParticipantId.HasValue &&
                        session.Participants.TryGetValue(session.OwnerParticipantId.Value, out var ownerParticipant)
                ? ownerParticipant.DisplayName
                : "none";
            return
            [
                $"Room {session.JoinCode ?? "unavailable"} (session {session.SessionId}): owner={owner}",
                $"Run generation={session.Generation} revision={session.Revision} category={session.Configuration.Category} " +
                $"postgame={session.Configuration.IncludePostGame} moons={session.MoonFacts.Count}",
                $"Created={session.CreatedAtUtc:u} lastEvent={session.LastActivityUtc:u} players={session.Participants.Count}",
                ..session.Participants.Values
                    .OrderBy(item => item.JoinedSequence)
                    .Select(item => $"  {item.DisplayName} ({item.ParticipantId}) " +
                                    $"{(item.IsOnline ? "online" : "offline")}" +
                                    (item.ParticipantId == session.OwnerParticipantId ? " owner" : string.Empty))
            ];
        }
    }

    public string[] GetOperatorGameState()
    {
        lock (_sync)
        {
            var session = ActiveRoomLocked();
            if (session == null)
                return ["No active Aviscribe multiplayer room."];
            var header = $"Room {session.JoinCode ?? "unavailable"} (session {session.SessionId}) " +
                         $"run={session.Generation} revision={session.Revision} " +
                         $"category={session.Configuration.Category} postgame={session.Configuration.IncludePostGame} " +
                         $"moonFacts={session.MoonFacts.Count}";
            if (session.MoonFacts.Count == 0) return [header, "No shared moon facts."];
            return
            [
                header,
                ..session.MoonFacts.Values
                    .OrderBy(item => item.Moon.KingdomId)
                    .ThenBy(item => item.Moon.MoonId)
                    .Select(item => $"  kingdom={item.Moon.KingdomId} moon={item.Moon.MoonId} " +
                                    $"hinted={item.Hinted} collected={item.Collected} " +
                                    $"classification={item.ManualClassification}")
            ];
        }
    }

    public async Task<bool> EndByOperatorAsync(CancellationToken cancellationToken)
    {
        lock (_sync)
        {
            var session = ActiveRoomLocked();
            if (session == null) return false;
            EndAndRemoveLocked(session, "endedByOperator", null, "Server operator");
        }
        await PersistAsync(cancellationToken);
        return true;
    }

    public async Task<int> PurgeExpiredAsync(CancellationToken cancellationToken)
    {
        int before;
        int after;
        lock (_sync)
        {
            before = _sessions.Count;
            SweepExpiredLocked(UtcNow);
            foreach (var id in _sessions.Where(item => item.Value.Ended).Select(item => item.Key).ToArray())
                _sessions.Remove(id);
            after = _sessions.Count;
        }
        await PersistAsync(cancellationToken);
        return before - after;
    }

    private (SessionState Session, ParticipantState Participant) AuthenticateLocked(
        AviscribeRequest request,
        DateTimeOffset now,
        bool allowEnded = false)
    {
        ThrowIfDisabled();
        if (request.SessionId == null || request.ParticipantId == null || string.IsNullOrWhiteSpace(request.ParticipantToken))
            throw new AviscribeApiException("invalidParticipant", "Session credentials are required.");
        if (!_sessions.TryGetValue(request.SessionId.Value, out var session))
            throw new AviscribeApiException("runNotFound", "The run was not found.");
        if (session.Ended && !allowEnded)
            throw new AviscribeApiException("runExpired", "The run has ended or expired.");
        if (!session.Participants.TryGetValue(request.ParticipantId.Value, out var participant) ||
            !FixedEquals(participant.TokenHash, HashSecret(request.ParticipantToken)))
            throw new AviscribeApiException("invalidParticipant", "The participant credential is invalid.");
        if (!AllowRateLocked($"participant:{participant.ParticipantId}", 120, TimeSpan.FromMinutes(1), now))
            throw new AviscribeApiException("rateLimited", "The participant request rate was exceeded.");
        return (session, participant);
    }

    private bool TouchParticipantLocked(SessionState session, ParticipantState participant, DateTimeOffset now)
    {
        var changed = !participant.IsOnline;
        participant.LastSeenUtc = now;
        participant.IsOnline = true;
        if (changed)
        {
            if (session.OwnerParticipantId == null) session.OwnerParticipantId = EarliestOnlineLocked(session)?.ParticipantId;
            AddChangeLocked(session, new RunChange
            {
                Kind = "participantOnline",
                ActorParticipantId = participant.ParticipantId,
                ActorDisplayName = participant.DisplayName,
                Participant = View(session, participant),
                OwnerParticipantId = session.OwnerParticipantId
            }, feedMessage: $"{participant.DisplayName} reconnected.");
        }
        return changed;
    }

    private WaitResult? BuildWaitResultLocked(SessionState session, WaitForChangesRequest request)
    {
        if (session.Ended)
            return new WaitResult { Kind = "ended", Generation = session.Generation, Revision = session.Revision };
        if (request.Generation != session.Generation)
            return new WaitResult
            {
                Kind = "generationChanged",
                Generation = session.Generation,
                Revision = session.Revision,
                Snapshot = SnapshotLocked(session)
            };
        if (request.AfterRevision >= session.Revision) return null;
        var oldest = session.Changes.Count == 0 ? session.Revision + 1 : session.Changes[0].Revision;
        if (request.AfterRevision < oldest - 1)
            return new WaitResult
            {
                Kind = "snapshot",
                Generation = session.Generation,
                Revision = session.Revision,
                Snapshot = SnapshotLocked(session)
            };
        return new WaitResult
        {
            Kind = "changes",
            Generation = session.Generation,
            Revision = session.Revision,
            Changes = session.Changes.Where(item => item.Revision > request.AfterRevision).Select(Clone).ToList()
        };
    }

    private bool SweepExpiredLocked(DateTimeOffset now)
    {
        var changed = false;
        foreach (var session in _sessions.Values.Where(item => !item.Ended).ToArray())
        {
            if (session.Participants.Count == 0)
            {
                EndAndRemoveLocked(session, "emptyRoom", null, "Server");
                changed = true;
                continue;
            }
            var timeout = TimeSpan.FromSeconds(Math.Max(5, Settings.Aviscribe.OwnerTimeoutSeconds));
            foreach (var participant in session.Participants.Values.Where(item =>
                         item.IsOnline && now - item.LastSeenUtc > timeout).ToArray())
            {
                participant.IsOnline = false;
                AddChangeLocked(session, new RunChange
                {
                    Kind = "participantOffline",
                    ActorParticipantId = participant.ParticipantId,
                    ActorDisplayName = participant.DisplayName,
                    Participant = View(session, participant)
                }, feedMessage: $"{participant.DisplayName} disconnected.");
                changed = true;
            }

            if (session.RestoreGraceUntilUtc <= now && session.OwnerParticipantId is Guid ownerId &&
                (!session.Participants.TryGetValue(ownerId, out var owner) || !owner.IsOnline))
            {
                TransferOwnershipLocked(session);
                changed = true;
            }

            var idleLimit = TimeSpan.FromMinutes(Math.Max(1, Settings.Aviscribe.IdleExpirationMinutes));
            var idleExpired = now - session.LastActivityUtc >= idleLimit;
            var maximumReached = Settings.Aviscribe.MaximumRunHours is > 0 and var hours &&
                                 now - session.CreatedAtUtc >= TimeSpan.FromHours(hours);
            if (idleExpired || maximumReached)
            {
                EndAndRemoveLocked(
                    session,
                    maximumReached ? "maximumLifetimeExpired" : "idleExpired",
                    null,
                    "Server");
                changed = true;
            }
        }

        foreach (var id in _sessions.Where(item =>
                     item.Value.Ended && item.Value.EndedAtUtc.HasValue &&
                     now - item.Value.EndedAtUtc.Value > TimeSpan.FromMinutes(5))
                 .Select(item => item.Key).ToArray())
        {
            _sessions.Remove(id);
            changed = true;
        }
        return changed;
    }

    private void TransferOwnershipLocked(SessionState session)
    {
        var previous = session.OwnerParticipantId;
        session.OwnerParticipantId = EarliestOnlineLocked(session)?.ParticipantId;
        if (previous == session.OwnerParticipantId) return;
        var ownerName = session.OwnerParticipantId.HasValue &&
                        session.Participants.TryGetValue(session.OwnerParticipantId.Value, out var owner)
            ? owner.DisplayName
            : "none";
        AddChangeLocked(session, new RunChange
        {
            Kind = "ownerChanged",
            OwnerParticipantId = session.OwnerParticipantId,
            ActorDisplayName = ownerName
        }, feedMessage: session.OwnerParticipantId.HasValue
            ? $"{ownerName} became the run owner."
            : "The run currently has no owner.");
    }

    private static ParticipantState? EarliestOnlineLocked(SessionState session) => session.Participants.Values
        .Where(item => item.IsOnline)
        .OrderBy(item => item.JoinedSequence)
        .ThenBy(item => item.ParticipantId)
        .FirstOrDefault();

    private void EndLocked(SessionState session, string kind, Guid? actorId, string actorName)
    {
        session.Ended = true;
        session.EndedAtUtc = UtcNow;
        AddChangeLocked(session, new RunChange
        {
            Kind = kind,
            ActorParticipantId = actorId,
            ActorDisplayName = actorName
        }, feedMessage: $"The run ended ({kind}).");
    }

    private void EndAndRemoveLocked(SessionState session, string kind, Guid? actorId, string actorName)
    {
        EndLocked(session, kind, actorId, actorName);
        _sessions.Remove(session.SessionId);
    }

    private void AddChangeLocked(
        SessionState session,
        RunChange change,
        MoonKey? moon = null,
        string? feedMessage = null)
    {
        session.LastActivityUtc = UtcNow;
        change.Revision = ++session.Revision;
        session.Changes.Add(change);
        Trim(session.Changes, Math.Max(1, Settings.Aviscribe.RetainedChangeCount));
        if (feedMessage != null)
        {
            session.RecentEvents.Add(new FeedItem
            {
                Revision = change.Revision,
                OccurredAtUtc = UtcNow,
                Kind = change.Kind == "runEvent"
                    ? change.Event?.Kind.ToString() ?? change.Kind
                    : change.Kind,
                ActorParticipantId = change.ActorParticipantId,
                ActorDisplayName = change.ActorDisplayName,
                Moon = moon == null ? null : Clone(moon),
                Message = feedMessage
            });
            Trim(session.RecentEvents, Math.Max(1, Settings.Aviscribe.RetainedEventFeedCount));
        }
        foreach (var waiter in session.Waiters.ToArray()) waiter.TrySetResult(session.Revision);
    }

    private static void ApplyEventLocked(SessionState session, RunEvent runEvent)
    {
        var moon = runEvent.ToMoonKey();
        var key = FactKey(moon);
        session.MoonFacts.TryGetValue(key, out var fact);
        fact ??= new MoonFact { Moon = Clone(moon) };
        switch (runEvent.Kind)
        {
            case RunEventKind.HintObserved:
                fact.Hinted = true;
                break;
            case RunEventKind.CollectionObserved:
                fact.Collected = true;
                break;
            case RunEventKind.SetPending:
                fact.Hinted = true;
                fact.Collected = false;
                fact.ManualClassification = ManualClassification.Automatic;
                break;
            case RunEventKind.SetCounted:
                fact.Collected = true;
                fact.ManualClassification = ManualClassification.Counted;
                break;
            case RunEventKind.SetUncounted:
                fact.Collected = true;
                fact.ManualClassification = ManualClassification.Uncounted;
                break;
            case RunEventKind.RemoveMoon:
                session.MoonFacts.Remove(key);
                return;
            default:
                throw new AviscribeApiException("invalidRequest", $"Unknown run event kind '{runEvent.Kind}'.");
        }
        session.MoonFacts[key] = fact;
    }

    private static string Describe(RunEvent runEvent, string actor) => runEvent.Kind switch
    {
        RunEventKind.HintObserved => $"{actor} detected a Talkatoo hint.",
        RunEventKind.CollectionObserved => $"{actor} detected a moon collection.",
        RunEventKind.SetPending => $"{actor} moved a moon to Pending.",
        RunEventKind.SetCounted => $"{actor} moved a moon to Counted.",
        RunEventKind.SetUncounted => $"{actor} moved a moon to Wrong.",
        RunEventKind.RemoveMoon => $"{actor} removed a moon.",
        _ => $"{actor} updated a moon."
    };

    private RunSnapshot SnapshotLocked(SessionState session) => new()
    {
        SessionId = session.SessionId,
        Generation = session.Generation,
        Revision = session.Revision,
        Configuration = Clone(session.Configuration),
        OwnerParticipantId = session.OwnerParticipantId,
        MoonFacts = session.MoonFacts.Values.Select(Clone).OrderBy(item => item.Moon.KingdomId).ThenBy(item => item.Moon.MoonId).ToList(),
        Participants = session.Participants.Values.OrderBy(item => item.JoinedSequence).Select(item => View(session, item)).ToList(),
        RecentEvents = session.RecentEvents.Select(Clone).ToList()
    };

    private SessionConnectionResult ConnectionResult(
        SessionState session,
        ParticipantState participant,
        string token,
        string? joinCode) => new()
    {
        SessionId = session.SessionId,
        Generation = session.Generation,
        JoinCode = joinCode,
        ParticipantId = participant.ParticipantId,
        ParticipantToken = token,
        IsOwner = session.OwnerParticipantId == participant.ParticipantId,
        Snapshot = SnapshotLocked(session)
    };

    private static ParticipantView View(SessionState session, ParticipantState participant) => new()
    {
        ParticipantId = participant.ParticipantId,
        DisplayName = participant.DisplayName,
        IsOnline = participant.IsOnline,
        IsOwner = session.OwnerParticipantId == participant.ParticipantId,
        JoinedSequence = participant.JoinedSequence
    };

    private async Task PersistAsync(CancellationToken cancellationToken)
    {
        var path = Settings.Aviscribe.StateFilename;
        await _persistenceGate.WaitAsync(cancellationToken);
        try
        {
            PersistedStore store;
            lock (_sync)
            {
                store = new PersistedStore
                {
                    Sessions = _sessions.Values
                        .Where(item => !item.Ended)
                        .Select(CloneForPersistence)
                        .ToList()
                };
            }
            var directory = Path.GetDirectoryName(Path.GetFullPath(path));
            if (!string.IsNullOrWhiteSpace(directory)) Directory.CreateDirectory(directory);
            var temporary = $"{path}.{Guid.NewGuid():N}.tmp";
            await File.WriteAllTextAsync(
                temporary,
                JsonSerializer.Serialize(store, AviscribeProtocol.JsonOptions),
                cancellationToken);
            File.Move(temporary, path, true);
        }
        finally
        {
            _persistenceGate.Release();
        }
    }

    private static SessionState CloneForPersistence(SessionState source) => new()
    {
        SessionId = source.SessionId,
        Generation = source.Generation,
        Revision = source.Revision,
        CatalogHash = source.CatalogHash,
        JoinCode = source.JoinCode,
        JoinCodeHash = source.JoinCodeHash,
        Configuration = Clone(source.Configuration),
        CreatedAtUtc = source.CreatedAtUtc,
        LastActivityUtc = source.LastActivityUtc,
        OwnerParticipantId = source.OwnerParticipantId,
        NextJoinSequence = source.NextJoinSequence,
        MoonFacts = source.MoonFacts.ToDictionary(item => item.Key, item => Clone(item.Value)),
        Participants = source.Participants.ToDictionary(item => item.Key, item => Clone(item.Value)),
        ProcessedEvents = new Dictionary<Guid, long>(source.ProcessedEvents),
        Changes = source.Changes.Select(Clone).ToList(),
        RecentEvents = source.RecentEvents.Select(Clone).ToList()
    };

    private static RunConfiguration Clone(RunConfiguration source) => new()
    {
        Category = source.Category,
        IncludePostGame = source.IncludePostGame
    };

    private static MoonKey Clone(MoonKey source) => new()
    {
        KingdomId = source.KingdomId,
        MoonId = source.MoonId
    };
    private static MoonFact Clone(MoonFact source) => new()
    {
        Moon = Clone(source.Moon),
        Hinted = source.Hinted,
        Collected = source.Collected,
        ManualClassification = source.ManualClassification
    };
    private static ParticipantState Clone(ParticipantState source) => new()
    {
        ParticipantId = source.ParticipantId,
        DisplayName = source.DisplayName,
        TokenHash = source.TokenHash,
        JoinedSequence = source.JoinedSequence,
        JoinedAtUtc = source.JoinedAtUtc,
        LastSeenUtc = source.LastSeenUtc,
        IsOnline = source.IsOnline
    };
    private static FeedItem Clone(FeedItem source) => new()
    {
        Revision = source.Revision,
        OccurredAtUtc = source.OccurredAtUtc,
        Kind = source.Kind,
        ActorParticipantId = source.ActorParticipantId,
        ActorDisplayName = source.ActorDisplayName,
        Moon = source.Moon == null ? null : Clone(source.Moon),
        Message = source.Message
    };
    private static RunEvent Clone(RunEvent source) => new()
    {
        EventId = source.EventId,
        Kind = source.Kind,
        KingdomId = source.KingdomId,
        MoonId = source.MoonId
    };
    private static RunChange Clone(RunChange source) => new()
    {
        Revision = source.Revision,
        Kind = source.Kind,
        ActorParticipantId = source.ActorParticipantId,
        ActorDisplayName = source.ActorDisplayName,
        Event = source.Event == null ? null : Clone(source.Event),
        OwnerParticipantId = source.OwnerParticipantId,
        Participant = source.Participant == null ? null : new ParticipantView
        {
            ParticipantId = source.Participant.ParticipantId,
            DisplayName = source.Participant.DisplayName,
            IsOnline = source.Participant.IsOnline,
            IsOwner = source.Participant.IsOwner,
            JoinedSequence = source.Participant.JoinedSequence
        },
        Generation = source.Generation,
        Configuration = source.Configuration == null ? null : Clone(source.Configuration)
    };

    private static void ValidateDisplayName(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Trim().Length > 32)
            throw new AviscribeApiException("invalidRequest", "Display name must contain 1 to 32 characters.");
    }

    private static void ValidateCatalogHash(string value)
    {
        if (value.Length != 64 || !value.All(Uri.IsHexDigit))
            throw new AviscribeApiException("invalidRequest", "Catalog hash must be a SHA-256 hex value.");
    }

    private static void ValidateConfiguration(RunConfiguration configuration)
    {
        if (configuration.Category is not ("standard" or "hardcore"))
            throw new AviscribeApiException("invalidRequest", "Category must be standard or hardcore.");
    }

    private static void ValidateEvent(RunEvent runEvent)
    {
        if (runEvent.EventId == Guid.Empty)
            throw new AviscribeApiException("invalidRequest", "Event ID is required.");
        if (runEvent.KingdomId is < 0 or > 255 || runEvent.MoonId is < 1 or > 999)
            throw new AviscribeApiException("invalidRequest", "Moon key is invalid.");
        if (!Enum.IsDefined(runEvent.Kind))
            throw new AviscribeApiException("invalidRequest", $"Unknown run event kind '{runEvent.Kind}'.");
    }

    private static void EnsureGeneration(SessionState session, int generation)
    {
        if (session.Generation != generation)
            throw new AviscribeApiException("generationMismatch", "The run was reset; refresh its snapshot.");
    }

    private static void EnsureOwner(SessionState session, ParticipantState participant)
    {
        if (session.OwnerParticipantId != participant.ParticipantId)
            throw new AviscribeApiException("notOwner", "Only the current run owner may perform this action.");
    }

    private static string FactKey(MoonKey moon) => $"{moon.KingdomId}\0{moon.MoonId}";
    private SessionState? ActiveRoomLocked() =>
        _sessions.Values.FirstOrDefault(item => !item.Ended);
    private static string FormatDuration(TimeSpan value) =>
        value.TotalHours >= 1 ? $"{value.TotalHours:0.0}h" :
        value.TotalMinutes >= 1 ? $"{value.TotalMinutes:0.0}m" : $"{Math.Max(0, value.TotalSeconds):0}s";
    private static string NormalizeJoinCode(string value) => value.Trim().Replace("-", string.Empty).ToUpperInvariant();
    private static string FormatJoinCode(string normalized) =>
        normalized.Length == 8 ? $"{normalized[..4]}-{normalized[4..]}" : normalized;
    private static string GenerateToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    private static string GenerateJoinCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(8);
        var chars = bytes.Select(value => JoinAlphabet[value % JoinAlphabet.Length]).ToArray();
        return $"{new string(chars, 0, 4)}-{new string(chars, 4, 4)}";
    }
    private static string HashSecret(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private static bool FixedEquals(string left, string right) => CryptographicOperations.FixedTimeEquals(
        Encoding.ASCII.GetBytes(left), Encoding.ASCII.GetBytes(right));

    private bool AllowRateLocked(string key, int limit, TimeSpan window, DateTimeOffset now)
    {
        if (!_rateLimits.TryGetValue(key, out var timestamps)) _rateLimits[key] = timestamps = new Queue<DateTimeOffset>();
        while (timestamps.Count > 0 && now - timestamps.Peek() >= window) timestamps.Dequeue();
        if (timestamps.Count >= limit) return false;
        timestamps.Enqueue(now);
        return true;
    }

    private static void Trim<T>(List<T> items, int maximum)
    {
        if (items.Count > maximum) items.RemoveRange(0, items.Count - maximum);
    }

    private static string NormalizeStoredHash(string value) => value.Trim().ToUpperInvariant();
    private static void ThrowIfDisabled()
    {
        if (!Settings.Aviscribe.Enabled)
            throw new AviscribeApiException("featureDisabled", "Aviscribe multiplayer is disabled on this server.");
    }

    public sealed class PersistedStore
    {
        public List<SessionState> Sessions { get; set; } = [];
    }

    public sealed class SessionState
    {
        public Guid SessionId { get; set; }
        public int Generation { get; set; }
        public long Revision { get; set; }
        public string CatalogHash { get; set; } = string.Empty;
        public string? JoinCode { get; set; }
        public string JoinCodeHash { get; set; } = string.Empty;
        public RunConfiguration Configuration { get; set; } = new();
        public DateTimeOffset CreatedAtUtc { get; set; }
        public DateTimeOffset LastActivityUtc { get; set; }
        public DateTimeOffset RestoreGraceUntilUtc { get; set; }
        public DateTimeOffset? EndedAtUtc { get; set; }
        public bool Ended { get; set; }
        public Guid? OwnerParticipantId { get; set; }
        public long NextJoinSequence { get; set; } = 1;
        public Dictionary<string, MoonFact> MoonFacts { get; set; } = [];
        public Dictionary<Guid, ParticipantState> Participants { get; set; } = [];
        public Dictionary<Guid, long> ProcessedEvents { get; set; } = [];
        public List<RunChange> Changes { get; set; } = [];
        public List<FeedItem> RecentEvents { get; set; } = [];
        [JsonIgnore]
        public List<TaskCompletionSource<long>> Waiters { get; set; } = [];
    }

    public sealed class ParticipantState
    {
        public Guid ParticipantId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string TokenHash { get; set; } = string.Empty;
        public long JoinedSequence { get; set; }
        public DateTimeOffset JoinedAtUtc { get; set; }
        public DateTimeOffset LastSeenUtc { get; set; }
        public bool IsOnline { get; set; }
    }
}
