const db = require('../config/connect_bd'); // Tu archivo de conexión a la base de datos
// Función para verificar credenciales y obtener los roles del usuario
exports.loginUser = async (usuario, contrasena) => {
    const query = `
        SELECT Usuario.id_user, Usuario.usuario, Usuario.contrasena, GROUP_CONCAT(Rol_Usuario.id_rol) AS roles
        FROM Usuario 
        JOIN Rol_Usuario ON Usuario.id_user = Rol_Usuario.id_usuario
        JOIN Rol ON Rol.id_rol = Rol_Usuario.id_rol
        WHERE Usuario.usuario = ? AND Usuario.estatus = 1
        GROUP BY Usuario.id_user
    `;

    try {
        const [results] = await db.query(query, [usuario]);

        if (results.length === 0) {
            return null; // Usuario no encontrado o inactivo
        }

        // Convertimos la cadena de roles a un array de roles
        const user = results[0];
        user.roles = user.roles.split(',').map(Number); // Convierte la lista de roles en un array de enteros

        return user; // Devolvemos el usuario con los roles como array
    } catch (err) {
        throw new Error('Error al verificar las credenciales: ' + err.message);
    }
};

