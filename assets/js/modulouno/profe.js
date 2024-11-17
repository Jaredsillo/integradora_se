$(document).ready(function () {
    // Inicializar DataTable en la tabla de profesores
    $('#profesorTable').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // Cambia el idioma a español
        }
    });

    // Ejemplo de cómo manejar los formularios
    $('#addProfesorForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para agregar un profesor
    });

    $('#editProfesorForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para editar un profesor
    });

    $('#deleteProfesorForm').on('submit', function (e) {
        e.preventDefault();
        // Lógica para eliminar un profesor
    });
});