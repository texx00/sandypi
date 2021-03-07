import { createSlice } from '@reduxjs/toolkit';

const tabsSlice = createSlice({
    name: "tabs",
    initialState: {
        tab: "home",
        drawingCode: 0,
        backTab: "home"
    },
    reducers: {
        setTab(state, action){
            return {...state, tab: action.payload, backTab: state.tab};
        },
        showSingleDrawing(state, action){
            return {...state, tab: "drawing", drawingCode: action.payload, backTab: state.tab}
        },
        showSinglePlaylist(state, action){
            return {...state, tab: "playlist", backTab: state.tab}
        },
        tabBack(state){
            return {...state, tab: state.backTab}
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