// src/components_team/Navigation.tsx

import * as React from 'react';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded'; // Icon for Create Team
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'; // Icon for Find Team
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path using useLocation

  return (
    <List
      size="sm"
      sx={{ '--ListItem-radius': 'var(--joy-radius-sm)', '--List-gap': '4px' }}
    >
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: '2px', fontWeight: '800' }}>
          Navegador
        </ListSubheader>
        <List
          aria-labelledby="nav-list-browse"
          sx={{ '& .JoyListItemButton-root': { p: '8px' } }}
        >
          <ListItem>
            <ListItemButton selected={location.pathname === '/team'} onClick={() => navigate('/team')}>
              <ListItemDecorator>
                <PeopleRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Alta/Baja de Jugadores</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={location.pathname === '/capitanes'} onClick={() => navigate('/capitanes')}>
              <ListItemDecorator sx={{ color: 'neutral.500' }}>
                <TodayRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Capitanes</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={location.pathname === '/create-team'} onClick={() => navigate('/create-team')}>
              <ListItemDecorator>
                <GroupAddRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Crear Equipo</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={location.pathname === '/find-team'} onClick={() => navigate('/find-team')}>
              <ListItemDecorator>
                <SearchRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Buscar Equipo</ListItemContent>
            </ListItemButton>
          </ListItem>

        </List>
      </ListItem>

    </List>
  );
}
