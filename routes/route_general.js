const express = require('express');
const router = express.Router();

// Ruta para mostrar el formulario de inicio de sesión
router.get('/Vista_general', (req, res) => {
    res.render('vista_general/vista_general'); // Renderiza la vista 'vista_general.ejs'
});




module.exports = router; // Exporta el router
