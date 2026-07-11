import api from './api';

async function tienePermiso(modulo, accion = "listar") {
  try {
    const r = await api.post("permisos/verificar", { modulo, accion });
    return r.data.permitido === true;
  } catch (e) {
    return false;
  }
}

// Ejemplo
const puedeListarFactura = await tienePermiso("Listar Factura", "listar");
