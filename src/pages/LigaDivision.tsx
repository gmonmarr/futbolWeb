// src/pages/LigaDivision.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface League {
  id: string;
  leagueName: string;
}

interface Division {
  id: string;
  divisionName: string;
}

const LigaDivision: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]); // Store the leagues
  const [selectedLeague, setSelectedLeague] = useState<string>(''); // Store the selected league ID
  const [newLeagueName, setNewLeagueName] = useState<string>(''); // Input for new league
  const [newDivisionName, setNewDivisionName] = useState<string>(''); // Input for new division
  const [divisions, setDivisions] = useState<Division[]>([]); // Store the divisions

  const navigate = useNavigate();

  // Check authentication and user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setUserRole(userData?.role ?? null);
        } else {
          console.log('No user data found.');
        }
      } else {
        setCurrentUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch existing leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
        const leaguesData = leaguesSnapshot.docs.map((doc) => ({
          id: doc.id,
          leagueName: doc.data().leagueName,
        }));
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  // Fetch divisions based on the selected league
  useEffect(() => {
    if (!selectedLeague) return;

    const fetchDivisions = async () => {
      try {
        const divisionsSnapshot = await getDocs(collection(db, `leagues/${selectedLeague}/divisions`));
        const divisionsData = divisionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          divisionName: doc.data().divisionName,
        }));
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    };

    fetchDivisions();
  }, [selectedLeague]);

  // Handle creating a new league
  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName) {
      alert('Please enter a league name.');
      return;
    }

    try {
      await addDoc(collection(db, 'leagues'), {
        leagueName: newLeagueName,
        createdBy: currentUser?.email || 'Admin',
        createdAt: serverTimestamp(),
      });

      alert('League created successfully.');
      setNewLeagueName('');
      // Refresh the league list after creating a new league
      const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
      const leaguesData = leaguesSnapshot.docs.map((doc) => ({
        id: doc.id,
        leagueName: doc.data().leagueName,
      }));
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Error creating league. Please try again.');
    }
  };

  // Handle creating a new division under the selected league
  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivisionName || !selectedLeague) {
      alert('Please select a league and enter a division name.');
      return;
    }

    try {
      await addDoc(collection(db, `leagues/${selectedLeague}/divisions`), {
        divisionName: newDivisionName,
        createdAt: serverTimestamp(),
      });

      alert('Division created successfully.');
      setNewDivisionName('');
      // Refresh the division list after creating a new division
      const divisionsSnapshot = await getDocs(collection(db, `leagues/${selectedLeague}/divisions`));
      const divisionsData = divisionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        divisionName: doc.data().divisionName,
      }));
      setDivisions(divisionsData);
    } catch (error) {
      console.error('Error creating division:', error);
      alert('Error creating division. Please try again.');
    }
  };

  // Ensure that only admins can access this page
  useEffect(() => {
    if (userRole && userRole !== 'Admin') {
      console.log('User role:', userRole);
      alert('Access denied. Only administrators can access this page.');
      navigate('/');
    }
  }, [userRole, navigate]);

  return (
    <Box sx={{ padding: 4 }}>
      {userRole === 'Admin' && (
        <>
          <Typography component="h1" level="h4" gutterBottom>
            Admin - Create League and Division
          </Typography>

          {/* Create a new league */}
          <form onSubmit={handleCreateLeague}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="New League Name"
                name="leagueName"
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                fullWidth
                required
              />
            </Box>
            <Button variant="contained" color="primary" type="submit">
              Create League
            </Button>
          </form>

          {/* Select a league and create a new division */}
          <Box sx={{ marginTop: 4 }}>
            <Typography component="h2" level="h5" gutterBottom>
              Add Division to a League
            </Typography>
            <form onSubmit={handleCreateDivision}>
              <Box sx={{ marginBottom: 2 }}>
                <Typography component="p">Select League:</Typography>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                >
                  <option value="">Select a League</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.leagueName}
                    </option>
                  ))}
                </select>
              </Box>

              <Box sx={{ marginBottom: 2 }}>
                <TextField
                  label="New Division Name"
                  name="divisionName"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  fullWidth
                  required
                />
              </Box>

              <Button variant="contained" color="primary" type="submit">
                Create Division
              </Button>
            </form>

            {/* Display divisions under the selected league */}
            {selectedLeague && (
              <Box sx={{ marginTop: 4 }}>
                <Typography component="h2" level="h5" gutterBottom>
                  Divisions in {leagues.find((league) => league.id === selectedLeague)?.leagueName}
                </Typography>
                {divisions.length > 0 ? (
                  divisions.map((division) => (
                    <Typography key={division.id} component="p">
                      {division.divisionName}
                    </Typography>
                  ))
                ) : (
                  <Typography component="p">No divisions available.</Typography>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default LigaDivision;
