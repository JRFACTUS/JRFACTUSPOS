<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid p-4">

    <!-- Loader -->
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show">
        {{ error }}
        <button
            type="button"
            class="btn-close"
            @click="error = null"
        ></button>
    </div>

    <div v-if="!loading" class="roles-container">

        <div class="roles-header">

            <div>
                <h2>Gestión de Roles y Permisos</h2>
                <p>Listado general de roles registrados</p>
            </div>

            <button
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
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="(rol,index) in roles"
                            :key="rol.id"
                        >
                            <td>{{ index + 1 }}</td>

                            <td>{{ rol.nombre }}</td>

                            <td>{{ rol.descripcion }}</td>

                            <td>{{ rol.usuario?.name || '—' }}</td>

                            <td>

                                <button
                                    class="btn btn-sm btn-warning me-2"
                                    @click="openEditModal(rol)"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-danger"
                                    @click="deleteRol(rol.id)"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </td>
                        </tr>

                        <tr v-if="roles.length === 0">
                            <td
                                colspan="5"
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

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- 🔹 BaseModal -->
    <BaseModal v-model:visible="modalVisible" :title="modalTitle" size="lg">
      <form class="container-fluid" style="max-height: 65vh; overflow-y: auto; padding-right: 10px;">
        <!-- Nombre del Rol -->
        <div class="row mb-2">
          <label class="col-md-3 col-form-label fw-semibold">Nombre</label>
          <div class="col-md-9">
            <input type="text" class="form-control form-control-sm" placeholder="Ej. Administrador" v-model="rolNombre" />
          </div>
        </div>

        <!-- Descripción -->
        <div class="row mb-2">
          <label class="col-md-3 col-form-label fw-semibold">Descripción</label>
          <div class="col-md-9">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Descripción del rol" v-model="rolDescripcion"></textarea>
          </div>
        </div>

        <!-- Asignar Usuario -->
        <div class="row mb-3">
          <label class="col-md-3 col-form-label fw-semibold">Usuario</label>
          <div class="col-md-9">
            <select class="form-select form-select-sm" v-model="usuarioSeleccionado">
              <option value="" disabled>Selecciona un usuario</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
          </div>
        </div>

        <hr class="my-3">

        <!-- Permisos -->
       <!-- Permisos -->
<div class="permisos-section">

    <div class="permisos-title">
        <h5>Permisos por Módulo</h5>
        <p>Selecciona las acciones permitidas para este rol</p>
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
                    v-for="accion in ['crear','listar','actualizar','eliminar']"
                    :key="accion"
                    class="permiso-check-item"
                >
                    <input
                        type="checkbox"
                        :id="'permiso-' + permiso.id + '-' + accion"
                        v-model="permiso[accion]"
                    />

                    <span>
                        {{ accion.charAt(0).toUpperCase() + accion.slice(1) }}
                    </span>
                </label>

            </div>

        </div>

    </div>

</div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveRol">
            {{ editingId ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import BaseModal from "@/components/BaseModal.vue";
import { useDataTable } from "@/composables/useDataTable.js";

export default {
  name: "RolesView",
  components: { Header, Sidebar, BaseModal },

  setup() {
    const sidebarOpen = ref(false);
    const roles = ref([]);
    const permisos = ref([]);
    const usuarios = ref([]);

    const rolNombre = ref("");
    const rolDescripcion = ref("");
    const usuarioSeleccionado = ref("");
    const permisosSeleccionados = ref([]);

    const modalVisible = ref(false);
    const modalTitle = ref("");
    const editingId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const { tableRef, initDataTable } = useDataTable(roles);

    // 🔹 Cargar datos
    const fetchData = async () => {
      loading.value = true;
      try {
        const [rolesRes, permisosRes, usuariosRes] = await Promise.all([
          api.get("/roles"),
          api.get("/getmodulos"),
          api.get("/getuser"),
        ]);
        roles.value = rolesRes.data || [];
        permisos.value = permisosRes.data || [];
        usuarios.value = usuariosRes.data || [];
        await nextTick();
        initDataTable();
      } catch (e) {
        error.value = "Error al cargar los datos: " + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchData);

    // 🔹 Abrir modal nuevo
    const openAddModal = () => {
      modalTitle.value = "Nuevo Rol";
      rolNombre.value = "";
      rolDescripcion.value = "";
      usuarioSeleccionado.value = "";
      permisos.value.forEach(p => { p.crear=false; p.listar=false; p.actualizar=false; p.eliminar=false; });
      editingId.value = null;
      modalVisible.value = true;
    };

    // 🔹 Abrir modal editar
    const openEditModal = async (rol) => {
      modalTitle.value = "Editar Rol";
      editingId.value = rol.id;

      try {
        const response = await api.get(`/roles/${rol.id}`);
        const rolData = response.data[0];

        rolNombre.value = rolData.nombre;
        rolDescripcion.value = rolData.descripcion;
        usuarioSeleccionado.value = rolData.users.length > 0 ? rolData.users[0].id : "";

        permisos.value.forEach(mod => {
          const permisoRol = rolData.permisos.find(p => p.modulo_id === mod.id);
          mod.crear = permisoRol?.crear === 1;
          mod.listar = permisoRol?.listar === 1;
          mod.actualizar = permisoRol?.actualizar === 1;
          mod.eliminar = permisoRol?.eliminar === 1;
        });

        modalVisible.value = true;
      } catch (e) {
        error.value = "Error al cargar el rol: " + (e.response?.data?.message || e.message);
      }
    };

    // 🔹 Guardar o actualizar rol
    const saveRol = async () => {
      if (!rolNombre.value) {
        error.value = "El nombre del rol es obligatorio.";
        return;
      }

      const payload = {
        nombre: rolNombre.value,
        descripcion: rolDescripcion.value,
        user_id: usuarioSeleccionado.value,
        permisos: permisos.value.map(p => ({
          modulo: p.nombre,
          crear: p.crear ? 1 : 0,
          listar: p.listar ? 1 : 0,
          actualizar: p.actualizar ? 1 : 0,
          eliminar: p.eliminar ? 1 : 0,
        })),
      };

      try {
        if (editingId.value) {
          await api.put(`/roles/${editingId.value}`, payload);
        } else {
          await api.post("/roles", payload);
        }
        modalVisible.value = false;
        await fetchData();
      } catch (e) {
        error.value = "Error al guardar el rol: " + (e.response?.data?.message || e.message);
      }
    };

    // 🔹 Eliminar rol
    const deleteRol = async (id) => {
      if (!confirm("¿Seguro que deseas eliminar este rol?")) return;
      try {
        await api.delete(`/roles/${id}`);
        await fetchData();
      } catch (e) {
        error.value = "Error al eliminar el rol: " + (e.response?.data?.message || e.message);
      }
    };

    return {
      sidebarOpen,
      roles,
      permisos,
      usuarios,
      modalTitle,
      rolNombre,
      rolDescripcion,
      usuarioSeleccionado,
      permisosSeleccionados,
      modalVisible,
      editingId,
      loading,
      error,
      tableRef,
      openAddModal,
      openEditModal,
      saveRol,
      deleteRol,
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