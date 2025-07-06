#pragma once

#include "Packet.h"

#pragma pack(push, 1)  // Verhindert Padding komplett

struct ExtrasPacket : Packet {
    u8 InfiniteCapBounce = 0;  // 1 = true, 0 = false

    ExtrasPacket() {
        this->mType = PacketType::EXTRA;
        mPacketSize = sizeof(ExtrasPacket) - sizeof(Packet);
    }
};

#pragma pack(pop)
