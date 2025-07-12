#pragma once

#include <cstddef>
#include "crc32.h"
#include "sead/basis/seadTypes.h"

namespace CaptureTypes {

    enum class Type : s16 {
        Unknown = -1,
        AnagramAlphabetCharacter, // 0
        Byugo, // 1
        Bubble, // 2
        Bull, // 3
        Car, // 4
        ElectricWire, // 5
        KillerLauncherMagnum, // 6
        KuriboPossessed, // 7
        WanwanBig, // 8
        KillerLauncher, // 9
        Koopa, // 10
        Wanwan, // 11
        Pukupuku, // 12
        PukupukuSnow, // 13
        Gamane, // 14
        FireBrosPossessed, // 15
        PackunFire, // 16
        Frog, // 17
        Kakku, // 18
        Hosui, // 19
        HammerBrosPossessed, // 20
        Megane, // 21
        KaronWing, // 22
        KuriboWing, // 23
        PackunPoison, // 24
        Radicon, // 25
        Tank, // 26
        Tsukkun, // 27
        TRex, // 28
        TRexSleep, // 29
        TRexPatrol, // 30
        Imomu, // 31
        SenobiGeneratePoint, // 32
        Bed, // 33
        End // 34
    };

    static constexpr size_t ToValue(Type type) { return static_cast<std::uint16_t>(type); }

    static constexpr Type ToType(std::uint16_t value) {return static_cast<Type>(value);}

    static constexpr std::array<const char*, ToValue(Type::End)> s_Strs {
        "AnagramAlphabetCharacter", // 0
        "Byugo", // 1
        "Bubble", // 2
        "Bull", // 3
        "Car", // 4
        "ElectricWire", // 5
        "KillerLauncherMagnum", // 6
        "KuriboPossessed", // 7
        "WanwanBig",  // has sub-actors // 8
        "KillerLauncher", // 9
        "Koopa", // 10
        "Wanwan",  // has sub-actors // 11
        "Pukupuku", // 12
        "PukupukuSnow", // 13
        "Gamane",  // has sub-actors // 14
        "FireBrosPossessed", // 15
        "PackunFire", // 16
        "Frog", // 17
        "Kakku", // 18
        "Hosui", // 19
        "HammerBrosPossessed", // 20
        "Megane", // 21
        "KaronWing", // 22
        "KuriboWing", // 23
        "PackunPoison", // 24
        "Radicon", // 25
        "Tank", // 26
        "Tsukkun", // 27
        "TRex", // 28
        "TRexSleep", // 29
        "TRexPatrol", // 30
        "Imomu", // 31
        "SenobiGeneratePoint", // 32
        "Bed" // 33
    };

    // these ifdefs are really dumb but it makes clangd happy so /shrug
#ifndef ANALYZER
    static constexpr crc32::HashArray s_Hashes(s_Strs);
#endif

    static constexpr Type FindType(std::string_view const& str) {
#ifndef ANALYZER
        return ToType(s_Hashes.FindIndex(str));
#else
        return Type::Unknown;
#endif
    }

    static constexpr const char *FindStr(Type type) {
        const s16 type_ = (s16)type;
        if (0 <= type_ && type_ < s_Strs.size())
            return s_Strs[type_];
        else
            return "";
    }
}