import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./reducers/userReducers";

const store = configureStore({
    reducer: {
        userAuth: userAuthReducer
    }
})

export default store