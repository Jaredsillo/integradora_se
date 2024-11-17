const express = require('express');
const router = express.Router();
const sp_Controller = require('../controllers/control_sp_admin'); // Importa el controlador
const auth = require('../middleware/Autorizaciones'); 
const bitacora = require('../middleware/bitacora'); 


// Aplica el middleware a todas las rutas de este router
router.use(auth.ensureAuthenticated);

// Ruta para la vista principal
router.get('/vista_principal', (req, res) => {
    res.render('Super_admin/vista_principal'); 
});





// Ruta para Personas
router.get('/persona', sp_Controller.getPersonas);

// Ruta para crear una nueva persona
router.post('/persona/crear', bitacora('creación', 'Se agrego a una persona') ,sp_Controller.createPersona);

// Ruta para actualizar una persona
router.post('/persona/editar', bitacora('Actualizacion', 'Se actualizo una persona'), sp_Controller.editPersona);

// Ruta para eliminar una persona
router.post('/persona/eliminar', bitacora('Eliminar', 'Se elimino una persona'), sp_Controller.deletePersona);
// ------------------------------

// Ruta para Usuarios






// ------------------------------
//rutas para alumnos
router.get('/Alumnos', sp_Controller.getAllStudents);

router.post('/Alumnos/crear',  bitacora('creación', 'Se agrego a un Alumnos'), sp_Controller.addStudentController);

router.post('/Alumnos/eliminar', bitacora('Eliminar', 'Se elimino a un Alumnos'), sp_Controller.deleteStudent);

router.post('/Alumnos/:id/editar', bitacora('Actualizacion', 'Se actualizo a un Alumnos'),sp_Controller.UpdateAlumno);

// ------------------------------

// Ruta para administrativos
router.get('/Administrativos', auth.denyrouteadmin,  sp_Controller.getAdministrativos);

router.post('/Administrativos/crear', bitacora('creación', 'Se agrego a un Administrativo'), sp_Controller.createAdministrativo);

router.post('/Administrativos/eliminar',bitacora('Eliminar', 'Se elimino a un Administrativo'), sp_Controller.deleteAdministrativo);

router.post('/Administrativos/editar', bitacora('Actualizacion', 'Se actualizo a un Administrativo'), sp_Controller.updateAdministrativo);




// Ruta para profesores 
router.get('/Profesores', sp_Controller.getProfesores);

router.post('/Profesores/crear',  bitacora('creación', 'Se agrego a un Profesor'), sp_Controller.createProfesor);

router.post('/Profesores/eliminar',  bitacora('Eliminar', 'Se elimino a un Profesor'), sp_Controller.deleteProfesor);

router.post('/Profesores/editar',  bitacora('Actualizacion', 'Se actualizo a un Profesor'), sp_Controller.updateProfesor);

// ------------------------------
router.get('/Usuarios', auth.denyrouteuser, sp_Controller.getUsuarios );


router.post('/Usuarios/crear', bitacora('creación', 'Se agrego a un Usuario'), sp_Controller.createUser);

router.post('/Usuarios/eliminar', bitacora('Eliminar', 'Se elimino a un Usuario'), sp_Controller.deleteUser );

router.post('/Usuarios/editar', bitacora('Actualizacion', 'Se actualizo a un Usuario'), sp_Controller.updateUser);

router.post('/Usuarios/agregarRol', bitacora('creación', 'Se agrego a un Usuario'), sp_Controller.Addrol);


router.post('/Usuarios/eliminarRol',bitacora('Eliminar', 'Se elimino a un Usuario'), sp_Controller.deleteRol);



// NIVEL EDUCATIVO
router.get('/NivelAcademico',  sp_Controller.getNivelesAcademicos);

router.post('/NivelAcademico/crear', bitacora('creación', 'Se agrego  un Nivel Academico'), sp_Controller.createNivelAcademico);

router.post('/NivelAcademico/eliminar',bitacora('Eliminar', 'Se elimino  un Nivel Academico'), sp_Controller.deleteNivelAcademico);

router.post('/NivelAcademico/:id_nivel_estudio/editar', bitacora('Actualizacion', 'Se actualizo  un Nivel Academico'), sp_Controller.updateNivelAcademico);


// Programa Academico
router.get('/ProgramaAcademico',  sp_Controller.getProgramaAcademico);

router.post('/ProgramaAcademico/crear', bitacora('creación', 'Se agrego  un Programa Academico'), sp_Controller.postProgramaAcademico);

router.post('/ProgramaAcademico/eliminar', bitacora('Eliminar', 'Se elimino  un Programa Academico'), sp_Controller.deleteProgramaAcademico);

router.post('/ProgramaAcademico/:id_programa_academico/editar', bitacora('Actualizacion', 'Se actualizo  un Programa Academico'), sp_Controller.updateProgramaAcademico);

// empiezen desde aqui:



// Rutas para Departamento
router.get('/departamento', sp_Controller.getDepartamentos);

// Ruta para crear un nuevo departamento
router.post('/departamento/crear', bitacora('creación', 'Se agrego  un Departamento'),  sp_Controller.createDepartamento);

// Ruta para actualizar un departamento
router.post('/departamento/:id_departamento/editar',  bitacora('Actualizacion', 'Se actualizo  un Departamento'), sp_Controller.updateDepartamento);

// Ruta para eliminar un departamento
router.post('/departamento/:id_departamento/eliminar',  bitacora('Eliminar', 'Se elimino  un Departamento'), sp_Controller.deleteDepartamento);

// Rutas para Puesto
router.get('/puesto', sp_Controller.getPuestos);

router.post('/puesto/crear', bitacora('creación', 'Se agrego  un Puesto'), sp_Controller.createPuesto);

router.post('/puesto/:id_puesto/editar', bitacora('Actualizacion', 'Se actualizo  un Puesto'), sp_Controller.updatePuesto);

router.post('/puesto/:id_puesto/eliminar', bitacora('Eliminar', 'Se elimino  un Puesto'), sp_Controller.deletePuesto);

// Rutas para Departamento
router.get('/mapa_curricular', sp_Controller.getMapaCurricular);

router.post('/mapa_curricular/crear', bitacora('creación', 'Se agrego  un Mapa Curricular'), sp_Controller.createMapaCurricular);

router.post('/mapa_curricular/editar', bitacora('Actualizacion', 'Se actualizo un Mapa Curricular'), sp_Controller.updateMapaCurricular);


router.post('/mapa_curricular/eliminar', bitacora('Eliminar', 'Se elimino  un Mapa Curricular'), sp_Controller.deleteMapaCurricular);



// Rutas para Departamento
router.get('/Edificio',   sp_Controller.getEdificios);

// Ruta para crear un nuevo departamento
router.post('/Edificio/crear',  bitacora('creación', 'Se agrego  un edificio'), sp_Controller.createEdificio);

// Ruta para crear un nuevo departamento
router.post('/Edificio/editar',  bitacora('Actualizacion', 'Se actualizo  un edificio'), sp_Controller.updateEdificio);

// Ruta para crear un nuevo departamento
router.post('/Edificio/eliminar',  bitacora('Eliminar', 'Se elimino  un edificio'), sp_Controller.deleteEdificio);


//AULA RUTAS

// Rutas para Aula
router.get('/Aula', sp_Controller.getAulas);

router.post('/Aula/crear', bitacora('creación', 'Se agrego  un Aula'), sp_Controller.createAula);

router.post('/Aula/actualizar/:id',bitacora('Actualizacion', 'Se actualizo  un Aula '),  sp_Controller.updateAula);

router.post('/Aula/eliminar/:id',  bitacora('Eliminar', 'Se elimino  un Aula '), sp_Controller.deleteAula);

// Ruta para Personas
router.get('/Historial', sp_Controller.getBitacora);

// Rutas para Tramite Apertura Periodo
router.get('/periodo', sp_Controller.getPeriodo); // Obtener todos los periodos

router.post('/periodo/crear',  bitacora('creación', 'Se agrego  un tramite'), sp_Controller.createPeriodo); // Crear un nuevo periodo

router.post('/periodo/:id_periodo/editar',  bitacora('Actualizacion', 'Se actualizo  un tramite'), sp_Controller.editPeriodo); // Editar un periodo existente

router.post('/periodo/:id_periodo/eliminar',  bitacora('Eliminar', 'Se elimino  un tramite '), sp_Controller.deletePeriodo); // Eliminar un periodo

// Grupo
router.get('/api/grupos', sp_Controller.getGruposByProgramaAndPeriodo);

router.get('/grupo', sp_Controller.getGrupos); 

router.get('/grupo/filtro/:var1/:var2', sp_Controller.getGruposfiltro); 

router.post('/grupo/crear', bitacora('creación', 'Se agrego  un Grupo'), sp_Controller.postGrupo); 

router.post('/grupo/:idGrupo/editar', bitacora('Actualizacion', 'Se actualizo  un Grupo'), sp_Controller.updateGrupo); 

router.post('/grupo/eliminar', bitacora('Eliminar', 'Se elimino  un Grupo'), sp_Controller.deleteGrupo); 



//Rutas de Bloque
router.get('/bloque', sp_Controller.getBloques); //Obtener todos los Bloques

router.post('/bloque/crear', bitacora('creación', 'Se agrego  un Bloque'), sp_Controller.createBloque); // Crear un nuevo Bloque

router.post('/bloque/:idBloque/editar', bitacora('Actualizacion', 'Se actualizo  un Bloque'), sp_Controller.editBloque); // Editar un Bloque existente
 
router.post('/bloque/:idBloque/eliminar', bitacora('Eliminar', 'Se elimino  un Bloque'), sp_Controller.deleteBloque); // Eliminar un Bloque 

//Ruta carga horaria    

router.get('/carga_horaria', sp_Controller.getHorarios); //Obtener todos los Bloques

router.post('/carga_horaria/crear', bitacora('creación', 'Se agrego  un horario'),  sp_Controller.createHorario); //Obtener todos los Bloques

router.post('/carga_horaria/editar', bitacora('Actualizacion', 'Se actualizo  un horario'), sp_Controller.updateHorario); //Obtener todos los Bloques

router.post('/carga_horaria/eliminar', bitacora('Eliminar', 'Se elimino  un horario'), sp_Controller.deleteHorario); //Obtener todos los Bloques


// Rutas para Grupo Materia
router.get('/grupoMateria', sp_Controller.getGrupoMaterias);

router.get('/api/grupoMaterias', sp_Controller.getGrupo_Materias_api);

router.get('/api/grupoMaterias_sin_horario', sp_Controller.grupoMaterias_sin_horario);

router.delete('/api/eliminarGrupoMateria',bitacora('Eliminar', 'Se elimino  un grupoMateria'), sp_Controller.DeleteGrupo_Materias_api);

router.get('/api/mapaCurricular', sp_Controller.getMapaCurricularByPrograma);

router.post('/grupoMateria/crear_horario',  sp_Controller.create_gm_horario);

router.post('/grupoMateria/crear', bitacora('creación', 'Se agrego  un grupoMateria'), sp_Controller.postGrupoMateria);

router.post('/grupoMateria/eliminar',bitacora('Actualizacion', 'Se actualizo  un grupoMateria'),  sp_Controller.deleteGrupoMateria);

router.post('/grupoMateria/:id_grupo_materia/editar',bitacora('Eliminar', 'Se elimino  un grupoMateria'),  sp_Controller.updateGrupoMateria);



// Ruta para la vista principal
router.get('/Materiagrupo', (req, res) => {
    res.render('Super_admin/materiagrupo'); 
});

// Ruta para la vista principal
router.get('/Asignarhorario', (req, res) => {
    res.render('Super_admin/asignarhorario'); 
});

//Rutas de Tramite
router.get('/tramites', sp_Controller.getTramites); //Obtener todos los Tramites

router.post('/tramites/crear', bitacora('creación', 'Se agrego  un Tramite'), sp_Controller.createTramite);  

router.post('/tramites/:IdTramite/editar', bitacora('Actualizacion', 'Se actualizo  un Tramite'), sp_Controller.editTramite); // Editar un Tramite existente
 
router.post('/tramites/:IdTramite/eliminar', bitacora('Eliminar', 'Se elimino  un Tramite'), sp_Controller.deleteTramite); // Eliminar un Tramite 


// Rutas para Actividad
router.get('/actividad', sp_Controller.getActividades);

router.post('/actividad/crear',  bitacora('creación', 'Se agrego  una actividad'), sp_Controller.createActividad);

router.post('/actividad/eliminar',  bitacora('Actualizacion', 'Se actualizo  una actividad'), sp_Controller.deleteActividad);

router.post('/actividad/editar',   bitacora('Eliminar', 'Se elimino  una actividad'), sp_Controller.editActividad);

//Rutas para el proceso de tramite
router.get('/tramite_proceso', sp_Controller.getTramiteProceso);

router.post('/tramite_proceso/crear', bitacora('creación', 'Se agrego  un proceso de tramite'), sp_Controller.createTramiteProceso);

 router.post('/tramite_proceso/eliminar',bitacora('Eliminar', 'Se elimino  proceso de tramite'),  sp_Controller.deleteTramiteProceso);

router.post('/tramite_proceso/editar',bitacora('Actualizacion', 'Se actualizo  proceso de tramite'),  sp_Controller.updateTramiteProceso);



router.get('/Nuevo_tramite', sp_Controller.get_Nuevo_tramite);

router.post('/Nuevo_tramite/crear', sp_Controller.create_nuevo_tramite_alumno);

router.get('/Seguimiento_tramite', sp_Controller.getAlumnoTramite);



router.get('/alumnoT', sp_Controller.getAlumnoTramites);

router.post('/alumnoT/crear', bitacora('Creación', 'Se agregó un nuevo registro de AlumnoTramite'), sp_Controller.createAlumnoTramite);

router.post('/alumnoT/editar', bitacora('Actualización', 'Se actualizó un registro de AlumnoTramite'), sp_Controller.editAlumnoTramite);

router.post('/alumnoT/eliminar', bitacora('Eliminación', 'Se eliminó un registro de AlumnoTramite'), sp_Controller.deleteAlumnoTramite);



//Alumno_Programa
router.get('/Alumno_pa', sp_Controller.getAlumnosPa);

router.post('/Alumno_pa/crear', bitacora('Creación', 'Se agregó un nuevo registro de AlumnoPrograma'), sp_Controller.createAlumnoPa);

router.post('/Alumno_pa/:idAlumnoPrograma/editar', bitacora('Actualizacion', 'Se actualizo un AlumnoPrograma'), sp_Controller.editAlumnoPa);

router.post('/Alumno_pa/eliminar', bitacora('Eliminar', 'Se elimino  un AlumnoPrograma'), sp_Controller.deleteAlumnoPa); 

router.get('/Alumno_pa/validacion/:alumnoSeleccionado/', sp_Controller.validaAlumnoPrograma); 

// Ruta para obtener el proceso de alumno
router.get('/alumno_proceso', sp_Controller.getAlumnoProceso);

router.post('/alumno_proceso/crear', bitacora('Creación', 'Se agregó un nuevo registro de Alumno Proceso'),sp_Controller.createAlumnoProcesos);

router.post('/alumno_proceso/editar', bitacora('Actualización', 'Se actualizó un registro de Alumno Proceso'), sp_Controller.editAlumnoProceso); 

router.post('/alumno_proceso/eliminar', bitacora('Eliminación', 'Se eliminó un registro de Alumno Proceso'),sp_Controller.deleteAlumnoProceso);  

router.get('/Procedimiento_tramite', sp_Controller.verProcedimientoTramiteID);


module.exports = router; // Exporta el router