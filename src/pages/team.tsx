// src/pages/team.tsx

import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css';

// Import Firebase services
import { auth, db } from '../firebase'; // Your Firebase config file
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Firestore functions

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<any>(null); // User-specific data
  const [teamName, setTeamName] = React.useState(''); // State to handle team name input
  const [errorMessage, setErrorMessage] = React.useState(''); // Error message state
  const [loading, setLoading] = React.useState(false); // Loading state

  // Get the current user and load their own data
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch the current user's personal data
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('User data not found');
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle creating a team
  const handleCreateTeam = async () => {
    if (!teamName) {
      setErrorMessage('Please enter a team name.');
      return;
    }

    try {
      setLoading(true);

      // Create a new team in Firestore
      const teamDocRef = doc(db, 'teams', teamName);
      await setDoc(teamDocRef, {
        teamName: teamName,
        leader: currentUser?.uid,
        players: [currentUser?.uid], // Leader is automatically part of the players array
        joinRequests: [], // Empty array for join requests
      });

      // Update the user's role to Leader
      const userDocRef = doc(db, 'users', currentUser?.uid);
      await updateDoc(userDocRef, {
        role: 'Leader',
        teamName: teamName, // Save the team name under the user
      });

      // Fetch updated user data
      const updatedUserDoc = await getDoc(userDocRef);
      setUserData(updatedUserDoc.data());

      setErrorMessage(''); // Clear any error messages
      setTeamName(''); // Clear the team name input
    } catch (error) {
      console.error('Error creating team: ', error);
      setErrorMessage('Failed to create the team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </Layout.SideDrawer>
      )}
      <Layout.Root className={drawerOpen ? 'team-layout-root' : ''}>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.SidePane>
          <Box className="team-header-box">
            {currentUser ? (
              <>
                {/* Show only the user's personal data */}
                <Typography level="title-lg" textColor="text.secondary" component="h1">
                  {userData ? `Welcome, ${userData.name || 'User'}` : 'Loading...'}
                </Typography>
                <Typography level="body-md" textColor="text.secondary" component="p">
                  Matricula: {userData?.matriculaTEC || 'N/A'}
                </Typography>
                <Typography level="body-md" textColor="text.secondary" component="p">
                  Email: {currentUser.email}
                </Typography>
                <Typography level="body-md" textColor="text.secondary" component="p">
                  Role: {userData?.role || 'N/A'}
                </Typography>

                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  sx={{ mt: 2 }}
                >
                  Settings
                </Button>

                {/* Form to create a new team */}
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
              </>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to view your data.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
