<template>
  <div class="dashboard-page">
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="dashboard-main">
        <section class="top-panel">
          <div>
            <span class="eyebrow">JRFactu CFDI 4.0</span>
            <h1>Panel de administración</h1>
            <p>
              Controla ventas, compras, clientes, productos y facturación electrónica.
            </p>
          </div>
        </section>

        <section class="metrics-grid">
          <div v-for="(card, index) in resumenCards" :key="index" class="metric-card" :class="`metric-${card.color}`">
            <div class="metric-icon">
              <i :class="`bi ${card.icon}`"></i>
            </div>

            <div>
              <span>{{ card.title }}</span>
              <strong>{{ card.value }}</strong>
            </div>
          </div>
        </section>

        <section class="workspace-grid">
          <div class="panel-card wide">
            <div class="panel-header">
              <div>
                <h5>Ventas por mes</h5>

                <span v-if="mesTop">
                  Mejor mes:
                  <strong>{{ mesTop.label }}</strong>
                  (${{ formatoMoneda(mesTop.total) }})
                </span>

                <span v-else>Ingresos registrados en el sistema</span>
              </div>

              <div class="d-flex gap-2">
                <select v-model="mesSeleccionado" @change="cargarVentasPorMes" class="form-select form-select-sm"
                  style="width: auto">
                  <option value="">Todos los meses</option>
                  <option v-for="(nombre, num) in mesesDisponibles" :key="num" :value="num">
                    {{ nombre }}
                  </option>
                </select>

                <select v-model="anioSeleccionado" @change="cargarVentasPorMes" class="form-select form-select-sm"
                  style="width: auto">
                  <option v-for="a in aniosDisponibles" :key="a" :value="a">
                    {{ a }}
                  </option>
                </select>
              </div>
            </div>

            <div class="chart-area">
              <canvas id="ventasChart"></canvas>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-header">
              <div>
                <h5>Usuarios</h5>
                <span>Registrados</span>
              </div>
              <i class="bi bi-people"></i>
            </div>

            <div class="chart-area">
              <canvas id="usuariosChart"></canvas>
            </div>
          </div>
        </section>

        <section class="quick-grid">
          <div class="quick-card">
            <router-link to="/facturacion/listar_factura" class="quick-card text-decoration-none">
              <i class="bi bi-receipt"></i>
              <div>
                <h6>Facturas emitidas</h6>
                <h3>{{ totalFacturas }}</h3>
                <p>Consulta CFDI generados.</p>
              </div>
            </router-link>
          </div>

          <div class="quick-card">
            <i class="bi bi-receipt-cutoff"></i>
            <div>
              <h6>Ventas facturadas hoy</h6>
    <h3>{{ totalVentasFacturadasHoy }}</h3>
    <p>Haz clic para ver las ventas facturadas de hoy.</p>
            </div>
          </div>

          
        </section>
      </main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import {
  Chart,
  ArcElement,
  PieController,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import Swal from "sweetalert2";

Chart.register(ArcElement, PieController, DoughnutController, Tooltip, Legend);

export default {
  name: "DashboardViews",
  components: { Header, Sidebar },

  setup() {
    const sidebarOpen = ref(true);

    const resumenCards = ref([
      {
        title: "Usuarios",
        value: 0,
        icon: "bi-person-circle",
        color: "primary",
      },
      {
        title: "Clientes",
        value: 0,
        icon: "bi-people-fill",
        color: "success",
      },
      {
        title: "Productos",
        value: 0,
        icon: "bi-box-seam",
        color: "info",
      },
      {
        title: "Ventas",
        value: 0,
        icon: "bi-currency-dollar",
        color: "warning",
      },
      {
        title: "Compras",
        value: 0,
        icon: "bi-cart-check",
        color: "danger",
      },
      {
        title: "Ajustes",
        value: 8,
        icon: "bi-gear-fill",
        color: "secondary",
      },
    ]);

    let usuariosChart = null;
    let ventasChart = null;

    const anioSeleccionado = ref(new Date().getFullYear());
    const mesSeleccionado = ref("");
    const aniosDisponibles = ref([]);
    const mesesDisponibles = ref({});
    const mesTop = ref(null);
    const totalFacturas = ref(0);
const totalVentasFacturadasHoy = ref(0);
    const formatoMoneda = (valor) => {
      return Number(valor || 0).toLocaleString("es-MX");
    };

    const cargarUsuarios = async () => {
      try {
        const { data } = await api.get("/getcount");

        const cantidadUsuarios = data.usuarios || 0;
        const cantidadClientes = data.clientes || 0;
        const cantidadProductos = data.productos || 0;
        const totalVentas = data.ventas || 0;
        const totalCompra = data.compras || 0;

        resumenCards.value[0].value = cantidadUsuarios;
        resumenCards.value[1].value = cantidadClientes;
        resumenCards.value[2].value = cantidadProductos;
        resumenCards.value[3].value = `$${formatoMoneda(totalVentas)}`;
        resumenCards.value[4].value = `$${formatoMoneda(totalCompra)}`;

        await nextTick();
        dibujarGraficoUsuarios(cantidadUsuarios, cantidadClientes);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    const cargarVentasPorMes = async () => {
      try {
        const { data } = await api.get("/ventas-por-mes", {
          params: {
            anio: anioSeleccionado.value,
            mes: mesSeleccionado.value || undefined,
          },
        });

        if (!data.success) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message || "No se pudo consultar ventas.",
          });
          return;
        }

        aniosDisponibles.value = data.anios || [];
        mesesDisponibles.value = data.meses || {};

        if (!data.data || data.data.length === 0) {
          mesTop.value = null;

          if (ventasChart) {
            ventasChart.destroy();
            ventasChart = null;
          }

          Swal.fire({
            icon: "info",
            title: "Sin ventas",
            text: data.message || "No se encontraron ventas para ese periodo.",
          });

          return;
        }

        const labels = data.data.map((v) => v.label);
        const totales = data.data.map((v) => Number(v.total || 0));

        mesTop.value = data.data.reduce(
          (max, v) => (Number(v.total) > Number(max.total) ? v : max),
          data.data[0]
        );

        await nextTick();
        dibujarGraficoVentas(labels, totales);
      } catch (error) {
        console.error("Error obteniendo ventas por mes:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al consultar las ventas.",
        });
      }
    };

    const cargarTotalCfdi = async () => {
      try {
        const { data } = await api.post("/cfdi/totalcfdi");

        totalFacturas.value = Number(data.total_facturas || 0);
      } catch (error) {
        console.error("Error obteniendo total CFDI:", error);
      }
    };

    const obtenerVentasFacturadasHoy = async () => {
  try {
    const response = await api.get("/ventas/facturadas/hoy");

    if (response.data.success) {
      totalVentasFacturadasHoy.value = response.data.total;
    }
  } catch (error) {
    console.error("Error al obtener las ventas facturadas de hoy:", error);
  }
};
    const dibujarGraficoUsuarios = (usuarios, clientes) => {
      const ctx = document.getElementById("usuariosChart");
      if (!ctx) return;

      if (usuariosChart) {
        usuariosChart.destroy();
      }

      usuariosChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Usuarios", "Clientes"],
          datasets: [
            {
              data: [usuarios, clientes],
              backgroundColor: ["#28a745", "#0d6efd"],
              borderColor: ["#1e7e34", "#0a58ca"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "55%",
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    };

    const dibujarGraficoVentas = (labels, totales) => {
      const ctx = document.getElementById("ventasChart");
      if (!ctx) return;

      if (ventasChart) {
        ventasChart.destroy();
      }

      const colores = [
        "#0d6efd",
        "#28a745",
        "#ffc107",
        "#dc3545",
        "#6f42c1",
        "#fd7e14",
        "#20c997",
        "#6610f2",
        "#e83e8c",
        "#17a2b8",
        "#343a40",
        "#adb5bd",
      ];

      ventasChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data: totales,
              backgroundColor: colores.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `$${formatoMoneda(ctx.raw)}`,
              },
            },
          },
        },
      });
    };

    onMounted(() => {
      cargarUsuarios();
      cargarVentasPorMes();
      cargarTotalCfdi();
      obtenerVentasFacturadasHoy();
    });

    return {
      sidebarOpen,
      resumenCards,
      anioSeleccionado,
      mesSeleccionado,
      aniosDisponibles,
      mesesDisponibles,
      mesTop,
      totalFacturas,
      formatoMoneda,
      cargarVentasPorMes,
      totalVentasFacturadasHoy,
  obtenerVentasFacturadasHoy,
    };
  },
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  background: #f3f6fb;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  min-width: 0;
  width: 100%;
  transition: all .3s ease;
  overflow-x: hidden;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
    width: calc(100% - 250px);
  }
}

.dashboard-main {
  padding: 28px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* ---------- Encabezado ---------- */

.top-panel {
  background: linear-gradient(135deg, #fff, #eef5ff);
  border: 1px solid #dce8f8;
  border-radius: 22px;
  padding: 26px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .06);
}

.eyebrow {
  color: #0d6efd;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: .7px;
  text-transform: uppercase;
}

.top-panel h1 {
  margin: 8px 0 6px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.top-panel p {
  margin: 0;
  color: #64748b;
}

/* ---------- Tarjetas ---------- */

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border: 1px solid #e4eaf3;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 100px;
  min-width: 0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, .055);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 23px;
  flex-shrink: 0;
}

.metric-card span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.metric-card strong {
  display: block;
  margin-top: 4px;
  font-size: 23px;
  font-weight: 900;
  color: #0f172a;
  word-break: break-word;
}

.metric-primary .metric-icon {
  background: #0d6efd;
}

.metric-success .metric-icon {
  background: #198754;
}

.metric-info .metric-icon {
  background: #0dcaf0;
}

.metric-warning .metric-icon {
  background: #f59f00;
}

.metric-danger .metric-icon {
  background: #dc3545;
}

.metric-secondary .metric-icon {
  background: #6c757d;
}

/* ---------- Paneles ---------- */

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, .8fr);
  gap: 22px;
  margin-bottom: 24px;
}

.panel-card {
  background: #fff;
  border: 1px solid #e4eaf3;
  border-radius: 22px;
  padding: 22px;
  min-width: 0;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(15, 23, 42, .055);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.panel-header h5 {
  margin: 0;
  font-weight: 900;
  color: #0f172a;
}

.panel-header span {
  color: #64748b;
  font-size: 14px;
}

.panel-header>i {
  font-size: 26px;
  color: #0d6efd;
}

/* ---------- Gráficas ---------- */

.chart-area {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-area canvas {
  width: 100% !important;
  height: 100% !important;
}

/* ---------- Accesos ---------- */

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.quick-card {
  background: #fff;
  border: 1px solid #e4eaf3;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  gap: 14px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, .055);
}

.quick-card>i {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #eef5ff;
  color: #0d6efd;
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;
}

.quick-card h6 {
  margin: 0 0 5px;
  font-weight: 900;
}

.quick-card p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* ---------- Responsive ---------- */

@media (max-width:1200px) {

  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width:991px) {

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .dashboard-main {
    padding: 18px;
  }
}

@media (max-width:768px) {

  .top-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .top-panel h1 {
    font-size: 24px;
  }

  .dashboard-main {
    padding: 15px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .45);
  z-index: 1019;
}
</style>
