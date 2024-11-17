console.log('departamentos_puestos_administrativos.js cargado correctamente');

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

    // Manejo de creación de administrativo
    const departamentoSelectCreate = document.getElementById('departamentoAdmin');
    const puestoSelectCreate = document.getElementById('puestoAdmin');
    const departamentosCreate = JSON.parse(departamentoSelectCreate.getAttribute('data-departamentos'));

    departamentoSelectCreate.addEventListener('change', function() {
        updatePuestos(departamentoSelectCreate, puestoSelectCreate, departamentosCreate);
    });

    // Manejo de edición de administrativo
    const departamentoSelectEdit = document.querySelectorAll('[id^="departamentoAdminEdit"]');
    departamentoSelectEdit.forEach(departamentoSelect => {
        const administrativoId = departamentoSelect.id.split('Edit')[1];
        const puestoSelect = document.getElementById(`puestoAdminEdit${administrativoId}`);
        const departamentosEdit = JSON.parse(departamentoSelect.getAttribute('data-departamentos'));

        departamentoSelect.addEventListener('change', function() {
            updatePuestos(departamentoSelect, puestoSelect, departamentosEdit);
        });
    });
});
