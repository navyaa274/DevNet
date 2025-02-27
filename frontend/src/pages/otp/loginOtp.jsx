import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resendLoginOtp, verifyLoginOtp } from "../../redux/actions/userActions.js";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import "../../styles/style.css";

const LoginOtp = () => {
  const[otp, setOtp] = useState();

  const dispatch = useDispatch();
  const { id } = useParams();

  const navigate = useNavigate();


  const { loading, message, error, isAuthenticated } = useSelector(
    (state) => state.userAuth
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(otp);
    if(otp / 100000 < 1){
            toast.error("OTP must contain 6 digits", toastOptions)
            return
        }
        dispatch(verifyLoginOtp(id, otp));
  };

  const handleResendOTP = () => {
    dispatch(resendLoginOtp(id));
  }

  useEffect(() => {
    if (message) {
      toast.success(message, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
    }
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
    if (isAuthenticated) {
      navigate("/home")
    }
  }, [dispatch, message, error, isAuthenticated, navigate]);

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="brand">DevNet</h2>
        <h3 className="register-title">Verification</h3>
        
        <input
          type="number"
          name="otp"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Submit"}
        </button>
        <br></br>
        <br></br>
        <Link to={`/login/${id}`} onClick={handleResendOTP}>
            Resend OTP
        </Link>
      </form>
    </div>
  );
}

export default LoginOtp;