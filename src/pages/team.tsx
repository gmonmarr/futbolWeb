import * as React from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';
import Sheet from '@mui/joy/Sheet';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Stack from '@mui/joy/Stack';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css';

// Import Firestore functions
import { auth, db, doc, getDoc, updateDoc } from '../firebase'; 

interface Person {
  name: string;
  lastName: string;
  matricula: string;
  category: string;
}

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const [peopleData, setPeopleData] = React.useState<Person[]>([]); 
  const [newPlayer, setNewPlayer] = React.useState<Person>({
    name: '',
    lastName: '',
    matricula: '',
    category: '',
  });
  const [teamName, setTeamName] = React.useState<string | null>(null); 
  const [currentUser, setCurrentUser] = React.useState<User | null>(null); 
  const [showAddPlayerForm, setShowAddPlayerForm] = React.useState(false); // Para controlar el formulario

  // Obtener el estado del usuario actual y cargar los datos del equipo
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Verificar si el documento del equipo existe en Firestore
        const teamDocRef = doc(db, 'teams', user.uid);
        const teamDoc = await getDoc(teamDocRef);
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          setTeamName(teamData?.teamName || '');
          if (teamData?.players) {
            setPeopleData(teamData.players); // Cargar los jugadores si ya existen
          }
        } else {
          console.error("No se encontró el equipo para este usario");
        }
      } else {
        setCurrentUser(null);
        setPeopleData([]); 
        setTeamName(null); 
      }
    });

    return () => unsubscribe(); 
  }, []);

  // Guardar los jugadores en Firestore cuando cambien los datos
  React.useEffect(() => {
    if (currentUser && teamName) {
      const teamDocRef = doc(db, 'teams', currentUser.uid);
      updateDoc(teamDocRef, { players: peopleData });
    }
  }, [peopleData, currentUser, teamName]);

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  // Función para agregar un nuevo jugador
  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.lastName && newPlayer.matricula && newPlayer.category) {
      setPeopleData([...peopleData, newPlayer]);
      setNewPlayer({
        name: '',
        lastName: '',
        matricula: '',
        category: '',
      });
      setShowAddPlayerForm(false); // Ocultar el formulario al agregar
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Función para eliminar un jugador
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
            {/* Mostrar el nombre del equipo */}
            <Typography level="title-lg" textColor="text.secondary" component="h1">
              {teamName ? `Team: ${teamName}` : "Loading team..."}
            </Typography>
            <Button startDecorator={<PersonRoundedIcon />} size="sm" onClick={() => setShowAddPlayerForm(true)}>
              Add new Player
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
