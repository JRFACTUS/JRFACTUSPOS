<template>
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Cliente</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-3" v-model="busqueda" placeholder="Buscar cliente por nombre o apellido">
          <ul class="list-group">
            <li class="list-group-item"
                v-for="cli in clientesFiltrados" :key="cli.id"
                @click="seleccionar(cli)">
              {{ cli.nombre }} {{ cli.apellidos }} - {{ cli.rfc }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  props: {
    visible: Boolean,
    clientes: Array,
    regimenes: Array,  // <-- recibimos los catálogos
    usos_cfdi: Array
  },
  emits: ["close", "select"],
  setup(props, { emit }) {
    const busqueda = ref("");

    const clientesFiltrados = computed(() => {
      const termino = busqueda.value.toLowerCase();
      return (props.clientes || []).filter(c => 
        (c.nombre + " " + (c.apellidos || "")).toLowerCase().includes(termino)
      );
    });

    const seleccionar = (cli) => {
      emit("select", cli);
      emit("close");
    };

    return { busqueda, clientesFiltrados, seleccionar };
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
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h5 {
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  padding: 20px;
}
.form-control {
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.list-group-item {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f0f0f0;
}
</style>
