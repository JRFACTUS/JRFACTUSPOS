<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Main content -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid p-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">Productos</h2>
          <button class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Producto
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Error -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
          <button type="button" class="btn-close" @click="error = null"></button>
        </div>

        <!-- Tabla de productos -->
        <div v-if="!loading" class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table ref="tableRef" class="table table-hover align-middle w-100">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Precio Unitario</th>
                    <th>Precio Compra</th>
                    <th>Ganancia</th>
                    <th>Stock</th>
                    <th>Activo</th>
                    <th>Categoría</th>
                    <th>Medida</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(producto, index) in Productos" :key="producto.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ producto.codigo_producto }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.precio_unitario }}</td>
                    <td>{{ producto.precio_compra }}</td>
                    <td>{{ producto.ganancia }}</td>
                    <td>{{ producto.stock }}</td>
                    <td>
                      <span :class="producto.activo ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ producto.activo ? 'Sí' : 'No' }}
                      </span>
                    </td>
                    <td>{{ producto.categoria?.nombre_categoria || '-' }}</td>
                    <td>{{ producto.medida?.unidad_sat || '-' }}</td>
                    <td>
                      <button class="btn btn-sm btn-warning me-2" @click="openEditModal(producto)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteProducto(producto.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="Productos.length === 0">
                    <td colspan="11" class="text-center text-muted">No hay productos registrados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Overlay sidebar móvil -->
    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- Modal Crear/Editar -->
    <BaseModal v-model:visible="modalVisible" :title="modalTitle">
      <div class="row g-3">
        <!-- Código -->
        <div class="col-md-4">
          <label class="form-label">Código</label>
          <input type="text" class="form-control" placeholder="Código" v-model="ProductoCodigo" />
        </div>

        <!-- Nombre -->
        <div class="col-md-4">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" placeholder="Nombre" v-model="ProductoNombre" />
        </div>

        <!-- Precio Unitario -->
        <div class="col-md-4">
          <label class="form-label">Precio Unitario</label>
          <input type="number" min="0" class="form-control" placeholder="Precio Unitario"
            v-model="ProductoPrecioUnitario" />
        </div>

        <!-- Precio Compra -->
        <div class="col-md-4">
          <label class="form-label">Precio Compra</label>
          <input type="number" min="0" class="form-control" placeholder="Precio Compra"
            v-model="ProductoPrecioCompra" />
        </div>

        <!-- Ganancia -->
        <div class="col-md-4">
          <label class="form-label">Ganancia</label>
          <input type="number" min="0" class="form-control" placeholder="Ganancia" v-model="ProductoGanancia" />
        </div>

        <!-- Stock -->
        <div class="col-md-4">
          <label class="form-label">Stock</label>
          <input type="number" min="0" class="form-control" placeholder="Stock" v-model="ProductoStock" />
        </div>

        <!-- Clave Producto/Servicio SAT -->
        <div class="col-md-4">
          <label class="form-label d-flex justify-content-between align-items-center">Clave PS</label>
          <input type="text" class="form-control" placeholder="Clave PS" v-model="ProductoClavePS" />
        </div>

        <!-- Clave Unidad SAT -->
        <div class="col-md-4">
          <label class="form-label d-flex justify-content-between align-items-center">Clave Unidad</label>
          <input type="text" class="form-control" placeholder="Clave Unidad" v-model="ProductoClaveUnidad" />
        </div>

        <!-- Activo -->
        <div class="col-md-4 d-flex align-items-center">
          <div class="form-check mt-4">
            <input type="checkbox" class="form-check-input" v-model="ProductoActivo" id="activoCheck">
            <label class="form-check-label" for="activoCheck">Activo</label>
          </div>
        </div>

        <!-- Categoría -->
        <div class="col-md-4">
          <label class="form-label">Categoría</label>
          <select class="form-select" v-model="ProductoCategoria">
            <option v-for="cat in Categorias" :key="cat.id" :value="cat.id">{{ cat.nombre_categoria }}</option>
          </select>
        </div>

        <!-- Medida -->
        <div class="col-md-4">
          <label class="form-label">Medida</label>
          <select class="form-select" v-model="ProductoMedida">
            <option v-for="med in Medidas" :key="med.id" :value="med.id">{{ med.nombre_largo }}</option>
          </select>
        </div>

        <!-- Objeto de Impuesto -->
        <div class="col-md-4">
          <label class="form-label">Objeto de Impuesto</label>
          <select class="form-select" v-model="ProductoObjetoId">
            <option v-for="obj in Objetos" :key="obj.id" :value="obj.id">
              {{ obj.clave_objeto }} - {{ obj.descripcion_objeto }}
            </option>
          </select>
        </div>

        <!-- Impuesto -->
        <div class="col-md-4">
          <label class="form-label">Impuesto</label>
          <select class="form-select" v-model="ProductoImpuestoId">
            <option v-for="imp in Impuestos" :key="imp.id" :value="imp.id">
              {{ imp.clave_impuesto }} - {{ imp.descripcion_impuesto }}
            </option>
          </select>
        </div>

        <!-- Tipo Factor -->
        <div class="col-md-4">
          <label class="form-label">Tipo Factor</label>
          <select class="form-select" v-model="ProductoTipoFactorId">
            <option v-for="tip in TiposFactor" :key="tip.id" :value="tip.id">
              {{ tip.clave_tipofactor }} - {{ tip.descripcion_tipofactor }}
            </option>
          </select>
        </div>
        <!-- Configuración de Impuesto -->
<!-- Configuración de Impuesto -->
<div class="col-md-4">
    <label class="form-label">Configuración de Impuesto</label>
    <select class="form-select" v-model="ProductoImpuestoConfiguracionId">
        <option value="">Seleccione una configuración</option>
        <option
            v-for="config in ImpuestoConfiguraciones"
            :key="config.id"
            :value="config.id"
        >
            {{ config.nombre }}
        </option>
    </select>
</div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
        <button class="btn btn-primary" @click="saveProducto">
          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>





    <!-- Modal Confirmación -->
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
  name: 'ProductosViews',
  components: { Header, Sidebar, BaseModal, ConfirmModal },

  setup() {
    const sidebarOpen = ref(false);
    const Productos = ref([]);
    const Medidas = ref([]);
    const Categorias = ref([]);
    const Objetos = ref([]); // ✅ Lista de objetos
    const Impuestos = ref([]);
    const TiposFactor = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const modalVisible = ref(false);
    const modalTitle = ref('');
    const ProductoCodigo = ref('');
    const ProductoNombre = ref('');
    const ProductoPrecioUnitario = ref(0);
    const ProductoPrecioCompra = ref(0);
    const ProductoGanancia = ref(0);
    const ProductoStock = ref(0);
    const ProductoActivo = ref(true);
    const ProductoCategoria = ref(null);
    const ProductoMedida = ref(null);
    const ProductoClavePS = ref('');
    const ProductoClaveUnidad = ref('');
    const ProductoObjetoId = ref(null); // ✅ nuevo campo objeto_id
    const ProductoImpuestoId = ref(null);
  const ProductoTipoFactorId = ref(null);
    const editingId = ref(null);
    const ProductoImpuestoConfiguracionId = ref("");

const ImpuestoConfiguraciones = ref([]);
    const confirmModalVisible = ref(false);
    const confirmMessage = ref('');
    const deletingId = ref(null);

    const { tableRef, initDataTable } = useDataTable(Productos);

    // =============================
    // 🔹 Fetch productos, medidas, categorías y objetos
    // =============================
    const fetchProductos = async () => {
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get('/productos');
        Productos.value = res.data.data || [];
        await nextTick();
        initDataTable();
      } catch (e) {
        error.value = 'Error al cargar productos: ' + (e.response?.data?.message || e.message);
        console.error(e);
      } finally {
        loading.value = false;
      }
    };
const cargarImpuestoConfiguraciones = async () => {
    const response = await api.get("/impuesto-configuraciones");
    ImpuestoConfiguraciones.value = response.data;
};
    const fetchMedidas = async () => {
      try {
        const res = await api.get('/getMedida');
        Medidas.value = res.data || [];
      } catch (e) {
        console.error('Error al cargar medidas:', e);
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await api.get('/getCategoria');
        Categorias.value = res.data || [];
      } catch (e) {
        console.error('Error al cargar categorías:', e);
      }
    };

    const fetchObjetos = async () => {
      try {
    const res = await api.get('/getexento');
    Objetos.value = res.data.objeto_impuesto || [];
    Impuestos.value = res.data.impuestos || [];
    TiposFactor.value = res.data.tipo_factor || [];
  } catch (e) {
    console.error('Error al cargar exentos:', e);
  }
    };

    // =============================
    // 🔹 Modal agregar/editar
    // =============================
    const openAddModal = () => {
      modalTitle.value = 'Nuevo Producto';
      ProductoCodigo.value = '';
      ProductoNombre.value = '';
      ProductoPrecioUnitario.value = 0;
      ProductoPrecioCompra.value = 0;
      ProductoGanancia.value = 0;
      ProductoStock.value = 0;
      ProductoActivo.value = true;
      ProductoCategoria.value = null;
      ProductoMedida.value = null;
      ProductoClavePS.value = '';
      ProductoClaveUnidad.value = '';
      ProductoObjetoId.value = null; // reset objeto_id
      ProductoImpuestoId.value = null;
      ProductoTipoFactorId.value = null;
      editingId.value = null;
      modalVisible.value = true;
    };
const openEditModal = async (producto) => {
  try {
    // Traer el producto
    const res = await api.get(`/productos/${producto.id}`);
    const p = res.data;

    // Traer listas si no están cargadas
    await Promise.all([
      Medidas.value.length ? null : fetchMedidas(),
      Categorias.value.length ? null : fetchCategorias(),
      Objetos.value.length || Impuestos.value.length || TiposFactor.value.length ? null : fetchObjetos(),
        ImpuestoConfiguraciones.value.length ? null : cargarImpuestoConfiguraciones()

    ]);

    // Asignar datos del producto al modal
    ProductoCodigo.value = p.codigo_producto;
    ProductoNombre.value = p.nombre;
    ProductoPrecioUnitario.value = p.precio_unitario;
    ProductoPrecioCompra.value = p.precio_compra || 0;
    ProductoGanancia.value = p.ganancia || 0;
    ProductoStock.value = p.stock || 0;
    ProductoActivo.value = p.activo;
    ProductoCategoria.value = p.id_categoria;
    ProductoMedida.value = p.id_medida;
    ProductoClavePS.value = p.clave_ps || '';
    ProductoClaveUnidad.value = p.clave_unidad || '';
    ProductoObjetoId.value = p.objeto_id || null;
    ProductoImpuestoId.value = p.impuesto_id || null;
    ProductoTipoFactorId.value = p.tipofac_id || null;
    
    editingId.value = p.id;

    modalTitle.value = 'Editar Producto';
    modalVisible.value = true;
  } catch (e) {
    console.error('Error al cargar producto:', e);
  }
};


    const saveProducto = async () => {
      loading.value = true;
      error.value = null;
      try {
        const payload = {
          codigo_producto: ProductoCodigo.value,
          nombre: ProductoNombre.value,
          precio_unitario: ProductoPrecioUnitario.value,
          precio_compra: ProductoPrecioCompra.value,
          ganancia: ProductoGanancia.value,
          stock: ProductoStock.value,
          activo: ProductoActivo.value,
          id_categoria: ProductoCategoria.value,
          id_medida: ProductoMedida.value,
          clave_unidad: ProductoClaveUnidad.value,
          clave_ps: ProductoClavePS.value,
          objeto_id: ProductoObjetoId.value ,// ✅ incluir objeto_id
           impuesto_id: ProductoImpuestoId.value,
        tipofac_id: ProductoTipoFactorId.value,
        impuesto_configuracion_id: ProductoImpuestoConfiguracionId.value,
        };
        if (editingId.value) {
          await api.put(`/productos/${editingId.value}`, payload);
        } else {
          await api.post('/productos', payload);
        }
        await fetchProductos();
        modalVisible.value = false;
      } catch (e) {
        error.value = 'Error al guardar producto: ' + (e.response?.data?.message || e.message);
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    // =============================
    // 🔹 Eliminar producto
    // =============================
    const deleteProducto = (id) => {
      deletingId.value = id;
      confirmMessage.value = '¿Seguro que deseas eliminar este producto?';
      confirmModalVisible.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deletingId.value) return;
      loading.value = true;
      error.value = null;
      try {
        await api.delete(`/productos/${deletingId.value}`);
        await fetchProductos();
      } catch (e) {
        error.value = 'Error al eliminar producto: ' + (e.response?.data?.message || e.message);
        console.error(e);
      } finally {
        loading.value = false;
        deletingId.value = null;
      }
    };

    onMounted(() => {
      fetchProductos();
      fetchMedidas();
      fetchCategorias();
      fetchObjetos(); 
      cargarImpuestoConfiguraciones();
    });

  return {
  sidebarOpen,
  Productos,
  Medidas,
  Categorias,
  Objetos,
  Impuestos,
  TiposFactor,
  loading,
  error,
  modalVisible,
  modalTitle,
  ProductoCodigo,
  ProductoNombre,
  ProductoPrecioUnitario,
  ProductoPrecioCompra,
  ProductoGanancia,
  ProductoStock,
  ProductoActivo,
  ProductoCategoria,
  ProductoMedida,
  ProductoClavePS,
  ProductoClaveUnidad,
  ProductoObjetoId,
  ProductoImpuestoId,   // 🔹 aquí
  ProductoTipoFactorId, // 🔹 aquí
  editingId,
  confirmModalVisible,
  confirmMessage,
  tableRef,
  openAddModal,
  openEditModal,
  saveProducto,
  deleteProducto,
  onConfirmDelete,
ProductoImpuestoConfiguracionId,
ImpuestoConfiguraciones,
};

  }
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
