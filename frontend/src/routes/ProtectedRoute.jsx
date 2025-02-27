import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import toastOptions from "../constants/toast";


const ProtectedRoute = ({children}) => {
    const { isAuthenticated, authError } = useSelector(state => state.userAuth)

    const dispatch = useDispatch();

    useEffect(() => {
        if(authError){
          toast.error(authError, toastOptions);
          dispatch({ type: "CLEAR_AUTH_ERROR"})
        }
      }, [authError])

    return(
        isAuthenticated ? children : <Navigate to="/login" />
    )
}

export default ProtectedRoute


// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import toastOptions from "../constants/toast";

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, otpVerified, authError } = useSelector((state) => state.userAuth);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (authError) {
//       toast.error(authError, toastOptions);
//       dispatch({ type: "CLEAR_AUTH_ERROR" });
//     }
//   }, [authError, dispatch]);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   } else if (!otpVerified) {
//     return <Navigate to="/verify-otp" />;
//   } else {
//     return children;
//   }
// };

// export default ProtectedRoute;