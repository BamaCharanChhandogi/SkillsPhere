import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        isEmailVerified: false
    },
    reducers:{
        // actions
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        setUser:(state, action) => {
            state.user = action.payload;
        },
        setEmailVerified: (state, action) => {
            state.isEmailVerified = action.payload;
        },

    }
});
export const {setLoading, setUser,setEmailVerified} = authSlice.actions;
export default authSlice.reducer;