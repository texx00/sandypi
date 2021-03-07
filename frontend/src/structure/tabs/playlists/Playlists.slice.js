import { createSlice } from '@reduxjs/toolkit';

import { playlist_save } from '../../../sockets/sEmits';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        mandatory_refresh: false,
        playlists: [],
        playlist_id: 0,
        playlist_deleted: false,
        show_new_playlist: false
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
            return {...state, playlists: pls, mandatory_refresh: true};
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
                pl.elements = JSON.parse(pl.elements);
                return pl;
            });
            return { 
                ...state, 
                playlists: pls, 
                playlist_deleted: playlist_deleted, 
                mandatory_refresh: true
            }; 
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlist_id: action.payload, mandatory_refresh: true, show_new_playlist: false };
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
            if ((playlist.version < version) && !isNew)
                return state;
            // if the playlist is new should add it to the list
            if (isNew)
                res.push(playlist)
            // check if it is necessary to refresh the playlist view
            let must_refresh = (playlist.id === state.playlist_id) && (playlist.version > version);
            return { ...state, playlists: res, playlist_deleted: false, mandatory_refresh: must_refresh};
        },
        setShowNewPlaylist(state, action){
            return { ...state, show_new_playlist: action.payload }
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