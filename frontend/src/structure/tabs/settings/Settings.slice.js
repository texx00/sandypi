import { createSlice } from '@reduxjs/toolkit';

import { cloneDict, setSubKey } from '../../../utils/dictUtils';

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        serial: {
            port: "FAKE", 
            baud: 115200,
            available_baudrates: ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"], 
            available_ports: ["FAKE"]
        }, 
        device: {
            width: 100, 
            height:100
        }, 
        scripts: {
            connected: "", 
            before: "", 
            after: ""
        },
        system: {
            is_linux: false,
            last_update_check_time: 0
        },
        leds: {
            width: 0,
            height: 0,
            type: "WS2812B",
            available_types: ["WS2812B"],
            pin1: 18
        }
    },
    reducers: {
        updateAllSettings(state, action){
            let res = action.payload;
            res = setSubKey(res, "system.last_update_check_time", state.system.last_update_check_time);
            return {...state, ...res};
        },
        updateSetting(state, action){
            let newValue = action.payload;
            let settings = cloneDict(state);
            settings = setSubKey(settings, newValue[0], newValue[1]);
            return settings;
        },
        updateCheckTime(state, action){
            let settings = cloneDict(state);
            settings = setSubKey(settings, "system.last_update_check_time", new Date()/8.64e7 );    // 8.64e7 -> ms in one day -> convert in day
            return settings;
        }
    }
});

export const {
    updateAllSettings, 
    updateCheckTime,
    updateSetting
} = settingsSlice.actions;

export default settingsSlice.reducer;