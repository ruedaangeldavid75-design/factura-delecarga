document.addEventListener('DOMContentLoaded', () => {
    const elementos = {
        factura: document.getElementById('factura'),
        btnEditar: document.getElementById('btnEditar'),
        btnImprimir: document.getElementById('btnImprimir'),
        btnLimpiar: document.getElementById('btnLimpiar'),
        fabEditar: document.getElementById('fabEditar'),
        fabImprimir: document.getElementById('fabImprimir'),
        fabLimpiar: document.getElementById('fabLimpiar'),
        campos: document.querySelectorAll('.editable'),
        numero: document.querySelector('[data-campo="numero"]'),
        fecha: document.querySelector('[data-campo="fecha"]'),
        origen: document.querySelector('[data-campo="origen"]'),
        destino: document.querySelector('[data-campo="destino"]'),
        tOrigen: document.querySelector('[data-campo="t-origen"]'),
        tDestino: document.querySelector('[data-campo="t-destino"]'),
        tValor: document.querySelector('[data-campo="t-valor"]'),
        total: document.querySelector('[data-campo="total"]'),
        abono: document.querySelector('[data-campo="abono"]'),
        saldo: document.querySelector('[data-campo="saldo"]')
    };

    // ✅ PWA - Service Worker mejorado
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('✅ PWA lista para instalar'))
            .catch(err => console.log('❌ Error SW:', err));
    }

    let modoEdicion = false;
    let numeroActual = parseInt(localStorage.getItem('numeroFactura')) || 1;
    let touchStartY = 0;

    // 🔧 Funciones utilitarias
    const formatearNumero = (num) => '$ ' + parseFloat(num || 0).toLocaleString('es-CO');
    const obtenerNumeroLimpio = (elemento) => parseFloat(elemento?.textContent.replace(/[^\d]/g, '') || 0);
    const truncarTexto = (texto, max) => texto.length > max ? texto.slice(0, max) + '...' : texto;

    // ✅ 1. FORMATO MONETARIO
    function formatearMonto(elemento) {
        if (!elemento) return;
        const valorNumerico = obtenerNumeroLimpio(elemento);
        elemento.textContent = formatearNumero(valorNumerico);
    }

    // ✅ 2. VALIDACIÓN MEJORADA + TÁCTIL
    function validarInput(event) {
        const el = event.target;
        const tipo = el.getAttribute('data-type');
        const max = parseInt(el.getAttribute('data-max')) || Infinity;
        let valor = el.textContent;

        switch(tipo) {
            case 'numeric':
                valor = valor.replace(/[^\d]/g, '');
                el.textContent = valor;
                formatearMonto(el);
                calcularPagos();
                break;
            case 'phone':
                valor = valor.replace(/[^\d]/g, '').slice(0, 10);
                el.textContent = valor;
                break;
            default:
                if (valor.length > max) {
                    valor = truncarTexto(valor, max);
                    el.textContent = valor;
                }
                sincronizarUbicaciones();
                break;
        }

        // ✅ Cursor al final (mejorado para móvil)
        setTimeout(() => {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 50);
    }

    // ✅ 3. CÁLCULO AUTOMÁTICO
    function calcularPagos() {
        const valorServicio = obtenerNumeroLimpio(elementos.tValor);
        const abonoRecibido = obtenerNumeroLimpio(elementos.abono);
        
        if (elementos.total) elementos.total.textContent = formatearNumero(valorServicio);
        const saldo = Math.max(0, valorServicio - abonoRecibido);
        if (elementos.saldo) elementos.saldo.textContent = formatearNumero(saldo);
    }

    // ✅ 4. SINCRONIZACIÓN UBICACIONES
    function sincronizarUbicaciones() {
        const origen = truncarTexto(elementos.origen?.textContent.trim() || '', 20);
        const destino = truncarTexto(elementos.destino?.textContent.trim() || '', 20);
        
        if (elementos.tOrigen) elementos.tOrigen.textContent = origen;
        if (elementos.tDestino) elementos.tDestino.textContent = destino;
    }

    // ✅ 5. FECHA ACTUAL
    function configurarFechaActual() {
        if (!elementos.fecha) return;
        const hoy = new Date();
        elementos.fecha.textContent = hoy.toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    // ✅ 6. NÚMERO FACTURA
    function actualizarNumeroFactura() {
        if (elementos.numero) {
            elementos.numero.textContent = numeroActual.toString().padStart(3, '0');
        }
    }

    // ✅ 7. CAMPOS EDITABLES
    function configurarCamposEditables() {
        elementos.campos.forEach(el => {
            el.contentEditable = modoEdicion;
            if (modoEdicion) {
                el.addEventListener('input', validarInput);
                el.style.outline = 'none';
            } else {
                el.removeEventListener('input', validarInput);
                if (el.classList.contains('monto')) {
                    formatearMonto(el);
                }
            }
        });
    }

    // ✅ 8. EVENTOS BOTONES (DESKTOP + MÓVIL)
    function toggleEdicion() {
        modoEdicion = !modoEdicion;
        
        if (modoEdicion) {
            elementos.factura.classList.add('editando');
            elementos.btnEditar.textContent = '✅ GUARDAR';
            elementos.fabEditar.textContent = '✅';
            configurarFechaActual();
        } else {
            elementos.factura.classList.remove('editando');
            numeroActual++;
            localStorage.setItem('numeroFactura', numeroActual);
            actualizarNumeroFactura();
            sincronizarUbicaciones();
            calcularPagos();
            elementos.btnEditar.textContent = '✏️ EDITAR';
            elementos.fabEditar.textContent = '✏️';
        }
        
        configurarCamposEditables();
    }

    // Botones desktop
    if (elementos.btnEditar) {
        elementos.btnEditar.addEventListener('click', toggleEdicion);
    }
    if (elementos.btnImprimir) {
        elementos.btnImprimir.addEventListener('click', () => {
            if (modoEdicion) {
                alert('⚠️ Guarda los cambios antes de imprimir');
                return;
            }
            window.print();
        });
    }
    if (elementos.btnLimpiar) {
        elementos.btnLimpiar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de limpiar todos los datos?\nEsta acción no se puede deshacer.')) {
                limpiarTodo();
            }
        });
    }

    // ✅ FAB Botones MÓVIL
    if (elementos.fabEditar) {
        elementos.fabEditar.addEventListener('click', toggleEdicion);
    }
    if (elementos.fabImprimir) {
        elementos.fabImprimir.addEventListener('click', () => {
            if (modoEdicion) {
                alert('⚠️ Guarda los cambios antes de imprimir');
                return;
            }
            window.print();
        });
    }
    if (elementos.fabLimpiar) {
        elementos.fabLimpiar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de limpiar todos los datos?\nEsta acción no se puede deshacer.')) {
                limpiarTodo();
            }
        });
    }

    // ✅ 9. LIMPIAR TODO
    function limpiarTodo() {
        elementos.campos.forEach(el => {
            const campo = el.getAttribute('data-campo');
            switch(campo) {
                case 'numero': el.textContent = '001'; break;
                case 'fecha': configurarFechaActual(); break;
                case 't-valor':
                case 'total':
                case 'abono':
                case 'saldo': el.textContent = '$ 0'; break;
                default: el.textContent = '';
            }
        });
        
        numeroActual = 1;
        localStorage.setItem('numeroFactura', numeroActual);
        actualizarNumeroFactura();
        sincronizarUbicaciones();
        calcularPagos();
    }

    // ✅ 10. EVENTOS TÁCTILES MEJORADOS
    document.addEventListener('keydown', (e) => {
        if (modoEdicion && e.target.classList.contains('editable') && 
            e.target.getAttribute('data-type') === 'numeric' && e.key === 'Enter') {
            e.preventDefault();
        }
    });

    // ✅ Prevenir zoom en inputs numéricos (iOS)
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchDistance = touchStartY - touchEndY;
        
        // Si es un swipe hacia arriba en campo editable, guardar
        if (modoEdicion && Math.abs(touchDistance) > 50 && touchDistance > 0) {
            toggleEdicion();
        }
    }, { passive: true });

    // ✅ INICIALIZACIÓN
    actualizarNumeroFactura();
    configurarFechaActual();
    sincronizarUbicaciones();
    calcularPagos();
    configurarCamposEditables();
});