import { createSlice } from '@reduxjs/toolkit';

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
            return { playlists: action.payload }; 
        },
        updateSinglePlaylist: (state, action) => {
            return { playlists: state.playlists.map((item) => {
                return item.id === action.payload.id ? action.payload : item;
            })}
        }
    }
});

export const {
    deletePlaylist,
    setPlaylists,
    setRefreshPlaylists,
    updateSinglePlaylist
} = playlistsSlice.actions;

export default playlistsSlice.reducer;