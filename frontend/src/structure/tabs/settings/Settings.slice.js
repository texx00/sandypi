import { createSlice } from '@reduxjs/toolkit';

import { setSubKey } from '../../../utils/dictUtils.js';

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
        }
    },
    reducers: {
        updateAllSettings(state, action){
            return action.payload;
        },
        updateSetting(state, action){
            let setting = action.payload;
            state = setSubKey(state, setting[0], setting[1]);
            return state;
        },
    }
});

export const {
    updateAllSettings, 
    updateSetting
} = settingsSlice.actions;

export default settingsSlice.reducer;