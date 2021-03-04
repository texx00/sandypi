import { createSlice } from '@reduxjs/toolkit';

import { playlist_save } from '../../../sockets/sEmits';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        mandatory_refresh: false,
        playlists: [],
        playlist_id: 0,
        playlist_deleted: false
    },
    reducers: {
        addToPlaylist: (state, action) => {
            const elements = action.payload.elements;
            const playlistId = action.payload.playlistId;
            let pls = state.playlists.map((pl) => {
                let p = {...pl};
                if (pl.id === playlistId){
                    p.elements = [...p.elements, ...elements];
                    playlist_save(p);                 // saves playlist also on the server (only one playlist at a time, there will be no problem with mutliple save calls)
                }
                return p;
            });
            return {...state, playlists: pls};
        },
        deletePlaylist: (state, action) => {
            return { ...state, playlists: state.playlists.filter((item) => {
                return item.id !== action.payload;
            })}
        },
        resetPlaylistDeletedFlag: (state, action) => {
            return {...state, playlist_deleted: false };
        },
        resetMandatoryRefresh: (state, action) => {
            return {...state, mandatory_refresh: false};
        },
        setPlaylists: (state, action) => {
            let playlist_deleted = true;                // to check if the playlist has been deleted from someone else
            let pls = action.payload.map((pl)=>{
                if (pl.id === state.playlist_id){
                    playlist_deleted = false;
                }
                return pl;
            });
            return { 
                ...state, 
                playlists: pls, 
                playlist_deleted: playlist_deleted
            }; 
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlist_id: action.payload, mandatory_refresh: true };
        },
        updateSinglePlaylist: (state, action) => {
            let playlist = action.payload;
            let res = state.playlists.map((pl) => {
                return pl.id === playlist.id ? playlist : pl;
            });
            return { ...state, playlists: res, playlist_deleted: false, mandatory_refresh: playlist.id === state.playlist_id};
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
} = playlistsSlice.actions;

export default playlistsSlice.reducer;