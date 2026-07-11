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

                <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                    {{ error }}
                    <button
                        type="button"
                        class="btn-close"
                        @click="error = null"
                    ></button>
                </div>

                <div v-if="!loading" class="usuarios-container">
                    <div class="usuarios-header">
                        <div>
                            <h2>Reporte de Inventario</h2>
                            <p>Existencias actuales registradas en el sistema</p>
                        </div>
                    </div>

                    <!-- FILTROS REPORTE -->
                    <div class="reporte-toolbar">
                        <div class="reporte-field reporte-tipo">
                            <label>Reporte</label>
                            <select
                                class="form-select"
                                v-model="tipoReporteInventario"
                                @change="cambiarTipoReporteInventario"
                            >
                                <option value="todo">Todo el inventario</option>
                                <option value="fecha">Por fecha</option>
                            </select>
                        </div>

                        <div class="reporte-field">
                            <label>Desde</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="desde"
                                :disabled="tipoReporteInventario === 'todo'"
                            >
                        </div>

                        <div class="reporte-field">
                            <label>Hasta</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="hasta"
                                :disabled="tipoReporteInventario === 'todo'"
                            >
                        </div>

                        <button
                            class="btn btn-primary reporte-btn"
                            @click="cargarInventario"
                        >
                            <i class="bi bi-search"></i>
                            Buscar
                        </button>

                        <button
                            class="btn btn-outline-secondary reporte-btn-icon"
                            @click="limpiarFiltros"
                        >
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>

                        <button
                            class="btn btn-success reporte-btn"
                            @click="exportarPDFInventario"
                        >
                            <i class="bi bi-download"></i>
                            Exportar
                        </button>
                    </div>

                    <!-- TABLA INVENTARIO -->
                    <div class="usuarios-content">
                        <div class="table-responsive">
                            <table
                                ref="tableRef"
                                class="usuarios-table"
                            >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Categoría</th>
                                        <th>Medida</th>
                                        <th>Ubicación</th>
                                        <th>Stock actual</th>
                                        <th>Nota</th>
                                        <th>Actualizado</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr
                                        v-for="(item, index) in inventarios"
                                        :key="item.producto_id || item.producto?.id || item.id"
                                    >
                                        <td>{{ index + 1 }}</td>

                                        <td>
                                            {{ item.producto?.codigo_producto ?? item.codigo_producto ?? 'N/A' }}
                                        </td>

                                        <td>
                                            {{ item.producto?.nombre ?? item.nombre ?? 'Producto eliminado' }}
                                        </td>

                                        <td>
                                            {{ item.producto?.categoria?.nombre_categoria ?? item.categoria?.nombre_categoria ?? 'N/A' }}
                                        </td>

                                        <td>
                                            {{ item.producto?.medida?.unidad_sat ?? item.medida?.unidad_sat ?? 'N/A' }}
                                        </td>

                                        <td>
                                            {{ item.ubicacion ?? item.inventario?.ubicacion ?? 'Sin ubicación' }}
                                        </td>

                                        <td>
                                            <span :class="stockSistema(item) <= 0 ? 'stock-cero' : 'stock-ok'">
                                                {{ stockSistema(item).toFixed(2) }}
                                            </span>
                                        </td>

                                        <td>
                                            {{ item.nota ?? item.inventario?.nota ?? 'Sin nota' }}
                                        </td>

                                        <td>
                                            {{ formatearFecha(item.updated_at ?? item.inventario?.updated_at) }}
                                        </td>
                                    </tr>

                                    <tr v-if="inventarios.length === 0">
                                        <td
                                            colspan="9"
                                            class="text-center text-muted py-5"
                                        >
                                            No hay productos registrados en inventario
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
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useDataTable } from '@/composables/useDataTable.js';

export default {
    name: 'ReportesInventarioView',

    components: {
        Header,
        Sidebar,
    },

    setup() {
        const sidebarOpen = ref(false);
        const inventarios = ref([]);

        const loading = ref(false);
        const error = ref(null);

        const desde = ref('');
        const hasta = ref('');
        const tipoReporteInventario = ref('todo');

        const { tableRef, initDataTable } = useDataTable(inventarios);

        const stockSistema = (item) => {
            return Number(
                item.stock_actual ??
                item.inventario?.stock_actual ??
                item.stock_producto ??
                item.producto?.stock ??
                item.stock ??
                0
            );
        };

        const totalProductos = computed(() => {
            return inventarios.value.length;
        });

        const totalUnidades = computed(() => {
            return inventarios.value.reduce((total, item) => {
                return total + stockSistema(item);
            }, 0);
        });

        const totalConInventario = computed(() => {
            return inventarios.value.filter((item) => {
                return stockSistema(item) > 0;
            }).length;
        });

        const totalSinInventario = computed(() => {
            return inventarios.value.filter((item) => {
                return stockSistema(item) <= 0;
            }).length;
        });

        const formatearFecha = (fecha) => {
            if (!fecha) {
                return 'N/A';
            }

            return new Date(fecha).toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        const estadoClass = (estado) => {
            const valor = String(estado || '').toUpperCase();

            if (valor === 'CORRECTO' || valor === 'CON INVENTARIO') {
                return 'estado-correcto';
            }

            return 'estado-normal';
        };

        const cambiarTipoReporteInventario = () => {
            if (tipoReporteInventario.value === 'todo') {
                desde.value = '';
                hasta.value = '';
            }
        };

        const validarFechas = () => {
            if (tipoReporteInventario.value === 'fecha' && !desde.value && !hasta.value) {
                error.value = 'Selecciona una fecha desde o una fecha hasta.';
                return false;
            }

            return true;
        };

        const cargarInventario = async () => {
    loading.value = true;
    error.value = null;

    try {
        const res = await api.get('reportes/inventario', {
            params: {
                tipo_reporte: tipoReporteInventario.value,
                desde: tipoReporteInventario.value === 'fecha' ? desde.value || null : null,
                hasta: tipoReporteInventario.value === 'fecha' ? hasta.value || null : null,
            },
        });

        inventarios.value = res.data?.data ?? [];

        await nextTick();
        initDataTable();
    } catch (e) {
        inventarios.value = [];

        error.value =
            e.response?.data?.message ||
            'Error al cargar reporte de inventario.';
    } finally {
        loading.value = false;
    }
};

        const limpiarFiltros = () => {
            tipoReporteInventario.value = 'todo';
            desde.value = '';
            hasta.value = '';

            cargarInventario();
        };

        const exportarPDFInventario = () => {
            if (!validarFechas()) {
                return;
            }

            const params = new URLSearchParams();

            params.append('tipo_reporte', tipoReporteInventario.value);

            if (tipoReporteInventario.value === 'fecha') {
                if (desde.value) {
                    params.append('desde', desde.value);
                }

                if (hasta.value) {
                    params.append('hasta', hasta.value);
                }
            }

            window.open(
                `${api.defaults.baseURL}reportes/inventario/pdf?${params.toString()}`,
                '_blank'
            );
        };

        onMounted(async () => {
            await cargarInventario();
        });

        return {
            sidebarOpen,

            inventarios,

            loading,
            error,

            desde,
            hasta,
            tipoReporteInventario,

            tableRef,

            totalProductos,
            totalUnidades,
            totalConInventario,
            totalSinInventario,

            stockSistema,

            estadoClass,
            formatearFecha,

            cambiarTipoReporteInventario,
            cargarInventario,
            limpiarFiltros,
            exportarPDFInventario,
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

.usuarios-container{
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
    border:1px solid #edf0f5;
}

.usuarios-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
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
    margin-bottom:0;
}

/* FILTROS REPORTE */
.reporte-toolbar{
    display:flex;
    align-items:flex-end;
    gap:14px;
    padding:24px 28px 26px;
    margin-bottom:0;
    border-bottom:1px solid #edf0f5;
    flex-wrap:wrap;
}

.reporte-field{
    width:160px;
    display:flex;
    flex-direction:column;
    gap:8px;
}

.reporte-field label{
    font-size:13px;
    font-weight:600;
    color:#111827;
    margin:0;
}

.reporte-field .form-control{
    height:36px;
    border-radius:6px;
    border:1px solid #d1d5db;
    font-size:14px;
    color:#111827;
    box-shadow:none;
}

.reporte-field .form-control:focus{
    border-color:#2563eb;
    box-shadow:0 0 0 3px rgba(37,99,235,.12);
}

.reporte-btn{
    height:56px;
    min-width:80px;
    padding:0 18px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    font-size:14px;
    font-weight:600;
    border-radius:6px;
}

.reporte-btn-icon{
    height:56px;
    width:80px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-radius:6px;
}

.reporte-btn i,
.reporte-btn-icon i{
    font-size:16px;
}

.usuarios-content{
    padding:20px 28px 28px;
}

.resumen-grid{
    display:grid;
    grid-template-columns:repeat(5, 1fr);
    gap:14px;
}

.resumen-card{
    background:#f8fafc;
    border:1px solid #edf0f5;
    border-radius:18px;
    padding:16px;
}

.resumen-card span{
    display:block;
    color:#64748b;
    font-size:13px;
    font-weight:600;
    margin-bottom:6px;
}

.resumen-card strong{
    display:block;
    color:#111827;
    font-size:20px;
    font-weight:800;
}

@media (max-width:1200px){
    .resumen-grid{
        grid-template-columns:repeat(2, 1fr);
    }
}

@media (max-width:576px){
    .resumen-grid{
        grid-template-columns:1fr;
    }

    .usuarios-header{
        flex-direction:column;
        align-items:flex-start;
    }
}

.usuarios-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.usuarios-table thead th{
    color:#64748b;
    font-size:12px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 16px 10px;
    white-space:nowrap;
}

.usuarios-table tbody tr{
    background:#f8fafc;
}

.usuarios-table td{
    padding:16px;
    color:#111827;
    vertical-align:middle;
    white-space:nowrap;
}

.usuarios-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.usuarios-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

.stock-cero{
    color:#b91c1c;
    font-weight:800;
}

.stock-ok{
    color:#047857;
    font-weight:800;
}

.campo-conteo{
    display:inline-block;
    width:90px;
    height:22px;
    border-bottom:2px solid #9ca3af;
}

.campo-observacion{
    display:inline-block;
    width:160px;
    height:22px;
    border-bottom:2px solid #9ca3af;
}

.estado-correcto{
    display:inline-block;
    padding:5px 10px;
    border-radius:999px;
    background:#dcfce7;
    color:#166534;
    font-size:11px;
    font-weight:800;
}

.estado-diferencia{
    display:inline-block;
    padding:5px 10px;
    border-radius:999px;
    background:#fee2e2;
    color:#991b1b;
    font-size:11px;
    font-weight:800;
}

.estado-alerta{
    display:inline-block;
    padding:5px 10px;
    border-radius:999px;
    background:#fef3c7;
    color:#92400e;
    font-size:11px;
    font-weight:800;
}

.estado-normal{
    display:inline-block;
    padding:5px 10px;
    border-radius:999px;
    background:#e5e7eb;
    color:#374151;
    font-size:11px;
    font-weight:800;
}

:deep(.dataTables_wrapper){
    padding:0;
}

:deep(.dataTables_filter){
    display:none;
}

:deep(.dataTables_paginate){
    margin-top:20px;
}

@media (max-width:768px){
    .reporte-toolbar{
        padding:20px;
    }

    .reporte-field,
    .reporte-btn,
    .reporte-btn-icon{
        width:100%;
    }
}
</style>