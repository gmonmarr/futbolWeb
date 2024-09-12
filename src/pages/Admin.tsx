// src/pages/Admin.tsx

// version pasada
// import * as React from 'react';
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { auth, db } from '../firebase';
// import { collection, addDoc, getDocs } from 'firebase/firestore'; // getDocs para obtener equipos
// import { doc, getDoc } from 'firebase/firestore';
// import Box from '@mui/joy/Box';
// import Typography from '@mui/joy/Typography';
// // Cambiar a Button de Material UI
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';

// // Definir tipos para equipos y ligas
// interface Team {
//   id: string;
//   name: string;
// }

// interface League {
//   id: string;
//   name: string;
// }

// const Admin: React.FC = () => {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);  // Ahora se usa
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     fecha: '',
//     hora: '',
//     equipo1: '',
//     equipo2: '',
//     cancha: '',
//     division: '',
//   });
//   const [leagues, setLeagues] = useState<League[]>([]);  // Estado para las ligas con tipo
//   const [selectedLeague, setSelectedLeague] = useState('');  // Estado para la liga seleccionada
//   const [teams, setTeams] = useState<Team[]>([]); // Estado para almacenar los equipos con tipo
//   const [selectedEquipo1, setSelectedEquipo1] = useState(''); // Estado para el equipo local
//   const [selectedEquipo2, setSelectedEquipo2] = useState(''); // Estado para el equipo visitante
//   const [selectedHora, setSelectedHora] = useState(''); // Estado para la hora seleccionada
//   const [selectedCancha, setSelectedCancha] = useState(''); // Estado para la cancha seleccionada
//   const [selectedDivision, setSelectedDivision] = useState(''); // Estado para la división seleccionada

//   const navigate = useNavigate();

//   // Chequear si el usuario está autenticado y obtener su rol
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
        
//         // Obtener el rol del usuario desde Firestore
//         const userDoc = await getDoc(doc(db, 'users', user.uid));
//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           console.log('Datos del usuario:', userData);  // Agregando depuración
//           setUserRole(userData?.role ?? null);
//         } else {
//           console.log("No se encontraron datos del usuario.");
//         }
//       } else {
//         setCurrentUser(null);
//         navigate('/login');  // Redirigir si no está autenticado
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   // Usar currentUser para mostrar detalles del usuario autenticado
//   const renderUserDetails = () => {
//     if (currentUser) {
//       return (
//         <Typography component="p">
//           Usuario autenticado: {currentUser.email}
//         </Typography>
//       );
//     }
//     return null;
//   };

//   // Obtener las ligas de la base de datos
//   useEffect(() => {
//     const fetchLeagues = async () => {
//       try {
//         const leaguesSnapshot = await getDocs(collection(db, 'leagues')); // Obtener ligas de la colección 'leagues'
//         const leaguesData = leaguesSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as League[];
//         setLeagues(leaguesData);
//       } catch (error) {
//         console.error('Error obteniendo las ligas:', error);
//       }
//     };

//     const fetchTeams = async () => {
//       try {
//         const teamsSnapshot = await getDocs(collection(db, 'teams')); // Obtener equipos de la colección 'teams'
//         const teamsData = teamsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as Team[];
//         setTeams(teamsData);
//       } catch (error) {
//         console.error('Error obteniendo los equipos:', error);
//       }
//     };

//     fetchLeagues();
//     fetchTeams(); // Llamamos a la función para obtener los equipos al cargar el componente
//   }, []);

//   // Verificar que el usuario sea admin
//   useEffect(() => {
//     if (userRole && userRole !== 'Admin') {
//       console.log('Rol de usuario:', userRole);  // Agregando depuración
//       alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
//       navigate('/'); // Redirige a la página de inicio si no es admin
//     }
//   }, [userRole, navigate]);

//   // Manejar el cambio en el formulario
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Agregar partido a la base de datos
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedLeague || !selectedEquipo1 || !selectedEquipo2 || !selectedHora || !selectedCancha || !selectedDivision) {
//       alert('Por favor selecciona una liga, una hora, una cancha, una división y ambos equipos.');
//       return;
//     }
//     try {
//       await addDoc(collection(db, 'partidos'), {
//         fecha: formData.fecha,
//         hora: selectedHora, // Utiliza la hora seleccionada
//         equipo1: selectedEquipo1,
//         equipo2: selectedEquipo2,
//         cancha: selectedCancha, // Utiliza la cancha seleccionada
//         division: selectedDivision, // Utiliza la división seleccionada
//         liga: selectedLeague,  // Añadir la liga seleccionada
//       });
//       alert('Partido agregado con éxito.');
//       setFormData({ fecha: '', hora: '', equipo1: '', equipo2: '', cancha: '', division: '' });
//       setSelectedLeague(''); // Resetear la liga seleccionada
//       setSelectedEquipo1(''); // Resetear el equipo local
//       setSelectedEquipo2(''); // Resetear el equipo visitante
//       setSelectedHora(''); // Resetear la hora seleccionada
//       setSelectedCancha(''); // Resetear la cancha seleccionada
//       setSelectedDivision(''); // Resetear la división seleccionada
//     } catch (error) {
//       console.error('Error agregando partido:', error);
//       alert('Error agregando partido. Intenta de nuevo.');
//     }
//   };

//   return (
//     <Box sx={{ padding: 4 }}>
//       {userRole === 'Admin' && (
//         <>
//           <Typography component="h1" level="h4" gutterBottom>
//             Administrador - Agregar Partido
//           </Typography>
          
//           {/* Render user details */}
//           {renderUserDetails()}

//           <form onSubmit={handleSubmit}>
//             <Box sx={{ marginBottom: 2 }}>
//               <TextField
//                 label="Fecha"
//                 name="fecha"
//                 value={formData.fecha}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Box>

//             {/* Dropdown para seleccionar la hora */}
//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona la Hora:</Typography>
//               <select
//                 value={selectedHora}
//                 onChange={(e) => setSelectedHora(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione una hora</option>
//                 <option value="17:30">17:30</option>
//                 <option value="18:30">18:30</option>
//                 <option value="19:30">19:30</option>
//                 <option value="20:30">20:30</option>
//               </select>
//             </Box>

//             {/* Dropdown para seleccionar equipos */}
//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona el Equipo Local:</Typography>
//               <select
//                 value={selectedEquipo1}
//                 onChange={(e) => setSelectedEquipo1(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione un equipo</option>
//                 {teams.map((team) => (
//                   <option key={team.id} value={team.id}>
//                     {team.name ? team.name : "Equipo sin nombre"} {/* Verificación del campo 'name' */}
//                   </option>
//                 ))}
//               </select>
//             </Box>

//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona el Equipo Visitante:</Typography>
//               <select
//                 value={selectedEquipo2}
//                 onChange={(e) => setSelectedEquipo2(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione un equipo</option>
//                 {teams.map((team) => (
//                   <option key={team.id} value={team.id}>
//                     {team.name ? team.name : "Equipo sin nombre"} {/* Verificación del campo 'name' */}
//                   </option>
//                 ))}
//               </select>
//             </Box>

//             {/* Dropdown para seleccionar cancha */}
//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona la Cancha:</Typography>
//               <select
//                 value={selectedCancha}
//                 onChange={(e) => setSelectedCancha(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione una cancha</option>
//                 <option value="1">1</option>
//                 <option value="2">2</option>
//               </select>
//             </Box>

//             {/* Dropdown para seleccionar división */}
//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona la División:</Typography>
//               <select
//                 value={selectedDivision}
//                 onChange={(e) => setSelectedDivision(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione una división</option>
//                 <option value="Varonil 1 Fuerza">Varonil 1 Fuerza</option>
//                 <option value="Varonil 2 Fuerza">Varonil 2 Fuerza</option>
//                 <option value="Feminil Unica">Feminil Unica</option>
//               </select>
//             </Box>

//             {/* Dropdown para seleccionar una liga */}
//             <Box sx={{ marginBottom: 2 }}>
//               <Typography component="p">Selecciona una liga:</Typography>
//               <select
//                 value={selectedLeague}
//                 onChange={(e) => setSelectedLeague(e.target.value)}
//                 required
//                 style={{ width: '100%', padding: '8px', marginTop: '10px' }}
//               >
//                 <option value="">Seleccione una liga</option>
//                 {leagues.map((league) => (
//                   <option key={league.id} value={league.id}>
//                     {league.name ? league.name : "Liga sin nombre"} {/* Verificación del campo 'name' */}
//                   </option>
//                 ))}
//               </select>
//             </Box>

//             <Button variant="contained" color="primary" type="submit">
//               Agregar Partido
//             </Button>
//           </form>
//         </>
//       )}
//     </Box>
//   );
// };

// export default Admin;

// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------

// src/pages/Admin.tsx



import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore'; // getDocs para obtener equipos
import { doc, getDoc } from 'firebase/firestore';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Definir tipos para equipos y ligas
interface Team {
  id: string;
  name: string;
}

interface League {
  id: string;
  name: string;
}

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);  // Ahora se usa
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    equipo1: '',
    equipo2: '',
    cancha: '',
    division: '',
    semana: '', // Añadir semana en el formulario
    estado: '', // Añadir estado en el formulario
  });
  const [leagues, setLeagues] = useState<League[]>([]);  // Estado para las ligas con tipo
  const [selectedLeague, setSelectedLeague] = useState('');  // Estado para la liga seleccionada
  const [teams, setTeams] = useState<Team[]>([]); // Estado para almacenar los equipos con tipo
  const [selectedEquipo1, setSelectedEquipo1] = useState(''); // Estado para el equipo local
  const [selectedEquipo2, setSelectedEquipo2] = useState(''); // Estado para el equipo visitante
  const [selectedHora, setSelectedHora] = useState(''); // Estado para la hora seleccionada
  const [selectedCancha, setSelectedCancha] = useState(''); // Estado para la cancha seleccionada
  const [selectedDivision, setSelectedDivision] = useState(''); // Estado para la división seleccionada
  const [selectedSemana, setSelectedSemana] = useState(''); // Estado para la semana seleccionada
  const [selectedEstado, setSelectedEstado] = useState(''); // Estado para el estado del partido

  const navigate = useNavigate();

  // Chequear si el usuario está autenticado y obtener su rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Datos del usuario:', userData);  // Agregando depuración
          setUserRole(userData?.role ?? null);
        } else {
          console.log("No se encontraron datos del usuario.");
        }
      } else {
        setCurrentUser(null);
        navigate('/login');  // Redirigir si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Usar currentUser para mostrar detalles del usuario autenticado
  const renderUserDetails = () => {
    if (currentUser) {
      return (
        <Typography component="p">
          Usuario autenticado: {currentUser.email}
        </Typography>
      );
    }
    return null;
  };

  // Obtener las ligas de la base de datos
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesSnapshot = await getDocs(collection(db, 'leagues')); // Obtener ligas de la colección 'leagues'
        const leaguesData = leaguesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as League[];
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error obteniendo las ligas:', error);
      }
    };

    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'teams')); // Obtener equipos de la colección 'teams'
        const teamsData = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];
        setTeams(teamsData);
      } catch (error) {
        console.error('Error obteniendo los equipos:', error);
      }
    };

    fetchLeagues();
    fetchTeams(); // Llamamos a la función para obtener los equipos al cargar el componente
  }, []);

  // Verificar que el usuario sea admin
  useEffect(() => {
    if (userRole && userRole !== 'Admin') {
      console.log('Rol de usuario:', userRole);  // Agregando depuración
      alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
      navigate('/'); // Redirige a la página de inicio si no es admin
    }
  }, [userRole, navigate]);

  // Manejar el cambio en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Agregar partido a la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeague || !selectedEquipo1 || !selectedEquipo2 || !selectedHora || !selectedCancha || !selectedDivision || !selectedSemana || !selectedEstado) {
      alert('Por favor selecciona una liga, una hora, una cancha, una división, una semana, el estado del partido y ambos equipos.');
      return;
    }
    try {
      await addDoc(collection(db, 'partidos'), {
        fecha: formData.fecha,
        hora: selectedHora, // Utiliza la hora seleccionada
        equipo1: selectedEquipo1,
        equipo2: selectedEquipo2,
        cancha: selectedCancha, // Utiliza la cancha seleccionada
        division: selectedDivision, // Utiliza la división seleccionada
        liga: selectedLeague,  // Añadir la liga seleccionada
        semana: selectedSemana, // Añadir la semana seleccionada
        estado: selectedEstado, // Añadir el estado del partido
      });
      alert('Partido agregado con éxito.');
      setFormData({ fecha: '', hora: '', equipo1: '', equipo2: '', cancha: '', division: '', semana: '', estado: '' }); // Resetear el formulario
      setSelectedLeague(''); // Resetear la liga seleccionada
      setSelectedEquipo1(''); // Resetear el equipo local
      setSelectedEquipo2(''); // Resetear el equipo visitante
      setSelectedHora(''); // Resetear la hora seleccionada
      setSelectedCancha(''); // Resetear la cancha seleccionada
      setSelectedDivision(''); // Resetear la división seleccionada
      setSelectedSemana(''); // Resetear la semana seleccionada
      setSelectedEstado(''); // Resetear el estado del partido
    } catch (error) {
      console.error('Error agregando partido:', error);
      alert('Error agregando partido. Intenta de nuevo.');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      {userRole === 'Admin' && (
        <>
          <Typography component="h1" level="h4" gutterBottom>
            Administrador - Agregar Partido
          </Typography>
          
          {/* Render user details */}
          {renderUserDetails()}

          <form onSubmit={handleSubmit}>
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

            {/* Dropdown para seleccionar la hora */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona la Hora:</Typography>
              <select
                value={selectedHora}
                onChange={(e) => setSelectedHora(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione una hora</option>
                <option value="17:30">17:30</option>
                <option value="18:30">18:30</option>
                <option value="19:30">19:30</option>
                <option value="20:30">20:30</option>
              </select>
            </Box>

            {/* Dropdown para seleccionar equipos */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona el Equipo Local:</Typography>
              <select
                value={selectedEquipo1}
                onChange={(e) => setSelectedEquipo1(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione un equipo</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name ? team.name : "Equipo sin nombre"} {/* Verificación del campo 'name' */}
                  </option>
                ))}
              </select>
            </Box>

            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona el Equipo Visitante:</Typography>
              <select
                value={selectedEquipo2}
                onChange={(e) => setSelectedEquipo2(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione un equipo</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name ? team.name : "Equipo sin nombre"} {/* Verificación del campo 'name' */}
                  </option>
                ))}
              </select>
            </Box>

            {/* Dropdown para seleccionar cancha */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona la Cancha:</Typography>
              <select
                value={selectedCancha}
                onChange={(e) => setSelectedCancha(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione una cancha</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </Box>

            {/* Dropdown para seleccionar división */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona la División:</Typography>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione una división</option>
                <option value="Varonil 1 Fuerza">Varonil 1 Fuerza</option>
                <option value="Varonil 2 Fuerza">Varonil 2 Fuerza</option>
                <option value="Feminil Unica">Feminil Unica</option>
              </select>
            </Box>

            {/* Dropdown para seleccionar semana */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona la Semana:</Typography>
              <select
                value={selectedSemana}
                onChange={(e) => setSelectedSemana(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione una semana</option>
                {Array.from({ length: 18 }, (_, i) => (
                  <option key={i + 1} value={`Semana ${i + 1}`}>{`Semana ${i + 1}`}</option>
                ))}
              </select>
            </Box>

            {/* Dropdown para seleccionar el estado del partido */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona el Estado del Partido:</Typography>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione un estado</option>
                <option value="Jugado">Jugado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Reprogramado">Reprogramado</option>
                <option value="Por Jugar">Por Jugar</option>
              </select>
            </Box>

            {/* Dropdown para seleccionar una liga */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p">Selecciona una liga:</Typography>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              >
                <option value="">Seleccione una liga</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name ? league.name : "Liga sin nombre"} {/* Verificación del campo 'name' */}
                  </option>
                ))}
              </select>
            </Box>

            <Button variant="contained" color="primary" type="submit">
              Agregar Partido
            </Button>
          </form>
        </>
      )}
    </Box>
  );
};

export default Admin;
