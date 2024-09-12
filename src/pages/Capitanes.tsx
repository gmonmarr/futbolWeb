import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Capitanes() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [captains, setCaptains] = React.useState<any[]>([]);

  // Get the current user and load the captains data
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch captains data (leaders) from Firestore
        const captainsCollection = collection(db, 'users');
        const q = query(captainsCollection, where('role', '==', 'Leader')); // Assuming leaders have the role 'Leader'
        const captainsSnapshot = await getDocs(q);
        const captainsList = captainsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCaptains(captainsList);
      } else {
        setCurrentUser(null);
        setCaptains([]);
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
                {/* Show the list of captains */}
                <Typography level="title-lg" textColor="text.secondary" component="h1">
                  Capitanes
                </Typography>

                <Box sx={{ mt: 3, width: '100%', textAlign: 'left', paddingRight: '32px' }}>
                  {captains.length > 0 ? (
                    captains.map((captain) => (
                      <Box key={captain.id} sx={{ mt: 2, paddingLeft: '32px' }}> {/* Padding añadido */}
                        <Typography level="body-md" component="p" sx={{ mb: 1 }}>
                          Name: {captain.name}
                        </Typography>
                        <Typography level="body-md" component="p" sx={{ mb: 1 }}>
                          Team: {captain.teamName || 'No team'}
                        </Typography>
                        <Typography level="body-md" component="p" sx={{ mb: 1 }}>
                          Email: {captain.email}
                        </Typography>
                        <br/>
                      </Box>
                    ))
                  ) : (
                    <Typography level="body-md" textColor="text.secondary" sx={{ mt: 2 }}>
                      No captains found.
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to view the captains list.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
