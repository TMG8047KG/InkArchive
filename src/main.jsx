import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Canvas from './pages/Canvas.jsx';
import Forum from './pages/Forum.jsx';
import Announcements from './pages/Announcements.jsx';
import General from './pages/General.jsx';
import CreatorCorner from './pages/CreatorCorner.jsx';
import ArtDiscussion from './pages/ArtDiscussion.jsx';
import ArtTrading from './pages/ArtTrading.jsx';
import CreateThread from './pages/CreateThread.jsx';
import UserProfile from './pages/UserProfile.jsx';
import ArtDesk from './pages/ArtDesk.jsx';
import Thread from './pages/Thread.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/login" element={<LoginPage/>}></Route>
        <Route path="/register" element={<RegisterPage/>}></Route>
        <Route path="/canvas" element={<Canvas/>}></Route>
        <Route path="/artdesk" element={<ArtDesk/>}></Route>
        <Route path="/forum" element={<Forum/>}></Route>
        <Route path="/forum/announcements" element={<Announcements/>}></Route>
        <Route path="/forum/general" element={<General/>}></Route>
        <Route path="/forum/:category/:thread" element={<Thread/>}></Route>
        <Route path="/forum/creatorcorner" element={<CreatorCorner/>}></Route>
        <Route path="/forum/artdiscussion" element={<ArtDiscussion/>}></Route>
        <Route path="/forum/arttrading" element={<ArtTrading/>}></Route>
        <Route path="/forum/createthread/:category" element={<CreateThread/>}></Route>
        <Route path="/user" element={<UserProfile/>}></Route>
      </Routes>
    </Router>
  </React.StrictMode>,
)