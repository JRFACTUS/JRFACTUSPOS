<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Nueva Orden de Compra</h2>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Folio -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Folio</label>
            <input type="text" class="form-control" :value="folio" disabled />
          </div>

          <!-- Proveedor -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Proveedor</label>
            <select
              class="form-select"
              v-model="selectedProveedor"
              :class="{ 'is-invalid': error && !selectedProveedor }"
            >
              <option value="" disabled>Seleccione un proveedor</option>
              <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                {{ prov.nombre }}
              </option>
            </select>
          </div>

          <!-- Usuario -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Usuario</label>
            <input type="text" class="form-control" :value="usuario.name" disabled />
          </div>
        </div>

        <hr class="my-4" />

        <!-- Agregar Producto -->
        <div class="row g-3">
          <!-- Producto -->
          <div class="col-12">
            <label class="form-label fw-semibold">Buscar productos (F4)</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nombre o código de barra"
              v-model="productoBusqueda"
              @keyup.enter="buscarProductoConFocus"
              @dblclick="modalVisible = true"
              ref="productoInput"
              autocomplete="off"
            />
          </div>

          <!-- Cantidad -->
          <div class="col-md-2">
            <label class="form-label fw-semibold">Cantidad</label>
            <input
              type="number"
              class="form-control"
              v-model.number="cantidad"
              min="1"
              @keyup.enter="focusPrecio"
              ref="cantidadInput"
            />
          </div>

          <!-- Precio de compra -->
          <div class="col-md-3">
            <label class="form-label fw-semibold">Precio de compra</label>
            <input
              type="number"
              class="form-control"
              v-model.number="precioCompra"
              min="0"
              step="0.01"
              @keyup.enter="focusPrecioVenta"
              ref="precioInput"
            />
          </div>

          <!-- Precio de venta: al presionar Enter aquí se agrega el
               producto directo a la tabla (confirmarPrecioVenta). -->
          <div class="col-md-3">
            <label class="form-label fw-semibold">Precio de venta</label>
            <input
              type="number"
              class="form-control"
              v-model.number="precioVenta"
              min="0"
              step="0.01"
              @keyup.enter="confirmarPrecioVenta"
              ref="precioVentaInput"
            />
          </div>

          <!-- Ganancia (calculada, protegida contra NaN) -->
          <div class="col-md-3">
            <label class="form-label fw-semibold">Ganancia</label>
            <input
              type="text"
              class="form-control"
              :value="formatPrecio((Number(precioVenta) || 0) - (Number(precioCompra) || 0))"
              disabled
            />
          </div>

          <!-- Observación: nota opcional. El producto se agrega al
               presionar Enter en Precio de venta, no aquí; si escribes algo
               en este campo antes de eso, la nota se guarda junto con el
               producto. -->
          <div class="col-md-3">
            <label class="form-label fw-semibold">Observación</label>
            <input
              type="text"
              class="form-control"
              v-model="observacion"
              placeholder="Opcional"
              ref="observacionInput"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Productos -->
    <div class="card shadow-sm mb-4">
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="info-box">
            <small>Productos</small>
            <h5>{{ productos.length }}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="info-box">
            <small>Total Compra</small>
            <h5>{{ formatPrecio(totalGeneral) }}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="info-box">
            <small>Proveedor</small>
            <h5>{{ proveedorSeleccionado?.nombre || "Sin proveedor" }}</h5>
          </div>
        </div>
      </div>

      <div class="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
        <span>Productos Agregados</span>
        <span class="badge bg-light text-dark fs-6">Total: {{ formatPrecio(totalGeneral) }}</span>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle text-center">
            <thead class="table-light sticky-top">
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Compra</th>
                <th>Venta</th>
                <th>Ganancia</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(prod, index) in productos" :key="prod.id ?? index">
                <td>{{ index + 1 }}</td>
                <td>{{ prod.codigo_producto }}</td>
                <td>{{ prod.nombre }}</td>
                <td>{{ prod.cantidad }}</td>
                <td>{{ formatPrecio(prod.precio_compra) }}</td>
                <td>{{ formatPrecio(prod.precio_unitario) }}</td>
                <td :class="prod.ganancia >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'">
                  {{ formatPrecio(prod.ganancia) }}
                </td>
                <td>{{ formatPrecio(prod.total) }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="eliminarProducto(index)"
                    :disabled="loading"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="productos.length === 0">
                <td colspan="9" class="text-center text-muted py-3">
                  No hay productos agregados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-4">
      <button
        v-if="permisos.crear"
        type="button"
        class="btn btn-success"
        @click="guardarCompra"
        :disabled="loading || productos.length === 0 || !selectedProveedor"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
        Guardar Compra
      </button>
    </div>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show mt-4">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, defineExpose, watch } from "vue";
import api, { obtenerPermisosPorModulo } from "@/services/api.js";

export default {
  name: "CompraFormulario",
  props: {
    usuario: Object,
    proveedores: Array,
  },
  emits: ["guardar-compra"],

  setup(props) {
    const loading = ref(false);
    const error = ref(null);

    const folio = ref("");
    const selectedProveedor = ref("");

    const productoBusqueda = ref("");
    const codigoProducto = ref("");
    const productoId = ref(null);

    const cantidad = ref(1);
    const precioCompra = ref(0);
    const observacion = ref("");

    const productos = ref([]);
    const metodoPago = ref("Efectivo");

    const permisos = ref({});
    const precioVenta = ref(0);

    // Evita condiciones de carrera si el usuario dispara varias búsquedas
    // antes de que la anterior responda.
    let buscarProductoToken = 0;

    // ========================
    // INPUTS
    // ========================
    const productoInput = ref(null);
    const cantidadInput = ref(null);
    const precioInput = ref(null);
    const precioVentaInput = ref(null);
    const observacionInput = ref(null);

    // ========================
    // LOCAL STORAGE (namespaced por usuario)
    // ========================
    const storageKey = computed(() =>
      props.usuario?.id ? `compra_${props.usuario.id}` : "compra",
    );

    // ========================
    // COMPUTED
    // ========================
    const totalGeneral = computed(() =>
      productos.value.reduce((acc, p) => {
        const precio = Number(p.precio_compra || 0);
        const cant = Number(p.cantidad || 0);
        return acc + precio * cant;
      }, 0),
    );

    const proveedorSeleccionado = computed(() => {
      return (props.proveedores || []).find(
        (p) => p.id == selectedProveedor.value,
      );
    });

    const formatPrecio = (v) =>
      v == null || isNaN(v) ? "$ 0.00" : `$ ${Number(v).toFixed(2)}`;

    // ========================
    // FOCUS
    // ========================
    const focusCantidad = async () => {
      await nextTick();
      cantidadInput.value?.focus();
    };

    const focusPrecio = async () => {
      await nextTick();
      precioInput.value?.focus();
    };

    const focusPrecioVenta = async () => {
      await nextTick();
      precioVentaInput.value?.focus();
    };

    // Al presionar Enter en Precio de venta, el producto se agrega directo
    // a la tabla (ya no pasa por Observación, que fue eliminado).
    const confirmarPrecioVenta = () => {
      agregarProducto();
    };

    // ========================
    // PERMISOS
    // ========================
    const fetchPermisos = async () => {
      try {
        permisos.value = await obtenerPermisosPorModulo("compras");
      } catch (e) {
        permisos.value = {};
      }
    };

    // ========================
    // BUSCAR PRODUCTO
    // ========================
    const buscarProducto = async () => {
      if (!productoBusqueda.value) return;

      const token = ++buscarProductoToken;
      loading.value = true;
      error.value = null;

      try {
        const termino = encodeURIComponent(productoBusqueda.value);
        const res = await api.get(`/compras/buscar?codigo_producto=${termino}`);

        // Descarta respuestas obsoletas si hubo otra búsqueda más reciente.
        if (token !== buscarProductoToken) return;

        const producto = res.data;

        // Cubre null, undefined y arrays vacíos ([] desde Laravel get()).
        const productoVacio =
          !producto || (Array.isArray(producto) && producto.length === 0);

        if (productoVacio) {
          error.value = "Producto no encontrado.";
          return;
        }

        const prod = Array.isArray(producto) ? producto[0] : producto;

        if (!prod || prod.id == null) {
          error.value = "Producto no encontrado.";
          return;
        }

        productoId.value = prod.id;
        codigoProducto.value = prod.codigo_producto;
        productoBusqueda.value = prod.nombre;
        cantidad.value = 1;

        precioCompra.value = Number(prod.precio_compra ?? 0);
        precioVenta.value = Number(prod.precio_unitario ?? prod.precio_compra ?? 0);

        await focusCantidad();
      } catch (e) {
        if (token !== buscarProductoToken) return;
        error.value = e.response?.data?.message || e.message;
      } finally {
        if (token === buscarProductoToken) {
          loading.value = false;
        }
      }
    };

    // ========================
    // AGREGAR PRODUCTO
    // ========================
    const agregarProducto = () => {
      if (!productoBusqueda.value || !codigoProducto.value) return;
      if (Number(cantidad.value) <= 0) return;
      if (Number(precioCompra.value) < 0) return;

      const index = productos.value.findIndex(
        (p) => p.codigo_producto === codigoProducto.value,
      );

      const precioCompraNum = Number(precioCompra.value || 0);
      const precioVentaNum = Number(precioVenta.value || 0);
      const cant = Number(cantidad.value || 0);

      if (index !== -1) {
        // Se fusiona en la misma fila incrementando la cantidad, sin perder
        // el costo de las unidades ya agregadas: se promedia el precio de
        // compra y de venta ponderado por cantidad.
        const existente = productos.value[index];
        const cantidadPrevia = Number(existente.cantidad || 0);
        const cantidadNueva = cantidadPrevia + cant;

        const totalCompraPrevio = cantidadPrevia * Number(existente.precio_compra || 0);
        const totalCompraNuevo = totalCompraPrevio + cant * precioCompraNum;
        const costoPromedio = cantidadNueva > 0 ? totalCompraNuevo / cantidadNueva : 0;

        const totalVentaPrevio = cantidadPrevia * Number(existente.precio_unitario || 0);
        const totalVentaNuevo = totalVentaPrevio + cant * precioVentaNum;
        const ventaPromedio = cantidadNueva > 0 ? totalVentaNuevo / cantidadNueva : 0;

        existente.cantidad = cantidadNueva;
        existente.precio_compra = costoPromedio;
        existente.precio_unitario = ventaPromedio;
        existente.ganancia = ventaPromedio - costoPromedio;
        existente.total = totalCompraNuevo;

        if (observacion.value) {
          existente.observacion = existente.observacion
            ? `${existente.observacion} | ${observacion.value}`
            : observacion.value;
        }
      } else {
        productos.value.push({
          uid: `${codigoProducto.value || "item"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          id: productoId.value,
          codigo_producto: codigoProducto.value,
          nombre: productoBusqueda.value,
          cantidad: cant,
          precio_compra: precioCompraNum,
          precio_unitario: precioVentaNum,
          total: cant * precioCompraNum,
          ganancia: precioVentaNum - precioCompraNum,
          observacion: observacion.value,
        });
      }

      productoBusqueda.value = "";
      codigoProducto.value = "";
      productoId.value = null;
      cantidad.value = 1;
      precioCompra.value = 0;
      precioVenta.value = 0;
      observacion.value = "";

      nextTick(() => productoInput.value?.focus());
    };

    const eliminarProducto = (index) => {
      if (index < 0 || index >= productos.value.length) return;
      productos.value.splice(index, 1);
    };

    // ========================
    // GUARDAR COMPRA
    // ========================
    const guardarCompra = async () => {
      if (!props.usuario) return alert("Debes iniciar sesión.");
      if (!selectedProveedor.value || productos.value.length === 0)
        return alert("Completa los campos.");

      loading.value = true;
      error.value = null;

      try {
        const payload = {
          folio: folio.value,
          // El backend (tabla `provedores`, validación en
          // CompraController@store) usa literalmente "provedor_id" sin la
          // "e" de "proveedor": es el nombre real de columna en la BD.
          provedor_id: selectedProveedor.value,
          fecha_compra: new Date().toISOString().split("T")[0],
          metodo_pago: metodoPago.value,
          observaciones: observacion.value,
          user_id: props.usuario.id,

          productos: productos.value.map((p) => ({
            producto_id: Number(p.id),
            cantidad: Number(p.cantidad),
            precio_compra: Number(p.precio_compra ?? 0),
            precio_unitario: Number(p.precio_unitario ?? 0),
          })),
        };

        const response = await api.post("/compras", payload);

        const base = api.defaults.baseURL.replace(/\/$/, "");
        window.open(`${base}/compras/pdf/${response.data.folio}`, "_blank");

        alert(`Compra registrada. Folio: ${response.data.folio}`);

        productos.value = [];
        productoBusqueda.value = "";
        codigoProducto.value = "";
        productoId.value = null;
        cantidad.value = 1;
        precioCompra.value = 0;
        precioVenta.value = 0;
        observacion.value = "";
        selectedProveedor.value = "";

        await cargarFolio();
      } catch (e) {
        console.error(e);
        error.value = e.response?.data?.message || "Error al guardar compra";
        alert(error.value);
      } finally {
        loading.value = false;
      }
    };

    // ========================
    // FOLIO
    // ========================
    const cargarFolio = async () => {
      try {
        const res = await api.get("/compras/getNextFolio");
        folio.value = res.data.folio;
      } catch (e) {
        folio.value = "COM-" + Date.now();
      }
    };

    // ========================
    // MODAL PRODUCTO
    // ========================
    const agregarProductoDesdeModal = async (prod) => {
      productoId.value = prod.id;
      codigoProducto.value = prod.codigo_producto;
      productoBusqueda.value = prod.nombre;

      precioCompra.value = Number(prod.precio_compra) || 0;
      precioVenta.value = Number(prod.precio_unitario ?? 0);
      cantidad.value = 1;

      // Igual que la búsqueda manual (F4 -> buscar -> Enter): solo se llenan
      // los campos y se manda el foco a Cantidad. El usuario revisa/ajusta
      // Cantidad, Precio de compra y Precio de venta, y confirma al
      // presionar Enter en Precio de venta. No se agrega automáticamente.
      await focusCantidad();
    };

    const buscarProductoConFocus = async () => {
      await buscarProducto();
      await focusCantidad();
    };

    // ========================
    // LOCAL STORAGE
    // ========================
    watch(
      productos,
      (val) => {
        if (val.length === 0) {
          localStorage.removeItem(storageKey.value);
        } else {
          localStorage.setItem(storageKey.value, JSON.stringify(val));
        }
      },
      { deep: true },
    );

    // ========================
    // INIT
    // ========================
    onMounted(async () => {
      await fetchPermisos();
      await cargarFolio();

      const saved = localStorage.getItem(storageKey.value);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          productos.value = Array.isArray(parsed) ? parsed : [];
        } catch {
          productos.value = [];
        }
      }

      productoInput.value?.focus();
    });

    defineExpose({ agregarProductoDesdeModal });

    return {
      loading,
      error,

      folio,
      selectedProveedor,

      productoBusqueda,
      codigoProducto,
      productoId,

      cantidad,
      precioCompra,
      precioVenta,
      observacion,

      productos,
      metodoPago,

      totalGeneral,
      proveedorSeleccionado,
      formatPrecio,

      productoInput,
      cantidadInput,
      precioInput,
      precioVentaInput,
      observacionInput,

      buscarProducto,
      agregarProducto,
      eliminarProducto,
      guardarCompra,

      focusCantidad,
      focusPrecio,
      focusPrecioVenta,
      confirmarPrecioVenta,

      buscarProductoConFocus,
      agregarProductoDesdeModal,

      permisos,
    };
  },
};
</script>
<style scoped>
/* ===========================
   BASE
=========================== */
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: none;
  background: #fff;
}

.card-body {
  padding: 1rem;
}

/* ===========================
   TIPOGRAFÍA
=========================== */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

/* ===========================
   INPUTS (ERP STYLE)
=========================== */
.form-control,
.form-select {
  height: 38px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #2563eb;
  box-shadow: none;
}

/* ===========================
   HEADER
=========================== */
.compras-header {
  background: #111827;
  color: white;
  padding: 10px 14px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ===========================
   INFO BOX (más sobrio)
=========================== */
.info-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 12px;
}

.info-box small {
  font-size: 0.7rem;
  color: #6b7280;
}

.info-box h5 {
  font-size: 1rem;
  margin: 0;
  color: #111827;
  font-weight: 600;
}

/* ===========================
   TABLA ERP
=========================== */
.table {
  font-size: 0.85rem;
  margin-bottom: 0;
}

.table thead th {
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 10px;
}

.table tbody td {
  padding: 10px;
  border-color: #f1f1f1;
}

.table-hover tbody tr:hover {
  background: #f9fafb;
}

/* ===========================
   BOTONES
=========================== */
.btn-success {
  background: #16a34a;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 14px;
}

.btn-success:hover {
  background: #15803d;
}

/* delete */
.btn-outline-danger {
  border-radius: 6px;
}

/* ===========================
   SCROLL TABLA
=========================== */
.table-responsive {
  max-height: 420px;
  overflow-y: auto;
}

.table-responsive::-webkit-scrollbar {
  width: 6px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

/* ===========================
   LAYOUT
=========================== */
hr {
  border-color: #e5e7eb;
  margin: 1rem 0;
}
</style>
