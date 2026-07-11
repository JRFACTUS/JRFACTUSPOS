<template>
  <BaseModal v-model:visible="localVisible" title="Registrar Egreso" size="lg">
    <div class="mb-3">
      <label class="form-label">Monto a Retirar</label>
      <input type="number" class="form-control" v-model="egreso.monto" placeholder="0.00" />
    </div>

    <div class="mb-3">
      <label class="form-label">Fecha de Retiro</label>
      <input type="datetime-local" class="form-control" v-model="egreso.fecha" />
    </div>

    <div class="mb-3">
      <label class="form-label">Motivo</label>
      <textarea class="form-control" v-model="egreso.descripcion" placeholder="Motivo del egreso"></textarea>
    </div>

    <div class="mb-3">
      <p><strong>Total Ventas:</strong> {{ formatCurrency(totalVentas) }}</p>
      <p><strong>Saldo Actual:</strong> {{ formatCurrency(saldoActual) }}</p>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
      <button class="btn btn-primary" @click="guardarEgreso">Guardar</button>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue';
import api from '@/services/api.js';

export default {
  name: 'EgresoModal',
  components: { BaseModal },
  props: {
    visible: { type: Boolean, required: true },
    cajaId: { type: Number, required: true } // 🔹 Necesario para enviar al backend
  },
  emits: ['update:visible', 'egreso-registrado'],
  data() {
    return {
      egreso: {
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().slice(0, 19)
      },
      totalVentas: 0,
      saldoActual: 0
    };
  },
  computed: {
    // 🔹 Reemplaza el antiguo 'localVisible' de data().
    // Al ser un computed con get/set, nunca queda desincronizado del prop:
    // cualquier cambio (X, backdrop, Cancelar, Guardar) se emite directo al padre.
    localVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      if (val) this.fetchCajaInfo();
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('update:visible', false);
    },
    async fetchCajaInfo() {
      try {
        const res = await api.get('/caja/totales');
        this.totalVentas = res.data.total_ventas || 0;
        this.saldoActual = res.data.saldo_actual || 0;
      } catch (error) {
        console.error('Error al obtener info de la caja:', error);
      }
    },

    async guardarEgreso() {
      if (!this.egreso.monto || this.egreso.monto <= 0) return alert('Monto inválido');

      try {
        const payload = { ...this.egreso, caja_id: this.cajaId };
        const res = await api.post('/egresos/registrar', payload);

        alert(res.data.message || 'Egreso registrado correctamente');

        // Limpiar formulario
        this.egreso.monto = '';
        this.egreso.descripcion = '';
        this.egreso.fecha = new Date().toISOString().slice(0, 19);

        // 🔹 Emitir evento para que el padre actualice la tabla
        this.$emit('egreso-registrado', res.data.caja);

        this.$emit('update:visible', false); // cerrar modal
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Error al registrar egreso');
      }
    },

    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }
  }
};
</script>