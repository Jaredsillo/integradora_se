const express = require('express');
const router = express.Router();
const loginController = require('../controllers/control_login'); // Importa el controlador
const isAuthenticated = require('../middleware/Autorizaciones'); 



// Ruta para mostrar el formulario de inicio de sesión
router.get('/', isAuthenticated.checkAuth, (req, res) => {
    res.render('Login/login'); // Renderiza la vista 'login.ejs'
});

// Ruta para manejar el envío del formulario de login (POST)
router.post('/login', loginController.login);

// Ruta para cerrar la sesión
router.get('/logout', loginController.logout);


module.exports = router; // Exporta el router
