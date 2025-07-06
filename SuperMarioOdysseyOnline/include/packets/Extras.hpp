#pragma once
#include "Packet.h"

#pragma pack(push, 1)
struct ExtrasPacket : Packet {
    u8 InfiniteCapBounce = 0;

    ExtrasPacket() {
        mType = PacketType::EXTRA;
        mPacketSize = sizeof(ExtrasPacket) - sizeof(Packet);  // = 1
    }
};
#pragma pack(pop)
