$(document).ready(function() {
  // Inicializar DataTable
  $('#adminTable').DataTable({
      // Opciones adicionales de configuración si las necesitas
      language: {
          url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // Cambia el idioma a español
      }
  });
  // Agregar eventos para los botones de modal
  $('#addAdminForm').on('submit', function(e) {
      e.preventDefault();
      // Lógica para agregar un administrador
  });
  $('#editAdminForm').on('submit', function(e) {
      e.preventDefault();
      // Lógica para editar un administrador
  });
  $('#deleteAdminForm').on('submit', function(e) {
      e.preventDefault();
      // Lógica para eliminar un administrador
  });
});