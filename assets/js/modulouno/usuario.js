$(document).ready(function () {
  // Inicializar DataTable en la tabla de usuarios
  $('#userTable').DataTable({
      // Opciones adicionales de configuración si las necesitas
      language: {
          url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // Cambia el idioma a español
      }
  });
  // Agregar eventos para los formularios de modal
  $('#addUserForm').on('submit', function (e) {
      e.preventDefault();
      // Lógica para agregar un usuario
  });
  $('#editUserForm').on('submit', function (e) {
      e.preventDefault();
      // Lógica para editar un usuario
  });
  $('#deleteUserForm').on('submit', function (e) {
      e.preventDefault();
      // Lógica para eliminar un usuario
  });
});