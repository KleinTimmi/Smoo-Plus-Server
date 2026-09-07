using System.Buffers.Binary;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using Shared;

namespace Server.AviscribeApi;

public sealed class AviscribeApiHost
{
    private readonly AviscribeSessionManager _sessions = new();
    private readonly Logger _logger = new("AviscribeApi");

    public AviscribeApiHost()
    {
        CommandHandler.RegisterCommand("aviscribe", HandleOperatorCommand);
    }

    public static bool MatchesPrefix(ReadOnlySpan<byte> prefix) =>
        prefix.Length == AviscribeProtocol.PrefixSize && prefix.SequenceEqual(AviscribeProtocol.Magic);

    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        await _sessions.EnsureLoadedAsync(cancellationToken);
    }

    public async Task RunMaintenanceAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                await _sessions.SweepAsync(cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception ex)
            {
                _logger.Error($"Aviscribe maintenance failed: {ex}");
            }
        }
    }

    public async Task HandleAsync(Socket socket, CancellationToken serverCancellationToken)
    {
        AviscribeRequest? request = null;
        AviscribeResponse response;
        try
        {
            using var readTimeout = CancellationTokenSource.CreateLinkedTokenSource(serverCancellationToken);
            readTimeout.CancelAfter(TimeSpan.FromSeconds(5));
            var lengthBytes = new byte[sizeof(int)];
            await ReadExactAsync(socket, lengthBytes, readTimeout.Token);
            var length = BinaryPrimitives.ReadInt32BigEndian(lengthBytes);
            if (length is <= 0 or > AviscribeProtocol.MaximumRequestSize)
                throw new AviscribeApiException("invalidRequest", "Request size is invalid.");

            var payload = new byte[length];
            await ReadExactAsync(socket, payload, readTimeout.Token);
            request = JsonSerializer.Deserialize<AviscribeRequest>(payload, AviscribeProtocol.JsonOptions);
            if (request == null || request.RequestId == Guid.Empty || string.IsNullOrWhiteSpace(request.Operation))
                throw new AviscribeApiException("invalidRequest", "Request envelope is incomplete.");
            if (request.Version != AviscribeProtocol.Version)
                throw new AviscribeApiException("unsupportedVersion", "Only Aviscribe protocol version 1 is supported.");

            var remoteAddress = (socket.RemoteEndPoint as IPEndPoint)?.Address ?? IPAddress.None;
            var data = await DispatchAsync(request, remoteAddress, serverCancellationToken);
            response = AviscribeResponse.Success(request.RequestId, data);
        }
        catch (AviscribeApiException ex)
        {
            response = AviscribeResponse.Failure(request?.RequestId ?? Guid.Empty, ex.Code, ex.Message);
        }
        catch (JsonException)
        {
            response = AviscribeResponse.Failure(request?.RequestId ?? Guid.Empty, "invalidRequest", "Request JSON is invalid.");
        }
        catch (OperationCanceledException) when (serverCancellationToken.IsCancellationRequested)
        {
            return;
        }
        catch (OperationCanceledException)
        {
            response = AviscribeResponse.Failure(request?.RequestId ?? Guid.Empty, "invalidRequest", "The request timed out.");
        }
        catch (Exception ex)
        {
            _logger.Error($"Aviscribe request failed: {ex}");
            response = AviscribeResponse.Failure(request?.RequestId ?? Guid.Empty, "invalidRequest", "The server could not process the request.");
        }

        try
        {
            var payload = JsonSerializer.SerializeToUtf8Bytes(response, AviscribeProtocol.JsonOptions);
            if (payload.Length > AviscribeProtocol.MaximumResponseSize)
            {
                payload = JsonSerializer.SerializeToUtf8Bytes(
                    AviscribeResponse.Failure(response.RequestId, "capacityReached", "The response exceeded the protocol limit."),
                    AviscribeProtocol.JsonOptions);
            }
            var frame = new byte[sizeof(int) + payload.Length];
            BinaryPrimitives.WriteInt32BigEndian(frame, payload.Length);
            payload.CopyTo(frame.AsSpan(sizeof(int)));
            await SendExactAsync(socket, frame, serverCancellationToken);
        }
        catch (OperationCanceledException) when (serverCancellationToken.IsCancellationRequested)
        {
            // The server is shutting down; abandoning an in-flight response is expected.
        }
        catch (Exception ex)
        {
            _logger.Info($"Could not return an Aviscribe response: {ex.Message}");
        }
    }

    private async Task<object?> DispatchAsync(
        AviscribeRequest request,
        IPAddress remoteAddress,
        CancellationToken cancellationToken)
    {
        if (request.Operation == "capabilities") return _sessions.GetCapabilities();
        if (!Settings.Aviscribe.Enabled)
            throw new AviscribeApiException("featureDisabled", "Aviscribe multiplayer is disabled on this server.");

        return request.Operation switch
        {
            "createRun" => await _sessions.CreateRunAsync(
                Deserialize<CreateRunRequest>(request), remoteAddress, cancellationToken),
            "joinRun" => await _sessions.JoinRunAsync(
                Deserialize<JoinRunRequest>(request), remoteAddress, cancellationToken),
            "resumeRun" => await _sessions.ResumeRunAsync(request, cancellationToken),
            "publishEvents" => await _sessions.PublishAsync(
                request, Deserialize<PublishEventsRequest>(request), cancellationToken),
            "waitForChanges" => await _sessions.WaitForChangesAsync(
                request, Deserialize<WaitForChangesRequest>(request), cancellationToken),
            "leaveRun" => await _sessions.LeaveRunAsync(request, cancellationToken),
            "resetRun" => await _sessions.ResetRunAsync(
                request, Deserialize<ResetRunRequest>(request), cancellationToken),
            "updateConfiguration" => await _sessions.UpdateConfigurationAsync(
                request, Deserialize<UpdateConfigurationRequest>(request), cancellationToken),
            "endRun" => await _sessions.EndRunAsync(request, cancellationToken),
            _ => throw new AviscribeApiException("invalidRequest", $"Unknown operation '{request.Operation}'.")
        };
    }

    private static T Deserialize<T>(AviscribeRequest request)
    {
        if (request.Data.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            throw new AviscribeApiException("invalidRequest", "Operation data is required.");
        return request.Data.Deserialize<T>(AviscribeProtocol.JsonOptions) ??
               throw new AviscribeApiException("invalidRequest", "Operation data is invalid.");
    }

    private static async Task ReadExactAsync(
        Socket socket,
        Memory<byte> buffer,
        CancellationToken cancellationToken)
    {
        var offset = 0;
        while (offset < buffer.Length)
        {
            var read = await socket.ReceiveAsync(buffer[offset..], SocketFlags.None, cancellationToken);
            if (read == 0) throw new AviscribeApiException("invalidRequest", "The connection closed before the request was complete.");
            offset += read;
        }
    }

    private static async Task SendExactAsync(
        Socket socket,
        ReadOnlyMemory<byte> buffer,
        CancellationToken cancellationToken)
    {
        var offset = 0;
        while (offset < buffer.Length)
        {
            var sent = await socket.SendAsync(buffer[offset..], SocketFlags.None, cancellationToken);
            if (sent == 0) throw new SocketException((int)SocketError.ConnectionReset);
            offset += sent;
        }
    }

    private CommandHandler.Response HandleOperatorCommand(string[] args)
    {
        if (args.Length == 1 && args[0].Equals("inspect", StringComparison.OrdinalIgnoreCase))
            return _sessions.GetOperatorDetails();
        if (args.Length == 1 && args[0].Equals("state", StringComparison.OrdinalIgnoreCase))
            return _sessions.GetOperatorGameState();
        if (args.Length == 1 && args[0].Equals("end", StringComparison.OrdinalIgnoreCase))
            return _sessions.EndByOperatorAsync(CancellationToken.None).GetAwaiter().GetResult()
                ? "Closed the active Aviscribe room."
                : "No active Aviscribe multiplayer room.";
        return "Valid options: inspect, state, end";
    }
}
