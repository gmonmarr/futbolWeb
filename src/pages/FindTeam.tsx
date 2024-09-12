// src/pages/FindTeam.tsx

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
import { auth, db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Definir tipos para equipos, ligas y divisiones
interface Team {
  id: string;
  teamName: string;
  leaderName: string;
  players: string[];
  joinRequests: string[];
}

interface League {
  id: string;
  leagueName: string;
}

interface Division {
  id: string;
  divisionName: string;
}

export default function FindTeam() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [teams, setTeams] = React.useState<Team[]>([]); // Estado para almacenar equipos con el tipo correcto
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [divisions, setDivisions] = React.useState<Division[]>([]);
  const [selectedLeague, setSelectedLeague] = React.useState<string>(''); // Aseguramos que sea string
  const [selectedDivision, setSelectedDivision] = React.useState<string>(''); // Aseguramos que sea string
  const [requestedTeams, setRequestedTeams] = React.useState<string[]>([]);
  const [alreadyInTeam, setAlreadyInTeam] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>(''); // Mensajes de error
  const [loading, setLoading] = React.useState(false);
  const [hasAlreadyRequested, setHasAlreadyRequested] = React.useState(false); // Indica si ya solicitó unirse a un equipo
  const navigate = useNavigate();
  const location = useLocation(); // Para detectar la ruta actual

  // Obtener el usuario actual
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login'); // Redirigir al login si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Obtener ligas disponibles
  React.useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesCollection = collection(db, 'leagues');
        const leaguesSnapshot = await getDocs(leaguesCollection);
        const leagueList = leaguesSnapshot.docs.map((doc) => ({
          id: doc.id,
          leagueName: doc.data().leagueName,
        }));
        setLeagues(leagueList);
      } catch (error) {
        setErrorMessage('Failed to fetch leagues.');
      }
    };

    fetchLeagues();
  }, []);

  // Obtener divisiones al seleccionar una liga
  React.useEffect(() => {
    const fetchDivisions = async () => {
      if (!selectedLeague) return;

      try {
        const divisionsCollection = collection(db, `leagues/${selectedLeague}/divisions`);
        const divisionsSnapshot = await getDocs(divisionsCollection);
        const divisionList = divisionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          divisionName: doc.data().divisionName,
        }));
        setDivisions(divisionList);
      } catch (error) {
        setErrorMessage('Failed to fetch divisions.');
      }
    };

    fetchDivisions();
  }, [selectedLeague]);

  // Obtener equipos y verificar si el usuario ya solicitó unirse
  React.useEffect(() => {
    if (!selectedLeague || !selectedDivision) return;

    const fetchTeamsAndCheckMembership = async () => {
      try {
        const divisionDocRef = doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision);
        const divisionDoc = await getDoc(divisionDocRef);

        if (divisionDoc.exists()) {
          const divisionData = divisionDoc.data();
          const teamNames = divisionData.teams || [];

          const fetchedTeams: Team[] = []; // Tipado para equipos
          const requestedTeamsArray: string[] = [];
          let userInTeam = false;
          let userRequestedAnyTeam = false;

          for (let teamName of teamNames) {
            const teamDocRef = doc(db, 'teams', teamName);
            const teamDoc = await getDoc(teamDocRef);

            if (teamDoc.exists()) {
              const teamData = teamDoc.data();

              // Obtener el nombre del líder del equipo desde la colección de usuarios
              const leaderDocRef = doc(db, 'users', teamData.leader);
              const leaderDoc = await getDoc(leaderDocRef);
              const leaderName = leaderDoc.exists() ? leaderDoc.data().name : 'Unknown Leader';

              // Agregar el equipo y el nombre del líder
              fetchedTeams.push({
                id: teamName,
                teamName: teamData.teamName,
                leaderName,
                players: teamData.players,
                joinRequests: teamData.joinRequests,
              });

              // Verificar si el usuario ya solicitó unirse al equipo
              if (teamData.joinRequests && teamData.joinRequests.includes(currentUser?.uid)) {
                requestedTeamsArray.push(teamName);
                userRequestedAnyTeam = true;
              }

              // Verificar si el usuario ya está en este equipo
              if (teamData.players && teamData.players.includes(currentUser?.uid)) {
                userInTeam = true;
              }
            }
          }

          setTeams(fetchedTeams);
          setRequestedTeams(requestedTeamsArray);
          setAlreadyInTeam(userInTeam);
          setHasAlreadyRequested(userRequestedAnyTeam);
        } else {
          setErrorMessage('Division does not exist.');
        }
      } catch (error) {
        setErrorMessage('Failed to fetch teams.');
      }
    };

    fetchTeamsAndCheckMembership();
  }, [selectedLeague, selectedDivision, currentUser]);

  // Función para manejar la solicitud de unirse al equipo
  const handleJoinRequest = async (teamId: string) => {
    if (hasAlreadyRequested) {
      setErrorMessage('You have already requested to join a team.');
      return;
    }

    try {
      setLoading(true);
      const teamDocRef = doc(db, 'teams', teamId);
      await updateDoc(teamDocRef, {
        joinRequests: arrayUnion(currentUser?.uid),
      });
      setRequestedTeams((prevRequestedTeams) => [...prevRequestedTeams, teamId]);
      setHasAlreadyRequested(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to send join request.');
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
                <Typography level="title-lg" component="h1">
                  Find a Team in a League
                </Typography>

                <select
                  value={selectedLeague}
                  onChange={(e) => {
                    setSelectedLeague(e.target.value);
                    setSelectedDivision('');
                    setTeams([]);
                  }}
                  required
                  style={{ marginBottom: '10px', padding: '5px' }}
                >
                  <option value="">Select a League</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.leagueName}
                    </option>
                  ))}
                </select>

                {selectedLeague && (
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    required
                    style={{ marginBottom: '10px', padding: '5px' }}
                  >
                    <option value="">Select a Division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.divisionName}
                      </option>
                    ))}
                  </select>
                )}

                {teams.length > 0 ? (
                  teams.map((team) => (
                    <Box key={team.id} sx={{ mt: 2 }}>
                      <Typography level="title-md" component="p">
                        Team: {team.teamName}
                      </Typography>
                      <Typography level="body-md" component="p">
                        Leader: {team.leaderName}
                      </Typography>
                      <Button
                        component="button"
                        size="sm"
                        sx={{ mt: 1 }}
                        onClick={() => handleJoinRequest(team.id)}
                        disabled={loading || alreadyInTeam || requestedTeams.includes(team.id) || hasAlreadyRequested}
                      >
                        {alreadyInTeam
                          ? 'Already in a Team'
                          : requestedTeams.includes(team.id)
                          ? 'Request Sent'
                          : 'Request to Join'}
                      </Button>
                    </Box>
                  ))
                ) : selectedLeague && !teams.length ? (
                  <Typography level="body-md" sx={{ mt: 2 }}>
                    No teams available in this division.
                  </Typography>
                ) : (
                  <Typography level="body-md" sx={{ mt: 2 }}>
                    Please select a league and division to view teams.
                  </Typography>
                )}
                {errorMessage && (
                  <Typography level="body-md" sx={{ color: 'red', mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to view teams.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
