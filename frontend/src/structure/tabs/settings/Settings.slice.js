import { createSlice } from '@reduxjs/toolkit';

import { cloneDict, setSubKey } from '../../../utils/dictUtils';
import default_settings from './default_settings';

const settingsSlice = createSlice({
    name: "settings",
    initialState: default_settings,
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