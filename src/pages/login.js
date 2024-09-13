import React, { useState, useEffect } from "react";
import { auth, db, doc, setDoc, getDoc } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './login.css'; // Assuming you will have some CSS for styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for Name
  const [matriculaTEC, setMatriculaTEC] = useState(""); // Matricula TEC
  const [newUser, setNewUser] = useState(false); // Toggle between login and registration
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to validate Matricula TEC format
  const validateMatriculaTEC = (matriculaTEC) => {
    const regex = /^A\d{8}$/; // Regex pattern for A followed by 8 digits
    return regex.test(matriculaTEC);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.matriculaTEC) {
            if (userData.role === 'Admin') {
              navigate("/admin");
            } else {
              navigate("/team");
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateMatriculaTEC(matriculaTEC)) {
      setError("Matricula TEC must follow the format A######## (A followed by 8 digits).");
      return;
    }

    try {
      if (!name) {
        setError("Name is required for registration.");
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, { displayName: name });

      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        matriculaTEC: matriculaTEC,
        email: email,
        role: "Player",
      });

      navigate("/create-team");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.matriculaTEC) {
          if (userData.role === 'Admin') {
            navigate("/admin");
          } else {
            navigate("/create-team");
          }
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
      <div className="login-card">
        <h2>{newUser ? "Crear Cuenta" : "Login"}</h2>
        <form onSubmit={newUser ? handleRegister : handleLogin}>
          <input
            type="email"
            placeholder="Ingresa tu mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Ingresa tu password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          {newUser && (
            <>
              <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="text"
                placeholder="Ingresa tu Matrícula TEC"
                value={matriculaTEC}
                onChange={(e) => setMatriculaTEC(e.target.value)}
                required
                className="input-field"
              />
            </>
          )}

          <button type="submit" className="submit-button">
            {newUser ? "Crear Cuenta" : "Login"}
          </button>
        </form>
        
        <p>
          {newUser ? "Ya tienes una cuenta?" : "No tienes una cuenta?"}
          <button type="button" onClick={() => setNewUser(!newUser)} className="toggle-button">
            {newUser ? "Login" : "Crear Cuenta"}
          </button>
        </p>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
