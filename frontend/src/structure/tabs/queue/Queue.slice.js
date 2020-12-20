import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        isQueueEmpty: true,
        elements: [],
        drawingId: 0
    },
    reducers: {
        setQueueStatus(state, action){
            let res = action.payload;
            let queueEmpty = res.now_drawing_id === 0;
            return {
                isQueueEmpty: queueEmpty,
                elements: res.elements,
                drawingId: res.now_drawing_id
            }
        },
        setQueueNotEmpty(state, action){
            return {
                ...state,
                isQueueEmpty: false
            }
        }
    }
});

export const{
    setQueueStatus,
    setQueueNotEmpty
} = queueSlice.actions;

export default queueSlice.reducer;