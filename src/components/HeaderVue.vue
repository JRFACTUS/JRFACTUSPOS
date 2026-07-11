<template>
  <header class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
    <div class="container-fluid">

      <!-- Botón menú móvil -->
      <button class="btn btn-outline-secondary d-lg-none me-3" @click="toggleSidebar">
        <i class="bi bi-list fs-4"></i>
      </button>

      <!-- Logo -->
      <router-link to="/dashboard" class="navbar-brand fw-bold">
        JRFactu
      </router-link>

      <!-- Menú móvil -->
      <button class="navbar-toggler" type="button" @click="menuMovilAbierto = !menuMovilAbierto">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navbarContent" class="collapse navbar-collapse justify-content-end" :class="{ show: menuMovilAbierto }">

        <ul class="navbar-nav align-items-center">

          <!-- Usuario -->
          <li class="nav-item dropdown user-dropdown">

            <button class="nav-link dropdown-toggle d-flex align-items-center user-btn" type="button"
              @click.stop="dropdownAbierto = !dropdownAbierto">
              <img :src="empresa.logo_url" alt="Logo Empresa" class="rounded-circle me-2 empresa-logo" />

              <span class="d-none d-sm-inline">
                {{ usuario.name }}
              </span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: dropdownAbierto }">

              <li>
                <button class="dropdown-item d-flex align-items-center" @click="irPerfil">
                  <i class="bi bi-person me-2"></i>
                  Perfil
                </button>
              </li>

              <li>
                <button class="dropdown-item d-flex align-items-center" @click="irConfiguracion">
                  <i class="bi bi-gear me-2"></i>
                  Configuración
                </button>
              </li>

              <li>
                <hr class="dropdown-divider">
              </li>

              <li>
                <button class="dropdown-item d-flex align-items-center text-danger" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Cerrar sesión
                </button>
              </li>

            </ul>

          </li>

        </ul>

      </div>

    </div>

    <div v-if="cerrandoSesion" class="logout-message">
      Cerrando sesión...
    </div>

  </header>
</template>
<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import api from "@/services/api.js";
import router from "@/router";

export default {
  name: "HeaderVue",
  emits: ["toggle-sidebar"],

  setup(props, { emit }) {
    const usuario = ref({ name: "Usuario" });
    const empresa = ref({
      nombre: "",
      logo_url: null,
    });

    const cerrandoSesion = ref(false);
    const dropdownAbierto = ref(false);
    const menuMovilAbierto = ref(false);

    const toggleSidebar = () => {
      emit("toggle-sidebar");
    };

    const cargarUsuario = () => {
      const userStored = localStorage.getItem("user");

      if (userStored) {
        usuario.value = JSON.parse(userStored);
      }
    };

    const cargarEmpresa = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/getEmpresa", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        empresa.value = response.data.data;

      } catch (error) {
        console.error("Error cargando empresa:", error);
      }
    };

    const cerrarDropdownFuera = (e) => {
      const menu = document.querySelector(".user-dropdown");

      if (menu && !menu.contains(e.target)) {
        dropdownAbierto.value = false;
      }
    };

    onMounted(() => {
      cargarUsuario();
      cargarEmpresa();
      document.addEventListener("click", cerrarDropdownFuera);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", cerrarDropdownFuera);
    });

    const irPerfil = () => {
      dropdownAbierto.value = false;
      menuMovilAbierto.value = false;
      router.push({ name: "perfil" });
    };

    const irConfiguracion = () => {
      dropdownAbierto.value = false;
      menuMovilAbierto.value = false;
      router.push({ name: "configuracion" });
    };

    const logout = async () => {
      dropdownAbierto.value = false;
      menuMovilAbierto.value = false;

      const confirmed = window.confirm("¿Seguro que quieres cerrar sesión?");
      if (!confirmed) return;

      try {
        const token = localStorage.getItem("token");
        cerrandoSesion.value = true;

        if (token) {
          await api.delete("/logout", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          router.push("/login");
          cerrandoSesion.value = false;
        }, 1200);

      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
        cerrandoSesion.value = false;
      }
    };

    return {
      usuario,
      empresa,
      cerrandoSesion,
      dropdownAbierto,
      menuMovilAbierto,
      toggleSidebar,
      irPerfil,
      irConfiguracion,
      logout,
    };
  },
};
</script>
<style scoped>
.navbar {
  height: 64px;
  background: #ffffff !important;
  border-bottom: 1px solid #e8edf3;
  box-shadow: 0 2px 10px rgba(15, 23, 42, .04) !important;
  z-index: 1010;
}

.container-fluid {
  padding-left: 22px;
  padding-right: 22px;
}

.navbar-brand {
  color: #0B5EA8 !important;
  font-size: 20px;
  font-weight: 800 !important;
  letter-spacing: -.3px;
}

.navbar-brand:hover {
  color: #084b85 !important;
}

/* BOTÓN MENÚ MÓVIL */

.btn-outline-secondary {
  border: 1px solid #d0d7e2;
  color: #0B5EA8;
  background: #ffffff;
  border-radius: 10px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-outline-secondary:hover {
  background: #f5f8fc;
  color: #0B5EA8;
  border-color: #b8c4d4;
}

/* TOGGLER BOOTSTRAP */

.navbar-toggler {
  border: 1px solid #d0d7e2;
  border-radius: 10px;
  padding: 8px 10px;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 4px rgba(11, 94, 168, .12);
}

/* USER MENU */

.nav-link {
  color: #344054 !important;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 12px !important;
  transition: .2s ease;
}

.nav-link:hover {
  background: #f5f8fc;
  color: #0B5EA8 !important;
}

.nav-link img {
  width: 34px;
  height: 34px;
  border: 2px solid #eef2f6;
  object-fit: cover;
}

.dropdown-toggle::after {
  margin-left: 10px;
  color: #98a2b3;
}

/* DROPDOWN */

.dropdown-menu {
  border: 1px solid #e8edf3;
  border-radius: 12px;
  padding: 8px;
  min-width: 220px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, .12) !important;
}

.dropdown-item {
  border-radius: 9px;
  padding: 10px 12px;
  color: #344054;
  font-size: 14px;
  font-weight: 600;
  transition: .18s ease;
}

.dropdown-item i {
  color: #0B5EA8;
}

.dropdown-item:hover {
  background: #f5f8fc;
  color: #0B5EA8;
}

.dropdown-item.text-danger {
  color: #c2410c !important;
}

.dropdown-item.text-danger i {
  color: #c2410c;
}

.dropdown-item.text-danger:hover {
  background: #fff4ed;
  color: #c2410c !important;
}

.dropdown-divider {
  margin: 7px 0;
  border-color: #eef2f6;
}

/* MENSAJE CERRANDO SESIÓN */

.logout-message {
  position: fixed;
  top: 76px;
  right: 24px;
  background: #0B5EA8;
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 14px 30px rgba(11, 94, 168, .25);
  z-index: 2000;
}

/* RESPONSIVE */

@media(max-width:991px) {

  .navbar {
    height: auto;
    min-height: 64px;
  }

  .container-fluid {
    padding-left: 14px;
    padding-right: 14px;
  }

  .navbar-collapse {
    margin-top: 12px;
    padding: 12px;
    background: #ffffff;
    border-top: 1px solid #eef2f6;
  }

  .navbar-nav {
    align-items: flex-start !important;
  }

  .nav-item {
    width: 100%;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
  }

  .dropdown-menu {
    width: 100%;
    margin-top: 8px;
    box-shadow: none !important;
  }

  .logout-message {
    right: 14px;
    left: 14px;
    text-align: center;
  }
}

@media(max-width:576px) {

  .navbar-brand {
    font-size: 18px;
  }

  .btn-outline-secondary {
    width: 40px;
    height: 40px;
  }
}

.user-dropdown {
  position: relative;
}

.user-btn {
  border: none;
  background: transparent;
}

.dropdown-menu.show {
  display: block;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 3000;
}
</style>