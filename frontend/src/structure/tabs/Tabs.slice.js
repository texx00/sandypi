import { createSlice } from '@reduxjs/toolkit';

const tabsSlice = createSlice({
    name: "tabs",
    initialState: {
        tab: "home",
        drawing_code: 0,
        back_tab: "home",
        save_before_back: false,
        show_save_before_back: false
    },
    reducers: {
        resetShowSaveBeforeBack(state){
            return {...state, show_save_before_back: false, save_before_back: false }
        },
        setSaveBeforeBack(state, action){
            return {...state, save_before_back: action.payload};
        },
        setTab(state, action){
            if (state.tab === "playlist" && state.save_before_back)
                return {...state, show_save_before_back: true}
            return {...state, tab: action.payload};
        },
        showSingleDrawing(state, action){
            const back_tab = state.tab;
            return {...state, tab: "drawing", drawing_code: action.payload, back_tab: back_tab}
        },
        showSinglePlaylist(state, action){
            const back_tab = state.tab;
            return {...state, tab: "playlist", back_tab: back_tab}
        },
        tabBack(state){
            if (state.save_before_back)        // if must save before going back, will prompt the user to save or to leave
                return {...state, show_save_before_back: true};
            const back_tab = state.back_tab;
            return {...state, tab: back_tab}
        }
    }
});

export const {
    resetShowSaveBeforeBack,
    setSaveBeforeBack,
    setTab,
    showSingleDrawing,
    showSinglePlaylist, 
    tabBack
} = tabsSlice.actions;

export default tabsSlice.reducer;