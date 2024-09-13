import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Calendar from './pages/Calendar.tsx';
import Login from './pages/login.js';
import Team from './pages/team.tsx';
import CreateTeam from './pages/CreateTeam.tsx';
import FindTeam from './pages/FindTeam.tsx';
import Admin from './pages/Admin.tsx';
import Capitanes from './pages/Capitanes.tsx';
import ProtectedRoute from './ProtectedRoute';
import reportWebVitals from './reportWebVitals';
import LigaDivision from './pages/LigaDivision.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router basename="/futbolWeb">
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/team" element={<Team />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/find-team" element={<FindTeam />} />
        <Route path="/capitanes" element={<Capitanes />} />
        <Route path="/liga-division" element={<LigaDivision />} />

        {/* Protected route for Admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();