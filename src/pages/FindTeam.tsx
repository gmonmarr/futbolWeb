// src/pages/FindTeam.tsx

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { auth, db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function FindTeam() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [teams, setTeams] = React.useState<any[]>([]); // State to store teams in the selected league
  const [leagues, setLeagues] = React.useState([]); // State to store available leagues
  const [selectedLeague, setSelectedLeague] = React.useState(''); // State for selected league
  const [requestedTeams, setRequestedTeams] = React.useState<string[]>([]); // State to track requested teams
  const [alreadyInTeam, setAlreadyInTeam] = React.useState(false); // State to track if user is already in a team in the league
  const [errorMessage, setErrorMessage] = React.useState(''); // Error message state
  const [loading, setLoading] = React.useState(false); // Loading state
  const navigate = useNavigate();
  const location = useLocation(); // Use location hook to detect current route

  // Get the current user
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch available leagues from Firestore
  React.useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesCollection = collection(db, 'leagues');
        const leaguesSnapshot = await getDocs(leaguesCollection);
        const leagueList = leaguesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeagues(leagueList); // Set the list of leagues
      } catch (error) {
        console.error('Error fetching leagues:', error);
        setErrorMessage('Failed to fetch leagues.');
      }
    };

    fetchLeagues();
  }, []);

  // Fetch teams from Firestore and check if the user is already part of any team in the league
  React.useEffect(() => {
    if (!selectedLeague) return;

    const fetchTeamsAndCheckMembership = async () => {
      try {
        const leagueDocRef = doc(db, 'leagues', selectedLeague);
        const leagueDoc = await getDoc(leagueDocRef);

        if (leagueDoc.exists()) {
          const leagueData = leagueDoc.data();
          const teamIds = leagueData.teams || [];

          const fetchedTeams = [];
          const requestedTeamsArray: string[] = [];
          let userInTeam = false;

          for (let teamId of teamIds) {
            const teamDocRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamDocRef);

            if (teamDoc.exists()) {
              const teamData = teamDoc.data();

              // Fetch the leader's name from the users collection using the leader's UID
              const leaderDocRef = doc(db, 'users', teamData.leader);
              const leaderDoc = await getDoc(leaderDocRef);
              const leaderName = leaderDoc.exists() ? leaderDoc.data().name : 'Unknown Leader';

              // Add the leader's name to the team data
              fetchedTeams.push({ id: teamId, leaderName, ...teamData });

              // Check if the user has already requested to join this team
              if (teamData.joinRequests && teamData.joinRequests.includes(currentUser?.uid)) {
                requestedTeamsArray.push(teamId);
              }

              // Check if the user is already in this team
              if (teamData.players && teamData.players.includes(currentUser?.uid)) {
                userInTeam = true;
              }
            }
          }

          setTeams(fetchedTeams); // Update teams state with fetched data
          setRequestedTeams(requestedTeamsArray); // Update requested teams
          setAlreadyInTeam(userInTeam); // Set the state to true if the user is already in a team in this league
        } else {
          setErrorMessage('League does not exist.');
        }
      } catch (error) {
        console.error('Error fetching teams from league:', error);
        setErrorMessage('Failed to fetch teams.');
      }
    };

    fetchTeamsAndCheckMembership();
  }, [selectedLeague, currentUser]);

  // Handle join request
  const handleJoinRequest = async (teamId: string) => {
    try {
      setLoading(true);

      // Update the team's joinRequests array to include the current user's ID
      const teamDocRef = doc(db, 'teams', teamId);
      await updateDoc(teamDocRef, {
        joinRequests: arrayUnion(currentUser?.uid), // Add the current user's ID to join requests
      });

      // Update the state to reflect that this team was requested
      setRequestedTeams((prevRequestedTeams) => [...prevRequestedTeams, teamId]);

      setErrorMessage(''); // Clear any error messages
    } catch (error) {
      console.error('Error sending join request:', error);
      setErrorMessage('Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Layout.Root>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation currentPath={location.pathname} />
        </Layout.SideNav>
        <Layout.SidePane>
          <Box className="team-header-box">
            {currentUser ? (
              <Box sx={{ mt: 3 }}>
                <Typography level="title-lg" component="h1">
                  Find a Team in a League
                </Typography>

                {/* Dropdown for selecting a league */}
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  required
                  style={{ marginBottom: '10px', padding: '5px' }}
                >
                  <option value="">Select a League</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.leagueName}
                    </option>
                  ))}
                </select>

                {/* Display teams based on selected league */}
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <Box key={team.id} sx={{ mt: 2 }}>
                      <Typography level="title-md" component="p">
                        Team: {team.teamName}
                      </Typography>
                      <Typography level="body-md" component="p">
                        Leader: {team.leaderName} {/* Display leader's name */}
                      </Typography>
                      <Button
                        variant="contained"
                        size="sm"
                        sx={{ mt: 1 }}
                        onClick={() => handleJoinRequest(team.id)}
                        disabled={loading || alreadyInTeam || requestedTeams.includes(team.id)} // Disable if loading, already in team, or already requested
                      >
                        {alreadyInTeam
                          ? 'Already in a Team'
                          : requestedTeams.includes(team.id)
                          ? 'Request Sent'
                          : 'Request to Join'}
                      </Button>
                    </Box>
                  ))
                ) : selectedLeague && !teams.length ? (
                  <Typography level="body-md" sx={{ mt: 2 }}>
                    No teams available in this league.
                  </Typography>
                ) : (
                  <Typography level="body-md" sx={{ mt: 2 }}>
                    Please select a league to view teams.
                  </Typography>
                )}
                {errorMessage && (
                  <Typography level="body-md" sx={{ color: 'red', mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to view teams.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
