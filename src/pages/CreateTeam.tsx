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
import { doc, setDoc, updateDoc, collection, getDocs, arrayUnion, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function CreateTeam() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [teamName, setTeamName] = React.useState(''); // State to handle team name input
  const [selectedLeague, setSelectedLeague] = React.useState(''); // State for selected league
  const [leagues, setLeagues] = React.useState([]); // State to store available leagues
  const [errorMessage, setErrorMessage] = React.useState(''); // Error message state
  const [loading, setLoading] = React.useState(false); // Loading state
  const navigate = useNavigate();
  const location = useLocation();

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
          name: doc.data().leagueName, // Assuming 'leagueName' is the field in Firestore
        }));
        setLeagues(leagueList); // Set the list of leagues
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  // Check if the user is already part of any team in the selected league
  const isUserInLeagueTeam = async (selectedLeagueId: string) => {
    try {
      const leagueDocRef = doc(db, 'leagues', selectedLeagueId);
      const leagueDoc = await getDoc(leagueDocRef);

      if (leagueDoc.exists()) {
        const leagueData = leagueDoc.data();
        const teamIds = leagueData.teams || [];

        for (let teamId of teamIds) {
          const teamDocRef = doc(db, 'teams', teamId);
          const teamDoc = await getDoc(teamDocRef);

          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            if (teamData.players.includes(currentUser?.uid)) {
              return true; // User is already part of a team in this league
            }
          }
        }
      }

      return false; // User is not part of any team in this league
    } catch (error) {
      console.error('Error checking user team membership:', error);
      return false; // Default to false on error
    }
  };

  // Handle creating a team
  const handleCreateTeam = async () => {
    if (!teamName || !selectedLeague) {
      setErrorMessage('Please enter a team name and select a league.');
      return;
    }

    try {
      setLoading(true);

      // Check if the user is already part of a team in the selected league
      const userInLeagueTeam = await isUserInLeagueTeam(selectedLeague);
      if (userInLeagueTeam) {
        setErrorMessage('You are already part of a team in this league.');
        setLoading(false);
        return;
      }

      // Create a new team in Firestore
      const teamDocRef = doc(db, 'teams', teamName);
      await setDoc(teamDocRef, {
        teamName: teamName,
        leader: currentUser?.uid,
        league: selectedLeague, // Store the selected league
        players: [currentUser?.uid], // Leader is automatically part of the players array
        joinRequests: [], // Empty array for join requests
      });

      // Update the user's role to Leader
      const userDocRef = doc(db, 'users', currentUser?.uid);
      await updateDoc(userDocRef, {
        role: 'Leader',
        teamName: teamName, // Save the team name under the user
      });

      // Refresh the user's token to ensure the role is propagated
      await currentUser?.getIdToken(true);

      // Add the new team to the league's document
      const leagueDocRef = doc(db, 'leagues', selectedLeague);
      await updateDoc(leagueDocRef, {
        teams: arrayUnion(teamDocRef.id), // Add the team ID to the league's team array
      });

      setErrorMessage(''); // Clear any error messages
      setTeamName(''); // Clear the team name input
      setSelectedLeague(''); // Clear selected league

      navigate('/team'); // Redirect to the team page after creation
    } catch (error) {
      console.error('Error creating team or updating league:', error);
      setErrorMessage('Failed to create the team or update the league.');
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

                <Button
                  variant="contained"
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
