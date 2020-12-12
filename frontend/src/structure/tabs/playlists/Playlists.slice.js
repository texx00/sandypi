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
        playlist_resync: false
    },
    reducers: {
        deletePlaylist: (state, action) => {
            return { ...state, playlists: state.playlists.filter((item) => {
                return item.id !== action.payload;
            })}
        },
        setRefreshPlaylists: (state, action) => {
            return {...state, must_refresh: action.payload };
        },
        setPlaylists: (state, action) => {
            let sync = false;
            let pls = action.payload.map((pl)=>{
                pl.elements = JSON.parse(pl.elements);
                if (pl.id === state.playlist_id){
                    if (!listsAreEqual(pl, getSinglePlaylist({playlists: state}))){
                        sync = true;
                    }
                }
                return pl;
            })
            console.log({ ...state, playlists: pls, playlist_resync: sync })
            return { ...state, playlists: pls, playlist_resync: sync }; 
        },
        updateSinglePlaylist: (state, action) => {
            let playlist = action.payload;
            for (let pl in state.playlists){
                if (state.playlists[pl].id === playlist.id){
                    state.playlists[pl] = playlist;
                    playlist_save(state.playlists[pl]);                 // saves playlist also on the server
                    break;
                }
            }
        },
        addToPlaylist: (state, action) => {
            const element = action.payload.element;
            const playlistId = action.payload.playlistId;
            for (let pl in state.playlists){
                if (state.playlists[pl].id === playlistId){
                    state.playlists[pl].elements.push(element);
                    playlist_save(state.playlists[pl]);                 // saves playlist also on the server
                    break;
                } 
            }
        },
        setSinglePlaylistId: (state, action) => {
            return { ...state, playlist_id: action.payload }
        },
        setResyncPlaylist: (state, action) => {
            return { ...state, playlist_resync: action.payload };
        }
    }
});

export const {
    deletePlaylist,
    setPlaylists,
    setRefreshPlaylists,
    updateSinglePlaylist,
    addToPlaylist,
    setSinglePlaylistId,
    setResyncPlaylist
} = playlistsSlice.actions;

export default playlistsSlice.reducer;