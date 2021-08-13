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


export { 
    getSettings, 
    getDevice, 
    getIsFastMode, 
    systemIsLinux, 
    shouldCheckUpdate, 
    showLEDs 
};