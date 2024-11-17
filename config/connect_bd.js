const mysql = require('mysql2');

// Configuración de la conexión
const connection = mysql.createConnection({
    host: 'localhost',   // Cambia esto según la configuración de tu servidor
    user: 'root',        // Tu usuario de MySQL
    password: '1223',    // Tu contraseña de MySQL
    database: 'Integradora_se'  // Nombre de tu base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos MySQL como ID:', connection.threadId);
});

// Hacer la conexión compatible con promesas
const db = connection.promise(); // Usa promesas directamente

module.exports = db; // Exporta 'db'
