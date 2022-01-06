import { mapValueToName } from "../../../utils/dictUtils";

const getSettings =                 state => { return state.settings };

const getDevice =                   state => { return mapValueToName(state.settings.device) };

const getIsFastMode =               state => { return state.settings.serial.fast_mode.value };

const systemIsLinux =               state => { return state.settings.system.is_linux };

const showLEDs =                    state => { return state.settings.leds.available };

const updateAutoEnabled =           state => { return state.settings.updates.autoupdate; }

const updateDockerComposeLatest =   state => { return state.settings.updates.docker_compose_latest_version }

const getCurrentHash =              state => {
    return state.settings.updates.hash;
}

export { 
    getSettings, 
    getDevice, 
    getIsFastMode, 
    systemIsLinux,
    updateAutoEnabled,
    updateDockerComposeLatest,
    getCurrentHash,
    showLEDs 
};