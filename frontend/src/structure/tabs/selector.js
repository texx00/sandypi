const getTab = state => {return state.tabs.tab};

const getSingleDrawingId = state => {return state.tabs.drawing_code}

const getShowSaveBeforeBack = state => {
    return state.tabs.show_save_before_back && isSinglePlaylist(state);
}

const isSinglePlaylist = state => {
    return state.tabs.tab === "playlist"
}

const showBack = state => {
    return state.tabs.tab === "drawing" || state.tabs.tab === "playlist"
}

export {getTab, getSingleDrawingId, getShowSaveBeforeBack, isSinglePlaylist, showBack};