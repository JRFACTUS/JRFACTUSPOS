<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <!-- Sidebar -->
        <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

        <!-- Contenido principal -->
        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">

                <!-- Loading -->
                <div v-if="loading || permisos === null" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <!-- Error -->
                <div v-if="error" class="alert alert-danger mt-3">
                    {{ error }}
                </div>

                <!-- Sin permiso para listar -->
                <div v-if="!loading && permisos !== null && !permisos.listar" class="alert alert-warning mt-3"
                    role="alert">
                    <i class="bi bi-shield-lock me-2"></i>
                    No tienes permiso para ver ventas.
                </div>

                <!-- Contenedor Principal -->
                <div v-if="!loading && permisos?.listar" class="ventas-container">

                    <!-- Header -->
                    <div class="ventas-header">
                        <div>
                            <h2>Historial de Ventas</h2>
                            <p>Consulta y administración de ventas registradas</p>
                        </div>

                        <div class="ventas-filtros">
                            <input type="text" class="form-control" placeholder="Buscar por folio"
                                v-model="busquedaFolio" @keyup.enter="fetchVentas" />

                            <input type="date" class="form-control" v-model="fechaFiltro" @change="fetchVentas" />

                            <button class="btn-actualizar" @click="fetchVentas">
                                Actualizar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Historial -->
                    <div class="ventas-resumen">
                        <div class="resumen-card">
                            <span>Ventas</span>
                            <strong>{{ ventas.length }}</strong>
                        </div>

                        <div class="resumen-card">
                            <span>Total vendido</span>
                            <strong>
                                {{formatPrecio(ventas.reduce((acc, v) => acc + Number(v.total || 0), 0))}}
                            </strong>
                        </div>

                        <div class="resumen-card">
                            <span>Fecha filtro</span>
                            <strong>{{ fechaFiltro || 'Todas' }}</strong>
                        </div>
                    </div>

                    <!-- Tabla -->
                    <div class="ventas-content">
                        <div class="table-responsive">
                            <table class="ventas-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Folio</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Usuario</th>
                                        <th>Método de pago</th>
                                        <th>Facturación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="(venta, index) in ventas" :key="venta.id">
                                        <td>{{ index + 1 }}</td>

                                        <td>
                                            <span class="folio-pill">
                                                {{ venta.folio_pago }}
                                            </span>
                                        </td>

                                        <td>
                                            <strong class="cliente-name">
                                                {{ venta.cliente?.razon_social || 'N/A' }}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong class="venta-total">
                                                {{ formatPrecio(venta.total) }}
                                            </strong>
                                        </td>

                                        <td>{{ venta.fecha }}</td>

                                        <td>{{ venta.hora }}</td>

                                        <td>{{ venta.user?.name || 'N/A' }}</td>

                                        <!-- Método(s) de pago -->
                                        <td>
                                            <template v-if="venta.pagos?.length">
                                                <div v-for="pago in venta.pagos" :key="pago.id">
                                                    <div v-for="detalle in pago.detalles" :key="detalle.id">
                                                        <strong>{{ detalle.metodo_pago }}</strong>

                                                        <template
                                                            v-if="detalle.metodo_pago === 'Tarjeta' && detalle.tipo_tarjeta">
                                                            ({{ detalle.tipo_tarjeta }})
                                                        </template>

                                                        <template
                                                            v-if="detalle.metodo_pago === 'Transferencia' && detalle.tipo_transferencia">
                                                            ({{ detalle.tipo_transferencia }})
                                                        </template>


                                                    </div>
                                                </div>
                                            </template>

                                            <span v-else>N/A</span>
                                        </td>

                                        <!-- Estado de facturación -->
                                        <td>
                                            <span class="badge"
                                                :class="venta.facturada ? 'bg-success' : 'bg-secondary'">
                                                {{ venta.facturada ? 'Facturada' : 'No facturada' }}
                                            </span>
                                        </td>

                                        <td class="acciones">
                                            <button class="btn-action btn-ver" @click="verDetalle(venta)">
                                                Ver
                                            </button>

                                            <button class="btn-action btn-pdf"
                                                @click="descargarTicket(venta.folio_pago)">
                                                PDF
                                            </button>

                                            <button v-if="permisos.actualizar" class="btn-action btn-devolucion"
                                                @click="abrirModalDevolucion(venta)">
                                                Devolución
                                            </button>
                                        </td>
                                    </tr>

                                    <tr v-if="ventas.length === 0">
                                        <td colspan="10">
                                            <div class="empty-ventas">
                                                <i class="bi bi-receipt"></i>
                                                <span>No hay ventas registradas</span>
                                                <small>Intenta actualizar o cambiar los filtros de búsqueda.</small>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <!-- Modal Detalle -->
                <div v-if="ventaSeleccionada" class="modal fade show d-block" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">

                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title">
                                    Detalle de Venta {{ ventaSeleccionada.folio_pago }}
                                </h5>

                                <button type="button" class="btn-close btn-close-white"
                                    @click="ventaSeleccionada = null"></button>
                            </div>

                            <div class="modal-body">

                                <table class="table table-bordered text-center align-middle">

                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Importe</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        <tr v-for="(prod, i) in ventaSeleccionada.detalle" :key="i">
                                            <td>{{ i + 1 }}</td>
                                            <td>{{ prod.nombre }}</td>
                                            <td>{{ prod.cantidad }}</td>
                                            <td>{{ formatPrecio(prod.precio) }}</td>
                                            <td>{{ formatPrecio(prod.cantidad * prod.precio) }}</td>
                                        </tr>

                                    </tbody>

                                </table>

                                <div class="text-end fw-bold fs-5 mt-3">
                                    Total: {{ formatPrecio(ventaSeleccionada.total) }}
                                </div>
                            </div>

                            <div class="modal-footer">
                                <button class="btn btn-secondary" @click="ventaSeleccionada = null">
                                    Cerrar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Modal Devolución -->
                <div v-if="modalDevolucionVisible && permisos?.actualizar" class="modal fade show d-block"
                    tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">

                            <div class="modal-header bg-warning text-dark">

                                <h5 class="modal-title">
                                    Devolución de Venta {{ ventaDevolucion.folio_pago }}
                                </h5>

                                <button type="button" class="btn-close" @click="cerrarModalDevolucion"></button>

                            </div>

                            <div class="modal-body">

                                <table class="table table-bordered text-center align-middle">

                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th>Total</th>
                                            <th>Devolver</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        <tr v-for="(prod, i) in productosDevolucion" :key="i">
                                            <td>{{ i + 1 }}</td>
                                            <td>{{ prod.nombre }}</td>
                                            <td>{{ prod.cantidad }}</td>
                                            <td>{{ formatPrecio(prod.precio) }}</td>
                                            <td>{{ formatPrecio(prod.subtotal) }}</td>
                                            <td>
                                                <input type="checkbox" v-model="prod.devolver" />
                                            </td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                            <div class="modal-footer">

                                <button class="btn btn-secondary" @click="cerrarModalDevolucion">
                                    Cancelar
                                </button>

                                <button v-if="permisos.actualizar" class="btn btn-warning" @click="procesarDevolucion">
                                    Procesar Devolución
                                </button>

                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>

        <!-- Overlay móvil -->
        <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
    </div>
</template>

<script setup>
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import api, { obtenerPermisosPorModulo } from '@/services/api.js';
import { ref, onMounted } from 'vue';

const sidebarOpen = ref(true);

// === Datos reactivos ===
const ventas = ref([]);
const ventasFiltradas = ref([]);
const ventaSeleccionada = ref(null);
const ventaDevolucion = ref(null);
const productosDevolucion = ref([]);
const modalDevolucionVisible = ref(false);

const busqueda = ref('');
const busquedaFolio = ref('');
const fechaFiltro = ref('');
const loading = ref(false);
const error = ref(null);
const totalGlobal = ref(0);
const permisos = ref(null);

// === Permisos ===
const permisoActivo = (valor) => {
    return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
    );
};

const fetchPermisos = async () => {
    try {
        const usuarioGuardado = localStorage.getItem('user');
        const usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

        if (permisoActivo(usuario?.es_admin)) {
            permisos.value = {
                listar: true,
                crear: true,
                actualizar: true,
                eliminar: true
            };

            return;
        }

        const respuesta = await obtenerPermisosPorModulo('historial');

        const contenido = respuesta?.data ?? respuesta ?? {};

        const datos =
            contenido?.permisos ??
            contenido?.data?.permisos ??
            contenido?.data ??
            contenido;

        permisos.value = {
            listar: permisoActivo(datos?.listar),
            crear: permisoActivo(datos?.crear),
            actualizar: permisoActivo(datos?.actualizar),
            eliminar: permisoActivo(datos?.eliminar)
        };
    } catch (e) {
       
        permisos.value = {
            listar: false,
            crear: false,
            actualizar: false,
            eliminar: false
        };

        error.value =
            e.response?.data?.message ||
            'No fue posible cargar los permisos de ventas.';
    }
};

// === Funciones ===

// 🔹 Obtener ventas (usa ruta según filtros)
const fetchVentas = async () => {
    if (!permisos.value?.listar) {
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        let endpoint = '/getVentas';
        const params = {};

        // Si hay fecha o folio, usamos ventasPorFecha
        if (busquedaFolio.value || fechaFiltro.value) {
            endpoint = '/ventasPorFecha';
            if (busquedaFolio.value) params.folio = busquedaFolio.value;
            if (fechaFiltro.value) params.fecha = fechaFiltro.value;
        }

        const res = await api.get(endpoint, { params });

        ventas.value = res.data.ventas || res.data || [];
        ventasFiltradas.value = ventas.value;
        totalGlobal.value = parseFloat(res.data.total_global || 0);
    } catch (e) {
        error.value = e.response?.data?.message || e.message;
    } finally {
        loading.value = false;
    }
};

// 🔹 Aplicar filtros
const aplicarFiltros = () => {
    fetchVentas();
};

// 🔹 Filtrar localmente por texto
const filtrarVentas = () => {
    const texto = busqueda.value.toLowerCase();
    ventasFiltradas.value = ventas.value.filter(
        v =>
            v.folio_pago?.toLowerCase().includes(texto) ||
            v.cliente?.nombre?.toLowerCase().includes(texto)
    );
};

// 🔹 Ver detalle de venta
const verDetalle = async (venta) => {
    if (!permisos.value?.listar) {
        error.value = 'No tienes permiso para ver ventas.';
        return;
    }

    try {
        const res = await api.get(`/detalleVenta/${venta.folio_pago}`);

        const ventaDetalle = res.data;

        if (!ventaDetalle || !Array.isArray(ventaDetalle.detalle)) {
          
            throw new Error("La respuesta no contiene detalle de productos.");
        }

        ventaSeleccionada.value = {
            id: ventaDetalle.id,
            folio_pago: ventaDetalle.folio_pago,
            fecha: ventaDetalle.fecha,
            hora: ventaDetalle.hora,
            usuario: {
                name: ventaDetalle.usuario
            },
            detalle: ventaDetalle.detalle.map(p => ({
                producto_id: p.producto_id ?? p.id,
                id: p.id,
                nombre: p.nombre,
                cantidad: Number(p.cantidad || 0),
                precio: Number(p.precio || 0),
                subtotal: Number(p.subtotal || 0)
            })),
            total: Number(ventaDetalle.total || 0),
        };

    } catch (e) {
        alert("❌ Error al obtener detalle de la venta");
        
    }
};
// 🔹 Abrir modal devolución
const abrirModalDevolucion = async (venta) => {
    if (!permisos.value?.actualizar) {
        error.value = 'No tienes permiso para realizar devoluciones.';
        return;
    }

    try {
        const res = await api.get(`/detalleVenta/${venta.folio_pago}`);

        const ventaDetalle = res.data;

        if (!ventaDetalle || !Array.isArray(ventaDetalle.detalle)) {
         
            throw new Error("La respuesta no contiene detalle de productos.");
        }

        ventaDevolucion.value = {
            ...venta,
            id: ventaDetalle.id,
            folio_pago: ventaDetalle.folio_pago,
            total: Number(ventaDetalle.total || 0),
            fecha: ventaDetalle.fecha,
            hora: ventaDetalle.hora,
            usuario: ventaDetalle.usuario
        };

        productosDevolucion.value = ventaDetalle.detalle.map((p) => ({
            producto_id: p.producto_id ?? p.id,
            id: p.id,
            nombre: p.nombre,
            cantidad: Number(p.cantidad || 0),
            precio: Number(p.precio || 0),
            subtotal: Number(p.subtotal || 0),
            devolver: false
        }));

        modalDevolucionVisible.value = true;
    } catch (e) {
        alert("❌ Error al obtener detalle de la venta para devolución");
    }
};

// 🔹 Cerrar modal devolución
const cerrarModalDevolucion = () => {
    modalDevolucionVisible.value = false;
    productosDevolucion.value = [];
    ventaDevolucion.value = null;
};

// 🔹 Procesar devolución
const procesarDevolucion = async () => {
    if (!permisos.value?.actualizar) {
        error.value = 'No tienes permiso para realizar devoluciones.';
        return;
    }

    if (!ventaDevolucion.value) {
        alert('❌ No hay venta seleccionada para devolución');
        return;
    }

    const seleccionados = productosDevolucion.value
        .filter(p => p.devolver)
        .map(p => ({
            producto_id: p.producto_id,
            cantidad: p.cantidad
        }));

    if (seleccionados.length === 0) {
        alert('❌ Selecciona al menos un producto para devolver');
        return;
    }

    try {
        await api.post('registrar', {
            venta_id: ventaDevolucion.value.id,
            productos_devueltos: seleccionados,
            motivo: ''
        });

        alert('✅ Productos devueltos correctamente');
        cerrarModalDevolucion();
        fetchVentas();
    } catch (e) {
        const msg = e.response?.data?.message || e.message || 'Error desconocido';
        alert('❌ Error al procesar la devolución: ' + msg);
       
    }
};

// 🔹 Descargar ticket PDF
const descargarTicket = async (folioPago) => {
    if (!permisos.value?.listar) {
        error.value = 'No tienes permiso para ver ventas.';
        return;
    }

    try {
        const res = await api.get(`/ticked/${folioPago}`, {
            responseType: 'blob'
        });

        const blob = new Blob([res.data], {
            type: 'application/pdf'
        });

        const url = window.URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);

    } catch (e) {
        alert('❌ Error al abrir el ticket');
       
    }
};

// === Formatos ===
const formatPrecio = (v) => v == null || isNaN(v) ? '$ 0.00' : `$ ${parseFloat(v).toFixed(2)}`;
const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

// === Carga inicial ===
onMounted(async () => {
    await fetchPermisos();

    if (permisos.value?.listar) {
        await fetchVentas();
    }
});
</script>





<style scoped>
.ventas-resumen {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    padding: 20px 24px;
    background: #ffffff;
    border-bottom: 1px solid #eef2f7;
}

.resumen-card {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px 18px;
}

.resumen-card span {
    display: block;
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 800;
    margin-bottom: 6px;
}

.resumen-card strong {
    color: #0f172a;
    font-size: 1.15rem;
    font-weight: 900;
}

.folio-pill {
    display: inline-flex;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    padding: 6px 11px;
    font-weight: 900;
    font-size: 0.82rem;
}

.cliente-name {
    color: #0f172a;
    font-weight: 900;
}

.venta-total {
    color: #0f172a;
    font-weight: 900;
}

.acciones {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-action {
    border-radius: 10px;
    padding: 7px 12px;
    font-size: 0.82rem;
    font-weight: 900;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.btn-action:hover {
    transform: translateY(-1px);
}

.btn-ver {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
}

.btn-pdf {
    background: #f8fafc;
    color: #334155;
    border-color: #cbd5e1;
}

.btn-devolucion {
    background: #fff7ed;
    color: #ea580c;
    border-color: #fed7aa;
}

.empty-ventas {
    padding: 48px 20px;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-weight: 800;
}

.empty-ventas i {
    font-size: 2.3rem;
    color: #cbd5e1;
}

.empty-ventas small {
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
}

@media (max-width: 991px) {
    .ventas-resumen {
        grid-template-columns: 1fr;
    }

    .acciones {
        flex-wrap: wrap;
    }
}

.main-content {
    flex: 1;
    margin-top: 60px;
    transition: margin-left .3s ease;
}

@media (min-width:992px) {
    .main-content {
        margin-left: 250px;
    }
}

.sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .5);
    z-index: 1019;
}

main {
    min-height: calc(100vh - 60px);
}

/* CONTENEDOR */

.ventas-container {
    width: 100%;
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid #edf0f5;
    box-shadow: 0 15px 40px rgba(0, 0, 0, .05);
}

/* HEADER */

.ventas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    border-bottom: 1px solid #edf0f5;
}

.ventas-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}

.ventas-header p {
    margin-top: 4px;
    color: #6b7280;
    font-size: 14px;
}

/* FILTROS */

.ventas-filtros {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
}

.ventas-filtros .form-control {
    width: 180px;
    min-width: 180px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid #dbe3ef;
}

.btn-actualizar {
    border: none;
    background: #2563eb;
    color: #fff;
    height: 42px;
    padding: 0 18px;
    border-radius: 12px;
    font-weight: 600;
    transition: .3s;
}

.btn-actualizar:hover {
    background: #1d4ed8;
}

/* TABLA */

.ventas-content {
    padding: 20px;
}

.table-responsive {
    overflow-x: auto;
}

.ventas-table {
    width: 100%;
    min-width: 900px;
    border-collapse: separate;
    border-spacing: 0 12px;
}

.ventas-table thead th {
    color: #64748b;
    font-size: 13px;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0 20px 10px;
    white-space: nowrap;
}

.ventas-table tbody tr {
    background: #f8fafc;
}

.ventas-table td {
    padding: 18px 20px;
    vertical-align: middle;
}

.ventas-table tbody tr td:first-child {
    border-radius: 16px 0 0 16px;
}

.ventas-table tbody tr td:last-child {
    border-radius: 0 16px 16px 0;
}

.acciones {
    white-space: nowrap;
}

/* RESPONSIVE */

@media(max-width:768px) {

    .ventas-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .ventas-filtros {
        width: 100%;
        flex-direction: column;
    }

    .ventas-filtros .form-control,
    .btn-actualizar {
        width: 100%;
    }

}
</style>