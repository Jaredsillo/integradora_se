const sp_model = require('../models/model_sp_admin');
const bcrypt = require('bcryptjs');


// Mostrar todos los registros de la bitácora
exports.getBitacora = async (req, res) => {
    try {
        // Obtener todos los registros de la bitácora
        const bitacora = await sp_model.getBitacora();

        // Renderizar la vista con los registros de la bitácora
        res.render('Super_admin/historial', { bitacora });
    } catch (err) {
        // Manejo de errores
        console.error('Error al obtener los registros de la bitácora:', err);
        res.status(500).send('Error al obtener registros de la bitácora');
    }
};


// Mostrar todas las personas
exports.getPersonas = async (req, res) => {
    try {
        // Obtener todas las personas
        const personas = await sp_model.getAllPersonas();

        // Renderizar la vista con personas
        res.render('Super_admin/persona_crud', { personas });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener personas');
    }
};

// Controlador para insertar una nueva persona
exports.createPersona = async (req, res) => {
    const personaData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createPersona(personaData);
            // Registra la acción en la base de datos
        res.redirect('/sp_admin/persona'); // Redirige a la página de lista de personas después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear persona: ${err.message}` });
    }
};

// Controlador para editar una persona
exports.editPersona = async (req, res) => {
    const personaData = req.body; // Los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.updatePersona(personaData);
        res.redirect('/sp_admin/persona'); // Redirigir a la lista de personas después de la actualización
    } catch (err) {
        console.error('Error al editar persona:', err);
        res.status(500).json({ message: `Error al editar persona: ${err.message}` });
    }
};


// Controlador para eliminar una persona
exports.deletePersona = async (req, res) => {
    const { id_persona } = req.body; // Obtener el id_persona del cuerpo de la solicitud

    try {
        await sp_model.deletePersona(id_persona); // Llamada al modelo para eliminar la persona
        res.redirect('/sp_admin/persona'); // Redirigir a la lista de personas después de la eliminación
    } catch (err) {
        console.error('Error al eliminar persona:', err);
        res.status(500).json({ message: `Error al eliminar persona: ${err.message}` });
    }
};

//Crud para usaurios y roles.

// Mostrar todos los usuarios y personas sin usuarios
exports.getUsuarios = async (req, res) => {
    try {
        // Obtener todos los usuarios
        const usuarios = await sp_model.getAllUsers();

        // Obtener personas sin usuarios
        const personasSinUsuarios = await sp_model.getPersonsWithoutUsers();

        // Obtener todos los roles con usuarios asignados
        const rolesConUsuarios = await sp_model.getRolesConUsuarios();

        // Renderizar la vista con usuarios, personas sin usuarios y roles
        res.render('Super_admin/Usuarios', { usuarios, personasSinUsuarios, rolesConUsuarios });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener usuarios, personas sin usuarios o roles');
    }
};


// Crear un nuevo usuario

exports.createUser = async (req, res) => {
    const { id_persona, usuario, contrasena, id_rol, estatus } = req.body;

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Definir el ID de persona como null si no fue seleccionado
        const personaId = id_persona ? id_persona : null;

        // Llamar al modelo para crear el usuario junto con su rol
        await sp_model.createUserWithRole(personaId, usuario, hashedPassword, estatus, id_rol);

        // Redirigir a la vista de usuarios
        res.redirect('/sp_admin/Usuarios');

    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error al crear el usuario');
    }
};


// Controlador para eliminar un usuario
exports.deleteUser = async (req, res) => {
    const { id_user } = req.body; // Extraer el ID del usuario del cuerpo de la solicitud

    try {
        await sp_model.deleteUserById(id_user); // Llama a la función para eliminar el usuario
        res.redirect('/sp_admin/Usuarios'); // Redirige a la lista de usuarios después de eliminar
    } catch (error) {
        console.error('Error al eliminar usuario:', error); // Muestra el error en la consola
        res.status(500).send('Error al eliminar el usuario'); // Responde con un error 500 si algo sale mal
    }
};

exports.updateUser = async (req, res) => {
    const { id_usuario, id_persona, usuario, estatus } = req.body; // Extraer datos del cuerpo de la solicitud

    try {
        // Lógica para actualizar el usuario en la base de datos
        await sp_model.updateUserById(id_usuario, id_persona, usuario, estatus);
        res.redirect('/sp_admin/usuarios'); // Redirige a la lista de usuarios después de actualizar

    } catch (error) {
        console.error('Error al actualizar usuario:', error); // Muestra el error en la consola
        res.status(500).send('Error al actualizar el usuario'); // Responde con un error 500 si algo sale mal
    }
};


exports.Addrol = async (req, res) => {
    const { id_usuario, id_rol } = req.body; // Extraemos los datos del cuerpo de la solicitud

    try {
        await sp_model.addRol(id_usuario, id_rol); // Llamamos a la función para agregar el rol
        res.redirect('/sp_admin/Usuarios'); // Redirige a la lista de usuarios o donde desees
    } catch (error) {
        console.error('Error al agregar rol:', error);
        res.status(500).send('Error al agregar rol'); // Manejo de errores
    }
};



exports.deleteRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body; // Extraemos los datos del cuerpo de la solicitud

        // Agregamos logs para verificar los datos recibidos
        console.log('Datos recibidos para eliminar rol:', { id_usuario, id_rol });
        
    try {
        await sp_model.deleteRol(id_usuario, id_rol); // Llamamos a la función para eliminar el rol
        res.redirect('/sp_admin/Usuarios'); // Redirige a la lista de usuarios o donde desees
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        res.status(500).send('Error al eliminar rol'); // Manejo de errores
    }
};

// ------------------------------

// Controlador unicamente para el crud de alumno 

// Mostrar todos los alumnos con su información y obtener personas sin alumnos
exports.getAllStudents = async (req, res) => {
    try {
        // Obtener todos los alumnos con sus detalles
        const students = await sp_model.getAllStudents();

        // Obtener personas que no tienen alumnos
        const personsWithoutStudents = await sp_model.getPersonsWithoutStudents(); // Necesitas crear esta función


        // Formatear las fechas antes de enviarlas a la vista
        students.forEach(student => {
            student.fecha_registro = new Date(student.fecha_registro).toISOString().split('T')[0]; // Formato YYYY-MM-DD
        });

        // Renderizar la vista 'alumno.ejs' pasando los datos de los alumnos y las personas sin alumnos
        res.render('Super_admin/alumno', { students, personsWithoutStudents });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener la lista de alumnos');
    }
};


// Controlador para agregar un nuevo alumno
exports.addStudentController = async (req, res) => {
    try {
        const studentData = req.body; // Obtener los datos del formulario
        //console.log(studentData);
        await sp_model.addStudent(studentData); // Llamar al modelo para agregar el alumno
        res.redirect('/sp_admin/Alumnos'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el alumno');
    }
};


// Controlador para eliminar un alumno
exports.deleteStudent = async (req, res) => {
    const { id_alumno } = req.body; // Obtiene el ID del cuerpo de la solicitud

    try {
        const result = await sp_model.deleteStudentById(id_alumno);

        if (result) {
            // Redirige a la lista de alumnos con un mensaje de éxito en los parámetros de consulta
            return res.redirect('/sp_admin/Alumnos?success=Alumno eliminado con éxito.');
        } else {
            // Redirige a la lista de alumnos con un mensaje de error en los parámetros de consulta
            return res.redirect('/sp_admin/Alumnos?error=No se pudo eliminar el alumno. Puede que no exista.');
        }
    } catch (error) {
        console.error(error);
        // Redirige a la lista de alumnos con un mensaje de error en los parámetros de consulta
        return res.redirect('/sp_admin/Alumnos?error=Error al eliminar el alumno.');
    }
};


// Controlador para actualizar un alumno
exports.UpdateAlumno = async function(req, res) {
    const id_alumno = req.body.id_alumno; // Obtener el ID del alumno desde el cuerpo de la solicitud
    const datos = req.body; // Obtener los datos del cuerpo de la solicitud

    try {
        // Llamar al modelo para actualizar el alumno
        await sp_model.updateAlumn(id_alumno, datos);
        
        // Redireccionar en caso de éxito
        return res.redirect('/sp_admin/Alumnos?success=Alumno actualizado correctamente');
    } catch (error) {
        console.error('Error en el controlador al actualizar alumno:', error);
        return res.redirect('/sp_admin/Alumnos?error=Error al actualizar el alumno.'); // Mensaje de error
    }
};


// control para el crud de profesores

// Controlador para obtener todas las personas sin profesores y los datos necesarios
exports.getProfesores = async function(req, res) {
    try {
        const profesores = await sp_model.getAllProfesores(); // Llama al modelo para obtener profesores
        const personsWithoutteacher = await sp_model.getPersonsWithoutTeachers(); // Llama al modelo para obtener personas sin profesores
        const departamentos = await sp_model.getDepartamentosConPuestos(); // Llama al modelo para obtener departamentos

        // Renderiza la vista con los datos de profesores, personas sin profesores, departamentos y puestos
        return res.render('Super_admin/profesor', { 
            profesores, 
            personsWithoutteacher, 
            departamentos, 
        });
    } catch (error) {
        console.error('Error en el controlador al obtener profesores:', error);
        return res.status(500).send('Error al obtener los profesores.'); // Manejo de error
    }
};


// Controlador para agregar un nuevo profesor
exports.createProfesor = async (req, res) => {
    try {
        const profesorData = req.body; // Obtener los datos del formulario
        await sp_model.createprofesor(profesorData); // Llamar al modelo para agregar el profesor
        res.redirect('/sp_admin/Profesores'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el profesor');
    }
};

// Controlador para eliminar un profesor
exports.deleteProfesor = async function(req, res) {
    const id_profesor = req.body.id_profesor; // Obtiene el ID del profesor desde el cuerpo de la solicitud
    try {
        await sp_model.deleteProfesor(id_profesor); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/Profesores'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar profesor:', error);
        res.status(500).send('Error al eliminar el profesor'); // Maneja el error
    }
};



// Controlador para actualizar un profesor
exports.updateProfesor = async (req, res) => {
    try {
        // Obtener los datos del formulario
        const data = {
            id_profesor: req.body.id_profesor, // El ID del profesor se recibe del formulario
            id_departamento: req.body.id_departamento,
            id_puesto: req.body.id_puesto,
            clave: req.body.clave,
            perfil: req.body.perfil,
            email: req.body.email,
            no_cedula: req.body.no_cedula,
            programa_academicos: req.body.programa_academicos,
            nss: req.body.nss,
            rfc: req.body.rfc
        };

        // Llamar al método del modelo para actualizar el profesor
        await sp_model.updateProfesor(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/Profesores'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar profesor:', error);
        // Manejo de errores: puedes redirigir a una vista de error o mostrar un mensaje
        res.status(500).send('Error al actualizar el profesor'); // Personaliza este mensaje según tu aplicación
    }
};



//control para administrativo

// Controlador para obtener todos los administrativos y los datos necesarios
exports.getAdministrativos = async function(req, res) {
    try {
        const administrativos = await sp_model.getAllAdministrativos(); // Llama al modelo para obtener administrativos
        const personsWithoutAdministrativos = await sp_model.getPersonsWithoutAdministrativos(); // Llama al modelo para obtener personas sin administrativos
        const departamentos = await sp_model.getDepartamentosConPuestos(); // Llama al modelo para obtener departamentos

        // Renderiza la vista con los datos de administrativos, personas sin administrativos y departamentos
        return res.render('Super_admin/administrativos', { 
            administrativos, 
            personsWithoutAdministrativos, 
            departamentos, 
        });
    } catch (error) {
        console.error('Error en el controlador al obtener administrativos:', error);
        return res.status(500).send('Error al obtener los administrativos.'); // Manejo de error
    }
};


// Controlador para agregar un nuevo administrativo
exports.createAdministrativo = async (req, res) => {
    try {
        const administrativoData = req.body; // Obtener los datos del formulario
        await sp_model.createAdministrativo(administrativoData); // Llamar al modelo para agregar el administrativo
        res.redirect('/sp_admin/Administrativos'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el administrativo');
    }
};



// Controlador para actualizar un administrativo
exports.updateAdministrativo = async (req, res) => {
    try {
        // Obtener los datos del formulario
      //  console.log(req.body);
        const data = {
            id_administrativo: req.body.id_administrativo, // El ID del administrativo se recibe del formulario
            id_departamento: req.body.id_departamento,
            id_puesto: req.body.id_puesto,
            clave: req.body.clave,
            horario: req.body.horario,
            nss: req.body.nss,
            rfc: req.body.rfc
        };

        // Llamar al método del modelo para actualizar el administrativo
        await sp_model.updateAdministrativo(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/Administrativos'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar administrativo:', error);
        // Manejo de errores: redirige a una vista de error o muestra un mensaje adecuado
        res.status(500).send('Error al actualizar el administrativo'); // Personaliza este mensaje según tu aplicación
    }
};


// Controlador para eliminar un administrativo
exports.deleteAdministrativo = async function(req, res) {
    const id_administrativo = req.body.id_administrativo; // Obtiene el ID del administrativo desde el cuerpo de la solicitud
    try {
        await sp_model.deleteAdministrativo(id_administrativo); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/Administrativos'); // Redirige a la lista de administrativos después de eliminar
    } catch (error) {
        console.error('Error al eliminar administrativo:', error);
        res.status(500).send('Error al eliminar el administrativo'); // Maneja el error
    }
};

// aqui empieza si quieres arriba esten los cruds que yo hice :D


// Controller Nivel Academico


//GET

exports.getNivelesAcademicos = async function(req, res) {
    try {
        const niveles = await sp_model.getNivelesAcademicos(); 

        // Renderiza la vista con los datos de profesores, personas sin profesores, departamentos y puestos
        return res.render('Super_admin/nivelestudio', { 
            niveles
        });
    } catch (error) {
        console.error('Error controller Niveles Academicos:', error);
        return res.status(500).send('No Results Found'); // Manejo de error
    }
};


// aqui empieza si quieres arriba esten los cruds que yo hice :D

// POST
exports.createNivelAcademico = async (req, res) => {
    try {
        const NivelData = req.body; // Obtener los datos del formulario
        await sp_model.createNivelEstudio(NivelData); // Llamar al modelo para agregar el profesor
        res.redirect('/sp_admin/NivelAcademico'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Insert Nivel Academico');
    }
};

// DELETE
exports.deleteNivelAcademico = async function(req, res) {
    const id_nivel_estudio = req.body.id_nivel_estudio; // Obtiene el ID del profesor desde el cuerpo de la solicitud
    
   // console.log(id_nivel_estudio);
    
    try {
        await sp_model.deleteNivelAcademico(id_nivel_estudio); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/NivelAcademico'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar profesor:', error);
        res.status(500).send('Error Delete Nivel Academico'); // Maneja el error
    }
};

// UPDATE
exports.updateNivelAcademico = async (req, res) => {
    try {
        // Obtener los datos del formulario
        const data = {
            id_nivel_estudio: req.body.id_nivel_estudio, 
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            sigla: req.body.sigla,
        };

        // Llamar al método del modelo para actualizar el profesor
        await sp_model.updateNivelAcademico(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/NivelAcademico'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar NivelAcademico:', error);
        // Manejo de errores: puedes redirigir a una vista de error o mostrar un mensaje
        res.status(500).send('Error al actualizar el NivelAcademico'); // Personaliza este mensaje según tu aplicación
    }
};


//GET

exports.getProgramaAcademico = async function(req, res) {
    try {

        const niveles = await sp_model.getNivelesAcademicos(); 
        // niveles.forEach(element => {
        //     if(element.estatus == 1){
        //         console.log("-------------------------------------------------------------------------------")
        //     }
        // });
        const programas = await sp_model.getProgramasAcademico(); 

        // Renderiza la vista con los datos de profesores, personas sin profesores, departamentos y puestos
        return res.render('Super_admin/programaacademico', { 
            programas, niveles
        });
    } catch (error) {
        console.error('Error controller Niveles Academicos:', error);
        return res.status(500).send('No Results Found'); // Manejo de error
    }
};


// aqui empieza si quieres arriba esten los cruds que yo hice :D

// POST
exports.postProgramaAcademico = async (req, res) => {
    try {
        const NivelData = req.body; // Obtener los datos del formulario
        await sp_model.createProgramaAcademico(NivelData); // Llamar al modelo para agregar el profesor
        res.redirect('/sp_admin/ProgramaAcademico'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Insert Nivel Academico');
    }
};

// DELETE
exports.deleteProgramaAcademico = async function(req, res) {
    const id_programa_academico = req.body.id_programa_academico; // Obtiene el ID del profesor desde el cuerpo de la solicitud 

    //console.log(id_programa_academico);
    try {
        await sp_model.deleteProgramaAcademico(id_programa_academico); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/ProgramaAcademico'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar profesor:', error);
        res.status(500).send('Error Delete Nivel Academico'); // Maneja el error
    }
};

// UPDATE
exports.updateProgramaAcademico = async (req, res) => {
    try {
        // Obtener los datos del formulario
        const data = {
            id_nivel_estudio: req.body.id_nivel_estudio, 
            id_programa_academico: req.body.id_programa_academico,
            nombre_tsu: req.body.nombre_tsu,
            nombre_ing: req.body.nombre_ing,
            descripcion: req.body.descripcion,
            sigla: req.body.sigla,
            cuatris: req.body.cuatris,
            fechaDesde: req.body.fechaDesde,
            fechaHasta: req.body.fechaHasta,
        };

        // Llamar al método del modelo para actualizar el profesor
        await sp_model.updateProgramaAcademico(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/ProgramaAcademico'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar NivelAcademico:', error);
        // Manejo de errores: puedes redirigir a una vista de error o mostrar un mensaje
        res.status(500).send('Error al actualizar el NivelAcademico'); // Personaliza este mensaje según tu aplicación
    }
};




// Empiezen aqui sus cruds 


//Yaremi crud -> Departamento

//CONTROLADORES DE DEPARTAMENTO
/**Mostrar todos los departamentos**/
exports.getDepartamentos = async (req, res) => {
    try {
        // Obtener todos los departamentos
        const departamentos = await sp_model.getAllDepartamentos();

        // Renderizar la vista con departamentos
        res.render('Super_admin/departamentos', { departamentos });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener departamentos');
    }
};

// Controlador para insertar un nuevo departamento
exports.createDepartamento = async (req, res) => {
    const departamentoData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createDepartamento(departamentoData);
        res.redirect('/sp_admin/departamento'); // Redirige a la página de lista de departamentos después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear departamento: ${err.message}` });
    }
};

// Controlador para editar un departamento
exports.updateDepartamento  = async (req, res) => {
    try {
        // Obtener los datos del formulario
        const data = {
            id_departamento: req.body. id_departamento, 
            nombre: req.body.nombre,
            sigla: req.body.sigla,
        };

        // Llamar al método del modelo para actualizar un departamento
        await sp_model.updateDepartamento(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/departamento'); 
    } catch (error) {
        console.error('Error al actualizar Departamento:', error);
        // Manejo de errores: puedes redirigir a una vista de error o mostrar un mensaje
        res.status(500).send('Error al actualizar el Departamento'); 
    }
};

// Controlador para eliminar un departamento
exports.deleteDepartamento = async function(req, res) {
    const  id_departamento = req.body. id_departamento; // Obtiene el ID del profesor desde el cuerpo de la solicitud 

   // console.log( id_departamento);
    try {
        await sp_model.deleteDepartamento( id_departamento); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/departamento'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar Departamento:', error);
        res.status(500).send('Error Delete Departamento'); // Maneja el error
    }
};

//CONTROLADORES DE PUESTO
//Controlador para mostrar todos los puestos
exports.getPuestos = async (req, res) => {
    try {
        // Obtener todos los puestos
        const puestos = await sp_model.getAllPuestos();
      //  console.log('Puestos:', puestos); // Log para verificar los datos de puestos

        // Obtener todos los departamentos
        const departamentos = await sp_model.getAllDepartamentos(); // Asegúrate de que este método existe en tu modelo
      //  console.log('Departamentos:', departamentos); // Log para verificar los datos de departamentos

        // Renderizar la vista con los puestos y departamentos
        res.render('Super_admin/puesto', { puestos, departamentos });
    } catch (error) {
        console.error('Error al obtener puestos o departamentos:', error);
        res.status(500).send('Error al obtener datos');
    }
};

//Controlador para insertar un nuevo puesto
exports.createPuesto = async (req, res) => {
    const puestoData = req.body; // Los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createPuesto(puestoData);
        res.redirect('/sp_admin/puesto'); // Redirigir a la página de lista de puestos después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear puesto: ${err.message}` });
    }
};


//Controlador para editar un puesto
exports.updatePuesto = async (req, res) => {
    const puestoData = req.body; // Los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.updatePuesto(puestoData);
        res.redirect('/sp_admin/puesto'); // Redirigir a la lista de puestos después de la actualización
    } catch (err) {
        console.error('Error al editar puesto:', err);
        res.status(500).json({ message: `Error al editar puesto: ${err.message}` });
    }
};

//Controlador para eliminar un puesto
exports.deletePuesto = async (req, res) => {
    const { id_puesto } = req.body; // Obtener el id_puesto del cuerpo de la solicitud

    try {
        await sp_model.deletePuesto(id_puesto); // Llamada al modelo para eliminar el puesto
        res.redirect('/sp_admin/puesto'); // Redirigir a la lista de puestos después de la eliminación
    } catch (err) {
        console.error('Error al eliminar puesto:', err);
        res.status(500).json({ message: `Error al eliminar puesto: ${err.message}` });
    }
};

// Controlador Memo -> Mapa curricular
// Controlador para obtener todos los registros de MapaCurricular
exports.getMapaCurricular = async (req, res) => {
    try {
        // Obtener todos los registros de MapaCurricular
        const mapaCurricular = await sp_model.getAllMapaCurricular();

            // Obtener todos los registros de MapaCurricular
            const programa_academico = await sp_model.getProgramasWithoutMapaCurricular();

        // Renderizar la vista correspondiente con los datos obtenidos
        res.render('Super_admin/mapa_curricular', { mapaCurricular, programa_academico });
    } catch (err) {
        // Manejo de errores
        console.error('Error al obtener el mapa curricular:', err);
        res.status(500).send('Error al obtener el mapa curricular');
    }
};


// Controlador para agregar un nuevo mapa curricular
exports.createMapaCurricular = async (req, res) => {
    try {
        const mapaCurricularData = req.body; // Obtener los datos enviados desde el formulario
        await sp_model.addMapaCurricular(mapaCurricularData); // Llamar al modelo para agregar el mapa curricular
        res.redirect('/sp_admin/mapa_curricular'); // Redirigir a la página principal después de agregar el mapa curricular
    } catch (error) {
        console.error('Error al agregar mapa curricular:', error);
        res.status(500).send('Error al agregar el mapa curricular');
    }
};

// Controlador para actualizar un mapa curricular
exports.updateMapaCurricular = async (req, res) => {
    try {
        const { id_mapa_curricular, ...mapaCurricularData } = req.body; // Obtener el ID del formulario y los datos restantes

        // Llamar al modelo para actualizar el mapa curricular
        await sp_model.updateMapaCurricular(id_mapa_curricular, mapaCurricularData);

        // Redirigir a la página principal después de la actualización
        res.redirect('/sp_admin/mapa_curricular');
    } catch (error) {
        console.error('Error al actualizar mapa curricular:', error);
        res.status(500).send('Error al actualizar el mapa curricular');
    }
};


// Controlador para eliminar un mapa curricular
exports.deleteMapaCurricular = async (req, res) => {
    try {
        const { id_mapa_curricular } = req.body; // Obtener el ID del formulario enviado por el modal
        await sp_model.deleteMapaCurricular(id_mapa_curricular); // Llamar al modelo para eliminar el mapa curricular
        res.redirect('/sp_admin/mapa_curricular'); // Redirigir a la página principal después de la eliminación
    } catch (error) {
        console.error('Error al eliminar mapa curricular:', error);
        res.status(500).send('Error al eliminar el mapa curricular');
    }
};

///



//CONTROLADOR EDIFICIO

exports.getEdificios = async (req, res) => {
    try {
        // Obtener todos los edificios
        const edificios = await sp_model.getAllEdificios();

        // Renderizar la vista con edificios
        res.render('Super_admin/edificio', { edificios });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener edificios');
    }
};


// Controlador para insertar un nuevo edificio
exports.createEdificio = async (req, res) => {
    const edificioData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createEdificio(edificioData);
        res.redirect('/sp_admin/Edificio'); // Redirige a la página de lista de edificios después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear edificio: ${err.message}` });
    }
};

// Controlador para actualizar un edificio
exports.updateEdificio = async (req, res) => {
    const edificioData = req.body; // Obtener los datos del cuerpo de la solicitud
//console.log(edificioData);
    try {
        await sp_model.updateEdificio(edificioData); // Llamar al modelo para actualizar el edificio
        res.redirect('/sp_admin/Edificio'); // Redirigir a la página de lista de edificios después de la actualización
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al actualizar edificio: ${err.message}` }); // Respuesta de error
    }
};


// Controlador para eliminar un edificio
exports.deleteEdificio = async (req, res) => {
    const { id_edificio } = req.body; // Obtener el ID del edificio desde el cuerpo de la solicitud

    try {
        await sp_model.deleteEdificio(id_edificio); // Llamar al modelo para eliminar el edificio
        res.redirect('/sp_admin/Edificio'); // Redirigir a la página de lista de edificios después de la eliminación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al eliminar edificio: ${err.message}` }); // Respuesta de error
    }
};

//CONTROLADOR AULA
//Ver Aulas
exports.getAulas = async (req, res) => {
    try {
        // Obtener todas las aulas
        const aulas = await sp_model.getAllAulas();
        
        // Obtener todos los edificios
        const edificios = await sp_model.getAllEdificios(); // Asegúrate de tener esta función en tu modelo

        // Renderizar la vista con las aulas y edificios
        res.render('Super_admin/aula', { aulas, edificios });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener aulas');
    }
};

// Controlador para insertar un nuevo aula
exports.createAula = async (req, res) => {
    const aulaData = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para crear el aula
        await sp_model.createAula(aulaData);
        res.redirect('/sp_admin/Aula'); // Redirigir a la página de lista de aulas después de la creación
    } catch (err) {
        console.error('Error al crear aula:', err);
        res.status(500).json({ message: `Error al crear aula: ${err.message}` });
    }
};
// Controlador para actualizar un aula
exports.updateAula = async (req, res) => {
    const { nombre, sigla, AulaTipo, IdEdificio } = req.body; // Recoger los datos del formulario
    const aulaId = req.params.id; // Suponiendo que usas :id en la ruta

    try {
        // Asegurarse de que todos los campos son válidos
        if (!nombre || !sigla || !AulaTipo || !IdEdificio) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        await sp_model.updateAula(aulaId, { nombre, sigla, AulaTipo, IdEdificio });
        res.redirect('/sp_admin/Aula'); // Redirigir después de la actualización
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al actualizar aula: ${err.message}` });
    }
};
// Controlador para eliminar un aula
exports.deleteAula = async (req, res) => {
    const idAula = req.params.id; // Obtener el ID del aula desde la URL

    try {
        await sp_model.deleteAula(idAula); // Llamar al modelo para eliminar el aula
        res.redirect('/sp_admin/Aula'); // Redirigir a la lista de aulas después de la eliminación
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar aula');
    }
};


//CONTROLADORES DE TRAMITE APERTURA PERIODO
// Mostrar todos los trámites de apertura de periodo
exports.getPeriodo = async (req, res) => {
    try {
        // Obtener todos los periodos
        const periodos = await sp_model.getAllPeriodo();

        // Renderizar la vista con periodos
        res.render('Super_admin/periodo', { periodos });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener el periodo');
    }
};

// Controlador para insertar un nuevo periodos de apertura de periodo
exports.createPeriodo = async (req, res) => {
    const periodoData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createPeriodo(periodoData);
        res.redirect('/sp_admin/periodo'); // Redirige a la página de lista de periodos después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear el periodo: ${err.message}` });
    }
};

// Controlador para editar un trámite de apertura de periodo
exports.editPeriodo = async (req, res) => {
    const periodoData = req.body; // Los datos vienen del cuerpo de la solicitud
    const id_periodo = req.params.id_periodo;
    try {
        await sp_model.updatePeriodo({ ...periodoData, id_periodo });
        res.redirect('/sp_admin/periodo'); // Redirigir a la lista de periodos después de la actualización
    } catch (err) {
        console.error('Error al editar el periodo:', err);
        res.status(500).json({ message: `Error al editar el periodo: ${err.message}` });
    }
};

// Controlador para eliminar un trámite de apertura de periodo
exports.deletePeriodo = async (req, res) => {
    const id_periodo = req.params.id_periodo;  // Obtener el id_periodo del cuerpo de la solicitud

    try {
        await sp_model.deletePeriodo(id_periodo); // Llamada al modelo para eliminar el periodo
        res.redirect('/sp_admin/periodo'); // Redirigir a la lista de periodos después de la eliminación
    } catch (err) {
        console.error('Error al eliminar el periodo:', err);
        res.status(500).json({ message: `Error al eliminar el periodo: ${err.message}` });
    }
};

///// POSIBLEMENTE ESTE SE EDITE PROXIMAMENTE (TRAMITE DE PERIODO)


exports.postGrupo = async (req, res) => {
    try {
        const GrupoData = req.body; // Obtener los datos del formulario
        await sp_model.createGrupo(GrupoData); // Llamar al modelo para agregar el profesor
        res.redirect('/sp_admin/grupo'); // Redirigir después de agregar (ajusta según tu lógica)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Insert Nivel Academico');
    }
};

// DELETE
exports.deleteGrupo = async function(req, res) {
    
    const idGrupo = req.body.idGrupo;
   // console.log(idGrupo); // Obtiene el ID del profesor desde el cuerpo de la solicitud 

    //console.log(id_programa_academico);
    try {
        await sp_model.deleteGrupo(idGrupo); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/grupo'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        res.status(500).send('Error Delete Grupo'); // Maneja el error
    }
};

// UPDATE
exports.updateGrupo = async (req, res) => {
    try {
        // Obtener los datos del formulario
        const data = {
            idGrupo: req.body.idGrupo, 
            id_programa_academico: req.body.id_programa_academico,
            nombre: req.body.nombre,
            cuatrimestre: req.body.cuatrimestre,
            observacion: req.body.observacion,
            periodo: req.body.periodo,
            tutor: req.body.tutor,
            estatus: req.body.estatus
        };

      //  console.log(data);
        // Llamar al método del modelo para actualizar el profesor
        await sp_model.updateGrupo(data);

        // Redirigir o renderizar una vista después de la actualización
        res.redirect('/sp_admin/grupo'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar Grupo:', error);
        // Manejo de errores: puedes redirigir a una vista de error o mostrar un mensaje
        res.status(500).send('Error al actualizar el Grupo'); // Personaliza este mensaje según tu aplicación
    }
};

exports.getGrupos = async (req, res) => {
    try {
        const grupos = await sp_model.getGrupos();

        const programas = await sp_model.getProgramasAcademico();
    
        const periodos = await sp_model.getAllPeriodo();

        const tutores = await sp_model.getProfesoresWithoutGroup();

        res.render('Super_admin/grupo', { grupos, programas, periodos, tutores });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener grupos');
    }
};


exports.getGruposfiltro = async (req, res) => {
    const idPeriodo = req.params.var1; // Obtener el valor de var1
    const idPrograma = req.params.var2; // Obtener el valor de var2
  
  //  console.log('Variable 1:', idPeriodo);
    // console.log('Variable 2:', idPrograma);     
    try {
        const grupos = await sp_model.getGrupos(idPeriodo, idPrograma);
    
    // Lógica basada en la opción seleccionada
   
    res.json( grupos );
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener grupos');
    }
};

//CONTROLADORES DE MATERIA

// Controlador para mostrar todas las materias
exports.getMaterias = async (req, res) => {
    try {
        // Obtener todas las materias
        const materias = await sp_model.getAllMaterias();
        const programa_academico = await sp_model.getProgramasAcademico();

        // Renderizar la vista con las materias
        res.render('Super_admin/materia', { materias,  programa_academico }); 
    } catch (err) {
        console.error('Error al obtener materias:', err);
        res.status(500).send('Error al obtener materias');
    }
};

// Controlador para insertar una nueva materia
exports.createMateria = async (req, res) => {
    const materiaData = req.body; // Supone que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createMateria(materiaData); // Llama al modelo para crear la materia
        res.redirect('/sp_admin/materia'); // Redirige a la página de lista de materias después de la creación
    } catch (err) {
        console.error('Error al crear materia:', err);
        res.status(500).json({ message: `Error al crear materia: ${err.message}` });
    }
};

// Controlador para editar una materia
exports.editMateria = async (req, res) => {
    const materiaData = req.body; // Los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.updateMateria(materiaData); // Llama al modelo para actualizar la materia
        res.redirect('/sp_admin/materia'); // Redirige a la lista de materias después de la actualización
    } catch (err) {
        console.error('Error al editar materia:', err);
        res.status(500).json({ message: `Error al editar materia: ${err.message}` });
    }
};

// Controlador para eliminar una materia
exports.deleteMateria = async (req, res) => {
    const { id_materia } = req.body; // Obtener el id_materia del cuerpo de la solicitud

    try {
        await sp_model.deleteMateria(id_materia); // Llama al modelo para eliminar la materia
        res.redirect('/sp_admin/materia'); // Redirige a la lista de materias después de la eliminación
    } catch (err) {
        console.error('Error al eliminar materia:', err);
        res.status(500).json({ message: `Error al eliminar materia: ${err.message}` });
    }
};


// CONTROLADOR DE BLOQUE
//Ver bloque
exports.getBloques = async (req, res) => {
    try {
        // Obtener todas los bloques
        const bloques = await sp_model.getAllBloques();
        
        // Renderizar la vista de Bloques
        res.render('Super_admin/bloque', { bloques });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener los Bloques');
    }
};

// Controlador para insertar un nuevo Bloque 
exports.createBloque = async (req, res) => {
    const bloqueData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createBloque(bloqueData);
        res.redirect('/sp_admin/bloque'); // Redirige a la página de lista de Bloque después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear bloque: ${err.message}` });
    }
};

// Controlador para editar un bloque de apertura de periodo
exports.editBloque = async (req, res) => {
    const bloqueData = req.body; // Los datos vienen del cuerpo de la solicitud
    const idBloque = req.params.idBloque;
    // console.log(bloqueData, idBloque);
    try {
        await sp_model.updateBloque({ ...bloqueData, idBloque });
        res.redirect('/sp_admin/bloque'); // Redirigir a la lista de bloques después de la actualización
    } catch (err) {
        console.error('Error al editar bloque:', err);
        res.status(500).json({ message: `Error al editar bloque: ${err.message}` });
    }
};

// Controlador para eliminar un bloque
exports.deleteBloque = async (req, res) => {
    const idBloque = req.params.idBloque;  // Obtener el IdBloque del cuerpo de la solicitud

    try {
        await sp_model.deleteBloque(idBloque); // Llamada al modelo para eliminar el bloque
        res.redirect('/sp_admin/bloque'); // Redirigir a la lista de bloques después de la eliminación
    } catch (err) {
        console.error('Error al eliminar bloque:', err);
        res.status(500).json({ message: `Error al eliminar bloque: ${err.message}` });
    }
};


//CONTROLADORES DE HORARIO

exports.getHorarios = async (req, res) => {
    try {
        // Obtener todos los horarios
        const horarios = await sp_model.getAllHorarios(); 
        
        // Obtener todos los grupos de materias, si necesitas usarlos en la vista
        const gruposMaterias = await sp_model.getAllGrupoMaterias(); // Asegúrate de tener esta función en tu modelo

        // Obtener todos los bloques, si necesitas usarlos en la vista
        const bloques = await sp_model.getAllBloques(); // Asegúrate de tener esta función en tu modelo

        // Renderizar la vista con los horarios, grupos de materias y bloques
        res.render('Super_admin/horario', { horarios, gruposMaterias, bloques });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener horarios');
    }
};


exports.createHorario = async (req, res) => {
    const horarioData = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para crear el horario
        await sp_model.createHorario(horarioData);
        res.redirect('/sp_admin/carga_horaria'); // Redirigir a la página de lista de horarios después de la creación
    } catch (err) {
        console.error('Error al crear horario:', err);
        res.status(500).json({ message: `Error al crear horario: ${err.message}` });
    }
};

exports.updateHorario = async (req, res) => {
    const { idHorario, idGrupoMateria, idBloque, dia } = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para actualizar el horario
        await sp_model.updateHorario(idHorario, { idGrupoMateria, idBloque, dia });
        res.redirect('/sp_admin/carga_horaria'); // Redirigir a la página de lista de horarios después de la actualización
    } catch (err) {
        console.error('Error al actualizar horario:', err);
        res.status(500).json({ message: `Error al actualizar horario: ${err.message}` });
    }
};


exports.deleteHorario = async (req, res) => {
    const { idHorario } = req.body; // Obtener el ID del horario desde el formulario

    try {
        // Llamar al modelo para eliminar el horario
        await sp_model.deleteHorario(idHorario);
        res.redirect('/sp_admin/carga_horaria'); // Redirigir a la página de lista de horarios después de la eliminación
    } catch (err) {
        console.error('Error al eliminar horario:', err);
        res.status(500).json({ message: `Error al eliminar horario: ${err.message}` });
    }
};




//CONTROLADORES DE GRUPOMATERIA
//proxio a eliminar
exports.getGruposByProgramaAndPeriodo = async (req, res) => {
    const { idPrograma, idPeriodo } = req.query;
  //  console.log('idPrograma:', idPrograma);
  //  console.log('idPeriodo:', idPeriodo);

    if (!idPrograma || !idPeriodo) {
        return res.status(400).send('Faltan parámetros obligatorios: idPrograma o idPeriodo');
    }

    try {
        const grupos = await sp_model.getGrupos(idPeriodo, idPrograma);
     //   console.log('Resultado de getGrupos:', grupos);
        res.json(grupos);
    } catch (err) {
        console.error('Error al obtener grupos:', err.message || err);
        res.status(500).send('Error al obtener Grupos');
    }
};

exports.getMapaCurricularByPrograma = async (req, res) => {
    const { idPrograma } = req.query;
    try {
        const mapaCurricular = await sp_model.getMapaCurricularByPrograma(idPrograma);
        res.json(mapaCurricular);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el Mapa Curricular');
    }
};


exports.getGrupo_Materias_api = async (req, res) => {
    const { idGrupo } = req.query;

    // Validar que el parámetro idGrupo está presente
    if (!idGrupo) {
        return res.status(400).json({ error: 'El parámetro idGrupo es requerido.' });
    }

    try {
        const grupoMaterias = await sp_model.getAllGrupoMaterias(idGrupo);
        res.json(grupoMaterias);
       // console.log('GrupoMaterias:', grupoMaterias);
    } catch (error) {
        console.error('Error al obtener las materias del grupo:', error);
        res.status(500).json({ error: 'Error al obtener las materias del grupo.' });
    }
};


exports.grupoMaterias_sin_horario = async (req, res) => {
    const { idGrupo } = req.query;

    // Validar que el parámetro idGrupo está presente
    if (!idGrupo) {
        return res.status(400).json({ error: 'El parámetro idGrupo es requerido.' });
    }

    try {
        const grupoMaterias = await sp_model.grupoMaterias_sin_horario(idGrupo);
        res.json(grupoMaterias);
       // console.log('GrupoMaterias:', grupoMaterias);
    } catch (error) {
        console.error('Error al obtener las materias del grupo:', error);
        res.status(500).json({ error: 'Error al obtener las materias del grupo.' });
    }
};

exports.DeleteGrupo_Materias_api = async (req, res) => {
    const { idGrupoMateria } = req.query; // O usa `req.body` si decides enviar el ID en el cuerpo

   // console.log('idGrupoMateria recibido en el controlador:', idGrupoMateria); // Log para depuración

    // Validar que el parámetro idGrupoMateria está presente
    if (!idGrupoMateria) {
        return res.status(400).json({ error: 'El parámetro idGrupoMateria es requerido.' });
    }

    try {
        // Llamada al modelo para eliminar la materia del grupo
        const resultado = await sp_model.deleteGrupoMateria(idGrupoMateria);

        if (resultado.affectedRows > 0) {
            res.json({ message: 'Materia eliminada con éxito.' });
        } else {
            res.status(404).json({ error: 'Materia no encontrada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la materia del grupo:', error);
        res.status(500).json({ error: 'Error al eliminar la materia del grupo.' });
    }
};


exports.create_gm_horario = async (req, res) => {
    const horarioData = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para crear el horario
        await sp_model.createHorario(horarioData);
        res.json({ message: 'insersion  con éxito.' });
    } catch (err) {
        console.error('Error al crear horario:', err);
        res.status(500).json({ message: `Error al crear horario: ${err.message}` });
    }
};


// Obtener todas las relaciones de GrupoMateria



exports.getGrupoMaterias = async (req, res) => {
    try {
        const grupoMaterias = await sp_model.getAllGrupoMaterias(); // Obtener todas las relaciones
        const grupos = await sp_model.getGrupos(); // Obtener todos los grupos
        const mapaCurricular = await sp_model.getAllMapaCurricular(); // Obtener todos los mapas curriculares
        const periodos = await sp_model.getAllPeriodo();
        const programas = await sp_model.getProgramasAcademico();
        const tutores = await sp_model.getProfesoresWithoutGroup();
        const gruposMaterias = await sp_model.getAllGrupoMaterias(); // Asegúrate de tener esta función en tu modelo
        const bloques = await sp_model.getAllBloques(); // Asegúrate de tener esta función en tu modelo
        res.render('Super_admin/materiagrupo', { grupoMaterias, grupos, mapaCurricular , periodos, programas ,tutores,gruposMaterias,bloques});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener GrupoMateria');
    }
};

// Obtener relaciones de GrupoMateria con filtro
exports.getGrupoMateriasFiltro = async (req, res) => {
    const idGrupo = req.params.var1; // Obtener el valor de var1
    const idMapaCurricular = req.params.var2; // Obtener el valor de var2

  //  console.log('Variable 1:', idGrupo);
   // console.log('Variable 2:', idMapaCurricular);

    try {
        const grupoMaterias = await sp_model.getAllGrupoMaterias(idGrupo, idMapaCurricular);
        res.json(grupoMaterias);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener GrupoMateria con filtro');
    }
};


// Crear una nueva relación en GrupoMateria
exports.postGrupoMateria = async (req, res) => {
    try {
   //     console.log(req.body);  // Para ver los valores enviados

        const {  id_grupo, idMapaCurricular, tipo,id_profesor } = req.body;

        if (!id_grupo || !idMapaCurricular) {
            return res.status(400).send('Grupo y Materia son obligatorios');
        }

        await sp_model.createGrupoMateria(req.body);
            res.json({ message: 'insersion  con éxito.' });
   
    } catch (err) {
        console.error('Error en postGrupoMateria:', err);
        res.status(500).send('Error al insertar GrupoMateria');
    }
};


// Actualizar una relación en GrupoMateria
exports.updateGrupoMateria = async (req, res) => {
    try {
        const data = {
            id_grupo_materia: req.body.id_grupo_materia,
            id_grupo: req.body.id_grupo,
            idMapaCurricular: req.body.idMapaCurricular,
            tipo: req.body.tipo,
            fecha: req.body.fecha
        };

        await sp_model.updateGrupoMateria(data); // Llamar al modelo para actualizar
        res.redirect('/sp_admin/grupoMateria'); // Cambia la ruta según tu aplicación
    } catch (error) {
        console.error('Error al actualizar GrupoMateria:', error);
        res.status(500).send('Error al actualizar GrupoMateria');
    }
};


// Eliminar una relación en GrupoMateria
exports.deleteGrupoMateria = async (req, res) => {
    const idGrupoMateria = req.body.id_grupo_materia; // Obtener el ID de la relación
//    console.log(idGrupoMateria);

    try {
        await sp_model.deleteGrupoMateria(idGrupoMateria); // Llamar al método del modelo para eliminar
        res.redirect('/sp_admin/grupoMateria'); // Redirigir a la lista de GrupoMateria después de eliminar
    } catch (error) {
        console.error('Error al eliminar GrupoMateria:', error);
        res.status(500).send('Error al eliminar GrupoMateria'); // Manejo de errores
    }
};

//CONTROLADORES DE ACTIVIDAD
// Mostrar todas las actividades
exports.getActividades = async (req, res) => {
    try {
        // Obtener todas las actividades
        const actividades = await sp_model.getAllActividad();

        // Renderizar la vista con actividades
        res.render('Super_admin/actividad', { actividades });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener actividades');
    }
};

// Controlador para insertar una nueva actividad
exports.createActividad = async (req, res) => {
    const actividadData = req.body; // Supongamos que los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.createActividad(actividadData); // Llamada al modelo correcto
        res.redirect('/sp_admin/actividad'); // Redirige a la página de lista de actividades después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear actividad: ${err.message}` });
    }
};

// Controlador para editar una actividad
exports.editActividad = async (req, res) => {
    const actividadData = req.body; // Los datos vienen del cuerpo de la solicitud

    try {
        await sp_model.updateActividad(actividadData); // Llamada al modelo correcto
        res.redirect('/sp_admin/actividad'); // Redirigir a la lista de actividades después de la actualización
    } catch (err) {
        console.error('Error al editar actividad:', err);
        res.status(500).json({ message: `Error al editar actividad: ${err.message}` });
    }
};

// Controlador para eliminar una actividad
exports.deleteActividad = async (req, res) => {
    const { IdActividad } = req.body; // Obtener el IdActividad del cuerpo de la solicitud

    try {
        await sp_model.deleteActividad(IdActividad); // Llamada al modelo correcto para eliminar la actividad
        res.redirect('/sp_admin/actividad'); // Redirigir a la lista de actividades después de la eliminación
    } catch (err) {
        console.error('Error al eliminar actividad:', err);
        res.status(500).json({ message: `Error al eliminar actividad: ${err.message}` });
    }
};



// CONTROLADOR DE TRAMITE
//Ver tramite
exports.getTramites = async (req, res) => {
    try {
        // Obtener todas los Tramite
        const tramites = await sp_model.getAllTramite();
        
        // Renderizar la vista de Tramite
        res.render('Super_admin/tramite', { tramites });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener los Tramite');
    }
};

exports.createTramite = async (req, res) => {
    const tramiteData = req.body; // Datos provenientes de la solicitud POST

    // Verifica si los datos están correctos
  //  console.log('Datos recibidos:', tramiteData);

    try {
        await sp_model.createTramite(tramiteData);
        res.redirect('/sp_admin/tramites'); // Redirige después de la creación
    } catch (err) {
        console.error('Error al crear trámite:', err);
        res.status(500).json({ message: `Error al crear tramite: ${err.message}` });
    }
};


// Controlador para editar un tramite de apertura de periodo
exports.editTramite = async (req, res) => {
    const tramiteData = req.body; // Los datos vienen del cuerpo de la solicitud
    const IdTramite = req.params.IdTramite;
    try {
        await sp_model.updateTramite({ ...tramiteData, IdTramite });
        res.redirect('/sp_admin/tramites'); // Redirigir a la lista de tramites después de la actualización
    } catch (err) {
        console.error('Error al editar tramite:', err);
        res.status(500).json({ message: `Error al editar tramite: ${err.message}` });
    }
};

// Controlador para eliminar un Tramite
exports.deleteTramite = async (req, res) => {
    const IdTramite = req.params.IdTramite;  // Obtener el IdTramite del cuerpo de la solicitud

    try {
        await sp_model.deleteTramite(IdTramite); // Llamada al modelo para eliminar el tramite
        res.redirect('/sp_admin/tramites'); // Redirigir a la lista de tramite después de la eliminación
    } catch (err) {
        console.error('Error al eliminar tramite:', err);
        res.status(500).json({ message: `Error al eliminar tramite: ${err.message}` });
    }
};

// CONTROLADORES DE TramiteProceso
// Mostrar todos los TramiteProceso
exports.getTramiteProceso = async (req, res) => {
    try {
        // Obtener todos los TramiteProceso
        const tramiteProceso = await sp_model.getTramiteProceso();
        const tramite = await sp_model.getAllTramite();
        const actividad = await sp_model.getAllActividad();

        // Renderizar la vista con los datos de TramiteProceso
        res.render('Super_admin/tramite_proceso', { tramiteProceso, tramite, actividad });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener TramiteProceso');
    }
};

exports.createTramiteProceso = async (req, res) => {
    const tramiteProcesoData = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para crear el TramiteProceso
        await sp_model.createTramiteProceso(tramiteProcesoData);

        // Redirigir a la página de lista de TramiteProceso después de la creación
        res.redirect('/sp_admin/tramite_proceso'); // Cambia la ruta según corresponda

    } catch (err) {
        console.error('Error al crear TramiteProceso:', err);
        res.status(500).json({ message: `Error al crear TramiteProceso: ${err.message}` });
    }
};


// Método para manejar la actualización del Proceso de Trámite
exports.updateTramiteProceso = async (req, res) => {
    // Obtener los datos enviados desde el formulario
    const { id, id_tramite, id_actividad, objeto, orden } = req.body;

    // Verificar si los datos son válidos antes de continuar
    if (!id || !id_tramite || !id_actividad || !objeto || !orden) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // Llamar al método en el modelo para actualizar el Proceso de Trámite
        await sp_model.updateTramiteProceso({
            id,
            id_tramite,
            id_actividad,
            objeto,
            orden
        });

        // Redirigir a la lista de procesos de trámite después de la actualización
        res.redirect('/sp_admin/tramite_proceso');  // Ajusta la URL de redirección según tu caso

    } catch (err) {
        console.error('Error al actualizar el Proceso de Trámite:', err);
        res.status(500).json({ message: `Error al actualizar el Proceso de Trámite: ${err.message}` });
    }
};

exports.deleteTramiteProceso = async (req, res) => {
    const { idTramiteProceso } = req.body; // Obtener el ID del proceso de trámite desde el formulario

    try {
        // Llamar al modelo para eliminar el proceso de trámite
        await sp_model.deleteTramiteProceso(idTramiteProceso);
        
        // Redirigir a la página de listado de procesos de trámite o donde prefieras
        res.redirect('/sp_admin/tramite_proceso'); 
    } catch (err) {
        console.error('Error al eliminar el proceso de trámite:', err);
        res.status(500).json({ message: `Error al eliminar el proceso de trámite: ${err.message}` });
    }
};


//Controlador de alumnotramite

exports.getAlumnoTramite = async (req, res) => {
    try {
        // Obtener todos los TramiteProceso
        const Alumnotramite = await sp_model.getAlumnoTramite();
        const tramites = await sp_model.getAllTramite();


        // Renderizar la vista con los datos de TramiteProceso
        res.render('Super_admin/seguimiento_tramite', { Alumnotramite, tramites  });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener TramiteProceso');
    }
};

exports.get_Nuevo_tramite = async (req, res) => {
    try {
        // Obtener todos los TramiteProceso
        const Alumnotramite = await sp_model.getAllStudents();
        const tramites = await sp_model.getAllTramite();
        const periodos = await sp_model.getAllPeriodo();


        // Renderizar la vista con los datos de TramiteProceso
        res.render('Super_admin/nuevo_tramite', { Alumnotramite, tramites, periodos  });
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al obtener TramiteProceso');
    }
};


exports.create_nuevo_tramite_alumno = async (req, res) => {
    const data = req.body; // Obtener los datos enviados desde el formulario
//console.log(data);
    try {
        // Llamar al modelo para crear el TramiteProceso
        await sp_model.createTramiteAlumno(data);

        // Redirigir a la página de lista de TramiteProceso después de la creación
        res.redirect('/sp_admin/Nuevo_tramite'); // Cambia la ruta según corresponda

    } catch (err) {
        console.error('Error al crear TramiteProceso:', err);
        res.status(500).json({ message: `Error al crear TramiteProceso: ${err.message}` });
    }
};

//CONTROLADORES ALUMNO TRAMITE

// Mostrar todos los registros de AlumnoTramite
exports.getAlumnoTramites = async (req, res) => {
    try {
        const alumnoTramites = await sp_model.getAllAlumnoTramites(); // Llama al modelo para obtener los registros
        const tramite = await sp_model.getAllTramite();
        const alumnos = await sp_model.getAllStudents();
        const programas = await sp_model.getProgramasAcademico();
        const periodos = await sp_model.getAllPeriodo();

        res.render('Super_admin/alumnoT', { alumnoTramites, tramite, alumnos, programas, periodos }); // Renderiza la vista con los datos obtenidos
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener registros de AlumnoTramite');
    }
};

// Controlador para insertar un nuevo registro en AlumnoTramite
exports.createAlumnoTramite = async (req, res) => {
    const tramiteData = req.body; // Datos del cuerpo de la solicitud

    try {
        await sp_model.createAlumnoTramite(tramiteData); // Llama al modelo para crear el registro
        res.redirect('/sp_admin/alumnoT'); // Redirige a la lista después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear AlumnoTramite: ${err.message}` });
    }
};

// Controlador para editar un registro en AlumnoTramite
exports.editAlumnoTramite = async (req, res) => {
    const tramiteData = req.body; // Datos del cuerpo de la solicitud

    // Elimina IdAlumno de los datos para que no se intente actualizar
    delete tramiteData.IdAlumno;

    try {
        await sp_model.updateAlumnoTramite(tramiteData); // Llama al modelo para actualizar el registro
        res.redirect('/sp_admin/alumnoT'); // Redirige a la lista después de la actualización
    } catch (err) {
        console.error('Error al editar AlumnoTramite:', err);
        res.status(500).json({ message: `Error al editar AlumnoTramite: ${err.message}` });
    }
};

// Controlador para eliminar un registro en AlumnoTramite
exports.deleteAlumnoTramite = async (req, res) => {
    const { id_alumno_tramite } = req.body; // Obtiene el ID del cuerpo de la solicitud

    try {
        await sp_model.deleteAlumnoTramite(id_alumno_tramite); // Llama al modelo para eliminar el registro
        res.redirect('/sp_admin/alumnoT'); // Redirige a la lista después de la eliminación
    } catch (err) {
        console.error('Error al eliminar AlumnoTramite:', err);
        res.status(500).json({ message: `Error al eliminar AlumnoTramite: ${err.message}` });
    }
};


exports.getAlumnosPa = async (req, res) => {

    try {
        const alumnos = await sp_model.getAllStudents();
        const alumnosPa = await sp_model.getAllAlumnosPa();
        const periodos = await sp_model.getAllPeriodo();
        const programas = await  sp_model.getprograma_student();

        res.render('Super_admin/alumno_pa', { alumnos, alumnosPa, periodos, programas }); // Renderiza la vista con los datos obtenidos
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener registros de AlumnoTramite');
    }

}

exports.createAlumnoPa = async (req, res) => {
    const alumnoData = req.body; // Datos del cuerpo de la solicitud

    try {
        await sp_model.createAlumnoPa(alumnoData); // Llama al modelo para crear el registro
        res.redirect('/sp_admin/alumno_pa'); // Redirige a la lista después de la creación
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error al crear AlumnoPA: ${err.message}` });
    }
};

exports.deleteAlumnoPa = async function(req, res) {
    
    const idAlumnoPa = req.body.idAlumnoPrograma;

    try {
        await sp_model.deleteAlumnoPa(idAlumnoPa); // Llama al método del modelo para eliminar
        res.redirect('/sp_admin/alumno_pa'); // Redirige a la lista de profesores después de eliminar
    } catch (error) {
        console.error('Error al eliminar AlumnoPA:', error);
        res.status(500).send('Error Delete AlumnoPA'); // Maneja el error
    }
};

exports.editAlumnoPa = async (req, res) => {
    const data = {
        idAlumnoPa: req.body.idAlumnoPrograma, 
        id_programa_academico: req.body.id_programa_academico,
        id_periodo: req.body.id_periodo,
        matricula: req.body.matricula,
        estatus: req.body.estatus,
        desde: req.body.desde,
        hasta: req.body.hasta
    };

    try {
        await sp_model.editAlumnoPa(data); // Llama al modelo para actualizar el registro
        res.redirect('/sp_admin/alumno_pa'); // Redirige a la lista después de la actualización
    } catch (err) {
        console.error('Error al editar AlumnoTramite:', err);
        res.status(500).json({ message: `Error al editar AlumnoTramite: ${err.message}` });
    }
};

exports.validaAlumnoPrograma = async (req, res) => {
    const IdAlumno = req.params.alumnoSeleccionado;
  //   console.log(IdAlumno)
    try {
        const alumno = await sp_model.valdiarAlumnoPa(IdAlumno);
        res.json( alumno );
    } catch (err) {
        // Manejo de errores
        console.error(err);
        res.status(500).send('Error al validar alumno');
    }

}


// CONTROLADORES DE AlumnoProceso
// Mostrar todos los AlumnoProceso
exports.getAlumnoProceso = async (req, res) => {
    try {
        const alumnoproceso = await sp_model.getAlumnoProceso();
       // console.log('AlumnoProceso:', alumnoproceso);
    
        const tramite = await sp_model.getAllTramite();
        //console.log('Tramite:', tramite);
    
        const tramiteProceso = await sp_model.getTramiteProceso();
        //console.log('TramiteProceso:', tramiteProceso);
    
        const actividad = await sp_model.getAllActividad();
        //console.log('Actividad:', actividad);
    
        const alumnoTramites = await sp_model.getAllAlumnoTramites(); // Llama al modelo para obtener los registros
        //console.log('AlumnoTramites:', alumnoTramites);

        res.render('Super_admin/alumno_proceso', { alumnoproceso, tramite, tramiteProceso, actividad, alumnoTramites });
    } catch (err) {
        console.error('Error detallado en controlador getAlumnoProceso:', err);
    }
    
};

exports.createAlumnoProcesos = async (req, res) => {
    const AlumnoProcesoData = req.body; // Obtener los datos enviados desde el formulario

    try {
        // Llamar al modelo para crear el AlumnoProceso
        await sp_model.createAlumnoProcesos(AlumnoProcesoData);

        // Redirigir a la página de lista de AlumnoProceso después de la creación
        res.redirect('/sp_admin/alumno_proceso'); // Cambia la ruta según corresponda

    } catch (err) {
        console.error('Error al crear AlumnoProceso:', err);
        res.status(500).json({ message: `Error al crear AlumnoProceso: ${err.message}` });
    }
};

 // Controlador para editar un registro en Alumno Proceso
exports.editAlumnoProceso = async (req, res) => {
    const ProsesoData = req.body; // Datos del cuerpo de la solicitud

   // console.log(ProsesoData);
    try {
        await sp_model.updateAlumnoProceso(ProsesoData); // Llama al modelo para actualizar el registro
        res.redirect('/sp_admin/alumno_proceso'); // Redirige a la lista después de la actualización
    } catch (err) {
        console.error('Error al editar AlumnoProceso:', err);
        res.status(500).json({ message: `Error al editar AlumnoProceso: ${err.message}` });
    }
};

// Controlador para eliminar un registro en AlumnoProceso
exports.deleteAlumnoProceso = async (req, res) => {
    const { IdAlumnoProceso } = req.body; // Obtiene el ID del cuerpo de la solicitud

    try {
        await sp_model.deleteAlumnoProceso(IdAlumnoProceso); // Llama al modelo para eliminar el registro
        res.redirect('/sp_admin/alumno_proceso'); // Redirige a la lista después de la eliminación
    } catch (err) {
        console.error('Error al eliminar AlumnoProceso:', err);
        res.status(500).json({ message: `Error al eliminar AlumnoProceso: ${err.message}` });
    }
};



// Controlador para obtener los datos de AlumnoProceso y renderizarlos en la vista
exports.verProcedimientoTramiteID = async (req, res) => {
    // Obtén el IdAlumnoTramite desde los parámetros de la URL
    const { id } = req.query;
    //console.log(id);
    try {
        // Llama a la función de consulta y pásale el IdAlumnoTramite
        const resultados = await sp_model.getAlumnoprocesowhereId(id);
        const alumno = await sp_model.getAlumno_alumnoproceso_Id(id);

        if (!resultados || resultados.length === 0) {
            console.warn('No se encontraron registros en AlumnoProceso.');
            return res.status(404).send('No se encontraron registros en AlumnoProceso.');
        }

        // Renderiza la vista con los resultados de la consulta
        res.render('Super_admin/procedimiento_tramite', { resultados, alumno });
    } catch (error) {
        console.error('Error al obtener los datos de AlumnoProceso:', error.message);
        res.status(500).send('Error al obtener los datos de AlumnoProceso.');
    }
};