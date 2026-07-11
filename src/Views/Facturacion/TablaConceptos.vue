<template>
  <div class="conceptos-card card mt-4">
    <!-- Header -->
    <div class="conceptos-header">
      <div>
        <h5>
          <i class="bi bi-box-seam me-2"></i>
          Conceptos
        </h5>
        <small>Detalle de productos o servicios facturados</small>
      </div>

      <span class="conceptos-badge">
        {{ conceptos.length }} items
      </span>
    </div>

    <!-- Tabla -->
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table conceptos-table align-middle mb-0">
          <thead>
            <tr>
              <th class="text-center">Cantidad</th>
              <th class="text-center">Unidad</th>
              <th class="text-center">Clave</th>
              <th>Concepto</th>
              <th class="text-end">Precio</th>
              <th class="text-end">Descuento</th>
              <th class="text-end">Subtotal</th>
              <th class="text-end">IVA</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!conceptos || conceptos.length === 0">
              <td colspan="9" class="empty-state">
                <i class="bi bi-inbox"></i>
                <span>No hay conceptos agregados</span>
              </td>
            </tr>

            <tr v-for="(concepto, index) in conceptos" :key="index">
              <td class="text-center fw-semibold">
                {{ formatNumber(concepto.Cantidad) }}
              </td>

              <td class="text-center">
                <span class="mini-badge">{{ concepto.ClaveUnidad ?? '-' }}</span>
              </td>

              <td class="text-center">
                <span class="mini-badge">{{ concepto.ClaveProdServ ?? '-' }}</span>
              </td>

              <td>
                <div class="concept-title">{{ concepto.Descripcion }}</div>
              </td>

              <td class="text-end">${{ formatNumber(concepto.ValorUnitario) }}</td>
              <td class="text-end text-danger">-${{ formatNumber(concepto.Descuento) }}</td>
              <td class="text-end">${{ formatNumber(subtotal(concepto)) }}</td>
              <td class="text-end">${{ formatNumber(iva(concepto)) }}</td>

              <td class="text-end fw-bold total-cell">
                ${{ formatNumber(total(concepto)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Totales -->
    <div class="conceptos-footer">
      <div class="totales-box">
        <div class="total-row">
          <span>Subtotal</span>
          <strong>${{ formatNumber(totalSubtotal) }}</strong>
        </div>

        <div class="total-row">
          <span>IVA</span>
          <strong>${{ formatNumber(totalIVA) }}</strong>
        </div>

        <div class="total-row total-final">
          <span>Total</span>
          <strong>${{ formatNumber(totalGeneral) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "TablaConceptos",
  props: {
    conceptos: {
      type: Array,
      default: () => [],
    },
    ivaDefault: {
      type: Number,
      default: 0.16,
    },
  },
  setup(props) {
    // Subtotal por concepto (Cantidad * ValorUnitario - Descuento)
    const subtotal = (c) => {
      const cantidad = parseFloat(c.Cantidad ?? 0);
      const valor = parseFloat(c.ValorUnitario ?? 0);
      const descuento = parseFloat(c.Descuento ?? 0);
      return cantidad * valor - descuento;
    };

    // IVA por concepto
    const iva = (c) => {
      const tasa = parseFloat(c.Impuestos?.Traslados?.[0]?.TasaOCuota ?? props.ivaDefault);
      return subtotal(c) * tasa;
    };

    // Total por concepto
    const total = (c) => subtotal(c) + iva(c);

    // Totales generales
    const totalSubtotal = computed(() => props.conceptos.reduce((acc, c) => acc + subtotal(c), 0));
    const totalIVA = computed(() => props.conceptos.reduce((acc, c) => acc + iva(c), 0));
    const totalGeneral = computed(() => totalSubtotal.value + totalIVA.value);

    const formatNumber = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? "0.00" : n.toFixed(2);
    };

    return { subtotal, iva, total, totalSubtotal, totalIVA, totalGeneral, formatNumber };
  },
};
</script>


<style scoped>
.conceptos-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .08);
}

.conceptos-header {
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  color: #ffffff;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conceptos-header h5 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.conceptos-header small {
  color: #cbd5e1;
  font-size: 13px;
}

.conceptos-badge {
  background: rgba(255, 255, 255, .14);
  border: 1px solid rgba(255, 255, 255, .25);
  color: #ffffff;
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.conceptos-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .45px;
  padding: 15px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.conceptos-table tbody td {
  padding: 15px 14px;
  color: #1e293b;
  font-size: 14px;
  border-bottom: 1px solid #edf2f7;
}

.conceptos-table tbody tr:hover {
  background: #f8fafc;
}

.concept-title {
  font-weight: 700;
  color: #0f172a;
}

.mini-badge {
  display: inline-block;
  background: #eef2ff;
  color: #1e3a8a;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.total-cell {
  color: #166534 !important;
}

.empty-state {
  padding: 35px !important;
  text-align: center;
  color: #64748b !important;
  font-style: normal;
}

.empty-state i {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
  color: #94a3b8;
}

.conceptos-footer {
  background: #f8fafc;
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}

.totales-box {
  width: 320px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
  font-size: 14px;
  margin-bottom: 10px;
}

.total-row strong {
  color: #0f172a;
}

.total-final {
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px dashed #cbd5e1;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.total-final strong {
  color: #15803d;
}

@media (max-width: 768px) {
  .conceptos-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .conceptos-footer {
    padding: 16px;
  }

  .totales-box {
    width: 100%;
  }
}
</style>