<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <Sidebar
            :class="{ 'd-none d-lg-flex': !sidebarOpen }"
            @close-sidebar="sidebarOpen = false"
        />

        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">
                <div
                    v-if="loading || permisos === null"
                    class="text-center py-5"
                >
                    <div
                        class="spinner-border text-primary"
                        role="status"
                    ></div>
                </div>

                <div
                    v-if="error"
                    class="alert alert-danger alert-dismissible fade show"
                >
                    <i class="bi bi-exclamation-triangle me-2"></i>

                    {{ error }}

                    <button
                        type="button"
                        class="btn-close"
                        @click="error = null"
                    ></button>
                </div>

                <div
                    v-if="
                        !loading &&
                        permisos !== null &&
                        !permisos.listar
                    "
                    class="alert alert-warning"
                    role="alert"
                >
                    <i class="bi bi-shield-lock me-2"></i>

                    No tienes permiso para ver inventario.
                </div>

                <div
                    v-if="!loading && permisos?.listar"
                    class="ajuste-container"
                >
                    <div class="ajuste-header">
                        <div>
                            <h2>Ajustes de Inventario</h2>

                            <p>
                                Control y corrección de existencias en inventario
                            </p>
                        </div>
                    </div>

                    <div
                        v-if="permisos.crear"
                        class="ajuste-form"
                    >
                        <input
                            type="hidden"
                            v-model="codigoProducto"
                        />

                        <input
                            type="hidden"
                            v-model="productoId"
                        />

                        <div class="row g-4 align-items-end">
                            <div class="col-lg-5">
                                <label class="form-label">
                                    Buscar Producto (F10)
                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    placeholder="Nombre o código de barra"
                                    v-model="productoBusqueda"
                                    @keyup.enter.prevent="buscarProducto"
                                    ref="productoInput"
                                />
                            </div>

                            <div class="col-lg-2">
                                <label class="form-label">
                                    Stock Sistema
                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    :value="cantidadActual"
                                    disabled
                                />
                            </div>

                            <div class="col-lg-2">
                                <label class="form-label">
                                    Usuario
                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    :value="usuario?.name || 'N/A'"
                                    disabled
                                />
                            </div>

                            <div class="col-lg-3">
                                <label class="form-label">
                                    Stock físico contado
                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    v-model.number="stockFisico"
                                    min="0"
                                    step="0.001"
                                    @keyup.enter.prevent="agregarAjusteDirecto"
                                    ref="stockFisicoInput"
                                />
                            </div>
                        </div>

                        <div
                            v-if="resultadoAjuste"
                            class="alert mt-4 mb-0"
                            :class="resultadoAjuste.clase"
                        >
                            <div
                                class="d-flex align-items-center justify-content-between flex-wrap gap-2"
                            >
                                <div>
                                    <strong>
                                        {{ resultadoAjuste.texto }}
                                    </strong>

                                    <span
                                        v-if="
                                            resultadoAjuste.tipo !==
                                            'cuadrado'
                                        "
                                    >
                                        de
                                        {{
                                            formatNumber(
                                                resultadoAjuste.cantidad
                                            )
                                        }}
                                        unidades
                                    </span>
                                </div>

                                <div class="small">
                                    Movimiento:

                                    <strong>
                                        {{ resultadoAjuste.movimiento }}
                                    </strong>

                                    |

                                    Sistema:

                                    <strong>
                                        {{
                                            formatNumber(
                                                resultadoAjuste.stockSistema
                                            )
                                        }}
                                    </strong>

                                    |

                                    Físico:

                                    <strong>
                                        {{
                                            formatNumber(
                                                resultadoAjuste.stockFisico
                                            )
                                        }}
                                    </strong>

                                    |

                                    Diferencia registrada:

                                    <strong
                                        :class="{
                                            'text-danger':
                                                resultadoAjuste.diferenciaRegistrada <
                                                0,
                                            'text-success':
                                                resultadoAjuste.diferenciaRegistrada >
                                                0,
                                        }"
                                    >
                                        {{
                                            formatSignedNumber(
                                                resultadoAjuste.diferenciaRegistrada
                                            )
                                        }}
                                    </strong>

                                    |

                                    Diferencia actual:

                                    <strong class="text-primary">
                                        {{
                                            formatNumber(
                                                resultadoAjuste.diferenciaActual
                                            )
                                        }}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div class="row align-items-end mt-4">
                            <div class="col-lg-9">
                                <label class="form-label">
                                    Observación
                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    v-model="razon"
                                    maxlength="500"
                                    placeholder="Ingrese la observación general"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="ajuste-content">
                        <div class="d-flex justify-content-end mb-3">
                            <button
                                v-if="permisos.crear"
                                class="btn-guardar"
                                @click="guardarAjuste"
                                :disabled="
                                    ajustesPendientes.length === 0 ||
                                    loading
                                "
                            >
                                <i class="bi bi-check-circle me-2"></i>

                                Guardar todos los ajustes
                            </button>
                        </div>

                        <div class="table-responsive">
                            <table class="ajuste-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Código Producto</th>
                                        <th>Producto</th>
                                        <th>Stock Sistema</th>
                                        <th>Stock Físico</th>
                                        <th>Tipo Ajuste</th>
                                        <th>Movimiento</th>
                                        <th>Acción Kardex</th>
                                        <th>Diferencia Registrada</th>
                                        <th>Diferencia Actual</th>
                                        <th>Faltante Registrado</th>
                                        <th>Sobrante Registrado</th>
                                        <th>Cantidad Ajustada</th>
                                        <th>Stock Nuevo</th>
                                        <th>Estado</th>
                                        <th>Mensaje</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr
                                        v-for="(ajuste, index) in ajustes"
                                        :key="ajuste.uid"
                                    >
                                        <td>
                                            {{ index + 1 }}
                                        </td>

                                        <td>
                                            {{ ajuste.codigo_producto }}
                                        </td>

                                        <td>
                                            {{ ajuste.nombre }}
                                        </td>

                                        <td>
                                            {{
                                                formatNumber(
                                                    ajuste.stock_sistema_anterior
                                                )
                                            }}
                                        </td>

                                        <td>
                                            {{
                                                formatNumber(
                                                    ajuste.stock_fisico
                                                )
                                            }}
                                        </td>

                                        <td>
                                            <span
                                                :class="
                                                    claseTipoAjuste(
                                                        ajuste.tipo_ajuste
                                                    )
                                                "
                                            >
                                                {{
                                                    textoTipoAjuste(
                                                        ajuste.tipo_ajuste
                                                    )
                                                }}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                :class="
                                                    claseMovimiento(
                                                        ajuste.movimiento
                                                    )
                                                "
                                            >
                                                {{
                                                    textoMovimiento(
                                                        ajuste.movimiento
                                                    )
                                                }}
                                            </span>
                                        </td>

                                        <td>
                                            {{ ajuste.accion || "—" }}
                                        </td>

                                        <td>
                                            <strong
                                                :class="{
                                                    'text-danger':
                                                        Number(
                                                            ajuste.diferencia_registrada
                                                        ) < 0,
                                                    'text-success':
                                                        Number(
                                                            ajuste.diferencia_registrada
                                                        ) > 0,
                                                }"
                                            >
                                                {{
                                                    formatSignedNumber(
                                                        ajuste.diferencia_registrada
                                                    )
                                                }}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong class="text-primary">
                                                {{
                                                    formatNumber(
                                                        ajuste.diferencia_actual
                                                    )
                                                }}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                :class="{
                                                    'text-danger fw-bold':
                                                        Number(
                                                            ajuste.faltante_registrado
                                                        ) > 0,
                                                }"
                                            >
                                                {{
                                                    formatNumber(
                                                        ajuste.faltante_registrado
                                                    )
                                                }}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                :class="{
                                                    'text-success fw-bold':
                                                        Number(
                                                            ajuste.sobrante_registrado
                                                        ) > 0,
                                                }"
                                            >
                                                {{
                                                    formatNumber(
                                                        ajuste.sobrante_registrado
                                                    )
                                                }}
                                            </span>
                                        </td>

                                        <td>
                                            {{
                                                formatNumber(
                                                    ajuste.cantidad_ajustada
                                                )
                                            }}
                                        </td>

                                        <td>
                                            {{
                                                formatNumber(
                                                    ajuste.stock_nuevo
                                                )
                                            }}
                                        </td>

                                        <td>
                                            <span
                                                :class="
                                                    claseEstado(ajuste)
                                                "
                                            >
                                                {{ textoEstado(ajuste) }}
                                            </span>
                                        </td>

                                        <td>
                                            {{ ajuste.mensaje || "—" }}
                                        </td>

                                        <td>
                                            <button
                                                v-if="permisos.actualizar"
                                                class="btn-editar"
                                                :disabled="ajuste.procesado"
                                                @click="editarAjuste(ajuste)"
                                                :title="
                                                    ajuste.procesado
                                                        ? 'Este ajuste ya fue guardado'
                                                        : 'Editar ajuste'
                                                "
                                            >
                                                <i class="bi bi-pencil"></i>
                                            </button>

                                            <button
                                                v-if="permisos.eliminar"
                                                class="btn-eliminar"
                                                :disabled="ajuste.procesado"
                                                @click="eliminarAjuste(index)"
                                                title="Eliminar de la tabla"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>

                                            <span
                                                v-if="
                                                    !permisos.actualizar &&
                                                    !permisos.eliminar
                                                "
                                            >
                                                —
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="ajustes.length === 0">
                                        <td
                                            colspan="17"
                                            class="text-center text-muted py-5"
                                        >
                                            No hay ajustes registrados
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <div
            v-if="sidebarOpen"
            class="sidebar-overlay d-lg-none"
            @click="sidebarOpen = false"
        ></div>
    </div>
</template>

<script>
import {
    ref,
    nextTick,
    onMounted,
    watch,
    computed,
} from "vue";

import api, {
    obtenerPermisosPorModulo,
} from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import router from "@/router";

export default {
    name: "InventarioViews",

    components: {
        Header,
        Sidebar,
    },

    setup() {
        const sidebarOpen = ref(false);
        const ajustes = ref([]);
        const loading = ref(false);
        const error = ref(null);
        const usuario = ref(null);
        const permisos = ref(null);

        const permisoActivo = (valor) => {
            return (
                valor === true ||
                valor === 1 ||
                valor === "1" ||
                valor === "true"
            );
        };

        const fetchPermisos = async () => {
            if (
                permisoActivo(
                    usuario.value?.es_admin
                )
            ) {
                permisos.value = {
                    listar: true,
                    crear: true,
                    actualizar: true,
                    eliminar: true,
                };

                return;
            }

            try {
                const respuesta =
                    await obtenerPermisosPorModulo(
                        "inventario"
                    );

                const contenido =
                    respuesta?.data ??
                    respuesta ??
                    {};

                const datos =
                    contenido?.permisos ??
                    contenido?.data?.permisos ??
                    contenido?.data ??
                    contenido;

                permisos.value = {
                    listar: permisoActivo(
                        datos?.listar
                    ),
                    crear: permisoActivo(
                        datos?.crear
                    ),
                    actualizar: permisoActivo(
                        datos?.actualizar
                    ),
                    eliminar: permisoActivo(
                        datos?.eliminar
                    ),
                };
            } catch (err) {
                console.error(
                    "Error al obtener los permisos de inventario:",
                    err
                );

                permisos.value = {
                    listar: false,
                    crear: false,
                    actualizar: false,
                    eliminar: false,
                };

                error.value =
                    err.response?.data?.message ||
                    "No fue posible cargar los permisos de inventario.";
            }
        };

        const codigoProducto = ref("");
        const productoId = ref(null);
        const productoBusqueda = ref("");
        const cantidadActual = ref(0);
        const stockFisico = ref(0);
        const razon = ref("");

        const productoInput = ref(null);
        const stockFisicoInput = ref(null);

        const ajustesPendientes = computed(() => {
            return ajustes.value.filter(
                (ajuste) => !ajuste.procesado
            );
        });

        const formatNumber = (value) => {
            const numero = Number(value ?? 0);

            if (Number.isNaN(numero)) {
                return "0.000";
            }

            return numero.toFixed(3);
        };

        const formatSignedNumber = (value) => {
            const numero = Number(value ?? 0);

            if (Number.isNaN(numero)) {
                return "0.000";
            }

            if (numero > 0) {
                return `+${numero.toFixed(3)}`;
            }

            return numero.toFixed(3);
        };

        const resultadoAjuste = computed(() => {
            if (!productoId.value) {
                return null;
            }

            const stockSistema = Number(
                cantidadActual.value ?? 0
            );

            const stockContado = Number(
                stockFisico.value ?? 0
            );

            const diferenciaRegistrada = Number(
                (stockContado - stockSistema).toFixed(3)
            );

            const diferenciaActual = 0;

            if (
                Math.abs(diferenciaRegistrada) <=
                0.0001
            ) {
                return {
                    tipo: "cuadrado",
                    texto: "Inventario cuadrado",
                    movimiento: "Sin movimiento",
                    cantidad: 0,
                    diferenciaRegistrada: 0,
                    diferenciaActual,
                    stockSistema,
                    stockFisico: stockContado,
                    clase: "alert-secondary",
                };
            }

            if (diferenciaRegistrada < 0) {
                return {
                    tipo: "faltante",
                    texto: "Faltante",
                    movimiento: "Salida",
                    cantidad:
                        Math.abs(diferenciaRegistrada),
                    diferenciaRegistrada,
                    diferenciaActual,
                    stockSistema,
                    stockFisico: stockContado,
                    clase: "alert-danger",
                };
            }

            return {
                tipo: "sobrante",
                texto: "Sobrante",
                movimiento: "Entrada",
                cantidad: diferenciaRegistrada,
                diferenciaRegistrada,
                diferenciaActual,
                stockSistema,
                stockFisico: stockContado,
                clase: "alert-success",
            };
        });

        const textoTipoAjuste = (tipo) => {
            if (tipo === "faltante") {
                return "Faltante";
            }

            if (tipo === "sobrante") {
                return "Sobrante";
            }

            if (tipo === "cuadrado") {
                return "Cuadrado";
            }

            return "Pendiente";
        };

        const claseTipoAjuste = (tipo) => {
            if (tipo === "faltante") {
                return "text-danger fw-bold";
            }

            if (tipo === "sobrante") {
                return "text-success fw-bold";
            }

            if (tipo === "cuadrado") {
                return "text-primary fw-bold";
            }

            return "text-muted fw-bold";
        };

        const textoMovimiento = (movimiento) => {
            if (movimiento === "salida") {
                return "Salida";
            }

            if (movimiento === "entrada") {
                return "Entrada";
            }

            return "Sin movimiento";
        };

        const claseMovimiento = (movimiento) => {
            if (movimiento === "salida") {
                return "text-danger fw-bold";
            }

            if (movimiento === "entrada") {
                return "text-success fw-bold";
            }

            return "text-muted fw-bold";
        };

        const textoEstado = (ajuste) => {
            if (!ajuste.procesado) {
                return "Pendiente";
            }

            if (ajuste.ajuste_realizado === false) {
                return "Cuadrado";
            }

            return "Guardado";
        };

        const claseEstado = (ajuste) => {
            if (!ajuste.procesado) {
                return "text-warning fw-bold";
            }

            if (ajuste.ajuste_realizado === false) {
                return "text-primary fw-bold";
            }

            return "text-success fw-bold";
        };

        const checkSesion = () => {
            const token =
                localStorage.getItem("token");

            const userJson =
                localStorage.getItem("user");

            if (!token || !userJson) {
                usuario.value = null;
                router.push("/login");

                return;
            }

            try {
                usuario.value =
                    JSON.parse(userJson);
            } catch (err) {
                console.error(
                    "Error al obtener el usuario:",
                    err
                );

                usuario.value = null;

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                router.push("/login");
            }
        };

        const limpiarProducto = () => {
            productoBusqueda.value = "";
            codigoProducto.value = "";
            productoId.value = null;
            cantidadActual.value = 0;
            stockFisico.value = 0;

            nextTick(() => {
                productoInput.value?.focus();
            });
        };

        const limpiarFormulario = () => {
            productoBusqueda.value = "";
            codigoProducto.value = "";
            productoId.value = null;
            cantidadActual.value = 0;
            stockFisico.value = 0;
            razon.value = "";

            localStorage.removeItem(
                "observacionAjusteInventario"
            );

            nextTick(() => {
                productoInput.value?.focus();
            });
        };

        const buscarProducto = async () => {
            if (!permisos.value?.crear) {
                error.value =
                    "No tienes permiso para registrar ajustes de inventario.";

                return;
            }

            const busqueda =
                productoBusqueda.value.trim();

            if (!busqueda) {
                error.value =
                    "Ingrese el nombre o código del producto.";

                return;
            }

            try {
                const termino =
                    encodeURIComponent(busqueda);

                const res = await api.get(
                    `/productos/buscar?codigo_producto=${termino}`
                );

                let producto = null;

                if (
                    Array.isArray(res.data) &&
                    res.data.length > 0
                ) {
                    producto = res.data[0];
                } else if (
                    Array.isArray(res.data?.data) &&
                    res.data.data.length > 0
                ) {
                    producto = res.data.data[0];
                } else if (
                    res.data &&
                    typeof res.data === "object" &&
                    res.data.id
                ) {
                    producto = res.data;
                }

                if (!producto) {
                    limpiarProducto();

                    error.value =
                        "No se encontró el producto.";

                    return;
                }

                codigoProducto.value =
                    producto.codigo_producto;

                productoId.value =
                    producto.id;

                productoBusqueda.value =
                    producto.nombre;

                const stockSistema = Number(
                    producto.inventario?.stock_actual ??
                        producto.stock_actual ??
                        producto.stock ??
                        0
                );

                cantidadActual.value = Number(
                    stockSistema.toFixed(3)
                );

                stockFisico.value = Number(
                    stockSistema.toFixed(3)
                );

                error.value = null;

                nextTick(() => {
                    if (stockFisicoInput.value) {
                        stockFisicoInput.value.focus();
                        stockFisicoInput.value.select();
                    }
                });
            } catch (err) {
                limpiarProducto();

                error.value =
                    err.response?.data?.message ||
                    "Error al buscar el producto.";

                console.error(
                    "Error al buscar el producto:",
                    err
                );
            }
        };

        watch(
            ajustes,
            (nuevosAjustes) => {
                if (nuevosAjustes.length === 0) {
                    localStorage.removeItem(
                        "ajustesInventario"
                    );

                    return;
                }

                localStorage.setItem(
                    "ajustesInventario",
                    JSON.stringify(nuevosAjustes)
                );
            },
            {
                deep: true,
            }
        );

        watch(razon, (nuevaObservacion) => {
            const observacion = String(
                nuevaObservacion ?? ""
            ).trim();

            if (!observacion) {
                localStorage.removeItem(
                    "observacionAjusteInventario"
                );

                return;
            }

            localStorage.setItem(
                "observacionAjusteInventario",
                nuevaObservacion
            );
        });

        const agregarAjusteDirecto = () => {
            if (!permisos.value?.crear) {
                error.value =
                    "No tienes permiso para registrar ajustes de inventario.";

                return;
            }

            if (
                !productoId.value ||
                !productoBusqueda.value ||
                !usuario.value
            ) {
                error.value =
                    "Primero busca un producto válido.";

                return;
            }

            if (
                stockFisico.value === null ||
                stockFisico.value === "" ||
                Number.isNaN(
                    Number(stockFisico.value)
                ) ||
                Number(stockFisico.value) < 0
            ) {
                error.value =
                    "Ingrese un stock físico válido.";

                return;
            }

            const stockSistema = Number(
                Number(
                    cantidadActual.value ?? 0
                ).toFixed(3)
            );

            const stockContado = Number(
                Number(
                    stockFisico.value ?? 0
                ).toFixed(3)
            );

            let diferenciaRegistrada = Number(
                (
                    stockContado -
                    stockSistema
                ).toFixed(3)
            );

            const esCuadrado =
                Math.abs(diferenciaRegistrada) <=
                0.0001;

            if (esCuadrado) {
                diferenciaRegistrada = 0;
            }

            const tipoAjuste = esCuadrado
                ? "cuadrado"
                : diferenciaRegistrada > 0
                    ? "sobrante"
                    : "faltante";

            const movimiento = esCuadrado
                ? null
                : diferenciaRegistrada > 0
                    ? "entrada"
                    : "salida";

            const cantidadAjustada = esCuadrado
                ? 0
                : Number(
                    Math.abs(
                        diferenciaRegistrada
                    ).toFixed(3)
                );

            const faltanteRegistrado =
                tipoAjuste === "faltante"
                    ? cantidadAjustada
                    : 0;

            const sobranteRegistrado =
                tipoAjuste === "sobrante"
                    ? cantidadAjustada
                    : 0;

            const nuevoAjuste = {
                uid:
                    `${productoId.value}-${Date.now()}`,

                producto_id:
                    Number(productoId.value),

                codigo_producto:
                    codigoProducto.value,

                nombre:
                    productoBusqueda.value,

                ajuste_realizado:
                    null,

                tipo_ajuste:
                    tipoAjuste,

                movimiento,

                /*
                | La acción real será devuelta
                | por el backend al guardar.
                */
                accion:
                    null,

                stock_sistema_anterior:
                    stockSistema,

                stock_fisico:
                    stockContado,

                stock_nuevo:
                    stockContado,

                diferencia_registrada:
                    diferenciaRegistrada,

                diferencia_actual:
                    0,

                cantidad_ajustada:
                    cantidadAjustada,

                faltante_registrado:
                    faltanteRegistrado,

                sobrante_registrado:
                    sobranteRegistrado,

                usuario:
                    usuario.value.name,

                fecha:
                    new Date().toLocaleString(),

                mensaje:
                    null,

                procesado:
                    false,
            };

            const indexPendiente =
                ajustes.value.findIndex(
                    (ajuste) =>
                        Number(ajuste.producto_id) ===
                            Number(productoId.value) &&
                        !ajuste.procesado
                );

            if (indexPendiente !== -1) {
                nuevoAjuste.uid =
                    ajustes.value[
                        indexPendiente
                    ].uid;

                ajustes.value[indexPendiente] =
                    nuevoAjuste;
            } else {
                ajustes.value.push(
                    nuevoAjuste
                );
            }

            limpiarProducto();

            error.value = null;
        };

        const descargarPdfBase64 = (
            pdfBase64,
            nombreArchivo
        ) => {
            if (!pdfBase64) {
                throw new Error(
                    "El backend no devolvió el contenido del PDF."
                );
            }

            const base64Limpio = String(
                pdfBase64
            ).replace(
                /^data:application\/pdf;base64,/,
                ""
            );

            const contenidoBinario =
                atob(base64Limpio);

            const bytes = new Uint8Array(
                contenidoBinario.length
            );

            for (
                let i = 0;
                i < contenidoBinario.length;
                i++
            ) {
                bytes[i] =
                    contenidoBinario.charCodeAt(i);
            }

            const blob = new Blob(
                [bytes],
                {
                    type: "application/pdf",
                }
            );

            const urlPdf =
                URL.createObjectURL(blob);

            const enlace =
                document.createElement("a");

            enlace.href = urlPdf;

            enlace.download =
                nombreArchivo;

            document.body.appendChild(
                enlace
            );

            enlace.click();
            enlace.remove();

            setTimeout(() => {
                URL.revokeObjectURL(
                    urlPdf
                );
            }, 5000);
        };

        const actualizarAjusteDesdeRespuesta = (
            ajustePendiente,
            response
        ) => {
            const index =
                ajustes.value.findIndex(
                    (ajuste) =>
                        ajuste.uid ===
                        ajustePendiente.uid
                );

            if (index === -1) {
                return;
            }

            ajustes.value[index] = {
                ...ajustes.value[index],

                ajuste_realizado:
                    response.data
                        ?.ajuste_realizado ??
                    null,

                tipo_ajuste:
                    response.data
                        ?.tipo_ajuste ??
                    ajustes.value[index]
                        .tipo_ajuste,

                movimiento:
                    response.data
                        ?.movimiento ??
                    null,

                accion:
                    response.data
                        ?.accion ??
                    null,

                stock_sistema_anterior:
                    Number(
                        response.data
                            ?.stock_sistema_anterior ??
                        ajustes.value[index]
                            .stock_sistema_anterior
                    ),

                stock_fisico:
                    Number(
                        response.data
                            ?.stock_fisico ??
                        ajustes.value[index]
                            .stock_fisico
                    ),

                stock_nuevo:
                    Number(
                        response.data
                            ?.stock_nuevo ??
                        ajustes.value[index]
                            .stock_nuevo
                    ),

                diferencia_registrada:
                    Number(
                        response.data
                            ?.diferencia_registrada ??
                        ajustes.value[index]
                            .diferencia_registrada
                    ),

                diferencia_actual:
                    Number(
                        response.data
                            ?.diferencia_actual ??
                        0
                    ),

                cantidad_ajustada:
                    Number(
                        response.data
                            ?.cantidad_ajustada ??
                        0
                    ),

                faltante_registrado:
                    Number(
                        response.data
                            ?.faltante_registrado ??
                        0
                    ),

                sobrante_registrado:
                    Number(
                        response.data
                            ?.sobrante_registrado ??
                        0
                    ),

                mensaje:
                    response.data
                        ?.mensaje ??
                    null,

                procesado:
                    true,
            };
        };

        const guardarAjuste = async () => {
            if (!permisos.value?.crear) {
                error.value =
                    "No tienes permiso para guardar ajustes de inventario.";

                return;
            }

            if (
                !usuario.value ||
                !usuario.value.id
            ) {
                error.value =
                    "No existe un usuario autenticado.";

                return;
            }

            const pendientes =
                ajustes.value.filter(
                    (ajuste) =>
                        !ajuste.procesado
                );

            if (pendientes.length === 0) {
                error.value =
                    "No hay ajustes pendientes para guardar.";

                return;
            }

            const observacionGeneral =
                razon.value.trim();

            if (!observacionGeneral) {
                error.value =
                    "Debe ingresar una observación general para los ajustes.";

                return;
            }

            if (
                observacionGeneral.length >
                500
            ) {
                error.value =
                    "La observación no puede superar los 500 caracteres.";

                return;
            }

            const confirmar = confirm(
                `¿Está seguro que desea guardar ${pendientes.length} ajuste(s) de inventario?`
            );

            if (!confirmar) {
                return;
            }

            loading.value = true;
            error.value = null;

            try {
                for (
                    const ajustePendiente
                    of pendientes
                ) {
                    const response =
                        await api.post(
                            "/ajuste",
                            {
                                producto_id:
                                    ajustePendiente
                                        .producto_id,

                                stock_fisico:
                                    ajustePendiente
                                        .stock_fisico,

                                motivo:
                                    observacionGeneral,

                                user_id:
                                    usuario.value.id,
                            }
                        );

                    /*
                    | Marcar el registro como procesado
                    | inmediatamente después de que
                    | Laravel confirma el guardado.
                    */
                    actualizarAjusteDesdeRespuesta(
                        ajustePendiente,
                        response
                    );

                    const pdfBase64 =
                        response.data
                            ?.pdf_base64;

                    const identificadorPdf =
                        response.data
                            ?.folio_ajuste ??
                        ajustePendiente
                            .producto_id;

                    const nombreArchivo =
                        response.data
                            ?.nombre_archivo ??
                        `ajuste-${identificadorPdf}.pdf`;

                    descargarPdfBase64(
                        pdfBase64,
                        nombreArchivo
                    );
                }

                ajustes.value = [];

                localStorage.removeItem(
                    "ajustesInventario"
                );

                localStorage.removeItem(
                    "observacionAjusteInventario"
                );

                limpiarFormulario();

                error.value = null;

                alert(
                    "Ajustes de inventario realizados correctamente. Los comprobantes PDF fueron descargados."
                );
            } catch (err) {
                if (
                    err.response?.status ===
                    422
                ) {
                    const errores =
                        err.response?.data
                            ?.errors;

                    if (errores) {
                        error.value =
                            Object.values(
                                errores
                            )
                                .flat()
                                .join(" ");
                    } else {
                        error.value =
                            err.response
                                ?.data
                                ?.message ||
                            "Los datos enviados no son válidos.";
                    }
                } else {
                    error.value =
                        err.response?.data
                            ?.message ||
                        err.message ||
                        "Error al guardar los ajustes en el backend.";
                }

                console.error(
                    "Error al guardar los ajustes:",
                    err
                );
            } finally {
                loading.value = false;
            }
        };

        const eliminarAjuste = (
            index
        ) => {
            if (!permisos.value?.eliminar) {
                error.value =
                    "No tienes permiso para eliminar ajustes de la tabla.";

                return;
            }

            if (
                ajustes.value[index]
                    ?.procesado
            ) {
                error.value =
                    "Este ajuste ya fue guardado y no puede eliminarse.";

                return;
            }

            ajustes.value.splice(
                index,
                1
            );
        };

        const editarAjuste = (
            ajuste
        ) => {
            if (!permisos.value?.actualizar) {
                error.value =
                    "No tienes permiso para editar ajustes de inventario.";

                return;
            }

            if (ajuste.procesado) {
                error.value =
                    "Este ajuste ya fue guardado y no puede editarse.";

                return;
            }

            productoId.value =
                ajuste.producto_id;

            codigoProducto.value =
                ajuste.codigo_producto;

            productoBusqueda.value =
                ajuste.nombre;

            cantidadActual.value =
                Number(
                    ajuste
                        .stock_sistema_anterior ??
                    0
                );

            stockFisico.value =
                Number(
                    ajuste.stock_fisico ??
                    0
                );

            nextTick(() => {
                if (
                    stockFisicoInput.value
                ) {
                    stockFisicoInput.value.focus();
                    stockFisicoInput.value.select();
                }
            });
        };

        const normalizarAjusteGuardado = (
            ajuste,
            index
        ) => {
            const tipoAjuste =
                ajuste.tipo_ajuste ===
                "perdida"
                    ? "faltante"
                    : ajuste.tipo_ajuste;

            const productoIdGuardado =
                ajuste.producto_id ??
                ajuste.id ??
                null;

            const stockSistema =
                ajuste
                    .stock_sistema_anterior ??
                ajuste.stock_anterior ??
                0;

            const diferencia = Number(
                ajuste
                    .diferencia_registrada ??
                0
            );

            const cantidad = Number(
                ajuste
                    .cantidad_ajustada ??
                Math.abs(diferencia)
            );

            return {
                ...ajuste,

                razon:
                    undefined,

                uid:
                    ajuste.uid ??
                    `${productoIdGuardado}-${Date.now()}-${index}`,

                producto_id:
                    productoIdGuardado,

                tipo_ajuste:
                    tipoAjuste,

                movimiento:
                    ajuste.movimiento ??
                    (
                        tipoAjuste ===
                        "faltante"
                            ? "salida"
                            : tipoAjuste ===
                                "sobrante"
                                ? "entrada"
                                : null
                    ),

                /*
                | No se genera una acción
                | fija desde Vue.
                */
                accion:
                    ajuste.accion ??
                    null,

                stock_sistema_anterior:
                    Number(
                        stockSistema
                    ),

                stock_fisico:
                    Number(
                        ajuste.stock_fisico ??
                        0
                    ),

                stock_nuevo:
                    Number(
                        ajuste.stock_nuevo ??
                        ajuste.stock_fisico ??
                        0
                    ),

                diferencia_registrada:
                    diferencia,

                diferencia_actual:
                    Number(
                        ajuste
                            .diferencia_actual ??
                        0
                    ),

                cantidad_ajustada:
                    cantidad,

                faltante_registrado:
                    Number(
                        ajuste
                            .faltante_registrado ??
                        (
                            tipoAjuste ===
                            "faltante"
                                ? cantidad
                                : 0
                        )
                    ),

                sobrante_registrado:
                    Number(
                        ajuste
                            .sobrante_registrado ??
                        (
                            tipoAjuste ===
                            "sobrante"
                                ? cantidad
                                : 0
                        )
                    ),

                mensaje:
                    ajuste.mensaje ??
                    null,

                procesado:
                    Boolean(
                        ajuste.procesado
                    ),
            };
        };

        onMounted(async () => {
            checkSesion();

            if (!usuario.value) {
                return;
            }

            await fetchPermisos();

            if (!permisos.value?.listar) {
                return;
            }

            const ajustesGuardados =
                localStorage.getItem(
                    "ajustesInventario"
                );

            if (ajustesGuardados) {
                try {
                    const registros =
                        JSON.parse(
                            ajustesGuardados
                        );

                    if (
                        Array.isArray(
                            registros
                        )
                    ) {
                        ajustes.value =
                            registros.map(
                                normalizarAjusteGuardado
                            );
                    } else {
                        ajustes.value = [];
                    }
                } catch (err) {
                    console.error(
                        "Error al recuperar los ajustes:",
                        err
                    );

                    ajustes.value = [];

                    localStorage.removeItem(
                        "ajustesInventario"
                    );
                }
            }

            const observacionGuardada =
                localStorage.getItem(
                    "observacionAjusteInventario"
                );

            if (
                observacionGuardada
            ) {
                razon.value =
                    observacionGuardada;
            }

            nextTick(() => {
                productoInput.value?.focus();
            });
        });

        return {
            sidebarOpen,
            ajustes,
            ajustesPendientes,
            loading,
            error,
            usuario,
            permisos,

            codigoProducto,
            productoId,
            productoBusqueda,
            cantidadActual,
            stockFisico,
            razon,

            productoInput,
            stockFisicoInput,

            resultadoAjuste,

            formatNumber,
            formatSignedNumber,

            textoTipoAjuste,
            claseTipoAjuste,

            textoMovimiento,
            claseMovimiento,

            textoEstado,
            claseEstado,

            buscarProducto,
            agregarAjusteDirecto,
            guardarAjuste,
            eliminarAjuste,
            editarAjuste,
        };
    },
};
</script>
<style scoped>

/* =========================
   MAIN CONTENT
========================= */

.main-content{
    flex:1;
    width:100%;
    margin-top:60px;
    overflow-x:hidden;
    transition:all .3s ease;
}

@media (min-width:992px){

    .main-content{
        margin-left:250px;
        width:calc(100% - 250px);
    }

}

/* =========================
   OVERLAY
========================= */

.sidebar-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.5);
    z-index:1019;
}

/* =========================
   MAIN
========================= */

main{
    min-height:calc(100vh - 60px);
    width:100%;
}

/* =========================
   CARD AJUSTES
========================= */

.ajuste-container{
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #edf0f5;
    box-shadow:0 15px 40px rgba(0,0,0,.05);
}

/* =========================
   HEADER
========================= */

.ajuste-header{
    padding:28px;
    border-bottom:1px solid #edf0f5;
}

.ajuste-header h2{
    margin:0;
    font-size:28px;
    font-weight:700;
    color:#111827;
}

.ajuste-header p{
    margin-top:8px;
    color:#6b7280;
}

/* =========================
   FORMULARIO
========================= */

.ajuste-form{
    padding:28px;
}

.form-label{
    font-size:14px;
    font-weight:600;
    color:#374151;
}

.form-control{
    height:48px;
    border-radius:14px;
    border:1px solid #dbe3ef;
    box-shadow:none;
}

.form-control:focus{
    border-color:#2563eb;
    box-shadow:0 0 0 3px rgba(37,99,235,.1);
}

input[disabled]{
    background:#f3f4f6;
}

/* =========================
   BOTON GUARDAR
========================= */

.btn-guardar{
    border:none;
    background:#16a34a;
    color:#fff;
    padding:12px 24px;
    border-radius:14px;
    font-weight:600;
    transition:.3s;
}

.btn-guardar:hover{
    background:#15803d;
}

/* =========================
   TABLA
========================= */

.ajuste-content{
    padding:20px;
}

.table-responsive{
    overflow-x:auto;
}

.ajuste-table{
    width:100%;
    min-width:900px;
    border-collapse:separate;
    border-spacing:0 12px;
}

.ajuste-table thead th{
    color:#64748b;
    font-size:13px;
    text-transform:uppercase;
    font-weight:700;
    padding:0 20px 10px;
    white-space:nowrap;
}

.ajuste-table tbody tr{
    background:#f8fafc;
    transition:.2s;
}

.ajuste-table tbody tr:hover{
    transform:translateY(-2px);
}

.ajuste-table td{
    padding:18px 20px;
    white-space:nowrap;
    vertical-align:middle;
}

.ajuste-table tbody tr td:first-child{
    border-radius:16px 0 0 16px;
}

.ajuste-table tbody tr td:last-child{
    border-radius:0 16px 16px 0;
}

/* =========================
   BOTONES TABLA
========================= */

.btn-editar{
    background:#f59e0b;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:8px 14px;
    margin-right:6px;
}

.btn-eliminar{
    background:#ef4444;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:8px 14px;
}

/* =========================
   SPINNER
========================= */

.spinner-border{
    width:3rem;
    height:3rem;
}

/* =========================
   RESPONSIVE
========================= */

@media(max-width:768px){

    .ajuste-form .row{
        row-gap:15px;
    }

    .ajuste-header{
        padding:20px;
    }

    .ajuste-form{
        padding:20px;
    }

    .ajuste-content{
        padding:15px;
    }

}

</style>
