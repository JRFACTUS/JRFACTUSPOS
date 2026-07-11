import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../Views/Dashboard/DashboardViews.vue";
import Categoria from "../Views/Categoria/CategoriaViews.vue";
import Medidas from "../Views/Medidas/MedidasViews.vue";
import Productos from "../Views/Productos/ProductosViews.vue";
import Provedor from "../Views/Provedor/ProvedorViews.vue";
import Compras from "../Views/Compra/CompraViews.vue";
import Listar_compras from "../Views/Compra/Listar_comprasViews.vue";

import Login from "../Views/Login/LoginViews.vue";
import Ventas from "../Views/Ventas/VentasViews.vue";
import Caja from "../Views/Ventas/Caja/CajaViews.vue";
import Historial from "../Views/Ventas/Detalle/HistorialVentas.vue";
import Inventario from "../Views/Inventario/InventarioViews.vue";
import Kardex from "../Views/Inventario/Kardex/KardexViews.vue";
import Usuarios from "../Views/Usuarios/UsuariosViews.vue";
import Roles from "../Views/Usuarios/Roles/RolesViews.vue";
import Perfil from "../Views/Usuarios/Perfil/PerfilView.vue";
import Configuracion from "../Views/Configuracion/ConfiguracionViews.vue";
import Clientes from "../Views/Clientes/ClientesViews.vue";
import Facturacion from "../Views/Facturacion/FacturacionViews.vue";
import Listar from "../Views/Facturacion/listar/Listar_FacturaViews.vue";
import reporteventa from "../Views/Reporte/reporte_ventaViews.vue";
import reporteinvetario from "../Views/Reporte/reporte_inventarioViews.vue";
import reportecompra from "../Views/Reporte/reporte_compraViews.vue";


import NoAutorizado from "../Views/Errors/NoAutorizadoViews.vue";

import { obtenerPermisosPorModulo } from "../services/api";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", name: "login", component: Login },

  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/categoria", component: Categoria, meta: { requiresAuth: true, modulo: "categoria" } },
  { path: "/medidas", component: Medidas, meta: { requiresAuth: true, modulo: "medida" } },
  { path: "/productos", component: Productos, meta: { requiresAuth: true, modulo: "productos" } },
  { path: "/provedores", component: Provedor, meta: { requiresAuth: true, modulo: "provedores" } },
  { path: "/compras", component: Compras, meta: { requiresAuth: true, modulo: "compras" } },
  { path: "/compras/listar_compras", component: Listar_compras, meta: { requiresAuth: true, modulo: "listar_compras" } },
  { path: "/ventas", component: Ventas, meta: { requiresAuth: true, modulo: "ventas" } },
  { path: "/ventas/caja", component: Caja, meta: { requiresAuth: true, modulo: "caja" } },
  { path: "/ventas/historial", component: Historial, meta: { requiresAuth: true, modulo: "historial" } },
  { path: "/inventario", component: Inventario, meta: { requiresAuth: true, modulo: "inventario" } },
  { path: "/inventario/kardex", component: Kardex, meta: { requiresAuth: true, modulo: "kardex" } },
  { path: "/usuarios", component: Usuarios, meta: { requiresAuth: true, modulo: "usuarios" } },
  { path: "/usuarios/roles", component: Roles, meta: { requiresAuth: true, modulo: "roles" } },
  { path: "/usuarios/perfil",name: "perfil", component: Perfil, meta: { requiresAuth: true, modulo: "perfil" } },
  { path: "/configuracion",name: "configuracion", component: Configuracion, meta: { requiresAuth: true, modulo: "configuracion" } },
  { path: "/clientes", component: Clientes, meta: { requiresAuth: true, modulo: "clientes" } },
    { path: "/facturacion", component: Facturacion, meta: { requiresAuth: true, modulo: "facturacion" } },
  { path: "/facturacion/listar_factura", component: Listar, meta: { requiresAuth: true, modulo: "listar_factura" } },
  { path: "/reporte_venta", component: reporteventa, meta: { requiresAuth: true, modulo: "reporte_venta" } },
  { path: "/reporte_inventario", component: reporteinvetario, meta: { requiresAuth: true, modulo: "reporte_inventario" } },
  { path: "/reporte_compra", component: reportecompra, meta: { requiresAuth: true, modulo: "reporte_compra" } },

  { path: "/no-autorizado", name: "no_autorizado", component: NoAutorizado },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  // 1. No token → login
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  // 2. Si ya está logueado no permitir login
  if (to.path === "/login" && token) {
    return next("/dashboard");
  }

  // 3. Si no requiere módulo → continuar
  if (!to.meta.modulo) {
    return next();
  }

  const modulo = to.meta.modulo;
  let permisos = JSON.parse(localStorage.getItem(`permisos_${modulo}`) || "{}");

  // 4. Obtener permisos si no existen
  if (!permisos.listar) {
    try {
      permisos = await obtenerPermisosPorModulo(modulo);
      localStorage.setItem(`permisos_${modulo}`, JSON.stringify(permisos));
    } catch (e) {
      console.warn("Error obteniendo permisos:", e);
      return next("/no-autorizado");
    }
  }

  // 5. Validar permiso listar
  if (!permisos.listar) {
    return next("/no-autorizado");
  }

  // 6. Todo OK
  next();
});

export default router;
