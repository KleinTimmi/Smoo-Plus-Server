namespace Shared.Packet;

public enum PacketType : short {
    Unknown, // = 0
    Init, // = 1
    Player, // = 2
    Cap, // = 3
    Game,   // = 4
    Tag, // = 5
    Connect, // = 6
    Disconnect, // = 7
    Costume, // = 8
    Shine, // = 9
    Capture, // = 10
    ChangeStage, // = 11
    Command, // = 12
    Extra, // = 13
}