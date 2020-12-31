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
            is_linux: false
        }
    },
    reducers: {
        updateAllSettings(state, action){
            return {...state, ...action.payload};
        },
        updateSetting(state, action){
            let newValue = action.payload;
            let settings = cloneDict(state);
            settings = setSubKey(settings, newValue[0], newValue[1]);
            return settings;
        },
    }
});

export const {
    updateAllSettings, 
    updateSetting
} = settingsSlice.actions;

export default settingsSlice.reducer;