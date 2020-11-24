const getDrawings = state => {return state.tabs.tab};

const getSingleDrawing = state => {
    let ret = {}
    const dr = state.drawings.drawings;
    for (let el in dr){
        if (dr[el].id === state.tabs.drawing_code){
            ret = dr[el];
        }
    }
    return ret
}

export {getDrawings, getSingleDrawing};