#pragma once

#include <mallow/mallow.hpp>
#include "Scene/ProjectActorFactory.h"
#include "ActorFactory/ActorFactoryEntries100.h"

namespace patch = exl::patch;
namespace inst = exl::armv8::inst;
namespace reg = exl::armv8::reg;

HOOK_DEFINE_TRAMPOLINE(ActorFactoryHook) {
    static void Callback(ProjectActorFactory* actorFactory) {
        Orig(actorFactory);
        actorFactory->mFactoryEntries = actorEntries;
        actorFactory->mNumFactoryEntries = sizeof(actorEntries) / sizeof(actorEntries[0]);
    }
};

namespace ca {
void actorPatches() {
    ActorFactoryHook::InstallAtSymbol("_ZN19ProjectActorFactoryC2Ev");
}
}
