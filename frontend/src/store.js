import { createStore } from 'redux';
import { combineReducers } from '@reduxjs/toolkit';

import settingsReducer from './structure/tabs/settings/Settings.slice';
import manualControlReducer from './structure/tabs/manual/ManualControl.slice';
import queueReducer from './structure/tabs/queue/Queue.slice';
import tabsReducer from './structure/tabs/Tabs.slice';
import drawingsReducer from './structure/tabs/drawings/Drawings.slice';


// save state to local storage
function saveToLocalStorage(state) {
    try {
        const serialisedState = JSON.stringify(state);
        localStorage.setItem("persistantState", serialisedState);
    } catch (e) {
        console.warn(e);
    }
}

// will create the storage with the values saved in local storage
function loadFromLocalStorage() {
    try {
        const serialisedState = localStorage.getItem("persistantState");
        if (serialisedState === null) return undefined;
        return JSON.parse(serialisedState);
    } catch (e) {
        console.warn(e);
        return undefined;
    }
  }

const store = createStore(combineReducers({
        settings: settingsReducer,
        manualControl: manualControlReducer,
        queue: queueReducer,
        tabs: tabsReducer,
        drawings: drawingsReducer
    }),
    loadFromLocalStorage(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()        // redux setup for chrome dev extension https://github.com/zalmoxisus/redux-devtools-extension
);

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;