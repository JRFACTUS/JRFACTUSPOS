<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-show="visible" class="modal-backdrop" @click.self="close">
        <div class="modal-dialog" :class="sizeClass">
          <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" @click="close" aria-label="Cerrar" />
            </div>

            <!-- Body -->
            <div class="modal-body" :class="{ 'modal-body-scrollable': scrollable }">
              <slot />
            </div>

            <!-- Footer -->
            <div class="modal-footer" v-if="hasFooter">
              <slot name="footer">
                <button type="button" class="btn btn-secondary" @click="close">
                  Cancelar
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: "BaseModal",
  props: {
    visible: { type: Boolean, required: true },
    title: { type: String, default: "" },
    size: {
      type: String,
      default: "md",
      validator: (value) => ["sm", "md", "lg", "xl"].includes(value)
    },
    scrollable: { type: Boolean, default: true }
  },
  emits: ["update:visible"],
  computed: {
    sizeClass() {
      return `modal-${this.size}`;
    },
    hasFooter() {
      return this.$slots.footer || true;
    }
  },
  watch: {
    visible(val) {
      // Prevenir scroll del body cuando el modal está abierto
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    }
  },
  beforeUnmount() {
    // Limpiar overflow al desmontar
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* Overlay */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

/* Modal container - Tamaños */
.modal-dialog {
  background: #ffffff;
  border-radius: 1rem;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transform: translateY(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Tamaños del modal */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 600px;
}

.modal-lg {
  max-width: 900px;
}

.modal-xl {
  max-width: 1200px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 90vh;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-dialog,
.fade-leave-active .modal-dialog {
  transition: transform 0.3s ease;
}

.fade-enter-from .modal-dialog,
.fade-leave-to .modal-dialog {
  transform: translateY(-50px) scale(0.95);
}

/* Header */
.modal-header {
  background-color: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-weight: 600;
  font-size: 1.25rem;
  color: #212529;
}

/* Body */
.modal-body {
  padding: 1.5rem;
  font-size: 0.95rem;
  color: #495057;
  flex: 1;
  overflow: visible;
}

.modal-body-scrollable {
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

/* Scrollbar personalizada */
.modal-body-scrollable::-webkit-scrollbar {
  width: 8px;
}

.modal-body-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body-scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-body-scrollable::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  background-color: #f8f9fa;
}

/* Buttons */
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close::before {
  content: "×";
  font-size: 2rem;
  line-height: 1;
}

.btn-close:hover {
  opacity: 1;
}

.btn-secondary {
  background-color: #6c757d;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.btn-success {
  background-color: #198754;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
  cursor: pointer;
  font-weight: 500;
}

.btn-success:hover {
  background-color: #157347;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-dialog {
    width: 95%;
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-sm,
  .modal-md,
  .modal-lg,
  .modal-xl {
    max-width: 95%;
  }

  .modal-header {
    padding: 0.75rem 1rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-body-scrollable {
    max-height: calc(95vh - 120px);
  }

  .modal-footer {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }
}
</style>