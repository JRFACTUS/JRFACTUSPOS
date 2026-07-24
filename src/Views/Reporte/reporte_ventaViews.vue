
<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <Sidebar
            :class="{ 'd-none d-lg-flex': !sidebarOpen }"
            @close-sidebar="sidebarOpen = false"
        />

        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <div
                    v-if="!loading && permisos !== null && !permisos.listar"
                    class="alert alert-warning"
                    role="alert"
                >
                    <i class="bi bi-shield-lock me-2"></i>
                    No tienes permiso para ver el reporte de ventas.
                </div>

                <div
                    v-if="!loading && permisos !== null && permisos.listar && error"
                    class="alert alert-danger alert-dismissible fade show"
                >
                    {{ error }}
                    <button
                        type="button"
                        class="btn-close"
                        @click="error = null"
                    ></button>
                </div>

                <div
                    v-if="!loading && permisos !== null && permisos.listar"
                    class="usuarios-container"
                >
                    <div class="usuarios-header">
                        <div>
                            <h2>Reportes de venta</h2>
                            <p>Listado general de ventas por fecha y usuario</p>
                        </div>
                    </div>

                    <!-- FILTROS -->
                    <div class="usuarios-content mb-4">
                        <div class="row g-3 align-items-end">

                            <div class="col-md-2">
                                <label class="form-label">Desde</label>
                                <input
                                    type="date"
                                    v-model="desde"
                                    class="form-control"
                                >
                            </div>

                            <div class="col-md-2">
                                <label class="form-label">Hasta</label>
                                <input
                                    type="date"
                                    v-model="hasta"
                                    class="form-control"
                                >
                            </div>

                            <div class="col-md-3">
                                <label class="form-label">Usuario</label>
                                <select
                                    v-model="userId"
                                    class="form-select"
                                >
                                    <option value="todos">Todos</option>

                                    <option
                                        v-for="usuario in usuarios"
                                        :key="usuario.id"
                                        :value="usuario.id"
                                    >
                                        {{ usuario.name }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-md-2">
                                <label class="form-label">Exportar como</label>
                                <select
                                    v-model="tipoExportacion"
                                    class="form-select"
                                >
                                    <option value="excel">Excel</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>

                            <div class="col-md-3">
                                <label class="form-label d-none d-md-block">&nbsp;</label>

                                <div class="d-flex gap-2">
                                    <button
                                        class="btn btn-primary w-100"
                                        @click="cargarVentas"
                                    >
                                        <i class="bi bi-search"></i>
                                        Buscar
                                    </button>

                                    <button
                                        class="btn btn-outline-secondary w-100"
                                        @click="limpiarFiltros"
                                    >
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>

                                    <button
                                        class="btn btn-success w-100"
                                        @click="exportarReporte"
                                    >
                                        <i class="bi bi-download"></i>
                                        Exportar
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- TABLA DE VENTAS -->
                    <div class="usuarios-content">
                        <div class="table-responsive">
                            <table
                                ref="tableRef"
                                class="usuarios-table"
                            >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Folio Pago</th>
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Usuario</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr
                                        v-for="(venta, index) in ventas"
                                        :key="venta.id"
                                    >
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ venta.folio_pago }}</td>
                                        <td>{{ venta.fecha }}</td>
                                        <td>{{ venta.hora }}</td>

                                        <td>
                                            {{ venta.user?.name ?? 'Sin usuario' }}
                                        </td>

                                        <td>
                                            {{ venta.cliente?.razon_social ?? venta.cliente?.nombre ?? 'Sin cliente' }}
                                        </td>

                                        <td>
                                            ${{ Number(venta.total || venta.total_general || venta.total_venta || 0).toFixed(2) }}
                                        </td>
                                    </tr>

                                    <tr v-if="ventas.length === 0">
                                        <td
                                            colspan="7"
                                            class="text-center text-muted py-5"
                                        >
                                            No hay ventas en este rango de fechas
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <div
            v-if="sidebarOpen"
            class="sidebar-overlay d-lg-none"
            @click="sidebarOpen = false"
        ></div>
    </div>
</template>
<script>
import { ref, onMounted, nextTick } from 'vue';
import api, { obtenerPermisosPorModulo } from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useDataTable } from '@/composables/useDataTable.js';

export default {
    name: 'ReportesVentasView',

    components: {
        Header,
        Sidebar,
    },

    setup() {
        const sidebarOpen = ref(false);
        const permisos = ref(null);

        const ventas = ref([]);
        const usuarios = ref([]);

        const loading = ref(true);
        const error = ref(null);

        const desde = ref('');
        const hasta = ref('');
        const userId = ref('todos');

        // Select de exportación
        const tipoExportacion = ref('excel');

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
                const respuesta = await obtenerPermisosPorModulo('reporte_venta');

                const datosRespuesta =
                    respuesta?.data?.data ??
                    respuesta?.data ??
                    respuesta ??
                    {};

                const datos = datosRespuesta?.permisos ?? datosRespuesta;

                permisos.value = {
                    listar: permisoActivo(datos?.listar),
                };
            } catch (e) {
                error.value = 'Error al obtener permisos del reporte de ventas.';

                permisos.value = {
                    listar: false,
                };
            }
        };

        const { tableRef, initDataTable } = useDataTable(ventas);

        const cargarUsuarios = async () => {
            try {
                const res = await api.get('getusuarios');
                usuarios.value = res.data || [];
            } catch (e) {
                error.value = 'Error al cargar usuarios: ' + (e.response?.data?.message || e.message);
            }
        };

        const cargarVentas = async () => {
            if (!permisos.value?.listar) {
                loading.value = false;
                return;
            }

            loading.value = true;
            error.value = null;

            try {
                const res = await api.get('fechadesde', {
                    params: {
                        desde: desde.value,
                        hasta: hasta.value,
                        user_id: userId.value,
                    },
                });

                ventas.value = res.data || [];

                await nextTick();
                initDataTable();

            } catch (e) {
                error.value = 'Error al cargar reportes de venta: ' + (e.response?.data?.message || e.message);
            } finally {
                loading.value = false;
            }
        };

        const limpiarFiltros = async () => {
            desde.value = '';
            hasta.value = '';
            userId.value = 'todos';
            tipoExportacion.value = 'excel';

            await cargarVentas();
        };

        const obtenerParametrosExportacion = () => {
            const params = new URLSearchParams();

            if (desde.value) {
                params.append('desde', desde.value);
            }

            if (hasta.value) {
                params.append('hasta', hasta.value);
            }

            params.append('user_id', userId.value || 'todos');

            return params;
        };

        const exportarExcel = () => {
            const params = obtenerParametrosExportacion();
            const baseUrl = api.defaults.baseURL.replace(/\/+$/, '');

            window.open(
                `${baseUrl}/reportes/ventas/exportar?${params.toString()}`,
                '_blank'
            );
        };

        const exportarPDF = () => {
            const params = obtenerParametrosExportacion();
            const baseUrl = api.defaults.baseURL.replace(/\/+$/, '');

            window.open(
                `${baseUrl}/reportes/ventas/pdf?${params.toString()}`,
                '_blank'
            );
        };

        const exportarReporte = () => {
            if (!permisos.value?.listar) {
                return;
            }

            if (tipoExportacion.value === 'excel') {
                exportarExcel();
                return;
            }

            if (tipoExportacion.value === 'pdf') {
                exportarPDF();
            }
        };

        onMounted(async () => {
            await fetchPermisos();

            if (!permisos.value?.listar) {
                loading.value = false;
                return;
            }

            await cargarUsuarios();
            await cargarVentas();
        });

        return {
            sidebarOpen,
            permisos,

            ventas,
            usuarios,

            loading,
            error,

            desde,
            hasta,
            userId,
            tipoExportacion,

            tableRef,

            cargarVentas,
            limpiarFiltros,
            exportarReporte,
            exportarExcel,
            exportarPDF,
        };
    },
};
</script>


<style scoped>
.main-content{
    flex:1;
    margin-top:60px;
    transition:margin-left .3s ease;
}

@media (min-width:992px){
    .main-content{
        margin-left:250px;
    }
}

.sidebar-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.5);
    z-index:1019;
}

main{
    min-height:calc(100vh - 60px);
}

/* CONTENEDOR */

.usuarios-container{
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
    border:1px solid #edf0f5;
}

/* HEADER */

.usuarios-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.usuarios-header h2{
    font-size:24px;
    font-weight:700;
    margin:0;
    color:#111827;
}

.usuarios-header p{
    margin-top:6px;
    color:#6b7280;
}

.btn-nuevo{
    background:#2563eb;
    color:#fff;
    border:none;
    border-radius:14px;
    padding:12px 22px;
    font-weight:600;
}

/* CONTENIDO */

.usuarios-content{
    padding:20px;
}

/* TABLA */

.usuarios-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.usuarios-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
}

.usuarios-table tbody tr{
    background:#f8fafc;
}

.usuarios-table td{
    padding:18px 20px;
}

.usuarios-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.usuarios-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

/* BOTONES */

.btn-warning{
    border:none;
    border-radius:12px;
}

.btn-danger{
    border:none;
    border-radius:12px;
}

/* DATATABLE */

:deep(.dataTables_wrapper){
    padding:0;
}

:deep(.dataTables_filter){
    margin-bottom:20px;
}

:deep(.dataTables_filter input){
    border-radius:10px;
}

:deep(.dataTables_paginate){
    margin-top:20px;
}
</style>
