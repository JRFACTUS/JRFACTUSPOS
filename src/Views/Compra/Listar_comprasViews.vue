
<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- SIDEBAR -->
    <Sidebar
      :class="{ 'd-none d-lg-flex': !sidebarOpen }"
      @close-sidebar="sidebarOpen = false"
    />

    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid pt-5 pt-lg-4 mt-4">
        <!-- CARGANDO PERMISOS -->
        <div
          v-if="!permisos"
          class="text-center py-5"
        >
          <div
            class="spinner-border text-primary"
            role="status"
          ></div>
        </div>

        <!-- SIN PERMISO PARA LISTAR -->
        <div
          v-if="
            permisos &&
            !permisos?.listar
          "
          class="alert alert-warning text-center"
        >
          No tienes permiso para ver las compras.
        </div>

        <!-- CONTENIDO DEL HISTORIAL -->
        <div v-if="permisos?.listar">
          <!-- ENCABEZADO -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="fw-bold mb-0">
                Compras
              </h2>

              <small class="text-muted">
                Historial de compras registradas
              </small>
            </div>

            <!-- PERMISO CREAR -->
            <router-link
              v-if="permisos?.crear"
              to="/compras"
              class="btn btn-primary"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Nueva Compra
            </router-link>
          </div>

          <!-- ERROR -->
          <div
            v-if="error"
            class="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {{ error }}

            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar"
              @click="error = ''"
            ></button>
          </div>

          <!-- MENSAJE SIN RESULTADOS -->
          <div
            v-if="
              mensaje &&
              !loading &&
              comprasFiltradas.length === 0
            "
            class="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
            {{ mensaje }}

            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar"
              @click="mensaje = ''"
            ></button>
          </div>

          <!-- FILTROS -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <!-- FECHA INICIAL -->
                <div class="col-12 col-md-5">
                  <label
                    for="fecha-inicial"
                    class="form-label fw-semibold"
                  >
                    Fecha Inicial
                  </label>

                  <input
                    id="fecha-inicial"
                    v-model="filtroFechaInicio"
                    type="date"
                    class="form-control"
                    :max="
                      filtroFechaFin ||
                      undefined
                    "
                    :disabled="loading"
                  />
                </div>

                <!-- FECHA FINAL -->
                <div class="col-12 col-md-5">
                  <label
                    for="fecha-final"
                    class="form-label fw-semibold"
                  >
                    Fecha Final
                  </label>

                  <input
                    id="fecha-final"
                    v-model="filtroFechaFin"
                    type="date"
                    class="form-control"
                    :min="
                      filtroFechaInicio ||
                      undefined
                    "
                    :disabled="loading"
                  />
                </div>

                <!-- BOTÓN LIMPIAR -->
                <div class="col-12 col-md-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary w-100"
                    :disabled="
                      loading ||
                      (
                        !filtroFechaInicio &&
                        !filtroFechaFin
                      )
                    "
                    @click="limpiarFiltros"
                  >
                    <i
                      class="bi bi-arrow-counterclockwise me-2"
                    ></i>

                    Limpiar todo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLA -->
          <div class="card shadow-sm border-0">
            <div
              class="card-header bg-white d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">
                Listado de Compras
              </h5>
            </div>

            <!-- CARGANDO -->
            <div
              v-if="loading"
              class="text-center py-5"
            >
              <div
                class="spinner-border text-primary"
                role="status"
              >
                <span class="visually-hidden">
                  Cargando...
                </span>
              </div>

              <p class="text-muted mt-3 mb-0">
                Cargando compras...
              </p>
            </div>

            <!-- CONTENIDO DE TABLA -->
            <div
              v-else
              class="table-responsive"
            >
              <table
                class="table table-hover align-middle mb-0"
              >
                <thead class="table-light">
                  <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Usuario</th>
                    <th>Total</th>

                    <th width="180">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="compra in comprasFiltradas"
                    :key="compra.id"
                  >
                    <td>
                      {{
                        compra.folio ||
                        "Sin folio"
                      }}
                    </td>

                    <td>
                      {{
                        compra.fecha_compra ||
                        "Sin fecha"
                      }}
                    </td>

                    <td>
                      {{
                        compra.provedor?.nombre ||
                        "Sin proveedor"
                      }}
                    </td>

                    <td>
                      {{
                        compra.user?.name ||
                        "Sin usuario"
                      }}
                    </td>

                    <td class="fw-semibold">
                      $
                      {{
                        formatoMoneda(
                          compra.total
                        )
                      }}
                    </td>

                    <td>
                      <!-- VER DETALLE -->
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary me-1"
                        title="Ver detalle"
                        @click="
                          verCompra(compra.id)
                        "
                      >
                        <i class="bi bi-eye"></i>
                      </button>

                      <!-- IMPRIMIR -->
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-success me-1"
                        title="Imprimir compra"
                        @click="
                          imprimirCompra(
                            compra.folio
                          )
                        "
                      >
                        <i class="bi bi-printer"></i>
                      </button>

                      <!-- PERMISO ELIMINAR -->
                      <button
                        v-if="permisos?.eliminar"
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        title="Eliminar compra"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <!-- SIN RESULTADOS -->
                  <tr
                    v-if="
                      comprasFiltradas.length === 0
                    "
                  >
                    <td
                      colspan="6"
                      class="text-center py-5 text-muted"
                    >
                      <i
                        class="bi bi-inbox fs-2 d-block mb-2"
                      ></i>

                      No se encontraron compras en las fechas seleccionadas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MODAL DETALLE COMPRA -->
          <div
            v-if="modalDetalle"
            class="modal fade show d-block"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            style="
              background:
                rgba(0, 0, 0, 0.55)
            "
            @click.self="cerrarModal"
          >
            <div
              class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
              role="document"
            >
              <div
                class="modal-content border-0 shadow-lg"
              >
                <!-- HEADER MODAL -->
                <div class="modal-header">
                  <div>
                    <small class="text-muted">
                      Entrada de inventario
                    </small>

                    <h5 class="modal-title mb-0">
                      Detalle Compra -
                      {{
                        compraDetalle?.folio ||
                        "Sin folio"
                      }}
                    </h5>
                  </div>

                  <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar"
                    @click="cerrarModal"
                  ></button>
                </div>

                <!-- BODY MODAL -->
                <div class="modal-body">
                  <!-- INFORMACIÓN GENERAL -->
                  <div class="row g-3 mb-4">
                    <div class="col-12 col-md-4">
                      <div
                        class="border rounded p-3 h-100"
                      >
                        <small
                          class="text-muted d-block mb-1"
                        >
                          Proveedor
                        </small>

                        <strong>
                          {{
                            compraDetalle
                              ?.provedor
                              ?.nombre ||
                            "Sin proveedor"
                          }}
                        </strong>
                      </div>
                    </div>

                    <div class="col-12 col-md-4">
                      <div
                        class="border rounded p-3 h-100"
                      >
                        <small
                          class="text-muted d-block mb-1"
                        >
                          Usuario
                        </small>

                        <strong>
                          {{
                            compraDetalle
                              ?.user
                              ?.name ||
                            "Sin usuario"
                          }}
                        </strong>
                      </div>
                    </div>

                    <div class="col-12 col-md-4">
                      <div
                        class="border rounded p-3 h-100"
                      >
                        <small
                          class="text-muted d-block mb-1"
                        >
                          Fecha
                        </small>

                        <strong>
                          {{
                            compraDetalle
                              ?.fecha_compra ||
                            "Sin fecha"
                          }}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <!-- TABLA DETALLE -->
                  <div class="table-responsive">
                    <table
                      class="table table-bordered align-middle"
                    >
                      <thead class="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Compra</th>
                          <th>Subtotal</th>
                          <th>Precio Venta</th>
                          <th>Ganancia</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr
                          v-for="
                            item in
                              compraDetalle
                                ?.detalle_compras ||
                              []
                          "
                          :key="item.id"
                        >
                          <td>
                            {{
                              item.producto
                                ?.nombre ||
                              "Sin producto"
                            }}
                          </td>

                          <td>
                            {{ item.cantidad }}
                          </td>

                          <td>
                            $
                            {{
                              formatoMoneda(
                                item.precio_compra
                              )
                            }}
                          </td>

                          <td>
                            $
                            {{
                              formatoMoneda(
                                item.subtotal
                              )
                            }}
                          </td>

                          <td>
                            $
                            {{
                              formatoMoneda(
                                item.producto
                                  ?.precio_unitario
                              )
                            }}
                          </td>

                          <td>
                            $
                            {{
                              formatoMoneda(
                                item.producto
                                  ?.ganancia
                              )
                            }}
                          </td>
                        </tr>

                        <tr
                          v-if="
                            !compraDetalle
                              ?.detalle_compras ||
                            compraDetalle
                              .detalle_compras
                              .length === 0
                          "
                        >
                          <td
                            colspan="6"
                            class="text-center py-4 text-muted"
                          >
                            No hay productos en esta compra.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- TOTAL -->
                  <div
                    class="d-flex justify-content-end mt-4"
                  >
                    <div class="text-end">
                      <small
                        class="text-muted d-block"
                      >
                        Total de la compra
                      </small>

                      <h4 class="fw-bold mb-0">
                        $
                        {{
                          formatoMoneda(
                            compraDetalle?.total ||
                            0
                          )
                        }}
                      </h4>
                    </div>
                  </div>
                </div>

                <!-- FOOTER MODAL -->
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="cerrarModal"
                  >
                    Cerrar
                  </button>

                  <button
                    type="button"
                    class="btn btn-success"
                    @click="
                      imprimirCompra(
                        compraDetalle?.folio
                      )
                    "
                  >
                    <i
                      class="bi bi-printer me-2"
                    ></i>

                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- OVERLAY SIDEBAR MÓVIL -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay d-lg-none"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  computed,
  watch
} from "vue";

import api, {
  obtenerPermisosPorModulo
} from "@/services/api.js";

import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "ComprasView",

  components: {
    Header,
    Sidebar
  },

  setup() {
    const sidebarOpen = ref(true);

    const compras = ref([]);
    const loading = ref(false);
    const mensaje = ref("");
    const error = ref("");

    /*
     * null significa que los permisos aún no cargan.
     */
    const permisos = ref(null);

    /*
    |--------------------------------------------------------------------------
    | Permisos
    |--------------------------------------------------------------------------
    */
    const permisoActivo = (valor) => {
      return (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true"
      );
    };

    const fetchPermisos = async () => {
      try {
        const respuesta =
          await obtenerPermisosPorModulo(
            "listar_compras"
          );

        permisos.value = {
          listar: permisoActivo(
            respuesta?.listar
          ),

          crear: permisoActivo(
            respuesta?.crear
          ),

          actualizar: permisoActivo(
            respuesta?.actualizar
          ),

          eliminar: permisoActivo(
            respuesta?.eliminar
          )
        };
      } catch (err) {
        permisos.value = {
          listar: false,
          crear: false,
          actualizar: false,
          eliminar: false
        };

        error.value =
          "No fue posible cargar los permisos de compras.";
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Modal detalle
    |--------------------------------------------------------------------------
    */
    const modalDetalle = ref(false);
    const compraDetalle = ref(null);

    /*
    |--------------------------------------------------------------------------
    | Filtros por fecha
    |--------------------------------------------------------------------------
    */
    const filtroFechaInicio = ref("");
    const filtroFechaFin = ref("");

    /*
    |--------------------------------------------------------------------------
    | Formato moneda
    |--------------------------------------------------------------------------
    */
    const formatoMoneda = (valor) => {
      return Number(
        valor || 0
      ).toLocaleString(
        "es-MX",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Cargar compras
    |--------------------------------------------------------------------------
    */
    const cargarCompras = async () => {
      if (!permisos.value?.listar) {
        compras.value = [];
        return;
      }

      error.value = "";
      mensaje.value = "";

      if (
        filtroFechaInicio.value &&
        filtroFechaFin.value &&
        filtroFechaFin.value <
          filtroFechaInicio.value
      ) {
        compras.value = [];

        error.value =
          "La fecha final no puede ser menor que la fecha inicial.";

        return;
      }

      loading.value = true;

      try {
        const response = await api.get(
          "/historial",
          {
            params: {
              desde:
                filtroFechaInicio.value ||
                undefined,

              hasta:
                filtroFechaFin.value ||
                undefined
            }
          }
        );

        const resultado =
          Array.isArray(response.data)
            ? response.data
            : response.data?.compras || [];

        compras.value = resultado;

        mensaje.value =
          response.data?.message ||
          (
            resultado.length === 0
              ? "No se encontraron compras en las fechas seleccionadas."
              : ""
          );
      } catch (err) {
        compras.value = [];

        error.value =
          err.response?.data?.message ||
          "No se pudieron cargar las compras.";

       
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Compras para la tabla
    |--------------------------------------------------------------------------
    */
    const comprasFiltradas = computed(() => {
      return compras.value;
    });

    /*
    |--------------------------------------------------------------------------
    | Ver detalle
    |--------------------------------------------------------------------------
    */
    const verCompra = async (id) => {
      if (!permisos.value?.listar) {
        error.value =
          "No tienes permiso para ver las compras.";

        return;
      }

      if (!id) {
        error.value =
          "No se encontró el identificador de la compra.";

        return;
      }

      try {
        error.value = "";

        const response = await api.get(
          `/compras/id/${id}`
        );

        compraDetalle.value =
          response.data;

        modalDetalle.value = true;
      } catch (err) {
      

        error.value =
          err.response?.data?.message ||
          "No se pudo cargar el detalle de la compra.";
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Cerrar modal
    |--------------------------------------------------------------------------
    */
    const cerrarModal = () => {
      modalDetalle.value = false;
      compraDetalle.value = null;
    };

    /*
    |--------------------------------------------------------------------------
    | Imprimir compra
    |--------------------------------------------------------------------------
    */
    const imprimirCompra = (folio) => {
      if (!permisos.value?.listar) {
        error.value =
          "No tienes permiso para ver las compras.";

        return;
      }

      if (!folio) {
        error.value =
          "La compra no tiene un folio válido.";

        return;
      }

      const base =
        api.defaults.baseURL.replace(
          /\/$/,
          ""
        );

      window.open(
        `${base}/compras/pdf/${folio}`,
        "_blank"
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Limpiar filtros
    |--------------------------------------------------------------------------
    */
    const limpiarFiltros = () => {
      filtroFechaInicio.value = "";
      filtroFechaFin.value = "";
      mensaje.value = "";
      error.value = "";

      cargarCompras();
    };

    /*
    |--------------------------------------------------------------------------
    | Escuchar cambios de fecha
    |--------------------------------------------------------------------------
    */
    watch(
      [
        filtroFechaInicio,
        filtroFechaFin
      ],
      () => {
        cargarCompras();
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Inicialización
    |--------------------------------------------------------------------------
    */
    onMounted(async () => {
      await fetchPermisos();

      if (permisos.value?.listar) {
        await cargarCompras();
      }
    });

    return {
      sidebarOpen,

      compras,
      comprasFiltradas,

      loading,
      mensaje,
      error,

      permisos,

      modalDetalle,
      compraDetalle,

      filtroFechaInicio,
      filtroFechaFin,

      formatoMoneda,
      cargarCompras,
      verCompra,
      cerrarModal,
      imprimirCompra,
      limpiarFiltros
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
