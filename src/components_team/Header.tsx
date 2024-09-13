// src/components_team/Header.tsx

import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'; // Importa el ícono de Persona
import TeamNav from './Navigation.tsx';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom'; // Importa useLocation para obtener la ruta actual
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  name: string;
  email: string;
}

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual

  // Fetch user data from Firestore
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUserData(userData);
          setUserRole(userDoc.data().role); // Obtiene el rol del usuario
        }
      }
    });

    return () => unsubscribe();
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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between' }}>
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
        {userRole !== 'Admin' && (
          <Button
            variant="plain"
            color="neutral"
            aria-pressed={location.pathname === '/team'} // Verifica si la ruta actual es /team
            component="a"
            href="./team"
            size="sm"
            sx={{ alignSelf: 'center' }}
          >
            Equipos
          </Button>
        )}
        <Button
          variant="plain"
          color="neutral"
          component="a"
          href="/joy-ui/getting-started/templates/files/"
          size="sm"
          sx={{ alignSelf: 'center' }}
        >
          Tabla de Posición
        </Button>
        {userRole === 'Admin' && (
          <>
            <Button
              variant="plain"
              color="primary"
              onClick={() => navigate('/admin')}
              sx={{ alignSelf: 'center' }}
            >
              Add Match
            </Button>
            <Button
              variant="plain"
              color="primary"
              onClick={() => navigate('/liga-division')}
              sx={{ alignSelf: 'center' }}
            >
              Add League/Division
            </Button>
          </>
        )}
      </Stack>

      <Box sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <IconButton variant="plain" color="neutral" onClick={() => setOpen(true)}>
          <MenuRoundedIcon />
        </IconButton>
        <Drawer
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalClose />
          <DialogTitle>Acme Co.</DialogTitle>
          <Box sx={{ px: 1 }}>
            <TeamNav />
          </Box>
        </Drawer>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          sx={{ display: { xs: 'inline-flex', sm: 'none' }, alignSelf: 'center' }}
        >
          <SearchRoundedIcon />
        </IconButton>

        {userData ? (
          <Dropdown>
            <MenuButton
              variant="plain"
              size="sm"
              sx={{ maxWidth: '32px', maxHeight: '32px', borderRadius: '9999999px' }}
            >
              <Avatar
                sx={{
                  maxWidth: '32px',
                  maxHeight: '32px',
                  backgroundColor: 'primary.main',
                }}
              >
                <PersonRoundedIcon />
              </Avatar>
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
              <MenuItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    <PersonRoundedIcon />
                  </Avatar>
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
        ) : (
          <Button variant="outlined" onClick={handleLogin}>
            Log In
          </Button>
        )}
      </Box>
    </Box>
  );
}
