import React, { useState, useEffect } from "react";
import { auth, googleProvider, db, doc, setDoc, getDoc } from "../firebase";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Función para guardar los datos del equipo en Firestore
const saveTeamData = async (userId, teamName) => {
  const teamDocRef = doc(db, 'teams', userId);  // Guardamos el equipo bajo el ID del usuario
  try {
    await setDoc(teamDocRef, {
      teamName: teamName, // Guardar el nombre del equipo
      players: [],        // Inicializar la lista de jugadores vacía
    });
    console.log("Team data saved successfully");
  } catch (error) {
    console.error("Error saving team data: ", error);
  }
};

function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCaptain, setIsCaptain] = useState(false); // Para marcar si el usuario es capitán
  const [teamName, setTeamName] = useState(""); // Para el nombre del equipo
  const [newUser, setNewUser] = useState(false); // Para alternar entre login y registro
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        navigate("/team"); // Redirigir si ya está logueado
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Registrar el usuario y almacenar los datos en Firestore
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Almacenar el nombre del usuario
      await updateProfile(result.user, {
        displayName: email.split('@')[0], // Usar el nombre antes del @ como displayName
      });

      // Almacenar la información del usuario en Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        isCaptain: isCaptain,
        teamName: isCaptain ? teamName : null, // Si es capitán, guardar el nombre del equipo
        email: email,
      });

      // Si el usuario es capitán, guardar los datos del equipo en la colección `teams`
      if (isCaptain && teamName) {
        await saveTeamData(result.user.uid, teamName);  // Guardar el equipo con el UID del usuario
      }

      // Redirigir a la página de equipo
      navigate("/team");

    } catch (error) {
      setError(error.message);
    }
  };

  // Iniciar sesión con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);

      // Verificar si es capitán al iniciar sesión
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isCaptain) {
          navigate("/team");  // Redirigir a la página de equipo
        } else {
          navigate("/player-dashboard");
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {user ? (
          <div>
            <h2>Welcome, {user.displayName}</h2>
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

              {newUser && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={isCaptain}
                      onChange={() => setIsCaptain(!isCaptain)}
                    />
                    Are you a captain?
                  </label>
                  {isCaptain && (
                    <input
                      type="text"
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  )}
                </>
              )}

              <button type="submit">{newUser ? "Sign Up" : "Login"}</button>
            </form>
            <p>
              {newUser ? "Already have an account?" : "Don’t have an account?"}
              <a href="#" onClick={() => setNewUser(!newUser)}>
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
