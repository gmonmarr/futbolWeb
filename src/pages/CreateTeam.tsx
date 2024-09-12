// src/pages/CreateTeam.tsx

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css';
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, collection, getDocs, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Define los tipos para las ligas y divisiones
interface League {
  id: string;
  name: string;
}

interface Division {
  id: string;
  name: string;
}

export default function CreateTeam() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [teamName, setTeamName] = React.useState<string>(''); // Estado para el nombre del equipo
  const [selectedLeague, setSelectedLeague] = React.useState<string>(''); // Estado para la liga seleccionada
  const [selectedDivision, setSelectedDivision] = React.useState<string>(''); // Estado para la división seleccionada
  const [leagues, setLeagues] = React.useState<League[]>([]); // Estado para almacenar las ligas
  const [divisions, setDivisions] = React.useState<Division[]>([]); // Estado para almacenar las divisiones
  const [errorMessage, setErrorMessage] = React.useState<string>(''); // Estado para mensajes de error
  const [loading, setLoading] = React.useState<boolean>(false); // Estado para manejar el estado de carga
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el usuario actual
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login'); // Redirige a la página de login si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Obtener las ligas disponibles de Firestore
  React.useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesCollection = collection(db, 'leagues');
        const leagueSnapshot = await getDocs(leaguesCollection);
        const leagueList = leagueSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().leagueName, // Asegurando que 'leagueName' es el campo en Firestore
        }));
        setLeagues(leagueList); // Establecer la lista de ligas
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  // Obtener las divisiones según la liga seleccionada
  React.useEffect(() => {
    const fetchDivisions = async () => {
      if (!selectedLeague) return;

      try {
        const divisionsCollection = collection(db, `leagues/${selectedLeague}/divisions`);
        const divisionSnapshot = await getDocs(divisionsCollection);
        const divisionList = divisionSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().divisionName, // Asegurando que 'divisionName' es el campo en Firestore
        }));
        setDivisions(divisionList); // Establecer la lista de divisiones para la liga seleccionada
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    };

    fetchDivisions();
  }, [selectedLeague]);

  // Manejar la creación del equipo
  const handleCreateTeam = async () => {
    if (!teamName || !selectedLeague || !selectedDivision) {
      setErrorMessage('Please enter a team name, select a league, and a division.');
      return;
    }

    try {
      setLoading(true);

      // Crear un nuevo equipo en Firestore
      const teamDocRef = doc(db, 'teams', teamName); // Aquí te aseguras que `teamName` sea siempre un string
      await setDoc(teamDocRef, {
        teamName: teamName,
        leader: currentUser?.uid,
        league: selectedLeague, // Almacenar la liga seleccionada
        players: [currentUser?.uid], // El líder es automáticamente parte del array de jugadores
        joinRequests: [], // Array vacío para solicitudes de unión
      });

      // Actualizar el rol del usuario a 'Leader'
      const userDocRef = doc(db, 'users', currentUser?.uid as string); // Aseguramos que `uid` no sea undefined
      await updateDoc(userDocRef, {
        role: 'Leader',
        teamName: teamName, // Guardar el nombre del equipo bajo el usuario
      });

      // Agregar el nuevo equipo al array de equipos de la división
      const divisionDocRef = doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision);
      await updateDoc(divisionDocRef, {
        teams: arrayUnion(teamName), // Agregar el nombre del equipo al array de equipos de la división
      });

      setErrorMessage(''); // Limpiar mensajes de error
      setTeamName(''); // Limpiar el campo del nombre del equipo
      setSelectedLeague(''); // Limpiar la liga seleccionada
      setSelectedDivision(''); // Limpiar la división seleccionada

      navigate('/team'); // Redirigir a la página del equipo después de la creación
    } catch (error) {
      console.error('Error creating team or updating division:', error);
      setErrorMessage('Failed to create the team or update the division.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Layout.Root>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation currentPath={location.pathname} />
        </Layout.SideNav>
        <Layout.SidePane>
          <Box className="team-header-box">
            {currentUser ? (
              <Box sx={{ mt: 3 }}>
                <Typography level="title-md" component="p" sx={{ mb: 1 }}>
                  Create a new team:
                </Typography>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />

                {/* Dropdown para seleccionar una liga */}
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  required
                  style={{ marginLeft: '10px', marginBottom: '10px' }}
                >
                  <option value="">Select a league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>

                {/* Dropdown para seleccionar una división */}
                {selectedLeague && (
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    required
                    style={{ marginLeft: '10px', marginBottom: '10px' }}
                  >
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                )}

                <Button
                  component="button"
                  size="sm"
                  sx={{ ml: 2 }}
                  onClick={handleCreateTeam}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>
                {errorMessage && (
                  <Typography level="body-md" sx={{ color: 'red', mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to create a team.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
