import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
    name: "queue",
    initialState: {
        isQueueEmpty: true
    },
    reducers: {
        setQueueEmpty(state, action){
            return {isQueueEmpty: true}
        },
        setQueueNotEmpty(state, action){
            return {isQueueEmpty: false}
        }
    }
});

export const{
    setQueueEmpty,
    setQueueNotEmpty
} = queueSlice.actions;

export default queueSlice.reducer;