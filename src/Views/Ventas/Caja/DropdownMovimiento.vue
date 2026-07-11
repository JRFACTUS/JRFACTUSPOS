<template>
  <div>
    <!-- Dropdown Movimientos -->
    <div class="dropdown" @click="toggleDropdown">
      <button class="btn btn-outline-primary shadow-sm">
        <i class="bi bi-cash-stack me-2"></i> Movimientos
      </button>

      <ul class="dropdown-menu shadow-sm" :class="{ show: dropdownOpen }">
      
       

        <!-- Gasto -->
        <li>
          <a
            class="dropdown-item d-flex align-items-center"
            href="#"
            @click.prevent.stop="abrirModalGasto"
          >
            <i class="bi bi-wallet2 text-warning me-2"></i> Gasto
          </a>
        </li>
      </ul>
    </div>

    <!-- 🔹 Modal de Egreso -->
    <BaseModal v-model:visible="modalEgresoVisible" title="Registrar Egreso" size="lg">
      <div class="mb-3">
        <label class="form-label">Monto</label>
        <input
          type="number"
          class="form-control"
          v-model="nuevoEgreso.monto"
          placeholder="0.00"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea
          class="form-control"
          v-model="nuevoEgreso.descripcion"
          placeholder="Motivo del egreso"
        ></textarea>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modalEgresoVisible = false">Cancelar</button>
        <button class="btn btn-primary" @click="guardarEgreso">Guardar</button>
      </template>
    </BaseModal>

    <!-- 🔹 Modal de Gasto -->
    <BaseModal v-model:visible="modalGastoVisible" title="Registrar Gasto" size="xl">
      <div class="mb-3">
        <label class="form-label">Tipo de Gasto</label>
        <input
          type="text"
          class="form-control"
          v-model="nuevoGasto.tipo_gasto"
          placeholder="Ej. Luz, Agua"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Monto</label>
        <input
          type="number"
          class="form-control"
          v-model="nuevoGasto.monto"
          placeholder="0.00"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea
          class="form-control"
          v-model="nuevoGasto.descripcion"
          placeholder="Detalle del gasto"
        ></textarea>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modalGastoVisible = false">Cancelar</button>
        <button class="btn btn-primary" @click="guardarGasto">Guardar</button>
      </template>

      <!-- Tabla de gastos -->
      <div class="mt-4">
        <h6>Gastos Registrados</h6>
        <div class="table-responsive">
          <table ref="gastosTable" class="table table-bordered table-hover w-100">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Tipo de Gasto</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Usuario ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(gasto, index) in gastos" :key="gasto.id">
                <td>{{ index + 1 }}</td>
                <td>{{ gasto.tipo_gasto }}</td>
                <td>{{ gasto.monto }}</td>
                <td>{{ gasto.descripcion }}</td>
                <td>{{ gasto.fecha_gasto }}</td>
                <td>{{ gasto.user_gasto }}</td>
              </tr>
              <tr v-if="gastos.length === 0">
                <td colspan="6" class="text-center text-muted">No hay gastos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { useDataTable } from '@/composables/useDataTable.js';
import api from '@/services/api.js';

// 🔹 Dropdown control
const dropdownOpen = ref(false);
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// 🔹 Modal Egreso
const modalEgresoVisible = ref(false);
const nuevoEgreso = ref({
  monto: '',
  descripcion: '',
  user_id: JSON.parse(localStorage.getItem('user')).id,
});

const abrirModalEgreso = () => {
  modalEgresoVisible.value = true;
  dropdownOpen.value = false;
};

const guardarEgreso = async () => {
  try {
    if (!nuevoEgreso.value.monto) {
      return alert('Debes ingresar un monto válido');
    }
    await api.post('/registrarEgreso', nuevoEgreso.value);
    alert('Egreso registrado correctamente');
    modalEgresoVisible.value = false;
    nuevoEgreso.value = {
      monto: '',
      descripcion: '',
      user_id: JSON.parse(localStorage.getItem('user')).id,
    };
  } catch (error) {
    console.error('Error al registrar egreso:', error);
  }
};

// 🔹 Modal Gasto
const modalGastoVisible = ref(false);
const nuevoGasto = ref({
  tipo_gasto: '',
  monto: '',
  descripcion: '',
  fecha_gasto: new Date().toISOString().slice(0, 19).replace('T', ' '),
  user_id: JSON.parse(localStorage.getItem('user')).id,
});

const gastos = ref([]);
const gastosTable = ref(null);
const { initDataTable } = useDataTable(gastos, gastosTable);

const abrirModalGasto = async () => {
  modalGastoVisible.value = true;
  dropdownOpen.value = false;
  if (gastos.value.length === 0) {
    await fetchGastos();
  }
};

const fetchGastos = async () => {
  try {
    const res = await api.get('/getGastos');
    gastos.value = res.data.map((gasto) => ({
      ...gasto,
      monto: parseFloat(gasto.monto).toFixed(2),
      fecha_gasto: new Date(gasto.fecha_gasto).toLocaleString(),
    }));
    await nextTick();
    initDataTable(true);
  } catch (err) {
    console.error('Error al obtener gastos:', err);
  }
};

const guardarGasto = async () => {
  try {
    if (!nuevoGasto.value.tipo_gasto || !nuevoGasto.value.monto) {
      return alert('Debes completar el tipo de gasto y el monto');
    }
    await api.post('/registrarGasto', nuevoGasto.value);
    await fetchGastos();
    modalGastoVisible.value = false;
    nuevoGasto.value = {
      tipo_gasto: '',
      monto: '',
      descripcion: '',
      fecha_gasto: new Date().toISOString().slice(0, 19).replace('T', ' '),
      user_id: JSON.parse(localStorage.getItem('user')).id,
    };
  } catch (err) {
    console.error('Error al guardar gasto:', err);
  }
};

onMounted(fetchGastos);
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  min-width: 180px;
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}
.dropdown-menu.show {
  display: block;
}
.dropdown-item:hover {
  background-color: rgba(13, 110, 253, 0.1);
}
:deep(.modal-dialog) {
  max-width: 1000px;
}
:deep(.modal-body) {
  overflow-x: auto;
}
</style>
