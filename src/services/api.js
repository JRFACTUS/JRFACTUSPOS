import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para enviar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Bearer token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Función para obtener permisos de un módulo
export const obtenerPermisosPorModulo = async (modulo) => {
  if (!modulo) return {}; // Evita enviar vacío
  try {
    const res = await api.post('permisos/modulo', { modulo });
    return res.data.permisos || {}; // devuelve los permisos o un objeto vacío
  } catch (error) {
    console.error('Error al obtener permisos:', error.response?.data?.message || error.message);
    return {};
  }


  
};


export default api;
