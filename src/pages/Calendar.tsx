import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import Header from '../components_team/Header.tsx';  // Importa el Header

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
  const [userData, setUserData] = React.useState<{ name: string; email: string; role: string } | null>(null);
  const [rows, setRows] = React.useState<Partido[]>([]); // Estado con el tipo Partido
  const [selectedDivision, setSelectedDivision] = React.useState(''); // División seleccionada
  const [selectedSemana, setSelectedSemana] = React.useState(''); // Semana seleccionada
  const [editingState, setEditingState] = React.useState<{ id: string; estado: string } | null>(null); // Estado de edición
  const navigate = useNavigate();

  // Fetch user data from Firestore
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as { name: string; email: string; role: string });
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
      }));
      setRows(partidosData as Partido[]); // Asegurarse de que los datos sean del tipo Partido
    };

    fetchData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  // Filtrar filas según la división y la semana seleccionadas
  const filteredRows = rows.filter((row) => {
    return (
      (selectedDivision ? row.division === selectedDivision : true) &&
      (selectedSemana ? row.semana === selectedSemana : true)
    );
  });

  // Manejar el cambio de estado
  const handleChangeEstado = async (id: string, newEstado: string) => {
    try {
      const partidoRef = doc(db, 'partidos', id);
      await updateDoc(partidoRef, { estado: newEstado });
      setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, estado: newEstado } : row)));
      setEditingState(null); // Salir del modo de edición
    } catch (error) {
      console.error('Error updating estado:', error);
    }
  };

  const columns = [
    { field: 'fecha', headerName: 'Fecha', flex: 1 },
    { field: 'hora', headerName: 'Hora', flex: 1 },
    { field: 'equipo1', headerName: 'Local', flex: 1 },
    { field: 'equipo2', headerName: 'Visitante', flex: 1 },
    { field: 'cancha', headerName: 'Cancha', flex: 1 },
    { field: 'division', headerName: 'Division', flex: 1 },
    { field: 'semana', headerName: 'Semana', flex: 1 },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id;
        const isAdmin = userData?.role === 'Admin';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingY: '12px' }}>
            {isEditing ? (
              <select
                value={editingState?.estado || ''}
                onChange={(e) => setEditingState({ id: params.row.id, estado: e.target.value })}
                onBlur={() => handleChangeEstado(params.row.id, editingState?.estado || '')}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="Jugado">Jugado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Reprogramado">Reprogramado</option>
                <option value="Por Jugar">Por Jugar</option>
              </select>
            ) : (
              <>
                <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
                {isAdmin && (
                  <EditIcon
                    onClick={() => setEditingState({ id: params.row.id, estado: params.value })}
                    sx={{
                      fontSize: '1rem', // Hacer el ícono más pequeño
                      color: 'gray',
                      cursor: 'pointer',
                      marginLeft: '8px', // Moverlo hacia la derecha del texto
                    }}
                  />
                )}
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Header /> {/* El header va fuera del Box para que no afecte el tamaño */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
        {/* Dropdowns for filtering */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', width: '100%' }}>
          <Box sx={{ minWidth: '200px' }}>
            <Typography component="p">Selecciona la División:</Typography>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="">Todas las Divisiones</option>
              <option value="Varonil 1 Fuerza">Varonil 1 Fuerza</option>
              <option value="Varonil 2 Fuerza">Varonil 2 Fuerza</option>
              <option value="Feminil Unica">Feminil Unica</option>
            </select>
          </Box>
  
          <Box sx={{ minWidth: '200px' }}>
            <Typography component="p">Selecciona la Semana:</Typography>
            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              style={{ width: '85%', padding: '10px' }}
            >
              <option value="">Todas las Semanas</option>
              {Array.from({ length: 18 }, (_, i) => (
                <option key={i + 1} value={`Semana ${i + 1}`}>{`Semana ${i + 1}`}</option>
              ))}
            </select>
          </Box>
        </Box>
  
        {/* Calendar DataGrid */}
        <Box sx={{ flexGrow: 1, padding: '16px', width: '100%' }}>
          <Box sx={{ height: 600, width: '97.5%' }}>
            <DataGrid rows={filteredRows} columns={columns} sx={{ overflowY: 'auto' }} />
          </Box>
        </Box>
      </Box>
    </>
  );
}  

export default FixedSizeGrid;
