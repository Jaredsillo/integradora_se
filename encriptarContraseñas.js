const bcrypt = require('bcryptjs');
const db = require('./config/connect_bd'); // Asegúrate de que la ruta a tu conexión sea la correcta

// Función para encriptar las contraseñas que aún no lo estén
const encriptarContraseñas = async () => {
    const query = 'SELECT id_user, contrasena FROM Usuario WHERE contrasena NOT LIKE "$2a$%"';
    
    db.query(query, async (err, results) => {
        if (err) throw err;

        for (let usuario of results) {
            const hashedPassword = await bcrypt.hash(usuario.contrasena, 10);
            const updateQuery = 'UPDATE Usuario SET contrasena = ? WHERE id_user = ?';
            
            db.query(updateQuery, [hashedPassword, usuario.id_user], (updateErr) => {
                if (updateErr) throw updateErr;
                console.log(`Contraseña del usuario con ID ${usuario.id_user} encriptada.`);
            });
        }
        db.end(); // Cerrar la conexión a la base de datos
    });
};

encriptarContraseñas();
