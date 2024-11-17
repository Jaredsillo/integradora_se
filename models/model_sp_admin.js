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
    Alumno.email,
    Alumno.promedio, 
    Alumno.cuatrimestre,
    ap.matricula,
    CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS programa_academico, 
    Alumno.fecha_registro, 
    Persona.nombre,  -- Asegúrate de que 'Persona' es el alias correcto
    Persona.apellido_paterno, 
    Persona.apellido_materno
FROM 
    Alumno
JOIN Persona ON Alumno.id_alumno = Persona.id_persona
LEFT JOIN alumno_programa as ap on Alumno.id_alumno = ap.idAlumno
LEFT JOIN programaacademico as pa on ap.idProgramaAcademico = pa.id_programa_academico;

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
    pa.*, 
    CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS programa
FROM 
    ProgramaAcademico pa;

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
        const { id_persona, email, promedio, cuatrimestre, fecha_registro } = data;

        // Consulta SQL para verificar si ya existe un alumno con el mismo email
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Alumno
            WHERE email = ?
        `;

        try {
            // Ejecutar la consulta de verificación
            const [rows] = await db.query(checkQuery, [email]);
            if (rows[0].count > 0) {
                // Si ya existe un alumno con el mismo email, rechazar la promesa
                return reject(new Error('El email ya está registrado.'));
            }

            // Consulta SQL para insertar un nuevo alumno
            const insertQuery = `
                INSERT INTO Alumno (id_alumno, email, promedio, cuatrimestre, fecha_registro)
                VALUES (?, ?, ?, ?, ?)
            `;

            // Ejecutar la consulta con los valores proporcionados
            await db.query(insertQuery, [id_persona, email, promedio, cuatrimestre, fecha_registro]);
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
    const { email, promedio, cuatrimestre, fecha_registro } = datos;
//console.log(datos);
    try {
        // Consulta SQL para verificar si ya existe un alumno con el mismo email, excluyendo el alumno actual
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM Alumno
            WHERE email = ? AND id_alumno != ?
        `;

        // Ejecutar la consulta de verificación
        const [rows] = await db.execute(checkQuery, [email, id_alumno]);
        if (rows[0].count > 0) {
            // Si ya existe un alumno con el mismo email, lanzar un error
            throw new Error('El email ya está registrado.');
        }

        // Consulta SQL para actualizar el alumno
        const updateQuery = `
            UPDATE Alumno SET
                email = ?, 
                promedio = ?, 
                cuatrimestre = ?, 
                fecha_registro = ?
            WHERE id_alumno = ?
        `;

        // Ejecutar la consulta de actualización
        const [result] = await db.execute(updateQuery, [email, promedio, cuatrimestre, fecha_registro, id_alumno]);
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


exports.getProfesoresWithoutGroup = async function() {
    try {
        const [result] = await db.execute(`
           SELECT concat(per.nombre, " ", per.apellido_paterno, " ", per.apellido_materno) as nombre, pf.id_profesor 
FROM profesor as pf INNER JOIN persona per on per.id_persona = pf.id_profesor where id_profesor
        `);
        return result; // Retorna el resultado de la consulta
    } catch (error) {
        console.error('Error al obtener profesosres sin grupo:', error);
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
        const { id_nivel_estudio, nombre_tsu, nombre_ing, descripcion, sigla, fechaDesde, cuatris, fechaHasta} = data;

        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO programaacademico (id_nivel_estudio, Titulo_tsu,Titulo_Ing, descripcion, sigla, total_cuatrimestre, desde, hasta, estatus)
            VALUES (?, ?, ?, ? , ?, ?, ?, ?, 1)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_nivel_estudio, nombre_tsu, nombre_ing, descripcion, sigla, cuatris, fechaDesde, fechaHasta]);
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
    
        const { id_nivel_estudio, nombre_tsu, nombre_ing, descripcion, sigla, cuatris, fechaDesde, fechaHasta, id_programa_academico } = data;
      //  console.log(data);
        // Consulta SQL para actualizar el administrativo
        const query = `UPDATE programaacademico SET id_nivel_estudio= ?, Titulo_tsu = ?, Titulo_Ing= ?, descripcion= ?, sigla = ?, total_cuatrimestre= ?, desde = ?, hasta = ? WHERE id_programa_academico = ?`;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [id_nivel_estudio, nombre_tsu, nombre_ing, descripcion, sigla, cuatris, fechaDesde, fechaHasta, id_programa_academico]);
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
             CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS programa_academico,
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
    pa.id_programa_academico,
    CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS nombre
FROM 
    ProgramaAcademico AS pa;
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
            periodo
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
            INSERT INTO periodo (periodo, fecha_inicio, fecha_fin, estado, id_usuario)
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
            UPDATE periodo 
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
            `DELETE FROM periodo WHERE id_periodo = ?`,
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
       //n console.log("ENTRO EN EL IF")
        const query = `
        SELECT  gp.*, concat(per.nombre, " ", per.apellido_paterno, " ", per.apellido_materno) as tutor,  CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS nombrePrograma

FROM integradora_se.grupo as gp 
INNER JOIN profesor as pf on pf.id_profesor = gp.idTutor
INNER JOIN persona per on per.id_persona = pf.id_profesor
INNER JOIN programaacademico as pa on PA.id_programa_academico = gp.idProgramaAcademico
INNER JOIN periodo as pe on PE.id_periodo = gp.idPeriodo where pa.id_programa_academico = ? and pe.id_periodo = ?
        `;
     try {
         const [results]
          = await db.query(query, [idPrograma, idPeriodo]);
 
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
    }
    //Se obtienen todos los grupos en general
    else{
     //   console.log("ENTRO EN EL ELSE")
        const query = `
        SELECT  gp.*, concat(per.nombre, " ", per.apellido_paterno, " ", per.apellido_materno) as tutor, CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS nombrePrograma

FROM integradora_se.grupo as gp 
INNER JOIN profesor as pf on pf.id_profesor = gp.idTutor
INNER JOIN persona per on per.id_persona = pf.id_profesor
INNER JOIN programaacademico as pa on PA.id_programa_academico = gp.idProgramaAcademico;
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
        const { id_programa_academico,id_profesor, periodo, nombre, cuatrimestre, observacion, estatus} = data;
        var datetime = new Date();
        // Consulta SQL para insertar un nuevo profesor
        const query = `
            INSERT INTO grupo (idPeriodo, idProgramaAcademico, idTutor, nombre, cuatrimestre, observacion, estatus, fecha) VALUES (?, ?, ?, ? , ?, ?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [periodo, id_programa_academico, id_profesor, nombre, cuatrimestre, observacion,estatus,  datetime]);
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

    
        const { idGrupo, id_programa_academico, nombre, cuatrimestre, observacion, periodo, tutor, estatus } = data;
    //   console.log(data);
      // console.log("Valor de periodo:", periodo); // Verifica el valor de periodo

        // Consulta SQL para actualizar el administrativo
        const query = `UPDATE grupo SET idPeriodo= ?, idProgramaAcademico = ?, idTutor=?, nombre= ?, cuatrimestre = ?, observacion= ?, estatus= ? WHERE idGrupo = ?`;
        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [periodo, id_programa_academico,tutor, nombre, cuatrimestre, observacion,estatus, idGrupo]);
            console.log(query);
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
console.log(data);
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
exports.getMapaCurricularByPrograma = async (idPrograma) => {
    const query = `SELECT * FROM MapaCurricular WHERE id_programa_academico = ?`;
    try {
        const [results] = await db.query(query, [idPrograma]);
        return results;
    } catch (err) {
        throw new Error(`Error al consultar Mapa Curricular: ${err.message}`);
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
    const { idGrupoMateria, idBloque, dia } = data;

    const checkQuery = `
        SELECT COUNT(*) as count FROM horario
        WHERE idGrupoMateria = ? AND id_Bloque = ? AND dia = ?
    `;

    const insertQuery = `
        INSERT INTO horario (idGrupoMateria, id_Bloque, dia)
        VALUES (?, ?, ?)
    `;

    try {
        const [result] = await db.query(checkQuery, [idGrupoMateria, idBloque, dia]);
    //    console.log(result); // Agrega esto para ver qué se está retornando

        if (result[0].count > 0) {
            throw new Error('El horario ya existe.');
        }
        

        await db.query(insertQuery, [idGrupoMateria, idBloque, dia]);
    } catch (error) {
        console.error('Error al agregar horario:', error);
        throw error;
    }
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


exports.grupoMaterias_sin_horario = async (idGrupo) => {
    let query;
    let queryParams = [];

    // Si se pasa un idGrupo, se hace la consulta con detalles completos de la materia y el horario
    if (idGrupo) {
        query = `
        SELECT 
    gm.id_grupo_materia AS idGrupoMateria,
    mc.materia,
    p.nombre AS profesor,
    p.apellido_paterno AS apellidoPaterno,
    p.apellido_materno AS apellidoMaterno
FROM 
    GrupoMateria gm
JOIN 
    grupo g ON gm.id_grupo = g.idGrupo
JOIN 
    MapaCurricular mc ON gm.idMapaCurricular = mc.id_mapa_curricular
JOIN 
    Profesor prof ON gm.idProfesor = prof.id_profesor
JOIN 
    Persona p ON prof.id_profesor = p.id_persona
WHERE 
    g.idGrupo = ?
GROUP BY 
    gm.id_grupo_materia, mc.materia, p.nombre, p.apellido_paterno, p.apellido_materno;
        `;
        queryParams = [idGrupo];  // El parámetro idGrupo se pasa aquí
    } else {
        // Si no se pasa idGrupo, lanza un error o retorna un mensaje adecuado.
        throw new Error('Se requiere un idGrupo para realizar la consulta.');
    }

    try {
        // Ejecuta la consulta con los parámetros adecuados
        const [results] = await db.query(query, queryParams);
        return results;
    } catch (err) {
        // Maneja cualquier error que ocurra durante la ejecución
        throw new Error(`Error al obtener los datos de GrupoMateria: ${err.message}`);
    }
};


// Obtener todas las relaciones de GrupoMateria
exports.getAllGrupoMaterias = async (idGrupo) => {
    let query;
    let queryParams = [];

    // Condición: si se pasa un idGrupo, se hace la consulta con detalles completos de la materia y el horario
    if (idGrupo) {
        query = `
  SELECT 
    gm.id_grupo_materia AS idGrupoMateria,
    mc.materia,
    p.nombre AS profesor,
    p.apellido_paterno AS apellidoPaterno,
    p.apellido_materno AS apellidoMaterno,
    h.dia AS diaHorario,
    b.HoraInicio AS horaInicio,
    b.HoraFin AS horaFin
FROM 
    GrupoMateria gm
JOIN 
    grupo g ON gm.id_grupo = g.idGrupo
JOIN 
    MapaCurricular mc ON gm.idMapaCurricular = mc.id_mapa_curricular
JOIN 
    Profesor prof ON gm.idProfesor = prof.id_profesor
JOIN 
    Persona p ON prof.id_profesor = p.id_persona
LEFT JOIN 
    Horario h ON gm.id_grupo_materia = h.idGrupoMateria
LEFT JOIN 
    Bloque b ON h.id_Bloque = b.idBloque
WHERE 
    g.idGrupo = ?;
        `;
        queryParams = [idGrupo];  // El parámetro idGrupo se pasa aquí
    } else {
        // Si no se pasa idGrupo, se ejecuta la consulta original sin los detalles completos
        query = `
       SELECT 
    GrupoMateria.id_grupo_materia,
    grupo.nombre AS nombre_grupo,
    MapaCurricular.materia AS nombre_materia,
    GrupoMateria.tipo,
    GrupoMateria.fecha,
    GrupoMateria.idProfesor
FROM 
    GrupoMateria
JOIN 
    grupo ON GrupoMateria.id_grupo = grupo.idGrupo
JOIN 
    MapaCurricular ON GrupoMateria.idMapaCurricular = MapaCurricular.id_mapa_curricular;
        `;
    }

    try {
        // Ejecuta la consulta con los parámetros adecuados
        const [results] = await db.query(query, queryParams);
        return results;
    } catch (err) {
        // Maneja cualquier error que ocurra durante la ejecución
        throw new Error(`Error al obtener los datos de GrupoMateria: ${err.message}`);
    }
};


// Crear una nueva relación GrupoMateria
// Crear una nueva relación GrupoMateria
exports.createGrupoMateria = async (data) => {
    const { id_grupo, idMapaCurricular, tipo, id_profesor } = data;

    // Validación inicial de los campos obligatorios y numéricos
    if (!id_grupo || !idMapaCurricular || isNaN(id_grupo) || isNaN(idMapaCurricular)) {
        throw new Error('Grupo y Materia son obligatorios y deben ser valores numéricos');
    }

    // Consulta para verificar si la combinación ya existe
    const checkQuery = `
        SELECT COUNT(*) AS count FROM GrupoMateria
        WHERE id_grupo = ? AND idMapaCurricular = ?
    `;

    try {
        const [rows] = await db.query(checkQuery, [id_grupo, idMapaCurricular]);

        if (rows[0].count > 0) {
            throw new Error('Este Mapa Curricular ya está asignado a este Grupo');
        }

        // Si la combinación no existe, proceder con la inserción
        const insertQuery = `
            INSERT INTO GrupoMateria (id_grupo, idMapaCurricular, tipo, idProfesor)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(insertQuery, [id_grupo, idMapaCurricular, tipo, id_profesor]);

    } catch (error) {
        console.error('Error al agregar GrupoMateria:', error);
        throw error;
    }
};



exports.deleteGrupoMateria = async (idGrupoMateria) => {
    try {
        // Eliminar las entradas correspondientes en la tabla Horario
        await db.execute(`DELETE FROM horario WHERE idGrupoMateria = ?`, [idGrupoMateria]);

        // Ahora eliminar el registro en la tabla grupomateria
        const [resultado] = await db.execute(`DELETE FROM grupomateria WHERE id_grupo_materia = ?`, [idGrupoMateria]);

        return resultado;
    } catch (error) {
        console.error('Error al eliminar GrupoMateria:', error);
        throw error;
    }
};


// Método para actualizar una relación GrupoMateria
exports.updateGrupoMateria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id_grupo_materia, id_grupo, idMapaCurricular, tipo, fecha } = data;
        console.log(data);
        const query = `
            UPDATE GrupoMateria 
            SET id_grupo = ?, idMapaCurricular = ?, tipo = ?, fecha = ? 
            WHERE id_grupo_materia = ?
        `;
        try {
            await db.query(query, [id_grupo, idMapaCurricular, tipo, fecha, id_grupo_materia]);
            resolve();
        } catch (error) {
            console.error('Error al actualizar GrupoMateria:', error);
            reject(error);
        }
    });
};


//CRUD DE ACTIVIDAD 
// Obtener todas las Actividades
exports.getAllActividad = async () => {
    const query = `
        SELECT 
            IdActividad, 
            Nombre
        FROM 
            Actividad
    `;

    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener Actividades: ${err.message}`);
    }
};

// Modelo para agregar una nueva Actividad
exports.createActividad = async (data) => {
    const { Nombre } = data;

    const checkQuery = `
        SELECT COUNT(*) as count
        FROM Actividad
        WHERE Nombre = ?
    `;

    const insertQuery = `
        INSERT INTO Actividad (Nombre)
        VALUES (?)
    `;

    try {
        const [rows] = await db.query(checkQuery, [Nombre]);
        if (rows[0].count > 0) {
            throw new Error("El nombre ya está registrado.");
        }

        const [result] = await db.query(insertQuery, [Nombre]);
        return result.insertId; // Devuelve el ID de la nueva actividad
    } catch (error) {
        console.error("Error al agregar Actividad:", error);
        throw error;
    }
};

// Modelo para editar una Actividad
exports.updateActividad = async (data) => {
    const { IdActividad, Nombre } = data;

    const checkQuery = `
        SELECT COUNT(*) as count
        FROM Actividad
        WHERE Nombre = ? AND IdActividad != ?
    `;

    const updateQuery = `
        UPDATE Actividad
        SET Nombre = ?
        WHERE IdActividad = ?
    `;

    try {
        const [rows] = await db.query(checkQuery, [Nombre, IdActividad]);
        if (rows[0].count > 0) {
            throw new Error("El nombre ya está registrado en otra actividad.");
        }

        await db.query(updateQuery, [Nombre, IdActividad]);
        return true; // Indica que la actualización fue exitosa
    } catch (error) {
        console.error("Error al actualizar Actividad:", error);
        throw error;
    }
};

// Método para eliminar una Actividad
exports.deleteActividad = async (IdActividad) => {
    try {
        const [result] = await db.query(
            `DELETE FROM Actividad WHERE IdActividad = ?`,
            [IdActividad]
        );
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error("Error al eliminar Actividad:", error);
        throw error;
    }
};

//MODELO DE TRAMITE
//tramite:
exports.getAllTramite = async () => {
    const query = `
        SELECT 
           *
        FROM 
            Tramite
    `;

    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener Tramites: ${err.message}`);
    }
};

// Modelo para agregar un nuevo tramite 
exports.createTramite = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { Nombre, Desde, Hasta } = data;

        // Consulta SQL corregida para insertar un nuevo Tramite
        const query = `
            INSERT INTO Tramite (Nombre, Desde, Hasta)
            VALUES (?, ?, ?)
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [Nombre, Desde, Hasta]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('Error al agregar Tramite:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


// Modelo para editar un Tramite de apertura de periodo
exports.updateTramite = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { IdTramite, Nombre, Desde, Hasta} = data;

        // Consulta SQL para actualizar los datos del Tramite
        const query = `
            UPDATE Tramite 
            SET Nombre = ?, Desde = ?, Hasta = ?
            WHERE IdTramite = ?
        `;

        try {
            // Ejecutar la consulta con los valores proporcionados
            await db.query(query, [Nombre, Desde, Hasta, IdTramite]);
            resolve(); // Resuelve la promesa si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar Tramite:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

// Método para eliminar un Tramite
exports.deleteTramite = async function(IdTramite) {
    try {
        const [result] = await db.execute(`DELETE FROM Tramite WHERE IdTramite = ?`, [IdTramite]);
        return result; // Devuelve el resultado si es necesario
    } catch (error) {
        console.error('Error al eliminar Tramite:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
};



//Modelo para el proceso del tramite
exports.getTramiteProceso = async () => {
    const query = `
        SELECT 
            tp.*, 
            t.Nombre AS NombreTramite,
            t.IdTramite,
            a.Nombre AS NombreActividad,
            a.IdActividad
        FROM TramiteProceso tp
        INNER JOIN Tramite t ON tp.Idtramite = t.IdTramite
        INNER JOIN Actividad a ON tp.IdActividad = a.IdActividad;
    `;

    try {
        const [results] = await db.query(query); // Usa await para la consulta
        return results;
    } catch (err) {
        throw new Error(`Error al consultar TramiteProceso: ${err.message}`);
    }
};

// Crear una nueva relación TramiteProceso
exports.createTramiteProceso = async (data) => {
    const { id_tramite, id_actividad, objeto, orden } = data;

    if (!id_tramite || !id_actividad || !objeto || !orden) {
        throw new Error('Todos los campos son obligatorios');
    }

    const query = `
        INSERT INTO TramiteProceso (Idtramite, IdActividad, Objeto, Orden)
        VALUES (?, ?, ?, ?)
    `;

    try {
        // Ejecuta la consulta para insertar los datos
        await db.query(query, [id_tramite, id_actividad, objeto, orden]);
    } catch (error) {
        console.error('Error al agregar TramiteProceso:', error);
        throw error;
    }
};

// Método para actualizar un Proceso de Trámite
exports.updateTramiteProceso = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { id, id_tramite, id_actividad, objeto, orden } = data;
       // console.log(data); // Esto es solo para verificar que los datos llegan correctamente
        
        // Consulta SQL para actualizar el proceso de trámite
        const query = `
            UPDATE TramiteProceso 
            SET Idtramite = ?, IdActividad = ?, objeto = ?, orden = ? 
            WHERE idTramiteProceso = ?
        `;
        
        try {
            // Ejecutar la consulta con los parámetros adecuados
            await db.query(query, [id_tramite, id_actividad, objeto, orden, id]);
            resolve(); // Resolver si la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar el Proceso de Trámite:', error);
            reject(error); // Rechazar en caso de error
        }
    });
};

exports.deleteTramiteProceso = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `DELETE FROM TramiteProceso WHERE idTramiteProceso = ?`; // Consulta SQL para eliminar el proceso de trámite
        
        try {
            await db.query(query, [id]); // Ejecutar la consulta con el ID proporcionado
            resolve(); // Resolver si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar el proceso de trámite:', error);
            reject(error); // Rechazar en caso de error
        }
    });
};

//alumno tramite select

//Modelo para el proceso del tramite
exports.getAlumnoTramite = async () => {
    const query = `
     SELECT 
    Alt.IdAlumnoTramite,
    ap.matricula,
    alumno.id_alumno,
    p.nombre AS NombreAlumno,
    p.apellido_paterno AS apellidoPaterno,
    p.apellido_materno AS apellidoMaterno,
    Tramite.Nombre AS NombreTramite,
    CONCAT (prog.Titulo_tsu, ' ', prog.Titulo_Ing) AS Programa_Nombre,
    Tramite.IdTramite,
    Alt.Estatus
FROM 
    AlumnoTramite Alt
JOIN 
    alumno  ON Alt.IdAlumno = alumno.id_alumno
JOIN 
    Persona p ON alumno.id_alumno = p.id_persona
Join alumno_programa ap on ap.idAlumno = alumno.id_alumno
LEFT JOIN 
    Tramite  ON Alt.IdTramite = Tramite.IdTramite
LEFT JOIN 
    programaacademico prog ON ap.idProgramaAcademico = prog.id_programa_academico;
    `;

    try {
        const [results] = await db.query(query); // Usa await para la consulta
        return results;
    } catch (err) {
        throw new Error(`Error al consultar TramiteProceso: ${err.message}`);
    }
};





//Alumno tramite insert
exports.createTramiteAlumno = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { IdTramite, IdAlumno, idPeriodo, estatus } = data;
        const fecha = new Date();

        // Consulta para verificar si ya existe la combinación IdAlumno y IdTramite
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM alumnotramite 
            WHERE IdAlumno = ? AND IdTramite = ?
        `;

        // Consulta SQL para insertar un nuevo Tramite
        const insertQuery = `
            INSERT INTO alumnotramite (IdTramite, IdAlumno, IdPeriodo, Fecha, Estatus) 
            VALUES (?, ?, ?, ?, ?);
        `;

        try {
            // Verificar si la combinación ya existe
            const [checkResult] = await db.query(checkQuery, [IdAlumno, IdTramite]);
            if (checkResult[0].count > 0) {
                // Si existe, rechazar la promesa con un mensaje de error
                return reject(new Error('El trámite para este alumno ya existe.'));
            }

            // Si no existe, proceder con la inserción
            const [insertResult] = await db.query(insertQuery, [IdTramite, IdAlumno, idPeriodo, fecha, estatus]);
            const IdAlumnoTramite = insertResult.insertId;

            if (IdAlumnoTramite) {
                // Ejecutar cualquier lógica adicional si es necesario
                await this.createAlumnoProceso(IdTramite, IdAlumno, IdAlumnoTramite);
            }

            // Resolver la promesa indicando éxito
            resolve();
        } catch (error) {
            console.error('Error al agregar Tramite:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};

exports.createAlumnoProceso = async (IdTramite, IdAlumno, IdAlumnoTramite) => {
        const queryConsulta = `
SELECT ac.Nombre, ac.IdActividad, pro.idTramiteProceso,pro.orden FROM integradora_se.tramiteproceso as pro INNER JOIN actividad as ac on ac.IdActividad = pro.IdActividad where pro.Idtramite = ?`;
        try {
            // Ejecutar la consulta con los valores proporcionados
            const [results] = await db.query(queryConsulta, [IdTramite]); 
            console.log(results);
           results.forEach(element => {
            var NombreActividad = element['Nombre'];
            var IdActividad = element['IdActividad'];
            var orden = element['orden'];
            var IdTramiteProceso = element['idTramiteProceso'];
            this.insertAlumnoProceso(NombreActividad, IdActividad, orden, IdTramite, IdAlumno, IdAlumnoTramite, IdTramiteProceso);
           });
        } catch (error) {
            console.error('Error al agregar Tramite:', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
};


exports.insertAlumnoProceso = async (NombreActividad, IdActividad, orden, IdTramite, IdAlumno, IdAlumnoTramite, IdTramiteProceso) => {
    return new Promise(async (resolve, reject) => {
        // Consulta SQL corregida para insertar un nuevo Tramite
        const query = `
        INSERT INTO alumnoproceso (IdAlumnoTramite, IdTramiteProceso, IdActividad, Orden) VALUES (?, ?, ?, ?)`;
        try {
            // Ejecutar la consulta con los valores proporcionados
            const result = await db.query(query, [IdAlumnoTramite, IdTramiteProceso, IdActividad, orden ]);
            resolve(); // Resuelve la promesa si la inserción fue exitosa
        } catch (error) {
            console.error('ERROR EN LA FUNCION insertAlumnoProceso', error); // Registro del error en la consola
            reject(error); // Rechaza la promesa si ocurre un error
        }
    });
};


//MODELO ALUMNO TRAMITE 

//Obtener todos los registros de AlumnoTramite
exports.getAllAlumnoTramites = async () => {
    const query = `
        SELECT 
            at.IdAlumnoTramite,
            ap.matricula AS MatriculaAlumno,
            CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS NombreAlumno,
         CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS ProgramaAcademico,
            t.Nombre AS NombreTramite,
            tap.periodo AS Periodo,
            at.Fecha,
            at.Estatus
        FROM 
            AlumnoTramite at
        JOIN 
            Alumno a ON at.IdAlumno = a.id_alumno
        JOIN 
            Persona p ON a.id_alumno = p.id_persona
        JOIN alumno_programa as ap on ap.idAlumno = a.id_alumno
        JOIN 
            ProgramaAcademico pa ON ap.idProgramaAcademico = pa.id_programa_academico
        JOIN 
            Tramite t ON at.IdTramite = t.IdTramite
        JOIN 
            periodo tap ON at.IdPeriodo = tap.id_periodo
         
    `;

    try {
        const [results] = await db.query(query);
        return results;
    } catch (err) {
        throw new Error(`Error al obtener los AlumnoTramites: ${err.message}`);
    }
};

// Agregar un nuevo AlumnoTramite
exports.createAlumnoTramite = async (data) => {
    const { IdTramite, IdAlumno, IdPeriodo, Fecha, Estatus } = data;

    const query = `
        INSERT INTO AlumnoTramite (IdTramite, IdAlumno, IdPeriodo, Fecha, Estatus)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        await db.query(query, [IdTramite, IdAlumno, IdPeriodo, Fecha, Estatus]);
    } catch (err) {
        throw new Error(`Error al agregar AlumnoTramite: ${err.message}`);
    }
};

// Editar un AlumnoTramite existente
exports.updateAlumnoTramite = async (data) => {
    const { IdAlumnoTramite, IdTramite, IdPeriodo, Fecha, Estatus } = data;

    const query = `
        UPDATE AlumnoTramite
        SET 
            IdTramite = ?, 
            IdPeriodo = ?, 
            Fecha = ?, 
            Estatus = ?
        WHERE IdAlumnoTramite = ?
    `;

    try {
        await db.query(query, [IdTramite, IdPeriodo, Fecha, Estatus, IdAlumnoTramite]);
    } catch (err) {
        throw new Error(`Error al actualizar AlumnoTramite: ${err.message}`);
    }
};


// Eliminar un AlumnoTramite
exports.deleteAlumnoTramite = async (IdAlumnoTramite) => {
    const query = `DELETE FROM AlumnoTramite WHERE IdAlumnoTramite = ?`;

    try {
        const [result] = await db.query(query, [IdAlumnoTramite]);
        return result;
    } catch (err) {
        throw new Error(`Error al eliminar AlumnoTramite: ${err.message}`);
    }
};


exports.getAllAlumnosPa = async () => {
    const query = `
    SELECT alp.*,concat(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) as nombre , pe.periodo,   CONCAT(pa.Titulo_tsu, ' ', pa.Titulo_Ing) AS programa FROM integradora_se.alumno_programa as alp 
    INNER JOIN alumno as al on al.id_alumno = alp.idAlumno 
    INNER JOIN persona as p on p.id_persona = al.id_alumno
    INNER JOIN periodo as pe on pe.id_periodo = alp.idPeriodo
    INNER JOIN programaacademico as pa on pa.id_programa_academico = alp.idProgramaAcademico 
    `;

    try {
        const [results] = await db.query(query);
        results.forEach(element => {
            // console.log(element);
 
             element['desde'] = element['desde'].toISOString().split('T')[0];
             element['hasta'] = element['hasta'].toISOString().split('T')[0];

         });
        return results;
    } catch (err) {
        throw new Error(`Error al obtener los AlumnoPrograma: ${err.message}`);
    }
};

exports.createAlumnoPa = async (data) => {
    const { id_alumno, id_programa_academico, id_periodo, matricula, estatus, desde, hasta } = data;

    const query = `
    INSERT INTO integradora_se.alumno_programa (idAlumno, idProgramaAcademico, idPeriodo, matricula, estatus, desde, hasta) VALUES (?,?,?,?,?,?,?);
    `;

    try {
        await db.query(query, [id_alumno, id_programa_academico, id_periodo, matricula, estatus, desde ,hasta]);
    } catch (err) {
        throw new Error(`Error al agregar AlumnoTramite: ${err.message}`);
    }
};

exports.editAlumnoPa = async (data) => {
  //  console.log(data);
    const { idAlumnoPa, id_programa_academico, id_periodo, matricula, estatus, desde, hasta } = data;

    const query = `
    UPDATE integradora_se.alumno_programa SET idProgramaAcademico = ?, idPeriodo = ?, matricula = ?, estatus = ?, desde = ?, hasta = ? WHERE idAlumnoPrograma = ?
    `;

    try {
        await db.query(query, [id_programa_academico, id_periodo, matricula, estatus, desde ,hasta, idAlumnoPa]);
    } catch (err) {
        throw new Error(`Error al agregar AlumnoTramite: ${err.message}`);
    }
};


exports.deleteAlumnoPa = async (idAlumnoPa) => {
    const query = `DELETE FROM alumno_programa WHERE idAlumnoPrograma = ?`;

    try {
        const [result] = await db.query(query, [idAlumnoPa]);
        return result;
    } catch (err) {
        throw new Error(`Error al eliminar AlumnoPA: ${err.message}`);
    }
};

exports.valdiarAlumnoPa = async (IdAlumno) => {
   // console.log(IdAlumno);
    const query = `SELECT * FROM integradora_se.alumno_programa where idAlumno = ? AND estatus = 'Activo'; `;

    try {
        const [results] = await db.query(query, [IdAlumno]);
     //   console.log(query);
       // console.log(results);
        return results;
    } catch (err) {
        throw new Error(`Error al actualizar AlumnoTramite: ${err.message}`);
    }
};




//MODELO DE ALUMNOPROCESO
// Modelo para el Alumno Proceso
exports.getAlumnoProceso = async () => {
    const query = `
        SELECT     ap.IdAlumnoProceso,
            ap.IdAlumnoTramite,
            ap.IdTramiteProceso,
            ap.IdActividad,
            ap.Orden,
            ap.Estatus,
            ap.Observacion,
            act.Nombre AS NombreActividad,
            Persona.Nombre AS NombreAlumno
        FROM alumnoproceso ap
        JOIN Actividad act ON ap.IdActividad = act.IdActividad
        JOIN alumnotramite atr ON ap.IdAlumnoTramite = atr.IdAlumnoTramite
        JOIN Alumno ON atr.IdAlumno = Alumno.id_alumno
        JOIN Persona ON Alumno.id_alumno = Persona.id_persona`;

    try {
        // Ejecuta la consulta en la base de datos
        const [results] = await db.query(query);

        if (!results.length) {
            console.warn('No se encontraron registros en AlumnoProceso.');
        }

        return results;
    } catch (err) {
        // Manejo de errores
        throw new Error(`Error al consultar AlumnoProceso: ${err.message}`);
    }
};

// Crear una nueva relación AlumnoProceso
exports.createAlumnoProcesos  = async (data) => {
    const { IdAlumnoTramite, IdTramiteProceso, IdActividad, Orden, Estatus, Observacion} = data;
    
    if (!IdAlumnoTramite || !IdTramiteProceso || !IdActividad || !Orden || !Estatus) {
        throw new Error('Todos los campos son obligatorios');
    }

    const query = `
        INSERT INTO alumnoproceso (IdAlumnoTramite, IdTramiteProceso, IdActividad, Orden, Estatus, Observacion)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        // Ejecuta la consulta para insertar los datos
        await db.query(query, [IdAlumnoTramite, IdTramiteProceso, IdActividad, Orden, Estatus, Observacion]);
    } catch (error) {
        console.error('Error al agregar AlumnoProceso:', error);
        throw error;
    }
};
// Editar un alumnoproceso existente
exports.updateAlumnoProceso = async (data) => {
    const { IdAlumnoProceso, IdAlumnoTramite, IdTramiteProceso, IdActividad, Orden, Estatus, Observacion } = data;

    const query = `
        UPDATE alumnoproceso
        SET 
            IdAlumnoTramite = ?, 
            IdTramiteProceso = ?, 
            IdActividad = ?, 
            Orden = ?, 
            Estatus = ?, 
            Observacion = ?
        WHERE IdAlumnoProceso = ?
    `;
    const checkQuery = 'SELECT * FROM alumnoproceso WHERE IdAlumnoProceso = ?';
    const result = await db.query(checkQuery, [IdAlumnoProceso]); 
    
    try {
        // Asegúrate de pasar los parámetros en el mismo orden que las columnas en el SET
        await db.query(query, [
            IdAlumnoTramite,   // El primer valor es para IdAlumnoTramite
            IdTramiteProceso,  // El segundo valor es para IdTramiteProceso
            IdActividad,       // El tercer valor es para IdActividad
            Orden,             // El cuarto valor es para Orden
            Estatus,           // El quinto valor es para Estatus
            Observacion,       // El sexto valor es para Observacion
            IdAlumnoProceso    // El séptimo valor es para IdAlumnoProceso (para la condición WHERE)
        ]);
    } catch (err) {
        throw new Error(`Error al actualizar AlumnoProceso: ${err.message}`);
    }
};


// Eliminar un AlumnoProceso
exports.deleteAlumnoProceso = async (IdAlumnoProceso) => {
    const query = `DELETE FROM alumnoproceso WHERE IdAlumnoProceso = ?`;

    try {
        const [result] = await db.query(query, [IdAlumnoProceso]);
        return result;
    } catch (err) {
        throw new Error(`Error al eliminar AlumnoProceso: ${err.message}`);
    }
};



// Función para obtener datos de AlumnoProceso por IdAlumnoTramite
exports.getAlumnoprocesowhereId = async (id) => {
    //console.log(`Fetching AlumnoProceso with IdAlumnoTramite: ${id}`);
    const query = `
        SELECT  
            ap.IdAlumnoProceso,
            ap.IdAlumnoTramite,
            ap.IdTramiteProceso,
            ap.IdActividad,
            ap.Orden,
            ap.Estatus,
            ap.Observacion,
            Persona.apellido_paterno,
            Persona.apellido_materno,
            alumno_programa.matricula,
            tramite.Nombre as NombreTramite,
            act.Nombre AS NombreActividad,
            Persona.Nombre AS NombreAlumno,
            CONCAT(programaacademico.Titulo_tsu, ' ', programaacademico.Titulo_Ing)  as NombrePrograma
        FROM alumnoproceso ap
        JOIN Actividad act ON ap.IdActividad = act.IdActividad
        JOIN alumnotramite atr ON ap.IdAlumnoTramite = atr.IdAlumnoTramite
        JOIN tramite ON atr.IdTramite = tramite.IdTramite
        JOIN Alumno ON atr.IdAlumno = Alumno.id_alumno
        JOIN Persona ON Alumno.id_alumno = Persona.id_persona
        JOIN alumno_programa ON Alumno.id_alumno = alumno_programa.idAlumno
        JOIN programaacademico ON alumno_programa.idProgramaAcademico = programaacademico.id_programa_academico
        WHERE atr.IdAlumnoTramite = ?;
    `;

    try {
        const [results] = await db.query(query, [id]);
     //   console.log(`Query executed successfully. Number of records: ${results.length}`);
        
        if (!results.length) {
            console.warn('No se encontraron registros en AlumnoProceso.');
        }

        return results;
    } catch (err) {
        console.error(`Error al consultar AlumnoProceso: ${err.message}`);
        throw new Error(`Error al consultar AlumnoProceso: ${err.message}`);
    }
};


// Función para obtener datos de AlumnoProceso por IdAlumnoTramite
exports.getAlumno_alumnoproceso_Id = async (id) => {
    //console.log(`Fetching AlumnoProceso with IdAlumnoTramite: ${id}`);
    const query = `
   SELECT DISTINCT  
    tramite.Nombre AS NombreTramite,
    Persona.Nombre AS NombreAlumno,
    Persona.apellido_paterno,
    Persona.apellido_materno,
    alumno_programa.matricula,
    CONCAT(programaacademico.Titulo_tsu, ' ', programaacademico.Titulo_Ing)  as NombrePrograma
FROM alumnoproceso ap
JOIN Actividad act ON ap.IdActividad = act.IdActividad
JOIN alumnotramite atr ON ap.IdAlumnoTramite = atr.IdAlumnoTramite
JOIN tramite ON atr.IdTramite = tramite.IdTramite
JOIN Alumno ON atr.IdAlumno = Alumno.id_alumno
JOIN Persona ON Alumno.id_alumno = Persona.id_persona
JOIN alumno_programa ON Alumno.id_alumno = alumno_programa.idAlumno
JOIN programaacademico ON alumno_programa.idProgramaAcademico = programaacademico.id_programa_academico
WHERE atr.IdAlumnoTramite = ?;
    `;

    try {
        const [results] = await db.query(query, [id]);
      //  console.log(`Query executed successfully. Number of records: ${results.length}`);
        
        if (!results.length) {
            console.warn('No se encontraron registros en AlumnoProceso.');
        }

        return results;
    } catch (err) {
        console.error(`Error al consultar AlumnoProceso: ${err.message}`);
        throw new Error(`Error al consultar AlumnoProceso: ${err.message}`);
    }
};