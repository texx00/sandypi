const getTab = state => {return state.tabs.tab};

const getSingleDrawingId = state => {return state.tabs.drawing_code}

const showBack = state => {
    return state.tabs.tab === "drawing" || state.tabs.tab === "playlist"
}

export {getTab, getSingleDrawingId, showBack};