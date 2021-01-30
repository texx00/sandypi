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
            console.log("Slice")
            let res = action.payload;
            res.current_element = res.current_element === "None" ? undefined : JSON.parse(res.current_element);
            let queueEmpty = res.current_element === undefined;
            console.log(res)
            return {
                isQueueEmpty: queueEmpty,
                elements: res.elements,
                currentElement: res.current_element
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