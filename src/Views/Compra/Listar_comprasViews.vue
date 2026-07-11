<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid pt-5 pt-lg-4 mt-4">

        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-0">Compras</h2>
            <small class="text-muted">
              Historial de compras registradas
            </small>
          </div>

          <router-link to="/compras" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Nueva Compra
          </router-link>
        </div>

        <!-- Filtros -->
        <!-- Filtros -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <div class="row g-3">

              <div class="col-md-3">
                <label class="form-label">Folio</label>
                <input type="text" class="form-control" v-model="filtroFolio" placeholder="Buscar folio">
              </div>

              <div class="col-md-3">
                <label class="form-label">Proveedor</label>
                <input type="text" class="form-control" v-model="filtroProveedor" placeholder="Proveedor">
              </div>

              <div class="col-md-3">
                <label class="form-label">Fecha Inicial</label>
                <input type="date" class="form-control" v-model="filtroFechaInicio">
              </div>

              <div class="col-md-3">
                <label class="form-label">Fecha Final</label>
                <input type="date" class="form-control" v-model="filtroFechaFin">
              </div>

            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white">
            <h5 class="mb-0">Listado de Compras</h5>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th width="180">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="compra in comprasFiltradas" :key="compra.id">
                  <td>{{ compra.folio }}</td>
                  <td>{{ compra.fecha_compra }}</td>
                  <td>{{ compra.provedor?.nombre }}</td>
                  <td>{{ compra.user?.name }}</td>
                  <td>
                    $ {{ formatoMoneda(compra.total) }}
                  </td>

                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="verCompra(compra.id)">
                      <i class="bi bi-eye"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-success me-1" @click="imprimirCompra(compra.folio)">
                      <i class="bi bi-printer"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="compras.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No hay compras registradas
                  </td>
                </tr>
              </tbody>

            </table>
          </div>
        </div>
        <!-- Modal Detalle Compra -->
        <div v-if="modalDetalle" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">

              <div class="modal-header">
                <h5 class="modal-title">
                  Detalle Compra - {{ compraDetalle?.folio }}
                </h5>

                <button type="button" class="btn-close" @click="modalDetalle = false"></button>
              </div>

              <div class="modal-body">

                <div class="row mb-4">
                  <div class="col-md-4">
                    <strong>Proveedor</strong>
                    <p>{{ compraDetalle?.provedor?.nombre }}</p>
                  </div>

                  <div class="col-md-4">
                    <strong>Usuario</strong>
                    <p>{{ compraDetalle?.user?.name }}</p>
                  </div>

                  <div class="col-md-4">
                    <strong>Fecha</strong>
                    <p>{{ compraDetalle?.fecha_compra }}</p>
                  </div>
                </div>

                <table class="table table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Compra</th>
                      <th>Subtotal</th>
                       <th>Precio venta</th>
                       <th>Ganancia</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="item in compraDetalle?.detalle_compras" :key="item.id">
                      <td>{{ item.producto?.nombre }}</td>
                      <td>{{ item.cantidad }}</td>
                      <td>$ {{ formatoMoneda(item.precio_compra) }}</td>
                      <td>$ {{ formatoMoneda(item.subtotal) }}</td>
                      <td>$ {{ formatoMoneda(item.producto?.precio_unitario) }}</td>
                      <td>$ {{ formatoMoneda(item.producto?.ganancia) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="text-end mt-4">
                  <h4 class="fw-bold">
                    Total: $ {{ formatoMoneda(compraDetalle?.total || 0) }}
                  </h4>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "ComprasView",

  components: {
    Header,
    Sidebar,
  },

  setup() {
    const sidebarOpen = ref(true);
    const compras = ref([]);
    const loading = ref(false);

    // Modal detalle
    const modalDetalle = ref(false);
    const compraDetalle = ref(null);

    // Filtros
    const filtroFolio = ref("");
    const filtroProveedor = ref("");
    const filtroFechaInicio = ref("");
    const filtroFechaFin = ref("");

    // =========================
    // FORMATO MONEDA
    // =========================
    const formatoMoneda = (valor) => {
      return Number(valor || 0).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    // =========================
    // CARGAR COMPRAS
    // =========================
    const cargarCompras = async () => {
      loading.value = true;

      try {
        const response = await api.get("/historial");
        compras.value = response.data;
      } catch (error) {
        console.error("Error al cargar compras:", error);
      } finally {
        loading.value = false;
      }
    };

    // =========================
    // FILTROS
    // =========================
    const comprasFiltradas = computed(() => {
      return compras.value.filter((c) => {
        const folioMatch = (c.folio || "")
          .toLowerCase()
          .includes(filtroFolio.value.toLowerCase());

        const proveedorMatch = (c.provedor?.nombre || "")
          .toLowerCase()
          .includes(filtroProveedor.value.toLowerCase());

        const fecha = new Date(c.fecha_compra);

        const inicio = filtroFechaInicio.value
          ? new Date(filtroFechaInicio.value)
          : null;

        const fin = filtroFechaFin.value
          ? new Date(filtroFechaFin.value)
          : null;

        const rango =
          (!inicio || fecha >= inicio) &&
          (!fin || fecha <= fin);

        return folioMatch && proveedorMatch && rango;
      });
    });

    // =========================
    // VER DETALLE COMPRA
    // =========================
    const verCompra = async (id) => {
      try {
        const response = await api.get(`/compras/id/${id}`);
        compraDetalle.value = response.data;
        modalDetalle.value = true;
      } catch (error) {
        console.error("Error al obtener compra:", error);
        alert("No se pudo cargar la compra");
      }
    };

    const cerrarModal = () => {
      modalDetalle.value = false;
      compraDetalle.value = null;
    };

    // =========================
    // PDF (CORREGIDO 100%)
    // =========================
    const imprimirCompra = (folio) => {
      const base = api.defaults.baseURL.replace(/\/$/, "");

      window.open(
        `${base}/compras/pdf/${folio}`,
        "_blank"
      );
    };

    // =========================
    // INIT
    // =========================
    onMounted(() => {
      cargarCompras();
    });

    return {
      sidebarOpen,
      compras,
      loading,

      modalDetalle,
      compraDetalle,

      formatoMoneda,
      cargarCompras,
      verCompra,
      cerrarModal,
      imprimirCompra,

      // filtros
      filtroFolio,
      filtroProveedor,
      filtroFechaInicio,
      filtroFechaFin,

      comprasFiltradas,
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

/* ===== OVERLAY MÁS SUAVE ===== */
.modal.fade.show.d-block {
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.55) !important;
}

/* ===== MODAL ===== */
.modal-content {
  border: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

/* HEADER */
.modal-header {
  background: linear-gradient(135deg, #111827, #1f2937);
  color: #fff;
  border-bottom: none;
  padding: 16px 20px;
}

.modal-title {
  font-weight: 600;
  letter-spacing: 0.3px;
}

.btn-close {
  filter: invert(1);
  opacity: 0.8;
}

/* BODY */
.modal-body {
  background: #f8fafc;
  padding: 20px;
}

/* ===== INFO HEADER ===== */
.modal-body .row {
  background: #ffffff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.modal-body strong {
  font-size: 12px;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.6px;
}

.modal-body p {
  margin: 4px 0 0;
  font-weight: 600;
  color: #111827;
}

/* ===== TABLA ===== */
.table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.table thead {
  background: #111827;
  color: #fff;
}

.table thead th {
  font-size: 13px;
  font-weight: 600;
  border: none;
  padding: 12px;
}

.table tbody td {
  padding: 12px;
  font-size: 14px;
  border-color: #f1f5f9;
}

.table tbody tr:hover {
  background: #f9fafb;
}

/* ===== TOTAL ===== */
.text-end h4 {
  background: #111827;
  color: #fff;
  display: inline-block;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* ICONOS */
.bi {
  filter: brightness(0.9);
}
</style>
