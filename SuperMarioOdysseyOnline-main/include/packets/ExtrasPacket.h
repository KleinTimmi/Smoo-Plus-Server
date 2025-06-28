#pragma once

#include "Packet.h"
#include "ExtrasPacket.h"

struct PACKED ExtrasPacket : Packet {
    ExtrasPacket() : Packet() {
        this->mType = PacketType::EXTRA;
        mPacketSize = sizeof(ExtrasPacket) - sizeof(Packet);
    }
    bool InfiniteCapBounce = false;
};