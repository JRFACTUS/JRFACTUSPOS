<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- SIDEBAR -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />


      <main class="container-fluid p-4">
        <!-- CARGA INICIAL -->
        <div v-if="loading && kardex.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">
              Cargando...
            </span>
          </div>

          <p class="text-muted mt-3 mb-0">
            Cargando movimientos del Kardex...
          </p>
        </div>

        <!-- CONTENIDO -->
        <div v-else>
          <!-- ERROR GENERAL -->
          <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ error }}

            <button type="button" class="btn-close" aria-label="Cerrar" @click="error = null"></button>
          </div>

          <!-- CONTENEDOR KARDEX -->
          <div class="kardex-container">
            <!-- ENCABEZADO -->
            <div class="kardex-header">
              <div>
                <h2>
                  Kardex de Inventario
                </h2>

                <p>
                  Control y seguimiento de movimientos de inventario
                </p>
              </div>

              <!-- FILTROS -->
<div class="row g-3 w-100 mt-2">
  <!-- DESDE -->
  <div class="col-12 col-sm-6 col-lg-2">
    <label
      for="fecha-desde"
      class="form-label fw-semibold"
    >
      Desde
    </label>

    <input
      id="fecha-desde"
      v-model="desde"
      type="date"
      class="form-control"
      :max="hasta || undefined"
      :disabled="loading"
    />
  </div>

  <!-- HASTA -->
  <div class="col-12 col-sm-6 col-lg-2">
    <label
      for="fecha-hasta"
      class="form-label fw-semibold"
    >
      Hasta
    </label>

    <input
      id="fecha-hasta"
      v-model="hasta"
      type="date"
      class="form-control"
      :min="desde || undefined"
      :disabled="loading"
    />
  </div>

  <!-- BUSCADOR DE PRODUCTO -->
  <div class="col-12 col-lg-4">
    <label
      for="buscar-kardex"
      class="form-label fw-semibold"
    >
      Buscar producto
    </label>

    <input
      id="buscar-kardex"
      v-model="busquedaKardex"
      type="text"
      class="form-control"
      placeholder="Código o nombre del producto"
      autocomplete="off"
      :disabled="loading"
      @keyup.enter="filtrarPorFechas"
    />
  </div>

  <!-- BOTÓN BUSCAR -->
  <div
    class="col-12 col-sm-6 col-lg-2 d-flex align-items-end"
  >
    <button
      type="button"
      class="btn btn-primary w-100"
      :disabled="
        loading ||
        !desde ||
        !hasta ||
        !busquedaKardex.trim()
      "
      @click="filtrarPorFechas"
    >
      <span
        v-if="loading"
        class="spinner-border spinner-border-sm me-2"
        role="status"
        aria-hidden="true"
      ></span>

      <i
        v-else
        class="bi bi-search me-1"
      ></i>

      {{ loading ? "Buscando..." : "Buscar" }}
    </button>
  </div>

  <!-- BOTÓN LIMPIAR -->
  <div
    class="col-12 col-sm-6 col-lg-2 d-flex align-items-end"
  >
    <button
      type="button"
      class="btn btn-outline-secondary w-100"
      :disabled="
        loading ||
        (
          !desde &&
          !hasta &&
          !busquedaKardex.trim()
        )
      "
      @click="limpiarFiltroFechas"
    >
      <i
        class="bi bi-arrow-counterclockwise me-1"
      ></i>

      Limpiar
    </button>
  </div>
</div>
            </div>

            <!-- TABLA -->
            <div class="kardex-content">
              <!-- INDICADOR AL BUSCAR SIN OCULTAR LA TABLA -->
              <div v-if="loading" class="alert alert-light border d-flex align-items-center mb-3" role="status">
                <span class="spinner-border spinner-border-sm text-primary me-2" aria-hidden="true"></span>

                Buscando movimientos entre las fechas seleccionadas...
              </div>

              <div class="table-responsive">
                <table class="kardex-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Código</th>
                      <th>Movimiento</th>
                      <th>Acción</th>
                      <th>Cantidad</th>
                      <th>Stock actual</th>

                      <th class="text-center">
                        Documento
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in kardexFiltrado" :key="item.id" :class="claseFilaMovimiento(
                      item.movimiento
                    )
                      ">
                      <!-- NÚMERO -->
                      <td>
                        {{ index + 1 }}
                      </td>

                      <!-- FECHA -->
                      <td>
                        {{ formatearFecha(item.fecha) }}
                      </td>

                      <!-- PRODUCTO -->
                      <td>
                        {{
                          item.producto?.nombre ??
                          "Producto no disponible"
                        }}
                      </td>

                      <!-- CÓDIGO -->
                      <td>
                        {{
                          item.producto?.codigo_producto ??
                          "S/C"
                        }}
                      </td>

                      <!-- MOVIMIENTO -->
                      <td>
                        <span class="badge-mov" :class="`badge-mov--${item.movimiento}`
                          ">
                          {{ item.movimiento }}
                        </span>
                      </td>

                      <!-- ACCIÓN -->
                      <td>
                        <span class="badge-accion">
                          {{ item.accion }}
                        </span>
                      </td>

                      <!-- CANTIDAD -->
                      <td :class="claseCantidad(
                        item.movimiento
                      )
                        ">
                        {{
                          item.movimiento === "salida"
                            ? "-"
                            : "+"
                        }}

                        {{ item.cantidad }}
                      </td>

                      <!-- STOCK ACTUAL -->
                      <td>
                        {{ item.stock_actual }}
                      </td>

                      <!-- DOCUMENTO -->
                      <td class="text-center">
                        <!-- TICKET DE VENTA -->
                        <button v-if="
                          esVenta(item) &&
                          item.folio_pago
                        " type="button" class="btn-action btn-action--venta" title="Abrir ticket de venta" @click="
                      descargarTicket(
                        item.folio_pago
                      )
                      ">
                          Ticket
                        </button>

                        <!-- DETALLE DE COMPRA -->
                        <button v-else-if="
                          esCompra(item) &&
                          item.compra_id
                        " type="button" class="btn-action btn-action--compra" title="Ver detalle de compra" @click="
                      verCompra(
                        item.compra_id
                      )
                      ">
                          Ver compra
                        </button>

                        <!-- VENTA SIN FOLIO -->
                        <span v-else-if="esVenta(item)" class="text-muted"
                          title="La venta no tiene un folio relacionado">
                          Sin folio
                        </span>

                        <!-- COMPRA SIN REGISTRO -->
                        <span v-else-if="esCompra(item)" class="text-muted"
                          title="La compra no tiene un registro relacionado">
                          Sin compra
                        </span>

                        <!-- OTRO MOVIMIENTO -->
                        <span v-else class="text-muted">
                          —
                        </span>
                      </td>
                    </tr>

                    <!-- SIN REGISTROS -->
                    <tr v-if="
                      !loading &&
                      kardexFiltrado.length === 0
                    ">
                      <td colspan="9" class="text-center text-muted py-5">
                        No hay registros en el Kardex con los filtros seleccionados.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>

    <!-- MODAL DETALLE COMPRA -->
    <div v-if="modalDetalle" class="modal fade show d-block modal-compra-overlay" tabindex="-1" role="dialog"
      aria-modal="true" aria-labelledby="titulo-modal-compra" @click.self="cerrarModalCompra">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
        <div class="modal-content border-0 rounded-4 shadow-lg">
          <!-- HEADER MODAL -->
          <div class="modal-header bg-dark text-white border-0 px-4 py-3">
            <div>
              <small class="text-white-50 d-block mb-1">
                Entrada de inventario
              </small>

              <h5 id="titulo-modal-compra" class="modal-title fw-bold mb-0">
                Detalle Compra -
                {{
                  compraDetalle?.folio ??
                  "Sin folio"
                }}
              </h5>
            </div>

            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar"
              @click.stop="cerrarModalCompra"></button>
          </div>

          <!-- BODY MODAL -->
          <div class="modal-body bg-body-tertiary p-4">
            <!-- CARGANDO DETALLE -->
            <div v-if="loadingDetalle" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">
                  Cargando...
                </span>
              </div>

              <p class="text-secondary mt-3 mb-0">
                Cargando detalle de compra...
              </p>
            </div>

            <!-- ERROR DETALLE -->
            <div v-else-if="errorDetalle" class="alert alert-danger" role="alert">
              {{ errorDetalle }}
            </div>

            <!-- INFORMACIÓN DE LA COMPRA -->
            <template v-else-if="compraDetalle">
              <div class="row g-3 mb-4">
                <!-- PROVEEDOR -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 rounded-3 shadow-sm">
                    <div class="card-body">
                      <small class="text-secondary d-block mb-1">
                        Proveedor
                      </small>

                      <strong class="text-dark d-block">
                        {{
                          compraDetalle?.provedor?.nombre ??
                          compraDetalle?.proveedor?.nombre ??
                          "Sin proveedor"
                        }}
                      </strong>
                    </div>
                  </div>
                </div>

                <!-- USUARIO -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 rounded-3 shadow-sm">
                    <div class="card-body">
                      <small class="text-secondary d-block mb-1">
                        Usuario
                      </small>

                      <strong class="text-dark d-block">
                        {{
                          compraDetalle?.user?.name ??
                          compraDetalle?.usuario?.name ??
                          "Sin usuario"
                        }}
                      </strong>
                    </div>
                  </div>
                </div>

                <!-- FECHA -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 rounded-3 shadow-sm">
                    <div class="card-body">
                      <small class="text-secondary d-block mb-1">
                        Fecha
                      </small>

                      <strong class="text-dark d-block">
                        {{
                          compraDetalle?.fecha_compra
                            ? formatearFecha(
                              compraDetalle.fecha_compra
                            )
                            : "Sin fecha"
                        }}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PRODUCTOS DE LA COMPRA -->
              <div class="card border-0 rounded-3 shadow-sm overflow-hidden">
                <div class="card-header bg-white border-bottom px-4 py-3">
                  <h6 class="fw-bold mb-0">
                    Productos de la compra
                  </h6>
                </div>

                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th class="ps-4">
                          Producto
                        </th>

                        <th class="text-end">
                          Cantidad
                        </th>

                        <th class="text-end">
                          Precio compra
                        </th>

                        <th class="text-end">
                          Subtotal
                        </th>

                        <th class="text-end">
                          Precio venta
                        </th>

                        <th class="text-end pe-4">
                          Ganancia
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="
detalle in
                            compraDetalle?.detalle_compras ??
                            []
                        " :key="detalle.id">
                        <!-- PRODUCTO -->
                        <td class="ps-4">
                          <strong class="d-block text-dark">
                            {{
                              detalle.producto?.nombre ??
                              "Producto no disponible"
                            }}
                          </strong>

                          <small class="text-secondary">
                            Código:
                            {{
                              detalle.producto
                                ?.codigo_producto ??
                              "S/C"
                            }}
                          </small>
                        </td>

                        <!-- CANTIDAD -->
                        <td class="text-end">
                          <span class="badge text-bg-secondary">
                            {{ detalle.cantidad }}
                          </span>
                        </td>

                        <!-- PRECIO COMPRA -->
                        <td class="text-end">
                          ${{
                            formatoMoneda(
                              detalle.precio_compra ??
                              0
                            )
                          }}
                        </td>

                        <!-- SUBTOTAL -->
                        <td class="text-end fw-bold">
                          ${{
                            formatoMoneda(
                              detalle.subtotal ??
                              0
                            )
                          }}
                        </td>

                        <!-- PRECIO VENTA -->
                        <td class="text-end">
                          ${{
                            formatoMoneda(
                              detalle.producto
                                ?.precio_unitario ??
                              0
                            )
                          }}
                        </td>

                        <!-- GANANCIA -->
                        <td class="text-end pe-4">
                          <span class="text-success fw-semibold">
                            ${{
                              formatoMoneda(
                                detalle.producto
                                  ?.ganancia ??
                                0
                              )
                            }}
                          </span>
                        </td>
                      </tr>

                      <!-- SIN PRODUCTOS -->
                      <tr v-if="
                        !compraDetalle
                          ?.detalle_compras
                          ?.length
                      ">
                        <td colspan="6" class="text-center text-secondary py-5">
                          Esta compra no tiene productos registrados.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TOTAL DE COMPRA -->
              <div class="d-flex justify-content-end mt-4">
                <div class="card border-0 bg-dark text-white rounded-3 shadow-sm">
                  <div class="card-body px-4 py-3">
                    <small class="text-white-50 d-block">
                      Total de compra
                    </small>

                    <strong class="fs-3">
                      ${{
                        formatoMoneda(
                          compraDetalle?.total ??
                          0
                        )
                      }}
                    </strong>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- FOOTER MODAL -->
          <div class="modal-footer bg-white border-0 px-4 py-3">
            <button type="button" class="btn btn-outline-secondary px-4" @click.stop="cerrarModalCompra">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- OVERLAY SIDEBAR MÓVIL -->
    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<style scoped>
.modal-compra-overlay {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1055;
}

.modal-compra-overlay .modal-dialog {
  position: relative;
  z-index: 1056;
}

.modal-compra-overlay .modal-content {
  overflow: hidden;
}

.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: -1;
}

.modal-content {
  overflow: hidden;
}

/* Grupo de botones de acción */
.btn-group-action {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* Botón base */
.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Botón Compra (Verde) */
.btn-action--compra {
  background-color: #d4edda;
  color: #155724;
}

.btn-action--compra:hover {
  background-color: #c3e6cb;
}

.btn-action--compra:active {
  background-color: #b1dfbb;
}

/* Botón Venta (Azul) */
.btn-action--venta {
  background-color: #cfe2ff;
  color: #084298;
}

.btn-action--venta:hover {
  background-color: #b6d4fe;
}

.btn-action--venta:active {
  background-color: #9ec5fe;
}

/* Botón Otros (Gris) */
.btn-action--otro {
  background-color: #e2e3e5;
  color: #383d41;
}

.btn-action--otro:hover {
  background-color: #d3d6d8;
}

.btn-action--otro:active {
  background-color: #c6c7ca;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background:
    radial-gradient(circle at top left, rgba(0, 109, 119, 0.12), transparent 32%),
    linear-gradient(135deg, #f6f8fb 0%, #eef3f8 100%);
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
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1019;
}

main {
  min-height: calc(100vh - 60px);
  padding: 28px;
}


.btn-ticket {
  background: #006d77;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: .3s;
}

.btn-ticket:hover {
  background: #00545c;
}

.btn-ticket i {
  margin-right: 4px;
}

/* CONTENEDOR */

.kardex-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px);
}

/* HEADER */

.kardex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
  padding: 30px;
  background:
    linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eef7f8 100%);
  border-bottom: 1px solid #e5eaf0;
}

.kardex-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
}

.kardex-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

/* BUSCADOR */

.kardex-search {
  width: 360px;
  position: relative;
}

.kardex-search .form-control {
  height: 50px;
  border-radius: 999px;
  border: 1px solid #d7e0ea;
  background: #ffffff;
  padding: 0 18px;
  font-size: 14px;
  color: #0f172a;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: all 0.2s ease;
}

.kardex-search .form-control:focus {
  border-color: #006d77;
  box-shadow:
    0 0 0 4px rgba(0, 109, 119, 0.12),
    0 14px 28px rgba(15, 23, 42, 0.08);
}

/* CONTENIDO */

.kardex-content {
  padding: 24px;
}

/* TABLA RESPONSIVE */

.table-responsive {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
}

.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.table-responsive::-webkit-scrollbar-track {
  background: transparent;
}

.kardex-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 14px;
}

.kardex-table thead th {
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  padding: 0 20px 10px;
  white-space: nowrap;
}

.kardex-table tbody tr {
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.055);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.kardex-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.09);
}

.kardex-table td {
  padding: 18px 20px;
  vertical-align: middle;
  white-space: nowrap;
  color: #334155;
  font-size: 14px;
  border-top: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
}

.kardex-table tbody tr td:first-child {
  border-radius: 18px 0 0 18px;
  border-left: 1px solid #eef2f7;
  font-weight: 800;
  color: #0f172a;
}

.kardex-table tbody tr td:last-child {
  border-radius: 0 18px 18px 0;
  border-right: 1px solid #eef2f7;
}

/* COLORES POR MOVIMIENTO */

.mov-entrada td {
  background: linear-gradient(135deg, #ecfdf5, #ffffff);
}

.mov-salida td {
  background: linear-gradient(135deg, #fffbeb, #ffffff);
}

.mov-ajuste td {
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.mov-devolucion td {
  background: linear-gradient(135deg, #fff1f2, #ffffff);
}

.mov-entrada td:first-child {
  border-left: 5px solid #10b981;
}

.mov-salida td:first-child {
  border-left: 5px solid #f59e0b;
}

.mov-ajuste td:first-child {
  border-left: 5px solid #3b82f6;
}

.mov-devolucion td:first-child {
  border-left: 5px solid #ef4444;
}

/* BADGE DE MOVIMIENTO (coincide con paleta de filas) */

.badge-mov {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.badge-mov--entrada {
  background: #d1fae5;
  color: #047857;
}

.badge-mov--salida {
  background: #fef3c7;
  color: #b45309;
}

.badge-mov--ajuste {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-mov--devolución,
.badge-mov--devolucion {
  background: #fee2e2;
  color: #b91c1c;
}

/* BADGE DE ACCIÓN */

.badge-accion {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  text-transform: capitalize;
}

/* CANTIDAD CON SIGNO */

.cantidad-positiva {
  color: #047857;
  font-weight: 800;
}

.cantidad-negativa {
  color: #b45309;
  font-weight: 800;
}

/* LOADER */

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #006d77;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  main {
    padding: 18px;
  }

  .kardex-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }

  .kardex-search {
    width: 100%;
  }

  .kardex-search .form-control {
    width: 100%;
  }

  .kardex-content {
    padding: 16px;
  }

  .kardex-table {
    min-width: 850px;
  }
}
</style>

<script>
import {
  ref,
  onMounted,
  computed,
} from "vue";

import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "KardexView",

  components: {
    Header,
    Sidebar,
  },

  setup() {
    /*
    |--------------------------------------------------------------------------
    | Estado general
    |--------------------------------------------------------------------------
    */
    const sidebarOpen = ref(false);
    const kardex = ref([]);
    const loading = ref(false);
    const error = ref(null);

    /*
    |--------------------------------------------------------------------------
    | Filtros
    |--------------------------------------------------------------------------
    |
    | busquedaKardex:
    | Guarda lo que el usuario está escribiendo.
    |
    | busquedaAplicada:
    | Filtra la tabla únicamente después de presionar Buscar.
    |
    */
    const desde = ref("");
    const hasta = ref("");
    const busquedaKardex = ref("");
    const busquedaAplicada = ref("");

    /*
    |--------------------------------------------------------------------------
    | Modal detalle de compra
    |--------------------------------------------------------------------------
    */
    const modalDetalle = ref(false);
    const compraDetalle = ref(null);
    const loadingDetalle = ref(false);
    const errorDetalle = ref(null);

    /*
    |--------------------------------------------------------------------------
    | Filtrar por nombre o código
    |--------------------------------------------------------------------------
    |
    | No utiliza busquedaKardex directamente para evitar que filtre
    | automáticamente mientras el usuario escribe.
    |
    */
    const kardexFiltrado = computed(() => {
      const busqueda = busquedaAplicada.value
        .trim()
        .toLowerCase();

      if (!busqueda) {
        return kardex.value;
      }

      return kardex.value.filter((item) => {
        const nombre = String(
          item.producto?.nombre ?? ""
        ).toLowerCase();

        const codigo = String(
          item.producto?.codigo_producto ?? ""
        ).toLowerCase();

        return (
          nombre.includes(busqueda) ||
          codigo.includes(busqueda)
        );
      });
    });

    /*
    |--------------------------------------------------------------------------
    | Obtener Kardex
    |--------------------------------------------------------------------------
    |
    | aplicarFechas = false:
    | Carga todos los movimientos.
    |
    | aplicarFechas = true:
    | Envía desde y hasta al backend.
    |
    */
    const obtenerKardex = async (
      aplicarFechas = false
    ) => {
      loading.value = true;
      error.value = null;

      try {
        const params = aplicarFechas
          ? {
            desde: desde.value,
            hasta: hasta.value,
          }
          : {};

        const response = await api.get(
          "/getkardex",
          {
            params,
          }
        );

        const registros = Array.isArray(
          response.data
        )
          ? response.data
          : response.data?.data || [];

        kardex.value = registros.map(
          (item) => ({
            ...item,

            movimiento: String(
              item.movimiento ?? ""
            ).toLowerCase(),

            accion: String(
              item.accion ?? ""
            ).toLowerCase(),

            folio_pago:
              item.folio_pago ??
              item.venta?.folio_pago ??
              null,

            compra_id:
              item.compra_id ??
              item.compra?.id ??
              null,
          })
        );

        return true;
      } catch (e) {
        error.value =
          e.response?.data?.message ||
          "Error al cargar los datos del Kardex.";

        console.error(
          "Error al cargar el Kardex:",
          e
        );

        return false;
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Buscar Kardex
    |--------------------------------------------------------------------------
    |
    | Valida obligatoriamente:
    | - Fecha desde
    | - Fecha hasta
    | - Código o nombre del producto
    |
    */
    const filtrarPorFechas = async () => {
      error.value = null;

      const producto =
        busquedaKardex.value.trim();

      if (!desde.value) {
        error.value =
          "Selecciona la fecha desde.";

        return;
      }

      if (!hasta.value) {
        error.value =
          "Selecciona la fecha hasta.";

        return;
      }

      if (!producto) {
        error.value =
          "Escribe el código o nombre del producto.";

        return;
      }

      if (desde.value > hasta.value) {
        error.value =
          "La fecha desde no puede ser mayor que la fecha hasta.";

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Consultar movimientos por fechas
      |--------------------------------------------------------------------------
      */
      const consultaCorrecta =
        await obtenerKardex(true);

      if (!consultaCorrecta) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Aplicar producto después de consultar
      |--------------------------------------------------------------------------
      */
      busquedaAplicada.value = producto;
    };

    /*
    |--------------------------------------------------------------------------
    | Limpiar filtros
    |--------------------------------------------------------------------------
    */
    const limpiarFiltroFechas = async () => {
      desde.value = "";
      hasta.value = "";
      busquedaKardex.value = "";
      busquedaAplicada.value = "";
      error.value = null;

      await obtenerKardex(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Descargar ticket de venta
    |--------------------------------------------------------------------------
    */
    const descargarTicket = async (
      folioPago
    ) => {
      if (!folioPago) {
        error.value =
          "Este movimiento no tiene un folio de venta.";

        return;
      }

      error.value = null;

      const nuevaPestana = window.open(
        "",
        "_blank"
      );

      if (!nuevaPestana) {
        error.value =
          "El navegador bloqueó la nueva pestaña.";

        return;
      }

      nuevaPestana.document.write(`
        <div
          style="
            font-family: Arial, sans-serif;
            padding: 30px;
          "
        >
          Generando ticket...
        </div>
      `);

      try {
        const response = await api.get(
          `/ticked/${encodeURIComponent(
            folioPago
          )}`,
          {
            responseType: "blob",
          }
        );

        const pdfBlob = new Blob(
          [response.data],
          {
            type: "application/pdf",
          }
        );

        const pdfUrl =
          window.URL.createObjectURL(
            pdfBlob
          );

        nuevaPestana.location.href =
          pdfUrl;

        setTimeout(() => {
          window.URL.revokeObjectURL(
            pdfUrl
          );
        }, 60000);
      } catch (e) {
        nuevaPestana.close();

        error.value =
          e.response?.data?.message ||
          "Error al abrir el ticket.";

        console.error(
          "Error al abrir el ticket:",
          e
        );
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Formatear fecha
    |--------------------------------------------------------------------------
    */
    const formatearFecha = (fecha) => {
      if (!fecha) {
        return "Sin fecha";
      }

      const fechaConvertida = new Date(
        fecha
      );

      if (
        Number.isNaN(
          fechaConvertida.getTime()
        )
      ) {
        return "Fecha inválida";
      }

      return fechaConvertida.toLocaleString(
        "es-MX",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Formatear moneda
    |--------------------------------------------------------------------------
    */
    const formatoMoneda = (valor) => {
      return Number(
        valor || 0
      ).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    /*
    |--------------------------------------------------------------------------
    | Clases para movimientos
    |--------------------------------------------------------------------------
    */
    const claseFilaMovimiento = (
      movimiento
    ) => ({
      "mov-entrada":
        movimiento === "entrada",

      "mov-salida":
        movimiento === "salida",
    });

    const claseCantidad = (
      movimiento
    ) => {
      return movimiento === "salida"
        ? "cantidad-negativa"
        : "cantidad-positiva";
    };

    /*
    |--------------------------------------------------------------------------
    | Identificar ventas y compras
    |--------------------------------------------------------------------------
    */
    const esVenta = (item) => {
      const accion = String(
        item.accion ?? ""
      ).toLowerCase();

      return (
        item.movimiento === "salida" &&
        accion.includes("venta")
      );
    };

    const esCompra = (item) => {
      const accion = String(
        item.accion ?? ""
      ).toLowerCase();

      return (
        item.movimiento === "entrada" &&
        accion.includes("compra")
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Ver detalle de compra
    |--------------------------------------------------------------------------
    */
    const verCompra = async (id) => {
      if (!id) {
        error.value =
          "Este movimiento no tiene una compra relacionada.";

        return;
      }

      modalDetalle.value = true;
      compraDetalle.value = null;
      loadingDetalle.value = true;
      errorDetalle.value = null;

      try {
        const response = await api.get(
          `/compras/id/${id}`
        );

        compraDetalle.value =
          response.data;
      } catch (e) {
        console.error(
          "Error al obtener la compra:",
          e
        );

        errorDetalle.value =
          e.response?.data?.message ||
          "No se pudo cargar el detalle de la compra.";
      } finally {
        loadingDetalle.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cerrar modal
    |--------------------------------------------------------------------------
    */
    const cerrarModalCompra = () => {
      modalDetalle.value = false;
      compraDetalle.value = null;
      errorDetalle.value = null;
      loadingDetalle.value = false;
    };

    /*
    |--------------------------------------------------------------------------
    | Precargar todo el Kardex
    |--------------------------------------------------------------------------
    */
    onMounted(() => {
      obtenerKardex(false);
    });

    return {
      sidebarOpen,
      kardex,
      loading,
      error,

      desde,
      hasta,
      busquedaKardex,
      busquedaAplicada,
      kardexFiltrado,

      filtrarPorFechas,
      limpiarFiltroFechas,

      modalDetalle,
      compraDetalle,
      loadingDetalle,
      errorDetalle,

      obtenerKardex,
      formatearFecha,
      formatoMoneda,
      claseFilaMovimiento,
      claseCantidad,

      descargarTicket,
      esVenta,
      esCompra,
      verCompra,
      cerrarModalCompra,
    };
  },
};
</script>