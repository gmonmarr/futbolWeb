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
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<any>(null); // User-specific data

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