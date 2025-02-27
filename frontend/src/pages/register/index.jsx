import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../redux/actions/userActions.js";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import "../../styles/style.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const { loading, message, error, id, isAuthenticated } = useSelector(
    (state) => state.userAuth
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(details));
  };

  useEffect(() => {
    if (message) {
      toast.success(message, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
      navigate(`/verify/${id}`);
    }
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
    if (isAuthenticated) {
      navigate("/");
    }
  }, [dispatch, message, error, isAuthenticated, navigate, id]);

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="brand">DevNet</h2>
        <h3 className="register-title">Register</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={details.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={details.username}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="mobile"
          placeholder="Contact"
          value={details.mobile}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={details.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={details.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Register"}
        </button>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
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

export default Register;