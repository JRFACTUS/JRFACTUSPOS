<template>
  <nav :class="[
    'sidebar position-fixed d-flex flex-column p-3 shadow-sm',
    isCollapsed ? 'collapsed' : ''
  ]">
    <!-- ENCABEZADO -->
    <div class="sidebar-header d-flex justify-content-between align-items-center mb-4">
      <router-link to="/dashboard" class="brand-title">
        <i class="bi bi-grid-1x2-fill me-2"></i>
        Panel
      </router-link>

      <button type="button" class="btn-close-custom d-lg-none" aria-label="Cerrar menú" @click="$emit('close-sidebar')">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <!-- MENÚ FILTRADO POR PERMISOS -->
    <ul class="menu list-unstyled">
      <li v-for="item in menuFiltrado" :key="item.name">
        <div class="menu-item" :class="{ active: active === item.name }" @click="toggleSubmenu(item.name)">
          <div class="d-flex align-items-center">
            <i :class="item.icon + ' me-2'"></i>

            <span>
              {{ item.title }}
            </span>
          </div>

          <i class="bi" :class="openSubmenu === item.name
              ? 'bi-chevron-down'
              : 'bi-chevron-right'
            "></i>
        </div>

        <transition name="fade">
          <ul v-show="openSubmenu === item.name" class="submenu list-unstyled ms-4">
            <li v-for="sub in item.submenu" :key="sub.link">
              <router-link :to="sub.link" class="submenu-item" :class="{
                active:
                  $route.path.toLowerCase() ===
                  sub.link.toLowerCase()
              }" @click="active = item.name">
                {{ sub.title }}
              </router-link>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
    <!-- CERRAR SESIÓN -->
    <div class="mt-auto footer-actions">
      <button type="button" class="logout-btn" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i>
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>


<script>
export default {
  name: 'AppSidebar',

  emits: ['close-sidebar'],

  data() {
    return {
      active: '',
      isCollapsed: false,
      openSubmenu: null,

      usuario: {},
      permisos: [],

      menu: [
        {
          name: 'inicio',
          title: 'Inicio',
          icon: 'bi bi-speedometer2',
          submenu: [
            {
              title: 'Dashboard',
              link: '/dashboard',
              modulo: 'dashboard',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'administracion',
          title: 'Administración',
          icon: 'bi bi-gear',
          submenu: [
            {
              title: 'Usuarios',
              link: '/usuarios',
              modulo: 'usuarios',
              
            },
            {
              title: 'Roles',
              link: '/usuarios/roles',
              modulo: 'roles',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'catalogos',
          title: 'Catálogos',
          icon: 'bi bi-journal-bookmark',
          submenu: [
            {
              title: 'Categorías',
              link: '/categoria',
              modulo: 'categoria',
              accion: 'listar'
            },
            {
              title: 'Medidas',
              link: '/medidas',
              modulo: 'medida',
              accion: 'listar'
            },
            {
              title: 'Productos',
              link: '/productos',
              modulo: 'productos',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'comercial',
          title: 'Comercial',
          icon: 'bi bi-briefcase',
          submenu: [
            {
              title: 'Clientes',
              link: '/clientes',
              modulo: 'clientes',
              accion: 'listar'
            },
            {
              title: 'Proveedores',
              link: '/provedores',
              modulo: 'provedores',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'compras',
          title: 'Compras',
          icon: 'bi bi-cart-check',
          submenu: [
            {
              title: 'Nueva Compra',
              link: '/compras',
              modulo: 'compras',
              accion: 'crear'
            },
            {
              title: 'Historial de Compras',
              link: '/compras/listar_compras',
              modulo: 'listar_compras',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'inventario',
          title: 'Inventario',
          icon: 'bi bi-boxes',

          // Si inventario.listar es 0, se oculta todo el grupo.
          permisoPrincipal: {
            modulo: 'inventario',
            accion: 'listar'
          },

          submenu: [
            {
              title: 'Inventario',
              link: '/inventario',
              modulo: 'inventario',
              accion: 'listar'
            },
            {
              title: 'Kardex',
              link: '/inventario/kardex',
              modulo: 'kardex',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'ventas',
          title: 'Ventas',
          icon: 'bi bi-cash-stack',
          submenu: [
            {
              title: 'Nueva Venta',
              link: '/ventas',
              modulo: 'ventas',
              accion: 'crear'
            },
            {
              title: 'Caja',
              link: '/ventas/caja',
              modulo: 'caja',
              accion: 'listar'
            },
            {
              title: 'Historial de Ventas',
              link: '/ventas/historial',
              modulo: 'historial',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'facturacion',
          title: 'Facturación',
          icon: 'bi bi-receipt-cutoff',
          submenu: [
            {
              title: 'Emitir CFDI',
              link: '/facturacion',
              modulo: 'facturacion',
              accion: 'crear'
            },
            {
              title: 'Listado de CFDI',
              link: '/facturacion/listar_factura',
              modulo: 'listar_factura',
              accion: 'listar'
            }
          ]
        },

        {
          name: 'reportes',
          title: 'Reportes',
          icon: 'bi bi-graph-up',
          submenu: [
            {
              title: 'Reporte de ventas',
              link: '/reporte_venta',
              modulo: 'reporte_venta',
              accion: 'listar'
            },
            {
              title: 'Reporte de inventario',
              link: '/reporte_inventario',
              modulo: 'reporte_inventario',
              accion: 'listar'
            },
            {
              title: 'Reporte de compras',
              link: '/reporte_compra',
              modulo: 'reporte_compra',
              accion: 'listar'
            }
          ]
        }
      ]
    };
  },

  computed: {
    esAdministrador() {
      const valor = this.usuario?.es_admin;

      const nombreRol = String(
        this.usuario?.role?.nombre ||
        this.usuario?.rol?.nombre ||
        ''
      )
        .trim()
        .toLowerCase();

      return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true' ||
        nombreRol === 'administrador' ||
        nombreRol === 'admin'
      );
    },

    menuFiltrado() {
      // El administrador visualiza todo.
      if (this.esAdministrador) {
        return this.menu;
      }

      return this.menu.reduce((resultado, grupo) => {
        /*
         * Validar permiso principal.
         * Actualmente se utiliza en Inventario.
         */
        if (grupo.permisoPrincipal) {
          const permitido = this.tienePermiso(
            grupo.permisoPrincipal.modulo,
            grupo.permisoPrincipal.accion
          );

          if (!permitido) {
            return resultado;
          }
        }

        // Filtrar las opciones permitidas.
        const submenuPermitido = grupo.submenu.filter((opcion) => {
          return this.tienePermiso(
            opcion.modulo,
            opcion.accion
          );
        });

        // Si no queda ninguna opción, ocultar el grupo completo.
        if (submenuPermitido.length === 0) {
          return resultado;
        }

        resultado.push({
          ...grupo,
          submenu: submenuPermitido
        });

        return resultado;
      }, []);
    }
  },

  watch: {
    '$route.path': {
      immediate: true,

      handler() {
        this.marcarMenuActivo();
      }
    }
  },

  mounted() {
    this.cargarSesion();

    window.addEventListener(
      'storage',
      this.cargarSesion
    );

    window.addEventListener(
      'permisos-actualizados',
      this.cargarSesion
    );

    window.addEventListener(
      'focus',
      this.cargarSesion
    );
  },

  beforeUnmount() {
    window.removeEventListener(
      'storage',
      this.cargarSesion
    );

    window.removeEventListener(
      'permisos-actualizados',
      this.cargarSesion
    );

    window.removeEventListener(
      'focus',
      this.cargarSesion
    );
  },


  methods: {
    cargarSesion() {
      try {
        const usuarioGuardado = JSON.parse(
          localStorage.getItem('user') || '{}'
        );

        this.usuario = usuarioGuardado;

        /*
         * Primero intenta leer user.permisos.
         */
        if (Array.isArray(usuarioGuardado.permisos)) {
          this.permisos = usuarioGuardado.permisos;
        } else {
          /*
           * Como tus permisos están guardados así:
           *
           * permisos_ventas
           * permisos_compras
           * permisos_inventario
           *
           * los recorremos y formamos un arreglo.
           */
          this.permisos =
            this.obtenerPermisosLocalStorage();
        }

        console.log(
          'Usuario Sidebar:',
          this.usuario
        );

        console.log(
          'Administrador:',
          this.esAdministrador
        );

        console.log(
          'Permisos Sidebar:',
          this.permisos
        );
      } catch (error) {
        console.error(
          'Error al cargar la sesión:',
          error
        );

        this.usuario = {};
        this.permisos = [];
      }
    },

    obtenerPermisosLocalStorage() {
      const permisosEncontrados = [];

      for (
        let indice = 0;
        indice < localStorage.length;
        indice += 1
      ) {
        const clave = localStorage.key(indice);

        if (
          !clave ||
          !clave.startsWith('permisos_')
        ) {
          continue;
        }

        try {
          const modulo = clave
            .replace('permisos_', '')
            .trim()
            .toLowerCase();

          const acciones = JSON.parse(
            localStorage.getItem(clave) || '{}'
          );

          permisosEncontrados.push({
            modulo,
            listar: acciones.listar ?? false,
            crear: acciones.crear ?? false,
            actualizar: acciones.actualizar ?? false,
            eliminar: acciones.eliminar ?? false
          });
        } catch (error) {
          console.error(
            `No se pudo leer ${clave}:`,
            error
          );
        }
      }

      return permisosEncontrados;
    },

    tienePermiso(modulo, accion = 'listar') {
      if (this.esAdministrador) {
        return true;
      }

      const moduloBuscado = String(modulo)
        .trim()
        .toLowerCase();

      const permiso = this.permisos.find((item) => {
        return (
          String(item.modulo)
            .trim()
            .toLowerCase() === moduloBuscado
        );
      });

      if (!permiso) {
        return false;
      }

      const valor = permiso[accion];

      return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
      );
    },

    toggleSubmenu(nombreGrupo) {
      this.openSubmenu =
        this.openSubmenu === nombreGrupo
          ? null
          : nombreGrupo;

      this.active = nombreGrupo;
    },

    seleccionarOpcion(nombreGrupo) {
      this.active = nombreGrupo;
      this.$emit('close-sidebar');
    },

    marcarMenuActivo() {
      const rutaActual = String(
        this.$route.path || ''
      )
        .trim()
        .toLowerCase();

      const grupoEncontrado =
        this.menuFiltrado.find((grupo) => {
          return grupo.submenu.some((opcion) => {
            return this.rutaCoincide(
              opcion.link,
              rutaActual
            );
          });
        });

      if (grupoEncontrado) {
        this.active = grupoEncontrado.name;
        this.openSubmenu = grupoEncontrado.name;
      } else {
        this.active = '';
        this.openSubmenu = null;
      }
    },

    rutaCoincide(link, rutaActual) {
      const rutaMenu = String(link)
        .trim()
        .toLowerCase();

      const ruta = String(rutaActual)
        .trim()
        .toLowerCase();

      return (
        ruta === rutaMenu ||
        ruta.startsWith(`${rutaMenu}/`)
      );
    },

    rutaActiva(link) {
      return (
        String(this.$route.path)
          .trim()
          .toLowerCase() ===
        String(link)
          .trim()
          .toLowerCase()
      );
    },

    logout() {
      const confirmar = window.confirm(
        '¿Seguro que deseas cerrar sesión?'
      );

      if (!confirmar) {
        return;
      }

      localStorage.clear();

      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e8edf3;
  z-index: 1020;
  overflow-y: auto;
  transition: .3s ease;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #cfd8e3;
  border-radius: 20px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #aeb8c4;
}

/* HEADER */

.sidebar-header {
  padding-bottom: 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid #eef2f6;
}

.brand-title {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 22px;
  font-weight: 800;
  color: #0B5EA8;
  letter-spacing: -.3px;
}

.brand-title i {
  color: #F58220;
  font-size: 22px;
}

.brand-title:hover {
  color: #084b85;
}

.btn-close-custom {
  border: none;
  background: none;
  color: #667085;
  font-size: 24px;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  transition: .2s;
}

.btn-close-custom:hover {
  background: #f5f7fa;
}

/* MENU */

.menu {
  margin-top: 12px;
}

.menu li {
  margin-bottom: 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 14px;

  border-radius: 10px;

  cursor: pointer;

  color: #344054;
  font-size: 14.5px;
  font-weight: 600;

  transition: .18s ease;
}

.menu-item:hover {
  background: #f5f8fc;
  color: #0B5EA8;
}

.menu-item.active {
  background: #0B5EA8;
  color: #ffffff;
}

.menu-item.active i {
  color: #ffffff;
}

.menu-item i {
  font-size: 16px;
  color: #0B5EA8;
}

/* SUBMENU */

.submenu {
  margin-top: 6px;
  margin-bottom: 10px;
  margin-left: 12px;
  padding-left: 10px;
  border-left: 2px solid #eef2f6;
}

.submenu-item {
  display: block;

  padding: 10px 12px;

  border-radius: 8px;

  text-decoration: none;

  color: #667085;

  font-size: 14px;
  font-weight: 500;

  transition: .18s ease;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submenu-item:hover {
  background: #f5f8fc;
  color: #0B5EA8;
}

.submenu-item.active {
  background: #eef6ff;
  color: #0B5EA8;
  font-weight: 700;
}

/* FOOTER */

.footer-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eef2f6;
}

/* BOTON LOGOUT */

.logout-btn {
  width: 100%;

  border: none;

  background: #fff4ed;

  color: #d35400;

  padding: 12px;

  border-radius: 10px;

  font-size: 14px;
  font-weight: 700;

  transition: .2s ease;
}

.logout-btn:hover {
  background: #F58220;
  color: #ffffff;
}

/* ANIMACION */

.fade-enter-active,
.fade-leave-active {
  transition: all .20s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* RESPONSIVE */

@media (max-width:991px) {

  .sidebar {
    width: 280px;
    max-width: 85vw;
    box-shadow: 0 18px 45px rgba(15, 23, 42, .18);
  }

}

@media (max-width:576px) {

  .sidebar {
    width: 100%;
    max-width: 320px;
  }

  .brand-title {
    font-size: 20px;
  }

  .menu-item {
    padding: 12px;
    font-size: 14px;
  }

  .submenu-item {
    font-size: 13.5px;
  }

}
</style>