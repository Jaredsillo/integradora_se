$(document).ready(function () {
    // Inicializar DataTable en la tabla de alumnos
    $('#alumnoTable').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // Cambia el idioma a español
        }
    });
    
    // Ejemplo de cómo manejar los formularios de alumno
    $('#addAlumnoForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para agregar un alumno
    });

    $('#editAlumnoForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para editar un alumno
    });

    $('#deleteAlumnoForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para eliminar un alumno
    });
});