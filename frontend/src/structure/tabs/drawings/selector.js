const getRefreshDrawings = state => {
    return state.drawings.mustRefresh;
}

const getDrawings = state => { 
    if (Array.isArray(state.drawings.drawings))
        return state.drawings.drawings;
    else return [];
};

const getDrawingsLimited = state => { 
    if (Array.isArray(state.drawings.drawings))
        return state.drawings.drawings.slice(0,10);
    else return [];
};

const getSingleDrawing = state => {
    let ret = {}
    const dr = state.drawings.drawings;
    for (let el in dr){
        if (dr[el] !== undefined && dr[el] !== null) 
            if (dr[el].id === state.tabs.drawingCode)
                ret = dr[el];
    }
    return ret;
}

export { getRefreshDrawings, getDrawings, getDrawingsLimited, getSingleDrawing };