const getTab = state => {return state.tabs.tab};

const getSingleDrawingId = state => {return state.tabs.drawing_code}

const isSinglePlaylist = state => {
    return state.tabs.tab === "playlist"
}

const showBack = state => {
    return state.tabs.tab === "drawing" || state.tabs.tab === "playlist"
}

export {getTab, getSingleDrawingId, isSinglePlaylist, showBack};