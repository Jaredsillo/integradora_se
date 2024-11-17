const db = require('../config/connect_bd');
const bcrypt = require('bcryptjs');



// Modelo para registrar la acción en la bitacora
exports.addBitacora = async (nombre_usuario, movimiento, accion, ip) => {
    return new Promise(async (resolve, reject) => {
        const query = `
            INSERT INTO Bitacora (nombre_usuario, movimiento, accion, ip, fecha)
            VALUES (?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '-06:00'))
        `;

        try {
            await db.query(query, [nombre_usuario, movimiento, accion, ip]);
            resolve(); // Resuelve la promesa si se registra la acción
        } catch (error) {
            console.error('Error al registrar la acción:', error);
            reject(error);
        }
    });
};


// Modelo para obtener las acciones registradas en la bitacora
exports.getBitacora = async () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT id_bitacora, nombre_usuario, movimiento, accion, ip, fecha
            FROM Bitacora
        `;

        try {
            const [rows] = await db.query(query); // Ejecuta la consulta y obtiene las filas
            resolve(rows); // Resuelve la promesa con los resultados
        } catch (error) {
            console.error('Error al obtener registros de la bitacora:', error);
            reject(error); // Rechaza la promesa si hay un error
        }
    });
};


//crud para personas

// Obtener todas las personas
exports.getAllPersonas = async () => {
    const query = `
        SELECT 
            id_persona, 
            nombre, 
            apellido_paterno, 
            apellido_materno, 
            genero, 
            direccion, 
            telefono,
            curp,
            fecha_nacimiento
        FROM 
            Persona
    `;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener personas: ${err.message}`);
    }
};

// Modelo para agregar una nueva persona
exports.createPersona = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { nombre, apellido_paterno, apellido_materno, genero, direccion, telefono, curp, fecha_nacimiento } = data;

        // Consulta SQL para verificar si la CURP ya existe
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Persona
            WHERE curp = ?
        `;

        // Consulta SQL para insertar una nueva persona
        const insertQuery = `
            INSERT INTO Persona (nombre, apellido_paterno, apellido_materno, genero, direccion, telefono, curp, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [curp]);
            if (rows[0].count > 0) {
                // Si la CURP ya existe, rechazar la promesa
                return reject(new Error('La CURP ya está registrada.'));
            }

            // Ejecutar la consulta de inserción con los valores proporcionados
            await db.query(insertQuery, [nombre, apellido_paterno, apellido_materno, genero, direccion, telefono, curp, fecha_nacimiento]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar persona:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Modelo para editar una persona
exports.updatePersona = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_persona, nombre, apellido_paterno, apellido_materno, genero, direccion, telefono, curp, fecha_nacimiento } = data;

        // Consulta SQL para verificar si la CURP ya existe en otra persona
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Persona
            WHERE curp = ? AND id_persona != ?
        `;

        // Consulta SQL para actualizar los datos de la persona
        const updateQuery = `
            UPDATE Persona 
            SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, direccion = ?, telefono = ?, curp = ?, fecha_nacimiento = ?
            WHERE id_persona = ?
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [curp, id_persona]);
            if (rows[0].count > 0) {
                // Si la CURP ya existe en otra persona, rechazar la promesa
                return reject(new Error('La CURP ya está registrada en otra persona.'));
            }

            // Ejecutar la consulta de actualización con los valores proporcionados
            await db.query(updateQuery, [nombre, apellido_paterno, apellido_materno, genero, direccion, telefono, curp, fecha_nacimiento, id_persona]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar persona:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Método para eliminar una persona
exports.deletePersona = async function(id_persona) {
    try {
        const [result] = await db.execute(`DELETE FROM Persona WHERE id_persona = ?`, [id_persona]);
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error('Error al eliminar persona:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};



//crud para usuarios y roles 

exports.getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                u.id_user,
                u.usuario,
                u.contrasena,
                u.estatus,
                p.id_persona,  -- Se mantiene id_persona
                p.nombre,  -- Cambia el alias para mantener el nombre original
                p.apellido_paterno,  -- Cambia el alias para mantener el apellido_paterno original
                p.apellido_materno,  -- Cambia el alias para mantener el apellido_materno original
                GROUP_CONCAT(r.nombre SEPARATOR ', ') AS roles,
                GROUP_CONCAT(r.id_rol SEPARATOR ', ') AS rolesIds  -- Agregar esto para obtener los IDs de los roles
            FROM 
                Usuario u
            LEFT JOIN 
                Persona p ON u.id_persona = p.id_persona
            LEFT JOIN 
                Rol_Usuario ru ON u.id_user = ru.id_usuario
            LEFT JOIN 
                Rol r ON ru.id_rol = r.id_rol
            GROUP BY 
                u.id_user, p.id_persona;  -- Se mantiene agrupación por id_user e id_persona
        `;

        try {
            const [results] = await db.query(query); // Ejecuta la consulta y espera el resultado
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

//buscar persona sin usuario
exports.getPersonsWithoutUsers = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                Persona.id_persona,
                Persona.nombre,
                Persona.apellido_paterno,
                Persona.apellido_materno,
                Persona.curp
            FROM 
                Persona
            LEFT JOIN 
                Usuario ON Usuario.id_persona = Persona.id_persona
            WHERE 
                Usuario.id_user IS NULL;  -- Solo personas sin usuarios
        `;
        try {
            const [results] = await db.query(query); // Ejecuta la consulta y espera el resultado
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Obtener todos los roles con sus respectivos usuarios
exports.getRolesConUsuarios = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                r.id_rol,
                r.nombre AS nombre_rol,
                ru.id_usuario,       -- ID del usuario relacionado con el rol
                u.usuario AS nombre_usuario   -- Nombre del usuario
            FROM 
                Rol r
            LEFT JOIN 
                Rol_Usuario ru ON r.id_rol = ru.id_rol
            LEFT JOIN 
                Usuario u ON ru.id_usuario = u.id_user
            GROUP BY 
                r.id_rol, r.nombre, ru.id_usuario, u.usuario; -- Agrupando por los campos seleccionados
        `;
        
        try {
            const [results] = await db.query(query); // Ejecuta la consulta y espera el resultado
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


exports.createUserWithRole = async (id_persona, usuario, contrasena, estatus, id_rol) => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL para verificar si el usuario ya existe
        const checkUserQuery = `
            SELECT COUNT(*) AS count FROM Usuario WHERE usuario = ?
        `;

        // Consulta SQL para insertar un nuevo usuario
        const insertUserQuery = `
            INSERT INTO Usuario (id_persona, usuario, contrasena, estatus)
            VALUES (?, ?, ?, ?)
        `;

        // Consulta SQL para insertar la relación en la tabla Rol_Usuario
        const insertRolUsuarioQuery = `
            INSERT INTO Rol_Usuario (id_usuario, id_rol)
            VALUES (?, ?)
        `;

        try {
            // Verificar si el usuario ya existe
            const [checkResult] = await db.query(checkUserQuery, [usuario]);
            if (checkResult[0].count > 0) {
                return reject(new Error('El usuario ya existe'));
            }

            // Ejecutar la consulta para insertar el nuevo usuario
            const [userResult] = await db.query(insertUserQuery, [id_persona, usuario, contrasena, estatus]);

            // Obtener el ID del nuevo usuario insertado
            const newUserId = userResult.insertId;

            // Ejecutar la consulta para insertar la relación en la tabla Rol_Usuario
            await db.query(insertRolUsuarioQuery, [newUserId, id_rol]);

            resolve(newUserId); // Retorna el ID del nuevo usuario

        } catch (error) {
            console.error('Error al crear usuario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

exports.deleteUserById = async (id_user) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Eliminar el usuario de la tabla Rol_Usuario
            const deleteRolUsuarioQuery = `
                DELETE FROM Rol_Usuario
                WHERE id_usuario = ?
            `;
            await db.query(deleteRolUsuarioQuery, [id_user]);

            // Eliminar el usuario de la tabla Usuario
            const deleteUserQuery = `
                DELETE FROM Usuario
                WHERE id_user = ?
            `;
            await db.query(deleteUserQuery, [id_user]);

            resolve(); // Retorna éxito si todo sale bien

        } catch (error) {
            console.error('Error al eliminar usuario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

exports.updateUserById = async (id_usuario, id_persona, usuario, estatus) => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL para verificar si el nombre de usuario ya existe en otro usuario
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Usuario
            WHERE usuario = ? AND id_user != ?
        `;

        // Consulta SQL para actualizar los datos del usuario
        let updateUserQuery = `
            UPDATE Usuario
            SET usuario = ?, estatus = ?
        `;
        const queryParams = [usuario, estatus];

        // Verificar si se proporciona id_persona
        if (id_persona) {
            updateUserQuery += ', id_persona = ?';
            queryParams.push(id_persona);
        }

        updateUserQuery += ' WHERE id_user = ?';
        queryParams.push(id_usuario);

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [usuario, id_usuario]);
            if (rows[0].count > 0) {
                // Si el nombre de usuario ya existe en otro usuario, rechazar la promesa
                return reject(new Error('El nombre de usuario ya está registrado en otro usuario.'));
            }

            // Ejecutar la consulta para actualizar el usuario
            await db.query(updateUserQuery, queryParams);
            resolve(); // Retorna éxito si todo sale bien

        } catch (error) {
            console.error('Error al actualizar usuario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Función para agregar rol a un usuario
exports.addRol = async (id_usuario, id_rol) => {
    try {
        const query = 'INSERT INTO rol_usuario (id_usuario, id_rol) VALUES (?, ?)';
        const [result] = await db.execute(query, [id_usuario, id_rol]); // Utilizamos parámetros para evitar SQL Injection
        return result;
    } catch (error) {
        throw new Error('Error al agregar rol al usuario: ' + error.message);
    }
};


// Función para eliminar rol de un usuario
exports.deleteRol = async (id_usuario, id_rol) => {
    try {
        const query = 'DELETE FROM rol_usuario WHERE id_usuario = ? AND id_rol = ?';
        const [result] = await db.execute(query, [id_usuario, id_rol]); // Utilizamos parámetros para evitar SQL Injection
        return result;
    } catch (error) {
        throw new Error('Error al eliminar rol del usuario: ' + error.message);
    }
};
// Modelo para la funciones del crud de alumno 

// Mostrar todos los alumnos con su información y el nombre del programa académico
exports.getAllStudents = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
              Alumno.id_alumno, 
              Alumno.matricula, 
              Alumno.email,
              ProgramaAcademico.id_programa_academico,  -- ID del programa académico 
              ProgramaAcademico.nombre AS programa_academico,  -- Nombre del programa académico
              Alumno.promedio, 
              Alumno.cuatrimestre, 
              Alumno.fecha_registro, 
              Persona.nombre, 
              Persona.apellido_paterno, 
              Persona.apellido_materno
            FROM 
              Alumno
            INNER JOIN 
              Persona ON Alumno.id_alumno = Persona.id_persona
            INNER JOIN 
              ProgramaAcademico ON Alumno.id_programa_academico = ProgramaAcademico.id_programa_academico  -- JOIN con ProgramaAcademico
        `;
        try {
            const [results] = await db.query(query); // Usa await para esperar el resultado
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre una excepción
        }
    });
};

// Obtener todos los programas académicos
exports.getprograma_student = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
              id_programa_academico, 
              nombre 
            FROM 
              ProgramaAcademico
        `;
        try {
            const [results] = await db.query(query);
            resolve(results); // Resuelve con todos los programas académicos
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};
exports.getPersonsWithoutStudents = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                Persona.id_persona,
                Persona.nombre,
                Persona.apellido_paterno,
                Persona.apellido_materno,
                Persona.curp
            FROM 
                Persona
            LEFT JOIN 
                Alumno ON Alumno.id_alumno = Persona.id_persona
            WHERE 
                Alumno.id_alumno IS NULL;  -- Solo personas sin alumnos
        `;
        try {
            const [results] = await db.query(query);
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            reject(error); // Rechaza la promesa si ocurre una excepción
        }
    });
};


// Modelo para agregar un nuevo alumno
exports.addStudent = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_persona, matricula, email, id_programa_academico, promedio, cuatrimestre, fecha_registro } = data;

        // Consulta SQL para verificar si ya existe un alumno con la misma matricula o email
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Alumno
            WHERE matricula = ? OR email = ?
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [matricula, email]);
            if (rows[0].count > 0) {
                // Si ya existe un alumno con la misma matricula o email, rechazar la promesa
                return reject(new Error('La matrícula o el email ya están registrados.'));
            }

            // Consulta SQL para insertar un nuevo alumno
            const insertQuery = `
                INSERT INTO Alumno (id_alumno, matricula, email, id_programa_academico, promedio, cuatrimestre, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            // Ejecutar la consulta con los valores proporcionados
            await db.query(insertQuery, [id_persona, matricula, email, id_programa_academico, promedio, cuatrimestre, fecha_registro]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar alumno:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Función para eliminar un alumno por ID
exports.deleteStudentById = async (id_alumno) => {
    const query = 'DELETE FROM Alumno WHERE id_alumno = ?';
    const [result] = await db.execute(query, [id_alumno]);
    return result.affectedRows > 0; // Retorna true si se eliminó el alumno
};


// Método para actualizar un alumno
exports.updateAlumn = async function(id_alumno, datos) {
    const { matricula, email, id_programa_academico, promedio, cuatrimestre, fecha_registro } = datos;

    try {
        // Consulta SQL para verificar si ya existe un alumno con la misma matricula o email, excluyendo el alumno actual
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Alumno
            WHERE (matricula = ? OR email = ?) AND id_alumno != ?
        `;

        // Ejecutar la consulta de verificación
        const [rows] = await db.execute(checkQuery, [matricula, email, id_alumno]);
        if (rows[0].count > 0) {
            // Si ya existe un alumno con la misma matricula o email, lanzar un error
            throw new Error('La matrícula o el email ya están registrados.');
        }

        // Consulta SQL para actualizar el alumno
        const updateQuery = `
            UPDATE Alumno SET
                matricula = ?, 
                email = ?, 
                id_programa_academico = ?, 
                promedio = ?, 
                cuatrimestre = ?, 
                fecha_registro = ?
            WHERE id_alumno = ?
        `;

        // Ejecutar la consulta de actualización
        const [result] = await db.execute(updateQuery, [matricula, email, id_programa_academico, promedio, cuatrimestre, fecha_registro, id_alumno]);
        return result; // Retorna el resultado de la operación
    } catch (error) {
        console.error('Error actualizando alumno:', error);
        throw error; // Lanzamos el error para manejarlo en el controlador
    }
};

// modelo para el crud de profesores

// Método para obtener todos los profesores con sus datos personales
exports.getAllProfesores = async function() {
    try {
        const [result] = await db.execute(`
            SELECT 
                p.id_profesor, 
                p.clave, 
                p.perfil, 
                p.email, 
                p.no_cedula, 
                p.programa_academicos, 
                p.nss,
                p.rfc,
                per.nombre, 
                per.apellido_paterno, 
                per.apellido_materno,
                d.nombre AS departamento, 
                d.id_departamento,
                pu.id_puesto, 
                pu.nombre AS puesto
            FROM 
                Profesor p
            JOIN 
                Persona per ON p.id_profesor = per.id_persona
            LEFT JOIN 
                Departamento d ON p.id_departamento = d.id_departamento
            LEFT JOIN 
                Puesto pu ON p.id_puesto = pu.id_puesto
        `);
        return result; // Retorna el resultado de la consulta
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};

// Método para obtener todas las personas que no son profesores
exports.getPersonsWithoutTeachers = async function() {
    try {
        const [result] = await db.execute(`
            SELECT p.id_persona, p.nombre, p.apellido_paterno, p.apellido_materno, p.curp
            FROM Persona p
            LEFT JOIN Profesor prof ON p.id_persona = prof.id_profesor
            WHERE prof.id_profesor IS NULL
        `);
        return result; // Retorna el resultado de la consulta
    } catch (error) {
        console.error('Error al obtener personas sin profesores:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};

// Modelo para agregar un nuevo profesor
exports.createprofesor = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_persona, id_departamento, id_puesto, clave, perfil, email, no_cedula, programa_academicos, nss, rfc} = data;

        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO Profesor (id_profesor, id_departamento, id_puesto, clave, perfil, email, no_cedula, programa_academicos, nss, rfc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_persona, id_departamento, id_puesto, clave, perfil, email, no_cedula, programa_academicos, nss, rfc]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar profesor:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Método para eliminar un profesor
exports.deleteProfesor = async function(id) {
    try {
        const [result] = await db.execute(`DELETE FROM Profesor WHERE id_profesor = ?`, [id]);
        return result; // Devuelve el resultado si lo necesitas
    } catch (error) {
        console.error('Error al eliminar profesor:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};

// Modelo para obtener departamentos y sus puestos
exports.getDepartamentosConPuestos = async function() {
    try {
        const [departamentos] = await db.execute(`
            SELECT d.id_departamento, d.nombre AS departamento_nombre, p.id_puesto, p.nombre AS puesto_nombre
            FROM Departamento d
            LEFT JOIN Puesto p ON d.id_departamento = p.id_departamento
        `);

        // Agrupar los puestos por departamento
        const resultado = {};
        departamentos.forEach(({ id_departamento, departamento_nombre, id_puesto, puesto_nombre }) => {
            if (!resultado[id_departamento]) {
                resultado[id_departamento] = {
                    id: id_departamento,
                    nombre: departamento_nombre,
                    puestos: []
                };
            }
            if (id_puesto) {
                resultado[id_departamento].puestos.push({ id: id_puesto, nombre: puesto_nombre });
            }
        });

        return Object.values(resultado); // Retorna un array de departamentos con sus puestos
    } catch (error) {
        console.error('Error al obtener departamentos y puestos:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};


// Método para actualizar un profesor
exports.updateProfesor = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_profesor, id_departamento, id_puesto, clave, perfil, email, no_cedula, programa_academicos, nss, rfc } = data;

        // Consulta SQL para actualizar el profesor
        const query = `
            UPDATE Profesor
            SET 
                id_departamento = ?, 
                id_puesto = ?, 
                clave = ?, 
                perfil = ?, 
                email = ?, 
                no_cedula = ?, 
                programa_academicos = ?, 
                nss = ?,
                rfc = ?
            WHERE 
                id_profesor = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_departamento, id_puesto, clave, perfil, email, no_cedula, programa_academicos, nss,rfc, id_profesor]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar profesor:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Crud administrativo 

// Método para obtener todos los administrativos con sus datos personales
exports.getAllAdministrativos = async function() {
    try {
        const [result] = await db.execute(`
            SELECT 
                a.id_administrativo, 
                a.clave, 
                a.horario, 
                a.nss,
                a.rfc,
                per.nombre, 
                per.apellido_paterno, 
                per.apellido_materno,
                d.nombre AS departamento, 
                d.id_departamento,
                pu.id_puesto, 
                pu.nombre AS puesto
            FROM 
                Administrativo a
            JOIN 
                Persona per ON a.id_administrativo = per.id_persona
            LEFT JOIN 
                Departamento d ON a.id_departamento = d.id_departamento
            LEFT JOIN 
                Puesto pu ON a.id_puesto = pu.id_puesto
        `);
        return result; // Retorna el resultado de la consulta
    } catch (error) {
        console.error('Error al obtener administrativos:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};


// Método para obtener todas las personas que no son administrativos
exports.getPersonsWithoutAdministrativos = async function() {
    try {
        const [result] = await db.execute(`
            SELECT p.id_persona, p.nombre, p.apellido_paterno, p.apellido_materno, p.curp 
            FROM Persona p
            LEFT JOIN Administrativo admin ON p.id_persona = admin.id_administrativo
            WHERE admin.id_administrativo IS NULL
        `);
        return result; // Retorna el resultado de la consulta
    } catch (error) {
        console.error('Error al obtener personas sin administrativos:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};



// Modelo para agregar un nuevo administrativo
exports.createAdministrativo = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_persona, id_departamento, id_puesto, clave, horario, nss, rfc } = data;

        // Consulta SQL para insertar un nuevo administrativo
        const query = `
            INSERT INTO Administrativo (id_administrativo, id_departamento, id_puesto, clave, horario, nss, rfc)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_persona, id_departamento, id_puesto, clave, horario, nss, rfc]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar administrativo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para actualizar un administrativo
exports.updateAdministrativo = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_administrativo, id_departamento, id_puesto, clave, horario, nss, rfc } = data;

        // Consulta SQL para actualizar el administrativo
        const query = `
            UPDATE Administrativo
            SET 
                id_departamento = ?, 
                id_puesto = ?, 
                clave = ?, 
                horario = ?, 
                nss = ?, 
                rfc = ?
            WHERE 
                id_administrativo = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_departamento, id_puesto, clave, horario, nss, rfc, id_administrativo]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar administrativo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Método para eliminar un administrativo
exports.deleteAdministrativo = async function(id) {
    try {
        const [result] = await db.execute(`DELETE FROM Administrativo WHERE id_administrativo = ?`, [id]);
        return result; // Devuelve el resultado si lo necesitas
    } catch (error) {
        console.error('Error al eliminar administrativo:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};


// aqui empieza si quieres arriba esten los cruds que yo hice :D


// Crud Oferta academica

exports.createNivelEstudio  = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { nombre, descripcion, sigla} = data;

        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO nivelestudio (nombre, descripcion, sigla)
            VALUES (?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [nombre, descripcion, sigla]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Nivel de Estudio:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


//GET Niveles Academicos
exports.getNivelesAcademicos = async () => {
    const query = `
       SELECT * FROM integradora_se.nivelestudio;
    `;
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al consultar Niveles Academicos: ${err.message}`);
    }
};


exports.deleteNivelAcademico = async function(id) {
    try {
        const [result] = await db.execute(`DELETE FROM nivelestudio WHERE id_nivel_estudio = ?`, [id]);
        return result; // Devuelve el resultado si lo necesitas
    } catch (error) {
        console.error('Error al eliminar administrativo:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};


//UPDATE

exports.updateNivelAcademico = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_nivel_estudio, nombre, descripcion, sigla  } = data;

        // Consulta SQL para actualizar el administrativo
        const query = `
            UPDATE nivelestudio SET nombre = ?, descripcion = ?, sigla = ? WHERE id_nivel_estudio = ?`;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [nombre, descripcion, sigla, id_nivel_estudio]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar administrativo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};




exports.getProgramasAcademico = async () => {
    const query = `
       SELECT programaacademico.*, nivelestudio.nombre as nivelString  FROM integradora_se.programaacademico INNER JOIN integradora_se.nivelestudio on programaacademico.id_nivel_estudio = nivelestudio.id_nivel_estudio
;
;
    `;
    try {
        const [results]
         = await db.query(query); // Usa await para las consultas

        results.forEach(element => {
           // console.log(element);

            element['desde'] = element['desde'].toISOString().split('T')[0];
            element['hasta'] = element['hasta'].toISOString().split('T')[0];
            if (element['estatus'] == 1) {
                element['estatus'] = 'Activo';
            }else{
                element['estatus'] = 'Inactivo';
            }
        });

        const datosFormateados = results;

         // console.log(datosFormateados);
        return results;
    } catch (err) {
        throw new Error(`Error al consultar Programas Academicos: ${err.message}`);
    }
};

exports.createProgramaAcademico  = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_nivel_estudio, nombre, descripcion, sigla, fechaDesde, cuatris, fechaHasta} = data;

        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO programaacademico (id_nivel_estudio, nombre, descripcion, sigla, total_cuatrimestre, desde, hasta, estatus)
            VALUES (?, ?, ? , ?, ?, ?, ?, 1)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_nivel_estudio, nombre, descripcion, sigla, cuatris, fechaDesde, fechaHasta]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Programa Academico:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


exports.deleteProgramaAcademico = async function(id) {
    try {
        const [result] = await db.execute(`DELETE FROM programaacademico WHERE id_programa_academico = ?`, [id]);
        return result; // Devuelve el resultado si lo necesitas
    } catch (error) {
        console.error('Error al eliminar ProgramaAcademico:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};




exports.updateProgramaAcademico = async (data) => {
    return new Promise(async (resolve, reject) => {
    
        const { id_nivel_estudio, nombre, descripcion, sigla, cuatris, fechaDesde, fechaHasta, id_programa_academico } = data;
      //  console.log(data);
        // Consulta SQL para actualizar el administrativo
        const query = `UPDATE programaacademico SET id_nivel_estudio= ?, nombre = ?, descripcion= ?, sigla = ?, total_cuatrimestre= ?, desde = ?, hasta = ? WHERE id_programa_academico = ?`;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_nivel_estudio, nombre, descripcion, sigla, cuatris, fechaDesde, fechaHasta, id_programa_academico]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar administrativo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};





// Empiezen aqui sus cruds :D

//Yaremi Crud -> Departamento

// Obtener todos los departamentos
exports.getAllDepartamentos = async () => { 
    const query = `
        SELECT 
            id_departamento, 
            nombre, 
            sigla
        FROM 
            Departamento
    `;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener departamentos: ${err.message}`);
    }
};

// Modelo para agregar un nuevo departamento
exports.createDepartamento = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { nombre, sigla } = data;

        // Consulta SQL para insertar un nuevo departamento
        const query = `
            INSERT INTO Departamento (nombre, sigla)
            VALUES (?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [nombre, sigla]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar departamento:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para editar un departamento
exports.updateDepartamento = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_departamento, nombre, sigla } = data;

        // Consulta SQL para actualizar los datos del departamento
        const query = `
            UPDATE Departamento 
            SET nombre = ?, sigla = ?
            WHERE id_departamento = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [nombre, sigla, id_departamento]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar departamento:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para eliminar un departamento
exports.deleteDepartamento = async function(id_departamento) {
    try {
        const [result] = await db.execute(`DELETE FROM Departamento WHERE id_departamento = ?`, [id_departamento]);
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error('Error al eliminar departamento:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};

//CRUD DE PUESTO 
//Obtener todos los puestos
exports.getAllPuestos = async () => {
    const query = `
        SELECT 
            p.id_puesto, 
            p.nombre AS puesto_nombre,
            d.id_departamento,
            d.nombre AS departamento_nombre,
            d.sigla AS departamento_sigla
        FROM 
            Puesto p
        JOIN 
            Departamento d ON p.id_departamento = d.id_departamento
    `;
    
    try {
        const [results] = await db.query(query);
        
        // Mapeamos los resultados para estructurarlos mejor
        const puestos = results.map(puesto => ({
            id_puesto: puesto.id_puesto,
            nombre: puesto.puesto_nombre,
            departamento: {
                id_departamento: puesto.id_departamento,
                nombre: puesto.departamento_nombre,
                sigla: puesto.departamento_sigla
            }
        }));

        return puestos;
    } catch (err) {
        throw new Error(`Error al obtener puestos: ${err.message}`);
    }
};


//Agregar un nuevo puesto
exports.createPuesto = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_departamento, nombre } = data;

        const query = `
            INSERT INTO Puesto (id_departamento, nombre)
            VALUES (?, ?)
        `;

        try {
            await db.query(query, [id_departamento, nombre]);
            resolve();
        } catch (error) {
            console.error('Error al agregar puesto:', error);
            reject(error);
        }
    });
};

//Editar un puesto
exports.updatePuesto = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_puesto, id_departamento, nombre } = data;

        const query = `
            UPDATE Puesto 
            SET id_departamento = ?, nombre = ?
            WHERE id_puesto = ?
        `;

        try {
            await db.query(query, [id_departamento, nombre, id_puesto]);
            resolve();
        } catch (error) {
            console.error('Error al actualizar puesto:', error);
            reject(error);
        }
    });
};

//Eliminar un puesto
exports.deletePuesto = async function(id_puesto) {
    try {
        const [result] = await db.execute(`DELETE FROM Puesto WHERE id_puesto = ?`, [id_puesto]);
        return result;
    } catch (error) {
        console.error('Error al eliminar puesto:', error);
        throw error;
    }
};


//Crud de memo -> Mapa Curricular..............
// Modelo para obtener todos los registros de MapaCurricular
exports.getAllMapaCurricular = async () => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL para obtener todos los campos de MapaCurricular junto con los datos del ProgramaAcademico
        const query = `
            SELECT 
                mc.id_mapa_curricular,
                mc.ciclo,
                mc.cuatrimestre,
                mc.materia,
                mc.clave,
                mc.h_semana,
                mc.h_teoricas,
                mc.h_practicas,
                mc.h_total,
                mc.creditos,
                mc.modalidad,
                mc.espacio,
                pa.id_programa_academico,
                pa.nombre AS programa_academico,
                pa.sigla AS sigla_programa,
                pa.total_cuatrimestre,
                pa.desde,
                pa.hasta,
                pa.estatus
            FROM MapaCurricular mc
            INNER JOIN ProgramaAcademico pa
            ON mc.id_programa_academico = pa.id_programa_academico
        `;

        try {
            // Ejecutar la consulta
            const [results] = await db.query(query);
            resolve(results); // Resuelve la promesa con los resultados de la consulta
        } catch (error) {
            console.error('Error al obtener los registros de MapaCurricular:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


exports.getProgramasWithoutMapaCurricular = () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                ProgramaAcademico.id_programa_academico,
                ProgramaAcademico.nombre
            FROM 
                ProgramaAcademico
            LEFT JOIN 
                MapaCurricular ON MapaCurricular.id_programa_academico = ProgramaAcademico.id_programa_academico
            WHERE 
                MapaCurricular.id_programa_academico IS NULL;  -- Solo programas sin mapas curriculares
        `;
        try {
            // Ejecutar la consulta
            const [results] = await db.query(query);
            resolve(results); // Resuelve la promesa con los resultados
        } catch (error) {
            console.error('Error al obtener programas sin mapa curricular:', error);
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para agregar un nuevo mapa curricular
exports.addMapaCurricular = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_programa_academico, ciclo, cuatrimestre, materia, clave, h_semana, h_teoricas, h_practicas, creditos, modalidad, espacio } = data;

// Calcular horas totales (convertir los valores a números)
const h_total = parseInt(h_semana) + parseInt(h_teoricas) + parseInt(h_practicas);

        // Consulta SQL para insertar un nuevo registro en Mapa Curricular
        const query = `
            INSERT INTO MapaCurricular 
            (id_programa_academico, ciclo, cuatrimestre, materia, clave, h_semana, h_teoricas, h_practicas, h_total, creditos, modalidad, espacio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados, incluyendo h_total
            await db.query(query, [id_programa_academico, ciclo, cuatrimestre, materia, clave, h_semana, h_teoricas, h_practicas, h_total, creditos, modalidad, espacio]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Mapa Curricular:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para actualizar un mapa curricular
exports.updateMapaCurricular = async (id, data) => {
    return new Promise(async (resolve, reject) => {
        const { id_programa_academico, ciclo, cuatrimestre, materia, clave, h_semana, h_teoricas, h_practicas, creditos, modalidad, espacio } = data;

        // Calcular horas totales (convertir los valores a números)
        const h_total = parseInt(h_semana) + parseInt(h_teoricas) + parseInt(h_practicas);

        // Consulta SQL para actualizar el registro en Mapa Curricular
        const query = `
            UPDATE MapaCurricular 
            SET id_programa_academico = ?, 
                ciclo = ?, 
                cuatrimestre = ?, 
                materia = ?, 
                clave = ?, 
                h_semana = ?, 
                h_teoricas = ?, 
                h_practicas = ?, 
                h_total = ?, 
                creditos = ?, 
                modalidad = ?, 
                espacio = ?
            WHERE id_mapa_curricular = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados, incluyendo h_total y el id del mapa curricular a actualizar
            await db.query(query, [
                id_programa_academico, ciclo, cuatrimestre, materia, clave, 
                h_semana, h_teoricas, h_practicas, h_total, 
                creditos, modalidad, espacio, id
            ]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar Mapa Curricular:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para eliminar un mapa curricular
exports.deleteMapaCurricular = async (id_mapa_curricular) => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL para eliminar el mapa curricular por su ID
        const query = `
            DELETE FROM MapaCurricular 
            WHERE id_mapa_curricular = ?
        `;

        try {
            // Ejecutar la consulta con el ID proporcionado
            await db.query(query, [id_mapa_curricular]);
            resolve(); // Resuelve la promesa si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar mapa curricular:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};





//Crud Edificio 

// Obtener todos los edificios
exports.getAllEdificios = async () => { 
    const query = `
        SELECT 
            id_edificio, 
            Nombre, 
            Sigla
        FROM 
            Edificio
    `;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener edificios: ${err.message}`);
    }
};


// Modelo para agregar un nuevo edificio
exports.createEdificio = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { nombre, sigla } = data;

        // Consulta SQL para insertar un nuevo edificio
        const query = `
            INSERT INTO Edificio (Nombre, Sigla)
            VALUES (?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [nombre, sigla]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar edificio:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para editar un edificio
exports.updateEdificio = async (data) => {
    return new Promise(async (resolve, reject) => {
        // Destructuración con nombres correctos
        const { id_edificio, Nombre, Sigla } = data; 

  //      console.log(data); // Verifica qué datos se reciben

        // Consulta SQL para actualizar los datos del edificio
        const query = `
            UPDATE Edificio 
            SET Nombre = ?, Sigla = ?
            WHERE id_edificio = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [Nombre, Sigla, id_edificio]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar edificio:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Modelo para eliminar un edificio
exports.deleteEdificio = async (id_edificio) => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL para eliminar el edificio
        const query = `
            DELETE FROM Edificio 
            WHERE id_edificio = ?
        `;

        try {
            // Ejecutar la consulta con el ID del edificio proporcionado
            await db.query(query, [id_edificio]);
            resolve(); // Resuelve la promesa si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar edificio:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

////////// MODELO DEL CRUD DE AULA



// Obtener todas las aulas
exports.getAllAulas = async () => { 
    const query = `
 SELECT 
    aula.IdAula, 
    edificio.Nombre AS NombreEdificio,
    aula.Nombre,  
    aula.AulaTipo, 
    aula.Sigla
FROM 
    aula
JOIN 
    Edificio ON aula.IdEdificio = Edificio.id_edificio;
    `;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener aulas: ${err.message}`);
    }
};
// Obtener todos los edificios
exports.getAllEdificios = async () => {
    const query = `
        SELECT 
            id_edificio, 
            Nombre,
            Sigla
        FROM 
            edificio
    `;

    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener edificios: ${err.message}`);
    }
};


// Modelo para agregar un nuevo aula
exports.createAula = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { IdEdificio, AulaTipo, Nombre, SIGLA } = data; // Desestructurar los datos

        // Consulta SQL para insertar un nuevo aula
        const query = `
            INSERT INTO aula (IdEdificio, AulaTipo, Nombre, SIGLA)
            VALUES (?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [IdEdificio, AulaTipo, Nombre, SIGLA]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar aula:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};
// Modelo para actualizar un aula
exports.updateAula = async (id, data) => {
    return new Promise(async (resolve, reject) => {
        const { nombre, sigla, AulaTipo, IdEdificio } = data;

        // Consulta SQL para actualizar el aula
        const query = `
            UPDATE aula 
            SET 
                IdEdificio = ?, 
                AulaTipo = ?, 
                Nombre = ?, 
                SIGLA = ?
            WHERE 
                IdAula = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [IdEdificio, AulaTipo, nombre, sigla, id]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar aula:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para eliminar un aula
exports.deleteAula = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `DELETE FROM aula WHERE IdAula = ?`;
        
        try {
            await db.query(query, [id]);
            resolve(); // Resuelve la promesa si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar aula:', error);
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};





// MODELO DE TRAMITE DE PERIODO
// CRUD PARA TRAMITE APERTURA PERIODO
// Obtener todos los trámites de apertura de periodo
exports.getAllPeriodo = async () => {
    const query = `
        SELECT 
            id_periodo, 
            periodo, 
            fecha_inicio, 
            fecha_fin, 
            estado, 
            fecha_registro, 
            id_usuario
        FROM 
            TramiteAperturaPeriodo
    `;

    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener el periodo: ${err.message}`);
    }
};

// Modelo para agregar un nuevo trámite de apertura de periodo
exports.createPeriodo = async (data) => {
    return new Promise(async (resolve, reject) => {
        const {
            periodo,
            fecha_inicio,
            fecha_fin,
            estado,
            id_usuario
        } = data;

        // Consulta SQL para insertar un nuevo periodo
        const query = `
            INSERT INTO TramiteAperturaPeriodo (periodo, fecha_inicio, fecha_fin, estado, id_usuario)
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [
                periodo,
                fecha_inicio,
                fecha_fin,
                estado,
                id_usuario,
            ]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error("Error al agregar el periodo:", error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para editar un trámite de apertura de periodo
exports.updatePeriodo = async (data) => {
    return new Promise(async (resolve, reject) => {
        const {
            id_periodo,
            periodo,
            fecha_inicio,
            fecha_fin,
            estado,
            id_usuario
        } =
        data;

        // Consulta SQL para actualizar los datos del trámite
        const query = `
            UPDATE TramiteAperturaPeriodo 
            SET periodo = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, id_usuario = ?
            WHERE id_periodo = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [
                periodo,
                fecha_inicio,
                fecha_fin,
                estado,
                id_usuario,
                id_periodo,
            ]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error("Error al actualizar el periodo:", error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para eliminar un trámite de apertura de periodo
exports.deletePeriodo = async function (id_periodo) {
    try {
        const [result] = await db.execute(
            `DELETE FROM TramiteAperturaPeriodo WHERE id_periodo = ?`,
            [id_periodo]
        );
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error("Error al eliminar el periodo:", error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};
///PROBABLEMENTE ESTE SE EDITE PROXIMAMENTE

exports.getGrupos = async (idPeriodo, idPrograma) => {
    if(idPeriodo && idPrograma != null){
        const query = `
SELECT gp.*,pa.nombre as nombrePrograma, pa.total_cuatrimestre FROM integradora_se.grupo as gp INNER JOIN programaacademico as pa on PA.id_programa_academico = gp.idProgramaAcademico INNER JOIN tramiteaperturaperiodo as pe on PE.id_periodo = gp.idPeriodo where pa.id_programa_academico = ? and pe.id_periodo = ?;        `;
     try {
         const [results]
          = await db.query(query, [idPrograma, idPeriodo]); // Usa await para las consultas
 
         results.forEach(element => {
             if (element['estatus'] === 1) {
                 element['estatus'] = 'Autorizado';
             }else{
                 element['estatus'] = 'Planeado ';
             }
         });
 
       //  console.log(results)
         return results;
     } catch (err) {
         throw new Error(`Error al consultar Grupos: ${err.message}`);
     }
    }else{
        const query = `
        SELECT gp.*,pa.nombre as nombrePrograma, pa.total_cuatrimestre FROM integradora_se.grupo as gp INNER JOIN programaacademico as pa on PA.id_programa_academico = gp.idProgramaAcademico
        `;
     try {
         const [results]
          = await db.query(query); // Usa await para las consultas
 
         results.forEach(element => {
             if (element['estatus'] === 1) {
                 element['estatus'] = 'Autorizado';
             }else{
                 element['estatus'] = 'Planeado ';
             }
         });
 
    //     console.log(results)
         return results;
     } catch (err) {
         throw new Error(`Error al consultar Grupos: ${err.message}`);
     }
    }
};

exports.createGrupo  = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_programa_academico, periodo, nombre, cuatrimestre, observacion} = data;
        var datetime = new Date();
        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO grupo (idPeriodo, idProgramaAcademico, nombre, cuatrimestre, observacion, estatus, fecha) VALUES (?, ?, ? , ?, ?, 0, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [periodo, id_programa_academico, nombre, cuatrimestre, observacion, datetime]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Grupo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


exports.deleteGrupo = async function(id) {
    try {
        const [result] = await db.execute(`DELETE FROM grupo WHERE idGrupo = ?`, [id]);
        return result; // Devuelve el resultado si lo necesitas
    } catch (error) {
        console.error('Error al eliminar Grupo:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};




exports.updateGrupo = async (data) => {
    return new Promise(async (resolve, reject) => {

    
        const { idGrupo, id_programa_academico, nombre, cuatrimestre, observacion, periodo } = data;
       console.log(data);
       console.log("Valor de periodo:", periodo); // Verifica el valor de periodo

        // Consulta SQL para actualizar el administrativo
        const query = `UPDATE grupo SET idPeriodo= ?, idProgramaAcademico = ?, nombre= ?, cuatrimestre = ?, observacion= ? WHERE idGrupo = ?`;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [periodo, id_programa_academico, nombre, cuatrimestre, observacion, idGrupo]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar Grupo:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


//CRUD DE MATERIAS
// Obtener todas las materias
exports.getAllMaterias = async () => {
    const query = `
        SELECT 
            m.id_materia,
            m.clave_materia,
            m.nombre_materia AS Materia,
            m.plantel,
            m.modalidad,
            pa.id_programa_academico,
            pa.nombre AS Programa_Academico,
            ne.nombre AS Nivel_Estudio,
            m.num_horas
        FROM 
            Materia m
        JOIN 
            ProgramaAcademico pa ON m.id_programa_academico = pa.id_programa_academico
        JOIN 
            NivelEstudio ne ON pa.id_nivel_estudio = ne.id_nivel_estudio;

    `;

    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener materias: ${err.message}`);
    }
};

// Modelo para agregar una nueva materia
exports.createMateria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const {
            clave_materia,
            nombre_materia,
            plantel,
            modalidad,
            id_programa_academico,
            num_horas,
        } = data;

        // Consulta SQL para verificar si la clave de materia ya existe
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Materia
            WHERE clave_materia = ?
        `;

        // Consulta SQL para insertar una nueva materia
        const insertQuery = `
            INSERT INTO Materia (clave_materia, nombre_materia, plantel, modalidad, id_programa_academico, num_horas)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [clave_materia]);
            if (rows[0].count > 0) {
                return reject(new Error("La clave de la materia ya está registrada."));
            }

            // Ejecutar la consulta de inserción con los valores proporcionados
            await db.query(insertQuery, [
                clave_materia,
                nombre_materia,
                plantel,
                modalidad,
                id_programa_academico,
                num_horas,
            ]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error("Error al agregar materia:", error);
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para editar una materia
exports.updateMateria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const {
            id_materia,
            clave_materia,
            nombre_materia,
            plantel,
            modalidad,
            id_programa_academico,
            num_horas,
        } = data;

        // Consulta SQL para verificar si la clave de materia ya existe en otra materia
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Materia
            WHERE clave_materia = ? AND id_materia != ?
        `;

        // Consulta SQL para actualizar los datos de la materia
        const updateQuery = `
            UPDATE Materia 
            SET clave_materia = ?, nombre_materia = ?, plantel = ?, modalidad = ?, id_programa_academico = ?, num_horas = ?
            WHERE id_materia = ?
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [clave_materia, id_materia]);
            if (rows[0].count > 0) {
                return reject(
                    new Error(
                        "La clave de la materia ya está registrada en otra materia."
                    )
                );
            }

            // Ejecutar la consulta de actualización con los valores proporcionados
            await db.query(updateQuery, [
                clave_materia,
                nombre_materia,
                plantel,
                modalidad,
                id_programa_academico,
                num_horas,
                id_materia,
            ]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error("Error al actualizar materia:", error);
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para eliminar una materia
exports.deleteMateria = async function (id_materia) {
    try {
        const [result] = await db.execute(
            `DELETE FROM Materia WHERE id_materia = ?`,
            [id_materia]
        );
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error("Error al eliminar materia:", error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};



// MODELO DE BLOQUE
// Obtener todos los Bloques
exports.getAllBloques = async () => { 
    const query = `
 SELECT 
    bloque.idBloque, 
    bloque.Nombre,
    bloque.Duracion,  
    bloque.HoraInicio, 
    bloque.HoraFin,
    bloque.Desde,
    bloque.Hasta
     FROM bloque`;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener aulas: ${err.message}`);
    }
};

// Modelo para agregar un nuevo bloque 
exports.createBloque = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { Nombre, Duracion, HoraInicio, HoraFin, Desde, Hasta} = data;

        // Consulta SQL para insertar un nuevo bloque
        const query = `
            INSERT INTO bloque (Nombre, Duracion, HoraInicio, HoraFin, Desde, Hasta)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [Nombre, Duracion, HoraInicio, HoraFin, Desde, Hasta]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Bloque:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Modelo para editar un bloque de apertura de periodo
exports.updateBloque = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { idBloque, Nombre, Duracion, HoraInicio, HoraFin, Desde, Hasta} = data;

        // Consulta SQL para actualizar los datos del bloque
        const query = `
            UPDATE bloque 
            SET Nombre = ?, Duracion = ?, HoraInicio = ?, HoraFin = ?, Desde = ?, Hasta = ?
            WHERE idBloque = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [Nombre, Duracion, HoraInicio, HoraFin, Desde, Hasta, idBloque]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar bloque:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para eliminar un bloque
exports.deleteBloque = async function(idBloque) {
    try {
        const [result] = await db.execute(`DELETE FROM bloque WHERE idBloque = ?`, [idBloque]);
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error('Error al eliminar bloque:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};


//Grupo materias 

exports.getAllGrupoMaterias = async () => {
    const query = `
        SELECT 
            GrupoMateria.id_grupo_materia,
            GrupoMateria.id_grupo,
            GrupoMateria.idMapaCurricular,
            GrupoMateria.tipo,
            GrupoMateria.fecha
        FROM 
            GrupoMateria
        JOIN 
            Grupo ON GrupoMateria.id_grupo = Grupo.idGrupo
        JOIN 
            MapaCurricular ON GrupoMateria.idMapaCurricular = MapaCurricular.id_mapa_curricular;
    `;
    
    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener los datos de GrupoMateria: ${err.message}`);
    }
};



// MODELO DE HORARIO

exports.getAllHorarios = async () => {
    const query = `
        SELECT 
            horario.id_Bloque,
            horario.idHorario, 
            horario.dia,
            grupomateria.id_grupo_materia AS IdGrupoMateria,
            grupomateria.tipo AS TipoGrupoMateria,
            grupomateria.fecha AS FechaGrupoMateria,
            bloque.Nombre AS NombreBloque,
            bloque.Duracion AS DuracionBloque,
            bloque.HoraInicio AS HoraInicioBloque, 
            bloque.HoraFin AS HoraFinBloque,
            bloque.idBloque
        FROM 
            Horario AS horario
        JOIN 
            GrupoMateria AS grupomateria ON horario.idGrupoMateria = grupomateria.id_grupo_materia
        JOIN 
            Bloque AS bloque ON horario.id_Bloque = bloque.idBloque;
    `;
    
    try {
        const [results] = await db.query(query); // Usa await para las consultas
        return results;
    } catch (err) {
        throw new Error(`Error al obtener horarios: ${err.message}`);
    }
};



exports.createHorario = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { idGrupoMateria, idBloque, dia } = data; // Desestructurar los datos
        // Consulta SQL para insertar un nuevo horario
        const query = `
            INSERT INTO horario (idGrupoMateria, id_Bloque, dia)
            VALUES (?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [idGrupoMateria, idBloque, dia]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar horario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


exports.updateHorario = async (id, data) => {
    return new Promise(async (resolve, reject) => {
        const { idGrupoMateria, idBloque, dia } = data; // Desestructurar los datos

        // Consulta SQL para actualizar el horario
        const query = `
            UPDATE horario 
            SET 
                idGrupoMateria = ?, 
                id_Bloque = ?, 
                dia = ? 
            WHERE 
                idHorario = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [idGrupoMateria, idBloque, dia, id]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar horario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

exports.deleteHorario = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `DELETE FROM horario WHERE idHorario = ?`; // Consulta SQL para eliminar el horario
        
        try {
            await db.query(query, [id]);
            resolve(); // Resuelve la promesa si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar horario:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};