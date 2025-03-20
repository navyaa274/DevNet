// import React from "react";
import React,{useEffect, useState} from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "../../styles/landing.css";
// import logo from "./dv2.jpg";
import { logoutUser } from '../../redux/actions/userActions.js';
import LogoutModal from '../../components/modals/logoutModal.jsx';
import VideoChat from '../../components/videoChat/VideoChat.jsx';
import { useDispatch, useSelector } from "react-redux";
    

const Home = () => {

    const [isOpen, setIsOpen] = useState(true);
    const [openVideoChat, setOpenVideoChat] = useState(false);
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    
    const navigate= useNavigate();
    const dispatch = useDispatch();
  
    const { user, userLoading } = useSelector(state => state.userAuth)
    const { isAuthenticated } = useSelector(state => state.userAuth);
  
    const handleLogoutOpenModal = () => {
      setOpenLogoutModal(true);
      // dispatch(logoutUser());
    }
  
    // const handleCloseModal = (e) => {
    //   // e.stopPropagation(); // Prevent event bubbling
    //   setOpenCreateModal(false);
    //   onClose(false);
    // };
  
    const handleLogoutCloseModal = (e) => {
      // e.stopPropagation(); // Prevent event bubbling
      setOpenLogoutModal(false);
    };
  
    const handleLogout = () => {
      dispatch(logoutUser());
    }
  
    useEffect(() => {
      if (!isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, navigate]);
  
    useEffect(() => {
      if (openLogoutModal) {
          document.body.style.overflow = "hidden"; // Disable scroll
      } else {
          document.body.style.overflow = ""; // Restore scroll
      }
  
      // Cleanup when the component unmounts
      return () => {
          document.body.style.overflow = "";
      };
  }, [openLogoutModal]);

  return (
    <div>
      <p>GHAR BHI BANANA HAIIIII 😭</p>
      <button onClick={() => setOpenVideoChat(true)} style={{ marginRight: '10px' }}>Start Video Call</button>
      <button onClick={handleLogoutOpenModal}>Logout</button>

      {openLogoutModal && (
            <div className="overlay" onClick={handleLogoutCloseModal}>
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <LogoutModal onClose={handleLogoutCloseModal} onConfirm={handleLogout} />
                </div>
            </div>
        )}

        <VideoChat isOpen={openVideoChat} onClose={() => setOpenVideoChat(false)} />
    </div>
    
  );
}

export default Home;
