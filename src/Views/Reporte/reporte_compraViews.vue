<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <Sidebar
            :class="{ 'd-none d-lg-flex': !sidebarOpen }"
            @close-sidebar="sidebarOpen = false"
        />

        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">
                <!-- CARGANDO -->
                <div v-if="loading" class="text-center py-5">
                    
                    <div
                        class="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p class="mt-3 mb-0 text-muted">
                        Cargando reporte de compras...
                    </p>
                </div>

                <!-- ERROR -->
                <div
                    v-if="error"
                    class="alert alert-danger alert-dismissible fade show"
                >
                    {{ error }}

                    <button
                        type="button"
                        class="btn-close"
                        @click="error = null"
                    ></button>
                </div>

                <div v-if="!loading" class="usuarios-container">
                    <!-- ENCABEZADO -->
                    
                            <div class="usuarios-header">
                        <div>
                            <h2>Reporte de Compras</h2>
                    <p>Consulta de compras y productos adquiridos</p>
                        </div>
                    </div>

                    <!-- FILTROS -->
                    <div class="reporte-toolbar">
                        <div class="reporte-field reporte-tipo">
                            <label for="tipoReporteCompra">
                                Reporte
                            </label>

                            <select
                                id="tipoReporteCompra"
                                v-model="tipoReporteCompra"
                                class="form-select"
                                @change="cambiarTipoReporteCompra"
                            >
                                <option value="todo">
                                    Todas las compras
                                </option>

                                <option value="fechas">
                                    Por rango de fechas
                                </option>
                            </select>
                        </div>

                        <div class="reporte-field">
                            <label for="desde">
                                Desde
                            </label>

                            <input
                                id="desde"
                                v-model="desde"
                                type="date"
                                class="form-control"
                                :disabled="tipoReporteCompra === 'todo'"
                            >
                        </div>

                        <div class="reporte-field">
                            <label for="hasta">
                                Hasta
                            </label>

                            <input
                                id="hasta"
                                v-model="hasta"
                                type="date"
                                class="form-control"
                                :disabled="tipoReporteCompra === 'todo'"
                                :min="desde || undefined"
                            >
                        </div>

                        <button
                            type="button"
                            class="btn btn-primary reporte-btn"
                            @click="cargarCompras"
                        >
                            <i class="bi bi-search"></i>
                            Buscar
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-secondary reporte-btn-icon"
                            title="Limpiar filtros"
                            @click="limpiarFiltros"
                        >
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-success reporte-btn"
                            @click="exportarPDFCompras"
                        >
                            <i class="bi bi-file-earmark-pdf"></i>
                            Exportar PDF
                        </button>
                    </div>

                   

                    <!-- TABLA -->
                    <div class="usuarios-content">
                        <div class="table-responsive">
                            <table
                                ref="tableRef"
                                class="usuarios-table"
                            >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Folio</th>
                                        <th>Proveedor</th>
                                        <th>Usuario</th>
                                        <th>Fecha</th>
                                        <th>Productos</th>
                                        <th>Unidades</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr
                                        v-for="(compra, index) in compras"
                                        :key="compra.id"
                                    >
                                        <td>
                                            {{ index + 1 }}
                                        </td>

                                        <td>
                                            <strong>
                                                {{ obtenerFolio(compra) }}
                                            </strong>
                                        </td>

                                        <td>
                                            {{
                                                compra.proveedor?.razon_social ??
                                                compra.proveedor?.nombre ??
                                                compra.proveedor?.nombre_proveedor ??
                                                'Sin proveedor'
                                            }}
                                        </td>

                                        <td>
                                            {{
                                                compra.usuario?.name ??
                                                compra.user?.name ??
                                                'Sin usuario'
                                            }}
                                        </td>

                                        <td>
                                            {{
                                                formatearFecha(
                                                    compra.fecha ??
                                                    compra.created_at
                                                )
                                            }}
                                        </td>

                                        <td class="text-center">
                                            {{ obtenerTotalProductos(compra) }}
                                        </td>

                                        <td class="text-end">
                                            {{
                                                formatearCantidad(
                                                    obtenerTotalUnidades(compra)
                                                )
                                            }}
                                        </td>

                                        <td class="text-end">
                                            <strong>
                                                {{
                                                    formatearDinero(
                                                        obtenerTotalCompra(compra)
                                                    )
                                                }}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr v-if="compras.length === 0">
                                        <td
                                            colspan="8"
                                            class="text-center text-muted py-5"
                                        >
                                            No se encontraron compras con los
                                            filtros seleccionados.
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
    name: 'ReportesComprasView',

    components: {
        Header,
        Sidebar,
    },

    setup() {
        const sidebarOpen = ref(false);

        const compras = ref([]);

        const loading = ref(false);
        const error = ref(null);

        const desde = ref('');
        const hasta = ref('');

        const tipoReporteCompra = ref('todo');

        const { tableRef, initDataTable } = useDataTable(compras);

        /*
        |--------------------------------------------------------------------------
        | Obtener los detalles de una compra
        |--------------------------------------------------------------------------
        */
        const obtenerDetalles = (compra) => {
            if (Array.isArray(compra?.detalles)) {
                return compra.detalles;
            }

            if (Array.isArray(compra?.detalle_compras)) {
                return compra.detalle_compras;
            }

            return [];
        };

        /*
        |--------------------------------------------------------------------------
        | Folio de la compra
        |--------------------------------------------------------------------------
        */
        const obtenerFolio = (compra) => {
            return (
                compra?.folio ??
                compra?.folio_compra ??
                compra?.numero_compra ??
                compra?.id ??
                'N/A'
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Total de productos diferentes de una compra
        |--------------------------------------------------------------------------
        */
        const obtenerTotalProductos = (compra) => {
            const detalles = obtenerDetalles(compra);

            return Number(
                compra?.total_productos ??
                detalles.length ??
                0
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Total de unidades de una compra
        |--------------------------------------------------------------------------
        */
        const obtenerTotalUnidades = (compra) => {
            if (
                compra?.total_unidades !== undefined &&
                compra?.total_unidades !== null
            ) {
                return Number(compra.total_unidades);
            }

            return obtenerDetalles(compra).reduce((total, detalle) => {
                return total + Number(detalle?.cantidad ?? 0);
            }, 0);
        };

        /*
        |--------------------------------------------------------------------------
        | Total monetario de una compra
        |--------------------------------------------------------------------------
        */
        const obtenerTotalCompra = (compra) => {
            if (compra?.total !== undefined && compra?.total !== null) {
                return Number(compra.total);
            }

            if (
                compra?.total_compra !== undefined &&
                compra?.total_compra !== null
            ) {
                return Number(compra.total_compra);
            }

            return obtenerDetalles(compra).reduce((total, detalle) => {
                const cantidad = Number(detalle?.cantidad ?? 0);

                const precio = Number(
                    detalle?.precio_compra ??
                    detalle?.precio_unitario ??
                    detalle?.producto?.precio_compra ??
                    0
                );

                const subtotal = Number(
                    detalle?.subtotal ?? cantidad * precio
                );

                return total + subtotal;
            }, 0);
        };

        /*
        |--------------------------------------------------------------------------
        | Totales generales
        |--------------------------------------------------------------------------
        */
        const totalComprasRegistradas = computed(() => {
            return compras.value.length;
        });

        const totalProductos = computed(() => {
            return compras.value.reduce((total, compra) => {
                return total + obtenerTotalProductos(compra);
            }, 0);
        });

        const totalUnidades = computed(() => {
            return compras.value.reduce((total, compra) => {
                return total + obtenerTotalUnidades(compra);
            }, 0);
        });

        const totalImporteCompras = computed(() => {
            return compras.value.reduce((total, compra) => {
                return total + obtenerTotalCompra(compra);
            }, 0);
        });

        /*
        |--------------------------------------------------------------------------
        | Formatos
        |--------------------------------------------------------------------------
        */
        const formatearFecha = (fecha) => {
            if (!fecha) {
                return 'N/A';
            }

            const fechaObjeto = new Date(fecha);

            if (Number.isNaN(fechaObjeto.getTime())) {
                return 'N/A';
            }

            return fechaObjeto.toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        const formatearDinero = (cantidad) => {
            return Number(cantidad ?? 0).toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        const formatearCantidad = (cantidad) => {
            return Number(cantidad ?? 0).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        /*
        |--------------------------------------------------------------------------
        | Cambiar tipo de reporte
        |--------------------------------------------------------------------------
        */
        const cambiarTipoReporteCompra = () => {
            error.value = null;

            if (tipoReporteCompra.value === 'todo') {
                desde.value = '';
                hasta.value = '';
            }
        };

        /*
        |--------------------------------------------------------------------------
        | Validación de fechas
        |--------------------------------------------------------------------------
        */
        const validarFechas = () => {
            error.value = null;

            if (tipoReporteCompra.value === 'todo') {
                return true;
            }

            if (!desde.value || !hasta.value) {
                error.value =
                    'Debes seleccionar la fecha desde y la fecha hasta.';

                return false;
            }

            if (hasta.value < desde.value) {
                error.value =
                    'La fecha hasta debe ser igual o posterior a la fecha desde.';

                return false;
            }

            return true;
        };

        /*
        |--------------------------------------------------------------------------
        | Cargar compras
        |--------------------------------------------------------------------------
        */
        const cargarCompras = async () => {
            if (!validarFechas()) {
                return;
            }

            loading.value = true;
            error.value = null;

            try {
                const respuesta = await api.get('reportes/compras', {
                    params: {
                        tipo_reporte: tipoReporteCompra.value,

                        desde:
                            tipoReporteCompra.value === 'fechas'
                                ? desde.value
                                : null,

                        hasta:
                            tipoReporteCompra.value === 'fechas'
                                ? hasta.value
                                : null,
                    },
                });

                compras.value =
                    respuesta.data?.data ??
                    respuesta.data?.compras ??
                    respuesta.data ??
                    [];

                await nextTick();

                initDataTable();
            } catch (e) {
                compras.value = [];

                error.value =
                    e.response?.data?.message ??
                    e.response?.data?.errors?.desde?.[0] ??
                    e.response?.data?.errors?.hasta?.[0] ??
                    'Error al cargar el reporte de compras.';
            } finally {
                loading.value = false;
            }
        };

        /*
        |--------------------------------------------------------------------------
        | Limpiar filtros
        |--------------------------------------------------------------------------
        */
        const limpiarFiltros = async () => {
            tipoReporteCompra.value = 'todo';

            desde.value = '';
            hasta.value = '';

            error.value = null;

            await cargarCompras();
        };

        /*
        |--------------------------------------------------------------------------
        | Exportar PDF
        |--------------------------------------------------------------------------
        */
        const exportarPDFCompras = () => {
            if (!validarFechas()) {
                return;
            }

            const params = new URLSearchParams();

            params.append(
                'tipo_reporte',
                tipoReporteCompra.value
            );

            params.append('provedor_id', 'todos');
            params.append('user_id', 'todos');

            if (tipoReporteCompra.value === 'fechas') {
                params.append('desde', desde.value);
                params.append('hasta', hasta.value);
            }

            window.open(
                `${api.defaults.baseURL}reportes/compras/pdf?${params.toString()}`,
                '_blank'
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Carga inicial
        |--------------------------------------------------------------------------
        */
        onMounted(async () => {
            await cargarCompras();
        });

        return {
            sidebarOpen,

            compras,

            loading,
            error,

            desde,
            hasta,

            tipoReporteCompra,

            tableRef,

            totalComprasRegistradas,
            totalProductos,
            totalUnidades,
            totalImporteCompras,

            obtenerFolio,
            obtenerTotalProductos,
            obtenerTotalUnidades,
            obtenerTotalCompra,

            formatearFecha,
            formatearDinero,
            formatearCantidad,

            cambiarTipoReporteCompra,
            cargarCompras,
            limpiarFiltros,
            exportarPDFCompras,
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