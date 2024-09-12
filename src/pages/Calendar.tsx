// src/pages/Calendar.tsx

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import ListDivider from '@mui/joy/ListDivider';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';

// Define un tipo para las filas
interface Partido {
  id: string;
  fecha: string;
  hora: string;
  equipo1: string;
  equipo2: string;
  cancha: string;
  division: string;
  semana: string;
  estado: string; // Nuevo campo "Estado"
}

const FixedSizeGrid = () => {
  const [open, setOpen] = React.useState(false);
  const [userData, setUserData] = React.useState<{ name: string; email: string } | null>(null);
  const [rows, setRows] = React.useState<Partido[]>([]); // Estado con el tipo Partido
  const navigate = useNavigate();

  // Fetch user data from Firestore
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as { name: string; email: string });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch data from Firestore collection 'partidos'
  React.useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'partidos'));
      const partidosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        semana: 'Semana 1', // Valor por defecto para la columna "Semana"
        estado: 'Pendiente', // Valor por defecto para la nueva columna "Estado"
      }));
      setRows(partidosData as Partido[]); // Asegurarse de que los datos sean del tipo Partido
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  const columns = [
    { field: 'fecha', headerName: 'Fecha', flex: 1 },
    { field: 'hora', headerName: 'Hora', flex: 1 },
    { field: 'equipo1', headerName: 'Local', flex: 1 },
    { field: 'equipo2', headerName: 'Visitante', flex: 1 },
    { field: 'cancha', headerName: 'Cancha', flex: 1 },
    { field: 'division', headerName: 'Division', flex: 1 },
    { field: 'semana', headerName: 'Semana', flex: 1 }, // Nueva columna "Semana"
    { field: 'estado', headerName: 'Estado', flex: 1 }, // Nueva columna "Estado"
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header component */}
      <Box sx={{ display: 'flex', flexGrow: 0, justifyContent: 'space-between', padding: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <Button
            variant="plain"
            color="neutral"
            component="a"
            href="./calendar"
            size="sm"
            sx={{ alignSelf: 'center' }}
          >
            Calendario
          </Button>
          <Button
            variant="plain"
            color="neutral"
            aria-pressed="true"
            component="a"
            href="/joy-ui/getting-started/templates/team/"
            size="sm"
            sx={{ alignSelf: 'center' }}
          >
            Equipos
          </Button>
        </Stack>

        <Box sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <Drawer
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            open={open}
            onClose={() => setOpen(false)}
          >
            <ModalClose />
            <DialogTitle>Acme Co.</DialogTitle>
            <Box sx={{ px: 1 }}>
              {/* TeamNav component should be placed here if needed */}
            </Box>
          </Drawer>
        </Box>

        <Dropdown>
          <MenuButton
            variant="plain"
            size="sm"
            sx={{ maxWidth: '32px', maxHeight: '32px', borderRadius: '9999999px' }}
          >
            <Avatar
              src="https://i.pravatar.cc/40?img=2"
              srcSet="https://i.pravatar.cc/80?img=2"
              sx={{ maxWidth: '32px', maxHeight: '32px' }}
            />
          </MenuButton>

          <Menu
            placement="bottom-end"
            size="sm"
            sx={{
              zIndex: '99999',
              p: 1,
              gap: 1,
              '--ListItem-radius': 'var(--joy-radius-sm)',
            }}
          >
            {userData && (
              <MenuItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src="https://i.pravatar.cc/40?img=2"
                    srcSet="https://i.pravatar.cc/80?img=2"
                    sx={{ borderRadius: '50%' }}
                  />
                  <Box sx={{ ml: 1.5 }}>
                    <Typography level="title-sm" textColor="text.primary">
                      {userData.name}
                    </Typography>
                    <Typography level="body-xs" textColor="text.tertiary">
                      {userData.email}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            )}

            <ListDivider />

            <MenuItem>
              <HelpRoundedIcon />
              Help
            </MenuItem>

            <MenuItem onClick={() => navigate('/settings')}>
              <SettingsRoundedIcon />
              Settings
            </MenuItem>

            <ListDivider />

            <MenuItem onClick={handleLogout}>
              <LogoutRoundedIcon />
              Log out
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>

      {/* Calendar DataGrid */}
      <Box sx={{ width: '100%', padding: '16px', flexGrow: 1 }}>
        <Box sx={{ height: 600, width: '98%' }}>
          <DataGrid 
            rows={rows} 
            columns={columns} 
            sx={{ overflowY: 'auto' }} // Scroll vertical para ver todos los partidos
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FixedSizeGrid;
