import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from '../pages/login'
import Home from '../pages/home'
import Register from '../pages/register'
// import LoadingPage from '../components/loading/loading'
// import Editor from '../pages/editorWeb/index'
// import EditorCode from '../pages/editorCode/index.jsx'
// import Payment from '../pages/payment'
import LoginOtp from '../pages/otp/loginOtp'
import VerifyOtp from '../pages/otp/verifyOtp'
import { useDispatch, useSelector } from 'react-redux'
// import { loadUser } from '../redux/actions/userActions'
import ProtectedRoute from './ProtectedRoute'
import AuthRoute from './AuthRoute'
// import Google from '../pages/google/index.jsx'
import Landing from '../pages/landing/index.jsx'
// import ContactUs from '../pages/contact/index.jsx'
// import { ChartsOverviewDemo } from '../pages/analysis/index.js'
// import Chatbot from '../pages/chatBot/index.jsx'

const Path = () => {

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const {userLoading, authError} = useSelector(state => state.userAuth);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div>
      <Router>
        {
          // userLoading ? (
          //   <LoadingPage />
          // ) : (
          <Routes>
              <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> 
              <Route path="/login/:id" element={<LoginOtp />} />
              <Route path="/verify/:id" element={<VerifyOtp />} />
              {/* <Route path="/webeditor" element={<ProtectedRoute><Editor /></ProtectedRoute>} /> */}
              {/* <Route path="/codeeditor" element={<ProtectedRoute><EditorCode /></ProtectedRoute>} /> */}
              {/* <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} /> */}
              {/* <Route path="/contact" element={<ContactUs />} /> */}
              {/* <Route path="/analysis/:id" element={<ChartsOverviewDemo/>} /> */}
              {/* <Route path="/auth/google" element={<Google />}></Route> */}
          </Routes>
        // )
        }
      </Router>
    </div>
  )
}

export default Path