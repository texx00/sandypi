import { createSlice } from '@reduxjs/toolkit';

import { playlist_save } from '../../../sockets/SAE';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        playlists: [],
        must_refresh: true
    },
    reducers: {
        deletePlaylist: (state, action) => {
            return { playlists: state.playlists.filter((item) => {
                return item.id !== action.payload;
            })}
        },
        setRefreshPlaylists: (state, action) => {
            return { must_refresh: action.payload };
        },
        setPlaylists: (state, action) => {
            return { playlists: action.payload.map((pl)=>{
                pl.elements = JSON.parse(pl.elements);
                return pl;
            }) }; 
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
        }
    }
});

export const {
    deletePlaylist,
    setPlaylists,
    setRefreshPlaylists,
    updateSinglePlaylist,
    addToPlaylist
} = playlistsSlice.actions;

export default playlistsSlice.reducer;