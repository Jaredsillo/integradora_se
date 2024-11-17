console.log('departamentos_puestos.js cargado correctamente');

document.addEventListener('DOMContentLoaded', function() {
    // Función para actualizar los puestos según el departamento seleccionado
    function updatePuestos(departamentoSelect, puestoSelect, departamentos) {
        const selectedDepartamentoId = departamentoSelect.value;
        const selectedDepartamento = departamentos.find(dept => dept.id == selectedDepartamentoId);

        // Limpiar el select de puestos
        puestoSelect.innerHTML = '<option value="">Seleccione un puesto</option>';

        if (selectedDepartamento && selectedDepartamento.puestos.length > 0) {
            selectedDepartamento.puestos.forEach(puesto => {
                const option = document.createElement('option');
                option.value = puesto.id;
                option.textContent = puesto.nombre;
                puestoSelect.appendChild(option);
            });
            puestoSelect.disabled = false; // Habilitar el select de puesto
        } else {
            puestoSelect.disabled = true; // Deshabilitar el select si no hay puestos
        }

        // Refrescar el selectpicker
        $(puestoSelect).selectpicker('refresh');
    }

    // Manejo de creación de profesor
    const departamentoSelectCreate = document.getElementById('departamentoProfesor');
    const puestoSelectCreate = document.getElementById('puestoProfesor');
    const departamentosCreate = JSON.parse(departamentoSelectCreate.getAttribute('data-departamentos'));

    departamentoSelectCreate.addEventListener('change', function() {
        updatePuestos(departamentoSelectCreate, puestoSelectCreate, departamentosCreate);
    });

    // Manejo de edición de profesor
    const departamentoSelectEdit = document.querySelectorAll('[id^="departamentoProfesorEdit"]');
    departamentoSelectEdit.forEach(departamentoSelect => {
        const profesorId = departamentoSelect.id.split('Edit')[1];
        const puestoSelect = document.getElementById(`puestoProfesorEdit${profesorId}`);
        const departamentosEdit = JSON.parse(departamentoSelect.getAttribute('data-departamentos'));

        departamentoSelect.addEventListener('change', function() {
            updatePuestos(departamentoSelect, puestoSelect, departamentosEdit);
        });
    });
});
