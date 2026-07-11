<!-- src/Views/Usuarios/UsuariosViews.vue -->
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

    <div v-if="!loading" class="usuarios-container">

        <div class="usuarios-header">

            <div>
                <h2>Gestión de Usuarios</h2>
                <p>Listado general de usuarios registrados</p>
            </div>

            <button
                class="btn-nuevo"
                @click="openAddModal"
            >
                Nuevo Usuario
            </button>

        </div>

        <div class="usuarios-content">

            <div class="table-responsive">

                <table
                    ref="tableRef"
                    class="usuarios-table"
                >

                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="(usuario,index) in usuarios"
                            :key="usuario.id"
                        >
                            <td>{{ index + 1 }}</td>

                            <td>{{ usuario.name }}</td>

                            <td>{{ usuario.telefono }}</td>

                            <td>{{ usuario.direccion }}</td>

                            <td>{{ usuario.email }}</td>

                            <td>

                                <button
                                    class="btn btn-sm btn-warning me-2"
                                    @click="openEditModal(usuario)"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-danger"
                                    @click="deleteUsuario(usuario.id)"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </td>
                        </tr>

                        <tr v-if="usuarios.length === 0">
                            <td
                                colspan="6"
                                class="text-center text-muted py-5"
                            >
                                No hay usuarios registrados
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

        <!-- 🧩 Modal Crear/Editar Usuario -->
        <!-- 🧩 Modal Crear/Editar Usuario -->
        <BaseModal v-model:visible="modalVisible" :title="modalTitle">
            <form class="container-fluid">
                <div class="row mb-3">
                    <label class="col-md-3 col-form-label fw-semibold">Nombre</label>
                    <div class="col-md-9">
                        <input type="text" class="form-control" placeholder="Nombre completo" v-model="usuarioNombre" />
                    </div>
                </div>

               

                <div class="row mb-3">
                    <label class="col-md-3 col-form-label fw-semibold">Teléfono</label>
                    <div class="col-md-9">
                        <input type="text" class="form-control" placeholder="Teléfono" v-model="usuarioTelefono" />
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-md-3 col-form-label fw-semibold">Dirección</label>
                    <div class="col-md-9">
                        <input type="text" class="form-control" placeholder="Dirección" v-model="usuarioDireccion" />
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-md-3 col-form-label fw-semibold">Email</label>
                    <div class="col-md-9">
                        <input type="email" class="form-control" placeholder="Correo electrónico"
                            v-model="usuarioEmail" />
                    </div>
                </div>

                <!-- 🔒 Campo de contraseña (solo al crear nuevo usuario) -->
                <div class="row mb-3" v-if="!editingId">
                    <label class="col-md-3 col-form-label fw-semibold">Contraseña</label>
                    <div class="col-md-9">
                        <input type="password" class="form-control" placeholder="Contraseña"
                            v-model="usuarioPassword" />
                    </div>
                </div>
            </form>

            <template #footer>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
                    <button class="btn btn-primary" @click="saveUsuario">
                        {{ editingId ? 'Actualizar' : 'Guardar' }}
                    </button>
                </div>
            </template>
        </BaseModal>



        <ConfirmModal v-model:visible="confirmModalVisible" :message="confirmMessage" @confirmed="onConfirmDelete" />
    </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import api from '@/services/api.js';
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';

export default {
    name: 'UsuariosViews',
    components: { Header, Sidebar, BaseModal, ConfirmModal },

    setup() {
        const sidebarOpen = ref(false);
        const usuarios = ref([]);
        const loading = ref(false);
        const error = ref(null);

        // Campos del formulario
        const modalVisible = ref(false);
        const modalTitle = ref('');
        const usuarioNombre = ref('');
        const usuarioTelefono = ref('');
        const usuarioDireccion = ref('');
        const usuarioEmail = ref('');
        const usuarioPassword = ref(''); // 🔒 contraseña
        const editingId = ref(null);

        const confirmModalVisible = ref(false);
        const confirmMessage = ref('');
        const deletingId = ref(null);

        const { tableRef, initDataTable } = useDataTable(usuarios);

        // 🔹 Cargar usuarios
        const fetchUsuarios = async () => {
            loading.value = true;
            error.value = null;
            try {
                const res = await api.get('/getusuarios');
                usuarios.value = res.data || [];
                await nextTick();
                initDataTable();
            } catch (e) {
                error.value = 'Error al cargar los usuarios: ' + (e.response?.data?.message || e.message);
            } finally {
                loading.value = false;
            }
        };

        // 🔹 Abrir modal nuevo
        const openAddModal = () => {
            modalTitle.value = 'Nuevo Usuario';
            usuarioNombre.value = '';
           
            usuarioTelefono.value = '';
            usuarioDireccion.value = '';
            usuarioEmail.value = '';
            usuarioPassword.value = '';
            editingId.value = null;
            modalVisible.value = true;
        };

        // 🔹 Abrir modal edición
        const openEditModal = (usuario) => {
            modalTitle.value = 'Editar Usuario';
            usuarioNombre.value = usuario.name || '';
          
            usuarioTelefono.value = usuario.telefono || '';
            usuarioDireccion.value = usuario.direccion || '';
            usuarioEmail.value = usuario.email || '';
            usuarioPassword.value = ''; // no mostrar contraseña existente
            editingId.value = usuario.id;
            modalVisible.value = true;
        };

        // 🔹 Guardar / actualizar usuario
        const saveUsuario = async () => {
            const nuevoUsuario = {
                name: usuarioNombre.value.trim(),
                telefono: usuarioTelefono.value.trim(),
                direccion: usuarioDireccion.value.trim(),
                email: usuarioEmail.value.trim(),
            };

            if (!nuevoUsuario.name || !nuevoUsuario.email) {
                error.value = 'Nombre y correo son obligatorios.';
                return;
            }

            try {
                if (editingId.value) {
                    // 🔄 Actualizar usuario (incluye contraseña si se ingresó una nueva)
                    if (usuarioPassword.value.trim()) {
                        nuevoUsuario.password = usuarioPassword.value.trim();
                    }
                    await api.put(`/usuarios/${editingId.value}`, nuevoUsuario);
                } else {
                    // 🆕 Crear nuevo usuario (contraseña obligatoria)
                    if (!usuarioPassword.value.trim()) {
                        error.value = 'La contraseña es obligatoria para un nuevo usuario.';
                        return;
                    }
                    nuevoUsuario.password = usuarioPassword.value.trim();
                    await api.post('/register', nuevoUsuario);
                }

                modalVisible.value = false;
                await fetchUsuarios();
            } catch (e) {
                error.value = 'Error al guardar el usuario: ' + (e.response?.data?.message || e.message);
            }
        };

        // 🔹 Eliminar usuario
        const deleteUsuario = (id) => {
            deletingId.value = id;
            confirmMessage.value = '¿Seguro que deseas eliminar este usuario?';
            confirmModalVisible.value = true;
        };

        const onConfirmDelete = async () => {
            try {
                await api.delete(`/eliminar/${deletingId.value}`);
                await fetchUsuarios();
            } catch (e) {
                error.value = 'Error al eliminar el usuario: ' + (e.response?.data?.message || e.message);
            } finally {
                confirmModalVisible.value = false;
            }
        };

        onMounted(fetchUsuarios);

        return {
            sidebarOpen,
            usuarios,
            loading,
            error,
            modalVisible,
            modalTitle,
            usuarioNombre,
            usuarioTelefono,
            usuarioDireccion,
            usuarioEmail,
            usuarioPassword,
            editingId,
            confirmModalVisible,
            confirmMessage,
            tableRef,
            openAddModal,
            openEditModal,
            saveUsuario,
            deleteUsuario,
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

.usuarios-container{
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
    border:1px solid #edf0f5;
}

/* HEADER */

.usuarios-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
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
}

.btn-nuevo{
    background:#2563eb;
    color:#fff;
    border:none;
    border-radius:14px;
    padding:12px 22px;
    font-weight:600;
}

/* CONTENIDO */

.usuarios-content{
    padding:20px;
}

/* TABLA */

.usuarios-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0 12px;
}

.usuarios-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
}

.usuarios-table tbody tr{
    background:#f8fafc;
}

.usuarios-table td{
    padding:18px 20px;
}

.usuarios-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.usuarios-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

/* BOTONES */

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
