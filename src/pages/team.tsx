// src/pages/team.tsx

import * as React from 'react';
import { auth } from '../firebase.js'; // Import Firebase authentication
import { useNavigate } from 'react-router-dom'; // To redirect after logout
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Stack from '@mui/joy/Stack';  // Import Stack component
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';
import Navigation from '../components_team/Navigation.tsx';
import './team.css'; // Import the CSS file

interface TeamData {
  Name: string;
  League: string;
}

interface Person {
  name: string;
  email: string;
  sport: string;
  avatar2x: string;
  teams: TeamData[];
  skills: string[];
}

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate(); // To redirect user after logout

  const peopleData: Person[] = [
    {
      name: 'Andrew Smith',
      email: 'andrew.smith@gmail.com',
      sport: 'Football',
      avatar2x: 'https://i.pravatar.cc/80?img=7',
      teams: [
        {
          Name: 'Manchester United',
          League: 'Premier League',
        },
        {
          Name: 'LA Galaxy',
          League: 'MLS',
        },
      ],
      skills: ['Goalkeeping', 'Tactics'],
    },
    {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      sport: 'Basketball',
      avatar2x: 'https://i.pravatar.cc/80?img=8',
      teams: [
        {
          Name: 'Los Angeles Lakers',
          League: 'NBA',
        },
        {
          Name: 'Golden State Warriors',
          League: 'NBA',
        },
      ],
      skills: ['3-point shooting', 'Defense'],
    },
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@gmail.com',
      sport: 'Tennis',
      avatar2x: 'https://i.pravatar.cc/80?img=9',
      teams: [
        {
          Name: 'Williams Tennis Academy',
          League: 'WTA',
        },
      ],
      skills: ['Serve', 'Forehand'],
    },
  ];

  // Logout function
  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log('User logged out');
      navigate('/'); // Redirect to login page after logout
    }).catch((error) => {
      console.error('Logout error:', error);
    });
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
        <Layout.SidePane> {/* Ensure this tag is properly closed */}
          <Box className="team-header-box">
            <Typography level="title-lg" textColor="text.secondary" component="h1">
              People
            </Typography>
            <Button startDecorator={<PersonRoundedIcon />} size="sm">
              Add new
            </Button>
            {/* Logout Button */}
            <Button onClick={handleLogout} variant="outlined" size="sm" color="danger">
              Logout
            </Button>
          </Box>

          <List className="team-people-list">
            {peopleData.map((person, index) => (
              <Sheet
                key={index}
                component="li"
                variant="outlined"
                className="team-person-sheet"
              >
                <Box className="team-person-info">
                  <Avatar
                    variant="outlined"
                    src={person.avatar2x}
                    srcSet={`${person.avatar2x} 2x`}
                    className="team-person-avatar"
                  />
                  <div>
                    <Typography level="title-md">{person.name}</Typography>
                    <Typography level="body-xs">{person.email}</Typography>
                    <Typography level="body-xs">Sport: {person.sport}</Typography>
                  </div>
                </Box>
                <Divider className="team-divider" />
                <List sx={{ '--ListItemDecorator-size': '40px', gap: 2 }}>
                  {person.teams.map((team, teamIndex) => (
                    <ListItem key={teamIndex} sx={{ alignItems: 'flex-start' }}>
                      <ListItemContent>
                        <Typography level="title-sm">{team.Name}</Typography>
                        <Typography level="body-xs">{team.League}</Typography>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
                <Divider className="team-divider" />
                <Typography level="title-sm">Skills:</Typography>
                <Box className="team-skill-chips">
                  {person.skills.map((skill, skillIndex) => (
                    <Chip
                      key={skillIndex}
                      variant="outlined"
                      color="neutral"
                      size="sm"
                    >
                      {skill}
                    </Chip>
                  ))}
                </Box>
              </Sheet>
            ))}
          </List>
        </Layout.SidePane> {/* Properly close the Layout.SidePane */}
      </Layout.Root>
    </CssVarsProvider>
  );
}
