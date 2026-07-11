<template>
  <div class="config-layout">
    <Sidebar
      :class="{ 'd-none d-lg-flex': !sidebarOpen }"
      @close-sidebar="sidebarOpen = false"
    />

    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="config-main">
        <section class="config-hero">
  <div>
    <span class="config-label">Panel administrativo</span>
    <h2>Configuración del sistema</h2>
    Aquí podrás configurar la información de tu empresa. Si emitirás facturas electrónicas (CFDI), completa los datos fiscales y carga tu Certificado de Sello Digital (CSD). Si no utilizarás este módulo, solo registra la información general de la empresa, como el nombre comercial, teléfono, dirección y código postal.  </div>

  <div class="config-icon">
    <i class="bi bi-gear-fill"></i>
  </div>
</section>

        <section class="config-content">
          <Informacion />
        </section>
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay d-lg-none"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script>
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import Informacion from '@/Views/Configuracion/Infomacion.vue';

export default {
  components: { Header, Sidebar, Informacion },
  data() {
    return {
      sidebarOpen: false
    };
  }
};
</script>

<style scoped>

.config-layout {
  min-height: 100vh;
  display: flex;
  background: #eef3f8;
}

.main-content {
  flex: 1;
  min-width: 0;
  margin-top: 60px;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}

.config-main {
  padding: 28px;
}

.config-hero {
  background: linear-gradient(135deg, #0d6efd, #084298);
  border-radius: 24px;
  padding: 30px;
  color: #fff;
  margin-bottom: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 35px rgba(13, 110, 253, 0.28);
}

.config-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.config-hero h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 900;
}

.config-hero p {
  margin: 0;
  max-width: 620px;
  opacity: 0.9;
}

.config-icon {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.config-content {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 998;
}

@media (max-width: 768px) {
  .config-main {
    padding: 18px;
  }

  .config-hero {
    padding: 24px;
    align-items: flex-start;
  }

  .config-icon {
    display: none;
  }

  .config-hero h2 {
    font-size: 23px;
  }

  .config-content {
    padding: 16px;
  }
}
</style>
