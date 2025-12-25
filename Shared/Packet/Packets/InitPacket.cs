using System.Runtime.InteropServices;
using System.Text;

namespace Shared.Packet.Packets;

[Packet(PacketType.ClientInit)]
public struct InitPacket : IPacket
{
    // Payload size: ushort + fixed char buffer
    public short Size => sizeof(ushort) + Constants.VersionSize;

    public ushort MaxPlayers;
    public string Version;

    public InitPacket()
    {
        MaxPlayers = 0;
        Version = string.Empty;
    }

    /*
     * Binary layout:
     * 0x00 ushort MaxPlayers              (2 bytes)
     * 0x02 char[] Version                 (Constants.VersionSize bytes)
     */
    public void Serialize(Span<byte> data)
    {
        // Write MaxPlayers
        MemoryMarshal.Write(data, ref MaxPlayers);

        // Write Version as fixed-size UTF-8 buffer
        var versionBytes = Encoding.UTF8.GetBytes(Version);

        versionBytes
            .AsSpan(0, Math.Min(versionBytes.Length, Constants.VersionSize))
            .CopyTo(data.Slice(sizeof(ushort), Constants.VersionSize));
    }

    public void Deserialize(ReadOnlySpan<byte> data)
    {
        // Read MaxPlayers
        MaxPlayers = MemoryMarshal.Read<ushort>(data);

        // Read Version string
        Version = Encoding.UTF8
            .GetString(data.Slice(sizeof(ushort), Constants.VersionSize))
            .TrimNullTerm();
    }
}
