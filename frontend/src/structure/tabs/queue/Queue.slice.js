import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        isQueueEmpty: true,
        elements: [],
        currentElement: undefined,
        intervalValue: 0,
        shuffle: false,
        status: {eta: -1}
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
                intervalValue: res.intervalValue,
                status: res.status
            }
        },
        setQueueNotEmpty(state, action){
            return {
                ...state,
                isQueueEmpty: false
            }
        },
        setContinuousStatus(state, action){
            return {
                ...state,
                intervalValue: action.payload.interval,
                shuffle: action.payload.shuffle
            }
        }
    }
});

export const{
    setQueueElements,
    setQueueStatus,
    setQueueNotEmpty,
    setContinuousStatus
} = queueSlice.actions;

export default queueSlice.reducer;