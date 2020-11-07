import { createStore } from 'redux';
import { combineReducers } from '@reduxjs/toolkit';

import settingsReducer from './structure/tabs/settings/Settings.slice.js';
import manualControlReducer from './structure/tabs/manual/ManualControl.slice.js';

let store = createStore(combineReducers({
    settings: settingsReducer,
    manualControl: manualControlReducer
}));

export default store;