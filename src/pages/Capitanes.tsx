import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Grid from '@mui/joy/Grid';
import Input from '@mui/joy/Input';
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
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const captainsCollection = collection(db, 'users');
        const q = query(captainsCollection, where('role', '==', 'Leader'));
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

  const filteredCaptains = captains.filter(captain =>
    captain.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Box sx={{ backgroundColor: '#f0f4f8', padding: '16px', borderRadius: '8px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',  marginBottom: '24px' }}>
            <Typography level="h1" textColor="text.primary" component="h1">
              Capitanes
            </Typography>
          </Box>

          <Box sx={{ ml: 2 , mb: 4, textAlign: 'center' }}>
            <Input
              placeholder="Buscar por equipo..."
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              sx={{ width: '300px' }}
            />
          </Box>

          <Box className="team-header-box" sx={{ textAlign: 'center' }}>
            {currentUser ? (
              <>
                <Grid container spacing={2} justifyContent="flex-start">
                  {filteredCaptains.length > 0 ? (
                    filteredCaptains.map((captain) => (
                      <Grid item paddingRight={40} xs={12} sm={6} md={4} lg={3} key={captain.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            minHeight: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            maxWidth: '300px',
                            minWidth: '300px',
                            margin: '0 auto'
                            
                          }}
                        >
                        
                          <Box >
                            <Typography level="h6" component="p" sx={{ mb: 1 }}>
                              Nombre: <strong>{captain.name}</strong>
                            </Typography>
                            <Typography level="body2" component="p" sx={{ mb: 1 }}>
                              Equipo: <strong>{captain.teamName || 'No team'}</strong>
                            </Typography>
                            <Typography level="body2" component="p">
                              Correo: <strong>{captain.email}</strong>
                            </Typography>
                          </Box>
                          <Divider sx={{ mt: 2 }} />
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Typography level="body-md" textColor="text.secondary" sx={{ mt: 2 }}>
                      No se encontraron capitanes.
                    </Typography>
                  )}
                </Grid>
              </>
            ) : (
              <Typography level="h4" textColor="text.secondary" component="h1">
                No has iniciado sesión. Por favor, inicia sesión para ver la lista de capitanes.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
