<template>
  <Teleport to="body">
    <div
  v-if="visible"
  ref="modalOverlay"
  class="modal-overlay"
  tabindex="0"
  @click.self="cerrarModal"
  @keydown.enter.prevent="confirmarPago"
>
      <div class="modal-container horizontal">
        <div class="modal-header">
          <h5>Cobro de Venta</h5>
          <button class="close-btn" @click="cerrarModal">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Total a pagar -->
          <div class="total-card">
  <span class="total-label">TOTAL A PAGAR</span>
  <h1 class="total-amount">{{ formatPrecio(total) }}</h1>
</div>
          <!-- Método de Pago -->
          <div class="form-group">
            <label>Método de Pago</label>
            <select v-model="metodoPago" class="form-control">
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>

          <!-- Efectivo -->
          <div v-if="metodoPago === 'Efectivo'" class="form-row">
            <div class="form-group">
              <label>Monto Efectivo</label>
            <input
              ref="efectivoInput"
              type="number"
              class="form-control"
              v-model.number="efectivo"
              min="0"
              @keyup.enter.prevent="confirmarPago"
            />            </div>
                        <div class="form-group">
              <label>Cambio</label>
              <input type="text" class="form-control" :value="formatPrecio(cambio)" disabled />
            </div>
          </div>

          <!-- Tarjeta -->
          <div v-if="metodoPago === 'Tarjeta'" class="form-row">
            <div class="form-group">
              <label>Tarjeta Crédito</label>
              <input type="number" class="form-control" v-model.number="tarjetaCredito" min="0" />
            </div>
            <div class="form-group">
              <label>Tarjeta Débito</label>
              <input type="number" class="form-control" v-model.number="tarjetaDebito" min="0" />
            </div>
          </div>

          <!-- Transferencia -->
          <div v-if="metodoPago === 'Transferencia'" class="form-group">
            <label>Monto Transferencia</label>
            <input type="number" class="form-control" v-model.number="transferencia" min="0" />
            <label>Tipo de Transferencia</label>
            <select v-model="tipoTransferencia" class="form-control">
              <option value="SPEI">SPEI</option>
              <option value="Interbancaria">Interbancaria</option>
            </select>
          </div>

          <!-- Mixto -->
          <div v-if="metodoPago === 'Mixto'" class="form-row">
            <div class="form-group">
              <label>Efectivo</label>
              <input type="number" class="form-control" v-model.number="efectivo" min="0" />
            </div>
            <div class="form-group">
              <label>Tarjeta Crédito</label>
              <input type="number" class="form-control" v-model.number="tarjetaCredito" min="0" />
            </div>
            <div class="form-group">
              <label>Tarjeta Débito</label>
              <input type="number" class="form-control" v-model.number="tarjetaDebito" min="0" />
            </div>
            <div class="form-group">
              <label>Transferencia</label>
              <input type="number" class="form-control" v-model.number="transferencia" min="0" />
              <select v-if="transferencia > 0" v-model="tipoTransferencia" class="form-control mt-1">
                <option value="SPEI">SPEI</option>
                <option value="Interbancaria">Interbancaria</option>
              </select>
            </div>

            <div class="form-group">
              <label>Total Ingresado</label>
              <input type="text" class="form-control" :value="formatPrecio(totalIngresado)" disabled />
            </div>

            <div class="form-group" v-if="totalIngresado > total && efectivo > 0">
              <label>Cambio</label>
              <input type="text" class="form-control" :value="formatPrecio(totalIngresado - total)" disabled />
            </div>
          </div>

          <div v-if="metodoPago === 'Mixto' && totalIngresado < total" class="text-danger small mt-2">
            Faltan {{ formatPrecio(total - totalIngresado) }} para completar el pago.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn-primary" :disabled="!pagoCompleto" @click="confirmarPago">
            Confirmar Cobro
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "ModalCobro",
  props: { visible: Boolean, total: Number },
  emits: ["close", "confirmar"],

  data() {
    return {
      metodoPago: "Efectivo",
      efectivo: 0,
      tarjetaCredito: 0,
      tarjetaDebito: 0,
      transferencia: 0,
      tipoTransferencia: "SPEI"
    };
  },

  computed: {
    cambio() {
      return Number(this.efectivo) > Number(this.total)
        ? Number(this.efectivo) - Number(this.total)
        : 0;
    },

    totalIngresado() {
      return (
        Number(this.efectivo) +
        Number(this.tarjetaCredito) +
        Number(this.tarjetaDebito) +
        Number(this.transferencia)
      );
    },

    pagoCompleto() {
      if (this.metodoPago === "Efectivo") {
        return Number(this.efectivo) >= Number(this.total);
      }

      if (this.metodoPago === "Tarjeta") {
        return (
          Number(this.tarjetaCredito) + Number(this.tarjetaDebito)
        ) >= Number(this.total);
      }

      if (this.metodoPago === "Transferencia") {
        return Number(this.transferencia) >= Number(this.total);
      }

      if (this.metodoPago === "Mixto") {
        return Number(this.totalIngresado) >= Number(this.total);
      }

      return false;
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        this.enfocarMontoEfectivo();
      }
    },

    metodoPago() {
      this.enfocarMontoEfectivo();
    }
  },

  methods: {
    enfocarMontoEfectivo() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.efectivoInput?.focus();
          this.$refs.efectivoInput?.select();
        }, 50);
      });
    },

    confirmarPago() {
      if (!this.pagoCompleto) return;

      const pagos = [];

      if (Number(this.efectivo) > 0) {
        pagos.push({
          metodo_pago: "Efectivo",
          monto: Number(this.efectivo)
        });
      }

      if (Number(this.tarjetaCredito) > 0) {
        pagos.push({
          metodo_pago: "Tarjeta",
          monto: Number(this.tarjetaCredito),
          tipo_tarjeta: "Crédito"
        });
      }

      if (Number(this.tarjetaDebito) > 0) {
        pagos.push({
          metodo_pago: "Tarjeta",
          monto: Number(this.tarjetaDebito),
          tipo_tarjeta: "Débito"
        });
      }

      if (Number(this.transferencia) > 0) {
        pagos.push({
          metodo_pago: "Transferencia",
          monto: Number(this.transferencia),
          tipo_transferencia: this.tipoTransferencia
        });
      }

      this.$emit("confirmar", pagos);
      this.limpiarModal();
      this.$emit("close");
    },

    cerrarModal() {
      this.limpiarModal();
      this.$emit("close");
    },

    limpiarModal() {
      this.metodoPago = "Efectivo";
      this.efectivo = 0;
      this.tarjetaCredito = 0;
      this.tarjetaDebito = 0;
      this.transferencia = 0;
      this.tipoTransferencia = "SPEI";
    },

    formatPrecio(v) {
      const num = Number(v);
      return isNaN(num) ? "$ 0.00" : `$ ${num.toFixed(2)}`;
    }
  }
};
</script>

<style scoped>

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.75);
  backdrop-filter:blur(5px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
  padding:20px;
}

.modal-container.horizontal{
  width:850px;
  max-width:100%;
  background:#ffffff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:
    0 25px 50px rgba(0,0,0,.25),
    0 10px 20px rgba(0,0,0,.15);
}

.modal-header{
  background:linear-gradient(135deg,#2563eb,#1d4ed8);
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:18px 25px;
}

.modal-header h5{
  margin:0;
  font-size:1.2rem;
  font-weight:700;
}

.close-btn{
  background:rgba(255,255,255,.15);
  border:none;
  width:40px;
  height:40px;
  border-radius:50%;
  color:white;
  font-size:1.4rem;
  cursor:pointer;
  transition:.3s;
}

.close-btn:hover{
  background:rgba(255,255,255,.3);
  transform:rotate(90deg);
}

.modal-body{
  padding:25px;
  background:#f8fafc;
}

.form-row{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:15px;
  margin-bottom:18px;
}

.form-group{
  display:flex;
  flex-direction:column;
}

.form-group label{
  font-size:.9rem;
  font-weight:600;
  color:#334155;
  margin-bottom:6px;
}

.form-control{
  height:48px;
  border:2px solid #e2e8f0;
  border-radius:12px;
  padding:0 15px;
  font-size:.95rem;
  transition:.25s;
  background:white;
}

.form-control:focus{
  outline:none;
  border-color:#2563eb;
  box-shadow:0 0 0 4px rgba(37,99,235,.12);
}

.form-control:disabled{
  background:#f1f5f9;
  font-weight:700;
  color:#0f172a;
}

select.form-control{
  cursor:pointer;
}

.modal-footer{
  background:white;
  padding:20px 25px;
  border-top:1px solid #e2e8f0;
  display:flex;
  justify-content:flex-end;
  gap:12px;
}

.btn-primary{
  border:none;
  border-radius:12px;
  padding:12px 22px;
  font-weight:600;
  background:linear-gradient(135deg,#2563eb,#1d4ed8);
  color:white;
  cursor:pointer;
  transition:.3s;
}

.btn-primary:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 20px rgba(37,99,235,.35);
}

.btn-primary:disabled{
  opacity:.5;
  cursor:not-allowed;
  transform:none;
}

.btn-secondary{
  border:none;
  border-radius:12px;
  padding:12px 22px;
  font-weight:600;
  background:#e2e8f0;
  color:#334155;
  cursor:pointer;
  transition:.3s;
}

.btn-secondary:hover{
  background:#cbd5e1;
}

.text-danger{
  background:#fee2e2;
  color:#dc2626;
  padding:12px;
  border-radius:10px;
  font-weight:600;
  margin-top:10px;
}

@media(max-width:768px){

  .modal-container.horizontal{
    width:100%;
  }

  .modal-body{
    padding:18px;
  }

  .modal-footer{
    flex-direction:column;
  }

  .btn-primary,
  .btn-secondary{
    width:100%;
  }

}
.total-card{
  background:linear-gradient(135deg,#15803d,#22c55e);
  border-radius:18px;
  padding:25px;
  text-align:center;
  margin-bottom:20px;
  color:#fff;
  box-shadow:0 10px 25px rgba(37,99,235,.25);
}

.total-label{
  display:block;
  font-size:13px;
  font-weight:600;
  letter-spacing:2px;
  opacity:.9;
}

.total-amount{
  margin:10px 0 0;
  font-size:2.5rem;
  font-weight:800;
  line-height:1;
}
</style>
