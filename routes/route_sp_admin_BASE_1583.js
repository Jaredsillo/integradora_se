const express = require('express');
const router = express.Router();
const sp_Controller = require('../controllers/control_sp_admin'); // Importa el controlador

router.get('/vista_principal', (req, res) => {
    res.render('Super_admin/vista_principal'); 
});

// Ruta para ver todas las personas
router.get('/persona', sp_Controller.getPersonasConUsuarioYRol);

// Ruta para crear una nueva persona
router.post('/persona/crear', sp_Controller.createPersonaConUsuarioYRol);

// Ruta para actualizar una persona
router.post('/persona/:id/editar', sp_Controller.updatePersonaYUsuario);

// Ruta para eliminar una persona
router.post('/persona/:id/eliminar', sp_Controller.deletePersona);

router.post('/persona/:id/agregar_rol', sp_Controller.insertRol);

router.get('/consulta_roles/:id_persona', sp_Controller.getUserDataByRoles);

router.post('/consulta_roles/:id_persona/editar', sp_Controller.updateUserRol);


module.exports = router; // Exporta el router
