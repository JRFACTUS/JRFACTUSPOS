<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
    <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid pt-5 pt-lg-4 mt-4">
        <div class="no-autorizado text-center">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a este módulo.</p>

          <button class="btn btn-danger" @click="volver">Volver a mi módulo</button>
        </div>
      </main>
    </div>

    <!-- Overlay móvil -->
    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; // IMPORTANTE
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "NoAutorizadoViews",
  components: { Header, Sidebar },

  setup() {
    const sidebarOpen = ref(false);
    const router = useRouter(); // <-- usar useRouter para acceder al router

    const volver = () => {
      // Intentar volver a la ruta anterior
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/dashboard");
      }
    };

    return {
      sidebarOpen,
      volver,
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

.no-autorizado {
  margin-top: 100px;
}

.no-autorizado h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.no-autorizado p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}
</style>
