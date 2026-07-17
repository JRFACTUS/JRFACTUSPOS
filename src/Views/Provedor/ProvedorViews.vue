<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

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

    <div
        v-if="!loading && permisos.listar"
        class="proveedores-container"
    >

        <div class="proveedores-header">

            <div>
                <h2>Gestión de Proveedores</h2>
                <p>Listado general de proveedores registrados</p>
            </div>

            <button
                v-if="permisos.crear"
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
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="(prov,index) in Proveedores"
                            :key="prov.id"
                        >
                            <td>{{ index + 1 }}</td>
                            <td>{{ prov.nombre }}</td>
                            <td>{{ prov.rfc }}</td>
                            <td>{{ prov.telefono }}</td>
                            <td>{{ prov.email }}</td>
                            <td>{{ prov.direccion }}</td>

                            <td>

                                <button
                                    v-if="permisos.actualizar"
                                    class="btn btn-sm btn-warning me-2"
                                    @click="openEditModal(prov)"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    v-if="permisos.eliminar"
                                    class="btn btn-sm btn-danger"
                                    @click="deleteProveedor(prov.id)"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </td>
                        </tr>

                        <tr v-if="Proveedores.length === 0">
                            <td
                                colspan="7"
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

    

</main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- 🧩 Modal de Crear/Editar -->
    <BaseModal v-model:visible="modalVisible" :title="modalTitle">
      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" placeholder="Nombre del proveedor" v-model="ProveedorNombre" />
      </div>

      <div class="mb-3">
        <label class="form-label">RFC</label>
        <input type="text" class="form-control" placeholder="RFC" v-model="ProveedorRFC" />
      </div>

      <div class="mb-3">
        <label class="form-label">Teléfono</label>
        <input type="text" class="form-control" placeholder="Teléfono" v-model="ProveedorTelefono" />
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" placeholder="Correo electrónico" v-model="ProveedorEmail" />
      </div>

      <div class="mb-3">
        <label class="form-label">Dirección</label>
        <input type="text" class="form-control" placeholder="Dirección" v-model="ProveedorDireccion" />
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
        <!-- Guardar solo si tiene permiso crear o actualizar -->
        <button class="btn btn-primary" @click="saveProveedor" v-if="permisos.crear || permisos.actualizar">
          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

    <!-- 🧩 Modal de Confirmación -->
    <ConfirmModal v-model:visible="confirmModalVisible" :message="confirmMessage" @confirmed="onConfirmDelete" />
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import api, { obtenerPermisosPorModulo } from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';

export default {
  name: 'ProveedoresViews',
  components: { Header, Sidebar, BaseModal, ConfirmModal },

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

    const permisos = ref({}); // 🔹 Permisos del módulo

    const { tableRef, initDataTable } = useDataTable(Proveedores);

    // 🔹 Obtener permisos
    const fetchPermisos = async () => {
      permisos.value = await obtenerPermisosPorModulo('provedores');
    };

    // 🔹 Cargar proveedores
    const fetchProveedores = async () => {
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get('/provedores');
        Proveedores.value = res.data.data || [];
        await nextTick();
        initDataTable();
      } catch (e) {
        error.value = 'Error al cargar proveedores: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    // 🔹 Modal agregar
    const openAddModal = () => {
      modalTitle.value = 'Nuevo Proveedor';
      ProveedorNombre.value = '';
      ProveedorRFC.value = '';
      ProveedorTelefono.value = '';
      ProveedorEmail.value = '';
      ProveedorDireccion.value = '';
      editingId.value = null;
      modalVisible.value = true;
    };

    // 🔹 Modal editar
    const openEditModal = (prov) => {
      modalTitle.value = 'Editar Proveedor';
      ProveedorNombre.value = prov.nombre;
      ProveedorRFC.value = prov.rfc;
      ProveedorTelefono.value = prov.telefono;
      ProveedorEmail.value = prov.email;
      ProveedorDireccion.value = prov.direccion;
      editingId.value = prov.id;
      modalVisible.value = true;
    };

    // 🔹 Guardar proveedor
    const saveProveedor = async () => {
      if (!ProveedorNombre.value || !ProveedorRFC.value) return;

      loading.value = true;
      error.value = null;
      try {
        const payload = {
          nombre: ProveedorNombre.value.trim(),
          rfc: ProveedorRFC.value.trim(),
          telefono: ProveedorTelefono.value.trim(),
          email: ProveedorEmail.value.trim(),
          direccion: ProveedorDireccion.value.trim(),
        };

        if (editingId.value) {
          await api.put(`/provedores/${editingId.value}`, payload);
        } else {
          await api.post('/provedores', payload);
        }
        await fetchProveedores();
        modalVisible.value = false;
      } catch (e) {
        error.value = 'Error al guardar proveedor: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    // 🔹 Eliminar proveedor
    const deleteProveedor = (id) => {
      deletingId.value = id;
      confirmMessage.value = '¿Seguro que deseas eliminar este proveedor?';
      confirmModalVisible.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deletingId.value) return;

      loading.value = true;
      error.value = null;
      try {
        await api.delete(`/provedores/${deletingId.value}`);
        await fetchProveedores();
      } catch (e) {
        error.value = 'Error al eliminar proveedor: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
        deletingId.value = null;
      }
    };

    onMounted(async () => {
      await fetchPermisos();
      await fetchProveedores();
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
      onConfirmDelete,
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
