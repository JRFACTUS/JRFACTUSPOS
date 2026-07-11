<template>
    <div v-if="show" class="modal-cancel-overlay">
        <div class="modal-cancel-card">
            <div class="modal-cancel-header">
                <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
                <div class="question-icon">?</div>
            </div>

            <div class="modal-cancel-body">
                <p class="text-center mb-3">
                    ¿Estás seguro que deseas cancelar el CFDI
                    <strong class="text-danger">
                        {{ obtenerFolio(factura) || obtenerUuid(factura) }}
                    </strong>?
                </p>

                <p class="text-center text-muted mb-3">
                    Si es así, por favor selecciona un motivo
                </p>

                <select v-model="motivo" class="form-select mb-4">
                    <option value="">Selecciona un motivo de cancelación</option>
                    <option value="01">01 - Comprobante emitido con errores con relación</option>
                    <option value="02">02 - Comprobante emitido con errores sin relación</option>
                    <option value="03">03 - No se llevó a cabo la operación</option>
                    <option value="04">04 - Operación nominativa relacionada en factura global</option>
                </select>

                <div v-if="motivo === '01'" class="mt-4">
                    <p class="text-center text-muted mb-3 fs-5">
                        Selecciona el CFDI que lo reemplazará
                    </p>

                    <div class="btn-group w-100 mb-3">
                        <button
                            type="button"
                            class="btn btn-sm"
                            :class="modoBusqueda === 'ultimos' ? 'btn-primary' : 'btn-outline-secondary'"
                            @click="cambiarModo('ultimos')"
                        >
                            Mostrar últimos CFDI's
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm"
                            :class="modoBusqueda === 'serie_folio' ? 'btn-primary' : 'btn-outline-secondary'"
                            @click="cambiarModo('serie_folio')"
                        >
                            Buscar por Serie + Folio
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm"
                            :class="modoBusqueda === 'uuid' ? 'btn-primary' : 'btn-outline-secondary'"
                            @click="cambiarModo('uuid')"
                        >
                            Buscar por UUID
                        </button>
                    </div>

                    <!-- ÚLTIMOS -->
                    <select
                        v-if="modoBusqueda === 'ultimos'"
                        v-model="folioSustituto"
                        class="form-select"
                    >
                        <option value="">Selecciona un CFDI</option>

                        <option
                            v-for="item in cfdisDisponibles"
                            :key="obtenerUuid(item)"
                            :value="obtenerUuid(item)"
                        >
                            Serie: {{ obtenerSerie(item) || 'Sin serie' }}
                            - Folio: {{ obtenerFolio(item) }}
                            - Cliente: {{ obtenerCliente(item) }}
                        </option>
                    </select>

                    <!-- SERIE + FOLIO -->
                    <div v-if="modoBusqueda === 'serie_folio'" class="row g-3">
                        <div class="col-md-6">
                            <select v-model="busquedaSerie" class="form-select">
                                <option value="">Selecciona Serie</option>

                                <option
                                    v-for="serie in seriesDisponibles"
                                    :key="serie"
                                    :value="serie"
                                >
                                    {{ serie }}
                                </option>
                            </select>
                        </div>

                        <div class="col-md-6">
                            <select
                                v-model="folioSustituto"
                                class="form-select"
                                :disabled="!busquedaSerie"
                            >
                                <option value="">Selecciona Folio</option>

                                <option
                                    v-for="item in foliosDisponibles"
                                    :key="obtenerUuid(item)"
                                    :value="obtenerUuid(item)"
                                >
                                    {{ obtenerFolio(item) }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- UUID -->
                    <div v-if="modoBusqueda === 'uuid'">
                        <input
                            v-model="busquedaUuid"
                            type="text"
                            class="form-control"
                            placeholder="Escribe por lo menos 3 caracteres del UUID"
                        >

                        <select
                            v-if="resultadosUuid.length"
                            v-model="folioSustituto"
                            class="form-select mt-2"
                        >
                            <option value="">Selecciona un CFDI</option>

                            <option
                                v-for="item in resultadosUuid"
                                :key="obtenerUuid(item)"
                                :value="obtenerUuid(item)"
                            >
                                Serie: {{ obtenerSerie(item) || 'Sin serie' }}
                                - Folio: {{ obtenerFolio(item) }}
                                - Cliente: {{ obtenerCliente(item) }}
                            </option>
                        </select>
                    </div>

                    <!-- DETALLES -->
                    <div
                        v-if="cfdiSustitutoSeleccionado"
                        class="card mt-3 shadow-sm border-0"
                    >
                        <div class="card-body px-4 py-3">
                            <h6 class="text-center fw-bold mb-3">
                                Detalles del CFDI sustituto
                            </h6>

                            <div class="row border-bottom py-1">
                                <div class="col-3">Serie</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border">
                                        {{ obtenerSerie(cfdiSustitutoSeleccionado) || 'Sin serie' }}
                                    </span>
                                </div>
                            </div>

                            <div class="row border-bottom py-1">
                                <div class="col-3">Folio</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border">
                                        {{ obtenerFolio(cfdiSustitutoSeleccionado) }}
                                    </span>
                                </div>
                            </div>

                            <div class="row border-bottom py-1">
                                <div class="col-3">UUID</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border text-wrap">
                                        {{ obtenerUuid(cfdiSustitutoSeleccionado) }}
                                    </span>
                                </div>
                            </div>

                            <div class="row border-bottom py-1">
                                <div class="col-3">Cliente</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border">
                                        {{ obtenerCliente(cfdiSustitutoSeleccionado) }}
                                    </span>
                                </div>
                            </div>

                            <div class="row border-bottom py-1">
                                <div class="col-3">Total</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border">
                                        $ {{ Number(obtenerTotal(cfdiSustitutoSeleccionado)).toFixed(2) }}
                                    </span>
                                </div>
                            </div>

                            <div class="row py-1">
                                <div class="col-3">Fecha</div>
                                <div class="col-9">
                                    <span class="badge bg-light text-primary border">
                                        {{ obtenerFecha(cfdiSustitutoSeleccionado) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="alert alert-danger mt-3 mb-0">
                    {{ error }}
                </div>
            </div>

            <div class="modal-cancel-footer">
                <button class="btn btn-danger me-2" @click="cerrar">
                    NO cancelar
                </button>

                <button class="btn btn-primary" @click="confirmar">
                    Sí cancelar
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ModalCancelarCfdi",

    props: {
        show: {
            type: Boolean,
            default: false
        },
        factura: {
            type: Object,
            default: null
        },
        cfdis: {
            type: Array,
            default: () => []
        }
    },

    emits: ["close", "confirm"],

    data() {
        return {
            motivo: "",
            folioSustituto: "",
            error: "",
            modoBusqueda: "ultimos",
            busquedaSerie: "",
            busquedaUuid: ""
        };
    },

    computed: {
        cfdisDisponibles() {
            const uuidActual = this.obtenerUuid(this.factura);

            return this.cfdis
                .filter(item => this.obtenerUuid(item))
                .filter(item => this.obtenerUuid(item) !== uuidActual)
                .filter(item => {
                    const status = String(
                        item.Status ||
                        item.status ||
                        item.Estatus ||
                        item.estatus ||
                        ""
                    ).toLowerCase();

                    if (!status) return true;

                    return (
                        status.includes("enviada") ||
                        status.includes("vigente") ||
                        status.includes("active") ||
                        status.includes("timbrada")
                    );
                });
        },

        seriesDisponibles() {
            const series = this.cfdisDisponibles
                .map(item => this.obtenerSerie(item))
                .filter(Boolean);

            return [...new Set(series)];
        },

        foliosDisponibles() {
            if (!this.busquedaSerie) {
                return [];
            }

            return this.cfdisDisponibles.filter(item => {
                return String(this.obtenerSerie(item)) === String(this.busquedaSerie);
            });
        },

        resultadosUuid() {
            const q = this.busquedaUuid.trim().toLowerCase();

            if (q.length < 3) {
                return [];
            }

            return this.cfdisDisponibles.filter(item => {
                return this.obtenerUuid(item).toLowerCase().includes(q);
            });
        },

        cfdiSustitutoSeleccionado() {
            if (!this.folioSustituto) {
                return null;
            }

            return this.cfdisDisponibles.find(item => {
                return this.obtenerUuid(item) === this.folioSustituto;
            }) || null;
        }
    },

    watch: {
        show(value) {
            if (value) {
                this.limpiar();
            }
        },

        motivo(value) {
            this.error = "";

            if (value !== "01") {
                this.folioSustituto = "";
                this.modoBusqueda = "ultimos";
                this.busquedaSerie = "";
                this.busquedaUuid = "";
            }
        },

        busquedaSerie() {
            this.folioSustituto = "";
            this.error = "";
        },

        busquedaUuid() {
            this.folioSustituto = "";
            this.error = "";
        }
    },

    methods: {
        obtenerUuid(item) {
            return String(
                item?.UUID ||
                item?.uuid ||
                item?.Uuid ||
                item?.cfdi_uid ||
                item?.uid ||
                item?.UID ||
                ""
            ).trim();
        },

        obtenerSerie(item) {
            const serieDirecta = item?.Serie || item?.serie || item?.SERIE;

            if (serieDirecta) {
                return String(serieDirecta).trim();
            }

            const folioCompleto = String(
                item?.Folio ||
                item?.folio ||
                item?.FOLIO ||
                ""
            ).trim();

            const partes = folioCompleto.split(" ");

            if (partes.length > 1) {
                return partes[0];
            }

            return "";
        },

        obtenerFolio(item) {
            const folioDirecto = String(
                item?.folio ||
                item?.Folio ||
                item?.FOLIO ||
                ""
            ).trim();

            const serie = String(
                item?.Serie ||
                item?.serie ||
                item?.SERIE ||
                ""
            ).trim();

            if (serie && folioDirecto.startsWith(serie + " ")) {
                return folioDirecto.replace(serie + " ", "").trim();
            }

            const partes = folioDirecto.split(" ");

            if (!serie && partes.length > 1) {
                return partes.slice(1).join(" ");
            }

            return folioDirecto;
        },

        obtenerCliente(item) {
            return (
                item?.RazonSocialReceptor ||
                item?.razon_social_receptor ||
                item?.cliente ||
                item?.Cliente ||
                item?.receptor ||
                ""
            );
        },

        obtenerTotal(item) {
            return (
                item?.Total ||
                item?.total ||
                item?.TOTAL ||
                0
            );
        },

        obtenerFecha(item) {
            return (
                item?.FechaTimbrado ||
                item?.fecha_timbrado ||
                item?.fecha ||
                item?.Fecha ||
                ""
            );
        },

        limpiar() {
            this.motivo = "";
            this.folioSustituto = "";
            this.error = "";
            this.modoBusqueda = "ultimos";
            this.busquedaSerie = "";
            this.busquedaUuid = "";
        },

        cambiarModo(modo) {
            this.modoBusqueda = modo;
            this.folioSustituto = "";
            this.busquedaSerie = "";
            this.busquedaUuid = "";
            this.error = "";
        },

        cerrar() {
            this.$emit("close");
        },

       confirmar() {
    this.error = "";

    const uuidCancelar = this.obtenerUuid(this.factura);

    if (!uuidCancelar) {
        this.error = "No se encontró el UUID del CFDI a cancelar.";
        return;
    }

    if (!this.motivo) {
        this.error = "Selecciona un motivo de cancelación.";
        return;
    }

    if (this.motivo === "01" && !this.folioSustituto) {
        this.error = "Selecciona el CFDI sustituto.";
        return;
    }

    this.$emit("confirm", {
        uuid: uuidCancelar,
        motivo: this.motivo,

        // Factura.com / backend
        folioSustituto: this.motivo === "01"
            ? this.folioSustituto
            : null
    });
}
    }
};
</script>
<style scoped>
.modal-cancel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;
}

.modal-cancel-card {
    width: 700px;
    max-width: 95%;
    max-height: 90vh;

    background: #fff;
    border-radius: 6px;

    overflow-y: auto;
    overflow-x: hidden;

    box-shadow: 0 20px 40px rgba(0, 0, 0, .30);
}

.modal-cancel-header {
    background: #244b78;
    height: 120px;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
}

.modal-cancel-header .btn-close {
    position: absolute;
    top: 20px;
    right: 20px;
}

.question-icon {
    width: 60px;
    height: 60px;

    border-radius: 50%;
    background: #fff;
    color: #244b78;

    font-size: 42px;
    font-weight: bold;

    text-align: center;
    line-height: 60px;
}

.modal-cancel-body {
    padding: 25px 40px;
}

.modal-cancel-footer {
    padding: 16px 20px;

    border-top: 1px solid #eee;

    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;

    background: #fff;
}

.card {
    border-radius: 6px;
}

.badge {
    font-size: 0.85rem;
    font-weight: 500;
}

@media (max-width: 768px) {
    .modal-cancel-card {
        width: 100%;
        max-width: 100%;
        max-height: 95vh;
    }

    .modal-cancel-body {
        padding: 20px;
    }

    .modal-cancel-footer {
        flex-direction: column;
    }

    .modal-cancel-footer .btn {
        width: 100%;
    }
}
</style>