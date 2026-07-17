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

        <!-- SIN PERMISO -->
        <div
          v-if="!loading && !permisosAcceso.listar"
          class="alert alert-warning"
        >
          No tienes permiso para consultar roles.
        </div>

        <!-- CONTENIDO -->
        <div
          v-if="!loading && permisosAcceso.listar"
          class="roles-container"
        >
          <div class="roles-header">
            <div>
              <h2>Gestión de Roles y Permisos</h2>

              <p>
                Listado general de roles registrados
              </p>
            </div>

            <!-- PERMISO CREAR -->
            <button
              v-if="permisosAcceso.crear"
              type="button"
              class="btn-nuevo"
              @click="openAddModal"
            >
              Nuevo Rol
            </button>
          </div>

          <div class="roles-content">
            <div class="table-responsive">
              <table
                ref="tableRef"
                class="roles-table"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre del Rol</th>
                    <th>Descripción</th>
                    <th>Usuario Asignado</th>

                    <th
                      v-if="
                        permisosAcceso.actualizar ||
                        permisosAcceso.eliminar
                      "
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(rol, index) in roles"
                    :key="rol.id"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ rol.nombre }}</td>
                    <td>{{ rol.descripcion }}</td>
                    <td>{{ rol.usuario?.name || '—' }}</td>

                    <td
                      v-if="
                        permisosAcceso.actualizar ||
                        permisosAcceso.eliminar
                      "
                    >
                      <!-- PERMISO ACTUALIZAR -->
                      <button
                        v-if="permisosAcceso.actualizar"
                        type="button"
                        class="btn btn-sm btn-warning me-2"
                        @click="openEditModal(rol)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <!-- PERMISO ELIMINAR -->
                      <button
                        v-if="permisosAcceso.eliminar"
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="deleteRol(rol.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="roles.length === 0">
                    <td
                      :colspan="
                        permisosAcceso.actualizar ||
                        permisosAcceso.eliminar
                          ? 5
                          : 4
                      "
                      class="text-center text-muted py-5"
                    >
                      No hay roles registrados
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

    <!-- MODAL CREAR/EDITAR -->
    <BaseModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      size="lg"
    >
      <form
        class="container-fluid"
        style="
          max-height: 65vh;
          overflow-y: auto;
          padding-right: 10px;
        "
        @submit.prevent="saveRol"
      >
        <div class="row mb-2">
          <label
            class="col-md-3 col-form-label fw-semibold"
          >
            Nombre
          </label>

          <div class="col-md-9">
            <input
              v-model="rolNombre"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ej. Administrador"
            />
          </div>
        </div>

        <div class="row mb-2">
          <label
            class="col-md-3 col-form-label fw-semibold"
          >
            Descripción
          </label>

          <div class="col-md-9">
            <textarea
              v-model="rolDescripcion"
              class="form-control form-control-sm"
              rows="2"
              placeholder="Descripción del rol"
            ></textarea>
          </div>
        </div>

        <div class="row mb-3">
          <label
            class="col-md-3 col-form-label fw-semibold"
          >
            Usuario
          </label>

          <div class="col-md-9">
            <select
              v-model="usuarioSeleccionado"
              class="form-select form-select-sm"
            >
              <option value="" disabled>
                Selecciona un usuario
              </option>

              <option
                v-for="usuario in usuarios"
                :key="usuario.id"
                :value="usuario.id"
              >
                {{ usuario.name }}
              </option>
            </select>
          </div>
        </div>

        <hr class="my-3" />

        <!-- PERMISOS DEL ROL -->
        <div class="permisos-section">
          <div class="permisos-title">
            <h5>Permisos por Módulo</h5>

            <p>
              Selecciona las acciones permitidas para este rol
            </p>
          </div>

          <div class="permisos-grid">
            <div
              v-for="permiso in permisos"
              :key="permiso.id"
              class="permiso-card"
            >
              <div class="permiso-header">
                {{ permiso.nombre }}
              </div>

              <div class="permiso-checks">
                <label
                  v-for="accion in [
                    'crear',
                    'listar',
                    'actualizar',
                    'eliminar'
                  ]"
                  :key="accion"
                  class="permiso-check-item"
                >
                  <input
                    v-model="permiso[accion]"
                    type="checkbox"
                    :id="
                      'permiso-' +
                      permiso.id +
                      '-' +
                      accion
                    "
                  />

                  <span>
                    {{
                      accion.charAt(0).toUpperCase() +
                      accion.slice(1)
                    }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-2">
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
                ? permisosAcceso.actualizar
                : permisosAcceso.crear
            "
            type="button"
            class="btn btn-primary"
            @click="saveRol"
          >
            {{ editingId ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>
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
import { useDataTable } from '@/composables/useDataTable.js';

export default {
  name: 'RolesView',

  components: {
    Header,
    Sidebar,
    BaseModal
  },

  setup() {
    const sidebarOpen = ref(false);
    const roles = ref([]);

    /*
     * Lista de módulos que se asignan al rol.
     */
    const permisos = ref([]);

    /*
     * Permisos del usuario conectado para el módulo roles.
     */
    const permisosAcceso = ref({
      listar: false,
      crear: false,
      actualizar: false,
      eliminar: false
    });

    const usuarios = ref([]);
    const rolNombre = ref('');
    const rolDescripcion = ref('');
    const usuarioSeleccionado = ref('');
    const modalVisible = ref(false);
    const modalTitle = ref('');
    const editingId = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const {
      tableRef,
      initDataTable
    } = useDataTable(roles);

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
    | Permisos de acceso al módulo roles
    |--------------------------------------------------------------------------
    */
    const fetchPermisosAcceso = async () => {
      try {
        const respuesta =
          await obtenerPermisosPorModulo('roles');

        permisosAcceso.value = {
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
        permisosAcceso.value = {
          listar: false,
          crear: false,
          actualizar: false,
          eliminar: false
        };

        error.value =
          'No fue posible cargar los permisos de roles.';
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar roles, módulos y usuarios
    |--------------------------------------------------------------------------
    */
    const fetchData = async () => {
      if (!permisosAcceso.value.listar) {
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const [
          rolesRes,
          permisosRes,
          usuariosRes
        ] = await Promise.all([
          api.get('/roles'),
          api.get('/getmodulos'),
          api.get('/getuser')
        ]);

        roles.value = rolesRes.data || [];
        permisos.value = permisosRes.data || [];
        usuarios.value = usuariosRes.data || [];

        await nextTick();
        initDataTable();
      } catch (e) {
        error.value =
          'Error al cargar los datos: ' +
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
      if (!permisosAcceso.value.crear) {
        error.value =
          'No tienes permiso para crear roles.';
        return;
      }

      modalTitle.value = 'Nuevo Rol';
      rolNombre.value = '';
      rolDescripcion.value = '';
      usuarioSeleccionado.value = '';

      permisos.value.forEach((permiso) => {
        permiso.crear = false;
        permiso.listar = false;
        permiso.actualizar = false;
        permiso.eliminar = false;
      });

      editingId.value = null;
      modalVisible.value = true;
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir modal para editar
    |--------------------------------------------------------------------------
    */
    const openEditModal = async (rol) => {
      if (!permisosAcceso.value.actualizar) {
        error.value =
          'No tienes permiso para actualizar roles.';
        return;
      }

      modalTitle.value = 'Editar Rol';
      editingId.value = rol.id;

      try {
        const response = await api.get(
          `/roles/${rol.id}`
        );

        const rolData = response.data[0];

        rolNombre.value = rolData.nombre;
        rolDescripcion.value =
          rolData.descripcion || '';

        usuarioSeleccionado.value =
          rolData.users.length > 0
            ? rolData.users[0].id
            : '';

        permisos.value.forEach((modulo) => {
          const permisoRol =
            rolData.permisos.find((permiso) => {
              return permiso.modulo_id === modulo.id;
            });

          modulo.crear = permisoActivo(
            permisoRol?.crear
          );

          modulo.listar = permisoActivo(
            permisoRol?.listar
          );

          modulo.actualizar = permisoActivo(
            permisoRol?.actualizar
          );

          modulo.eliminar = permisoActivo(
            permisoRol?.eliminar
          );
        });

        modalVisible.value = true;
      } catch (e) {
        error.value =
          'Error al cargar el rol: ' +
          (e.response?.data?.message || e.message);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar o actualizar rol
    |--------------------------------------------------------------------------
    */
    const saveRol = async () => {
      if (
        editingId.value &&
        !permisosAcceso.value.actualizar
      ) {
        error.value =
          'No tienes permiso para actualizar roles.';
        return;
      }

      if (
        !editingId.value &&
        !permisosAcceso.value.crear
      ) {
        error.value =
          'No tienes permiso para crear roles.';
        return;
      }

      if (!rolNombre.value.trim()) {
        error.value =
          'El nombre del rol es obligatorio.';
        return;
      }

      const payload = {
        nombre: rolNombre.value.trim(),
        descripcion: rolDescripcion.value.trim(),
        user_id: usuarioSeleccionado.value,
        permisos: permisos.value.map((permiso) => ({
          modulo: permiso.nombre,
          crear: permiso.crear ? 1 : 0,
          listar: permiso.listar ? 1 : 0,
          actualizar: permiso.actualizar ? 1 : 0,
          eliminar: permiso.eliminar ? 1 : 0
        }))
      };

      try {
        if (editingId.value) {
          await api.put(
            `/roles/${editingId.value}`,
            payload
          );
        } else {
          await api.post('/roles', payload);
        }

        modalVisible.value = false;
        await fetchData();
      } catch (e) {
        error.value =
          'Error al guardar el rol: ' +
          (e.response?.data?.message || e.message);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar rol
    |--------------------------------------------------------------------------
    */
    const deleteRol = async (id) => {
      if (!permisosAcceso.value.eliminar) {
        error.value =
          'No tienes permiso para eliminar roles.';
        return;
      }

      const confirmado = window.confirm(
        '¿Seguro que deseas eliminar este rol?'
      );

      if (!confirmado) {
        return;
      }

      try {
        await api.delete(`/roles/${id}`);
        await fetchData();
      } catch (e) {
        error.value =
          'Error al eliminar el rol: ' +
          (e.response?.data?.message || e.message);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Inicialización
    |--------------------------------------------------------------------------
    */
    onMounted(async () => {
      loading.value = true;

      await fetchPermisosAcceso();

      loading.value = false;

      if (permisosAcceso.value.listar) {
        await fetchData();
      }
    });

    return {
      sidebarOpen,
      roles,
      permisos,
      permisosAcceso,
      usuarios,
      modalTitle,
      rolNombre,
      rolDescripcion,
      usuarioSeleccionado,
      modalVisible,
      editingId,
      loading,
      error,
      tableRef,
      openAddModal,
      openEditModal,
      saveRol,
      deleteRol
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

.roles-container{
    width:100%;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #edf0f5;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
}

/* HEADER */

.roles-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.roles-header h2{
    margin:0;
    font-size:24px;
    font-weight:700;
    color:#111827;
}

.roles-header p{
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
    transition:.2s;
}

.btn-nuevo:hover{
    opacity:.9;
}

/* CONTENIDO */

.roles-content{
    padding:20px;
}

/* TABLA */

.roles-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.roles-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
}

.roles-table tbody tr{
    background:#f8fafc;
}

.roles-table td{
    padding:18px 20px;
    vertical-align:middle;
}

.roles-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.roles-table tbody tr td:last-child{
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

    .roles-header{
        flex-direction:column;
        align-items:flex-start;
        gap:15px;
    }

    .btn-nuevo{
        width:100%;
    }

}
.permisos-section{
    margin-top:20px;
}

.permisos-title{
    margin-bottom:18px;
}

.permisos-title h5{
    margin:0;
    font-size:17px;
    font-weight:700;
    color:#111827;
}

.permisos-title p{
    margin:5px 0 0;
    font-size:13px;
    color:#6b7280;
}

.permisos-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:16px;
}

.permiso-card{
    background:#f8fafc;
    border:1px solid #edf0f5;
    border-radius:18px;
    padding:18px;
}

.permiso-header{
    font-weight:700;
    color:#111827;
    margin-bottom:14px;
}

.permiso-checks{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
}

.permiso-check-item{
    display:flex;
    align-items:center;
    gap:8px;
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:12px;
    padding:10px;
    font-size:13px;
    color:#374151;
    cursor:pointer;
}

.permiso-check-item input{
    width:16px;
    height:16px;
    accent-color:#2563eb;
}

</style>