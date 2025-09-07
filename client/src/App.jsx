import React, { useContext } from 'react'
import {Navigate, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginPage';
import ProfilePage from './pages/ProfilePage';
import {Toaster} from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import assets from './assets/assets';

const App = () => {
  const {authUser} = useContext(AuthContext)
  
  return (
    <div 
      className="bg-contain bg-no-repeat" 
      style={{
        backgroundImage: `url(${assets.bgImage})`
      }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />}/>
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />}/>
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />}/>
      </Routes>
    </div>
  )
}

export default App;