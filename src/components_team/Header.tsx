// src/components_team/Header.tsx

import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Avatar from '@mui/joy/Avatar';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Tooltip from '@mui/joy/Tooltip';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import ListDivider from '@mui/joy/ListDivider';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import TeamNav from './Navigation.tsx';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Define the shape of userData
interface UserData {
  name: string;
  email: string;
}



export default function Header() {
  const [open, setOpen] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const navigate = useNavigate();

  // Fetch user data from Firestore
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData); // Cast to UserData type
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
        <Button
          variant="plain"
          color="neutral"
          component="a"
          href="/joy-ui/getting-started/templates/files/"
          size="sm"
          sx={{ alignSelf: 'center' }}
        >
          ???
        </Button>
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
    </Box>
  );
}
