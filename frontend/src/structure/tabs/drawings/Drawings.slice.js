import { createSlice } from '@reduxjs/toolkit';
import { checkArray } from '../../../utils/utils';

const drawingsSlice = createSlice({
    name: "drawings",
    initialState: {
        drawings: [],
        mustRefresh: true
    },
    reducers: {
        // action.payload must be the id of the drawing to delete
        deleteDrawing(state, action){
            let dr = state.drawings;
            let res = dr.filter((el) => {
                return el.id !== action.payload;
            });
            return { drawings: res };
        },
        // action.payload must be true (must refresh) or false (set automatically after refreshing)
        setRefreshDrawing(state, action){
            return { mustRefresh: action.payload };
        },
        // action.payload must be the complete list of drawings
        setDrawings(state, action){
            return { drawings: action.payload };
        },
        // action.payload must be the drawing to update
        setSingleDrawing(state, action){
            let drawing = action.payload;
            let drawings = checkArray(state.drawings.drawings);
            return {drawings: drawings.map((el) => {
                if (el.id === drawing.id)
                    return drawing;
                else return el;
            })};
        }
    }
});

export const {
    deleteDrawing,
    setRefreshDrawing,
    setDrawings,
    setSingleDrawing
} = drawingsSlice.actions;

export default drawingsSlice.reducer;