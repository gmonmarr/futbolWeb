import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Rol del usuario

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('Usuario autenticado:', currentUser);

        try {
          // Obtiene los datos del usuario en Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Datos del usuario en Firestore:', userData);

            // Verifica el rol del usuario
            if (userData.role === 'Admin') {
              console.log('El usuario es un administrador.');
              setUser(currentUser); // Solo establece el usuario si es admin
              setRole(userData.role); // Asigna el rol
            } else {
              console.log('El usuario no es un administrador. Rol actual:', userData.role);
            }
          } else {
            console.log('No se encontró el documento del usuario en Firestore.');
          }
        } catch (error) {
          console.error('Error obteniendo el documento del usuario:', error);
        }
      } else {
        console.log('No hay usuario autenticado.');
      }

      setLoading(false); // Se termina de cargar
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Muestra "Loading..." mientras se obtienen los datos del usuario
    return <div>Loading...</div>;
  }

  if (!user || role !== 'Admin') {
    // Verifica si no hay usuario autenticado o el rol no es 'Admin'
    return (
      <div>
        <h1>Acceso denegado. Solo los administradores pueden acceder a esta página.</h1>
        <button onClick={() => alert('Acceso denegado. Solo los administradores pueden acceder a esta página.')}>OK</button>
        <Navigate to="/login" />
      </div>
    );
  }

  // Si el usuario tiene el rol "Admin", renderiza los children (contenido protegido)
  return children;
};

export default ProtectedRoute;
