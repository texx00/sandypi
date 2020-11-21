import { createStore } from 'redux';
import { combineReducers } from '@reduxjs/toolkit';

import settingsReducer from './structure/tabs/settings/Settings.slice';
import manualControlReducer from './structure/tabs/manual/ManualControl.slice';
import queueReducer from './structure/tabs/queue/Queue.slice';


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
        queue: queueReducer
    }),
    loadFromLocalStorage()
);

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;