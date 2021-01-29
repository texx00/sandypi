import { createSlice } from '@reduxjs/toolkit';

import { playlist_save } from '../../../sockets/SAE';
import { cloneDict, listsAreEqual } from '../../../utils/dictUtils';
import { getSinglePlaylist } from './selector';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        mandatory_refresh: false,
        playlists: [],
        playlist_id: 0,
        playlist_resync: false,
        playlist_deleted: false,
        refresh_request_id: -1,
        refresh_request: true
    },
    reducers: {
        addToPlaylist: (state, action) => {
            const elements = action.payload.elements;
            const playlistId = action.payload.playlistId;
            let pls = state.playlists.map((pl) => {
                let p = {...pl};
                if (pl.id === playlistId){
                    p.elements = [...p.elements, ...elements];
                    console.log("saving playlist")
                    playlist_save(p);                 // saves playlist also on the server (only one playlist at a time, there will be no problem with mutliple save calls)
                }
                return p;
            });
            return {...state, playlists: pls, refresh_request_id: playlistId};
        },
        deletePlaylist: (state, action) => {
            return { ...state, playlists: state.playlists.filter((item) => {
                return item.id !== action.payload;
            })}
        },
        resetPlaylistDeletedFlag: (state, action) => {
            return {...state, playlist_deleted: false };
        },
        setRefreshPlaylists: (state, action) => {
            return {...state, refresh_request: action.payload };
        },
        setPlaylists: (state, action) => {
            let sync = false;
            let playlist_deleted = true;
            let pls = action.payload.map((pl)=>{
                pl.elements = JSON.parse(pl.elements);
                if (pl.id === state.playlist_id){
                    let pl_clone = cloneDict(getSinglePlaylist({playlists: state}));
                    let list_equal = listsAreEqual(pl_clone, pl);
                    if (!list_equal && pl.id !== state.refresh_request_id){
                        sync = true;    // check if any change to the playlist in use has been done on another device
                    }
                    playlist_deleted = false;
                }
                return pl;
            });
            if (state.playlist_id === 0){   // if the playlist is a new playlist should not go back if the others are updated
                playlist_deleted = false;
            }
            let must_refresh = false;
            if (state.refresh_request_id !== -1){
                must_refresh= true;
            }
            return { 
                ...state, 
                playlists: pls, 
                playlist_resync: sync, 
                playlist_deleted: playlist_deleted, 
                refresh_request_id: -1, 
                mandatory_refresh: must_refresh 
            }; 
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlist_id: action.payload };
        },
        setResyncPlaylist: (state, action) => {
            return { ...state, playlist_resync: action.payload, mandatory_refresh: false };
        },
        updateSinglePlaylist: (state, action) => {
            let playlist = action.payload;
            let res = state.playlists.map((pl) => {
                return pl.id === playlist.id ? playlist : pl;
            });
            playlist_save(playlist);
            return { ...state, playlists: res, playlist_deleted: false };
        }
    }
});

export const {
    addToPlaylist,
    deletePlaylist,
    updateSinglePlaylist,
    resetPlaylistDeletedFlag,
    setPlaylists,
    setRefreshPlaylists,
    setSinglePlaylistId,
    setResyncPlaylist,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;