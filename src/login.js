// src/login.js
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // For navigation
import "./login.css"; // Make sure you import your CSS
import Team from "./team.tsx"; // Import the Team component

function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [newUser, setNewUser] = useState(false); // Toggle between login and registration
  const [name, setName] = useState(""); // Store name if needed
  const [error, setError] = useState("");
  const [requireName, setRequireName] = useState(false); // Ask for name if needed
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Set Firebase Auth Persistence when the component mounts
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Check if a user is already logged in
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          if (!currentUser.displayName) {
            setRequireName(true); // Ask for the name if displayName is missing
          } else {
            navigate("/team"); // Redirect to Team page if already logged in
          }
        }
      })
      .catch((err) => {
        console.error("Failed to set persistence:", err.message);
      });
  }, [navigate]);

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setError("");
      navigate("/team"); // Redirect to Team page after Google sign-in
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Email/Password Sign-in or Sign-up
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (newUser) {
        // Create a new account
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in with an existing account
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(result.user);
      setError("");

      // If displayName is missing, prompt for the name
      if (!result.user.displayName) {
        setRequireName(true);
      } else {
        navigate("/team"); // Redirect to Team page
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle setting user displayName if it's missing
  const handleSetName = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      setRequireName(false);
      navigate("/team"); // Redirect to Team page after name is set
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  if (requireName) {
    // If name is required, show a form to ask for it
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Please enter your name</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button onClick={handleSetName}>Submit</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        {user ? (
          <div>
            <h2>Welcome, {user.displayName || user.email}</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <h2>Welcome</h2>
            <form onSubmit={handleEmailLogin}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="remember-forgot">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit">{newUser ? "Sign Up" : "Log In"}</button>
            </form>
            
            {/* Google login button with image */}
            <button className="google-login-btn" onClick={handleGoogleLogin}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google logo"
                className="google-logo"
              />
            </button>

            <p>
              {newUser ? (
                "Already have an account? "
              ) : (
                "Don’t have an account? "
              )}
              <a
                href="#"
                onClick={() => setNewUser(!newUser)}
              >
                {newUser ? "Login" : "Register"}
              </a>
            </p>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
