import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "../../styles/landing.css";
// import logo from "./dv2.jpg";

const Landing = () => {
  return (
    <div>
      <p>LANDING PAGE BANANA HAIIIII </p>
      <Link to="/register">Register</Link>
      <br></br>
      <Link to="/login">Login</Link>
    </div>
    
  );
}

export default Landing;
