using System.Runtime.InteropServices;

namespace Shared.Packet.Packets;

[Packet(PacketType.Health_Coins)]
public struct Health_CoinsPacket : IPacket {
    public int Health;
    public int Coins;

    public short Size => 5;
    public short HealthSize => 1;
    public short CoinsSize => 4;

    public void Serialize(Span<byte> data) {
        MemoryMarshal.Write(data, ref Health);
        MemoryMarshal.Write(data, ref Coins);
    }

    public void Deserialize(ReadOnlySpan<byte> data) {
        Health = MemoryMarshal.Read<int>(data);
        Coins = MemoryMarshal.Read<int>(data);
    }
}