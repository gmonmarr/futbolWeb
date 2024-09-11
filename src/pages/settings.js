// src/pages/settings.js

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Firebase config
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { updateEmail, updatePassword } from 'firebase/auth'; // Firebase auth functions
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matriculaTEC, setMatriculaTEC] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      setEmail(user.email);

      // Fetch user's current matriculaTEC
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setMatriculaTEC(userDoc.data().matriculaTEC || '');
        }
      };
      fetchUserData();
    } else {
      navigate('/login'); // Redirect to login if no user is logged in
    }
  }, [navigate]);

  // Function to update email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (currentUser && email) {
        await updateEmail(currentUser, email);

        // Update email in Firestore as well
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { email });

        setSuccessMessage('Email updated successfully!');
      }
    } catch (error) {
      setError('Failed to update email: ' + error.message);
    }
  };

  // Function to update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (currentUser && password) {
        await updatePassword(currentUser, password);
        setSuccessMessage('Password updated successfully!');
      }
    } catch (error) {
      setError('Failed to update password: ' + error.message);
    }
  };

  // Function to update matriculaTEC
  const handleUpdateMatriculaTEC = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (currentUser && matriculaTEC) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { matriculaTEC });

        setSuccessMessage('MatriculaTEC updated successfully!');
      }
    } catch (error) {
      setError('Failed to update MatriculaTEC: ' + error.message);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Form to update email */}
      <form onSubmit={handleUpdateEmail}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Update Email</button>
      </form>

      {/* Form to update password */}
      <form onSubmit={handleUpdatePassword}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>

      {/* Form to update matriculaTEC */}
      <form onSubmit={handleUpdateMatriculaTEC}>
        <label>Matricula TEC</label>
        <input
          type="text"
          value={matriculaTEC}
          onChange={(e) => setMatriculaTEC(e.target.value)}
          required
        />
        <button type="submit">Update Matricula TEC</button>
      </form>
    </div>
  );
}

export default Settings;
