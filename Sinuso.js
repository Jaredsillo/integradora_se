// Importa el módulo bcryptjs
const bcrypt = require('bcryptjs');

// Define la contraseña que deseas encriptar
const password = 'holamundo'; // Reemplaza con tu contraseña

// Número de saltos para la encriptación (puedes usar 10 o más)
const saltRounds = 10;

// Encripta la contraseña
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        return console.error('Error al encriptar la contraseña:', err);
    }
    // Muestra el hash en la consola
    console.log('Contraseña encriptada:', hash);
});
