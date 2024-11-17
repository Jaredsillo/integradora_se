const bcrypt = require('bcryptjs');
const loginModel = require('../models/model_login');


// Lógica para manejar el login
exports.login = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // Llamar al modelo para verificar el usuario
        const user = await loginModel.loginUser(usuario, contrasena);

        if (!user) {
        
            return res.status(401).send('Usuario no encontrado o inactivo');
        
        }
// asignar 
        // Verificamos si la contraseña coincide
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(401).send('Contraseña incorrecta');
        }

        // Almacenar información en la sesión
        req.session.userId = user.id_user;
        req.session.userName = user.usuario;
        req.session.userRoles = user.roles; // Almacenamos los roles como un array



        // Agregamos un console.log para ver el contenido de la sesión
        console.log('Sesión guardada:', req.session);
        
        // Redirigir a la vista general
        return res.redirect('/sp_admin/vista_principal');
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.status(500).send('Error del servidor');
    }
};


exports.logout = (req, res) => {
    // Verificar si existe la sesión
    if (!req.session) {
        return res.redirect('/');
    }

    // Mostrar la información del usuario antes de destruir la sesión
    const userId = req.session.userId;
    const userName = req.session.userName;
    const userRoles = req.session.userRoles;

    console.log("Datos del usuario antes de cerrar sesión:");
    console.log(`userId: ${userId}, userName: ${userName}, userRoles: ${JSON.stringify(userRoles)}`);

    // Destruye la sesión actual
    req.session.destroy((err) => {
        if (err) {
            console.log("Error al destruir la sesión:", err);
            return res.status(500).send('Error al cerrar la sesión');
        }

        console.log("Sesión destruida");

        // Elimina la cookie de sesión del navegador
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        console.log("Cookie de sesión eliminada");

        // Redirige al usuario a la página de inicio de sesión
        res.redirect('/');
    });
};
