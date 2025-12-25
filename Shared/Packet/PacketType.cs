namespace Shared.Packet;

public enum PacketType : short
{
    Unknown, // = 0
    ClientInit, // = 1
    PlayerInf, // = 2
    CapInf, // = 3
    GameInf,   // = 4
    TagInf, // = 5
    PlayerConnect, // = 6
    PlayerDisconnect, // = 7
    CostumeInf, // = 8
    ShineColl, // = 9
    CaptureInf, // = 10
    ChangeStage, // = 11
    Command, // = 12
    SendMessage, // = 13
    UDPInit, // = 14
    HolePunch, //15
    Extra, // = 16
    Health_Coins, // = 17
    // Not in client
    Mods, // = 18 
    // Not in client
    ChangeCostume, // = 19

}

/* this has to be the exact same Id as in the mod

*/