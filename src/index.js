// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Import React Router components
import './index.css';
import Login from './pages/login.js';
import Team from './pages/team.tsx';
import Settings from './pages/settings.js'; // Import the Settings page
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Route for team page */}
        <Route path="/team" element={<Team />} />

        {/* Route for settings page */}
        <Route path="/settings" element={<Settings />} />

        {/* Default route to redirect to login if no path is provided */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
