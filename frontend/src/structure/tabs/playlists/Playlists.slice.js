import { createSlice } from '@reduxjs/toolkit';

const playlistsSlice = createSlice({
    name: "playlists",
    initialState: {
        playlists: [],
        must_refresh: true
    },
    reducers: {
        setRefreshPlaylists: (state, action) => {
            return { must_refresh: action.payload };
        },
        setPlaylists: (state, action) => {
            return { playlists: action.payload }; 
        }
    }
});

export const {
    setPlaylists,
    setRefreshPlaylists
} = playlistsSlice.actions;

export default playlistsSlice.reducer;