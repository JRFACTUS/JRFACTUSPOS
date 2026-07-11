<template>
  <div>
    <!-- <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Venta</h2>
    </div> -->

    <div v-if="error" class="alert alert-danger alert-dismissible fade show mt-4">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>
    <!-- Formulario Cabecera Moderno -->
    <div class="sale-form-panel">
      <div class="sale-form-header">
        <div>
          <h5>Información de la venta</h5>
          <p>Datos principales del cliente y usuario</p>
        </div>

        <span class="folio-badge">
          {{ folio }}
        </span>
      </div>

      <div class="sale-form-body">
        <div class="row g-3">
          <!-- Folio -->
          <div class="col-md-4">
            <label class="modern-label">Folio</label>
            <input type="text" class="form-control modern-input" :value="folio" disabled />
          </div>

          <!-- Cliente -->
          <div class="col-md-4">
            <label class="modern-label">Cliente (F1)</label>

            <div class="modern-input-group">
              <select @dblclick="abrirModalEditarCliente" class="form-select modern-input" v-model="selectedCliente">
                <option v-for="cli in clientes" :key="cli.id" :value="cli.id">
                  {{ cli.razon_social }} 
                </option>
              </select>

              <button class="modern-search-btn" @click="modalClienteOpen = true">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>

          <!-- Usuario -->
          <div class="col-md-4">
            <label class="modern-label">Usuario</label>
            <input type="text" class="form-control modern-input" :value="usuario.name" disabled />
          </div>
        </div>

        <div class="modern-divider"></div>

        <div class="section-title">
          <div>
            <h6>Agregar producto</h6>
            <p>Busca el producto por nombre o código de barra</p>
          </div>
        </div>

        <!-- Agregar Producto -->
        <div class="row g-3">
          <input type="hidden" v-model="codigoProducto" />
          <input type="hidden" v-model="productoId" />

          <div class="col-md-5">
            <label class="modern-label">Buscar Producto (F3)</label>
            <input type="text" class="form-control modern-input" placeholder="Nombre o código de barra"
              v-model="productoBusqueda" @keyup.enter="buscarProducto" @dblclick="modalProductoOpen = true"
              ref="productoInput" />
          </div>

          <div class="col-md-2">
            <label class="modern-label">Cantidad</label>
            <input type="number" class="form-control modern-input" v-model.number="cantidad" min="1"
              @keyup.enter="agregarProducto" ref="cantidadInput" />
          </div>

          <div class="col-md-3">
            <label class="modern-label">Precio</label>
            <input type="number" class="form-control modern-input" v-model.number="precioVenta" min="0" step="0.01"
              disabled />
          </div>
        </div>
      </div>
    </div>
    <div v-if="mensajeError" class="alert alert-danger alert-dismissible fade show mt-4">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ mensajeError }}
      <button type="button" class="btn-close" @click="mensajeError = null"></button>
    </div>

    <!-- Tabla Productos -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
  <span>Productos</span>

  <div class="d-flex align-items-center gap-2">
    <!-- <span class="badge bg-light text-dark fs-6">
      Total: {{ formatPrecio(totalVenta) }}
    </span> -->

    <button
      class="btn-cobrar-header"
      :disabled="productos.length === 0"
      @click="abrirModalCobro"
    >
     Cobrar (F2)
    </button>
  </div>
</div>

     <!-- Resumen de venta -->
<div class="venta-resumen">
  <div class="resumen-item">
    <span>Productos</span>
    <strong>{{ productos.length }}</strong>
  </div>

  <div class="resumen-item">
    <span>Total</span>
    <strong>{{ formatPrecio(totalVenta) }}</strong>
  </div>

  <div class="resumen-item">
    <span>Cliente</span>
    <strong>{{ clienteActual?.razon_social || 'Público en general' }}</strong>
  </div>
</div>

<div class="card-body p-0">
  <div class="table-responsive modern-table-wrapper">
    <table class="table modern-table align-middle text-center mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>Código</th>
          <th class="text-start">Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(prod, index) in productos" :key="index">
          <td>
            <span class="table-index">{{ index + 1 }}</span>
          </td>

          <td>
            <span class="product-code">{{ prod.codigo_producto }}</span>
          </td>

          <td class="text-start">
            <span class="product-name">{{ prod.nombre }}</span>
          </td>

          <td>
            <span class="quantity-badge">{{ prod.cantidad }}</span>
          </td>

          <td>{{ formatPrecio(prod.precio) }}</td>

          <td>
            <span class="total-price">{{ formatPrecio(prod.total) }}</span>
          </td>

          <td>
            <button class="btn-delete-product" @click="eliminarProducto(index)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>

        <tr v-if="productos.length === 0">
          <td colspan="7" class="empty-table">
            <i class="bi bi-bag-x"></i>
            <span>No hay productos agregados</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </div>

    <!-- Botón Guardar -->
    <!--  <div class="d-flex justify-content-end mb-4">
      <button class="btn btn-success" @click="guardarVenta">Guardar Venta</button>
    </div> -->


    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Modal Clientes -->
    <ModalCliente :visible="modalClienteOpen" :clientes="clientes" :regimenes="regimenesFiscales" :usos_cfdi="usosCFDI"
      @close="modalClienteOpen = false" @select="seleccionarCliente" />



    <!-- Modal Editar Cliente -->
    <ModalEditarCliente :visible="modalEditarClienteOpen" :cliente="clienteSeleccionado" :regimenes="regimenesFiscales"
      :usos_cfdi="usosCFDI" @close="modalEditarClienteOpen = false" @updated="actualizarCliente" />

    <ModalCobro :visible="modalCobroOpen" :total="totalVenta" @close="modalCobroOpen = false"
      @confirmar="confirmarCobro" />

    <ModalProducto :visible="modalProductoOpen" @close="modalProductoOpen = false"
      @select="agregarProductoDesdeModal" />


  </div>
</template>
<script>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import api from "@/services/api.js";
import ModalCliente from "@/Views/Ventas/ModalClientes.vue";
import ModalEditarCliente from "@/Views/Ventas/ModalEditarCliente.vue";
import ModalCobro from "@/Views/Ventas/ModalCobro.vue";
import ModalProducto from "@/components/ModalProducto.vue";



export default {
  name: "VentaFormulario",
  props: { usuario: Object },
  components: { ModalCliente, ModalEditarCliente, ModalCobro, ModalProducto },
  setup(props) {
    const loading = ref(false);
    const error = ref(null);
    const folio = ref("");
    const clientes = ref([]);
    const selectedCliente = ref(null);
    const regimenesFiscales = ref([]);
    const usosCFDI = ref([]);

    const productoBusqueda = ref("");
    const codigoProducto = ref("");
    const productoId = ref(null);
    const cantidad = ref(1);
    const precioVenta = ref(0);
    const productos = ref([]);
    const mensajeError = ref(null);

    const productoInput = ref(null);
    const cantidadInput = ref(null);

    const modalClienteOpen = ref(false);
    const modalEditarClienteOpen = ref(false);
    const clienteSeleccionado = ref(null);
    const modalCobroOpen = ref(false);


    const modalProductoOpen = ref(false);       // controla visibilidad del modal
    const productosDisponibles = ref([]);
    const totalVenta = computed(() =>
      productos.value.reduce((acc, p) => acc + (p.total || 0), 0)
    );

    // --- Clientes ---
    const cargarClientes = async () => {
      try {
        const res = await api.get("/clientes/getclientes");
        clientes.value = res.data.clientes;

        // Guardar catálogos
        regimenesFiscales.value = res.data.regimenes_fiscales;
        usosCFDI.value = res.data.usos_cfdi;

        if (clientes.value.length > 0 && !selectedCliente.value)
          selectedCliente.value = clientes.value[0].id;
      } catch (e) {
        console.error(e);
      }
    };


    const abrirModalEditarCliente = async () => {
      if (!regimenesFiscales.value.length || !usosCFDI.value.length) {
        const res = await api.get('/sat');
        regimenesFiscales.value = res.data.regimenes_fiscales;
        usosCFDI.value = res.data.usos_cfdi;
      }

      const cliente = clientes.value.find(c => c.id === selectedCliente.value);
      if (!cliente) return;
      clienteSeleccionado.value = cliente;
      modalEditarClienteOpen.value = true;
    };


    const actualizarCliente = (cliActualizado) => {
      const index = clientes.value.findIndex(c => c.id === cliActualizado.id);
      if (index !== -1) {
        clientes.value.splice(index, 1, cliActualizado);
      } else {
        clientes.value.push(cliActualizado);
      }
      selectedCliente.value = cliActualizado.id;
      modalEditarClienteOpen.value = false;
    };

    const seleccionarCliente = (cli) => {
      selectedCliente.value = cli.id;

      // Opcional: actualizar los selects de Régimen Fiscal y Uso CFDI
      clienteSeleccionado.value = { ...cli }; // Para abrir el modal de editar con los valores correctos
    };


    // --- Productos ---
    const buscarProducto = async () => {
      if (!productoBusqueda.value) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get(
          `/productos/buscar?codigo_producto=${encodeURIComponent(productoBusqueda.value)}`
        );
        const encontrados = res.data;
        if (!encontrados.length) {
          alert("❌ Producto no encontrado.");
          productoBusqueda.value = "";
          productoId.value = null;
          codigoProducto.value = "";
          precioVenta.value = 0;
          cantidad.value = 1;
          await nextTick();
          productoInput.value?.focus();
          return;
        }
        const producto = encontrados[0];
        productoId.value = producto.id;
        codigoProducto.value = producto.codigo_producto;
        productoBusqueda.value = producto.nombre;
        precioVenta.value = parseFloat(producto.precio_unitario) || 0;
        cantidad.value = 1;
        await nextTick();
        cantidadInput.value?.focus();
      } catch (e) {
        console.error(e);
        alert("❌ Error al buscar el producto.");
      } finally {
        loading.value = false;
      }
    };

    const agregarProducto = () => {
      if (!productoId.value || !productoBusqueda.value || cantidad.value <= 0) return;

      const index = productos.value.findIndex(p => p.codigo_producto === codigoProducto.value);
      if (index !== -1) {
        productos.value[index].cantidad += cantidad.value;
        productos.value[index].total = productos.value[index].cantidad * productos.value[index].precio;
      } else {
        productos.value.push({
          id: productoId.value,
          codigo_producto: codigoProducto.value,
          nombre: productoBusqueda.value,
          cantidad: cantidad.value,
          precio: precioVenta.value,
          total: cantidad.value * precioVenta.value,
        });
      }

      productoBusqueda.value = "";
      productoId.value = null;
      codigoProducto.value = "";
      cantidad.value = 1;
      precioVenta.value = 0;

      nextTick(() => {
        productoInput.value?.focus();
      });
    };


    const agregarProductoDesdeModal = async (prod) => {
      // Cargar los valores del producto seleccionado
      productoId.value = prod.id;
      codigoProducto.value = prod.codigo_producto;
      productoBusqueda.value = prod.nombre;
      precioVenta.value = parseFloat(prod.precio_unitario) || 0;
      cantidad.value = 1;

      // Reutilizar tu función actual
      agregarProducto();

      // Cerrar el modal y volver a enfocar el campo principal
      modalProductoOpen.value = false;
      await nextTick();
      productoInput.value?.focus();
    };


    const eliminarProducto = (index) => productos.value.splice(index, 1);

    // --- Ventas ---
    const cargarFolio = async () => {
      try {
        const res = await api.get("/folio-siguiente");
        folio.value = res.data.folio;
      } catch {
        folio.value = "VEN-" + Date.now();
      }
    };


    const abrirModalCobro = () => {
      // Aseguramos que los totales estén actualizados
      productos.value.forEach(p => {
        p.total = Number(p.precio) * Number(p.cantidad);
      });

      const productosValidos = productos.value.filter(p => p.cantidad > 0 && p.total > 0);

      if (productosValidos.length === 0) {
        mensajeError.value = "❌ No hay productos para cobrar.";
        return; // No abrimos el modal
      }

      mensajeError.value = null; // Limpiamos error
      modalCobroOpen.value = true; // Abrimos el modal
    };




    const handleKeydown = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        modalClienteOpen.value = true;
      }

      if (e.key === "F2") {
        e.preventDefault();
        abrirModalCobro();
      }

      if (e.key === "F3") {
        e.preventDefault();
        modalProductoOpen.value = true;
      }

      // Cerrar modales con ESC
      if (e.key === "Escape") {
        e.preventDefault();
        if (modalClienteOpen.value) modalClienteOpen.value = false;
        if (modalEditarClienteOpen.value) modalEditarClienteOpen.value = false;
        if (modalCobroOpen.value) modalCobroOpen.value = false;
        if (modalProductoOpen.value) modalProductoOpen.value = false;
      }
    };

    const confirmarCobro = async (pagos) => {
      if (!props.usuario) return alert("Debes iniciar sesión.");
      if (!selectedCliente.value || !productos.value.length)
        return alert("Complete todos los campos.");

      try {
        // Calcular total de la venta
        const total = productos.value.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

        // 👇 Estructura que se envía al backend
        const payload = {
          cliente_id: selectedCliente.value,
          user_id: props.usuario.id,
          fecha: new Date().toISOString().split("T")[0],
          hora: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          total,
          pagos, // array con los métodos de pago del modal
          productos: productos.value.map(p => ({
            producto_id: p.id, // 👈 importante: ID del producto real
            cantidad: p.cantidad,
            precio_unitario: p.precio,
            subtotal: p.total // 👈 para guardar en venta_detalles
          }))
        };

        const res = await api.post("/venta", payload);
        alert(`✅ Venta registrada correctamente. Folio: ${res.data.venta.folio_pago}`);

        // --- Limpiar formulario ---
        productos.value = [];
        productoBusqueda.value = "";
        codigoProducto.value = null;
        cantidad.value = 1;
        precioVenta.value = 0;
        selectedCliente.value = null;
        modalCobroOpen.value = false;

        await cargarFolio();
        await cargarClientes();
        nextTick(() => productoInput.value?.focus());

      } catch (e) {
        console.error(e);
        alert("❌ Error al guardar la venta: " + (e.response?.data?.message || e.message));
      }
    };

const clienteActual = computed(() => {
  return clientes.value.find(c => c.id === selectedCliente.value);
});

    // --- Hooks ---
    onMounted(async () => {
      await cargarFolio();
      await cargarClientes();
      nextTick(() => productoInput.value?.focus());
      window.addEventListener("keydown", handleKeydown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeydown);
    });

    const formatPrecio = (v) =>
      v == null || isNaN(v) ? "$ 0.00" : `$ ${v.toFixed(2)}`;

    return {
      loading,
      error,
      folio,
      clientes,
      selectedCliente,
      productoBusqueda,
      codigoProducto,
      productoId,
      cantidad,
      precioVenta,
      productos,
      totalVenta,
      formatPrecio,
      productoInput,
      cantidadInput,
      modalClienteOpen,
      modalEditarClienteOpen,
      clienteSeleccionado,
      modalCobroOpen,
      abrirModalEditarCliente,
      actualizarCliente,
      seleccionarCliente,
      buscarProducto,
      agregarProducto,
      eliminarProducto,
      confirmarCobro,
      modalProductoOpen,
      agregarProductoDesdeModal,
      mensajeError,
      clienteActual,

    };
  },
};
</script>

<style scoped>
:host {
  display: block;
  background: #f3f6fb;
}

/* Título */
h2.fw-bold {
  font-size: 2rem;
  font-weight: 900 !important;
  color: #0f172a;
}

/* Panel principal */
.sale-form-panel {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #dbe3ef;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  margin-bottom: 22px;
}

.sale-form-header {
  background: linear-gradient(135deg, #0d6efd, #084298);
  color: #ffffff;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sale-form-header h5 {
  margin: 0;
  font-weight: 900;
  font-size: 1.15rem;
}

.sale-form-header p {
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.folio-badge {
  background: #ffffff;
  color: #084298;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,.18);
}

.sale-form-body {
  padding: 22px;
}

.modern-label {
  font-weight: 800;
  color: #334155;
  font-size: 0.86rem;
  margin-bottom: 6px;
}

.modern-input,
.modern-input:disabled {
  height: 46px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-weight: 700;
  color: #0f172a;
}

.modern-input:focus {
  background: #ffffff;
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, .15);
}

.modern-input-group {
  display: flex;
  gap: 8px;
}

.modern-search-btn {
  width: 48px;
  border: none;
  border-radius: 12px;
  background: #0d6efd;
  color: white;
  font-size: 1.1rem;
  transition: .2s;
}

.modern-search-btn:hover {
  background: #084298;
}

.modern-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 22px 0;
}

.section-title h6 {
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.section-title p {
  color: #64748b;
  font-size: .9rem;
  margin-bottom: 14px;
}

/* Card productos */
.card {
  border: none;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 14px 32px rgba(15, 23, 42, .12);
}

.card-header {
  padding: 16px 22px;
  background: linear-gradient(135deg, #0f172a, #1e40af) !important;
  font-size: 1.05rem;
}

/* Botón cobrar */
.btn-cobrar-header {
  border: none;
  background: #22c55e;
  color: #ffffff;
  font-weight: 900;
  border-radius: 14px;
  padding: 10px 22px;
  box-shadow: 0 8px 18px rgba(34, 197, 94, .35);
  transition: .2s;
}

.btn-cobrar-header:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
}

.btn-cobrar-header:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* Resumen */
.venta-resumen {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.resumen-item {
  padding: 16px 20px;
  border-right: 1px solid #e2e8f0;
}

.resumen-item:last-child {
  border-right: none;
}

.resumen-item span {
  display: block;
  color: #64748b;
  font-size: .85rem;
  font-weight: 700;
}

.resumen-item strong {
  display: block;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 900;
  margin-top: 4px;
}

/* Tabla */
.modern-table-wrapper {
  background: #ffffff;
}

.modern-table thead th {
  background: #eaf1ff;
  color: #1e3a8a;
  font-size: .82rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 900;
  border: none;
  padding: 14px;
}

.modern-table tbody td {
  padding: 14px;
  border-color: #edf2f7;
  font-weight: 700;
  color: #334155;
}

.modern-table tbody tr:hover {
  background: #f8fbff;
}

.table-index {
  background: #0d6efd;
  color: white;
  min-width: 30px;
  height: 30px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.product-code {
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: .82rem;
  font-weight: 900;
}

.product-name {
  color: #0f172a;
  font-weight: 900;
}

.quantity-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 900;
}

.total-price {
  color: #16a34a;
  font-weight: 900;
  font-size: 1rem;
}

.btn-delete-product {
  border: none;
  background: #fee2e2;
  color: #dc2626;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  transition: .2s;
}

.btn-delete-product:hover {
  background: #dc2626;
  color: #ffffff;
}

/* Vacío */
.empty-table {
  padding: 40px !important;
  color: #94a3b8 !important;
  font-weight: 800;
}

.empty-table i {
  display: block;
  font-size: 2rem;
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .sale-form-header,
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }

  .venta-resumen {
    grid-template-columns: 1fr;
  }

  .resumen-item {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>