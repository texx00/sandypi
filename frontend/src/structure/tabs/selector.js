const getTab = state => {return state.tabs.tab};

const getSingleDrawingId = state => {return state.tabs.drawing_code}

const getShowSaveBeforeBack = state => {
    return state.tabs.show_save_before_back && isViewSinglePlaylist(state);
}

const isManualControl = state => {
    return state.tabs.tab === "manual";
}

const isViewSinglePlaylist = state => {
    return state.tabs.tab === "playlist";
}

const isViewQueue = state => {
    return state.tabs.tab === "queue";
}

const showBack = state => {
    return state.tabs.tab === "drawing" || state.tabs.tab === "playlist";
}

export {getTab, getSingleDrawingId, getShowSaveBeforeBack, isManualControl, isViewSinglePlaylist, isViewQueue, showBack};