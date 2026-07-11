<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid p-4">

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div
            v-if="error"
            class="alert alert-danger alert-dismissible fade show"
        >
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
            <button
                type="button"
                class="btn-close"
                @click="error = null"
            ></button>
        </div>

        <div
            v-if="!loading"
            class="kardex-container"
        >

            <div class="kardex-header">

                <div>
                    <h2>Kardex de Inventario</h2>
                    <p>Control y seguimiento de movimientos de inventario</p>
                </div>

                <div class="kardex-search">

                    <input
                        type="text"
                        class="form-control"
                        placeholder="Buscar producto por código o nombre"
                        v-model="busquedaKardex"
                    />

                </div>

            </div>

            <div class="kardex-content">

                <div class="table-responsive">

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
                <th>Stock Actual</th>
                <th>Ticket</th>
            </tr>
        </thead>

        <tbody>

            <tr
                v-for="(item,index) in kardexFiltrado"
                :key="item.id"
                :class="claseFilaMovimiento(item.movimiento)"
            >
                <td>{{ index + 1 }}</td>

                <td>{{ formatearFecha(item.fecha) }}</td>

                <td>{{ item.producto.nombre }}</td>

                <td>{{ item.producto.codigo_producto }}</td>

                <td>
                    <span
                        class="badge-mov"
                        :class="`badge-mov--${(item.movimiento || '').toLowerCase()}`"
                    >
                        {{ item.movimiento }}
                    </span>
                </td>

                <td>
                    <span class="badge-accion">
                        {{ item.accion }}
                    </span>
                </td>

                <td :class="claseCantidad(item.movimiento)">
                    {{ item.movimiento?.toLowerCase() === 'salida' ? '-' : '+' }}{{ item.cantidad }}
                </td>

                <td>{{ item.stock_actual }}</td>

                <!-- BOTÓN DEL TICKET -->
                <td>
                    <button
                        class="btn-ticket"
                        @click="abrirTicket(item.usuario.id)"
                    >
                        <i class="bi bi-receipt-cutoff me-1"></i>
                        
                    </button>
                </td>

            </tr>

            <tr v-if="kardexFiltrado.length === 0">
                <td colspan="9" class="text-center text-muted py-5">
                    No hay registros en el Kardex.
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

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<style scoped>
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


.btn-ticket{
    background:#006d77;
    color:#fff;
    border:none;
    padding:8px 14px;
    border-radius:10px;
    cursor:pointer;
    font-size:13px;
    font-weight:600;
    transition:.3s;
}

.btn-ticket:hover{
    background:#00545c;
}

.btn-ticket i{
    margin-right:4px;
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
import { ref, onMounted, computed } from "vue";
import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "KardexView",
  components: { Header, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const kardex = ref([]);
    const busquedaKardex = ref("");
    const loading = ref(false);
    const error = ref(null);

    // Computed para filtrar productos
    const kardexFiltrado = computed(() => {
      if (!busquedaKardex.value) return kardex.value;
      return kardex.value.filter((item) => {
        const nombre = item.producto?.nombre?.toLowerCase() || "";
        const codigo = item.producto?.codigo_producto?.toLowerCase() || "";
        return (
          nombre.includes(busquedaKardex.value.toLowerCase()) ||
          codigo.includes(busquedaKardex.value.toLowerCase())
        );
      });
    });

    const abrirTicket = (user_id) => {
      if (!user_id) {
        error.value = "No existe usuario.";
        return;
      }

      const baseURL = api.defaults.baseURL.replace(/\/$/, "");

      // El "?t=" evita que el navegador reutilice el PDF cacheado
      // cuando se cambia el user_id en la misma pestaña.
      const url = `${baseURL}/kardex/ticket-usuario/${user_id}?t=${Date.now()}`;

      window.open(url, "_blank");
    };

    // Función para cargar el Kardex
    const obtenerKardex = async () => {
      loading.value = true;
      try {
        const res = await api.get("/getkardex"); // endpoint de tu backend
        kardex.value = res.data;
      } catch (e) {
        error.value = "Error al cargar los datos del Kardex.";
      } finally {
        loading.value = false;
      }
    };

    const formatearFecha = (fecha) => {
      const d = new Date(fecha);
      return d.toLocaleString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Clases de fila según tipo de movimiento (case-insensitive)
    const claseFilaMovimiento = (mov) => {
      const m = (mov || "").toLowerCase();
      return {
        "mov-entrada": m === "entrada",
        "mov-salida": m === "salida",
        "mov-ajuste": m === "ajuste",
        "mov-devolucion": m === "devolución" || m === "devolucion",
      };
    };

    // Clase de color para la cantidad (+ / -)
    const claseCantidad = (mov) => {
      return (mov || "").toLowerCase() === "salida"
        ? "cantidad-negativa"
        : "cantidad-positiva";
    };

    onMounted(() => {
      obtenerKardex();
    });

    return {
      sidebarOpen,
      kardex,
      busquedaKardex,
      kardexFiltrado,
      loading,
      error,
      formatearFecha,
      claseFilaMovimiento,
      claseCantidad,
      abrirTicket,
    };
  },
};
</script>

