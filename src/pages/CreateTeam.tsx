// src/pages/CreateTeam.tsx

import * as React from 'react';
import { useNavigate } from 'react-router-dom'; // Removed useLocation import
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx'; // Import Navigation
import './team.css';
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
  const [teamName, setTeamName] = React.useState<string>(''); // State for team name
  const [selectedLeague, setSelectedLeague] = React.useState<string>(''); // State for selected league
  const [selectedDivision, setSelectedDivision] = React.useState<string>(''); // State for selected division
  const [leagues, setLeagues] = React.useState<League[]>([]); // State to store leagues
  const [divisions, setDivisions] = React.useState<Division[]>([]); // State to store divisions
  const [errorMessage, setErrorMessage] = React.useState<string>(''); // State for error messages
  const [loading, setLoading] = React.useState<boolean>(false); // State for loading state
  const navigate = useNavigate(); // Removed location

  // Get the current user
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login'); // Redirect to login if not authenticated
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
          name: doc.data().leagueName, // Ensure 'leagueName' is the field in Firestore
        }));
        setLeagues(leagueList); // Set the list of leagues
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
          name: doc.data().divisionName, // Ensure 'divisionName' is the field in Firestore
        }));
        setDivisions(divisionList); // Set the list of divisions for the selected league
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

      // Create a new team in Firestore
      const teamDocRef = doc(db, 'teams', teamName); // Ensure `teamName` is always a string
      await setDoc(teamDocRef, {
        teamName: teamName,
        leader: currentUser?.uid,
        league: selectedLeague, // Store the selected league
        players: [currentUser?.uid], // Leader is automatically part of the players array
        joinRequests: [], // Empty array for join requests
      });

      // Update the user's role to 'Leader'
      const userDocRef = doc(db, 'users', currentUser?.uid as string); // Ensure `uid` is not undefined
      await updateDoc(userDocRef, {
        role: 'Leader',
        teamName: teamName, // Save the team name under the user
      });

      // Add the new team to the division's teams array
      const divisionDocRef = doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision);
      await updateDoc(divisionDocRef, {
        teams: arrayUnion(teamName), // Add the team name to the division's teams array
      });

      setErrorMessage(''); // Clear error messages
      setTeamName(''); // Clear team name input
      setSelectedLeague(''); // Clear selected league
      setSelectedDivision(''); // Clear selected division

      navigate('/team'); // Redirect to the team page after creation
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
          {/* Removed the 'currentPath' prop */}
          <Navigation />
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

                {/* Dropdown for selecting a league */}
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

                {/* Dropdown for selecting a division */}
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


