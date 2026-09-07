using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.AviscribeApi;

public static class AviscribeProtocol
{
    public const int Version = 1;
    public const int PrefixSize = 20;
    public const int MaximumRequestSize = 64 * 1024;
    public const int MaximumResponseSize = 4 * 1024 * 1024;
    public static readonly byte[] Magic =
    [
        (byte)'A', (byte)'V', (byte)'I', (byte)'S', (byte)'C',
        (byte)'R', (byte)'I', (byte)'B', (byte)'E', (byte)'_',
        (byte)'A', (byte)'P', (byte)'I', (byte)'_', (byte)'V',
        (byte)'1', 0, 0, 0, 0
    ];

    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}

public sealed class AviscribeRequest
{
    public int Version { get; set; }
    public Guid RequestId { get; set; }
    public string Operation { get; set; } = string.Empty;
    public Guid? SessionId { get; set; }
    public Guid? ParticipantId { get; set; }
    public string? ParticipantToken { get; set; }
    public JsonElement Data { get; set; }
}

public sealed class AviscribeResponse
{
    public int Version { get; init; } = AviscribeProtocol.Version;
    public Guid RequestId { get; init; }
    public bool Ok { get; init; }
    public object? Data { get; init; }
    public AviscribeError? Error { get; init; }

    public static AviscribeResponse Success(Guid requestId, object? data) => new()
    {
        RequestId = requestId,
        Ok = true,
        Data = data
    };

    public static AviscribeResponse Failure(Guid requestId, string code, string message) => new()
    {
        RequestId = requestId,
        Ok = false,
        Error = new AviscribeError(code, message)
    };
}

public sealed record AviscribeError(string Code, string Message);

public sealed class CreateRunRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string CatalogHash { get; set; } = string.Empty;
    public RunConfiguration Configuration { get; set; } = new();
}

public sealed class JoinRunRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public string CatalogHash { get; set; } = string.Empty;
}

public sealed class ResumeRunRequest
{
    public string? JoinCode { get; set; }
}

public sealed class PublishEventsRequest
{
    public int Generation { get; set; }
    public long BaseRevision { get; set; }
    public List<RunEvent> Events { get; set; } = [];
}

public sealed class WaitForChangesRequest
{
    public int Generation { get; set; }
    public long AfterRevision { get; set; }
}

public sealed class ResetRunRequest
{
    public RunConfiguration Configuration { get; set; } = new();
}

public sealed class UpdateConfigurationRequest
{
    public RunConfiguration Configuration { get; set; } = new();
}

public sealed class RunConfiguration
{
    public string Category { get; set; } = "standard";
    public bool IncludePostGame { get; set; }
}

public sealed class RunEvent
{
    [JsonPropertyName("id")]
    public Guid EventId { get; set; }

    [JsonPropertyName("t")]
    public RunEventKind Kind { get; set; }

    [JsonPropertyName("k")]
    public int KingdomId { get; set; }

    [JsonPropertyName("m")]
    public int MoonId { get; set; }

    public MoonKey ToMoonKey() => new() { KingdomId = KingdomId, MoonId = MoonId };
}

public sealed class MoonKey
{
    [JsonPropertyName("k")]
    public int KingdomId { get; set; }

    [JsonPropertyName("m")]
    public int MoonId { get; set; }
}

public enum RunEventKind
{
    HintObserved = 0,
    CollectionObserved = 1,
    SetPending = 2,
    SetCounted = 3,
    SetUncounted = 4,
    RemoveMoon = 5
}

public enum ManualClassification
{
    Automatic,
    Counted,
    Uncounted
}

public sealed class MoonFact
{
    [JsonPropertyName("moon")]
    public MoonKey Moon { get; set; } = new();

    [JsonPropertyName("h")]
    public bool Hinted { get; set; }

    [JsonPropertyName("c")]
    public bool Collected { get; set; }

    [JsonPropertyName("x")]
    public ManualClassification ManualClassification { get; set; }
}

public sealed class ParticipantView
{
    public Guid ParticipantId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public bool IsOwner { get; set; }
    public long JoinedSequence { get; set; }
}

public sealed class FeedItem
{
    public long Revision { get; set; }
    public DateTimeOffset OccurredAtUtc { get; set; }
    public string Kind { get; set; } = string.Empty;
    public Guid? ActorParticipantId { get; set; }
    public string ActorDisplayName { get; set; } = string.Empty;
    public MoonKey? Moon { get; set; }
    public string Message { get; set; } = string.Empty;
}

public sealed class RunChange
{
    public long Revision { get; set; }
    public string Kind { get; set; } = string.Empty;
    public Guid? ActorParticipantId { get; set; }
    public string ActorDisplayName { get; set; } = string.Empty;
    public RunEvent? Event { get; set; }
    public Guid? OwnerParticipantId { get; set; }
    public ParticipantView? Participant { get; set; }
    public int? Generation { get; set; }
    public RunConfiguration? Configuration { get; set; }
}

public sealed class RunSnapshot
{
    public Guid SessionId { get; set; }
    public int Generation { get; set; }
    public long Revision { get; set; }
    public RunConfiguration Configuration { get; set; } = new();
    public Guid? OwnerParticipantId { get; set; }
    public List<MoonFact> MoonFacts { get; set; } = [];
    public List<ParticipantView> Participants { get; set; } = [];
    public List<FeedItem> RecentEvents { get; set; } = [];
}

public sealed class SessionConnectionResult
{
    public Guid SessionId { get; set; }
    public int Generation { get; set; }
    public string? JoinCode { get; set; }
    public Guid ParticipantId { get; set; }
    public string ParticipantToken { get; set; } = string.Empty;
    public bool IsOwner { get; set; }
    public RunSnapshot Snapshot { get; set; } = new();
}

public sealed class PublishResult
{
    public int Generation { get; set; }
    public long Revision { get; set; }
    public List<EventReceipt> Events { get; set; } = [];
}

public sealed class EventReceipt
{
    [JsonPropertyName("id")]
    public Guid EventId { get; set; }

    [JsonPropertyName("r")]
    public long Revision { get; set; }

    [JsonPropertyName("d")]
    public bool WasDuplicate { get; set; }
}

public sealed class WaitResult
{
    public string Kind { get; set; } = "heartbeat";
    public int Generation { get; set; }
    public long Revision { get; set; }
    public List<RunChange>? Changes { get; set; }
    public RunSnapshot? Snapshot { get; set; }
}

public sealed class AviscribeApiException : Exception
{
    public AviscribeApiException(string code, string message) : base(message)
    {
        Code = code;
    }

    public string Code { get; }
}
