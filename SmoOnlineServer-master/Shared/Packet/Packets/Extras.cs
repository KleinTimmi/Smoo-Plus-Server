using System.Runtime.InteropServices;
using System.Text;
using Shared.Packet.Packets;

namespace Shared.Packet.Packets;

[Packet(PacketType.Extra)]

public struct Extras : IPacket
{
    public bool InfiniteCapBounce;
    public bool Noclip;

    public short Size => 2;

    public void Serialize(Span<byte> data)
    {
        MemoryMarshal.Write(data, ref InfiniteCapBounce);
        MemoryMarshal.Write(data.Slice(1), ref Noclip);
    }

    public void Deserialize(ReadOnlySpan<byte> data)
    {
        InfiniteCapBounce = MemoryMarshal.Read<bool>(data);
        Noclip = MemoryMarshal.Read<bool>(data.Slice(1));
    }
}