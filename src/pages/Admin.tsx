// src/pages/Admin.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Layout from '../components_team/Layout.tsx';
import Header from '../components_team/Header.tsx';


interface Team {
  id: string;
  name: string;
}

interface League {
  id: string;
  leagueName: string;
}

interface Division {
  id: string;
  divisionName: string;
}

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    equipo1: '',
    equipo2: '',
    cancha: '',
    division: '',
    semana: '',
    estado: '',
  });
  const [leagues, setLeagues] = useState<League[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState(''); // Store the division name
  const [selectedEquipo1, setSelectedEquipo1] = useState('');
  const [selectedEquipo2, setSelectedEquipo2] = useState('');
  const [selectedHora, setSelectedHora] = useState('');
  const [selectedCancha, setSelectedCancha] = useState('');
  const [selectedSemana, setSelectedSemana] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  const navigate = useNavigate();

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

  const renderUserDetails = () => {
    if (currentUser) {
      return <Typography component="p">Authenticated User: {currentUser.email}</Typography>;
    }
    return null;
  };

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        console.log('Fetching leagues...');
        const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
        const leaguesData = leaguesSnapshot.docs.map((doc) => ({
          id: doc.id,
          leagueName: doc.data().leagueName,
        }));
        console.log('Leagues fetched:', leaguesData);
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchDivisions = async () => {
      if (!selectedLeague) return;
      try {
        console.log(`Fetching divisions for league: ${selectedLeague}`);
        const divisionsSnapshot = await getDocs(collection(db, `leagues/${selectedLeague}/divisions`));
        const divisionsData = divisionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          divisionName: doc.data().divisionName,
        }));
        console.log('Divisions fetched:', divisionsData);
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    };

    fetchDivisions();
  }, [selectedLeague]);

  useEffect(() => {
    const fetchTeamsInDivision = async () => {
      if (!selectedDivision) return;

      try {
        console.log(`Fetching teams for division: ${selectedDivision}`);
        const divisionDoc = await getDoc(doc(db, `leagues/${selectedLeague}/divisions`, selectedDivision));

        if (divisionDoc.exists()) {
          const divisionData = divisionDoc.data();
          const teamNames = divisionData.teams || [];

          const fetchedTeams: Team[] = []; // Explicitly define the type as Team[]
          for (let teamName of teamNames) {
            const teamDoc = await getDoc(doc(db, 'teams', teamName));
            if (teamDoc.exists()) {
              fetchedTeams.push({ id: teamName, name: teamDoc.data().teamName });
            }
          }

          setTeams(fetchedTeams);
          setSelectedDivisionName(divisionData.divisionName); // Store divisionName
          console.log('Teams fetched:', fetchedTeams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeamsInDivision();
  }, [selectedDivision, selectedLeague]);

  useEffect(() => {
    if (userRole && userRole !== 'Admin') {
      console.log('User role:', userRole);
      alert('Access denied. Only administrators can access this page.');
      navigate('/');
    }
  }, [userRole, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeague || !selectedEquipo1 || !selectedEquipo2 || !selectedHora || !selectedCancha || !selectedDivision || !selectedSemana || !selectedEstado) {
      alert('Please select all required fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'partidos'), {
        fecha: formData.fecha,
        hora: selectedHora,
        equipo1: selectedEquipo1,
        equipo2: selectedEquipo2,
        cancha: selectedCancha,
        division: selectedDivisionName, // Use the division name here
        liga: selectedLeague,
        semana: selectedSemana,
        estado: selectedEstado,
      });
      alert('Match added successfully.');
      setFormData({ fecha: '', hora: '', equipo1: '', equipo2: '', cancha: '', division: '', semana: '', estado: '' });
      setSelectedLeague('');
      setSelectedEquipo1('');
      setSelectedEquipo2('');
      setSelectedHora('');
      setSelectedCancha('');
      setSelectedDivision('');
      setSelectedSemana('');
      setSelectedEstado('');
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Error adding match. Please try again.');
    }
  };

  return (
    <Layout.Root>
      <Layout.Header>
        <Header />
      </Layout.Header>

      <Layout.SideNav>
      </Layout.SideNav>

      <Layout.Main>
        <Box sx={{ padding: 4 }}>
          {userRole === 'Admin' && (
            <>
              <Typography component="h1" level="h4" gutterBottom>
                Admin - Agregar Partido
              </Typography>
              
              {renderUserDetails()}

              <form onSubmit={handleSubmit}>
                {/* Date */}
                <Box sx={{ marginBottom: 2 }}>
                  <TextField
                    label="Fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Box>

                {/* Time */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Hora:</Typography>
                  <select
                    value={selectedHora}
                    onChange={(e) => setSelectedHora(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Hora</option>
                    <option value="17:30">17:30</option>
                    <option value="18:30">18:30</option>
                    <option value="19:30">19:30</option>
                    <option value="20:30">20:30</option>
                  </select>
                </Box>

                {/* League */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Liga:</Typography>
                  <select
                    value={selectedLeague}
                    onChange={(e) => {
                      setSelectedLeague(e.target.value);
                      setSelectedDivision(''); 
                      setDivisions([]); 
                      setTeams([]); 
                    }}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona una Liga</option>
                    {leagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.leagueName}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Division */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Seleciona División:</Typography>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona una División</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.divisionName}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Home Team */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Seleciona Equipo Local:</Typography>
                  <select
                    value={selectedEquipo1}
                    onChange={(e) => setSelectedEquipo1(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Equipo</option>
                    {teams
                      .filter((team) => team.id !== selectedEquipo2) // Exclude the away team
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </Box>

                {/* Away Team */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Seleciona Equipo Visitante:</Typography>
                  <select
                    value={selectedEquipo2}
                    onChange={(e) => setSelectedEquipo2(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Equipo</option>
                    {teams
                      .filter((team) => team.id !== selectedEquipo1) // Exclude the home team
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </Box>

                {/* Field */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Cancha:</Typography>
                  <select
                    value={selectedCancha}
                    onChange={(e) => setSelectedCancha(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Cancha</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="2">3</option>
                    <option value="2">4</option>
                  </select>
                </Box>

                {/* Week */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Semana:</Typography>
                  <select
                    value={selectedSemana}
                    onChange={(e) => setSelectedSemana(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Semana</option>
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i + 1} value={`Semana ${i + 1}`}>{`Semana ${i + 1}`}</option>
                    ))}
                  </select>
                </Box>

                {/* Match Status */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography component="p">Estado:</Typography>
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                  >
                    <option value="">Seleciona Estado</option>
                    <option value="Played">Jugado</option>
                    <option value="Canceled">Cancelado</option>
                    <option value="Rescheduled">Reprogramado</option>
                    <option value="To Be Played">Por Jugar</option>
                  </select>
                </Box>

                <Button variant="contained" color="primary" type="submit">
                  Agregar Partido
                </Button>
              </form>
            </>
          )}
        </Box>
        </Layout.Main>
    </Layout.Root>
  );
};

export default Admin;
