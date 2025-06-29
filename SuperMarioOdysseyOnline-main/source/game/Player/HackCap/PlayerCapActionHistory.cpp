#include "game/Player/HackCap/PlayerCapActionHistory.h"

PlayerCapActionHistory::PlayerCapActionHistory(al::LiveActor const*, PlayerConst const*, struct PlayerTrigger const*, IUsePlayerCollision const*) {}
void PlayerCapActionHistory::update(void) {}
void PlayerCapActionHistory::clearLandLimit(void) {}
void PlayerCapActionHistory::clearLimitHeight(void) {}
void PlayerCapActionHistory::clearCapJump(void) {}
void PlayerCapActionHistory::clearLandLimitStandAngle(void) {}
void PlayerCapActionHistory::clearWallAirLimit(void) {}
void PlayerCapActionHistory::recordLimitHeight(void) {}
bool PlayerCapActionHistory::isOverLimitHeight(void) const { return false; }