import { createSlice } from '@reduxjs/toolkit';

import { playlistSave } from '../../../sockets/sEmits';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        mandatoryRefresh: false,
        playlists: [],
        playlistId: 0,
        playlistDeleted: false,
        showNewPlaylist: false,
        playlistAddedNewElement: false
    },
    reducers: {
        addToPlaylist: (state, action) => {
            let elements = action.payload.elements;
            const playlistId = action.payload.playlistId;
            let pls = state.playlists.map((pl) => {
                pl = {...pl};
                if (pl.id === playlistId){
                    let maxId = 1;
                    if (Array.isArray(pl.elements))
                    // looking for the highest element id to add a higher value to the elements that are being added (this avoid the creation of a new element when the element with id is sent back from the server)
                        maxId = Math.max(pl.elements.map(el => {return el.id}), 1) + 1;
                    for (let e in elements){
                        elements[e].id = maxId++;
                    }
                    pl.elements = [...pl.elements];
                    pl.elements = [...pl.elements, ...elements];
                    pl.version++;                      // increases version
                    playlistSave(pl);                  // saves playlist also on the server (only one playlist at a time, there will be no problem with multiple save calls)
                }
                return pl;
            });
            return {...state, playlists: pls, mandatoryRefresh: true, playlistAddedNewElement: true };
        },
        deletePlaylist: (state, action) => {
            return { ...state, playlists: state.playlists.filter((item) => {
                return item.id !== action.payload;
            })}
        },
        resetPlaylistDeletedFlag: (state, action) => {
            return {...state, playlistDeleted: false };
        },
        resetMandatoryRefresh: (state, action) => {
            return {...state, mandatoryRefresh: false};
        },
        setPlaylists: (state, action) => {
            let playlistDeleted = true;                // to check if the playlist has been deleted from someone else
            let pls = action.payload.map((pl)=>{
                if (pl.id === state.playlistId){
                    playlistDeleted = false;
                }
                pl.elements = JSON.parse(pl.elements);
                return pl;
            });
            return { 
                ...state, 
                playlists: pls, 
                playlistDeleted: playlistDeleted, 
                mandatoryRefresh: true
            }; 
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlistId: action.payload, mandatoryRefresh: true, showNewPlaylist: false };
        },
        updateSinglePlaylist: (state, action) => {
            let playlist = action.payload;
            let version = 0;
            let isNew = true;
            let res = state.playlists.map((pl) => {
                if (pl.id === playlist.id){
                    version = pl.version;
                    isNew = false;
                    return playlist;
                }else{
                    return pl;
                }
            });

            // check if the version is older than the one available (if there were some fast changes the socket connection may send an old version of the playlist before receiving the last updated version)
            if ((playlist.version < version) && !isNew && !state.playlistAddedNewElement)
                return state;
            // if the playlist is new should add it to the list
            if (isNew)
                res.push(playlist)
            // check if it is necessary to refresh the playlist view
            let mustRefresh = (playlist.id === state.playlistId) && ((playlist.version > version) || state.playlistAddedNewElement);
            return { ...state, playlists: res, playlistDeleted: false, mandatoryRefresh: mustRefresh, playlistAddedNewElement: false};
        },
        setShowNewPlaylist(state, action){
            return { ...state, showNewPlaylist: action.payload }
        }
    }
});

export const {
    addToPlaylist,
    deletePlaylist,
    updateSinglePlaylist,
    resetPlaylistDeletedFlag,
    resetMandatoryRefresh,
    setPlaylists,
    setSinglePlaylistId,
    setShowNewPlaylist
} = playlistsSlice.actions;

export default playlistsSlice.reducer;