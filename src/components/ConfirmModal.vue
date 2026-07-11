<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-show="visible" class="modal-backdrop-solid">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-circle-fill me-2"></i>Confirmar acción
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="close"></button>
            </div>
            <div class="modal-body text-center">
              <p class="mb-0">{{ message }}</p>
            </div>
            <div class="modal-footer justify-content-center">
              <button class="btn btn-secondary w-25" @click="close">Cancelar</button>
              <button class="btn btn-danger w-25" @click="confirm">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: "ConfirmModal",
  props: {
    visible: { type: Boolean, required: true },
    message: { type: String, default: "¿Está seguro de realizar esta acción?" }
  },
  emits: ["update:visible", "confirmed"],
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    confirm() {
      this.$emit("confirmed");
      this.close();
    }
  }
};
</script>

<style scoped>
/* Fondo sólido sin transparencia */
.modal-backdrop-solid {
  position: fixed;
  inset: 0;
  background-color: #f0f2f5; /* color sólido tipo tarjeta */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}

/* Centrar el modal */
.modal-dialog-centered {
  max-width: 400px;
  width: 100%;
}

/* Contenido del modal */
.modal-content {
  border-radius: 1rem;
  overflow: hidden;
  animation: popIn 0.15s ease-out;
}

/* Cabecera */
.modal-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Botón de cerrar blanco */
.btn-close-white {
  filter: invert(1);
}

/* Cuerpo centrado */
.modal-body {
  padding: 1.5rem;
  font-size: 1rem;
  color: #333;
  text-align: center;
}

/* Pie de modal con botones centrados y anchos iguales */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
}

/* Animación de entrada/salida */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Animación pop */
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
