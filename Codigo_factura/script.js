// ✅ DETECTAR MÓVIL AUTOMÁTICO
const esMovil = window.innerWidth <= 850 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

    let modoEdicion = false;
    let numeroActual = parseInt(localStorage.getItem('numeroFactura')) || 1;

    // ✅ MOSTRAR FAB EN MÓVIL, OCULTAR BOTONES DESKTOP
    if (esMovil) {
        document.querySelector('.controles').style.display = 'none';
        document.querySelector('.fab-menu').style.display = 'flex';
    }

    // 🔧 TUS FUNCIONES (iguales que antes)
    const formatearNumero = (num) => '$ ' + parseFloat(num || 0).toLocaleString('es-CO');
    const obtenerNumeroLimpio = (elemento) => parseFloat(elemento?.textContent.replace(/[^\d]/g, '') || 0);
    const truncarTexto = (texto, max) => texto.length > max ? texto.slice(0, max) + '...' : texto;

    function formatearMonto(elemento) {
        if (!elemento) return;
        const valorNumerico = obtenerNumeroLimpio(elemento);
        elemento.textContent = formatearNumero(valorNumerico);
    }

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

        setTimeout(() => {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 50);
    }

    function calcularPagos() {
        const valorServicio = obtenerNumeroLimpio(elementos.tValor);
        const abonoRecibido = obtenerNumeroLimpio(elementos.abono);
        if (elementos.total) elementos.total.textContent = formatearNumero(valorServicio);
        const saldo = Math.max(0, valorServicio - abonoRecibido);
        if (elementos.saldo) elementos.saldo.textContent = formatearNumero(saldo);
    }

    function sincronizarUbicaciones() {
        const origen = truncarTexto(elementos.origen?.textContent.trim() || '', 20);
        const destino = truncarTexto(elementos.destino?.textContent.trim() || '', 20);
        if (elementos.tOrigen) elementos.tOrigen.textContent = origen;
        if (elementos.tDestino) elementos.tDestino.textContent = destino;
    }

    function configurarFechaActual() {
        if (!elementos.fecha) return;
        const hoy = new Date();
        elementos.fecha.textContent = hoy.toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function actualizarNumeroFactura() {
        if (elementos.numero) {
            elementos.numero.textContent = numeroActual.toString().padStart(3, '0');
        }
    }

    function configurarCamposEditables() {
        elementos.campos.forEach(el => {
            el.contentEditable = modoEdicion;
            if (modoEdicion) {
                el.addEventListener('input', validarInput);
            } else {
                el.removeEventListener('input', validarInput);
                if (el.classList.contains('monto')) {
                    formatearMonto(el);
                }
            }
        });
    }

    // ✅ FUNCIÓN TOGGLE EDICIÓN
    function toggleEdicion() {
        modoEdicion = !modoEdicion;
        if (modoEdicion) {
            elementos.factura.classList.add('editando');
            if (elementos.btnEditar) elementos.btnEditar.textContent = '✅ GUARDAR';
            if (elementos.fabEditar) elementos.fabEditar.textContent = '✅';
            configurarFechaActual();
        } else {
            elementos.factura.classList.remove('editando');
            numeroActual++;
            localStorage.setItem('numeroFactura', numeroActual);
            actualizarNumeroFactura();
            sincronizarUbicaciones();
            calcularPagos();
            if (elementos.btnEditar) elementos.btnEditar.textContent = '✏️ EDITAR';
            if (elementos.fabEditar) elementos.fabEditar.textContent = '✏️';
        }
        configurarCamposEditables();
    }

    // ✅ EVENTOS TODOS LOS BOTONES
    [elementos.btnEditar, elementos.fabEditar].forEach(btn => {
        if (btn) btn.addEventListener('click', toggleEdicion);
    });

    [elementos.btnImprimir, elementos.fabImprimir].forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            if (modoEdicion) {
                alert('⚠️ Guarda los cambios antes de imprimir');
                return;
            }
            window.print();
        });
    });

    [elementos.btnLimpiar, elementos.fabLimpiar].forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de limpiar todos los datos?')) {
                elementos.campos.forEach(el => {
                    const campo = el.getAttribute('data-campo');
                    switch(campo) {
                        case 'numero': el.textContent = '001'; break;
                        case 'fecha': configurarFechaActual(); break;
                        case 't-valor': case 'total': case 'abono': case 'saldo': el.textContent = '$ 0'; break;
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
    });

    // ✅ INICIALIZAR
    actualizarNumeroFactura();
    configurarFechaActual();
    sincronizarUbicaciones();
    calcularPagos();
    configurarCamposEditables();
});