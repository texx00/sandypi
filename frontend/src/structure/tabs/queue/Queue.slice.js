import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        elements: [],
        currentElement: undefined,
        repeat: false,
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
            return {
                elements:       res.elements,
                currentElement: res.current_element,
                intervalValue:  res.intervalValue,
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
    setQueueElements,
    setQueueStatus,
    toggleQueueShuffle,
    toggleQueueRepeat
} = queueSlice.actions;

export default queueSlice.reducer;