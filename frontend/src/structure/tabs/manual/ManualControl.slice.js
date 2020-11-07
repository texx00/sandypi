import { createSlice } from '@reduxjs/toolkit';

const manualControlSlice = createSlice({
    name: "manualControl",
    initialState: {
        device: {
            width: 100,
            height: 100
        }
    },
    reducers: {
        setDeviceSize(state, action){
            return {device: action.payload}
        }
    }
});

export const{
    setDeviceSize
} = manualControlSlice.actions;

export default manualControlSlice.reducer;