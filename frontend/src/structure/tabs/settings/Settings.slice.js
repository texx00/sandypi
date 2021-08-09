import { createSlice } from '@reduxjs/toolkit';

import { cloneDict, setSubKey } from '../../../utils/dictUtils';
import defaultSettings from './defaultSettings';

const settingsSlice = createSlice({
    name: "settings",
    initialState: defaultSettings,
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
        },
        createNewHWButton(state, action){
            let settings = cloneDict(state);
            let idx = 0;
            if (settings.buttons.buttons.length !== 0){
                if (settings.buttons.buttons.length > 1)    
                    idx = parseInt(settings.buttons.buttons.reduce((p,v) => {return p.idx > v.idx ? p.idx : v.idx})) + 1;
                else idx = settings.buttons.buttons[0].idx + 1;
            }
            // TODO add the usage value in the list of available values from the settings
            let click_filtered_values = settings.buttons.available_values.filter((i) => {return i.usage !== "long"}).map((i) => {return i.label});
            let press_filtered_values = settings.buttons.available_values.filter((i) => {return i.usage !== "click"}).map((i) => {return i.label});

            let buttonSetting = {
                idx: idx,
                pin: {
                    tip: "Write the pin number",
                    type: "input",
                    label: "Pin number",
                    value: 0,
                    name: "buttons.buttons."+idx+".pin"
                },
                click: {
                    type: "select",
                    label: "Click action",
                    available_values: click_filtered_values,
                    value: settings.buttons.available_values[0].label,
                    name: "buttons.buttons."+idx+".click"
                },
                press: {
                    type: "select",
                    label: "Long press action",
                    available_values: press_filtered_values,
                    value: settings.buttons.available_values[0].label,
                    name: "buttons.buttons."+idx+".press"
                },
                pull: {
                    type: "select",
                    label: "Pull resistor type",
                    available_values: [
                        "Pullup internal",
                        "Pulldown internal",
                        "Pullup external",
                        "Pulldown external"
                    ],
                    value: "Pullup internal",
                    name: "buttons.buttons."+idx+".pull"
                }
            };
            settings.buttons.buttons.push(buttonSetting);
            return settings;
        },
        removeHWButton(state, action){
            let idx = action.payload;
            let settings = cloneDict(state);
            let res = settings.buttons.buttons.filter((i) => {return i.idx !== idx});
            settings.buttons.buttons = res;
            return settings;
        }
    }
});

export const {
    updateAllSettings, 
    updateCheckTime,
    updateSetting,
    createNewHWButton,
    removeHWButton
} = settingsSlice.actions;

export default settingsSlice.reducer;