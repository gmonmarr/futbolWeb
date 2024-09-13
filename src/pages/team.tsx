import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<any>(null); // User-specific data
  const [teams, setTeams] = React.useState<any[]>([]); // Teams where the user is the leader
  const [joinRequests, setJoinRequests] = React.useState<any[]>([]); // Join requests for the selected team
  const [requestingUsers, setRequestingUsers] = React.useState<any[]>([]); // Requesting user details
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(null); // Stores selected team ID for toggling
  const [teamPlayers, setTeamPlayers] = React.useState<any[]>([]); // Players in the selected team
  const [showPlayers, setShowPlayers] = React.useState<boolean>(false); // Controls showing players

  // Get the current user and load their data and team data
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch the current user's personal data
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);

          // Fetch all teams where the user is the leader
          const teamsCollection = collection(db, 'teams');
          const q = query(teamsCollection, where('leader', '==', user.uid));
          const teamSnapshot = await getDocs(q);
          const teamsList = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTeams(teamsList); // Store teams where the user is the leader
        } else {
          console.error('User data not found');
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setTeams([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user details based on join requests UIDs for a selected team
  const fetchRequestingUsers = async (joinRequests: string[]) => {
    const userPromises = joinRequests.map(async (requestId) => {
      const userDocRef = doc(db, 'users', requestId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? { id: requestId, ...userDoc.data() } : null;
    });

    const users = await Promise.all(userPromises);
    setRequestingUsers(users.filter((user) => user !== null)); // Filter out any null users
  };

  // Handle selecting a team to view its join requests
  const handleTeamSelect = (team: any) => {
    if (selectedTeamId === team.id) {
      // If the same team is selected again, hide the join requests by resetting the state
      setSelectedTeamId(null);
      setJoinRequests([]);
      setRequestingUsers([]);
    } else {
      // If a new team is selected, fetch join requests and toggle visibility
      setSelectedTeamId(team.id);
      setJoinRequests(team.joinRequests || []); // Set join requests for the selected team
      fetchRequestingUsers(team.joinRequests || []); // Fetch user details for those requests
    }
  };

  // Handle fetching and showing team players
  const handleShowPlayers = async (teamId: string) => {
    try {
      const teamDocRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamDocRef);
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const playerPromises = teamData.players.map(async (playerId: string) => {
          const playerDocRef = doc(db, 'users', playerId);
          const playerDoc = await getDoc(playerDocRef);
          return playerDoc.exists() ? { id: playerId, ...playerDoc.data() } : null;
        });
        let players = await Promise.all(playerPromises);
        players = players.filter((player) => player !== null); // Filter out null values
        players = players.filter((player) => player.id !== currentUser?.uid); // Filter out current user
        setTeamPlayers(players);
        setShowPlayers(!showPlayers); // Toggle the display of players
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Handle removing a player from the team
  const handleRemovePlayer = async (teamId: string, playerId: string) => {
    try {
      const teamDocRef = doc(db, 'teams', teamId);

      // Remove the player from the players array
      await updateDoc(teamDocRef, {
        players: arrayRemove(playerId),
      });

      // Update local state to reflect changes
      setTeamPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

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
          {/* Show the user details */}
          <Box sx={{ backgroundColor: '#f0f4f8', padding: '16px', borderRadius: '8px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',  marginBottom: '24px' }}>
              <Typography level="h1" textColor="text.primary" component="h1">
                {userData ? `Welcome, ${userData.name || 'User'}` : 'Loading...'}
              </Typography>
          </Box>

          <Box className="team-header-box">
            {currentUser ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                  {/* Left side - Teams */}
                  <Box sx={{ width: '30%', paddingLeft: '32px' }}>
                    <Typography level="title-md" textColor="text.secondary" component="p" fontWeight={700}>
                      Teams You Lead:
                    </Typography>

                    {teams.length > 0 ? (
                      teams.map((team) => (
                        <Box key={team.id} sx={{ mt: 2, textAlign: 'left' }}>
                          <Typography level="body-md" component="p">
                            Team: {team.teamName}
                          </Typography>
                          <Button
                            variant="solid"
                            size="sm"
                            sx={{ mt: 1 }}
                            onClick={() => handleTeamSelect(team)}
                          >
                            {selectedTeamId === team.id ? 'Hide Join Requests' : 'View Join Requests'}
                          </Button>

                          {/* Button to show the list of players */}
                          <Button
                            variant="outlined"
                            size="sm"
                            sx={{ mt: 1 }}
                            onClick={() => handleShowPlayers(team.id)}
                          >
                            {showPlayers ? 'Hide Players' : 'Manage Players'}
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Typography level="body-md" textColor="text.secondary" sx={{ mt: 2 }}>
                        You are not the leader of any teams.
                      </Typography>
                    )}
                  </Box>

                  {/* Right side - Join Requests */}
                  <Box sx={{ width: '50%', paddingLeft: '32px' }}>
                    {selectedTeamId && joinRequests.length > 0 && (
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography level="title-md" textColor="text.secondary" component="p" fontWeight={700}>
                          Join Requests:
                        </Typography>

                        {requestingUsers.length > 0 ? (
                          requestingUsers.map((user) => (
                            <Box key={user.id} sx={{ mt: 1 }}>
                              <Typography level="body-md" component="p">
                                Request from: {user.name}
                              </Typography>
                              <Button variant="solid" size="sm" sx={{ mt: 1, mr: 1 }} onClick={() => handleAcceptRequest(selectedTeamId, user.id)}>
                                Accept
                              </Button>
                              <Button
                                variant="outlined"
                                size="sm"
                                sx={{ mb: 2 }}
                                onClick={() => handleDenyRequest(selectedTeamId, user.id)}
                              >
                                Deny
                              </Button>
                            </Box>
                          ))
                        ) : (
                          <Typography level="body-md" textColor="text.secondary" sx={{ mt: 2 }}>
                            No join requests.
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Show players in the selected team */}
                    {showPlayers && teamPlayers.length > 0 && (
                      <Box sx={{ textAlign: 'left', mt: 4 }}>
                        <Typography level="title-md" textColor="text.secondary" component="p" fontWeight={700}>
                          Team Players:
                        </Typography>

                        {teamPlayers.map((player) => (
                          <Box key={player.id} sx={{ mt: 1 }}>
                            <Typography level="body-md" component="p">
                              Player: {player.name}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="sm"
                              sx={{ mt: 1 }}
                              onClick={() => handleRemovePlayer(selectedTeamId!, player.id)}
                            >
                              Remove Player
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              <Typography level="title-lg" textColor="text.secondary" component="h1">
                No user logged in. Please log in to view your data.
              </Typography>
            )}
          </Box>
        </Layout.SidePane>
      </Layout.Root>
    </CssVarsProvider>
  );
}
