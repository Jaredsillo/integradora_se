// middlewares/checkAuth.js
exports.checkAuth = (req, res, next) => {
    // Verifica si el usuario tiene una sesión activa
    if (req.session.userId) {
        // Redirigir a la vista principal si la sesión está activa
        return res.redirect('/sp_admin/vista_principal');
    }
    // Si no hay sesión, permite el acceso a la ruta de inicio de sesión
    next();
};

exports.ensureAuthenticated = (req, res, next) => {
   // console.log('Session UserId:', req.session.userId); // Debugging
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Middleware para permitir acceso a los roles 1
exports.denyrouteuser = (req, res, next) => {
    const userRoles = req.session.userRoles; // Se asume que userRoles es un array

    // Lista de roles permitidos
    const allowedRoles = [1];

    // Verifica si algún rol permitido está presente en los roles del usuario
    if (Array.isArray(userRoles) && userRoles.some(role => allowedRoles.includes(role))) {
        return next(); // Permite el acceso si el usuario tiene al menos uno de los roles permitidos
    }

    res.status(403).send('Acceso denegado'); // Deniega el acceso para cualquier otro rol
};


// Middleware para permitir acceso a los roles 1
exports.denyrouteadmin = (req, res, next) => {
    const userRoles = req.session.userRoles; // Se asume que userRole es un array

    // Lista de roles permitidos
    const allowedRoles = [1];

    // Verifica si algún rol permitido está presente en los roles del usuario
    if (Array.isArray(userRoles) && userRoles.some(role => allowedRoles.includes(role))) {
        return next(); // Permite el acceso si el usuario tiene al menos uno de los roles permitidos
    }

    res.status(403).send('Acceso denegado'); // Deniega el acceso para cualquier otro rol
};



