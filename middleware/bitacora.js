const sp_model = require('../models/model_sp_admin');
/*
// Middleware para registrar acciones en la bitácora
const bitacora = (accion, movimiento) => {
    return async (req, res, next) => {
        const ipAddress = req.headers['x-forwarded-for'] || req.ip; // Obtiene la IP
        const userName = req.session.userName || 'Anónimo';
        try {
            await sp_model.addBitacora(userName, movimiento, accion, ipAddress);
        } catch (error) {
            console.error('Error al registrar la acción en la bitácora:', error);
        }
        next(); // Continúa al siguiente middleware o controlador
    };
};
*/

const bitacora = (accion, movimiento) => {
    return async (req, res, next) => {
        const ipAddress = req.ip;
        const userName = req.session.userName || 'Anónimo';
        try {
            await sp_model.addBitacora(userName, movimiento, accion, ipAddress);
        } catch (error) {
            console.error('Error al registrar la acción en la bitácora:', error);
        }
        next(); // Continúa al siguiente middleware o controlador
    };
};

module.exports = bitacora; // Asegúrate de exportar como `bitacora`