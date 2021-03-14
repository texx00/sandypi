import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        isQueueEmpty: true,
        elements: [],
        currentElement: undefined,
        intervalValue: 200
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
            res.current_element = res.current_element === "None" ? undefined : JSON.parse(res.current_element);
            let queueEmpty = res.current_element === undefined;
            return {
                isQueueEmpty: queueEmpty,
                elements: res.elements,
                currentElement: res.current_element,
                intervalValue: res.intervalValue
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