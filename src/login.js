import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import "./login.css"; // Make sure you import your CSS

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [newUser, setNewUser] = useState(false); // Toggle between login and registration
  const [error, setError] = useState("");

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Email/Password Sign-in or Sign-up
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      if (newUser) {
        // Create a new account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      } else {
        // Sign in with an existing account
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
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google logo"
                className="google-logo"
              />
              Login with Google
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

export default App;
