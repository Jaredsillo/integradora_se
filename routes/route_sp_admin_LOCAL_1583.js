const express = require('express');
const router = express.Router();
const sp_Controller = require('../controllers/control_sp_admin'); // Importa el controlador

router.get('/vista_principal', (req, res) => {
    res.render('Super_admin/vista_principal'); 
});


// Ruta para Personas
router.get('/persona', sp_Controller.getPersonas);

// Ruta para crear una nueva persona
router.post('/persona/crear', sp_Controller.createPersona);

// Ruta para actualizar una persona
router.post('/persona/editar', sp_Controller.editPersona);

// Ruta para eliminar una persona
router.post('/persona/eliminar', sp_Controller.deletePersona);
// ------------------------------

// Ruta para Usuarios






// ------------------------------
//rutas para alumnos
router.get('/Alumnos', sp_Controller.getAllStudents);

router.post('/Alumnos/crear', sp_Controller.addStudentController);

router.post('/Alumnos/eliminar', sp_Controller.deleteStudent);

router.post('/Alumnos/:id/editar', sp_Controller.UpdateAlumno);

// ------------------------------

// Ruta para administrativos
router.get('/Administrativos', sp_Controller.getAdministrativos);

router.post('/Administrativos/crear', sp_Controller.createAdministrativo);

router.post('/Administrativos/eliminar', sp_Controller.deleteAdministrativo);

router.post('/Administrativos/editar', sp_Controller.updateAdministrativo);




// Ruta para profesores 
router.get('/Profesores', sp_Controller.getProfesores);

router.post('/Profesores/crear', sp_Controller.createProfesor);

router.post('/Profesores/eliminar', sp_Controller.deleteProfesor);

router.post('/Profesores/editar', sp_Controller.updateProfesor);

// ------------------------------
router.get('/Usuarios', sp_Controller.getUsuarios);


router.post('/Usuarios/crear', sp_Controller.createUser);

router.post('/Usuarios/eliminar', sp_Controller.deleteUser);

router.post('/Usuarios/editar', sp_Controller.updateUser);

router.post('/Usuarios/agregarRol', sp_Controller.Addrol);


router.post('/Usuarios/eliminarRol', sp_Controller.deleteRol);

module.exports = router; // Exporta el router
