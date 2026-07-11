<template>
  <nav
    :class="[
      'sidebar position-fixed d-flex flex-column p-3 shadow-sm',
      isCollapsed ? 'collapsed' : ''
    ]"
  >
    <!-- Header con logo -->
    <div class="sidebar-header d-flex justify-content-between align-items-center mb-4">
      <router-link to="/dashboard" class="brand-title">
        <i class="bi bi-grid-1x2-fill me-2"></i> Panel
      </router-link>

      <button class="btn-close-custom d-lg-none" @click="$emit('close-sidebar')">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <!-- MENU -->
    <ul class="menu list-unstyled">
      <li v-for="(item, index) in menu" :key="index">
        <div
          class="menu-item"
          :class="{ active: active === item.name }"
          @click="toggleSubmenu(item.name)"
        >
          <div class="d-flex align-items-center">
            <i :class="item.icon + ' me-2'"></i>
            <span>{{ item.title }}</span>
          </div>

          <i
            v-if="item.submenu"
            class="bi"
            :class="openSubmenu === item.name ? 'bi-chevron-down' : 'bi-chevron-right'"
          ></i>
        </div>

        <!-- SUBMENU -->
        <transition name="fade">
          <ul
            v-if="item.submenu"
            v-show="openSubmenu === item.name"
            class="submenu list-unstyled ms-4"
          >
            <li v-for="(sub, subIdx) in item.submenu" :key="subIdx">
              <router-link
                :to="sub.link"
                class="submenu-item"
                :class="{ active: $route.path === sub.link }"
                @click="active = item.name"
              >
                {{ sub.title }}
              </router-link>
            </li>
          </ul>
        </transition>
      </li>
    </ul>

    <!-- Footer / Logout -->
    <div class="mt-auto footer-actions">
     <button class="logout-btn" @click="logout">
  <i class="bi bi-box-arrow-right me-2"></i>
  Cerrar sesión
</button>
    </div>
  </nav>
</template>


<script>
export default {
  name: 'AppSidebar',
  data() {
    return {
      active: 'dashboard',
      isCollapsed: false,
      openSubmenu: null,

     menu: [
  // ==========================
  // INICIO
  // ==========================
  {
    name: 'inicio',
    title: 'Inicio',
    icon: 'bi bi-speedometer2',
    submenu: [
      { title: 'Dashboard', link: '/dashboard' }
    ]
  },

  // ==========================
  // ADMINISTRACIÓN
  // ==========================
  {
    name: 'administracion',
    title: 'Administración',
    icon: 'bi bi-gear',
    submenu: [
      { title: 'Usuarios', link: '/usuarios' },
      { title: 'Roles', link: '/usuarios/roles' }
    ]
  },

  // ==========================
  // CATÁLOGOS
  // ==========================
  {
    name: 'catalogos',
    title: 'Catálogos',
    icon: 'bi bi-journal-bookmark',
    submenu: [
      { title: 'Categorías', link: '/categoria' },
      { title: 'Medidas', link: '/medidas' },
      { title: 'Productos', link: '/productos' }
    ]
  },

  // ==========================
  // COMERCIAL
  // ==========================
  {
    name: 'comercial',
    title: 'Comercial',
    icon: 'bi bi-briefcase',
    submenu: [
      { title: 'Clientes', link: '/clientes' },
      { title: 'Proveedores', link: '/provedores' }
    ]
  },

  // ==========================
  // COMPRAS
  // ==========================
  {
    name: 'compras',
    title: 'Compras',
    icon: 'bi bi-cart-check',
    submenu: [
      { title: 'Nueva Compra', link: '/compras' },
      { title: 'Historial de Compras', link: '/compras/Listar_compras' }
    ]
  },

  // ==========================
  // INVENTARIO
  // ==========================
  {
    name: 'inventario',
    title: 'Inventario',
    icon: 'bi bi-boxes',
    submenu: [
      { title: 'Inventario', link: '/Inventario' },
      { title: 'Kardex', link: '/Inventario/kardex' }
    ]
  },

  // ==========================
  // VENTAS
  // ==========================
  {
    name: 'ventas',
    title: 'Ventas',
    icon: 'bi bi-cash-stack',
    submenu: [
      { title: 'Nueva Venta', link: '/ventas' },
      { title: 'Caja', link: '/ventas/caja' },
      { title: 'Historial de Ventas', link: '/ventas/historial' }
    ]
  },

  // ==========================
  // FACTURACIÓN
  // ==========================
  {
    name: 'facturacion',
    title: 'Facturación',
    icon: 'bi bi-receipt-cutoff',
    submenu: [
      { title: 'Emitir CFDI', link: '/facturacion' },
      { title: 'Listado de CFDI', link: '/facturacion/listar_factura' }
    ]
  },

//reportes
  {
    name: 'reportes',
    title: 'reportes',
    icon: 'bi bi-graph-up',
    submenu: [
      { title: 'reportes', link: '/reporte_venta' },
      { title: 'Reporte inventario', link: '/reporte_inventario' },
      { title: 'Reporte compras', link: '/reporte_compra' }
      
    ]
  }
]
    };
  },
  methods: {

  toggleSubmenu(name) {
    this.openSubmenu = this.openSubmenu === name ? null : name;
    this.active = name;
  },

  logout() {

    const confirmar = confirm(
      '¿Seguro que deseas cerrar sesión?'
    );

    if (!confirmar) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.$router.push('/login');
  }

}
};
</script>

<style scoped>

.sidebar{
    position:fixed;
    top:0;
    left:0;
    width:250px;
    height:100vh;
    background:#ffffff;
    border-right:1px solid #e8edf3;
    z-index:1020;
    overflow-y:auto;
    transition:.3s ease;
}

.sidebar::-webkit-scrollbar{
    width:6px;
}

.sidebar::-webkit-scrollbar-track{
    background:transparent;
}

.sidebar::-webkit-scrollbar-thumb{
    background:#cfd8e3;
    border-radius:20px;
}

.sidebar::-webkit-scrollbar-thumb:hover{
    background:#aeb8c4;
}

/* HEADER */

.sidebar-header{
    padding-bottom:18px;
    margin-bottom:8px;
    border-bottom:1px solid #eef2f6;
}

.brand-title{
    display:flex;
    align-items:center;
    text-decoration:none;
    font-size:22px;
    font-weight:800;
    color:#0B5EA8;
    letter-spacing:-.3px;
}

.brand-title i{
    color:#F58220;
    font-size:22px;
}

.brand-title:hover{
    color:#084b85;
}

.btn-close-custom{
    border:none;
    background:none;
    color:#667085;
    font-size:24px;
    width:38px;
    height:38px;
    border-radius:8px;
    transition:.2s;
}

.btn-close-custom:hover{
    background:#f5f7fa;
}

/* MENU */

.menu{
    margin-top:12px;
}

.menu li{
    margin-bottom:5px;
}

.menu-item{
    display:flex;
    align-items:center;
    justify-content:space-between;

    padding:13px 14px;

    border-radius:10px;

    cursor:pointer;

    color:#344054;
    font-size:14.5px;
    font-weight:600;

    transition:.18s ease;
}

.menu-item:hover{
    background:#f5f8fc;
    color:#0B5EA8;
}

.menu-item.active{
    background:#0B5EA8;
    color:#ffffff;
}

.menu-item.active i{
    color:#ffffff;
}

.menu-item i{
    font-size:16px;
    color:#0B5EA8;
}

/* SUBMENU */

.submenu{
    margin-top:6px;
    margin-bottom:10px;
    margin-left:12px;
    padding-left:10px;
    border-left:2px solid #eef2f6;
}

.submenu-item{
    display:block;

    padding:10px 12px;

    border-radius:8px;

    text-decoration:none;

    color:#667085;

    font-size:14px;
    font-weight:500;

    transition:.18s ease;

    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}

.submenu-item:hover{
    background:#f5f8fc;
    color:#0B5EA8;
}

.submenu-item.active{
    background:#eef6ff;
    color:#0B5EA8;
    font-weight:700;
}

/* FOOTER */

.footer-actions{
    margin-top:auto;
    padding-top:16px;
    border-top:1px solid #eef2f6;
}

/* BOTON LOGOUT */

.logout-btn{
    width:100%;

    border:none;

    background:#fff4ed;

    color:#d35400;

    padding:12px;

    border-radius:10px;

    font-size:14px;
    font-weight:700;

    transition:.2s ease;
}

.logout-btn:hover{
    background:#F58220;
    color:#ffffff;
}

/* ANIMACION */

.fade-enter-active,
.fade-leave-active{
    transition:all .20s ease;
}

.fade-enter-from,
.fade-leave-to{
    opacity:0;
    transform:translateY(-4px);
}

/* RESPONSIVE */

@media (max-width:991px){

    .sidebar{
        width:280px;
        max-width:85vw;
        box-shadow:0 18px 45px rgba(15,23,42,.18);
    }

}

@media (max-width:576px){

    .sidebar{
        width:100%;
        max-width:320px;
    }

    .brand-title{
        font-size:20px;
    }

    .menu-item{
        padding:12px;
        font-size:14px;
    }

    .submenu-item{
        font-size:13.5px;
    }

}

</style>