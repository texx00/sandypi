import { createSlice } from '@reduxjs/toolkit';

const drawingsSlice = createSlice({
    name: "drawings",
    initialState: {
        drawings: []
    },
    reducers: {
        setDrawings(state, action){
            return {drawings: action.payload};
        },
        setSingleDrawing(state, action){
            throw Error("Not implemented");
            return 
        }
    }
});

export const {
    setDrawings
} = drawingsSlice.actions;

export default drawingsSlice.reducer;