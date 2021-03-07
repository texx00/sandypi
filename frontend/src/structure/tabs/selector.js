const getTab = state => {return state.tabs.tab};

const getSingleDrawingId = state => {return state.tabs.drawingCode}

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

export {getTab, getSingleDrawingId, isManualControl, isViewSinglePlaylist, isViewQueue, showBack};