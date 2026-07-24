<!-- Informacion.vue -->
<template>
  <div class="empresa-page">

    <div class="info-card">
     <div v-if="loadingPermisos" class="info-header">
  <span>Cargando permisos...</span>
</div>

     <div v-else-if="permisos?.listar" class="info-header">
  <span>Información de la Empresa</span>

  <button type="button" v-if="puedeGuardarEmpresa" class="btn-edit" @click="abrirModalEditar">
    <i class="bi bi-pencil"></i> Editar
  </button>
</div>

<div v-else class="info-header">
  <span class="text-danger">❌ No tiene permiso para ver esta información</span>
</div>

      <form v-if="!loadingPermisos && permisos?.listar" class="info-body form-grid" @submit.prevent>

  <div class="form-group col-4">
    <label>Nombre comercial</label>
    <input class="form-input" :value="empresa.nombre" readonly />
  </div>

  <div class="form-group col-4">
    <label>Razón social</label>
    <input class="form-input" :value="empresa.razons" readonly />
  </div>

  <div class="form-group col-4">
    <label>RFC</label>
    <input class="form-input" :value="empresa.rfc" readonly />
  </div>

  <div class="form-group col-4">
    <label>Régimen fiscal</label>
    <input class="form-input" :value="empresa.regimen" readonly />
  </div>

  <div class="form-group col-2">
    <label>Código Postal</label>
    <input class="form-input" :value="empresa.codpos" readonly />
  </div>

  <div class="form-group col-6">
    <label>Dirección</label>
    <textarea class="form-input" rows="2" readonly
      :value="`${empresa.calle || ''} ${empresa.numero_exterior || ''} ${empresa.numero_interior ? 'Int. ' + empresa.numero_interior : ''}${empresa.colonia ? ', ' + empresa.colonia : ''}${empresa.ciudad ? ', ' + empresa.ciudad : ''}${empresa.estado ? ', ' + empresa.estado : ''}`">
    </textarea>
  </div>

  <div class="form-group col-4">
    <label>Correo electrónico</label>
    <input class="form-input" :value="empresa.email" readonly />
  </div>

  <div class="form-group col-4">
    <label>Teléfono</label>
    <input class="form-input" :value="empresa.telefono" readonly />
  </div>

  <div class="form-group col-4">
    <label>Dominio</label>
    <input class="form-input" :value="empresa.dominio" readonly />
  </div>

  <div class="form-group col-4">
    <label>Sandbox</label>
    <input class="form-input" :value="empresa.sandbox ? 'Activado' : 'Producción'" readonly />
  </div>

  <div class="form-group col-4">
    <label>Certificado CSD</label>
    <input class="form-input" :value="empresa.cer_path ? '✔ Configurado' : '✖ Sin configurar'" readonly />
  </div>

  <div class="form-group col-4">
    <label>Llave CSD</label>
    <input class="form-input" :value="empresa.key_path ? '✔ Configurada' : '✖ Sin configurar'" readonly />
  </div>

  <div class="form-group col-4">
    <label>e.Firma</label>
    <input class="form-input"
      :value="empresa.fiel_cer_path && empresa.fiel_key_path ? '✔ Configurada' : '✖ Sin configurar'" readonly />
  </div>

  <div class="form-group col-4">
    <label>Folios mínimos</label>
    <input class="form-input" :value="empresa.folios_minimos" readonly />
  </div>

  <div class="form-group col-4">
    <label>Última actualización</label>
    <input class="form-input" :value="empresa.updated_at" readonly />
  </div>

</form>
    </div>
    <!-- MODAL EDITAR -->
    <BaseModal v-if="puedeGuardarEmpresa" v-model:visible="modalEditarVisible" title="Detalles de tu empresa" size="xl">
      <div class="empresa-modal">
        <p class="empresa-info">
          <i class="bi bi-info-circle-fill"></i>
          Por favor ingresa la siguiente información para modificar los datos de tu empresa.
          <br />Los campos marcados con <span>*</span> son obligatorios.
        </p>

        <!-- LOGO -->
        <!-- LOGO -->
        <div class="logo-section">
          <div class="logo-preview">
            <img :src="logoUrl" alt="Logo" /> <!-- ← solo el computed -->
          </div>

          <div class="logo-card">
            <h6>Logo de la cuenta</h6>
            <p>Sube tu logo para que éste aparezca en el PDF de los CFDIs que emitas.</p>
          </div>

          <div class="logo-upload">
            <h6>Subir logo</h6>
            <label class="btn-upload">
              Subir <i class="bi bi-upload"></i>
              <input type="file" accept="image/*" hidden @change="subirLogo" />
            </label>
            <!-- muestra nombre del archivo seleccionado -->
            <small v-if="archivoNombre.logo">{{ archivoNombre.logo }}</small>
          </div>
        </div>

        <!-- DATOS FISCALES -->
        <h5 class="section-title">Datos fiscales</h5>

        <div class="form-grid">
          <div class="form-group col-4">
            <label>Nombre comercial <span>*</span></label>
            <input class="form-input" v-model="empresaTemp.nombre" />
          </div>
          <div class="form-group col-4">
            <label>Razón social <span>*</span></label>
            <input class="form-input" v-model="empresaTemp.razons" />
          </div>
          <div class="form-group col-4">
            <label>RFC <span>*</span></label>
            <input class="form-input" v-model="empresaTemp.rfc" />
          </div>
          <div class="form-group col-4">
            <label>Régimen fiscal <span>*</span></label>
            <select class="form-input" v-model="empresaTemp.regimen">
              <option value="">Selecciona régimen</option>
              <option v-for="regimen in regimenes" :key="regimen.id" :value="regimen.codigo">
                {{ regimen.codigo }} - {{ regimen.descripcion }}
              </option>
            </select>
          </div>
          <div class="form-group col-2">
            <label>Código postal <span>*</span></label>
            <input class="form-input" v-model="empresaTemp.codpos" />
          </div>
          <div class="form-group col-6">
            <label>Calle</label>
            <input class="form-input" v-model="empresaTemp.calle" />
          </div>
          <div class="form-group col-2">
            <label>No. exterior</label>
            <input class="form-input" v-model="empresaTemp.numero_exterior" />
          </div>
          <div class="form-group col-2">
            <label>No. interior</label>
            <input class="form-input" v-model="empresaTemp.numero_interior" />
          </div>
          <div class="form-group col-4">
            <label>Colonia</label>
            <input class="form-input" v-model="empresaTemp.colonia" />
          </div>
          <div class="form-group col-4">
            <label>Estado</label>
            <input class="form-input" v-model="empresaTemp.estado" />
          </div>
          <div class="form-group col-4">
            <label>Ciudad/Delegación</label>
            <input class="form-input" v-model="empresaTemp.ciudad" />
          </div>
          <div class="form-group col-6">
            <label>Correo</label>
            <input type="email" class="form-input" v-model="empresaTemp.email" />
          </div>
          <div class="form-group col-6">
            <label>Teléfono</label>
            <input class="form-input" v-model="empresaTemp.telefono" />
          </div>
          <div class="form-group col-6">
            <label>Dominio</label>
            <input class="form-input" v-model="empresaTemp.dominio" placeholder="ejemplo.com" />
          </div>
          <div class="form-group col-6">
            <label>Modo de operación</label>
            <select class="form-input" v-model="empresaTemp.sandbox">
              <option :value="true">Sandbox / Pruebas</option>
              <option :value="false">Producción</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Folios mínimos</label>
            <input type="number" min="0" class="form-input" v-model="empresaTemp.folios_minimos" />
          </div>
        </div>

        <!-- CERTIFICADOS -->
        <div class="cert-grid">
          <div>
            <h5 class="section-title">Certificado de Sello Digital (CSD)</h5>
            <div class="cert-card csd">
              <label>Archivo .cer <span>*</span></label>
              <label class="btn-upload">
                Subir <i class="bi bi-upload"></i>
                <input type="file" accept=".cer" hidden @change="subirCer" />
              </label>
              <small>{{ archivoNombre.cer || empresa.cer_path || 'Sin archivo cargado' }}</small>

              <label>Archivo .key <span>*</span></label>
              <label class="btn-upload">
                Subir <i class="bi bi-upload"></i>
                <input type="file" accept=".key" hidden @change="subirKey" />
              </label>
              <small>{{ archivoNombre.key || empresa.key_path || 'Sin archivo cargado' }}</small>

              <label>Contraseña del CSD <span>*</span></label>
              <input type="password" class="form-input" v-model="empresaTemp.password"
                placeholder="Contraseña del CSD" />
            </div>
          </div>

          <div>
            <h5 class="section-title">Datos para migrar CFDIs</h5>
            <div class="cert-card fiel">
              <label>Archivo .cer de e.Firma</label>
              <label class="btn-upload">
                Subir <i class="bi bi-upload"></i>
                <input type="file" accept=".cer" hidden @change="subirFielCer" />
              </label>
              <small>{{ archivoNombre.fielcer || empresa.fiel_cer_path || 'Sin archivo cargado' }}</small>

              <label>Archivo .key de e.Firma</label>
              <label class="btn-upload">
                Subir <i class="bi bi-upload"></i>
                <input type="file" accept=".key" hidden @change="subirFielKey" />
              </label>
              <small>{{ archivoNombre.fielkey || empresa.fiel_key_path || 'Sin archivo cargado' }}</small>

              <label>Contraseña de e.Firma</label>
              <input type="password" class="form-input" v-model="empresaTemp.fiel_password"
                placeholder="Contraseña de la e.Firma" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn-cancelar" @click="modalEditarVisible = false">Cancelar</button>
        <button class="btn-guardar" :disabled="guardando" @click="guardarEmpresa">
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue';
import api, { obtenerPermisosPorModulo } from '@/services/api.js';

export default {
  name: 'Informacion',
  components: { BaseModal },

  data() {
    return {
      empresa: {},
      empresaTemp: {},
      permisos: null, // null = aún no cargado
      loadingPermisos: true,
      archivos: {
        logo: null,
        cer: null,
        key: null,
        fielcer: null,
        fielkey: null,
      },
      archivoNombre: {
        logo: '',
        cer: '',
        key: '',
        fielcer: '',
        fielkey: '',
      },
      logoPreview: null,
      regimenes: [],
      modalEditarVisible: false,
      guardando: false,
    };
  },

  computed: {
    logoUrl() {
      if (this.logoPreview) return this.logoPreview;
      return this.empresa.logo_url || '/img/logo-default.png';
    },

    puedeGuardarEmpresa() {
      if (!this.permisos?.listar) return false;

      if (this.empresa?.id) {
        return this.permisos.actualizar;
      }

      return this.permisos.crear;
    },
  },

  async mounted() {
    await this.fetchPermisos();

    if (!this.permisos?.listar) return;

    this.cargarEmpresa();
    this.obtenerRegimenes();
  },

  methods: {
    permisoActivo(valor) {
      return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
      );
    },

    async fetchPermisos() {
      try {
        const respuesta = await obtenerPermisosPorModulo('configuracion');

        const datosRespuesta =
          respuesta?.data?.data ??
          respuesta?.data ??
          respuesta ??
          {};

        const datos = datosRespuesta?.permisos ?? datosRespuesta;

        this.permisos = {
          listar: this.permisoActivo(datos?.listar),
          crear: this.permisoActivo(datos?.crear),
          actualizar: this.permisoActivo(datos?.actualizar),
        };
      } catch (error) {
       
        this.permisos = {
          listar: false,
          crear: false,
          actualizar: false,
        };
      } finally {
        this.loadingPermisos = false;
      }
    },

    obtenerRegimenConCodigo(valor) {
      const reg = this.regimenes.find(
        r => r.codigo === valor || r.descripcion === valor
      );
      return reg ? `${reg.codigo} - ${reg.descripcion}` : valor;
    },

    async cargarEmpresa() {
      try {
        const res = await api.get('/getEmpresa');
        const d = res.data.data || {};

        this.empresa = {
          id: d.id || '',
          nombre: d.nombre || '',
          razons: d.razons || '',
          rfc: d.rfc || '',
          codpos: d.codpos || '',
          calle: d.calle || '',
          numero_exterior: d.numero_exterior || '',
          numero_interior: d.numero_interior || '',
          colonia: d.colonia || '',
          estado: d.estado || '',
          ciudad: d.ciudad || '',
          delegacion: d.delegacion || '',
          email: d.email || '',
          telefono: d.telefono || '',
          regimen: d.regimen || '',
          cer_path: d.cer_path || '',
          key_path: d.key_path || '',
          fiel_cer_path: d.fiel_cer_path || '',
          fiel_key_path: d.fiel_key_path || '',
          logo_path: d.logo_path || '',
          logo_url: d.logo_url || '',
          uid_factura: d.uid_factura || '',
          api_key_factura: d.api_key_factura || '',
          secret_key_factura: d.secret_key_factura || '',
          sandbox: d.sandbox === 1 || d.sandbox === true,
          smtp: d.smtp === 1 || d.smtp === true,
          folios_minimos: d.folios_minimos || '',
          created_at: d.created_at || '',
          updated_at: d.updated_at || '',
        };
      } catch (error) {
        
        alert('Error al cargar la información de la empresa. Por favor, intenta nuevamente.');
      }
    },

    async obtenerRegimenes() {
      try {
        const res = await api.get('/getsat');
        if (res.data?.regimenes_fiscales) {
          this.regimenes = res.data.regimenes_fiscales;
        }
      } catch (error) {
         
          alert('Error al obtener regímenes fiscales. Por favor, intenta nuevamente.');
        }
    },

    abrirModalEditar() {
      if (!this.puedeGuardarEmpresa) return;

      this.empresaTemp = { ...this.empresa };

      const reg = this.regimenes.find(r =>
        r.descripcion === this.empresa.regimen ||
        r.codigo === this.empresa.regimen
      );
      if (reg) this.empresaTemp.regimen = reg.codigo;

      this.archivos = { logo: null, cer: null, key: null, fielcer: null, fielkey: null };
      this.archivoNombre = { logo: '', cer: '', key: '', fielcer: '', fielkey: '' };
      this.logoPreview = null;
      this.modalEditarVisible = true;
    },

    subirLogo(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.archivos.logo = file;
      this.archivoNombre.logo = file.name;
      this.logoPreview = URL.createObjectURL(file);
    },

    subirCer(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.archivos.cer = file;
      this.archivoNombre.cer = file.name;
    },

    subirKey(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.archivos.key = file;
      this.archivoNombre.key = file.name;
    },

    subirFielCer(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.archivos.fielcer = file;
      this.archivoNombre.fielcer = file.name;
    },

    subirFielKey(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.archivos.fielkey = file;
      this.archivoNombre.fielkey = file.name;
    },

    async guardarEmpresa() {
      const tienePermiso = this.empresa.id
        ? this.permisos?.actualizar
        : this.permisos?.crear;

      if (!tienePermiso) {
        alert('No tienes permiso para guardar la información de la empresa.');
        return;
      }

      this.guardando = true;

      try {
        const formData = new FormData();

        const excluir = [
          'cer_path', 'key_path', 'fiel_cer_path', 'fiel_key_path',
          'logo_path', 'logo_url', 'uid_factura', 'api_key_factura',
          'secret_key_factura', 'created_at', 'updated_at', 'id',
        ];

        Object.keys(this.empresaTemp).forEach((key) => {
          if (excluir.includes(key)) return;
          if (this.empresaTemp[key] === null || this.empresaTemp[key] === undefined) return;
          formData.append(key, this.empresaTemp[key]);
        });

        if (this.archivos.logo) formData.append('logo', this.archivos.logo);
        if (this.archivos.cer) formData.append('cer', this.archivos.cer);
        if (this.archivos.key) formData.append('key', this.archivos.key);
        if (this.archivos.fielcer) formData.append('fielcer', this.archivos.fielcer);
        if (this.archivos.fielkey) formData.append('fielkey', this.archivos.fielkey);

        formData.set('sandbox', this.empresaTemp.sandbox ? 'true' : 'false');

        let res;

        if (this.empresa.id) {
          // ── ACTUALIZAR ──────────────────────────────
          formData.append('_method', 'PUT');
          res = await api.post(`/empresa/${this.empresa.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          // ── CREAR ───────────────────────────────────
          res = await api.post('/empresa', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }

        const empresaActualizada = res.data.empresa;

        this.empresa = {
          ...empresaActualizada,
          logo_url: empresaActualizada?.logo_url || this.empresa.logo_url,
        };

        this.modalEditarVisible = false;
        alert(empresaActualizada.id ? 'Empresa actualizada correctamente.' : 'Empresa creada correctamente.');

      } catch (error) {
       
        const msg = error.response?.data?.message || 'No se pudo guardar la empresa.';
        alert(msg);
      } finally {
        this.guardando = false;
      }
    },
  },
};
</script>
<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.col-2 {
  grid-column: span 2;
}

.col-4 {
  grid-column: span 4;
}

.col-6 {
  grid-column: span 6;
}

.col-12 {
  grid-column: span 12;
}

textarea.form-input {
  height: auto;
  min-height: 70px;
  padding: 10px 13px;
  resize: none;
}

.empresa-page {
  width: 100%;
}

/* =========================
   CARD PRINCIPAL
========================= */
.info-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
}

.info-header {
  background: #244b7c;
  color: #ffffff;
  padding: 16px 20px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-body {
  padding: 22px;
}

.info-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  margin-bottom: 16px;
  color: #334155;
}

.info-row label {
  font-weight: 700;
  color: #0f172a;
}

.btn-edit {
  border: none;
  background: #ffffff;
  color: #244b7c;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* =========================
   MODAL EMPRESA
========================= */
.empresa-modal {
  color: #002b6c;
  font-family: Arial, sans-serif;
}

.empresa-info {
  font-size: 14px;
  color: #344767;
  margin-bottom: 28px;
  line-height: 1.5;
}

.empresa-info i {
  margin-right: 6px;
}

.empresa-info span,
.form-group span,
.cert-card span {
  color: red;
}

/* =========================
   LOGO
========================= */
.logo-section {
  background: #f4f6f8;
  padding: 26px;
  display: grid;
  grid-template-columns: 130px 1fr 1fr;
  gap: 24px;
  align-items: center;
  margin-bottom: 30px;
  border-radius: 14px;
}

.logo-preview {
  width: 130px;
  height: 130px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-card,
.logo-upload {
  background: #ffffff;
  padding: 22px;
  border-radius: 12px;
  min-height: 130px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.logo-card h6,
.logo-upload h6 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #0b3470;
}

.logo-card p,
.logo-upload small {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

/* =========================
   TITULOS
========================= */
.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #002b6c;
  border-bottom: 1px solid #002b6c;
  padding-bottom: 8px;
  margin: 30px 0 18px;
}

/* =========================
   CONSTANCIA
========================= */
.constancia-card {
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  padding: 22px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}

.constancia-card strong {
  color: #0b3470;
  font-size: 14px;
}

.constancia-card p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 13px;
}

/* =========================
   FORMULARIO
========================= */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px 28px;
  align-items: start;
}

.form-group {
  width: 100%;
  min-width: 0;
}

.form-group label {
  display: block;
  color: #0b3470;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 13px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #cfd8e3;
  border-radius: 9px;
  padding: 0 13px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: #ffffff;
  color: #0f172a;
}

.form-input:focus {
  border-color: #244b7c;
  box-shadow: 0 0 0 3px rgba(36, 75, 124, 0.13);
}

.form-input::placeholder {
  color: #94a3b8;
}

select.form-input {
  cursor: pointer;
}

.col-2,
.col-3,
.col-4,
.col-6,
.col-12 {
  grid-column: span 1;
}

.form-group.large,
.col-large {
  grid-column: span 2;
}

/* =========================
   BOTONES
========================= */
.btn-upload {
  background: #244b7c;
  color: #ffffff !important;
  padding: 10px 28px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
  margin: 10px 0 14px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  border: none;
}

.btn-upload i {
  margin-left: 6px;
}

.btn-constancia {
  border: 1px solid #244b7c;
  color: #244b7c;
  background: #ffffff;
  padding: 9px 16px;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}

.btn-constancia i {
  margin-right: 6px;
}

.btn-upload:hover,
.btn-guardar:hover,
.btn-edit:hover {
  opacity: 0.9;
}

.btn-constancia:hover {
  background: #f0f6ff;
}

/* =========================
   CERTIFICADOS
========================= */
.cert-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 28px;
}

.cert-card {
  padding: 30px 26px;
  min-height: 420px;
  border-radius: 14px;
}

.cert-card.csd {
  background: #e6f5ff;
}

.cert-card.fiel {
  background: #fff0e4;
}

.cert-card label {
  display: block;
  color: #0b3470;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 13px;
}

.cert-card small {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 22px;
  word-break: break-all;
  line-height: 1.4;
}

/* =========================
   FOOTER BOTONES
========================= */
.btn-cancelar,
.btn-guardar {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
}

.btn-cancelar {
  background: #6c757d;
  color: #ffffff;
}

.btn-guardar {
  background: #244b7c;
  color: #ffffff;
}

/* =========================
   RESPONSIVE
========================= */
@media (max-width: 1100px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-group.large,
  .col-large {
    grid-column: span 2;
  }

  .logo-section {
    grid-template-columns: 130px 1fr;
  }

  .logo-upload {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {

  .logo-section,
  .cert-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .logo-upload,
  .form-group.large,
  .col-large {
    grid-column: span 1;
  }

  .logo-preview {
    margin: auto;
  }

  .constancia-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>