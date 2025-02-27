import axios from 'axios';
import { BACKEND_URL } from '../../constants/url';

const URL = BACKEND_URL + "api/v1/user";

axios.defaults.withCredentials = true

export const loginUser = (email, password) => async (dispatch) => {
    try {
        dispatch({
            type: "USER_LOGIN_REQUEST"
        })

        const { data } = await axios.post(`${URL}/login`, { email, password }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "USER_LOGIN_SUCCESS",
            payload: {
                message: data.message,
                id: data.data
            }
        })
        
    } catch (error) {
        dispatch({
            type: "USER_LOGIN_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const verifyLoginOtp = (id, otp) => async (dispatch) => {
    try {
        dispatch({
            type: "LOGIN_OTP_REQUEST"
        })

        const { data } = await axios.post(`${URL}/login/verify/${id}`, { otp }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        })

        dispatch({
            type: "LOGIN_OTP_SUCCESS",
            payload: data.message
        })
        
    } catch (error) {
        dispatch({
            type: "LOGIN_OTP_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const registerUser = (details) => async (dispatch) => {
    console.log("Dispatching user data to backend:", details); // Debugging line
    try {
        console.log("Action working")
        dispatch({
            type: "USER_REGISTER_REQUEST"
        })

        const { data } = await axios.post(`${URL}/register`, details, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });
        console.log("Response: ", data)

        dispatch({
            type: "USER_REGISTER_SUCCESS",
            payload: {
                message: data.message,
                id: data.data
            }
        })
        
    } catch (error) {
        dispatch({
            type: "USER_REGISTER_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const verifyUserOtp = (id, otp) => async (dispatch) => {
    try {
        dispatch({
            type: "VERIFY_OTP_REQUEST"
        })

        const { data } = await axios.post(`${URL}/verify/${id}`, { otp }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        })

        dispatch({
            type: "VERIFY_OTP_SUCCESS",
            payload: data.message
        })
        
    } catch (error) {
        dispatch({
            type: "VERIFY_OTP_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const resendLoginOtp = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_LOGIN_OTP_REQUEST"
        })

        const { data } = await axios.get(`${URL}/login/resend/${id}`)

        dispatch({
            type: "RESEND_LOGIN_OTP_SUCCESS",
            payload: data.message
        })
    }
    catch (error){
        dispatch({
            type: "RESEND_LOGIN_OTP_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const resendVerifyOtp = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_VERIFY_OTP_REQUEST"
        })

        const { data } = await axios.get(`${URL}/resend/${id}`)

        dispatch({
            type: "RESEND_VERIFY_OTP_SUCCESS",
            payload: data.message
        })
        
    } catch (error) {
        dispatch({
            type: "RESEND_VERIFY_OTP_FAILURE",
            payload: error.response?.data?.message
        })
    }
}

export const logoutUser = () => async (dispatch) => {
    try {
        dispatch({
            type: "LOGOUT_USER_REQUEST"
        })

        const { data } = await axios.get(`${URL}/logout`)

        dispatch({
            type: "LOGOUT_USER_SUCCESS",
            payload: data.message
        })
        
    } catch (error) {
        dispatch({
            type: "LOGOUT_USER_FAILURE",
            payload: error.response?.data?.message
        })
    }
}




// import axios from 'axios';
// import { BACKEND_URL } from '../../constants/url';

// const URL = BACKEND_URL + "api/v1/user";

// // Set default withCredentials to true
// axios.defaults.withCredentials = true;

// export const loginUser = (email, password) => async (dispatch) => {
//     try {
//         dispatch({ type: "USER_LOGIN_REQUEST" });

//         const { data } = await axios.post(`${URL}/login`, { email, password }, {
//             headers: { "Content-Type": "application/json" }
//         });

//         dispatch({
//             type: "USER_LOGIN_SUCCESS",
//             payload: {
//                 message: data.message,
//                 id: data.data, // Ensure this matches your reducer's expected structure
//             }
//         });

//     } catch (error) {
//         dispatch({
//             type: "USER_LOGIN_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };

// export const verifyLoginOtp = (id, otp) => async (dispatch) => {
//     try {
//         dispatch({ type: "LOGIN_OTP_REQUEST" });

//         const { data } = await axios.post(`${URL}/login/verify/${id}`, { otp }, {
//             headers: { "Content-Type": "application/json" }
//         });

//         dispatch({
//             type: "LOGIN_OTP_SUCCESS",
//             payload: data.message, // Ensure this matches your reducer's expected structure
//         });

//     } catch (error) {
//         dispatch({
//             type: "LOGIN_OTP_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };

// export const registerUser = (details) => async (dispatch) => {
//     console.log("Dispatching user data to backend:", details);
//     try {
//         dispatch({ type: "USER_REGISTER_REQUEST" });

//         const { data } = await axios.post(`${URL}/register`, details, {
//             headers: { "Content-Type": "application/json" }
//         });

//         dispatch({
//             type: "USER_REGISTER_SUCCESS",
//             payload: {
//                 message: data.message,
//                 id: data.data, // Ensure this matches your reducer's expected structure
//             }
//         });

//     } catch (error) {
//         dispatch({
//             type: "USER_REGISTER_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };

// export const verifyUserOtp = (id, otp) => async (dispatch) => {
//     try {
//         dispatch({ type: "VERIFY_OTP_REQUEST" });

//         const { data } = await axios.post(`${URL}/verify/${id}`, { otp }, {
//             headers: { "Content-Type": "application/json" }
//         });

//         dispatch({
//             type: "VERIFY_OTP_SUCCESS",
//             payload: data.message, // Ensure this matches your reducer's expected structure
//         });

//     } catch (error) {
//         dispatch({
//             type: "VERIFY_OTP_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };

// export const resendLoginOtp = (id) => async (dispatch) => {
//     try {
//         dispatch({ type: "RESEND_LOGIN_OTP_REQUEST" });

//         const { data } = await axios.get(`${URL}/login/resend/${id}`);

//         dispatch({
//             type: "RESEND_LOGIN_OTP_SUCCESS",
//             payload: data.message, // Ensure this matches your reducer's expected structure
//         });
//     } catch (error) {
//         dispatch({
//             type: "RESEND_LOGIN_OTP_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };

// export const resendVerifyOtp = (id) => async (dispatch) => {
//     try {
//         dispatch({ type: "RESEND_VERIFY_OTP_REQUEST" });

//         const { data } = await axios.get(`${URL}/resend/${id}`);

//         dispatch({
//             type: "RESEND_VERIFY_OTP_SUCCESS",
//             payload: data.message, // Ensure this matches your reducer's expected structure
//         });

//     } catch (error) {
//         dispatch({
//             type: "RESEND_VERIFY_OTP_FAILURE",
//             payload: error.response?.data?.message || error.message, // Improved error handling
//         });
//     }
// };
