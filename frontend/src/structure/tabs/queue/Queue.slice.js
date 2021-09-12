import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        elements: [],
        currentElement: undefined,
        repeat: false,
        shuffle: false,
        interval: 0,
        status: {eta: -1}
    },
    reducers: {
        setInterval(state, action){
            return {
                ...state, 
                interval: action.payload
            }
        },
        setQueueElements(state, action){
            return {
                ...state,
                elements: action.payload
            }
        },
        setQueueStatus(state, action){
            let res = action.payload;
            res.current_element = res.current_element === "None" ? undefined : JSON.parse(res.current_element);
            return {
                elements:       res.elements,
                currentElement: res.current_element,
                interval:       res.interval,
                status:         res.status,
                repeat:         res.repeat,
                shuffle:        res.shuffle
            }
        },
        toggleQueueShuffle(state, action){
            return {
                ...state,
                shuffle: !state.shuffle
            }
        },
        toggleQueueRepeat(state, action){
            return {
                ...state, 
                repeat: !state.repeat
            }
        }
    }
});

export const{
    setInterval,
    setQueueElements,
    setQueueStatus,
    toggleQueueShuffle,
    toggleQueueRepeat
} = queueSlice.actions;

export default queueSlice.reducer;