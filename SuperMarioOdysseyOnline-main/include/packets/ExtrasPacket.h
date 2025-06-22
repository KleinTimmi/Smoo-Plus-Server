#pragma once

#include "Packet.h"

struct PACKED ExtrasPacket : Packet {
    ExtrasPacket() : Packet() {
        this->mType = PacketType::EXTRA;
        mPacketSize = sizeof(ExtrasPacket) - sizeof(Packet);
    }
    bool InfiniteCapBounce = false;
};