//src/pages/FindTeam.tsx

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CssBaseline, Box, Typography, Button, Grid, Card, CardContent, TextField, Alert } from '@mui/material';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [divisions, setDivisions] = React.useState<Division[]>([]);
  const [selectedLeague, setSelectedLeague] = React.useState<string>('');
  const [selectedDivision, setSelectedDivision] = React.useState<string>('');
  const [requestedTeams, setRequestedTeams] = React.useState<string[]>([]);
  const [alreadyInTeam, setAlreadyInTeam] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [searchTerm, setSearchTerm] = React.useState<string>(''); // Search term
  const [originalTeams, setOriginalTeams] = React.useState<Team[]>([]); // Original teams list
  const [searchPerformed, setSearchPerformed] = React.useState<boolean>(false); // Track if search was performed
  const navigate = useNavigate();

  // Get current user
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch leagues
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

  // Fetch divisions when league is selected
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

  // Fetch teams and check membership
  React.useEffect(() => {
    if (!selectedLeague || !selectedDivision) return;

    const fetchTeams = async () => {
      try {
        const divisionDocRef = doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision);
        const divisionDoc = await getDoc(divisionDocRef);

        if (divisionDoc.exists()) {
          const divisionData = divisionDoc.data();
          const teamNames = divisionData.teams || [];

          const fetchedTeams: Team[] = [];
          let userInTeam = false;

          for (let teamName of teamNames) {
            const teamDocRef = doc(db, 'teams', teamName);
            const teamDoc = await getDoc(teamDocRef);

            if (teamDoc.exists()) {
              const teamData = teamDoc.data();

              const leaderDocRef = doc(db, 'users', teamData.leader);
              const leaderDoc = await getDoc(leaderDocRef);
              const leaderName = leaderDoc.exists() ? leaderDoc.data().name : 'Unknown Leader';

              fetchedTeams.push({
                id: teamName,
                teamName: teamData.teamName,
                leaderName,
                players: teamData.players,
                joinRequests: teamData.joinRequests,
              });

              if (teamData.players.includes(currentUser?.uid)) {
                userInTeam = true;
              }
            }
          }

          setTeams(fetchedTeams);
          setOriginalTeams(fetchedTeams); // Set the original teams list
          setAlreadyInTeam(userInTeam);
        } else {
          setErrorMessage('Division does not exist.');
        }
      } catch (error) {
        setErrorMessage('Failed to fetch teams.');
      }
    };

    fetchTeams();
  }, [selectedLeague, selectedDivision, currentUser]);

  // Handle search
  const handleSearch = () => {
    if (searchTerm) {
      const filteredTeams = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTeams(filteredTeams);
      setSearchPerformed(true); // Indicate that a search has been performed
    }
  };

  // Handle clearing the search
  const handleClearSearch = () => {
    setTeams(originalTeams); // Reset to the original teams list
    setSearchTerm(''); // Clear the search input
    setSearchPerformed(false); // Reset the search state
  };

  // Handle join request
  const handleJoinRequest = async (teamId: string) => {
    if (requestedTeams.includes(teamId)) {
      setErrorMessage('You have already requested to join this team.');
      return;
    }

    try {
      const teamDocRef = doc(db, 'teams', teamId);
      await updateDoc(teamDocRef, {
        joinRequests: arrayUnion(currentUser?.uid),
      });
      setRequestedTeams([...requestedTeams, teamId]);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to send join request.');
    }
  };

  return (
    <CssBaseline>
      <Layout.Root>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.SidePane>
          {/* Título arriba */}
          <Box sx={{ backgroundColor: '#f0f4f8', padding: '16px', borderRadius: '8px', 
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',  marginBottom: '24px' }}>
                <Typography component="h1" variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  Buscar Equipo en una Liga
                </Typography>
          </Box>

          <Box sx={{ mt: 3, ml: 2, width: '95%' }}>
            {/* Dropdowns in one row with space between */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <select
                value={selectedLeague}
                onChange={(e) => {
                  setSelectedLeague(e.target.value);
                  setSelectedDivision('');
                  setTeams([]);
                }}
                required
                style={{ marginBottom: '10px', padding: '5px', minWidth: '200px' }}
              >
                <option value="">Selecciona Liga</option>
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
                  style={{ marginBottom: '10px', padding: '5px', minWidth: '200px' }}
                >
                  <option value="">Selecciona División</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.divisionName}
                    </option>
                  ))}
                </select>
              )}
            </Box>

            {/* Search row */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                label="Buscar por Nombre de Equipo"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button variant="contained" color="primary" onClick={handleSearch} size="small">
                Buscar
              </Button>

              {searchPerformed && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClearSearch}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  Limpiar Busqueda
                </Button>
              )}
            </Box>

            {teams.length > 0 ? (
              <Grid container spacing={2}>
                {teams.map((team) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
                    <Card sx={{ minHeight: '140px' }}>
                      <CardContent>
                        <Typography variant="subtitle1">{team.teamName}</Typography>
                        <Typography variant="body2">Capitán: {team.leaderName}</Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 1 }}
                          onClick={() => handleJoinRequest(team.id)}
                          disabled={requestedTeams.includes(team.id) || alreadyInTeam}
                          size="small"
                        >
                          {requestedTeams.includes(team.id) ? 'Request Sent' : 'Request to Join'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No hay Equipos Disponibles en esta División.
              </Typography>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssBaseline>
  );
}
