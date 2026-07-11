<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <!-- Sidebar -->
        <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

        <!-- Contenido principal -->
        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid pt-5 pt-lg-4 mt-4">



                <div class="card shadow-sm border-0 rounded-3">
                    <div class="card-header bg-primary text-white fw-bold rounded-top-3">
                        <i class="bi bi-receipt"></i> Listado de Facturas
                    </div>
                    <div class="card-body border-bottom bg-white">
                        <div class="row g-2 align-items-end">

                            <div class="col-md-3">
                                <label class="form-label fw-bold">Estatus</label>
                                <select v-model="filtroStatus" class="form-select">
                                    <option value="">Todos</option>
                                    <option value="enviada">Enviada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            <div class="col-md-3">
                                <label class="form-label fw-bold">Buscar por</label>
                                <select v-model="tipoBusqueda" class="form-select">
                                    <option value="uid">UID</option>
                                    <option value="uuid">UUID</option>
                                    <option value="folio">Folio</option>
                                </select>
                            </div>

                            <div class="col-md-4">
                                <label class="form-label fw-bold">Buscar CFDI</label>

                                <div v-if="tipoBusqueda === 'folio'" class="input-group">
                                    <select v-model="serieBusqueda" class="form-select" style="max-width: 120px;">
                                        <option value="">Serie</option>
                                        <option v-for="serie in series" :key="serie.SerieID" :value="serie.SerieName">
                                            {{ serie.SerieName }}
                                        </option>
                                    </select>

                                    <input v-model="folioConsecutivo" type="text" class="form-control"
                                        placeholder="Consecutivo" @keyup.enter="buscarCfdi" />
                                </div>

                                <input v-else v-model="valorBusqueda" type="text" class="form-control"
                                    placeholder="Buscar..." @keyup.enter="buscarCfdi" />
                            </div>

                            <div class="col-md-2">
                                <button class="btn btn-primary w-100" @click="buscarCfdi">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>

                        </div>
                    </div>
                    <div class="card-body p-0">

                        <div class="table-responsive">

                            <table class="table table-striped table-hover mb-0">

                                <thead class="table-light">
                                    <tr>
                                        <th>Folio</th>
                                        <th>UUID</th>
                                        <th>Fecha Timbrado</th>
                                        <th>RFC Receptor</th>
                                        <th>Razón Social</th>
                                        <th>Subtotal</th>
                                        <th>Total</th>
                                        <th>Estatus</th>
                                        <th>Versión</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    <tr v-for="factura in facturasFiltradas" :key="factura.UUID">

                                        <td>{{ factura.Folio }}</td>

                                        <td>
                                            <small>{{ factura.UUID }}</small>
                                        </td>

                                        <td>{{ factura.FechaTimbrado }}</td>

                                        <td>{{ factura.Receptor }}</td>

                                        <td>{{ factura.RazonSocialReceptor }}</td>

                                        <td>$ {{ Number(factura.Subtotal).toFixed(2) }}</td>

                                        <td>
                                            <strong>
                                                $ {{ Number(factura.Total).toFixed(2) }}
                                            </strong>
                                        </td>

                                        <td>

                                            <span class="badge" :class="{
                                                'bg-success': factura.Status == 'enviada',
                                                'bg-danger': factura.Status == 'cancelada',
                                                'bg-secondary': factura.Status != 'enviada' && factura.Status != 'cancelada'
                                            }">

                                                {{ factura.Status }}

                                            </span>

                                        </td>

                                        <td>{{ factura.Version }}</td>

                                        <td>



                                            <!-- DESCARGAR -->
                                            <button class="btn btn-sm btn-outline-success me-1"
                                                @click="descargarCfdi(factura.UUID)">

                                                <i class="bi bi-file-earmark-pdf"></i>

                                            </button>

                                            <!-- ENVIAR -->
                                            <button class="btn btn-sm btn-outline-warning me-1"
                                                @click="enviarCorreo(factura.cfdi_uid)">
                                                <i class="bi bi-envelope"></i>
                                            </button>

                                            <!-- CANCELAR -->
                                            <button class="btn btn-sm btn-outline-danger"
                                                @click="abrirModalCancelar(factura)">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                            <!-- ACUSE CANCELACIÓN -->
                                            <button v-if="factura.Status === 'cancelada'"
                                                class="btn btn-sm btn-outline-primary me-1"
                                                @click="descargarAcuse(factura.cfdi_uid)" title="Descargar acuse">
                                                <i class="bi bi-file-earmark-code"></i>
                                            </button>
                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </main>
        </div>

        <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
    </div>

    <VerFacturaModal :factura="facturaSeleccionada" :mostrar="mostrarModal" @cerrar="mostrarModal = false" />
   <ModalCancelarCfdi
    :show="mostrarModalCancelar"
    :factura="facturaCancelar"
    :cfdis="facturas"
    @close="cerrarModalCancelar"
    @confirm="procesarCancelacion"
/>
</template>



<script>
import { ref, onMounted, computed } from "vue";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import VerFacturaModal from "@/Views/Facturacion/VerFacturaModal.vue";
import ModalCancelarCfdi from "@/Views/Facturacion/ModalCancelarCfdi.vue";
import api from "@/services/api.js";
import Swal from "sweetalert2";
import { useDataTable } from "@/composables/useDataTable.js";

export default {
    name: "Listar_FacturaViews",

    components: {
        Header,
        Sidebar,
        VerFacturaModal,
        ModalCancelarCfdi
    },

    setup() {
        const sidebarOpen = ref(false);
        const facturas = ref([]);

        const mostrarModal = ref(false);
        const facturaSeleccionada = ref(null);

        const mostrarModalCancelar = ref(false);
        const facturaCancelar = ref(null);

        const series = ref([]);
        const serieBusqueda = ref("");
        const folioConsecutivo = ref("");

        const filtroStatus = ref("");
        const tipoBusqueda = ref("uuid");
        const valorBusqueda = ref("");
        const buscandoCfdi = ref(false);

        const { tableRef, initDataTable } = useDataTable(facturas);

        const obtenerUuid = (item) => {
            return String(
                item?.UUID ||
                item?.uuid ||
                item?.Uuid ||
                item?.cfdi_uid ||
                item?.uid ||
                item?.UID ||
                item?.uuid_cfdi ||
                item?.cfdi_uuid ||
                item?.folio_fiscal ||
                item?.FolioFiscal ||
                item?.folioFiscal ||
                item?.timbre?.UUID ||
                item?.TimbreFiscalDigital?.UUID ||
                item?.data?.UUID ||
                item?.data?.uuid ||
                item?.data?.cfdi_uid ||
                ""
            ).trim();
        };

        const facturasFiltradas = computed(() => {
            if (!filtroStatus.value) {
                return facturas.value;
            }

            return facturas.value.filter(factura => {
                return factura.Status === filtroStatus.value;
            });
        });

        const abrirModalCancelar = (factura) => {
            console.log("FACTURA A CANCELAR:", factura);

            facturaCancelar.value = factura;
            mostrarModalCancelar.value = true;
        };

        const cerrarModalCancelar = () => {
            mostrarModalCancelar.value = false;
            facturaCancelar.value = null;
        };

        const cargarFacturas = async () => {
            try {
                const response = await api.post("/getlistarcfdi");

                facturas.value = response.data?.data || [];

                setTimeout(() => {
                    initDataTable();
                }, 300);

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los CFDI."
                });
            }
        };

        const procesarCancelacion = async (payload) => {
            try {
                const uuidCancelar = payload?.uuid || obtenerUuid(facturaCancelar.value);

                if (!uuidCancelar) {
                    Swal.fire({
                        icon: "error",
                        title: "UUID no encontrado",
                        text: "No se encontró el UUID del CFDI a cancelar."
                    });
                    return;
                }

                console.log("Payload cancelación:", {
                    uuid: uuidCancelar,
                    motivo: payload.motivo,
                    folioSustituto: payload.folioSustituto || null
                });

                Swal.fire({
                    title: "Cancelando CFDI...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading()
                });

                const response = await api.post(`/cancelar/${uuidCancelar}`, {
                    motivo: payload.motivo,
                    folioSustituto: payload.folioSustituto || null
                });

                Swal.fire({
                    icon: "success",
                    title: "CFDI cancelado",
                    text: response.data?.message || "CFDI cancelado correctamente."
                });

                cerrarModalCancelar();

                await cargarFacturas();

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        "No se pudo cancelar el CFDI."
                });
            }
        };

        const enviarCorreo = async (cfdi_uid) => {
            if (!cfdi_uid) {
                Swal.fire({
                    icon: "error",
                    title: "cfdi_uid no encontrado",
                    text: "No se puede enviar el correo."
                });
                return;
            }

            Swal.fire({
                title: "Enviando factura...",
                html: "Por favor espere mientras procesamos su factura.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const response = await api.get(`/enviar/${cfdi_uid}`);

                const data = response.data;
                const cliente = data.cliente || {};

                Swal.fire({
                    icon: "success",
                    title: "Correo enviado correctamente",
                    html: `
                        <p><strong>Mensaje:</strong> ${data.message}</p>
                        <hr>
                        <p><strong>Cliente:</strong> ${cliente.razon_social ?? "Desconocido"}</p>
                        <ul style="text-align:left">
                            <li>${cliente.email ?? "N/A"}</li>
                            <li>${cliente.email2 ?? "N/A"}</li>
                            <li>${cliente.email3 ?? "N/A"}</li>
                        </ul>
                    `
                });

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message ?? "Ocurrió un error inesperado."
                });
            }
        };

        const descargarCfdi = async (uuid) => {
            if (!uuid) {
                Swal.fire({
                    icon: "error",
                    title: "UUID no encontrado",
                    text: "No se puede abrir el PDF."
                });
                return;
            }

            try {
                const response = await api.get(`/descargar_cfdi/${uuid}/pdf`, {
                    responseType: "blob"
                });

                const fileURL = window.URL.createObjectURL(
                    new Blob([response.data], {
                        type: "application/pdf"
                    })
                );

                const pdfWindow = window.open(fileURL, "_blank");

                if (pdfWindow) {
                    pdfWindow.onload = function () {
                        pdfWindow.focus();
                        pdfWindow.print();
                    };
                }

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message ?? "No se pudo abrir el PDF."
                });
            }
        };

        const descargarAcuse = async (cfdiUid) => {
            try {
                const response = await api.get(`/cfdi/${cfdiUid}/acuse`, {
                    responseType: "blob"
                });

                const blob = new Blob([response.data], {
                    type: "application/xml"
                });

                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `acuse_${cfdiUid}.xml`;
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "No fue posible descargar el acuse."
                });
            }
        };

        const buscarCfdi = async () => {
            if (buscandoCfdi.value) return;

            let valor = "";

            if (tipoBusqueda.value === "folio") {
                valor = `${serieBusqueda.value}${folioConsecutivo.value}`.trim();
            } else {
                valor = valorBusqueda.value.trim();
            }

            if (!valor) {
                Swal.fire("Aviso", "Escribe un valor para buscar.", "warning");
                return;
            }

            try {
                buscandoCfdi.value = true;

                Swal.fire({
                    title: "Por favor espere",
                    text: "Buscando CFDI...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading()
                });

                const response = await api.get(
                    `/cfdi/buscar/${tipoBusqueda.value}/${encodeURIComponent(valor)}`
                );

                Swal.close();

                const cfdi = response.data?.data?.data;

                if (!cfdi) {
                    Swal.fire({
                        icon: "warning",
                        title: "Sin resultados",
                        text: "No se encontró el CFDI."
                    });
                    return;
                }

                facturas.value = [cfdi];

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "No se pudo buscar el CFDI."
                });

            } finally {
                buscandoCfdi.value = false;
            }
        };

        const cargarSeries = async () => {
            try {
                const response = await api.get("/getseries");

                series.value = response.data?.data || [];

                const serieFactura = series.value.find(
                    serie => serie.SerieType === "factura"
                );

                if (serieFactura) {
                    serieBusqueda.value = serieFactura.SerieName;
                }

            } catch (error) {
                console.error("Error al cargar series:", error);
            }
        };

        onMounted(() => {
            cargarFacturas();
            cargarSeries();
        });

        return {
            tableRef,
            sidebarOpen,

            facturas,
            facturasFiltradas,

            filtroStatus,

            mostrarModal,
            facturaSeleccionada,

            mostrarModalCancelar,
            facturaCancelar,

            abrirModalCancelar,
            cerrarModalCancelar,
            procesarCancelacion,

            cargarFacturas,
            enviarCorreo,
            descargarCfdi,
            descargarAcuse,

            tipoBusqueda,
            valorBusqueda,
            buscarCfdi,

            serieBusqueda,
            folioConsecutivo,
            cargarSeries,
            series
        };
    }
};
</script>




<style scoped>
.main-content {
    flex: 1;
    margin-top: 60px;
    transition: margin-left 0.3s ease;
}

/* Sidebar fijo en desktop */
@media (min-width: 992px) {
    .main-content {
        margin-left: 250px;
    }
}

/* Fondo para overlay */
.sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1019;
}

/* Evita scroll lateral */
.card {
    border-radius: 10px;
    overflow-x: auto;
}

.bi {
    filter: brightness(0.9);
}
</style>
