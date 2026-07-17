<template>
  <div class="login-page">

    <div class="login-wrapper">

      <section class="brand-panel">

        <div class="brand-header">
          <div class="brand-logo">
            <i class="bi bi-shop"></i>
          </div>

          <div>
            <h1>JRFactu</h1>
            <p>Punto de Venta</p>
          </div>
        </div>

        <div class="brand-content">
          <span class="badge-system">
            Facturación Electrónica CFDI 4.0
          </span>

          <h2>
           Sistema Administrativo  y Facturación Electrónica CFDI 4.0
          </h2>

          <p class="brand-description">
       Un sistema completo para tu negocio: ventas, inventario, compras, clientes, proveedores, Facturación Electrónica CFDI 4.0 y otros módulos más.          </p>
        </div>

        <div class="brand-footer">
          JRFactu · Sistema administrativo
        </div>

      </section>

      <section class="form-panel">

        <div class="login-card">

          <div class="mobile-brand">
            <div class="brand-logo">
              <i class="bi bi-shop"></i>
            </div>
            <h1>JRFactu</h1>
          </div>

          <div class="login-header">
            <h2>Iniciar sesión</h2>
            <p>Accede a tu punto de venta</p>
          </div>

          <div v-if="error" class="alert">
            {{ error }}
          </div>

          <form @submit.prevent="login">

            <div class="input-group-custom">
              <label>Usuario o correo</label>

              <div class="input-box">
                <i class="bi bi-person"></i>
                <input
                  type="text"
                  v-model="name"
                  placeholder="Correo electrónico o usuario"
                  required
                />
              </div>
            </div>

            <div class="input-group-custom">
              <label>Contraseña</label>

              <div class="input-box">
                <i class="bi bi-lock"></i>
                <input
                  type="password"
                  v-model="password"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </div>

            <button class="btn-login" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Entrar al sistema
            </button>

          </form>

      <p class="forgot-password">
        Contacta a soporte en
        <a href="mailto:soporte@jrfactu.com">
          soporte@jrfactu.com
        </a>
        para restablecer tu contraseña.
      </p>

        </div>

      </section>

    </div>

  </div>
</template>

<style scoped>
*{
  box-sizing:border-box;
}

.login-page{
  min-height:100vh;
  background:#eef1f6;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  font-family:Arial, Helvetica, sans-serif;
}

.login-wrapper{
  width:100%;
  max-width:1120px;
  min-height:620px;
  margin-top:40px;
  display:grid;
  grid-template-columns:1fr 420px;
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 20px 55px rgba(10,20,40,.16);
}
/* PANEL IZQUIERDO */

.brand-panel{
  background:#0a1a33;
  color:#ffffff;
  padding:48px 56px;
  display:flex;
  flex-direction:column;
  position:relative;
  overflow:hidden;
}

.brand-header{
  display:flex;
  align-items:center;
  gap:14px;
  position:relative;
  z-index:2;
}

.brand-logo{
  width:50px;
  height:50px;
  border-radius:12px;
  background:#1a4fd8;
  color:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.45rem;
  flex-shrink:0;
}

.brand-header h1{
  margin:0;
  font-size:1.55rem;
  font-weight:800;
}

.brand-header p{
  margin:2px 0 0;
  color:#a9bfe0;
  font-size:13px;
  font-weight:600;
}

.brand-content{
  max-width:620px;
  position:relative;
  z-index:2;
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
}

.badge-system{
  display:inline-block;
  background:rgba(26,79,216,.25);
  color:#ffffff;
  padding:8px 13px;
  border-radius:999px;
  font-size:13px;
  font-weight:700;
  margin-bottom:22px;
  width:fit-content;
}

.brand-content h2{
  margin:0;
  max-width:520px;
  font-size:1.85rem;
  line-height:1.3;
  font-weight:800;
  letter-spacing:-0.5px;
}

.brand-description{
  max-width:520px;
  margin:22px 0 0;
  color:#c3d2ea;
  font-size:15px;
  line-height:1.8;
}

.brand-footer{
  color:#8ba0c4;
  font-size:13px;
  font-weight:600;
  position:relative;
  z-index:2;
  margin-top:24px;
}

/* PANEL DERECHO */

.form-panel{
  background:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:42px;
  border-left:1px solid #e5e7eb;
}

.login-card{
  width:100%;
  max-width:345px;
}

.mobile-brand{
  display:none;
}

.login-header{
  margin-bottom:30px;
}

.login-header h2{
  margin:0 0 8px;
  color:#0a1a33;
  font-size:2rem;
  font-weight:800;
}

.login-header p{
  margin:0;
  color:#64748b;
  font-size:14px;
}

.alert{
  background:#fff1f1;
  color:#b42318;
  border:1px solid #ffd5d5;
  padding:12px 14px;
  border-radius:8px;
  margin-bottom:16px;
  font-size:14px;
}

.input-group-custom{
  margin-bottom:18px;
}

.input-group-custom label{
  display:block;
  margin-bottom:7px;
  color:#1f2937;
  font-size:13px;
  font-weight:800;
}

.input-box{
  position:relative;
}

.input-box i{
  position:absolute;
  top:50%;
  left:14px;
  transform:translateY(-50%);
  color:#64748b;
  font-size:1rem;
}

.input-box input{
  width:100%;
  height:50px;
  border:1px solid #dde2e8;
  border-radius:8px;
  padding:0 14px 0 42px;
  color:#111827;
  font-size:14px;
  background:#f8fafc;
  transition:border-color .15s ease, background .15s ease;
}

.input-box input::placeholder{
  color:#8a94a6;
}

.input-box input:focus{
  outline:none;
  border-color:#1a4fd8;
  background:#ffffff;
  box-shadow:0 0 0 3px rgba(26,79,216,.14);
}

.btn-login{
  width:100%;
  height:50px;
  margin-top:6px;
  border:none;
  border-radius:8px;
  background:#1a4fd8;
  color:#ffffff;
  font-size:15px;
  font-weight:800;
  cursor:pointer;
  transition:background .15s ease;
}

.btn-login:hover{
  background:#153fb0;
}

.btn-login:disabled{
  opacity:.65;
  cursor:not-allowed;
}

.forgot-password{
  display:block;
  margin-top:18px;
  color:#0a1a33;
  font-size:14px;
  font-weight:800;
  text-align:center;
  text-decoration:none;
}

.forgot-password:hover{
  color:#1a4fd8;
}

/* RESPONSIVE */

@media(max-width:1024px){
  .login-wrapper{
    grid-template-columns:1fr 380px;
  }

  .brand-panel{
    padding:40px 44px;
  }

  .brand-content h2{
    font-size:1.65rem;
  }
}

@media(max-width:950px){
  .login-page{
    padding:0;
    background:#ffffff;
  }

  .login-wrapper{
    min-height:100vh;
    grid-template-columns:1fr;
    border-radius:0;
    box-shadow:none;
  }

  .brand-panel{
    display:none;
  }

  .form-panel{
    border-left:none;
    padding:28px;
  }

  .login-card{
    max-width:380px;
  }

  .mobile-brand{
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:34px;
  }

  .mobile-brand h1{
    margin:0;
    color:#0a1a33;
    font-size:1.6rem;
    font-weight:800;
  }
}

@media(max-width:480px){
  .form-panel{
    padding:22px;
  }

  .login-header h2{
    font-size:1.65rem;
  }

  .input-box input,
  .btn-login{
    height:48px;
  }
}

@media(max-height:700px) and (min-width:951px){
  .login-page{
    align-items:flex-start;
    padding:20px 24px;
  }

  .login-wrapper{
    min-height:auto;
  }

  .brand-panel{
    padding:32px 44px;
  }
}
</style>
<script>
import { ref, onMounted } from 'vue';
import api from '@/services/api.js';
import router from '@/router';

export default {
  name: 'LoginView',

  setup() {
    const name = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref(null);

    /*
    |--------------------------------------------------------------------------
    | Comprobar valor de permiso
    |--------------------------------------------------------------------------
    */
    const permisoActivo = (valor) => {
      return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Normalizar permisos
    |--------------------------------------------------------------------------
    |
    | Acepta permisos como arreglo:
    |
    | [
    |   {
    |     modulo: "ventas",
    |     listar: 1
    |   }
    | ]
    |
    | O como objeto:
    |
    | {
    |   ventas: {
    |     listar: true
    |   }
    | }
    */
    const normalizarPermisos = (permisos) => {
      if (Array.isArray(permisos)) {
        return permisos.map((permiso) => ({
          modulo:
            permiso?.modulo?.nombre ||
            permiso?.modulo?.slug ||
            permiso?.modulo ||
            permiso?.nombre_modulo ||
            '',

          crear:
            permiso?.crear ??
            permiso?.pivot?.crear ??
            false,

          listar:
            permiso?.listar ??
            permiso?.pivot?.listar ??
            false,

          actualizar:
            permiso?.actualizar ??
            permiso?.pivot?.actualizar ??
            false,

          eliminar:
            permiso?.eliminar ??
            permiso?.pivot?.eliminar ??
            false
        }));
      }

      if (
        permisos &&
        typeof permisos === 'object'
      ) {
        return Object.entries(permisos).map(
          ([modulo, acciones]) => ({
            modulo,

            crear:
              acciones?.crear ??
              false,

            listar:
              acciones?.listar ??
              false,

            actualizar:
              acciones?.actualizar ??
              false,

            eliminar:
              acciones?.eliminar ??
              false
          })
        );
      }

      return [];
    };

    /*
    |--------------------------------------------------------------------------
    | Extraer permisos de la respuesta
    |--------------------------------------------------------------------------
    */
    const extraerPermisos = (respuesta, usuario) => {
      /*
       * Primera opción:
       * res.data.user.permisos
       */
      if (usuario?.permisos) {
        return normalizarPermisos(
          usuario.permisos
        );
      }

      /*
       * Segunda opción:
       * res.data.permisos
       */
      if (respuesta?.permisos) {
        return normalizarPermisos(
          respuesta.permisos
        );
      }

      /*
       * Tercera opción:
       * permisos dentro del rol.
       */
      if (usuario?.role?.permisos) {
        return normalizarPermisos(
          usuario.role.permisos
        );
      }

      if (usuario?.rol?.permisos) {
        return normalizarPermisos(
          usuario.rol.permisos
        );
      }

      /*
       * Cuarta opción:
       *
       * res.data.permisos_ventas
       * res.data.permisos_compras
       * res.data.permisos_categoria
       */
      const permisosEncontrados = [];

      Object.entries(respuesta || {}).forEach(
        ([clave, acciones]) => {
          if (!clave.startsWith('permisos_')) {
            return;
          }

          const modulo = clave
            .replace('permisos_', '')
            .trim()
            .toLowerCase();

          permisosEncontrados.push({
            modulo,

            crear:
              acciones?.crear ??
              false,

            listar:
              acciones?.listar ??
              false,

            actualizar:
              acciones?.actualizar ??
              false,

            eliminar:
              acciones?.eliminar ??
              false
          });
        }
      );

      return permisosEncontrados;
    };

    /*
    |--------------------------------------------------------------------------
    | Limpiar sesión anterior
    |--------------------------------------------------------------------------
    */
    const limpiarSesionAnterior = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permisos');

      /*
       * Eliminar:
       *
       * permisos_ventas
       * permisos_compras
       * permisos_inventario
       */
      Object.keys(localStorage).forEach((clave) => {
        if (clave.startsWith('permisos_')) {
          localStorage.removeItem(clave);
        }
      });
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar permisos individuales
    |--------------------------------------------------------------------------
    |
    | Esto permite que tus otras vistas sigan usando:
    |
    | localStorage.getItem('permisos_ventas')
    */
    const guardarPermisosIndividuales = (permisos) => {
      permisos.forEach((permiso) => {
        const modulo = String(
          permiso.modulo || ''
        )
          .trim()
          .toLowerCase();

        if (!modulo) {
          return;
        }

        localStorage.setItem(
          `permisos_${modulo}`,
          JSON.stringify({
            listar: permisoActivo(permiso.listar),
            crear: permisoActivo(permiso.crear),
            actualizar: permisoActivo(
              permiso.actualizar
            ),
            eliminar: permisoActivo(
              permiso.eliminar
            )
          })
        );
      });
    };

    /*
    |--------------------------------------------------------------------------
    | Buscar permiso
    |--------------------------------------------------------------------------
    */
    const tienePermiso = (
      permisos,
      modulo,
      accion = 'listar'
    ) => {
      const permiso = permisos.find((item) => {
        return (
          String(item.modulo)
            .trim()
            .toLowerCase() ===
          String(modulo)
            .trim()
            .toLowerCase()
        );
      });

      if (!permiso) {
        return false;
      }

      return permisoActivo(
        permiso[accion]
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Ruta inicial del usuario
    |--------------------------------------------------------------------------
    */
    const obtenerRutaInicial = (usuario) => {
      const esAdministrador =
        usuario?.es_admin === true ||
        usuario?.es_admin === 1 ||
        usuario?.es_admin === '1' ||
        usuario?.es_admin === 'true';

      if (esAdministrador) {
        return '/dashboard';
      }

      const permisos = Array.isArray(
        usuario?.permisos
      )
        ? usuario.permisos
        : [];

      const rutas = [
        {
          modulo: 'dashboard',
          accion: 'listar',
          ruta: '/dashboard'
        },
        {
          modulo: 'ventas',
          accion: 'crear',
          ruta: '/ventas'
        },
        {
          modulo: 'ventas',
          accion: 'listar',
          ruta: '/ventas'
        },
        {
          modulo: 'caja',
          accion: 'listar',
          ruta: '/ventas/caja'
        },
        {
          modulo: 'historial',
          accion: 'listar',
          ruta: '/ventas/historial'
        },
        {
          modulo: 'categoria',
          accion: 'listar',
          ruta: '/categoria'
        },
        {
          modulo: 'medida',
          accion: 'listar',
          ruta: '/medidas'
        },
        {
          modulo: 'productos',
          accion: 'listar',
          ruta: '/productos'
        },
        {
          modulo: 'clientes',
          accion: 'listar',
          ruta: '/clientes'
        },
        {
          modulo: 'provedores',
          accion: 'listar',
          ruta: '/provedores'
        },
        {
          modulo: 'compras',
          accion: 'crear',
          ruta: '/compras'
        },
        {
          modulo: 'compras',
          accion: 'listar',
          ruta: '/compras/listar_compras'
        },
        {
          modulo: 'inventario',
          accion: 'listar',
          ruta: '/inventario'
        },
        {
          modulo: 'kardex',
          accion: 'listar',
          ruta: '/inventario/kardex'
        },
        {
          modulo: 'usuarios',
          accion: 'listar',
          ruta: '/usuarios'
        },
        {
          modulo: 'roles',
          accion: 'listar',
          ruta: '/usuarios/roles'
        },
        {
          modulo: 'facturacion',
          accion: 'crear',
          ruta: '/facturacion'
        },
        {
          modulo: 'listar_factura',
          accion: 'listar',
          ruta: '/facturacion/listar_factura'
        }
      ];

      const primeraRuta = rutas.find((opcion) => {
        return tienePermiso(
          permisos,
          opcion.modulo,
          opcion.accion
        );
      });

      return primeraRuta?.ruta || '/no-autorizado';
    };

    /*
    |--------------------------------------------------------------------------
    | Iniciar sesión
    |--------------------------------------------------------------------------
    */
    const login = async () => {
      loading.value = true;
      error.value = null;

      try {
        const res = await api.post('/login', {
          name: name.value,
          password: password.value
        });

        console.log(
          'Respuesta completa del login:',
          res.data
        );

        const token = res.data.token;

        const usuarioApi =
          res.data.user ||
          res.data.usuario;

        if (!token) {
          throw new Error(
            'El servidor no devolvió el token'
          );
        }

        if (!usuarioApi) {
          throw new Error(
            'El servidor no devolvió el usuario'
          );
        }

        /*
         * Obtener todos los permisos.
         */
        const permisos = extraerPermisos(
          res.data,
          usuarioApi
        );

        /*
         * Agregar los permisos dentro del usuario.
         */
        const usuarioCompleto = {
          ...usuarioApi,
          permisos
        };

        /*
         * Eliminar datos del usuario anterior.
         */
        limpiarSesionAnterior();

        /*
         * Guardar nueva sesión.
         */
        localStorage.setItem(
          'token',
          token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(usuarioCompleto)
        );

        localStorage.setItem(
          'permisos',
          JSON.stringify(permisos)
        );

        /*
         * Guardar permisos_ventas,
         * permisos_compras, etc.
         */
        guardarPermisosIndividuales(
          permisos
        );

        /*
         * Avisar al Sidebar.
         */
        window.dispatchEvent(
          new Event('permisos-actualizados')
        );

        console.log(
          'Usuario guardado:',
          usuarioCompleto
        );

        console.log(
          'Permisos guardados:',
          permisos
        );

        /*
         * Ir al primer módulo permitido.
         */
        const rutaInicial =
          obtenerRutaInicial(usuarioCompleto);

        await router.replace(rutaInicial);
      } catch (e) {
        console.error(
          'Error al iniciar sesión:',
          e
        );

        error.value =
          e.response?.data?.message ||
          e.message ||
          'Error al iniciar sesión';
      } finally {
        loading.value = false;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Comprobar sesión existente
    |--------------------------------------------------------------------------
    */
    onMounted(() => {
      const token = localStorage.getItem(
        'token'
      );

      if (!token) {
        return;
      }

      try {
        const usuarioGuardado = JSON.parse(
          localStorage.getItem('user') || '{}'
        );

        const rutaInicial =
          obtenerRutaInicial(usuarioGuardado);

        router.replace(rutaInicial);
      } catch (e) {
        console.error(
          'La sesión guardada no es válida:',
          e
        );

        limpiarSesionAnterior();
      }
    });

    return {
      name,
      password,
      loading,
      error,
      login
    };
  }
};
</script>

