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
    SendMessage, // = 13
    UDPInit, // = 14
    HolePunch, //15
    Extra, // = 16
    Health_Coins, // = 17
    Mods, // = 18
    ChangeCostume, // = 19
    
}

/* this has to be the exact same Id as in the mod

*/