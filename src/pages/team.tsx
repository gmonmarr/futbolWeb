import * as React from 'react';
import { auth } from '../firebase.js'; // This should now reference the auth initialized in firebase.js
import { signOut, onAuthStateChanged, User } from 'firebase/auth'; // Import specific functions from Firebase Auth
import { useNavigate } from 'react-router-dom'; // To redirect after logout
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';
import Sheet from '@mui/joy/Sheet';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'; // Use this icon for the avatar
import Stack from '@mui/joy/Stack';  // Import Stack component
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css'; // Import the CSS file

interface Person {
  name: string;
  lastName: string;
  matricula: string;
  category: string;
}

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate(); // To redirect user after logout
  const [peopleData, setPeopleData] = React.useState<Person[]>([]); // Dynamic list of people
  const [newPlayer, setNewPlayer] = React.useState<Person>({
    name: '',
    lastName: '',
    matricula: '',
    category: '',
  });
  const [showAddPlayerForm, setShowAddPlayerForm] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null); // Correctly type currentUser

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const storedPlayers = localStorage.getItem(`players_${user.uid}`);
        if (storedPlayers) {
          setPeopleData(JSON.parse(storedPlayers));
        }
      } else {
        setCurrentUser(null);
        setPeopleData([]); // Clear player data when logged out
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Save players to localStorage whenever peopleData changes and the user is logged in
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`players_${currentUser.uid}`, JSON.stringify(peopleData));
    }
  }, [peopleData, currentUser]);

  // Logout function
  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User logged out');
      navigate('/'); // Redirect to login page after logout
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.lastName && newPlayer.matricula && newPlayer.category) {
      setPeopleData([...peopleData, newPlayer]);
      setShowAddPlayerForm(false); // Hide form after adding player
      setNewPlayer({
        name: '',
        lastName: '',
        matricula: '',
        category: '',
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleDeletePlayer = (index: number) => {
    const updatedPeople = peopleData.filter((_, i) => i !== index);
    setPeopleData(updatedPeople);
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </Layout.SideDrawer>
      )}
      <Stack id="tab-bar" direction="row" className="team-tab-bar">
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          startDecorator={<PersonRoundedIcon />}
        >
          Team
        </Button>
      </Stack>
      <Layout.Root className={drawerOpen ? 'team-layout-root' : ''}>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.SidePane>
          <Box className="team-header-box">
            <Typography level="title-lg" textColor="text.secondary" component="h1">
              People
            </Typography>
            <Button startDecorator={<PersonRoundedIcon />} size="sm" onClick={() => setShowAddPlayerForm(true)}>
              Add new
            </Button>
            <Button onClick={handleLogout} variant="outlined" size="sm" color="danger">
              Logout
            </Button>
          </Box>

          {showAddPlayerForm && (
            <Box>
              <input
                type="text"
                placeholder="Player Name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newPlayer.lastName}
                onChange={(e) => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Matricula"
                value={newPlayer.matricula}
                onChange={(e) => setNewPlayer({ ...newPlayer, matricula: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                value={newPlayer.category}
                onChange={(e) => setNewPlayer({ ...newPlayer, category: e.target.value })}
              />
              <Button onClick={handleAddPlayer}>Save Player</Button>
            </Box>
          )}

          <List className="team-people-list">
            {peopleData.map((person, index) => (
              <Sheet
                key={index}
                component="li"
                variant="outlined"
                className="team-person-sheet"
              >
                <Box className="team-person-info">
                  <PersonRoundedIcon sx={{ fontSize: 40, color: 'gray' }} />
                  <div>
                    <Typography level="title-md">{person.name} {person.lastName}</Typography>
                    <Typography level="body-xs">Matricula: {person.matricula}</Typography>
                    <Typography level="body-xs">Category: {person.category}</Typography>
                  </div>
                  <Button variant="outlined" color="danger" size="sm" onClick={() => handleDeletePlayer(index)}>
                    Delete
                  </Button>
                </Box>
                <Divider className="team-divider" />
              </Sheet>
            ))}
          </List>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
