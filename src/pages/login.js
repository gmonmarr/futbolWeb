// src/pages/login.js

import React, { useState, useEffect } from "react";
import { auth, googleProvider, db, doc, setDoc, getDoc } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for Name
  const [matriculaTEC, setMatriculaTEC] = useState(""); // Matricula TEC
  const [newUser, setNewUser] = useState(false); // Toggle between login and registration
  const [error, setError] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(false); // New state to track if profile is complete
  const navigate = useNavigate();

  // Handle user session state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
  
        // Verifica si el usuario ha completado su perfil (matriculaTEC)
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.matriculaTEC) {
            setIsProfileComplete(true);
            // Redirige según el rol del usuario
            if (userData.role === 'Admin') {
              navigate("/admin");
            } else {
              navigate("/team");
            }
          } else {
            setIsProfileComplete(false); // Muestra el formulario para completar el perfil
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        setError("Name is required for registration.");
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with name
      await updateProfile(result.user, {
        displayName: name, // Use provided name
      });

      // Store user info in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        matriculaTEC: matriculaTEC,
        email: email,
        role: "Player", // Default role as Player
      });

      navigate("/create-team"); // Redirect to create team after registration
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      setEmail(googleUser.email);
      setUser(googleUser);

      // Check if profile is complete
      const userDoc = await getDoc(doc(db, "users", googleUser.uid));
      if (!userDoc.exists() || !userDoc.data().matriculaTEC) {
        setIsProfileComplete(false); // Show form to complete profile
      } else {
        setIsProfileComplete(true);
        navigate("/create-team"); // Redirect to create team after Google login
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);

      // Verifica si el usuario existe y si ha completado el perfil
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.matriculaTEC) {
          // Redirige a la página de administración si el usuario es un admin
          if (userData.role === 'Admin') {
            navigate("/admin");
          } else {
            navigate("/create-team"); // Redirige a la creación de equipo si no es admin
          }
        } else {
          setIsProfileComplete(false); // Muestra el formulario para completar el perfil
        }
      } else {
        setError("User data not found");
      }
    } catch (error) {
      setError(error.message);
    }
  };


  return (
    <div className="login-container">
      <div className="login-box">
        {user && isProfileComplete ? (
          <div>
            <h2>Welcome, {user.displayName || user.email}</h2>
          </div>
        ) : (
          <>
            <h2>{newUser ? "Register" : "Login"}</h2>
            <form onSubmit={newUser ? handleRegister : handleLogin}>
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

              {/* Prompt for Name and Matricula TEC only if signing up */}
              {newUser && (
                <>
                  <input
                    type="text"
                    placeholder="Enter your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Enter your Matricula TEC"
                    value={matriculaTEC}
                    onChange={(e) => setMatriculaTEC(e.target.value)}
                    required
                  />
                </>
              )}

              <button type="submit">{newUser ? "Sign Up" : "Login"}</button>
            </form>

            <button onClick={handleGoogleLogin}>
              Login with Google
            </button>

            <p>
              {newUser ? "Already have an account?" : "Don’t have an account?"}
              <button type="button" onClick={() => setNewUser(!newUser)}>
                {newUser ? "Login" : "Register"}
              </button>
            </p>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
