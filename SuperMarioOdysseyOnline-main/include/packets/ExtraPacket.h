#pragma once

#include "Packet.h"
#include "server/Client.hpp"

struct PACKED Extra : Packet {
    Extra() : Packet() {
        this->mType = PacketType::Extra;
        mPacketSize = sizeof(Extra) - sizeof(Packet);
    };
    u8 mModeAndType = 0;

    GameMode gameMode() {
        GameMode mode = (GameMode)((((mModeAndType >> 4) + 1) % 16) - 1);

        if (mode == GameMode::LEGACY) {
            u8 type = mModeAndType & 0x0f;

            if (type == 3) {
                return GameMode::LEGACY;
            }
            if (type == 4 || type == 8) {
                return GameMode::FREEZETAG;
            }
            if (type == 1 || type == 2) {
                if (this->mUserID != Client::getClientId()) {
                    return GameMode::FREEZETAG;
                }
            }
        }
        return mode;
    }

    UpdateType updateType() { return static_cast<UpdateType>(mModeAndType & 0x0f); }

    void setGameMode(GameMode mode) { mModeAndType = (mode << 4) | (mModeAndType & 0x0f); }

    void setUpdateType(UpdateType type) { mModeAndType = (mModeAndType & 0xf0) | (type & 0x0f); }
};

struct PACKED DisabledExtra : Extra {
    DisabledExtra(nn::account::Uid userID) : Extra() {
        setGameMode(GameMode::NONE);
        setUpdateType(3);
        mUserID = userID;
        mPacketSize = sizeof(DisabledExtra) - sizeof(Packet);
    };
    bool isIt = false;
    u8 seconds = 0;
    u16 minutes = 0;
};
