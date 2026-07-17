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
        <div
          v-if="!permisos || loading"
          class="text-center py-5"
        >
          <div
            class="spinner-border text-primary"
            role="status"
          ></div>
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

        <!-- CONTENIDO -->
        <div
          v-if="!loading && permisos?.listar"
          class="medidas-container"
        >
          <div class="medidas-header">
            <div>
              <h2>Gestión de Medidas</h2>

              <p>
                Listado general de medidas registradas
              </p>
            </div>

            <!-- PERMISO CREAR -->
            <button
              v-if="permisos.crear"
              type="button"
              class="btn-nuevo"
              @click="openAddModal"
            >
              Nueva Medida
            </button>
          </div>

          <div class="medidas-content">
            <div class="table-responsive">
              <table
                ref="tableRef"
                class="medidas-table"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Nombre Corto</th>
                    <th>Fecha de Creación</th>

                    <!-- OCULTAR COLUMNA ACCIONES -->
                    <th
                      v-if="
                        permisos.actualizar ||
                        permisos.eliminar
                      "
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(medida, index) in Medidas"
                    :key="medida.id"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ medida.nombre_largo }}</td>
                    <td>{{ medida.unidad_sat }}</td>

                    <td>
                      {{ formatDate(medida.updated_at) }}
                    </td>

                    <!-- ACCIONES -->
                    <td
                      v-if="
                        permisos.actualizar ||
                        permisos.eliminar
                      "
                    >
                      <!-- PERMISO ACTUALIZAR -->
                      <button
                        v-if="permisos.actualizar"
                        type="button"
                        class="btn btn-sm btn-warning me-2"
                        @click="openEditModal(medida)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <!-- PERMISO ELIMINAR -->
                      <button
                        v-if="permisos.eliminar"
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="deleteMedida(medida.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="Medidas.length === 0">
                    <td
                      :colspan="
                        permisos.actualizar ||
                        permisos.eliminar
                          ? 5
                          : 4
                      "
                      class="text-center text-muted py-5"
                    >
                      No hay medidas registradas
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SIN PERMISO PARA LISTAR -->
        <div
          v-if="
            !loading &&
            permisos &&
            !permisos.listar
          "
          class="alert alert-warning text-center"
        >
          No tienes permiso para ver las medidas.
        </div>
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay d-lg-none"
      @click="sidebarOpen = false"
    ></div>

    <!-- MODAL CREAR/EDITAR -->
    <BaseModal
      v-model:visible="modalVisible"
      :title="modalTitle"
    >
      <div class="mb-3">
        <label class="form-label">
          Nombre Largo
        </label>

        <input
          v-model="MedidaNombreLargo"
          type="text"
          class="form-control"
          placeholder="Ingrese el nombre largo"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">
          Nombre Corto
        </label>

        <input
          v-model="MedidaNombreCorto"
          type="text"
          class="form-control"
          placeholder="Ingrese el nombre corto"
        />
      </div>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="modalVisible = false"
        >
          Cancelar
        </button>

        <!-- PERMISO SEGÚN CREAR O EDITAR -->
        <button
          v-if="
            editingId
              ? permisos?.actualizar
              : permisos?.crear
          "
          type="button"
          class="btn btn-primary"
          @click="saveMedida"
        >
          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

    <!-- CONFIRMACIÓN -->
    <ConfirmModal
      v-model:visible="confirmModalVisible"
      :message="confirmMessage"
      @confirmed="onConfirmDelete"
    />
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  nextTick
} from 'vue';

import api, {
  obtenerPermisosPorModulo
} from '@/services/api.js';

import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'MedidaSViews',

  components: {
    Header,
    Sidebar,
    BaseModal,
    ConfirmModal
  },

  setup() {
    const sidebarOpen = ref(false);
    const Medidas = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const modalVisible = ref(false);
    const modalTitle = ref('');
    const MedidaNombreLargo = ref('');
    const MedidaNombreCorto = ref('');
    const editingId = ref(null);

    const confirmModalVisible = ref(false);
    const confirmMessage = ref('');
    const deletingId = ref(null);

    /*
     * null significa que los permisos aún no cargan.
     */
    const permisos = ref(null);

    const {
      tableRef,
      initDataTable
    } = useDataTable(Medidas);

    const {
      formatDate
    } = useFormatters();

    const permisoActivo = (valor) => {
      return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar permisos del módulo medida
    |--------------------------------------------------------------------------
    */
    const fetchPermisos = async () => {
      try {
        const respuesta =
          await obtenerPermisosPorModulo('medida');

        permisos.value = {
          listar: permisoActivo(respuesta?.listar),
          crear: permisoActivo(respuesta?.crear),
          actualizar: permisoActivo(
            respuesta?.actualizar
          ),
          eliminar: permisoActivo(
            respuesta?.eliminar
          )
        };
      } catch (e) {
        permisos.value = {
          listar: false,
          crear: false,
          actualizar: false,
          eliminar: false
        };

        error.value =
          'No fue posible cargar los permisos de medidas.';
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar medidas
    |--------------------------------------------------------------------------
    */
    const fetchMedidas = async () => {
      if (!permisos.value?.listar) {
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const res = await api.get('/getMedida');

        Medidas.value = res.data || [];

        await nextTick();
        initDataTable();
      } catch (e) {
        error.value =
          'Error al cargar las medidas: ' +
          (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir modal para crear
    |--------------------------------------------------------------------------
    */
    const openAddModal = () => {
      if (!permisos.value?.crear) {
        error.value =
          'No tienes permiso para crear medidas.';
        return;
      }

      modalTitle.value = 'Nueva Medida';
      MedidaNombreLargo.value = '';
      MedidaNombreCorto.value = '';
      editingId.value = null;
      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir modal para editar
    |--------------------------------------------------------------------------
    */
    const openEditModal = (medida) => {
      if (!permisos.value?.actualizar) {
        error.value =
          'No tienes permiso para actualizar medidas.';
        return;
      }

      modalTitle.value = 'Editar Medida';
      MedidaNombreLargo.value =
        medida.nombre_largo || '';

      MedidaNombreCorto.value =
        medida.unidad_sat || '';

      editingId.value = medida.id;
      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar o actualizar medida
    |--------------------------------------------------------------------------
    */
    const saveMedida = async () => {
      if (
        editingId.value &&
        !permisos.value?.actualizar
      ) {
        error.value =
          'No tienes permiso para actualizar medidas.';
        return;
      }

      if (
        !editingId.value &&
        !permisos.value?.crear
      ) {
        error.value =
          'No tienes permiso para crear medidas.';
        return;
      }

      const nombreLargo =
        MedidaNombreLargo.value.trim();

      const nombreCorto =
        MedidaNombreCorto.value.trim();

      if (!nombreLargo || !nombreCorto) {
        error.value =
          'El nombre largo y el nombre corto son obligatorios.';
        return;
      }

      loading.value = true;
      error.value = null;

      const datos = {
        nombre_largo: nombreLargo,
        unidad_sat: nombreCorto
      };

      try {
        if (editingId.value) {
          await api.put(
            `/medidas/${editingId.value}`,
            datos
          );
        } else {
          await api.post('/medidas', datos);
        }

        modalVisible.value = false;
        await fetchMedidas();
      } catch (e) {
        error.value =
          'Error al guardar la medida: ' +
          (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Solicitar eliminación
    |--------------------------------------------------------------------------
    */
    const deleteMedida = (id) => {
      if (!permisos.value?.eliminar) {
        error.value =
          'No tienes permiso para eliminar medidas.';
        return;
      }

      deletingId.value = id;

      confirmMessage.value =
        '¿Seguro que deseas eliminar esta medida?';

      confirmModalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Confirmar eliminación
    |--------------------------------------------------------------------------
    */
    const onConfirmDelete = async () => {
      if (
        !permisos.value?.eliminar ||
        !deletingId.value
      ) {
        confirmModalVisible.value = false;
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        await api.delete(
          `/medidas/${deletingId.value}`
        );

        await fetchMedidas();
      } catch (e) {
        error.value =
          'Error al eliminar la medida: ' +
          (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
        deletingId.value = null;
        confirmModalVisible.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Inicialización
    |--------------------------------------------------------------------------
    */
    onMounted(async () => {
      await fetchPermisos();

      if (permisos.value?.listar) {
        await fetchMedidas();
      }
    });

    return {
      sidebarOpen,
      Medidas,
      loading,
      error,
      modalVisible,
      modalTitle,
      MedidaNombreLargo,
      MedidaNombreCorto,
      editingId,
      confirmModalVisible,
      confirmMessage,
      tableRef,
      formatDate,
      permisos,
      openAddModal,
      openEditModal,
      saveMedida,
      deleteMedida,
      onConfirmDelete
    };
  }
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

.medidas-container{
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
    border:1px solid #edf0f5;
}

.medidas-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.medidas-header h2{
    font-size:24px;
    font-weight:700;
    margin:0;
    color:#111827;
}

.medidas-header p{
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

.medidas-content{
    padding:20px;
}

.medidas-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.medidas-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
}

.medidas-table tbody tr{
    background:#f8fafc;
}

.medidas-table td{
    padding:18px 20px;
}

.medidas-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.medidas-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

.btn-warning{
    border:none;
    border-radius:12px;
}

.btn-danger{
    border:none;
    border-radius:12px;
}

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
