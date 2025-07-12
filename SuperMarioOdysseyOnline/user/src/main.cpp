#include <mallow/mallow.hpp>

#include "ActorFactory/actorPatches.h"

#include "Library/Controller/InputFunction.h"
#include "ModOptions.h"
#include "Scene/StageScene.h"

using mallow::log::logLine;

struct ScenePlayHook : public mallow::hook::Trampoline<ScenePlayHook> {
    static void Callback(StageScene* thisPtr) {
        if (al::isPadTriggerL(-1) && mallow::config::getConfg<ModOptions>()->myModOption)
            logLine("You pressed L while the game was unpaused and myModOption was enabled");
        Orig(thisPtr);
    }
};

extern "C" void userMain() {
    exl::hook::Initialize();
    mallow::init::installHooks();
    ca::actorPatches();

    ScenePlayHook::InstallAtSymbol("_ZN10StageScene7exePlayEv");
}
