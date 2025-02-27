import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/actions/userActions.js";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import "../../styles/style.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { loading, message, error, id, isAuthenticated } = useSelector(
    (state) => state.userAuth
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  useEffect(() => {
    if (message) {
      toast.success(message, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
      navigate(`/login/${id}`);
    }
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
    if (isAuthenticated) {
      navigate("/")
    }
  }, [dispatch, message, error, isAuthenticated, navigate, id]);

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="brand">DevNet</h2>
        <h3 className="register-title">Login</h3>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Login"}
        </button>
        <p className="login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <div className="social-login">
          {/* <p>Continue with</p> */}
          <div className="social-icons">
            <a href="#" className="google">G</a>
            <a href="#" className="github">GH</a>
            <a href="#" className="facebook">F</a>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;