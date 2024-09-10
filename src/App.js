// src/App.js
import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState(false); // Track if it's a new user registering

  // Handle Google Sign-in
  // prueba de git
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Email/Password Sign-in
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      if (newUser) {
        // Create a new account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      } else {
        // Sign in with existing account
        const result = await signInWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  return (
    <div className="App">
      <h1>React Firebase Auth with Google and Email/Password</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.displayName || user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleGoogleLogin}>Login with Google</button>
          <h3>Or Sign in with Email and Password</h3>
          <form onSubmit={handleEmailLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{newUser ? "Sign Up" : "Login"}</button>
          </form>
          <button onClick={() => setNewUser(!newUser)}>
            {newUser ? "Already have an account? Login" : "Create a new account"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
