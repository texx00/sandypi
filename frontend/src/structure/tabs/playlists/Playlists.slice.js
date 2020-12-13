import { createSlice } from '@reduxjs/toolkit';

import { playlist_save } from '../../../sockets/SAE';
import { listsAreEqual } from '../../../utils/dictUtils';
import { getSinglePlaylist } from './selector';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        playlists: [],
        must_refresh: true,
        playlist_id: 0,
        playlist_resync: false,
        playlist_deleted: false
    },
    reducers: {
        addToPlaylist: (state, action) => {
            const elements = action.payload.elements;
            const playlistId = action.payload.playlistId;
            for (let pl in state.playlists){
                if (state.playlists[pl].id === playlistId){
                    // TODO fix this: check if elements is an array and append, then return
                    state.playlists[pl].elements.append(elements);
                    playlist_save(state.playlists[pl]);                 // saves playlist also on the server
                    break;
                } 
            }
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
            return {...state, must_refresh: action.payload };
        },
        setPlaylists: (state, action) => {
            let sync = false;
            let playlist_deleted = true;
            let pls = action.payload.map((pl)=>{
                pl.elements = JSON.parse(pl.elements);
                if (pl.id === state.playlist_id){
                    if (!listsAreEqual(pl, getSinglePlaylist({playlists: state}))){
                        sync = true;    // check if any change to the playlist in use has been done on another device
                    }
                    playlist_deleted = false;
                }
                return pl;
            });
            if (state.playlist_id === 0){   // if the playlist is a new playlist should not go back if the others are updated
                playlist_deleted = false;
            }
            return { ...state, playlists: pls, playlist_resync: sync, playlist_deleted: playlist_deleted }; 
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlist_id: action.payload };
        },
        setResyncPlaylist: (state, action) => {
            return { ...state, playlist_resync: action.payload };
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