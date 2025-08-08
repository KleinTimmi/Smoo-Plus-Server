using System;
using System.Text;

namespace Shared.Packet.Packets;

[Packet(PacketType.ChangeCostume)]
public struct ChangeCostumePacket : IPacket
{
    // Compatible with C++ CostumeInf (receive from mod) and CostumeSend (send to mod)
    public string BodyName;  // Maps to bodyModel (CostumeInf) or BodyName (CostumeSend)
    public string CapName;   // Maps to capModel (CostumeInf) or CapName (CostumeSend)

    public short Size => (short)(Constants.CostumeNameSize * 2);

    public void Serialize(Span<byte> data)
    {
        // Fill buffer with zeros for C++ compatibility
        data.Clear();

        // BodyName
        var bodyBytes = Encoding.ASCII.GetBytes(BodyName ?? "");
        int bodyLen = Math.Min(bodyBytes.Length, Constants.CostumeNameSize - 1);
        bodyBytes.AsSpan(0, bodyLen).CopyTo(data.Slice(0, bodyLen));
        // Nullterminator ist durch data.Clear() schon gesetzt

        // CapName
        var capBytes = Encoding.ASCII.GetBytes(CapName ?? "");
        int capLen = Math.Min(capBytes.Length, Constants.CostumeNameSize - 1);
        capBytes.AsSpan(0, capLen).CopyTo(data.Slice(Constants.CostumeNameSize, capLen));
        // Nullterminator ist durch data.Clear() schon gesetzt
    }

    public void Deserialize(ReadOnlySpan<byte> data)
    {
        BodyName = Encoding.ASCII.GetString(data.Slice(0, Constants.CostumeNameSize)).TrimEnd('\0');
        CapName  = Encoding.ASCII.GetString(data.Slice(Constants.CostumeNameSize, Constants.CostumeNameSize)).TrimEnd('\0');
    }
}