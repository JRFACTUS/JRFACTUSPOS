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
          class="proveedores-container"
        >
          <div class="proveedores-header">
            <div>
              <h2>Gestión de Proveedores</h2>

              <p>
                Listado general de proveedores registrados
              </p>
            </div>

            <!-- PERMISO CREAR -->
            <button
              v-if="permisos?.crear"
              type="button"
              class="btn-nuevo"
              @click="openAddModal"
            >
              Nuevo Proveedor
            </button>
          </div>

          <div class="proveedores-content">
            <div class="table-responsive">
              <table
                ref="tableRef"
                class="proveedores-table"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>RFC</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>

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
                    v-for="(prov, index) in Proveedores"
                    :key="prov.id"
                  >
                    <td>
                      {{ index + 1 }}
                    </td>

                    <td>
                      {{ prov.nombre }}
                    </td>

                    <td>
                      {{ prov.rfc }}
                    </td>

                    <td>
                      {{ prov.telefono }}
                    </td>

                    <td>
                      {{ prov.email }}
                    </td>

                    <td>
                      {{ prov.direccion }}
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
                        @click="openEditModal(prov)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <!-- PERMISO ELIMINAR -->
                      <button
                        v-if="permisos?.eliminar"
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="deleteProveedor(prov.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="Proveedores.length === 0">
                    <td
                      :colspan="
                        permisos?.actualizar ||
                        permisos?.eliminar
                          ? 7
                          : 6
                      "
                      class="text-center text-muted py-5"
                    >
                      No hay proveedores registrados
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
          No tienes permiso para ver los proveedores.
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
      <div class="mb-3">
        <label class="form-label">
          Nombre
        </label>

        <input
          v-model="ProveedorNombre"
          type="text"
          class="form-control"
          placeholder="Nombre del proveedor"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">
          RFC
        </label>

        <input
          v-model="ProveedorRFC"
          type="text"
          class="form-control"
          placeholder="RFC"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">
          Teléfono
        </label>

        <input
          v-model="ProveedorTelefono"
          type="text"
          class="form-control"
          placeholder="Teléfono"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">
          Email
        </label>

        <input
          v-model="ProveedorEmail"
          type="email"
          class="form-control"
          placeholder="Correo electrónico"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">
          Dirección
        </label>

        <input
          v-model="ProveedorDireccion"
          type="text"
          class="form-control"
          placeholder="Dirección"
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

        <button
          v-if="
            editingId
              ? permisos?.actualizar
              : permisos?.crear
          "
          type="button"
          class="btn btn-primary"
          :disabled="loading"
          @click="saveProveedor"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>

          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

    <!-- MODAL DE CONFIRMACIÓN -->
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

export default {
  name: 'ProveedoresViews',

  components: {
    Header,
    Sidebar,
    BaseModal,
    ConfirmModal
  },

  setup() {
    const sidebarOpen = ref(false);

    const Proveedores = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const modalVisible = ref(false);
    const modalTitle = ref('');

    const ProveedorNombre = ref('');
    const ProveedorRFC = ref('');
    const ProveedorTelefono = ref('');
    const ProveedorEmail = ref('');
    const ProveedorDireccion = ref('');

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
    } = useDataTable(Proveedores);

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
            'provedores'
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
          'No fue posible cargar los permisos de proveedores.';
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar proveedores
    |--------------------------------------------------------------------------
    */
    const fetchProveedores = async () => {
      if (!permisos.value?.listar) {
        Proveedores.value = [];
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const res = await api.get(
          '/provedores'
        );

        Proveedores.value =
          res.data?.data || [];

        await nextTick();
        initDataTable();
      } catch (e) {
        error.value =
          'Error al cargar proveedores: ' +
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
    | Abrir modal para crear
    |--------------------------------------------------------------------------
    */
    const openAddModal = () => {
      if (!permisos.value?.crear) {
        error.value =
          'No tienes permiso para crear proveedores.';

        return;
      }

      modalTitle.value =
        'Nuevo Proveedor';

      ProveedorNombre.value = '';
      ProveedorRFC.value = '';
      ProveedorTelefono.value = '';
      ProveedorEmail.value = '';
      ProveedorDireccion.value = '';

      editingId.value = null;
      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir modal para editar
    |--------------------------------------------------------------------------
    */
    const openEditModal = (prov) => {
      if (!permisos.value?.actualizar) {
        error.value =
          'No tienes permiso para actualizar proveedores.';

        return;
      }

      modalTitle.value =
        'Editar Proveedor';

      ProveedorNombre.value =
        prov.nombre || '';

      ProveedorRFC.value =
        prov.rfc || '';

      ProveedorTelefono.value =
        prov.telefono || '';

      ProveedorEmail.value =
        prov.email || '';

      ProveedorDireccion.value =
        prov.direccion || '';

      editingId.value = prov.id;
      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar o actualizar proveedor
    |--------------------------------------------------------------------------
    */
    const saveProveedor = async () => {
      if (
        editingId.value &&
        !permisos.value?.actualizar
      ) {
        error.value =
          'No tienes permiso para actualizar proveedores.';

        return;
      }

      if (
        !editingId.value &&
        !permisos.value?.crear
      ) {
        error.value =
          'No tienes permiso para crear proveedores.';

        return;
      }

      if (
        !ProveedorNombre.value.trim() ||
        !ProveedorRFC.value.trim()
      ) {
        error.value =
          'El nombre y el RFC son obligatorios.';

        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const payload = {
          nombre:
            ProveedorNombre.value.trim(),

          rfc:
            ProveedorRFC.value.trim(),

          telefono:
            ProveedorTelefono.value.trim(),

          email:
            ProveedorEmail.value.trim(),

          direccion:
            ProveedorDireccion.value.trim()
        };

        if (editingId.value) {
          await api.put(
            `/provedores/${editingId.value}`,
            payload
          );
        } else {
          await api.post(
            '/provedores',
            payload
          );
        }

        await fetchProveedores();

        modalVisible.value = false;
      } catch (e) {
        error.value =
          'Error al guardar proveedor: ' +
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
    | Solicitar eliminación
    |--------------------------------------------------------------------------
    */
    const deleteProveedor = (id) => {
      if (!permisos.value?.eliminar) {
        error.value =
          'No tienes permiso para eliminar proveedores.';

        return;
      }

      deletingId.value = id;

      confirmMessage.value =
        '¿Seguro que deseas eliminar este proveedor?';

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
          'No tienes permiso para eliminar proveedores.';

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
          `/provedores/${deletingId.value}`
        );

        await fetchProveedores();
      } catch (e) {
        error.value =
          'Error al eliminar proveedor: ' +
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
        await fetchProveedores();
      }
    });

    return {
      sidebarOpen,

      Proveedores,
      loading,
      error,

      modalVisible,
      modalTitle,

      ProveedorNombre,
      ProveedorRFC,
      ProveedorTelefono,
      ProveedorEmail,
      ProveedorDireccion,

      editingId,

      confirmModalVisible,
      confirmMessage,

      tableRef,
      permisos,

      openAddModal,
      openEditModal,
      saveProveedor,
      deleteProveedor,
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

.proveedores-container{
    width:100%;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #edf0f5;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
}

/* HEADER */

.proveedores-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.proveedores-header h2{
    margin:0;
    font-size:24px;
    font-weight:700;
    color:#111827;
}

.proveedores-header p{
    margin-top:6px;
    color:#6b7280;
}

/* BOTON */

.btn-nuevo{
    border:none;
    background:#2563eb;
    color:white;
    padding:12px 22px;
    border-radius:14px;
    font-weight:600;
}

/* CONTENIDO */

.proveedores-content{
    padding:20px;
    overflow-x:auto;
}

/* TABLA */

.proveedores-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.proveedores-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
    white-space:nowrap;
}

.proveedores-table tbody tr{
    background:#f8fafc;
}

.proveedores-table td{
    padding:18px 20px;
    white-space:nowrap;
}

.proveedores-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.proveedores-table tbody tr td:last-child{
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

    .proveedores-header{
        flex-direction:column;
        align-items:flex-start;
        gap:15px;
    }

    .btn-nuevo{
        width:100%;
    }

}
</style>
