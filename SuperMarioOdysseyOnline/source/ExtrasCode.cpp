#include "ExtrasCode.hpp"
#include "al/util.hpp" // Passe die Includes an, je nachdem wo deine Hilfsfunktionen liegen
#include "helpers/NrvFind/NrvFindHelper.h"
#include <cmath>
#include "packets/Extras.hpp"

//------------------------------usefull includes---------------------------------
#include "game/GameData/GameDataHolderAccessor.h"            //für health und coins
#include "game/GameData/GameDataFunction.h"
#include "game/HakoniwaSequence/HakoniwaSequence.h"
#include "game/Player/PlayerActorBase.h"                    //mario base
#include "game/Player/PlayerActorHakoniwa.h"                //Mario hakoniwa
#include "game/Player/PlayerFunction.h"                     //mario function
#include "game/Player/PlayerHackKeeper.h"                   //mario hack keeper
#include "game/Player/PlayerCostumeInfo.h"                  //für coszume namen
#include "game/Player/HackCap/PlayerCapActionHistory.h"     //für infinite cap Dives
#include "game/Player/Actions/PlayerWallActionHistory.h"    //für infinite cap Dives/wall jumps
#include "game/StageScene/StageScene.h"



void handleNoclip(PlayerActorHakoniwa* hakoniwa, bool gNoclip, bool isYukimaru) {
    if (gNoclip && hakoniwa && !isYukimaru) {
        static bool wasNoclipOn = false;
        bool isNoclip = gNoclip;

        if (!isNoclip && wasNoclipOn)
            al::onCollide(hakoniwa);
        wasNoclipOn = isNoclip;

        if (isNoclip) {
            static float speed = 20.0f;
            static float speedMax = 250.0f;
            static float vspeed = 10.0f;
            static float speedGain = 0.0f;

            sead::Vector3f *playerPos = al::getTransPtr(hakoniwa);
            sead::Vector3f *cameraPos = al::getCameraPos(hakoniwa, 0);
            sead::Vector2f *leftStick = al::getLeftStick(-1);

           
           
           //instead set the player to demopupetable
           /* --------------------Nerven nerven---------------------------------
            const al::Nerve* hipDropNrv = NrvFindHelper::getNerveAt(nrvPlayerActorHakoniwaHipDrop);
            if(al::isNerve(hakoniwa, hipDropNrv))
                NrvFindHelper::setNerveAt(hakoniwa, nrvPlayerActorHakoniwaWait);
            -----------------------aber ausgeklammert immernoch---------------------------------*/



            hakoniwa->exeJump();
            al::offCollide(hakoniwa);
            al::setVelocityZero(hakoniwa);

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
        }
    }
}



void handleInfiniteCapBounce(PlayerActorHakoniwa* playerBase, bool gInfiniteCapBounce) {

    static int capBounceFrameCounter = 0;   //für die frames
    static int x = 3;                       //für die frames

    if (playerBase && gInfiniteCapBounce) {
        capBounceFrameCounter++;
        if (capBounceFrameCounter >= x) { // alle 3 Frames
            PlayerActorHakoniwa* hakoniwa = static_cast<PlayerActorHakoniwa*>(playerBase);
            if (hakoniwa && hakoniwa->mHackCap && hakoniwa->mHackCap->mCapActionHistory && hakoniwa->mPlayerWallActionHistory) {    //wenn hakoniwa und hackcap und capactionhistory und playerwallactionhistory
                hakoniwa->mHackCap->mCapActionHistory->clearCapJump();  //cap jump reset
                hakoniwa->mPlayerWallActionHistory->reset();            //wall jump reset
            }
            capBounceFrameCounter = 0; // zurücksetzen
        }
    }
}

/*      Augeklammert weil die nerve nicht funktioniert
    PlayerActorHakoniwa* hakoniwa = static_cast<PlayerActorHakoniwa*>(playerBase);

    // Check coins from HakoniwaSequence
    HakoniwaSequence* sequence = tryGetHakoniwaSequence();
    if (sequence && sequence->mFinalCoins != gCoins) {
        gCoins = sequence->mFinalCoins;
        Client::sendHealthCoinsPacket(hakoniwa);
    }
    
    // Check health from PlayerHitPointData
    if (holder.mData && holder.mData->mGameDataFile) {
        PlayerHitPointData* hitData = holder.mData->mGameDataFile->getPlayerHitPointData();
        if (hitData && hitData->mCurrentHit != gHealth) {
            gHealth = hitData->mCurrentHit;
            Client::sendHealthCoinsPacket(hakoniwa);
        }
    }
*/