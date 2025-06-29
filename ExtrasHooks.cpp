#include "ExtrasFeatures.h"
#include "ExtrasHooks.h"
#include "game/StageScene/StageScene.h"
#include "game/Player/PlayerActorHakoniwa.h"
#include "al/util/NerveUtil.h"



HOOK_DEFINE_TRAMPOLINE(InfiniteCapDiveHook) {
    static void Callback(StageScene *scene) {
        PlayerActorHakoniwa* player = tryGetPlayerActorHakoniwa(scene);

        if (player  && gInfiniteCapBounce == true) {
            player->mHackCap->mCapActionHistory->clearCapJump();
            player->mHackCap->mCapActionHistory->clearWallAirLimit();
        }

        Orig(scene);
    }
};

HOOK_DEFINE_TRAMPOLINE(NoclipMovementHook) {
    static void Callback(PlayerActorHakoniwa *player) {
        static bool wasNoclipOn = false;
        bool isNoclip = gEnableNoclip;

        if (!isNoclip && wasNoclipOn)
            al::onCollide(player);
        wasNoclipOn = isNoclip;

        if (!isNoclip) {
            Orig(player);
            return;
        }

        // Noclip-Logik
        static float speed = 20.0f;
        static float speedMax = 250.0f;
        static float vspeed = 10.0f;
        static float speedGain = 0.0f;

        sead::Vector3f *playerPos = al::getTransPtr(player);
        sead::Vector3f *cameraPos = al::getCameraPos(player, 0);
        sead::Vector2f *leftStick = al::getLeftStick(-1);

        player->exeJump();
        al::offCollide(player);
        al::setVelocityZero(player);
        playerPos->y += 1.5f;

        float d = sqrt(al::powerIn(playerPos->x - cameraPos->x, 2) + (al::powerIn(playerPos->z - cameraPos->z, 2)));
        float vx = ((speed + speedGain) / d) * (playerPos->x - cameraPos->x);
        float vz = ((speed + speedGain) / d) * (playerPos->z - cameraPos->z);

        playerPos->x -= leftStick->x * vz;
        playerPos->z += leftStick->x * vx;
        playerPos->x += leftStick->y * vx;
        playerPos->z += leftStick->y * vz;

        if (al::isPadHoldX(-1) || al::isPadHoldY(-1)) speedGain += 0.5f;
        if (al::isPadHoldA(-1) || al::isPadHoldB(-1)) speedGain -= 0.5f;
        if (speedGain <= 0.0f) speedGain = 0.0f;
        if (speedGain >= speedMax) speedGain = speedMax;

        if (al::isPadHoldZL(-1)) playerPos->y -= (vspeed + speedGain / 3);
        if (al::isPadHoldZR(-1)) playerPos->y += (vspeed + speedGain / 3);

        Orig(player);
    }
};

void installExtrasHooks() {
    InfiniteCapDiveHook::InstallAtSymbol("_ZN10StageScene7controlEv");
    NoclipMovementHook::InstallAtSymbol("_ZN19PlayerActorHakoniwa8movementEv");
}