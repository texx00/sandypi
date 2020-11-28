import { createSlice } from '@reduxjs/toolkit';

const tabsSlice = createSlice({
    name: "tabs",
    initialState: {
        tab: "home",
        drawing_code: 0,
        playlist_code: 0,
        back_tab: "home"
    },
    reducers: {
        setTab(state, action){
            // TODO check if it is leaving the playlist tab without saving and ask to save before leaving
            return {tab: action.payload};
        },
        showSingleDrawing(state, action){
            const back_tab = state.tab;
            return {tab: "drawing", drawing_code: action.payload, back_tab: back_tab}
        },
        showSinglePlaylist(state, action){
            const back_tab = state.tab;
            return {tab: "playlist", playlist_code: action.payload, back_tab: back_tab}
        },
        tabBack(state){
            const back_tab = state.back_tab;
            return {tab: back_tab}
        }
    }
});

export const {
    setTab,
    showSingleDrawing,
    showSinglePlaylist, 
    tabBack
} = tabsSlice.actions;

export default tabsSlice.reducer;