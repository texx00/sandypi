import { mapValueToName } from "../../../utils/dictUtils";

const getSettings = state => { return state.settings };

const getDevice = state => { return mapValueToName(state.settings.device) };
// TODO convert settings device in a simpler object (the settings require to call something like "device.type.value" but can convert the result here to be "device.type" by mapping the value)

const getIsFastMode = state => { return state.settings.serial.fast_mode.value}

const systemIsLinux = state => { return state.settings.system.is_linux };

const shouldCheckUpdate = state => { 
    if (state.settings.system !== undefined)
        return (state.settings.system.last_update_check_time === undefined) || (state.settings.system.last_update_check_time + 1 < new Date()/8.64e7);
    else return false;
};    // check for an update every day once

export { getSettings, getDevice, getIsFastMode, systemIsLinux, shouldCheckUpdate };