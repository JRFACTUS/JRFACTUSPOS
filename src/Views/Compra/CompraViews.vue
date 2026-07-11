<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main v-if="usuario" class="container-fluid py-4">
        <CompraFormulario
          ref="compraFormularioRef"
          :usuario="usuario"
          :proveedores="proveedores"
          @guardar-compra="guardarCompra"
        />

        <!-- Modal de productos -->
        <ModalCompra
          :visible="modalProductoOpen"
          @close="modalProductoOpen = false"
          @select="agregarProductoDesdeModal"
        />
      </main>

      <div v-else class="text-center p-5">
        ⚠️ Debes iniciar sesión para acceder a esta página.
      </div>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import CompraFormulario from "@/Views/Compra/CompraFormulario.vue";
import ModalCompra from "@/components/Modalcompra.vue";
import api from "@/services/api.js";
import router from "@/router";

export default {
  name: "CompraViews",
  components: { Header, Sidebar, CompraFormulario, ModalCompra },

  setup() {
    const sidebarOpen = ref(false);
    const usuario = ref(null);
    const proveedores = ref([]);
    const modalProductoOpen = ref(false);
    const compraFormularioRef = ref(null); // ✅ Ref al formulario

    // Revisa sesión
    const checkSesion = () => {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      if (token && userJson) {
        usuario.value = JSON.parse(userJson);
      } else {
        usuario.value = null;
        router.push("/login");
      }
    };

    // Cargar proveedores
    const fetchProveedores = async () => {
      try {
        const res = await api.get("/provedores");
        proveedores.value = res.data.data || [];
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
      }
    };

    // Guardar compra (simulación)
    const guardarCompra = (compra) => {
      console.log("Compra guardada:", compra);
      alert("Compra registrada correctamente (simulación).");
    };

    // Abrir modal con F4
    const handleKeyDown = (e) => {
      if (e.key === "F4") {
        e.preventDefault();
        modalProductoOpen.value = true;
      }
    };

    // Agregar producto desde modal al formulario
    const agregarProductoDesdeModal = (prod) => {
      // Llamar al método expuesto en CompraFormulario
      compraFormularioRef.value?.agregarProductoDesdeModal(prod);
      modalProductoOpen.value = false; // cerrar modal
    };

    onMounted(() => {
      checkSesion();
      fetchProveedores();
      window.addEventListener("keydown", handleKeyDown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });

    return {
      sidebarOpen,
      usuario,
      proveedores,
      modalProductoOpen,
      compraFormularioRef,
      guardarCompra,
      agregarProductoDesdeModal,
    };
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  margin-top: 60px;
  transition: margin-left 0.3s ease;
}
@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1019;
}
</style>
