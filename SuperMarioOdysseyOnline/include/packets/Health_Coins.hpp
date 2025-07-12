#pragma once

#include "Packet.h"

struct PACKED Health_Coins : Packet {
    Health_Coins() : Packet() {this->mType = PacketType::HEALTH_COINS; mPacketSize = sizeof(Health_Coins) - sizeof(Packet);};
    int health = 0;
    int coins = 0;
};