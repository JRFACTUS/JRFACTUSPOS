<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">

    <div class="modal-container">

      <!-- Header -->
      <div class="modal-header">

        <div>
          <h5 class="modal-title">
            <i class="bi bi-cart-check me-2"></i>
            Importar Venta
          </h5>

          <small class="modal-subtitle">
            Selecciona una venta para convertirla en CFDI.
          </small>
        </div>

        <button class="close-btn" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>

      </div>

      <!-- Body -->
      <div class="modal-body">

        <div class="modal-info">

          <i class="bi bi-info-circle-fill"></i>

          <span>
            Selecciona la venta que deseas importar.
          </span>

        </div>

        <!-- Loader -->
        <div v-if="cargando" class="loading-wrapper">

          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">
              Cargando...
            </span>
          </div>

          <p>Cargando ventas...</p>

        </div>

        <!-- Sin datos -->
        <div v-else-if="ventas.length === 0" class="empty-state">

          <i class="bi bi-inbox"></i>

          <h6>No hay ventas disponibles</h6>

          <p>
            Cuando existan ventas aparecerán aquí.
          </p>

        </div>

        <!-- Tabla -->
        <div v-else class="ventas-table-wrapper">

          <table class="ventas-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Folio</th>

                <th>Cliente</th>

                <th>Fecha</th>

                <th class="text-end">
                  Total
                </th>


                <th class="text-center">
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              <tr v-for="venta in ventas" :key="venta.id">

                <td>
                  {{ venta.id }}
                </td>

                <td>

                  <span class="badge-folio">

                    {{ venta.folio_pago || '—' }}

                  </span>

                </td>

                <td>

                  {{ venta.cliente?.razon_social || 'Sin cliente' }}

                </td>

                <td>

                  {{ venta.fecha }}

                </td>

                <td class="text-end fw-bold">

                  ${{ Number(venta.total).toFixed(2) }}

                



                </td>

                <td class="text-center">

                  <button class="btn-import" @click="$emit('import', venta)">

                    <i class="bi bi-download me-1"></i>

                    Importar

                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">

        <button class="btn-close-footer" @click="$emit('close')">

          <i class="bi bi-x-circle me-2"></i>

          Cerrar

        </button>

      </div>

    </div>

  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import api from "@/services/api.js";

export default {
  name: "ModalImportarVenta",
  props: {
    visible: { type: Boolean, default: false },
  },
  emits: ["close", "import"],
  setup(props) {
    const ventas = ref([]);
    const cargando = ref(false);

   const cargarVentas = async () => {
  cargando.value = true;

  try {
    const res = await api.get("/venta");


    if (res.data && Array.isArray(res.data.ventas)) {
      ventas.value = res.data.ventas;
    } else if (Array.isArray(res.data)) {
      ventas.value = res.data;
    } else {
      alert("Error al cargar ventas. Por favor, intenta nuevamente.");
      ventas.value = [];
    }


  } catch (error) {
    alert("Error al cargar ventas. Por favor, intenta nuevamente.");
    ventas.value = [];
  } finally {
    cargando.value = false;
  }
};

    watch(
      () => props.visible,
      (nuevo) => {
        if (nuevo) cargarVentas();
      }
    );

    onMounted(() => {
      if (props.visible) cargarVentas();
    });

    return { ventas, cargando };
  },
};
</script>
<style scoped>
/* ===========================
   OVERLAY
=========================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .70);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 30px;
}

/* ===========================
   MODAL
=========================== */

.modal-container {
  width: 100%;
  max-width: 1200px;
  max-height: 92vh;

  display: flex;
  flex-direction: column;

  background: #ffffff;
  border-radius: 22px;

  border: 1px solid #e2e8f0;

  overflow: hidden;

  box-shadow:
    0 30px 70px rgba(15, 23, 42, .18),
    0 8px 20px rgba(15, 23, 42, .08);

  animation: modalShow .28s ease;
}

@keyframes modalShow {

  from {
    opacity: 0;
    transform: translateY(-18px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

}

/* ===========================
   HEADER
=========================== */

.modal-header {

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 22px 28px;

  background:
    linear-gradient(135deg, #0f172a, #1e3a5f);

  color: white;

}

.modal-title {

  margin: 0;

  font-size: 21px;

  font-weight: 800;

  letter-spacing: -.3px;

}

.modal-subtitle {

  color: #cbd5e1;

  font-size: 13px;

}

.close-btn {

  width: 42px;
  height: 42px;

  border: none;

  border-radius: 50%;

  background: rgba(255, 255, 255, .12);

  color: white;

  display: flex;

  justify-content: center;

  align-items: center;

  cursor: pointer;

  transition: .25s;

}

.close-btn:hover {

  background: rgba(255, 255, 255, .22);

  transform: rotate(90deg);

}

/* ===========================
   BODY
=========================== */

.modal-body {

  flex: 1;

  overflow: auto;

  padding: 24px;

  background: #f8fafc;

}

.modal-info {

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px 18px;

  background: white;

  border: 1px solid #dbeafe;

  border-left: 4px solid #2563eb;

  border-radius: 12px;

  margin-bottom: 20px;

  color: #475569;

}

.modal-info i {

  color: #2563eb;

  font-size: 18px;

}

/* ===========================
   LOADER
=========================== */

.loading-wrapper {

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 60px;

}

.loading-wrapper p {

  margin-top: 18px;

  color: #64748b;

}

.spinner-border {

  width: 3rem;

  height: 3rem;

}

/* ===========================
   EMPTY
=========================== */

.empty-state {

  padding: 60px;

  text-align: center;

}

.empty-state i {

  font-size: 55px;

  color: #94a3b8;

}

.empty-state h6 {

  margin-top: 15px;

  font-weight: 700;

}

.empty-state p {

  color: #64748b;

}

/* ===========================
   TABLA
=========================== */

.ventas-table-wrapper {

  overflow: auto;

  border-radius: 16px;

  background: white;

  border: 1px solid #e2e8f0;

}

.ventas-table {

  width: 100%;

  min-width: 950px;

  border-collapse: collapse;

}

.ventas-table thead {

  position: sticky;

  top: 0;

  z-index: 10;

}

.ventas-table thead th {

  background: #f8fafc;

  color: #475569;

  font-size: 12px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: .6px;

  padding: 15px;

  border-bottom: 1px solid #e2e8f0;

}

.ventas-table tbody td {

  padding: 16px;

  font-size: 14px;

  color: #1e293b;

  border-bottom: 1px solid #edf2f7;

}

.ventas-table tbody tr {

  transition: .18s;

}

.ventas-table tbody tr:hover {

  background: #f8fbff;

}

/* ===========================
   BADGE
=========================== */

.badge-folio {

  background: #eef2ff;

  color: #1d4ed8;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 700;

}

/* ===========================
   IMPORTAR
=========================== */

.btn-import {

  background: linear-gradient(135deg, #16a34a, #15803d);

  color: white;

  border: none;

  border-radius: 10px;

  padding: 10px 18px;

  font-weight: 700;

  transition: .25s;

}

.btn-import:hover {

  transform: translateY(-2px);

  box-shadow: 0 10px 20px rgba(22, 163, 74, .25);

}

/* ===========================
   FOOTER
=========================== */

.modal-footer {

  background: white;

  border-top: 1px solid #e2e8f0;

  padding: 18px 24px;

  display: flex;

  justify-content: flex-end;

}

.btn-close-footer {

  border: none;

  background: #ef4444;

  color: white;

  padding: 11px 22px;

  border-radius: 10px;

  font-weight: 700;

  transition: .2s;

}

.btn-close-footer:hover {

  background: #dc2626;

  transform: translateY(-2px);

}

/* ===========================
   SCROLL
=========================== */

.modal-body::-webkit-scrollbar,
.ventas-table-wrapper::-webkit-scrollbar {

  width: 8px;
  height: 8px;

}

.modal-body::-webkit-scrollbar-thumb,
.ventas-table-wrapper::-webkit-scrollbar-thumb {

  background: #cbd5e1;

  border-radius: 30px;

}

/* ===========================
   RESPONSIVE
=========================== */

@media (max-width:768px) {

  .modal-overlay {

    padding: 10px;

  }

  .modal-container {

    max-height: 96vh;

    border-radius: 16px;

  }

  .modal-header {

    padding: 18px;

  }

  .modal-body {

    padding: 18px;

  }

  .modal-title {

    font-size: 18px;

  }

  .ventas-table {

    min-width: 900px;

  }

}
</style>