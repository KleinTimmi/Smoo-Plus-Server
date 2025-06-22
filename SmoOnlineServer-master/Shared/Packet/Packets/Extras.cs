using System.Runtime.InteropServices;
using System.Text;
using Shared.Packet.Packets;

namespace Shared.Packet.Packets;

[Packet(PacketType.Extra)]

public struct Extras : IPacket
{
    public bool InfiniteCapBounce;

    public Extras (bool infiniteCapBounce)
    {
        InfiniteCapBounce = infiniteCapBounce;
    }

    public short Size => 1;

    public void Serialize(Span<byte> data)
    {
        MemoryMarshal.Write(data, ref InfiniteCapBounce);
    }

    public void Deserialize(ReadOnlySpan<byte> data)
    {
        InfiniteCapBounce = MemoryMarshal.Read<bool>(data);
    }
}