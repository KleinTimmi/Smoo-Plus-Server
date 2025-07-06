#pragma once

#include "Extras.h"
#include "Packet.h"
#include "Packets/Extras.h"

struct PACKED ExtrasPacket : Packet {
    ExtrasPacket() : Packet() {
        this->mType = PacketType::EXTRA;
        mPacketSize = sizeof(ExtrasPacket) - sizeof(Packet);
    };

    bool gInfiniteCapBounce = false;
};