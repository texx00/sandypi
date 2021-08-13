import { mapValueToName } from "../../../utils/dictUtils";

const getSettings =         state => { return state.settings };

const getDevice =           state => { return mapValueToName(state.settings.device) };

const getIsFastMode =       state => { return state.settings.serial.fast_mode.value };

const systemIsLinux =       state => { return state.settings.system.is_linux };

const showLEDs =            state => { return state.settings.leds.available };

const shouldCheckUpdate =   state => { 
    if (state.settings.system !== undefined)
        return (state.settings.system.last_update_check_time === undefined) || (state.settings.system.last_update_check_time + 1 < new Date()/8.64e7);
    else return false;
};    // check for an update every day once

const isUpToDate =          state => {
    return state.settings.updates.updates_available;
}

const getCurrentBranch =    state => {
    return state.settings.updates.branch;
}

const getCurrentHash =      state => {
    return state.settings.updates.hash;
}

export { 
    getSettings, 
    getDevice, 
    getIsFastMode, 
    systemIsLinux, 
    shouldCheckUpdate, 
    isUpToDate,
    getCurrentBranch,
    getCurrentHash,
    showLEDs 
};