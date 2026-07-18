<template>
  <div class="d-flex flex-column flex-lg-row min-vh-100 app-shell"> <!-- Sidebar -->
    <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

    <div class="main-content">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="container-fluid pt-5 pt-lg-4 mt-4">
        <!-- CARGANDO PERMISOS -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <!-- SIN PERMISO PARA LISTAR -->
        <div
          v-else-if="permisos !== null && !permisos.listar"
          class="alert alert-warning"
          role="alert"
        >
          <i class="bi bi-shield-lock me-2"></i>
          No tienes permiso para ver facturación.
        </div>

        <!-- CONTENIDO DEL MÓDULO -->
        <div v-else-if="permisos !== null && permisos.listar">
        <h3 class="mb-4">Crear CFDI 4.0</h3>


        <!-- Botón Importar (tu botón original) -->
        <button
          v-if="permisos.crear"
          class="btn btn-outline-primary btn-sm mb-3"
          @click="abrirModalImportar"
        >
          <i class="bi bi-upload"></i> Importar Venta
        </button>

        <!-- Botón Timbrar (palomita verde) -->
        <button
          v-if="permisos.crear"
          class="btn btn-success btn-sm mb-3 ms-2"
          @click="timbrarFactura"
        >
          <i class="bi bi-check-circle"></i> Timbrar
        </button>
        <!-- Botón Cancelar (x roja) -->
        <button class="btn btn-danger btn-sm mb-3 ms-2" @click="cancelarTodo">
          <i class="bi bi-x-circle"></i> Cancelar
        </button>


        <!-- SECCIÓN 1: Emisor -->
        <div v-if="seccionActiva === 1" class="card mb-3">
          <div class="card-header section-header">Datos del Emisor</div>
          <div class="card-body row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre / Razón Social</label>
              <input type="text" class="form-control" v-model="factura.emisor.nombre" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">RFC</label>
              <input type="text" class="form-control" v-model="factura.emisor.rfc" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Domicilio Fiscal</label>
              <input type="text" class="form-control" v-model="factura.emisor.domicilio_fiscal" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Régimen Fiscal</label>
              <select class="form-select" v-model="factura.emisor.regimen_fiscal">
                <option value="" disabled>Selecciona un régimen fiscal</option>
                <option v-for="r in regimenesFiscales" :key="r.id" :value="r.codigo">
                  {{ r.codigo }} - {{ r.descripcion }}
                </option>
              </select>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary" @click="siguienteSeccion">Siguiente</button>
          </div>
        </div>

        <!-- SECCIÓN 2: Receptor -->
        <div v-if="seccionActiva === 2" class="card mb-3">
          <div class="card-header section-header">Datos del Receptor</div>
          <div class="card-body row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre / Razón Social</label>
              <div class="border p-2 rounded">{{ factura.receptor.nombre || 'Nombre Receptor' }}</div>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">RFC</label>
              <div class="border p-2 rounded">{{ factura.receptor.rfc || 'RFC Receptor' }}</div>
            </div>
            <div class="col-md-12 mb-3">
              <label class="form-label">Domicilio Fiscal</label>
              <div class="border p-2 rounded">{{ factura.receptor.delegacion || 'Ciudad, Estado' }}</div>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Régimen Fiscal</label>
              <div class="border p-2 rounded">{{ factura.receptor.regimen_fiscal || 'Regimen Fiscal' }}</div>
            </div>

          </div>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-secondary" @click="retrocederSeccion">Anterior</button>
            <button class="btn btn-primary" @click="siguienteSeccion">Siguiente</button>
          </div>
        </div>

        <!-- TABLA DE CONCEPTOS -->
        <TablaConceptos v-if="seccionActiva === 2" :conceptos="conceptos" />

        <!-- SECCIÓN 3: Datos Fiscales -->
        <div v-if="seccionActiva === 3" class="card mb-3">
          <div class="card-header section-header">Datos Fiscales</div>

          <div class="card-body row">

            <!-- Tipo de Documento -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Tipo de Documento</label>
              <select v-model="factura.tipo_documento_id" class="form-select">
                <option value="" disabled>Seleccione...</option>
                <option v-for="t in catalogos.tipos_documento" :key="t.id" :value="t.id">
                  {{ t.clave_documento }}
                </option>
              </select>
            </div>

            <!-- Uso CFDI -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Uso CFDI</label>
              <select v-model="factura.receptor.uso_cfdi" class="form-select">
                <option value="" disabled>Seleccione...</option>
                <option v-for="u in catalogos.usos_cfdi" :key="u.id" :value="u.usocfdi">
                  {{ u.usocfdi }} - {{ u.descripcion }}
                </option>
              </select>
            </div>

            <!-- Forma de Pago -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Forma de Pago</label>
              <select v-model="factura.emisor.forma_pago" class="form-select">
                <option value="" disabled>Seleccione...</option>
                <option v-for="fp in catalogos.formas_pago" :key="fp.id" :value="fp.clave_pago">
                  {{ fp.clave_pago }} - {{ fp.descripcion_pago }}
                </option>
              </select>
            </div>

            <!-- Método de Pago -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Método de Pago</label>
              <select v-model="factura.emisor.metodo_pago" class="form-select">
                <option value="" disabled>Seleccione...</option>
                <option v-for="mp in catalogos.metodos_pago" :key="mp.id" :value="mp.clave_pago">
                  {{ mp.clave_pago }} - {{ mp.descripcion_pago }}
                </option>
              </select>
            </div>

            <!-- Moneda -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Moneda</label>
              <select v-model="factura.emisor.moneda" class="form-select">
                <option value="" disabled>Seleccione...</option>
                <option v-for="m in catalogos.monedas" :key="m.id" :value="m.clave_moneda">
                  {{ m.clave_moneda }} - {{ m.descripcion_moneda }}
                </option>
              </select>
            </div>

            <div class="col-md-6 mt-3">
              <label class="form-label fw-bold">
                CFDI Sustituido (Opcional)
              </label>

              <select v-model="factura.uuid_cfdi_sustituido" class="form-select">
                <option :value="null">
                  Seleccione una factura...
                </option>

                <option v-for="cfdi in cfdisTimbrados" :key="cfdi.UUID" :value="cfdi.UUID">
                  {{ cfdi.Folio }} - {{ cfdi.UUID }}
                </option>
              </select>
            </div>

            <div v-if="esPublicoGeneral" class="row">

              <div class="col-md-4">
                <label class="form-label">Periodicidad</label>

                <select v-model="factura.Periodicidad" class="form-select">
                  <option value="01">Diario</option>
                  <option value="02">Semanal</option>
                  <option value="03">Quincenal</option>
                  <option value="04">Mensual</option>
                  <option value="05">Bimestral</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">
                  {{ factura.Periodicidad === '05' ? 'Bimestre' : 'Mes' }}
                </label>

                <select v-model="factura.Meses" class="form-select">

                  <template v-if="factura.Periodicidad !== '05'">
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </template>

                  <template v-else>
                    <option value="13">Enero - Febrero</option>
                    <option value="14">Marzo - Abril</option>
                    <option value="15">Mayo - Junio</option>
                    <option value="16">Julio - Agosto</option>
                    <option value="17">Septiembre - Octubre</option>
                    <option value="18">Noviembre - Diciembre</option>
                  </template>

                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Año</label>

                <input v-model="factura.Anio" type="number" class="form-control" min="2022" max="2099">
              </div>

            </div>
          </div>

          <div class="d-flex justify-content-start mt-3">
            <button class="btn btn-secondary" @click="retrocederSeccion">Anterior</button>
          </div>
        </div>

        </div>
      </main>
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- Modal Importar Venta -->
    <ModalImportarVenta v-if="permisos?.listar && permisos?.crear" :visible="mostrarModalImportar" :ventas="ventasDisponibles"
      @close="mostrarModalImportar = false" @import="importarVenta" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from "vue";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import ModalImportarVenta from "@/Views/Facturacion/ModalImportarVenta.vue";
import TablaConceptos from "@/Views/Facturacion/TablaConceptos.vue";
import api, { obtenerPermisosPorModulo } from "@/services/api.js";

// ✔ SweetAlert2 correctamente importado
import Swal from "sweetalert2";

export default {
  name: "FacturacionView",
  components: { Header, Sidebar, ModalImportarVenta, TablaConceptos },

  setup() {
    const sidebarOpen = ref(true);
    const loading = ref(true);
    const permisos = ref(null);
    const seccionActiva = ref(1);
    const mostrarModalImportar = ref(false);
    const conceptos = ref([]);
    const ventasDisponibles = ref([]);
    const cfdisTimbrados = ref([]);
    const catalogos = ref({
      tipos_documento: [],
      usos_cfdi: [],
      formas_pago: [],
      metodos_pago: [],
      objeto_imps: [],
      monedas: []
    });

    const permisoActivo = (valor) => {
      return (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true"
      );
    };

    const fetchPermisos = async () => {
      try {
        const respuesta = await obtenerPermisosPorModulo("facturacion");

        const datosRespuesta =
          respuesta?.data?.data ??
          respuesta?.data ??
          respuesta ??
          {};

        const datos = datosRespuesta?.permisos ?? datosRespuesta;

        permisos.value = {
          listar: permisoActivo(datos?.listar),
          crear: permisoActivo(datos?.crear),
        };
      } catch (error) {
        console.error("Error al obtener permisos de facturación:", error);

        permisos.value = {
          listar: false,
          crear: false,
        };
      } finally {
        loading.value = false;
      }
    };

    const factura = reactive({
      uuid_cfdi_sustituido: null,

      emisor: {
        nombre: "",
        rfc: "",
        domicilio_fiscal: "",
        regimen_fiscal: "",
        forma_pago: "",
        metodo_pago: "",
        moneda: "",
      },
      receptor: {
        nombre: "",
        rfc: "",
        delegacion: "",
        regimen_fiscal: "",
        uso_cfdi: "",
      },
    });
    const esPublicoGeneral = computed(() => {
      return String(factura.receptor.rfc || "").trim().toUpperCase() === "XAXX010101000";
    });
    const regimenesFiscales = ref([]);

    const siguienteSeccion = () => {
      if (seccionActiva.value < 3) seccionActiva.value++;
    };

    const retrocederSeccion = () => {
      if (seccionActiva.value > 1) seccionActiva.value--;
    };

    const obtenerRegimenes = async () => {
      try {
        const res = await api.get("/getsat");
        if (res.data && res.data.regimenes_fiscales) {
          regimenesFiscales.value = res.data.regimenes_fiscales;
        }
      } catch (error) {
        console.error("Error al obtener regímenes fiscales:", error);
      }
    };

    const cargarCatalogos = async () => {
      try {
        const r = await api.get("/getfiscales");
        catalogos.value = r.data.data;
      } catch (error) {
        console.error("Error cargando catálogos fiscales:", error);
      }
    };
    const obtenerEmpresa = async () => {
      try {
        const res = await api.get("/obtenerEmpresa");
        if (res.data && res.data.data) {
          const empresa = Array.isArray(res.data.data)
            ? res.data.data[0]
            : res.data.data;

          factura.emisor.nombre = empresa.razons || "";
          factura.emisor.rfc = empresa.rfc || "";
          factura.emisor.domicilio_fiscal = `${empresa.ciudad || ""}, ${empresa.estado || ""}`;
          factura.emisor.regimen_fiscal = empresa.regimen || "";
        }
      } catch (error) {
        console.error("Error al obtener la empresa:", error);
      }
    };
    const abrirModalImportar = () => {
      if (!permisos.value?.crear) return;

      mostrarModalImportar.value = true;
    };
    const importarVenta = (venta) => {
      mostrarModalImportar.value = false;

      // 1️⃣ Validar cliente
      if (
        conceptos.value.length > 0 &&
        factura.receptor.id !== venta.cliente?.id
      ) {
        Swal.fire({
          icon: "warning",
          title: "Cliente distinto",
          text: "No puedes importar productos de un cliente diferente a los que ya tienes en la factura.",
        });
        return;
      }

      // 2️⃣ Receptor
      factura.receptor.id = venta.cliente?.id;
      factura.receptor.nombre = venta.cliente?.razon_social || "";
      factura.receptor.rfc = venta.cliente?.rfc || "";
      factura.receptor.delegacion = venta.cliente?.delegacion || "";
      factura.receptor.regimen_fiscal = venta.cliente?.regimen_fiscal || "";

      // 3️⃣ Conceptos
      venta.productos.forEach((p) => {
        const cantidad = Number(p.Cantidad ?? p.cantidad ?? 0);
        const valorUnitario = Number(
          p.ValorUnitario ?? p.precio_unitario ?? p.precio ?? 0
        );

        const claveProdServ = p.ClaveProdServ ?? p.clave_ps ?? "-";
        const claveUnidad = p.ClaveUnidad ?? p.clave_unidad ?? "-";
        const unidad = p.Unidad ?? p.medida ?? "-";

        const importe = cantidad * valorUnitario;

        const indexExistente = conceptos.value.findIndex(
          (c) =>
            c.ClaveProdServ === claveProdServ &&
            c.ClaveUnidad === claveUnidad &&
            c.ValorUnitario === valorUnitario
        );

        const objetoImp = p.objeto_sat ?? p.ObjetoImp;

        if (!objetoImp) {
          console.warn("Producto sin ObjetoImp configurado:", p);
        }

        const concepto = {
          ClaveProdServ: claveProdServ,
          Cantidad: cantidad,
          ClaveUnidad: claveUnidad,
          Unidad: unidad,
          Descripcion: p.Descripcion ?? p.nombre ?? "-",
          ValorUnitario: valorUnitario,
          Importe: importe,
          ObjetoImp: objetoImp,
          Impuestos: p.Impuestos ?? [],
          Descuento: Number(p.Descuento ?? p.descuento ?? 0),
        };

        if (indexExistente >= 0) {
          conceptos.value[indexExistente].Cantidad += cantidad;
          conceptos.value[indexExistente].Importe += importe;
        } else {
          conceptos.value.push(concepto);
        }
      });

      // 4️⃣ Venta actual
      factura.venta_id = venta.id;
    };


    const cargarCfdisTimbrados = async () => {
      try {
        const response = await api.post("/getlistarcfdi");

        cfdisTimbrados.value = response.data.data
          .filter(cfdi => cfdi.Status === "enviada");
      } catch (error) {
        console.error("Error cargando CFDIs:", error);
      }
    };



    const timbrarFactura = async () => {
      if (!permisos.value?.crear) {
        Swal.fire({
          icon: "warning",
          title: "Sin permiso",
          text: "No tienes permiso para crear facturas.",
        });
        return;
      }

      const result = await Swal.fire({
        title: "¿Generar CFDI?",
        text: "Una vez timbrado no podrás modificar la factura.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, generar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      try {
        const moneda = catalogos.value.monedas.find(
          (m) => m.clave_moneda === factura.emisor.moneda
        );

        const formaPago = catalogos.value.formas_pago.find(
          (fp) => fp.clave_pago === factura.emisor.forma_pago
        );

        const metodoPago = catalogos.value.metodos_pago.find(
          (mp) => mp.clave_pago === factura.emisor.metodo_pago
        );

        const regimenFiscal = regimenesFiscales.value.find(
          (r) => r.codigo === factura.emisor.regimen_fiscal  // ✅ busca por codigo
        );


        const usoCfdi = catalogos.value.usos_cfdi.find(
          (u) => u.usocfdi === factura.receptor.uso_cfdi
        );

        const payload = {
          cliente_id: factura.receptor.id,
          venta_id: factura.venta_id,
          usocfdi_id: usoCfdi?.id,
          moneda_id: moneda?.id,
          forma_pago_id: formaPago?.id,
          metodo_pago_id: metodoPago?.id,
          regimen_fiscal_id: regimenFiscal?.id,
          EnviarCorreo: false,
          LugarExpedicion: factura.emisor.lugar_expedicion || "86800",
          uuid_cfdi_sustituido: factura.uuid_cfdi_sustituido || null,
          Periodicidad: factura.Periodicidad,
          Meses: factura.Meses,
          Anio: factura.Anio,
          tipo_documento_id: factura.tipo_documento_id,
        };

        console.log("Payload timbrado:", payload);

        Swal.fire({
          title: "Generando CFDI...",
          text: "Por favor espera.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const resp = await api.post("/registrar-factura", payload, {
          responseType: "blob",
        });

        const blob = new Blob([resp.data], {
          type: "application/pdf",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `CFDI_${factura.venta_id || "factura"}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: "success",
          title: "Factura generada",
          text: "El CFDI se timbró correctamente.",
        });
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Ocurrió un error inesperado al timbrar la factura",
        });
      }
    };



    const cancelarTodo = () => {
      factura.receptor.nombre = "";
      factura.receptor.rfc = "";
      factura.receptor.domicilio_fiscal = "";
      factura.receptor.regimen_fiscal = "";

      conceptos.value = [];
    };

    onMounted(async () => {
      await fetchPermisos();

      if (!permisos.value?.listar) return;

      obtenerRegimenes();
      obtenerEmpresa();
      cargarCatalogos();
      cargarCfdisTimbrados();

    });

    return {
      sidebarOpen,
      loading,
      permisos,
      seccionActiva,
      factura,
      regimenesFiscales,
      siguienteSeccion,
      retrocederSeccion,
      mostrarModalImportar,
      abrirModalImportar,
      importarVenta,
      conceptos,
      ventasDisponibles,
      catalogos,
      timbrarFactura,
      cancelarTodo,
      cfdisTimbrados,
      esPublicoGeneral,
    };
  },
};
</script>


<style scoped>
.main-content {
  flex: 1;
  margin-top: 60px;
  background: linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%);
  transition: margin-left .3s ease;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}

.app-shell {
  background: #f1f5f9 !important;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .55);
  backdrop-filter: blur(3px);
  z-index: 1019;
}

main {
  min-height: calc(100vh - 60px);
  padding-bottom: 40px;
}

/* TITULO */

h3 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 28px !important;
  letter-spacing: -.4px;
}

/* BOTONES */

.btn {
  border-radius: 10px;
  font-weight: 700;
  padding: 10px 18px;
  transition: all .2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, .08);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, .15);
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
}

/* CARDS */

.card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .08);
  margin-bottom: 26px;
}

.card-header,
.section-header {
  background: linear-gradient(135deg, #0f172a, #1e3a5f) !important;
  color: #ffffff !important;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: .4px;
  border-bottom: none;
}

.card-body {
  padding: 26px;
}

/* LABELS */

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 7px;
}

/* INPUTS */

.form-control,
.form-select {
  height: 48px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 14px;
  transition: all .2s ease;
}

.form-control:hover,
.form-select:hover {
  border-color: #94a3b8;
}

.form-control:focus,
.form-select:focus {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 4px rgba(30, 58, 138, .13);
}

/* CAMPOS SOLO LECTURA */

.border.rounded {
  min-height: 48px;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 0 15px;
  font-size: 14px;
  color: #334155;
}

/* TABLA */

.table {
  margin-bottom: 0;
  font-size: 14px;
}

.table thead th {
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .5px;
  font-weight: 800;
  padding: 14px;
  border-bottom: 1px solid #cbd5e1;
}

.table tbody td {
  vertical-align: middle;
  padding: 14px;
  color: #1e293b;
  border-color: #e2e8f0;
}

.table-hover tbody tr:hover {
  background: #f8fafc;
}

/* SPINNER */

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #1e3a5f;
}

/* BOTONES DE NAVEGACION */

.d-flex.justify-content-end.mt-3,
.d-flex.justify-content-between.mt-3,
.d-flex.justify-content-start.mt-3 {
  padding: 0 24px 24px;
  gap: 10px;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  main {
    padding-left: 12px;
    padding-right: 12px;
  }

  h3 {
    font-size: 23px;
  }

  .card {
    border-radius: 16px;
  }

  .card-body {
    padding: 18px;
  }

  .btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .btn-sm {
    width: auto;
  }
}
</style>