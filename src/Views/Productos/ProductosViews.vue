<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar
      :class="{ 'd-none d-lg-flex': !sidebarOpen }"
      @close-sidebar="sidebarOpen = false"
    />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid p-4">
        <!-- Encabezado -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">Productos</h2>

          <button class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-plus-circle me-2"></i>
            Nuevo Producto
          </button>
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="alert alert-danger alert-dismissible fade show"
        >
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}

          <button
            type="button"
            class="btn-close"
            @click="error = null"
          ></button>
        </div>

        <!-- Tabla -->
        <div v-if="!loading" class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table
                ref="tableRef"
                class="table table-hover align-middle w-100"
              >
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
                  <tr
                    v-for="(producto, index) in Productos"
                    :key="producto.id"
                  >
                    <td>{{ index + 1 }}</td>

                    <td>
                      {{ producto.codigo_producto }}
                    </td>

                    <td>
                      {{ producto.nombre }}
                    </td>

                    <td>
                      {{ producto.precio_unitario }}
                    </td>

                    <td>
                      {{ producto.precio_compra }}
                    </td>

                    <td>
                      {{ producto.ganancia }}
                    </td>

                    <td>
                      {{ producto.stock }}
                    </td>

                    <td>
                      <span
                        :class="
                          producto.activo
                            ? 'badge bg-success'
                            : 'badge bg-secondary'
                        "
                      >
                        {{ producto.activo ? 'Sí' : 'No' }}
                      </span>
                    </td>

                    <td>
                      {{ producto.categoria?.nombre_categoria || '-' }}
                    </td>

                    <td>
                      {{ producto.medida?.unidad_sat || '-' }}
                    </td>

                    <td>
                      <button
                        class="btn btn-sm btn-warning me-2"
                        @click="openEditModal(producto)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <button
                        class="btn btn-sm btn-danger"
                        @click="deleteProducto(producto.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="Productos.length === 0">
                    <td
                      colspan="11"
                      class="text-center text-muted"
                    >
                      No hay productos registrados
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Overlay para móvil -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay d-lg-none"
      @click="sidebarOpen = false"
    ></div>

    <!-- Modal Crear/Editar -->
    <BaseModal
      v-model:visible="modalVisible"
      :title="modalTitle"
    >
      <div class="row g-3">
        <!-- Código -->
        <div class="col-md-4">
          <label class="form-label">Código</label>

          <input
            v-model.trim="ProductoCodigo"
            type="text"
            class="form-control"
            placeholder="Código"
          />
        </div>

        <!-- Nombre -->
        <div class="col-md-4">
          <label class="form-label">Nombre</label>

          <input
            v-model.trim="ProductoNombre"
            type="text"
            class="form-control"
            placeholder="Nombre"
          />
        </div>

        <!-- Precio unitario -->
        <div class="col-md-4">
          <label class="form-label">Precio Unitario</label>

          <input
            v-model.number="ProductoPrecioUnitario"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            placeholder="Precio Unitario"
          />
        </div>

        <!-- Precio compra -->
        <div class="col-md-4">
          <label class="form-label">Precio Compra</label>

          <input
            v-model.number="ProductoPrecioCompra"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            placeholder="Precio Compra"
          />
        </div>

        <!-- Ganancia -->
        <div class="col-md-4">
          <label class="form-label">Ganancia</label>

          <input
            v-model.number="ProductoGanancia"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            placeholder="Ganancia"
          />
        </div>

        <!-- Stock -->
        <div class="col-md-4">
          <label class="form-label">Stock</label>

         <input
  v-model.number="ProductoStock"
  type="number"
  min="0"
  step="0.001"
  class="form-control"
  placeholder="Stock"
/>
        </div>

        <!-- Clave PS -->
        <div class="col-md-4">
          <label class="form-label">
            Clave Producto/Servicio SAT
          </label>

          <input
            v-model.trim="ProductoClavePS"
            type="text"
            class="form-control"
            placeholder="Clave PS"
          />
        </div>

        <!-- Clave unidad -->
        <div class="col-md-4">
          <label class="form-label">
            Clave Unidad SAT
          </label>

          <input
            v-model.trim="ProductoClaveUnidad"
            type="text"
            class="form-control"
            placeholder="Clave Unidad"
          />
        </div>

        <!-- Activo -->
        <div class="col-md-4 d-flex align-items-center">
          <div class="form-check mt-4">
            <input
              id="activoCheck"
              v-model="ProductoActivo"
              type="checkbox"
              class="form-check-input"
            />

            <label
              class="form-check-label"
              for="activoCheck"
            >
              Activo
            </label>
          </div>
        </div>

        <!-- Categoría -->
        <div class="col-md-4">
          <label class="form-label">Categoría</label>

          <select
            v-model.number="ProductoCategoria"
            class="form-select"
          >
            <option value="">
              Seleccione una categoría
            </option>

            <option
              v-for="cat in Categorias"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.nombre_categoria }}
            </option>
          </select>
        </div>

        <!-- Medida -->
        <div class="col-md-4">
          <label class="form-label">Medida</label>

          <select
            v-model.number="ProductoMedida"
            class="form-select"
          >
            <option value="">
              Seleccione una medida
            </option>

            <option
              v-for="med in Medidas"
              :key="med.id"
              :value="med.id"
            >
              {{ med.nombre_largo }}
            </option>
          </select>
        </div>

        <!-- Objeto de impuesto -->
        <div class="col-md-4">
          <label class="form-label">
            Objeto de Impuesto
          </label>

          <select
            v-model.number="ProductoObjetoId"
            class="form-select"
          >
            <option value="">
              Seleccione un objeto
            </option>

            <option
              v-for="obj in Objetos"
              :key="obj.id"
              :value="obj.id"
            >
              {{ obj.clave_objeto }} -
              {{ obj.descripcion_objeto }}
            </option>
          </select>
        </div>

        <!-- Impuesto -->
        <div class="col-md-4">
          <label class="form-label">Impuesto</label>

          <select
            v-model.number="ProductoImpuestoId"
            class="form-select"
          >
            <option value="">
              Seleccione un impuesto
            </option>

            <option
              v-for="imp in Impuestos"
              :key="imp.id"
              :value="imp.id"
            >
              {{ imp.clave_impuesto }} -
              {{ imp.descripcion_impuesto }}
            </option>
          </select>
        </div>

        <!-- Tipo factor -->
        <div class="col-md-4">
          <label class="form-label">Tipo Factor</label>

          <select
            v-model.number="ProductoTipoFactorId"
            class="form-select"
          >
            <option value="">
              Seleccione un tipo factor
            </option>

            <option
              v-for="tip in TiposFactor"
              :key="tip.id"
              :value="tip.id"
            >
              {{ tip.clave_tipofactor }} -
              {{ tip.descripcion_tipofactor }}
            </option>
          </select>
        </div>

        <!-- Configuración de impuesto -->
        <div class="col-md-4">
          <label class="form-label">
            Configuración de Impuesto
          </label>

          <select
            v-model.number="ProductoImpuestoConfiguracionId"
            class="form-select"
          >
            <option value="">
              Seleccione una configuración
            </option>

            <option
              v-for="config in ImpuestoConfiguraciones"
              :key="config.id"
              :value="config.id"
            >
              {{ obtenerNombreConfiguracion(config) }}
            </option>
          </select>

          <small
            v-if="ImpuestoConfiguraciones.length === 0"
            class="text-danger d-block mt-1"
          >
            No hay configuraciones de impuesto disponibles
          </small>
        </div>
      </div>

      <template #footer>
        <button
          class="btn btn-secondary"
          @click="modalVisible = false"
        >
          Cancelar
        </button>

        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="saveProducto"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>

          {{ editingId ? 'Actualizar' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal de confirmación -->
    <ConfirmModal
      v-model:visible="confirmModalVisible"
      :message="confirmMessage"
      @confirmed="onConfirmDelete"
    />
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

  components: {
    Header,
    Sidebar,
    BaseModal,
    ConfirmModal,
  },

  setup() {
    const sidebarOpen = ref(false);

    const Productos = ref([]);
    const Medidas = ref([]);
    const Categorias = ref([]);
    const Objetos = ref([]);
    const Impuestos = ref([]);
    const TiposFactor = ref([]);
    const ImpuestoConfiguraciones = ref([]);

    const loading = ref(false);
    const error = ref(null);

    const modalVisible = ref(false);
    const modalTitle = ref('');
    const editingId = ref(null);

    const ProductoCodigo = ref('');
    const ProductoNombre = ref('');
    const ProductoPrecioUnitario = ref(0);
    const ProductoPrecioCompra = ref(0);
    const ProductoGanancia = ref(0);
    const ProductoStock = ref(0);
    const ProductoActivo = ref(true);
    const ProductoCategoria = ref('');
    const ProductoMedida = ref('');
    const ProductoClavePS = ref('');
    const ProductoClaveUnidad = ref('');
    const ProductoObjetoId = ref('');
    const ProductoImpuestoId = ref('');
    const ProductoTipoFactorId = ref('');
    const ProductoImpuestoConfiguracionId = ref('');

    const confirmModalVisible = ref(false);
    const confirmMessage = ref('');
    const deletingId = ref(null);

    const { tableRef, initDataTable } = useDataTable(Productos);

    /**
     * Obtiene un arreglo aunque Laravel devuelva:
     *
     * [
     *   ...
     * ]
     *
     * { data: [...] }
     *
     * { configuraciones: [...] }
     *
     * { impuesto_configuraciones: [...] }
     */
    const extraerConfiguraciones = (data) => {
      const posiblesListas = [
        data,
        data?.data,
        data?.configuraciones,
        data?.impuesto_configuraciones,
        data?.data?.configuraciones,
        data?.data?.impuesto_configuraciones,
      ];

      const listaEncontrada = posiblesListas.find((item) =>
        Array.isArray(item)
      );

      return listaEncontrada || [];
    };

    /**
     * Permite mostrar el texto aunque el backend no use
     * exactamente el campo "nombre".
     */
    const obtenerNombreConfiguracion = (config) => {
      const nombre =
        config.nombre ??
        config.nombre_configuracion ??
        config.descripcion ??
        config.descripcion_configuracion;

      if (nombre) {
        return nombre;
      }

      const impuesto =
        config.impuesto?.descripcion_impuesto ??
        config.descripcion_impuesto ??
        config.clave_impuesto ??
        '';

      const tipoFactor =
        config.tipo_factor?.descripcion_tipofactor ??
        config.descripcion_tipofactor ??
        config.clave_tipofactor ??
        '';

      const tasa =
        config.tasa_o_cuota ??
        config.tasa ??
        config.porcentaje ??
        '';

      const partes = [
        impuesto,
        tipoFactor,
        tasa !== '' ? tasa : '',
      ].filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== ''
      );

      if (partes.length > 0) {
        return partes.join(' - ');
      }

      return `Configuración ${config.id}`;
    };

    // =====================================================
    // Productos
    // =====================================================
    const fetchProductos = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await api.get('/productos');

        Productos.value = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        await nextTick();
        initDataTable();
      } catch (e) {
        error.value =
          'Error al cargar productos: ' +
          (e.response?.data?.message || e.message);

        console.error(
          'Error al cargar productos:',
          e.response?.data || e
        );
      } finally {
        loading.value = false;
      }
    };

    // =====================================================
    // Medidas
    // =====================================================
    const fetchMedidas = async () => {
      try {
        const response = await api.get('/getMedida');

        Medidas.value = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
      } catch (e) {
        console.error(
          'Error al cargar medidas:',
          e.response?.data || e
        );
      }
    };

    // =====================================================
    // Categorías
    // =====================================================
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/getCategoria');

        Categorias.value = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
      } catch (e) {
        console.error(
          'Error al cargar categorías:',
          e.response?.data || e
        );
      }
    };

    // =====================================================
    // Objeto, impuesto y tipo factor
    // =====================================================
    const fetchObjetos = async () => {
      try {
        const response = await api.get('/getexento');

        Objetos.value =
          response.data?.objeto_impuesto || [];

        Impuestos.value =
          response.data?.impuestos || [];

        TiposFactor.value =
          response.data?.tipo_factor || [];
      } catch (e) {
        console.error(
          'Error al cargar información fiscal:',
          e.response?.data || e
        );
      }
    };

    // =====================================================
    // Configuraciones de impuesto
    // =====================================================
    const cargarImpuestoConfiguraciones = async () => {
      try {
        const response = await api.get(
          '/impuesto-configuraciones'
        );

        console.log(
          'Respuesta impuesto-configuraciones:',
          response.data
        );

        ImpuestoConfiguraciones.value =
          extraerConfiguraciones(response.data);

        console.log(
          'Configuraciones cargadas:',
          ImpuestoConfiguraciones.value
        );
      } catch (e) {
        ImpuestoConfiguraciones.value = [];

        console.error(
          'Error al cargar configuraciones de impuesto:',
          e.response?.data || e
        );

        error.value =
          'No fue posible cargar las configuraciones de impuesto.';
      }
    };

    // =====================================================
    // Cargar catálogos
    // =====================================================
    const cargarCatalogos = async () => {
      await Promise.all([
        Medidas.value.length === 0
          ? fetchMedidas()
          : Promise.resolve(),

        Categorias.value.length === 0
          ? fetchCategorias()
          : Promise.resolve(),

        Objetos.value.length === 0 ||
        Impuestos.value.length === 0 ||
        TiposFactor.value.length === 0
          ? fetchObjetos()
          : Promise.resolve(),

        ImpuestoConfiguraciones.value.length === 0
          ? cargarImpuestoConfiguraciones()
          : Promise.resolve(),
      ]);
    };

    // =====================================================
    // Limpiar formulario
    // =====================================================
    const limpiarFormulario = () => {
      ProductoCodigo.value = '';
      ProductoNombre.value = '';
      ProductoPrecioUnitario.value = 0;
      ProductoPrecioCompra.value = 0;
      ProductoGanancia.value = 0;
      ProductoStock.value = 0;
      ProductoActivo.value = true;
      ProductoCategoria.value = '';
      ProductoMedida.value = '';
      ProductoClavePS.value = '';
      ProductoClaveUnidad.value = '';
      ProductoObjetoId.value = '';
      ProductoImpuestoId.value = '';
      ProductoTipoFactorId.value = '';
      ProductoImpuestoConfiguracionId.value = '';
      editingId.value = null;
    };

    // =====================================================
    // Abrir modal para agregar
    // =====================================================
    const openAddModal = async () => {
      try {
        error.value = null;

        await cargarCatalogos();

        limpiarFormulario();

        modalTitle.value = 'Nuevo Producto';
        modalVisible.value = true;
      } catch (e) {
        console.error('Error al abrir modal:', e);

        error.value =
          'No fue posible cargar los catálogos del producto.';
      }
    };

    // =====================================================
    // Abrir modal para editar
    // =====================================================
    const openEditModal = async (producto) => {
      try {
        error.value = null;

        const [response] = await Promise.all([
          api.get(`/productos/${producto.id}`),
          cargarCatalogos(),
        ]);

        const p = response.data?.data || response.data;

        ProductoCodigo.value =
          p.codigo_producto || '';

        ProductoNombre.value =
          p.nombre || '';

        ProductoPrecioUnitario.value =
          Number(p.precio_unitario || 0);

        ProductoPrecioCompra.value =
          Number(p.precio_compra || 0);

        ProductoGanancia.value =
          Number(p.ganancia || 0);

        ProductoStock.value =
          Number(p.stock || 0);

        ProductoActivo.value =
          Boolean(p.activo);

        ProductoCategoria.value =
          p.id_categoria ?? '';

        ProductoMedida.value =
          p.id_medida ?? '';

        ProductoClavePS.value =
          p.clave_ps || '';

        ProductoClaveUnidad.value =
          p.clave_unidad || '';

        ProductoObjetoId.value =
          p.objeto_id ??
          p.objeto_impuesto_id ??
          '';

        ProductoImpuestoId.value =
          p.impuesto_id ?? '';

        ProductoTipoFactorId.value =
          p.tipofac_id ??
          p.tipo_factor_id ??
          '';

        ProductoImpuestoConfiguracionId.value =
          p.impuesto_configuracion_id ??
          p.configuracion_impuesto_id ??
          p.impuesto_configuracion?.id ??
          '';

        editingId.value = p.id;

        modalTitle.value = 'Editar Producto';
        modalVisible.value = true;
      } catch (e) {
        console.error(
          'Error al cargar producto:',
          e.response?.data || e
        );

        error.value =
          'No fue posible cargar la información del producto.';
      }
    };

    // =====================================================
    // Guardar o actualizar producto
    // =====================================================
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

          id_categoria:
            ProductoCategoria.value === ''
              ? null
              : ProductoCategoria.value,

          id_medida:
            ProductoMedida.value === ''
              ? null
              : ProductoMedida.value,

          clave_unidad: ProductoClaveUnidad.value,
          clave_ps: ProductoClavePS.value,

          objeto_id:
            ProductoObjetoId.value === ''
              ? null
              : ProductoObjetoId.value,

          impuesto_id:
            ProductoImpuestoId.value === ''
              ? null
              : ProductoImpuestoId.value,

          tipofac_id:
            ProductoTipoFactorId.value === ''
              ? null
              : ProductoTipoFactorId.value,

          impuesto_configuracion_id:
            ProductoImpuestoConfiguracionId.value === ''
              ? null
              : ProductoImpuestoConfiguracionId.value,
        };

        console.log('Payload producto:', payload);

        if (editingId.value) {
          await api.put(
            `/productos/${editingId.value}`,
            payload
          );
        } else {
          await api.post('/productos', payload);
        }

        modalVisible.value = false;

        await fetchProductos();
      } catch (e) {
        error.value =
          'Error al guardar producto: ' +
          (e.response?.data?.message || e.message);

        console.error(
          'Error al guardar producto:',
          e.response?.data || e
        );
      } finally {
        loading.value = false;
      }
    };

    // =====================================================
    // Solicitar eliminación
    // =====================================================
    const deleteProducto = (id) => {
      deletingId.value = id;

      confirmMessage.value =
        '¿Seguro que deseas eliminar este producto?';

      confirmModalVisible.value = true;
    };

    // =====================================================
    // Confirmar eliminación
    // =====================================================
    const onConfirmDelete = async () => {
      if (!deletingId.value) {
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        await api.delete(
          `/productos/${deletingId.value}`
        );

        await fetchProductos();
      } catch (e) {
        error.value =
          'Error al eliminar producto: ' +
          (e.response?.data?.message || e.message);

        console.error(
          'Error al eliminar producto:',
          e.response?.data || e
        );
      } finally {
        loading.value = false;
        deletingId.value = null;
        confirmModalVisible.value = false;
      }
    };

    // =====================================================
    // Inicio
    // =====================================================
    onMounted(async () => {
      await Promise.all([
        fetchProductos(),
        fetchMedidas(),
        fetchCategorias(),
        fetchObjetos(),
        cargarImpuestoConfiguraciones(),
      ]);
    });

    return {
      sidebarOpen,

      Productos,
      Medidas,
      Categorias,
      Objetos,
      Impuestos,
      TiposFactor,
      ImpuestoConfiguraciones,

      loading,
      error,

      modalVisible,
      modalTitle,
      editingId,

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
      ProductoImpuestoId,
      ProductoTipoFactorId,
      ProductoImpuestoConfiguracionId,

      confirmModalVisible,
      confirmMessage,

      tableRef,

      obtenerNombreConfiguracion,
      openAddModal,
      openEditModal,
      saveProducto,
      deleteProducto,
      onConfirmDelete,
    };
  },
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
