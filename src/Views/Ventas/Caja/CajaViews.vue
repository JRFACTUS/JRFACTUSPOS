<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />
        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="fw-bold">Cajas</h2>

                    <div class="d-flex gap-2">
                        <!-- Botón Abrir Caja -->
                        <button class="btn btn-primary" @click="openAddModal">
                            <i class="bi bi-plus-circle me-2"></i> Abrir Caja
                        </button>

                        <!-- Dropdown Movimientos -->
                        <DropdownMovimientos @accion="tipo => handleMovimiento(tipo)" />

                        <!-- Botón Abrir Modal Egreso -->
                        <button class="btn btn-danger" @click="abrirModalEgreso">
                            <i class="bi bi-arrow-down-circle me-2"></i> Registrar Egreso
                        </button>


                        <!-- Componente Modal Egreso -->
                        <EgresoModal v-model:visible="modalEgresoVisible" :caja-id="cajaActual?.id"
                            @egreso-registrado="recargarCajas" />


                    </div>
                </div>

                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                    <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                    <button type="button" class="btn-close" @click="error = null"></button>
                </div>

                <div v-if="!loading" class="card shadow-sm">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table ref="tableRef" class="table table-hover align-middle w-100">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Fecha Apertura</th>
                                        <th>Monto Inicial</th>
                                        <th>Fecha Cierre</th>
                                        <th>Monto Final</th>
                                        <th>Total Ventas</th>
                                        <th>Total Egresos</th>
                                        <th>Total Gastos</th>
                                        <th>Saldo Actual</th>
                                        <th>Estado</th>
                                        <th>Usuario</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(caja, index) in Cajas" :key="caja.id">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ caja.fecha_apertura }}</td>
                                        <td>{{ caja.monto_inicial }}</td>
                                        <td>{{ caja.fecha_cierre || 'Abierta' }}</td>
                                        <td>{{ caja.monto_final || 0 }}</td>
                                        <td>{{ caja.total_ventas || 0 }}</td>
                                        <td>{{ caja.total_egresos || 0 }}</td>
                                        <td>{{ caja.total_gastos || 0 }}</td>
                                        <td>{{ caja.saldo_actual || 0 }}</td>
                                        <td>{{ caja.estado || (caja.fecha_cierre ? 'Cerrada' : 'Abierta') }}</td>
                                        <td>{{ caja.usuario || 'N/A' }}</td>
                                        <td>
                                            <button v-if="!caja.fecha_cierre" class="btn btn-danger btn-sm"
                                                @click="cerrarCaja(caja)">
                                                <i class="bi bi-box-arrow-right me-1"></i> Cerrar
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="Cajas.length === 0">
                                        <td colspan="12" class="text-center text-muted">No hay cajas registradas</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

        <!-- Modal Abrir Caja -->
        <BaseModal v-model:visible="modalVisible" :title="modalTitle">
            <div class="mb-3">
                <label class="form-label">Monto Inicial</label>
                <input type="number" class="form-control" v-model="montoInicial"
                    placeholder="Ingresa el monto inicial" />
            </div>

            <template #footer>
                <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
                <button class="btn btn-primary" @click="saveCaja">Abrir Caja</button>
            </template>
        </BaseModal>

    </div>
</template>



<script>
import { ref, onMounted, nextTick } from 'vue';
import api from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';
import { useFormatters } from '@/composables/useFormatters.js';
import DropdownMovimientos from '@/Views/Ventas/Caja/DropdownMovimiento.vue';
import EgresoModal from '@/Views/Ventas/Caja/EgresoModal.vue'; // 🔹 Agregado

export default {
    name: 'CajaSViews',
    components: { Header, Sidebar, BaseModal, DropdownMovimientos, EgresoModal },

    setup() {
        const sidebarOpen = ref(false);
        const Cajas = ref([]);
        const loading = ref(false);
        const error = ref(null);


        const cajaActual = ref(null);

        const modalVisible = ref(false);
        const modalTitle = ref('Abrir Caja');
        const montoInicial = ref(0);

        // 🔹 Nuevo: control del modal egreso
        const modalEgresoVisible = ref(false);

        // 🔹 Modal Gastos
        const modalGastoVisible = ref(false);
        const nuevoGasto = ref({
            tipo_gasto: '',
            monto: '',
            descripcion: '',
            fecha_gasto: new Date().toISOString().slice(0, 19).replace('T', ' '),
            user_id: JSON.parse(localStorage.getItem('user')).id
        });

        const { tableRef, initDataTable } = useDataTable(Cajas);
        const { formatDate, formatCurrency } = useFormatters();

        const recargarCajas = async () => {
            loading.value = true;  // mostrar spinner
            await fetchCajas();     // vuelve a cargar las cajas desde la API
            loading.value = false;
        };

        const fetchCajas = async () => {
            loading.value = true;
            error.value = null;
            try {
                const res = await api.get('/getcajas');
                Cajas.value = res.data.map(caja => ({
                    ...caja,
                    fecha_apertura: formatDate(caja.fecha_apertura),
                    fecha_cierre: caja.fecha_cierre ? formatDate(caja.fecha_cierre) : null,
                    monto_inicial: formatCurrency(caja.monto_inicial),
                    monto_final: formatCurrency(caja.monto_final),
                    total_ventas: formatCurrency(caja.total_ventas),
                    total_egresos: formatCurrency(caja.total_egresos),
                    total_gastos: formatCurrency(caja.total_gastos),
                    saldo_actual: formatCurrency(caja.saldo_actual),
                })) || [];
                await nextTick();
                initDataTable();
            } catch (e) {
                error.value = 'Error al cargar las cajas: ' + (e.response?.data?.message || e.message);
            } finally {
                loading.value = false;
            }
        };

        // 🔹 Manejar clic en dropdown Movimientos
        const handleMovimiento = (tipo) => {
            if (tipo === 'egreso') {
                modalEgresoVisible.value = true; // 🔹 Abrir el modal dinámico
            } else if (tipo === 'gasto') {
                modalGastoVisible.value = true;
            }
        };

        const openAddModal = () => {
            montoInicial.value = 0;
            modalVisible.value = true;
        };
        const abrirModalEgreso = async () => {
            try {
                const res = await api.get('/caja/abierta'); // tu endpoint
                if (!res.data.cajaAbierta) {
                    return alert('No hay ninguna caja abierta para registrar un egreso.');
                }
                cajaActual.value = res.data.caja;
                modalEgresoVisible.value = true;
            } catch (error) {
                console.error(error);
                alert('Error al verificar si hay una caja abierta');
            }
        };


        const saveCaja = async () => {
            if (montoInicial.value <= 0) return alert('Ingresa un monto inicial válido');
            loading.value = true;
            error.value = null;
            try {
                const user_id = JSON.parse(localStorage.getItem('user')).id;
                await api.post('/cajas', { monto_inicial: montoInicial.value, user_id });
                await fetchCajas();
                modalVisible.value = false;
            } catch (e) {
                error.value = 'Error al abrir la caja: ' + (e.response?.data?.message || e.message);
            } finally {
                loading.value = false;
            }
        };

        const cerrarCaja = async (caja) => {
            const confirmar = confirm(`¿Deseas cerrar la caja #${caja.id}?`);
            if (!confirmar) return;

            loading.value = true;
            error.value = null;

            try {
                await api.post('/cajas/cerrar', {
                    id: caja.id,
                    monto_final: caja.saldo_actual,
                });

                const response = await api.get(`/ticketcierre?id=${caja.id}`, {
                    responseType: 'blob'
                });

                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `ticket-caja-${caja.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();

                await fetchCajas();
            } catch (e) {
                error.value = 'Error al cerrar la caja: ' + (e.response?.data?.message || e.message);
            } finally {
                loading.value = false;
            }
        };

        onMounted(fetchCajas);

        return {
            sidebarOpen,
            Cajas,
            loading,
            error,
            modalVisible,
            modalTitle,
            montoInicial,
            openAddModal,
            saveCaja,
            tableRef,
            cerrarCaja,
            handleMovimiento,
            modalGastoVisible,
            nuevoGasto,
            modalEgresoVisible, // 🔹 devuelto
            cajaActual,
            abrirModalEgreso,
            recargarCajas
        };
    },
};

</script>


<style scoped>
.main-content {
    flex: 1;
    margin-top: 60px;
    transition: margin-left 0.3s ease;
}

@media (min-width: 992px) {
    .main-content {
        margin-left: 250px;
    }
}

.sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1019;
}

.table-hover tbody tr:hover {
    background-color: rgba(0, 123, 255, 0.05);
}

main {
    min-height: calc(100vh - 60px);
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

:deep(.dataTables_wrapper) {
    padding: 0;
}

:deep(.dataTables_filter) {
    margin-bottom: 1rem;
}

:deep(.dataTables_info) {
    padding-top: 1rem;
}

:deep(.dataTables_paginate) {
    padding-top: 1rem;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}
</style>
