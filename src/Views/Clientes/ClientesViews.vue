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
          class="clientes-container"
        >
          <div class="clientes-header">
            <div>
              <h2>Gestión de Clientes</h2>

              <p>
                Listado general de clientes registrados
              </p>
            </div>

            <!-- PERMISO CREAR -->
            <button
              v-if="permisos?.crear"
              type="button"
              class="btn-nuevo"
              @click="openAddModal"
            >
              Nuevo Cliente
            </button>
          </div>

          <div class="clientes-content">
            <div class="table-responsive">
              <table
                ref="tableRef"
                class="clientes-table"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>RFC</th>
                    <th>Razón Social</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>

                    <!-- COLUMNA ACCIONES -->
                    <th
                      v-if="
                        permisos?.actualizar ||
                        permisos?.eliminar
                      "
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(cliente, index) in clientes"
                    :key="cliente.id"
                  >
                    <td>
                      {{ index + 1 }}
                    </td>

                    <td>
                      {{ cliente.rfc }}
                    </td>

                    <td>
                      {{ cliente.razon_social }}
                    </td>

                    <td>
                      {{ cliente.nombre }}
                      {{ cliente.apellidos }}
                    </td>

                    <td>
                      {{ cliente.email }}
                    </td>

                    <td>
                      {{ cliente.telefono }}
                    </td>

                    <!-- ACCIONES -->
                    <td
                      v-if="
                        permisos?.actualizar ||
                        permisos?.eliminar
                      "
                    >
                      <!-- PERMISO ACTUALIZAR -->
                      <button
                        v-if="permisos?.actualizar"
                        type="button"
                        class="btn btn-sm btn-warning me-2"
                        @click="openEditModal(cliente)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <!-- PERMISO ELIMINAR -->
                      <button
                        v-if="permisos?.eliminar"
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="deleteCliente(cliente.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="clientes.length === 0">
                    <td
                      :colspan="
                        permisos?.actualizar ||
                        permisos?.eliminar
                          ? 7
                          : 6
                      "
                      class="text-center text-muted py-5"
                    >
                      No hay clientes registrados
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
            !permisos?.listar
          "
          class="alert alert-warning text-center"
        >
          No tienes permiso para ver los clientes.
        </div>
      </main>
    </div>

    <!-- OVERLAY MÓVIL -->
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
      <div class="container-fluid">
        <!-- PASO 1: INFORMACIÓN GENERAL -->
        <div v-if="step === 1">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                RFC
              </label>

              <input
                v-model="clienteForm.rfc"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">
                Razón Social
              </label>

              <input
                v-model="clienteForm.razon_social"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Nombre
              </label>

              <input
                v-model="clienteForm.nombre"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">
                Apellidos
              </label>

              <input
                v-model="clienteForm.apellidos"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">
                Email 1
              </label>

              <input
                v-model="clienteForm.email"
                type="email"
                class="form-control"
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">
                Email 2
              </label>

              <input
                v-model="clienteForm.email2"
                type="email"
                class="form-control"
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">
                Email 3
              </label>

              <input
                v-model="clienteForm.email3"
                type="email"
                class="form-control"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Teléfono
              </label>

              <input
                v-model="clienteForm.telefono"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">
                Régimen Fiscal
              </label>

              <select
                v-model="clienteForm.regimen_fiscal_id"
                class="form-control"
              >
                <option
                  disabled
                  value=""
                >
                  Seleccione régimen
                </option>

                <option
                  v-for="item in regimenesFiscales"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.codigo }} -
                  {{ item.descripcion }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">
              Uso de CFDI
            </label>

            <select
              v-model="clienteForm.uso_cfdi_id"
              class="form-control"
            >
              <option
                disabled
                value=""
              >
                Seleccione uso de CFDI
              </option>

              <option
                v-for="item in usosCfdi"
                :key="item.id"
                :value="item.id"
              >
                {{ item.usocfdi }} -
                {{ item.descripcion }}
              </option>
            </select>
          </div>
        </div>

        <!-- PASO 2: DATOS FISCALES -->
        <div v-if="step === 2">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Calle
              </label>

              <input
                v-model="clienteForm.calle"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">
                Exterior
              </label>

              <input
                v-model="clienteForm.numero_exterior"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">
                Interior
              </label>

              <input
                v-model="clienteForm.numero_interior"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">
                Colonia
              </label>

              <input
                v-model="clienteForm.colonia"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">
                Ciudad
              </label>

              <input
                v-model="clienteForm.ciudad"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">
                Estado
              </label>

              <input
                v-model="clienteForm.estado"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Delegación / Municipio
              </label>

              <input
                v-model="clienteForm.delegacion"
                type="text"
                class="form-control"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">
                Código Postal
              </label>

              <input
                v-model="clienteForm.codigo_postal"
                type="text"
                class="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <template #footer>
        <div class="d-flex justify-content-between w-100">
          <button
            v-if="step > 1"
            type="button"
            class="btn btn-secondary"
            @click="prevStep"
          >
            Atrás
          </button>

          <div class="ms-auto">
            <button
              v-if="step < 2"
              type="button"
              class="btn btn-primary"
              @click="nextStep"
            >
              Siguiente
            </button>

            <button
              v-else-if="
                editingId
                  ? permisos?.actualizar
                  : permisos?.crear
              "
              type="button"
              class="btn btn-success"
              :disabled="loading"
              @click="saveCliente"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              Guardar
            </button>
          </div>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL CONFIRMACIÓN -->
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
  reactive,
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

export default {
  name: 'ClientesView',

  components: {
    Header,
    Sidebar,
    BaseModal,
    ConfirmModal
  },

  setup() {
    const sidebarOpen = ref(false);
    const clientes = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const regimenesFiscales = ref([]);
    const usosCfdi = ref([]);

    const modalVisible = ref(false);
    const modalTitle = ref('');
    const step = ref(1);
    const editingId = ref(null);

    const clienteForm = reactive({
      rfc: '',
      razon_social: '',
      nombre: '',
      apellidos: '',
      email: '',
      email2: '',
      email3: '',
      telefono: '',
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      delegacion: '',
      codigo_postal: '',
      regimen_fiscal_id: '',
      uso_cfdi_id: ''
    });

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
    } = useDataTable(clientes);

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
    | Cargar permisos
    |--------------------------------------------------------------------------
    */
    const fetchPermisos = async () => {
      try {
        const respuesta =
          await obtenerPermisosPorModulo(
            'clientes'
          );

        permisos.value = {
          listar: permisoActivo(
            respuesta?.listar
          ),

          crear: permisoActivo(
            respuesta?.crear
          ),

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
          'No fue posible cargar los permisos de clientes.';
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar clientes
    |--------------------------------------------------------------------------
    */
    const fetchClientes = async () => {
      if (!permisos.value?.listar) {
        clientes.value = [];
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const res = await api.get('/clientes');

        clientes.value =
          res.data?.clientes || [];

        await nextTick();
        initDataTable();
      } catch (e) {
        error.value =
          'Error al cargar los clientes: ' +
          (
            e.response?.data?.message ||
            e.message
          );
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar catálogos SAT
    |--------------------------------------------------------------------------
    */
    const fetchSatCatalogs = async () => {
      try {
        const res = await api.get('/sat');

        regimenesFiscales.value =
          res.data?.regimenes_fiscales || [];

        usosCfdi.value =
          res.data?.usos_cfdi || [];
      } catch (e) {
        console.error(
          'Error al cargar catálogos SAT:',
          e
        );
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir nuevo cliente
    |--------------------------------------------------------------------------
    */
    const openAddModal = async () => {
      if (!permisos.value?.crear) {
        error.value =
          'No tienes permiso para crear clientes.';

        return;
      }

      modalTitle.value = 'Nuevo Cliente';

      Object.keys(clienteForm).forEach(
        (key) => {
          clienteForm[key] = '';
        }
      );

      editingId.value = null;
      step.value = 1;

      await fetchSatCatalogs();

      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir editar cliente
    |--------------------------------------------------------------------------
    */
    const openEditModal = async (cliente) => {
      if (!permisos.value?.actualizar) {
        error.value =
          'No tienes permiso para actualizar clientes.';

        return;
      }

      Object.assign(
        clienteForm,
        cliente
      );

      editingId.value = cliente.id;
      modalTitle.value = 'Editar Cliente';
      step.value = 1;

      await fetchSatCatalogs();

      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar cliente
    |--------------------------------------------------------------------------
    */
    const saveCliente = async () => {
      if (
        editingId.value &&
        !permisos.value?.actualizar
      ) {
        error.value =
          'No tienes permiso para actualizar clientes.';

        return;
      }

      if (
        !editingId.value &&
        !permisos.value?.crear
      ) {
        error.value =
          'No tienes permiso para crear clientes.';

        return;
      }

      loading.value = true;
      error.value = null;

      try {
        if (editingId.value) {
          await api.put(
            `/clientes/${editingId.value}`,
            clienteForm
          );
        } else {
          await api.post(
            '/clientes',
            clienteForm
          );
        }

        await fetchClientes();

        modalVisible.value = false;
      } catch (e) {
        error.value =
          'Error al guardar el cliente: ' +
          (
            e.response?.data?.message ||
            e.message
          );
      } finally {
        loading.value = false;
      }
    };

    const nextStep = () => {
      if (step.value < 2) {
        step.value++;
      }
    };

    const prevStep = () => {
      if (step.value > 1) {
        step.value--;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Solicitar eliminación
    |--------------------------------------------------------------------------
    */
    const deleteCliente = (id) => {
      if (!permisos.value?.eliminar) {
        error.value =
          'No tienes permiso para eliminar clientes.';

        return;
      }

      deletingId.value = id;

      confirmMessage.value =
        '¿Seguro que deseas eliminar este cliente?';

      confirmModalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Confirmar eliminación
    |--------------------------------------------------------------------------
    */
    const onConfirmDelete = async () => {
      if (!permisos.value?.eliminar) {
        error.value =
          'No tienes permiso para eliminar clientes.';

        confirmModalVisible.value = false;
        return;
      }

      if (!deletingId.value) {
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        await api.delete(
          `/clientes/${deletingId.value}`
        );

        await fetchClientes();
      } catch (e) {
        error.value =
          'Error al eliminar el cliente: ' +
          (
            e.response?.data?.message ||
            e.message
          );
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
        await fetchClientes();
      }

      await fetchSatCatalogs();
    });

    return {
      sidebarOpen,

      clientes,
      loading,
      error,

      modalVisible,
      modalTitle,

      clienteForm,
      regimenesFiscales,
      usosCfdi,

      editingId,
      step,

      nextStep,
      prevStep,
      saveCliente,

      confirmModalVisible,
      confirmMessage,

      tableRef,
      permisos,

      openAddModal,
      openEditModal,
      deleteCliente,
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

/* CONTENEDOR */

.clientes-container{
    width:100%;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #edf0f5;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
}

/* HEADER */

.clientes-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.clientes-header h2{
    margin:0;
    font-size:24px;
    font-weight:700;
    color:#111827;
}

.clientes-header p{
    margin-top:6px;
    color:#6b7280;
}

/* BOTÓN */

.btn-nuevo{
    border:none;
    background:#2563eb;
    color:white;
    padding:12px 22px;
    border-radius:14px;
    font-weight:600;
}

/* CONTENIDO */

.clientes-content{
    padding:20px;
    overflow-x:auto;
}

/* TABLA */

.clientes-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.clientes-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
    white-space:nowrap;
}

.clientes-table tbody tr{
    background:#f8fafc;
}

.clientes-table td{
    padding:18px 20px;
    white-space:nowrap;
}

.clientes-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.clientes-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

/* BOTONES CRUD */

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
    width:100%;
}

:deep(.dataTables_length){
    margin-bottom:20px;
}

:deep(.dataTables_filter){
    margin-bottom:20px;
}

:deep(.dataTables_filter input){
    border-radius:10px;
}

:deep(.dataTables_info){
    margin-top:20px;
}

:deep(.dataTables_paginate){
    margin-top:20px;
}

/* RESPONSIVE */

@media(max-width:768px){

    .clientes-header{
        flex-direction:column;
        align-items:flex-start;
        gap:15px;
    }

    .btn-nuevo{
        width:100%;
    }

}
</style>
