import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        isQueueEmpty: true,
        elements: [],
        drawingId: 0
    },
    reducers: {
        setQueueElements(state, action){
            return {
                ...state,
                elements: action.payload
            }
        },
        setQueueStatus(state, action){
            let res = action.payload;
            let queueEmpty = res.now_drawing_id === 0;
            return {
                isQueueEmpty: queueEmpty,
                elements: res.elements.map((el, idx) => {   // must set a drawing_id and id so they can be used with the sortable component. When elements are introduced on the server side, should send the element description instead of the drawing id so that this mapping will not be needed
                    return {
                        drawing_id: el,
                        id: idx
                    }
                }),
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
    setQueueElements,
    setQueueStatus,
    setQueueNotEmpty
} = queueSlice.actions;

export default queueSlice.reducer;