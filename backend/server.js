const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

// Importa las rutas de autenticación
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = 'http://localhost:4200';

// Middleware
// Configuración de CORS: Permite que tu frontend Angular (4200) acceda al backend (3000)
// Esto es importante si el proxy falla o si lo pruebas directamente
const corsOptions = {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json()); // Para parsear el body JSON de las peticiones

// Rutas de la API
// Todas las rutas bajo /api/auth
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Backend de Ocasión funcionando. Usa el endpoint /api/auth/google para autenticar.');
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => { // Usamos '0.0.0.0' para escuchar en todas las interfaces de red de la MV
    console.log(`Servidor backend corriendo en http://0.0.0.0:${PORT}`);
});