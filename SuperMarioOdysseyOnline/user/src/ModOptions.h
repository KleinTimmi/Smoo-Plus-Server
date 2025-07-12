#pragma once

#include <mallow/config.hpp>

struct ModOptions : public mallow::config::ConfigBase{
    bool myModOption;

    void read(const ArduinoJson::JsonObject &config) override {
        mallow::config::ConfigBase::read(config);
        myModOption = config["myModOption"] | false;
    }
};
