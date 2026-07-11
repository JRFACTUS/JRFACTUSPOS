<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
        
        </div>

        <!-- Spinner mientras se cargan datos o permisos -->
        <div v-if="!permisos || loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
          <button type="button" class="btn-close" @click="error = null"></button>
        </div>

        <!-- Tabla de categorías -->
       <div v-if="!loading && permisos?.listar" class="categoria-container">

  <div class="categoria-header">
    <div>
      <h2>Gestión de Categorías</h2>
      <p>Listado general de categorías registradas</p>
    </div>

    <button
      v-if="permisos?.crear"
      class="btn-nueva"
      @click="openAddModal"
    >
      <i class="bi bi-plus-lg"></i>
      Nueva Categoría
    </button>
  </div>

  <div class="categoria-content">

    <table
      ref="tableRef"
      class="categoria-table"
    >
      <thead>
        <tr>
          <th>#</th>
          <th>Categoría</th>
          <th>Fecha</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>

        <tr
          v-for="(categoria,index) in categorias"
          :key="categoria.id"
        >
          <td>
            <div class="categoria-id">
              {{ index + 1 }}
            </div>
          </td>

          <td>

            <div class="categoria-info">

             

              <div>
                <div class="categoria-name">
                  {{ categoria.nombre_categoria }}
                </div>
              </div>

            </div>

          </td>

          <td>
            {{ formatDate(categoria.updated_at) }}
          </td>

          <td>

            <div class="acciones">

              <button
                v-if="permisos.actualizar"
                class="btn-action btn-edit"
                @click="openEditModal(categoria)"
              >
                <i class="bi bi-pencil"></i>
              </button>

              <button
                v-if="permisos.eliminar"
                class="btn-action btn-delete"
                @click="deleteCategory(categoria.id)"
              >
                <i class="bi bi-trash"></i>
              </button>

            </div>

          </td>

        </tr>

        <tr v-if="categorias.length === 0">
          <td colspan="4">

            <div class="empty-state">

              <i class="bi bi-folder-x"></i>

              <h5>No hay categorías</h5>

              <span>
                No existen registros para mostrar.
              </span>

            </div>

          </td>
        </tr>

      </tbody>

    </table>

  </div>

</div>

        <!-- Mensaje si NO tiene permiso de listar -->
        <div v-if="!loading && permisos && !permisos.listar" class="alert alert-warning text-center">
          No tienes permiso para ver las categorías.
        </div>
      </main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- Modal Crear/Editar -->
    <BaseModal v-model:visible="modalVisible" :title="modalTitle">
      <div class="mb-3">
        <label class="form-label">Nombre de la categoría</label>
        <input type="text" class="form-control" placeholder="Ingrese nombre" v-model="categoryName" />
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
        <button class="btn btn-primary" @click="saveCategory" v-if="permisos?.crear || permisos?.actualizar">
          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal de Confirmación -->
    <ConfirmModal
      v-model:visible="confirmModalVisible"
      :message="confirmMessage"
      @confirmed="onConfirmDelete"
    />
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
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CategoriaViews',
  components: { Header, Sidebar, BaseModal, ConfirmModal },
  setup() {
    const sidebarOpen = ref(false);
    const categorias = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const modalVisible = ref(false);
    const modalTitle = ref('');
    const categoryName = ref('');
    let editingId = null;

    const confirmModalVisible = ref(false);
    const confirmMessage = ref('');
    let deletingId = null;

    const permisos = ref(null); // null = aún no cargado

    const { tableRef, initDataTable } = useDataTable(categorias);
    const { formatDate } = useFormatters();

    // 🔹 Cargar permisos del módulo Categoría
    const fetchPermisos = async () => {
      try {
        permisos.value = await obtenerPermisosPorModulo('categoria');
      } catch {
        permisos.value = {};
      }
    };

    // 🔹 Cargar categorías
    const fetchCategorias = async () => {
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get('/getCategoria');
        categorias.value = res.data || [];
        if (categorias.value.length > 0) {
          await nextTick();
          initDataTable();
        }
      } catch (e) {
        error.value = 'Error al cargar las categorías: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    const openAddModal = () => {
      modalTitle.value = 'Nueva Categoría';
      categoryName.value = '';
      editingId = null;
      modalVisible.value = true;
    };

    const openEditModal = (categoria) => {
      modalTitle.value = 'Editar Categoría';
      categoryName.value = categoria.nombre_categoria;
      editingId = categoria.id;
      modalVisible.value = true;
    };

    const saveCategory = async () => {
      if (!categoryName.value.trim()) return;
      loading.value = true;
      error.value = null;
      try {
        if (editingId) {
          await api.put(`/categoria/${editingId}`, { nombre_categoria: categoryName.value.trim() });
        } else {
          await api.post('/categoria', { nombre_categoria: categoryName.value.trim() });
        }
        await fetchCategorias();
        modalVisible.value = false;
      } catch (e) {
        error.value = 'Error al guardar la categoría: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    const deleteCategory = (id) => {
      deletingId = id;
      confirmMessage.value = '¿Seguro de eliminar esta categoría?';
      confirmModalVisible.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deletingId) return;
      loading.value = true;
      error.value = null;
      try {
        await api.delete(`/categoria/${deletingId}`);
        await fetchCategorias();
      } catch (e) {
        error.value = 'Error al eliminar la categoría: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
        deletingId = null;
      }
    };

    onMounted(async () => {
      await fetchPermisos();  // primero permisos
      if (permisos.value?.listar) {
        await fetchCategorias();  // luego categorías
      }
    });

    return {
      sidebarOpen,
      categorias,
      loading,
      error,
      modalVisible,
      modalTitle,
      categoryName,
      editingId,
      tableRef,
      formatDate,
      permisos,
      confirmModalVisible,
      confirmMessage,
      openAddModal,
      openEditModal,
      saveCategory,
      deleteCategory,
      onConfirmDelete,
    };
  },
};
</script>


<style scoped>
.main-content{
  flex:1;
  margin-top:60px;
}

@media (min-width:992px){
  .main-content{
    margin-left:250px;
  }
}

main{
  min-height:calc(100vh - 60px);
}

/* CONTENEDOR */

.categoria-container{
  background:#ffffff;
  border-radius:24px;
  overflow:hidden;
  box-shadow:0 15px 40px rgba(0,0,0,.05);
  border:1px solid #edf0f5;
}

.categoria-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:28px;
  border-bottom:1px solid #edf0f5;
}

.categoria-header h2{
  font-size:24px;
  font-weight:700;
  margin:0;
}

.categoria-header p{
  margin:5px 0 0;
  color:#6b7280;
}

.btn-nueva{
  border:none;
  background:#2563eb;
  color:white;
  padding:12px 20px;
  border-radius:14px;
  font-weight:600;
  display:flex;
  gap:10px;
  align-items:center;
}

.btn-nueva:hover{
  opacity:.9;
}

/* TABLA */

.categoria-content{
  padding:20px;
}

.categoria-table{
  width:100%;
  border-collapse:separate;
  border-spacing:0 12px;
}

.categoria-table thead th{
  color:#64748b;
  font-size:13px;
  font-weight:700;
  text-transform:uppercase;
  padding:0 20px 10px;
}

.categoria-table tbody tr{
  background:#f8fafc;
}

.categoria-table td{
  padding:18px 20px;
}

.categoria-table tbody tr td:first-child{
  border-radius:16px 0 0 16px;
}

.categoria-table tbody tr td:last-child{
  border-radius:0 16px 16px 0;
}

/* ID */

.categoria-id{
  width:38px;
  height:38px;
  background:white;
  border-radius:12px;
  display:flex;
  justify-content:center;
  align-items:center;
  font-weight:700;
}

/* INFO */

.categoria-info{
  display:flex;
  align-items:center;
  gap:15px;
}

.categoria-icon{
  width:50px;
  height:50px;
  border-radius:14px;
  background:#dbeafe;
  color:#2563eb;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:20px;
}

.categoria-name{
  font-weight:600;
  color:#111827;
}

/* BOTONES */

.acciones{
  display:flex;
  justify-content:center;
  gap:10px;
}

.btn-action{
  width:42px;
  height:42px;
  border:none;
  border-radius:12px;
  transition:.3s;
}

.btn-edit{
  background:#fef3c7;
  color:#d97706;
}

.btn-delete{
  background:#fee2e2;
  color:#dc2626;
}

.btn-action:hover{
  transform:translateY(-2px);
}

/* EMPTY */

.empty-state{
  padding:50px;
  text-align:center;
}

.empty-state i{
  font-size:60px;
  color:#cbd5e1;
}

.empty-state h5{
  margin-top:15px;
  font-weight:700;
}

.empty-state span{
  color:#64748b;
}

/* DATATABLE */

:deep(.dataTables_filter){
  margin-bottom:20px;
}

:deep(.dataTables_filter input){
  border-radius:12px;
}

:deep(.dataTables_paginate){
  margin-top:20px;
}
</style>
