<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h5>Editar Cliente</h5>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Campos básicos -->
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" v-model="clienteEditable.nombre" />
          </div>

          <div class="form-group">
            <label>Apellido</label>
            <input type="text" v-model="clienteEditable.apellidos" />
          </div>

          <div class="form-group">
            <label>Razón Social</label>
            <input type="text" v-model="clienteEditable.razon_social" />
          </div>

          <div class="form-group">
            <label>RFC</label>
            <input type="text" v-model="clienteEditable.rfc" />
          </div>

          <div class="form-group">
            <label>Correo</label>
            <input type="email" v-model="clienteEditable.email" />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" v-model="clienteEditable.telefono" />
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <label>Calle</label>
            <input type="text" v-model="clienteEditable.calle" />
          </div>

          <div class="form-group">
            <label>Número Exterior</label>
            <input type="text" v-model="clienteEditable.numero_exterior" />
          </div>

          <div class="form-group">
            <label>Número Interior</label>
            <input type="text" v-model="clienteEditable.numero_interior" />
          </div>

          <div class="form-group">
            <label>Colonia</label>
            <input type="text" v-model="clienteEditable.colonia" />
          </div>

          <div class="form-group">
            <label>Ciudad</label>
            <input type="text" v-model="clienteEditable.ciudad" />
          </div>

          <div class="form-group">
            <label>Estado</label>
            <input type="text" v-model="clienteEditable.estado" />
          </div>

          <div class="form-group">
            <label>Delegación/Municipio</label>
            <input type="text" v-model="clienteEditable.delegacion" />
          </div>

          <div class="form-group">
            <label>Código Postal</label>
            <input type="text" v-model="clienteEditable.codigo_postal" />
          </div>

          <!-- Select Régimen Fiscal -->
          <div class="form-group">
            <label>Régimen Fiscal</label>
            <select v-model="clienteEditable.regimen_fiscal_id">
              <option v-for="r in regimenesLocales" :key="r.id" :value="r.id">
                {{ r.descripcion }}
              </option>
            </select>
          </div>

          <!-- Select Uso CFDI -->
          <div class="form-group">
            <label>Uso CFDI</label>
            <select v-model="clienteEditable.uso_cfdi_id">
              <option v-for="u in usosCfdiLocales" :key="u.id" :value="u.id">
                {{ u.descripcion }}
              </option>
            </select>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" @click="guardarCambios">Guardar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import api from '@/services/api.js';

export default {
  name: 'ModalEditarCliente',
  props: {
    visible: Boolean,
    cliente: Object,
  },
  emits: ['close', 'updated'],
  data() {
    return {
      clienteEditable: {
        id: null,
        nombre: '',
        apellidos: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        delegacion: '',
        codigo_postal: '',
        regimen_fiscal_id: null,
        uso_cfdi_id: null,
      },
      regimenesLocales: [],
      usosCfdiLocales: [],
    };
  },
  watch: {
    cliente: {
      handler(nuevo) {
        if (nuevo) {
          this.clienteEditable = {
            id: nuevo.id || null,
            nombre: nuevo.nombre || '',
            apellidos: nuevo.apellidos || '',
            razon_social: nuevo.razon_social || '',
            rfc: nuevo.rfc || '',
            email: nuevo.email || '',
            telefono: nuevo.telefono || '',
            calle: nuevo.calle || '',
            numero_exterior: nuevo.numero_exterior || '',
            numero_interior: nuevo.numero_interior || '',
            colonia: nuevo.colonia || '',
            ciudad: nuevo.ciudad || '',
            estado: nuevo.estado || '',
            delegacion: nuevo.delegacion || '',
            codigo_postal: nuevo.codigo_postal || '',
            regimen_fiscal_id: nuevo.regimen_fiscal_id || null,
            uso_cfdi_id: nuevo.uso_cfdi_id || null,
          };
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.cargarSAT();
  },
  methods: {
    async cargarSAT() {
      try {
        const res = await api.get('/sat');
        this.regimenesLocales = res.data.regimenes_fiscales;
        this.usosCfdiLocales = res.data.usos_cfdi;
      } catch (e) {
        console.error('Error al cargar SAT:', e);
      }
    },
    async guardarCambios() {
      try {
        const res = await api.put(`/clientes/${this.clienteEditable.id}`, this.clienteEditable);

        if (!res.data.success) {
          alert(`❌ ${res.data.message}`);
          return;
        }

        this.$emit('updated', res.data.cliente);
        this.$emit('close');
        alert('✅ Cliente actualizado correctamente.');
      } catch (e) {
        if (e.response?.data?.message) {
          alert(`❌ ${e.response.data.message}`);
        } else {
          console.error(e);
          alert('❌ Error al actualizar el cliente.');
        }
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 9999;
}
.modal-container {
  background: white;
  border-radius: 10px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  animation: slide-down 0.3s ease-out;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
}
.form-group {
  flex: 1 1 45%;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  gap: 10px;
  border-top: 1px solid #eee;
}
.btn-primary {
  background-color: #0d6efd;
  border: none;
  padding: 7px 15px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  border: none;
  padding: 7px 15px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
@keyframes slide-down {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
