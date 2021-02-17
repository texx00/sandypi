import { createStore } from 'redux';
import { combineReducers } from '@reduxjs/toolkit';

import settingsReducer from './structure/tabs/settings/Settings.slice';
import queueReducer from './structure/tabs/queue/Queue.slice';
import tabsReducer from './structure/tabs/Tabs.slice';
import drawingsReducer from './structure/tabs/drawings/Drawings.slice';
import playlistReducer from './structure/tabs/playlists/Playlists.slice';


// save state to local storage
function saveToLocalStorage(state) {
    try {
        const serialisedState = JSON.stringify(state);
        localStorage.setItem("persistantState", serialisedState);
        localStorage.setItem("version", process.env.REACT_APP_VERSION);
    } catch (e) {
        console.warn(e);
    }
}

// will create the storage with the values saved in local storage
function loadFromLocalStorage() {
    // if is loading a new version from the server, clear the local storage (to avoid compatibility issues between different frontend versions)
    try{
        const version = localStorage.getItem("version");
        if (version !== process.env.REACT_APP_VERSION){
            console.warn("New version detected. Clearing local storage");
            localStorage.clear();
        }
    } catch (e) {
        console.warn(e);
        localStorage.clear();
    }

    // loads state from local storage if available
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
        queue: queueReducer,
        tabs: tabsReducer,
        drawings: drawingsReducer,
        playlists: playlistReducer
    }),
    loadFromLocalStorage(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()        // redux setup for chrome dev extension https://github.com/zalmoxisus/redux-devtools-extension
);

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;