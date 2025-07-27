// Espera a que todo el contenido HTML se cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- Selección de Elementos del DOM ---
    const mallaContainer = document.getElementById('malla-container');
    const todosLosRamos = document.querySelectorAll('.ramo');
    const modal = document.getElementById('modal-requisitos');
    const cerrarModal = document.querySelector('.cerrar-modal');
    const listaRequisitosUl = document.getElementById('lista-requisitos');
    const modalTitulo = document.getElementById('modal-titulo');

    // Mapeo para obtener el nombre completo de un ramo a partir de su ID
    const nombresRamos = {};
    todosLosRamos.forEach(ramo => {
        nombresRamos[ramo.dataset.id] = ramo.textContent;
    });

    // --- Estado de la Aplicación ---
    // Usamos un Set para un manejo más eficiente de los ramos aprobados (búsquedas rápidas)
    let ramosAprobados = new Set(JSON.parse(localStorage.getItem('ramosAprobadosMedicina')) || []);

    /**
     * Guarda el conjunto de ramos aprobados en el localStorage del navegador.
     */
    const guardarEstado = () => {
        localStorage.setItem('ramosAprobadosMedicina', JSON.stringify(Array.from(ramosAprobados)));
    };

    /**
     * Actualiza la apariencia de todos los ramos (aprobado, bloqueado, disponible)
     * basándose en el conjunto `ramosAprobados`.
     */
    const actualizarVisualizacionRamos = () => {
        todosLosRamos.forEach(ramo => {
            const id = ramo.dataset.id;
            const requisitos = ramo.dataset.requisitos?.split(',') || [];

            // Comprobar si los requisitos están cumplidos
            const requisitosCumplidos = requisitos.every(req => ramosAprobados.has(req));

            // Quitar todas las clases de estado primero para limpiar
            ramo.classList.remove('aprobado', 'bloqueado');

            if (ramosAprobados.has(id)) {
                ramo.classList.add('aprobado');
            } else if (!requisitosCumplidos) {
                ramo.classList.add('bloqueado');
            }
        });
    };

    /**
     * Muestra el modal (ventana emergente) con la lista de requisitos faltantes.
     * @param {HTMLElement} ramoElement - El elemento del ramo que fue clickeado.
     * @param {string[]} requisitosFaltantes - Array de IDs de los requisitos no cumplidos.
     */
    const mostrarModalRequisitos = (ramoElement, requisitosFaltantes) => {
        // Limpiar la lista anterior
        listaRequisitosUl.innerHTML = '';
        
        modalTitulo.textContent = `Requisitos para "${ramoElement.textContent}"`;

        // Añadir cada requisito faltante a la lista en el modal
        requisitosFaltantes.forEach(reqId => {
            const li = document.createElement('li');
            li.textContent = nombresRamos[reqId] || reqId; // Usa el nombre completo si lo encuentra
            listaRequisitosUl.appendChild(li);
        });

        modal.style.display = 'block';
    };

    // --- Lógica de Eventos ---

    // Event Listener principal en el contenedor de la malla (delegación de eventos)
    mallaContainer.addEventListener('click', (e) => {
        // Asegurarse de que el clic fue sobre un elemento con la clase 'ramo'
        if (!e.target.classList.contains('ramo')) return;

        const ramoClickeado = e.target;
        const id = ramoClickeado.dataset.id;

        // Si el ramo ya está aprobado, al hacer clic se "desaprueba"
        if (ramoClickeado.classList.contains('aprobado')) {
            ramosAprobados.delete(id);
        } else {
            // Comprobar requisitos antes de aprobar
            const requisitos = ramoClickeado.dataset.requisitos?.split(',').filter(Boolean) || [];
            const requisitosFaltantes = requisitos.filter(req => !ramosAprobados.has(req));
            
            if (requisitosFaltantes.length > 0) {
                // Si faltan requisitos, mostrar el modal en lugar de aprobar
                mostrarModalRequisitos(ramoClickeado, requisitosFaltantes);
                return; // Detener la ejecución para no aprobar el ramo
            } else {
                // Si no faltan requisitos, se aprueba
                ramosAprobados.add(id);
            }
        }

        // Después de cualquier cambio, guardar y actualizar la visualización
        guardarEstado();
        actualizarVisualizacionRamos();
    });

    // Cerrar el modal al hacer clic en la 'x'
    cerrarModal.onclick = () => {
        modal.style.display = 'none';
    };

    // Cerrar el modal al hacer clic fuera de su contenido
    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- Inicialización ---
    // Al cargar la página, actualizar la visualización inicial de los ramos.
    actualizarVisualizacionRamos();

});
