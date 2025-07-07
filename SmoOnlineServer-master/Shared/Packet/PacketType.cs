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
    dummy,  // 13 This is a dummy packet type, used for testing or placeholder purposes
    dummy2, // 14 This is a dummy packet type, used for testing or placeholder purposes
    Extra, // = 15
    Noclip, // = 16 
}

/* this has to be the exact same Id as in the mod

*/