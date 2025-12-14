using System.Runtime.InteropServices;
using System.Text;

namespace Shared.Packet.Packets;

[Packet(PacketType.SendMessage)]
public struct SendMessagePacket : IPacket
{
    // Unique identifier of the sender (e.g. PlayerId / ClientId)
    public uint SenderId;

    // Defines how the message should be interpreted by the receiver
    public MessageTypes MessageType;

    // Message content (fixed-size UTF-8 string)
    public string Message;

    public SendMessagePacket()
    {
        SenderId = 0;                        // default numeric value
        MessageType = MessageTypes.Chat;      // default enum value
        Message = string.Empty;               // default string value
    }


    /*
     * Binary layout:
     * 0x00 uint   SenderId        (4 bytes)
     * 0x04 int    MessageType     (4 bytes)
     * 0x08 char[] Message         (Constants.MessageSize bytes)
     */
    public short Size => 8 + Constants.MessageSize;

    public void Serialize(Span<byte> data)
    {
        // Write sender identifier
        MemoryMarshal.Write(data, ref SenderId);

        // Write message type enum
        MemoryMarshal.Write(data[4..], ref MessageType);

        // Encode message as UTF-8 and copy it into the fixed buffer
        var messageBytes = Encoding.UTF8.GetBytes(Message);

        messageBytes
            .AsSpan(0, Math.Min(messageBytes.Length, Constants.MessageSize))
            .CopyTo(data[8..(8 + Constants.MessageSize)]);
    }

    public void Deserialize(ReadOnlySpan<byte> data)
    {
        // Read sender identifier
        SenderId = MemoryMarshal.Read<uint>(data);

        // Read message type enum
        MessageType = MemoryMarshal.Read<MessageTypes>(data[4..]);

        // Decode UTF-8 message and remove null terminators
        Message = Encoding.UTF8
            .GetString(data[8..(8 + Constants.MessageSize)])
            .TrimNullTerm();
    }

    // Defines supported message categories
    public enum MessageTypes
    {
        Chat,
        System,
        Private
    }
}
