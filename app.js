const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// Importar las rutas
const authRoutes = require('./routes/route_login');
const sp_admin = require('./routes/route_sp_admin');
const general = require('./routes/route_general');

dotenv.config();

const app = express();




//app.set('trust proxy', true);

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sirve la carpeta 'assets' con archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios


app.use(session({
  secret: process.env.SESSION_SECRET, // Usa la variable de entorno
  resave: false,
  saveUninitialized: false,
  cookie: {  secure: false } // Cambia a 'true' si usas HTTPS
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});



// Middleware para controlar la caché
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Configura las rutas
app.use('/', authRoutes); // Rutas para inicio de sesión
app.use('/sp_admin', sp_admin); // Rutas para superadmin
app.use('/vista_general', general); 

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

