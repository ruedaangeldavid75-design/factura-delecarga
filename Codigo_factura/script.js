document.addEventListener('DOMContentLoaded', () => {
    const elementos = {
        factura: document.getElementById('factura'),
        btnEditar: document.getElementById('btnEditar'),
        btnImprimir: document.getElementById('btnImprimir'),
        btnLimpiar: document.getElementById('btnLimpiar'),
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
     const fab = document.getElementById('fabMain');

    if (fab) {
        fab.addEventListener('click', () => {
            const opcion = prompt(
                "Opciones:\n1. Editar\n2. Imprimir\n3. Limpiar"
            );

            if (opcion === "1") elementos.btnEditar.click();
            if (opcion === "2") elementos.btnImprimir.click();
            if (opcion === "3") elementos.btnLimpiar.click();
        });
    }


    let modoEdicion = false;
    let numeroActual = parseInt(localStorage.getItem('numeroFactura')) || 1;

    // 🔧 Funciones utilitarias optimizadas
    const formatearNumero = (num) => '$ ' + parseFloat(num || 0).toLocaleString('es-CO');
    const obtenerNumeroLimpio = (elemento) => parseFloat(elemento?.textContent.replace(/[^\d]/g, '') || 0);
    const truncarTexto = (texto, max) => texto.length > max ? texto.slice(0, max) + '...' : texto;

    // ✅ 1. NÚMEROS CON FORMATO (PUNTOS MIL)
    function formatearMonto(elemento) {
        if (!elemento) return;
        const valorNumerico = obtenerNumeroLimpio(elemento);
        elemento.textContent = formatearNumero(valorNumerico);
    }

    // ✅ 2. VALIDACIÓN MEJORADA CON LÍMITE 40 CARACTERES
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

        // Mantener cursor al final
        setTimeout(() => {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 10);
    }

    // ✅ 3. CÁLCULO AUTOMÁTICO OPTIMIZADO
    function calcularPagos() {
        const valorServicio = obtenerNumeroLimpio(elementos.tValor);
        const abonoRecibido = obtenerNumeroLimpio(elementos.abono);
        
        // Total = valor del servicio
        if (elementos.total) elementos.total.textContent = formatearNumero(valorServicio);
        
        // Saldo = total - abono (mínimo 0)
        const saldo = Math.max(0, valorServicio - abonoRecibido);
        if (elementos.saldo) elementos.saldo.textContent = formatearNumero(saldo);
    }

    // ✅ 4. SINCRONIZACIÓN DE UBICACIONES (40 caracteres máx)
    function sincronizarUbicaciones() {
        const origen = truncarTexto(elementos.origen?.textContent.trim() || '', 20);
        const destino = truncarTexto(elementos.destino?.textContent.trim() || '', 20);
        
        if (elementos.tOrigen) elementos.tOrigen.textContent = origen;
        if (elementos.tDestino) elementos.tDestino.textContent = destino;
    }

    // ✅ 5. CONFIGURAR FECHA ACTUAL
    function configurarFechaActual() {
        if (!elementos.fecha) return;
        const hoy = new Date();
        elementos.fecha.textContent = hoy.toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    // ✅ 6. ACTUALIZAR NÚMERO DE FACTURA
    function actualizarNumeroFactura() {
        if (elementos.numero) {
            elementos.numero.textContent = numeroActual.toString().padStart(3, '0');
        }
    }

    // ✅ 7. CONFIGURAR CAMPOS EDITABLES (OPTIMIZADO)
    function configurarCamposEditables() {
        elementos.campos.forEach(el => {
            el.contentEditable = modoEdicion;
            if (modoEdicion) {
                el.addEventListener('input', validarInput);
            } else {
                el.removeEventListener('input', validarInput);
                // ✅ Formatear montos al salir de edición
                if (el.classList.contains('monto')) {
                    formatearMonto(el);
                }
            }
        });
    }

    // ✅ 8. EVENTOS DE BOTONES
    elementos.btnEditar.addEventListener('click', () => {
        modoEdicion = !modoEdicion;
        
        if (modoEdicion) {
            elementos.factura.classList.add('editando');
            elementos.btnEditar.textContent = '✅ GUARDAR';
            elementos.btnEditar.className = 'btn btn-editar activo';
            configurarFechaActual();
        } else {
            elementos.factura.classList.remove('editando');
            numeroActual++;
            localStorage.setItem('numeroFactura', numeroActual);
            actualizarNumeroFactura();
            sincronizarUbicaciones();
            calcularPagos();
            elementos.btnEditar.textContent = '✏️ EDITAR';
            elementos.btnEditar.className = 'btn';
        }
        
        configurarCamposEditables();
    });

    elementos.btnImprimir.addEventListener('click', () => {
        if (modoEdicion) {
            alert('⚠️ Guarda los cambios antes de imprimir');
            return;
        }
        window.print();
    });

    elementos.btnLimpiar.addEventListener('click', () => {
        if (confirm('¿Estás seguro de limpiar todos los datos?\nEsta acción no se puede deshacer.')) {
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
    });

    // ✅ 9. INICIALIZACIÓN OPTIMIZADA
    actualizarNumeroFactura();
    configurarFechaActual();
    sincronizarUbicaciones();
    calcularPagos();
    configurarCamposEditables();

    // ✅ 10. PREVENIR ENTER EN CAMPOS NUMÉRICOS
    document.addEventListener('keydown', (e) => {
        if (modoEdicion && e.target.classList.contains('editable') && 
            e.target.getAttribute('data-type') === 'numeric' && e.key === 'Enter') {
            e.preventDefault();
        }
    });
});
// ✅ PWA - Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ App lista para instalar'))
    .catch(err => console.log('❌ Error SW:', err));
}
