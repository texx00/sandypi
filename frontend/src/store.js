import { applyMiddleware, compose, createStore } from 'redux';
import { combineReducers } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

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
            localStorage.setItem("version", process.env.REACT_APP_VERSION);
            window.location.reload();
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

const reducer = combineReducers({
    settings: settingsReducer,
    queue: queueReducer,
    tabs: tabsReducer,
    drawings: drawingsReducer,
    playlists: playlistReducer
});


// can dispatch multiple actions thanks to the "thunk" library
// without this library, could not use multiple dispatch action in the same function inside the "mapDispatchToProp" dict


// Needs this check to differentiate between browsers running the dev extension and browser that are not running it (otherwise the compose method will raise an exception if no function is passed)
let devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();  // redux setup for chrome dev extension https://github.com/zalmoxisus/redux-devtools-extension
if (!devTools) {    // https://github.com/reduxjs/redux/issues/2359
    devTools = a => a;
}


const store = createStore(
    reducer,
    loadFromLocalStorage(),
    compose(
        applyMiddleware(thunk), 
        devTools
    )
);

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;