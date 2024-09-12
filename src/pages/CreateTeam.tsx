import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CssBaseline, Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'; // Usamos los componentes de @mui/material
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, collection, getDocs, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Define types for Leagues and Divisions
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
  const [teamName, setTeamName] = React.useState<string>(''); 
  const [selectedLeague, setSelectedLeague] = React.useState<string>(''); 
  const [selectedDivision, setSelectedDivision] = React.useState<string>(''); 
  const [leagues, setLeagues] = React.useState<League[]>([]); 
  const [divisions, setDivisions] = React.useState<Division[]>([]); 
  const [errorMessage, setErrorMessage] = React.useState<string>(''); 
  const [loading, setLoading] = React.useState<boolean>(false); 
  const navigate = useNavigate(); 

  // Get the current user
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

  // Fetch available leagues from Firestore
  React.useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesCollection = collection(db, 'leagues');
        const leagueSnapshot = await getDocs(leaguesCollection);
        const leagueList = leagueSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().leagueName, 
        }));
        setLeagues(leagueList); 
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  // Fetch divisions based on selected league
  React.useEffect(() => {
    const fetchDivisions = async () => {
      if (!selectedLeague) return;

      try {
        const divisionsCollection = collection(db, `leagues/${selectedLeague}/divisions`);
        const divisionSnapshot = await getDocs(divisionsCollection);
        const divisionList = divisionSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().divisionName, 
        }));
        setDivisions(divisionList); 
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    };

    fetchDivisions();
  }, [selectedLeague]);

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!teamName || !selectedLeague || !selectedDivision) {
      setErrorMessage('Please enter a team name, select a league, and a division.');
      return;
    }

    try {
      setLoading(true);

      const teamDocRef = doc(db, 'teams', teamName); 
      await setDoc(teamDocRef, {
        teamName,
        leader: currentUser?.uid,
        league: selectedLeague, 
        players: [currentUser?.uid], 
        joinRequests: [], 
      });

      const userDocRef = doc(db, 'users', currentUser?.uid as string); 
      await updateDoc(userDocRef, {
        role: 'Leader',
        teamName, 
      });

      const divisionDocRef = doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision);
      await updateDoc(divisionDocRef, {
        teams: arrayUnion(teamName), 
      });

      setErrorMessage(''); 
      setTeamName(''); 
      setSelectedLeague(''); 
      setSelectedDivision(''); 

      navigate('/team'); 
    } catch (error) {
      console.error('Error creating team or updating division:', error);
      setErrorMessage('Failed to create the team or update the division.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Layout.Root>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.SidePane>
          <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              paddingBottom: '280px',
              alignItems: 'center', 
              minHeight: '100vh', 
              backgroundColor: '#f5f5f5'
            }}
          >
            {currentUser ? (
              <Box 
                sx={{
                  mt: 3,
                  maxWidth: '500px',
                  width: '100%',
                  padding: '30px',
                  backgroundColor: 'white',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                }}
              >
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}
                >
                  Create a New Team
                </Typography>

                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select a League</InputLabel>
                  <Select
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    label="Select a League"
                    required
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {leagues.map((league) => (
                      <MenuItem key={league.id} value={league.id}>
                        {league.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedLeague && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select a Division</InputLabel>
                    <Select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      label="Select a Division"
                      required
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {divisions.map((division) => (
                        <MenuItem key={division.id} value={division.id}>
                          {division.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2, padding: '10px' }}
                  onClick={handleCreateTeam}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>

                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography 
                variant="h4" 
                color="textSecondary" 
                component="h1" 
                sx={{ textAlign: 'center' }}
              >
                No user logged in. Please log in to create a team.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </>
  );
}
