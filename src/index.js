import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Calendar from './pages/Calendar.tsx';
import Login from './pages/login.js';
import Team from './pages/team.tsx';
import CreateTeam from './pages/CreateTeam.tsx'; // Import the CreateTeam page
import FindTeam from './pages/FindTeam.tsx'; // Import the FindTeam page
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/team" element={<Team />} />
        <Route path="/create-team" element={<CreateTeam />} /> {/* Add new route */}
        <Route path="/find-team" element={<FindTeam />} /> {/* Add FindTeam route */}

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
