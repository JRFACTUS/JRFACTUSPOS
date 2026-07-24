<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main v-if="usuario" class="container-fluid py-4">
        <CompraFormulario
          :usuario="usuario"
          :proveedores="proveedores"
          @guardar-compra="guardarCompra"
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
import { ref, onMounted } from "vue";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import CompraFormulario from "@/Views/Ventas/VentasFormulario.vue";
import api from "@/services/api.js";
import router from "@/router";

export default {
  name: "VentasViews",
  components: { Header, Sidebar, CompraFormulario },

  setup() {
    const sidebarOpen = ref(false);
    const usuario = ref(null);
    const proveedores = ref([]);

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

    const fetchProveedores = async () => {
      try {
        const res = await api.get("/provedores");
        proveedores.value = res.data.data || [];
      } catch (e) {
        alert("Error al obtener proveedores. Por favor, intenta nuevamente.");
      }
    };

    const guardarCompra = (compra) => {
      
      alert("Compra registrada correctamente.");
    };

    onMounted(() => {
      checkSesion();
      fetchProveedores();
    });

    return { sidebarOpen, usuario, proveedores, guardarCompra };
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  min-height: 100vh;
  margin-top: 64px;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 35%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  transition:
    margin-left 0.35s ease,
    padding 0.25s ease;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 1019;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  animation: fadeOverlay 0.25s ease;
}

@keyframes fadeOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 991px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
}

@media (max-width: 576px) {
  .main-content {
    margin-top: 58px;
    padding: 16px;
  }
}
</style>