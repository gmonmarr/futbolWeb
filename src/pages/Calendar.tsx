// src/pages/Calendar.tsx

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { TextField, MenuItem, Select } from '@mui/material'; // Para campos editables
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import Header from '../components_team/Header.tsx';
import Layout from '../components_team/Layout.tsx';
import logo from '../assets/teclogo1.png'; 


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
  estado: string;
}

const FixedSizeGrid = () => {
  const [userData, setUserData] = React.useState<{ name: string; email: string; role: string } | null>(null);
  const [rows, setRows] = React.useState<Partido[]>([]);
  const [selectedDivision, setSelectedDivision] = React.useState('');
  const [selectedSemana, setSelectedSemana] = React.useState('');
  const [editingState, setEditingState] = React.useState<{ id: string; field: string; value: string } | null>(null);

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
      setRows(partidosData as Partido[]);
    };

    fetchData();
  }, []);

  // Filtrar filas según la división y la semana seleccionadas
  const filteredRows = rows.filter((row) => {
    return (
      (selectedDivision ? row.division === selectedDivision : true) &&
      (selectedSemana ? row.semana === selectedSemana : true)
    );
  });

  // Manejar el cambio de cualquier campo editable
  const handleChangeField = async (id: string, field: string, value: string) => {
    try {
      const partidoRef = doc(db, 'partidos', id);
      await updateDoc(partidoRef, { [field]: value });
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      );
      setEditingState(null); // Salir del modo de edición
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const columns = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'fecha';
        const isAdmin = userData?.role === 'Admin';
    
        return isEditing ? (
          <TextField
            type="text"
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { ...editingState, value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={(e) => handleChangeField(params.row.id, 'fecha', e.target.value)} // Mantiene cualquier valor, incluidos espacios
            fullWidth
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'fecha', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'hora',
      headerName: 'Hora',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'hora';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <TextField
            type="time"
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { ...editingState, value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={(e) => handleChangeField(params.row.id, 'hora', e.target.value)}
            fullWidth
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'hora', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'equipo1',
      headerName: 'Local',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'equipo1';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <TextField
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { ...editingState, value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={(e) => handleChangeField(params.row.id, 'equipo1', e.target.value)}
            fullWidth
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'equipo1', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'equipo2',
      headerName: 'Visitante',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'equipo2';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <TextField
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { ...editingState, value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={(e) => handleChangeField(params.row.id, 'equipo2', e.target.value)}
            fullWidth
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'equipo2', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'cancha',
      headerName: 'Cancha',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'cancha';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <TextField
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { ...editingState, value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={(e) => handleChangeField(params.row.id, 'cancha', e.target.value)}
            fullWidth
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'cancha', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'division',
      headerName: 'Division',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'division';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <Select
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { id: params.row.id, field: 'division', value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={() => handleChangeField(params.row.id, 'division', editingState?.value || params.value)}
            fullWidth
          >
            <MenuItem value="Varonil 1 Fuerza">Varonil 1 Fuerza</MenuItem>
            <MenuItem value="Varonil 2 Fuerza">Varonil 2 Fuerza</MenuItem>
            <MenuItem value="Feminil Unica">Feminil Unica</MenuItem>
          </Select>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'division', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'semana',
      headerName: 'Semana',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'semana';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <Select
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { id: params.row.id, field: 'semana', value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={() => handleChangeField(params.row.id, 'semana', editingState?.value || params.value)}
            fullWidth
          >
            {Array.from({ length: 18 }, (_, i) => (
              <MenuItem key={i + 1} value={`Semana ${i + 1}`}>
                {`Semana ${i + 1}`}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'semana', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params: any) => {
        const isEditing = editingState?.id === params.row.id && editingState?.field === 'estado';
        const isAdmin = userData?.role === 'Admin';

        return isEditing ? (
          <Select
            value={editingState?.value || params.value}
            onChange={(e) => setEditingState(editingState ? { id: params.row.id, field: 'estado', value: e.target.value } : null)} // Protegemos el acceso a editingState
            onBlur={() => handleChangeField(params.row.id, 'estado', editingState?.value || params.value)}
            fullWidth
          >
            <MenuItem value="Jugado">Jugado</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem>
            <MenuItem value="Reprogramado">Reprogramado</MenuItem>
            <MenuItem value="Por Jugar">Por Jugar</MenuItem>
          </Select>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            {isAdmin && (
              <EditIcon
                onClick={() => setEditingState({ id: params.row.id, field: 'estado', value: params.value })}
                sx={{
                  fontSize: '1.2rem',
                  color: 'gray',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Layout.Root>
      <Layout.Header>
        <Header />
      </Layout.Header>
  
      <Layout.SideNav>
        <img src={logo} alt="Logo" width="170" />
      </Layout.SideNav>
  
      <Layout.Main>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            height: '100%',
            width: '98%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '16px',
            }}
          >
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
  
            <Box sx={{ minWidth: '200px', marginRight: '30px' }}> 
              <Typography component="p">Selecciona la Semana:</Typography>
              <select
                value={selectedSemana}
                onChange={(e) => setSelectedSemana(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">Todas las Semanas</option>
                {Array.from({ length: 18 }, (_, i) => (
                  <option key={i + 1} value={`Semana ${i + 1}`}>{`Semana ${i + 1}`}</option>
                ))}
              </select>
            </Box>
          </Box>
  
          <Box sx={{ height: 600, width: '98%' }}>
            <DataGrid rows={filteredRows} columns={columns} sx={{ overflowY: 'auto', width: '100%' }} />
          </Box>
        </Box>
      </Layout.Main>
    </Layout.Root>
  );
};

export default FixedSizeGrid;
