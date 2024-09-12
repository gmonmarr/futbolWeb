import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import TextField from '@mui/material/TextField';

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    equipo1: '',
    equipo2: '',
    cancha: '',
    division: '',
  });
  
  const navigate = useNavigate();

  // Chequear si el usuario está autenticado y obtener su rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
        } else {
          console.log("No se encontraron datos del usuario.");
        }
      } else {
        setCurrentUser(null);
        navigate('/login');  // Redirigir si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Verificar que el usuario sea admin
  useEffect(() => {
    if (userRole !== 'Admin') {
      alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
      navigate('/'); // Redirige a la página de inicio si no es admin
    }
  }, [userRole, navigate]);

  // Manejar el cambio en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Agregar partido a la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'partidos'), {
        fecha: formData.fecha,
        hora: formData.hora,
        equipo1: formData.equipo1,
        equipo2: formData.equipo2,
        cancha: formData.cancha,
        division: formData.division,
      });
      alert('Partido agregado con éxito.');
      setFormData({ fecha: '', hora: '', equipo1: '', equipo2: '', cancha: '', division: '' });
    } catch (error) {
      console.error('Error agregando partido:', error);
      alert('Error agregando partido. Intenta de nuevo.');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      {userRole === 'Admin' && (
        <>
          <Typography variant="h4" gutterBottom>
            Administrador - Agregar Partido
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Hora"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Equipo Local"
                name="equipo1"
                value={formData.equipo1}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Equipo Visitante"
                name="equipo2"
                value={formData.equipo2}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Cancha"
                name="cancha"
                value={formData.cancha}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="División"
                name="division"
                value={formData.division}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Button variant="contained" color="primary" type="submit">
              Agregar Partido
            </Button>
          </form>
        </>
      )}
    </Box>
  );
};

export default Admin;
