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
        class="clientes-container"
    >

        <div class="clientes-header">

            <div>
                <h2>Gestión de Clientes</h2>
                <p>Listado general de clientes registrados</p>
            </div>

            <button
                v-if="permisos.crear"
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
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="(cliente,index) in clientes"
                            :key="cliente.id"
                        >
                            <td>{{ index + 1 }}</td>

                            <td>{{ cliente.rfc }}</td>

                            <td>{{ cliente.razon_social }}</td>

                            <td>
                                {{ cliente.nombre }}
                                {{ cliente.apellidos }}
                            </td>

                            <td>{{ cliente.email }}</td>

                            <td>{{ cliente.telefono }}</td>

                            <td>

                                <button
                                    v-if="permisos.actualizar"
                                    class="btn btn-sm btn-warning me-2"
                                    @click="openEditModal(cliente)"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    v-if="permisos.eliminar"
                                    class="btn btn-sm btn-danger"
                                    @click="deleteCliente(cliente.id)"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </td>
                        </tr>

                        <tr v-if="clientes.length === 0">
                            <td
                                colspan="7"
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

    

</main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- Modal Crear/Editar -->
    <BaseModal v-model:visible="modalVisible" :title="modalTitle">
      <div class="container-fluid">
        <div v-if="step === 1">
          <!-- Información general del cliente -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">RFC</label>
              <input type="text" class="form-control" v-model="clienteForm.rfc" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Razón Social</label>
              <input type="text" class="form-control" v-model="clienteForm.razon_social" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" v-model="clienteForm.nombre" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Apellidos</label>
              <input type="text" class="form-control" v-model="clienteForm.apellidos" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Email 1</label>
              <input type="email" class="form-control" v-model="clienteForm.email" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Email 2</label>
              <input type="email" class="form-control" v-model="clienteForm.email2" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Email 3</label>
              <input type="email" class="form-control" v-model="clienteForm.email3" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Teléfono</label>
              <input type="text" class="form-control" v-model="clienteForm.telefono" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Régimen Fiscal</label>
              <select class="form-control" v-model="clienteForm.regimen_fiscal_id">
                <option disabled value="">Seleccione régimen</option>
                <option v-for="item in regimenesFiscales" :key="item.id" :value="item.id">
                  {{ item.codigo }} - {{ item.descripcion }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Uso de CFDI</label>
            <select class="form-control" v-model="clienteForm.uso_cfdi_id">
              <option disabled value="">Seleccione uso de CFDI</option>
              <option v-for="item in usosCfdi" :key="item.id" :value="item.id">
                {{ item.usocfdi }} - {{ item.descripcion }}
              </option>
            </select>
          </div>
        </div>

        <!-- PASO 2: Datos Fiscales -->
        <div v-if="step === 2">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Calle</label>
              <input type="text" class="form-control" v-model="clienteForm.calle" />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Exterior</label>
              <input type="text" class="form-control" v-model="clienteForm.numero_exterior" />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Interior</label>
              <input type="text" class="form-control" v-model="clienteForm.numero_interior" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Colonia</label>
              <input type="text" class="form-control" v-model="clienteForm.colonia" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Ciudad</label>
              <input type="text" class="form-control" v-model="clienteForm.ciudad" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Estado</label>
              <input type="text" class="form-control" v-model="clienteForm.estado" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Delegación / Municipio</label>
              <input type="text" class="form-control" v-model="clienteForm.delegacion" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Código Postal</label>
              <input type="text" class="form-control" v-model="clienteForm.codigo_postal" />
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <template #footer>
        <div class="d-flex justify-content-between w-100">
          <button class="btn btn-secondary" v-if="step > 1" @click="prevStep">Atrás</button>
          <div class="ms-auto">
           <button class="btn btn-primary" v-if="step < 2" @click="nextStep">Siguiente</button>
<button
  class="btn btn-success"
  v-else-if="permisos.crear || permisos.actualizar"
  @click="saveCliente"
>
  Guardar
</button>

          </div>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Confirmación -->
    <ConfirmModal v-model:visible="confirmModalVisible" :message="confirmMessage" @confirmed="onConfirmDelete" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue';
import api, { obtenerPermisosPorModulo } from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';

export default {
  name: 'ClientesView',
  components: { Header, Sidebar, BaseModal, ConfirmModal },

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
      rfc: '', razon_social: '', nombre: '', apellidos: '',
      email: '', email2: '', email3: '', telefono: '',
      calle: '', numero_exterior: '', numero_interior: '',
      colonia: '', ciudad: '', estado: '', delegacion: '', codigo_postal: '',
      regimen_fiscal_id: '', uso_cfdi_id: ''
    });

    const confirmModalVisible = ref(false);
    const confirmMessage = ref('');
    const deletingId = ref(null);

    const permisos = ref({}); // 🔹 Permisos del módulo

    const { tableRef, initDataTable } = useDataTable(clientes);

    const fetchPermisos = async () => {
      permisos.value = await obtenerPermisosPorModulo('clientes');
    };

    const fetchClientes = async () => {
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get('/clientes');
        clientes.value = res.data.clientes || [];
        await nextTick();
        initDataTable();
      } catch (e) {
        error.value = 'Error al cargar los clientes: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    const fetchSatCatalogs = async () => {
      try {
        const res = await api.get('/sat');
        regimenesFiscales.value = res.data.regimenes_fiscales || [];
        usosCfdi.value = res.data.usos_cfdi || [];
      } catch (e) {
        console.error('Error al cargar catálogos SAT:', e);
      }
    };

    const openAddModal = async () => {
      modalTitle.value = 'Nuevo Cliente';
      Object.keys(clienteForm).forEach(key => (clienteForm[key] = ''));
      editingId.value = null;
      step.value = 1;
      await fetchSatCatalogs();
      modalVisible.value = true;
    };

    const openEditModal = async (cliente) => {
      Object.assign(clienteForm, cliente);
      editingId.value = cliente.id;
      modalTitle.value = 'Editar Cliente';
      step.value = 1;
      await fetchSatCatalogs();
      modalVisible.value = true;
    };

    const saveCliente = async () => {
      loading.value = true;
      error.value = null;
      try {
        if (editingId.value) {
          await api.put(`/clientes/${editingId.value}`, clienteForm);
        } else {
          await api.post('/clientes', clienteForm);
        }
        await fetchClientes();
        modalVisible.value = false;
      } catch (e) {
        error.value = 'Error al guardar el cliente: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
      }
    };

    const nextStep = () => step.value++;
    const prevStep = () => step.value--;

    const deleteCliente = (id) => {
      deletingId.value = id;
      confirmMessage.value = '¿Seguro que deseas eliminar este cliente?';
      confirmModalVisible.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deletingId.value) return;
      loading.value = true;
      error.value = null;
      try {
        await api.delete(`/clientes/${deletingId.value}`);
        await fetchClientes();
      } catch (e) {
        error.value = 'Error al eliminar el cliente: ' + (e.response?.data?.message || e.message);
      } finally {
        loading.value = false;
        deletingId.value = null;
      }
    };

    onMounted(async () => {
      await fetchPermisos(); // cargar permisos primero
      await fetchClientes();  // luego clientes
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
