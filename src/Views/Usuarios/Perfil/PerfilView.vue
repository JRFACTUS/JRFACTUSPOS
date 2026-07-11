<template>
  <div class="profile-layout">
    <!-- Sidebar -->
    <Sidebar
      :class="{ 'd-none d-lg-flex': !sidebarOpen }"
      @close-sidebar="sidebarOpen = false"
    />

    <!-- Contenido -->
    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="profile-main">

        <!-- Hero -->
        <section class="profile-hero">
          <div>
            <span class="profile-label">Mi cuenta</span>

            <h2>Perfil de Usuario</h2>

            <p>
              Consulta la información de tu cuenta y el rol asignado dentro del
              sistema.
            </p>
          </div>

          <div class="profile-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
        </section>

        <!-- Información -->
        <section class="profile-card">

          <div class="profile-item">
            <span class="profile-title">
              <i class="bi bi-person"></i>
              Nombre
            </span>

            <strong>{{ usuario.name }}</strong>
          </div>

          <div class="profile-item">
            <span class="profile-title">
              <i class="bi bi-envelope"></i>
              Correo electrónico
            </span>

            <strong>{{ usuario.email || 'No registrado' }}</strong>
          </div>

          <div class="profile-item">
            <span class="profile-title">
              <i class="bi bi-shield-check"></i>
              Rol
            </span>

            <span class="badge bg-primary px-3 py-2">
              {{ usuario.role?.nombre || 'Sin rol' }}
            </span>
          </div>

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
<script setup>
import Header from '@/components/HeaderVue.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref, onMounted } from 'vue';

const sidebarOpen = ref(false);
const usuario = ref({ name: '', email: '', role: null, });

onMounted(() => {
  const userStored = localStorage.getItem('user');
  if (userStored) {
    usuario.value = JSON.parse(userStored);
  }
});
</script>

<style scoped>
.profile-layout {
  min-height: 100vh;
  display: flex;
  background: #eef3f8;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  min-width: 0;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}

.profile-main {
  padding: 28px;
}

.profile-hero {
  background: linear-gradient(135deg, #0d6efd, #084298);
  color: #fff;
  border-radius: 22px;
  padding: 30px;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 15px 35px rgba(13, 110, 253, .25);
}

.profile-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 10px;
  letter-spacing: .8px;
}

.profile-hero h2 {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
}

.profile-hero p {
  margin: 0;
  opacity: .9;
  max-width: 600px;
}

.profile-avatar {
  width: 82px;
  height: 82px;
  border-radius: 22px;
  background: rgba(255,255,255,.18);
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-avatar i {
  font-size: 42px;
}

.profile-card {
  background: #fff;
  border-radius: 22px;
  padding: 30px;
  box-shadow: 0 12px 35px rgba(15,23,42,.08);
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #edf2f7;
}

.profile-item:last-child {
  border-bottom: none;
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-weight: 600;
}

.profile-title i {
  color: #0d6efd;
  font-size: 18px;
}

.profile-item strong {
  color: #0f172a;
  font-weight: 700;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.45);
  z-index: 998;
}

@media (max-width:768px){

.profile-main{
    padding:18px;
}

.profile-hero{
    padding:22px;
}

.profile-avatar{
    display:none;
}

.profile-item{
    flex-direction:column;
    align-items:flex-start;
    gap:8px;
}

}
</style>
