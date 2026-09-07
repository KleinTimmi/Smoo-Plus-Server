using System.Buffers;
using System.Collections.Concurrent;
using System.Net.Sockets;
using Sever.Server;
using Shared;
using Shared.Packet;
using Shared.Packet.Packets;

namespace Server;

public class Client : IDisposable
{
    public readonly ConcurrentDictionary<string, object?> Metadata = new (); // can be used to store any information about a player
    public bool Connected;
    public bool Ignored = false;
    public bool Banned = false;
    public CostumePacket? CurrentCostume; // required for proper client sync
    public string Name
    {
        get => Logger.Name;
        set => Logger.Name = value;
    }

    public Guid Id;
    public readonly Socket? Socket;
    public Server Server { get; init; } = null!; // init'd in object initializer
    public Logger Logger { get; }

    public Client(Socket socket)
    {
        Socket = socket;
        Logger = new Logger("Unknown User");
    }

    // copy Client to use existing data for a new reconnected connection with a new socket
    public Client(Client other, Socket socket)
    {
        Metadata = other.Metadata;
        Connected = other.Connected;
        CurrentCostume = other.CurrentCostume;
        Id = other.Id;
        Socket = socket;
        Server = other.Server;
        Logger = other.Logger;
    }

    public void Dispose()
    {
        if (Socket?.Connected is true)
        {
            Socket.Disconnect(false);
        }
    }


    public async Task Send<T>(T packet, Client? sender = null) where T : struct, IPacket
    {
        IMemoryOwner<byte> memory = MemoryPool<byte>.Shared.RentZero(Constants.HeaderSize + packet.Size);

        PacketAttribute packetAttribute = Constants.PacketMap[typeof(T)];
        try
        {
            // don't send most packets to ignored players
            if (Ignored && packetAttribute.Type != PacketType.ClientInit && packetAttribute.Type != PacketType.ChangeStage)
            {
                memory.Dispose();
                return;
            }
            Server.FillPacket(new PacketHeader
            {
                Id = sender?.Id ?? Guid.Empty,
                Type = packetAttribute.Type,
                PacketSize = packet.Size
            }, packet, memory.Memory);
        }
        catch (Exception e)
        {
            Logger.Error($"Failed to serialize {packetAttribute.Type}");
            Logger.Error(e);
        }

        await Socket!.SendAsync(memory.Memory[..(Constants.HeaderSize + packet.Size)], SocketFlags.None);
        memory.Dispose();
    }

    public async Task Send(Memory<byte> data, Client? sender)
    {
        PacketHeader header = new PacketHeader();
        header.Deserialize(data.Span);

        if (!Connected && !Ignored && header.Type != PacketType.PlayerConnect)
        {
            Server.Logger.Error($"Didn't send {header.Type} to {Id} because they weren't connected yet");
            return;
        }

        // don't send most packets to ignored players
        if (Ignored && header.Type != PacketType.ClientInit && header.Type != PacketType.ChangeStage)
        {
            return;
        }

        await Socket!.SendAsync(data[..(Constants.HeaderSize + header.PacketSize)], SocketFlags.None);
    }

    public void CleanMetadataOnNewConnection()
    {
        Metadata.TryRemove("gameMode", out _);
        Metadata.TryRemove("time", out _);
        Metadata.TryRemove("seeking", out _);
        Metadata.TryRemove("lastCostumePacket", out _);
        Metadata.TryRemove("lastCapturePacket", out _);
        Metadata.TryRemove("lastGamePacket", out _);
        Metadata.TryRemove("lastPlayerPacket", out _);
    }

    public TagPacket? GetTagPacket()
    {
        if (!Metadata.TryGetValue("gameMode", out var gmodeObj)) { return null; }
        var gmode = (GameMode?)gmodeObj;
        if (gmode == null) { return null; }
        if (gmode != GameMode.Legacy
            && gmode != GameMode.HideAndSeek
            && gmode != GameMode.Sardines
            && gmode != GameMode.FreezeTag
        ) { return null; }

        Metadata.TryGetValue("time", out var timeObj);
        Metadata.TryGetValue("seeking", out var seekObj);
        var time = (Time?)timeObj;
        var seek = (bool?)seekObj;
        if (time == null && seek == null) { return null; }

        return new TagPacket
        {
            GameMode = (GameMode)gmode,
            UpdateType = (seek != null ? TagPacket.TagUpdate.State : 0) | (time != null ? TagPacket.TagUpdate.Time : 0),
            IsIt = seek ?? false,
            Seconds = time?.Seconds ?? 0,
            Minutes = time?.Minutes ?? 0,
        };
    }

    public static bool operator ==(Client? left, Client? right)
    {
        if (ReferenceEquals(left, right))
        {
            return true;
        }

        if (left is null || right is null)
        {
            return false;
        }

        return left.Id == right.Id;
    }

    public static bool operator !=(Client? left, Client? right)
    {
        return !(left == right);
    }

    public override bool Equals(object? obj)
    {
        return obj is Client client && this == client;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode(); // Relies upon the same value as the equality operator.
    }
}
