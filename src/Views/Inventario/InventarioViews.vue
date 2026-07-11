<template>
    <div class="d-flex flex-column flex-lg-row min-vh-100 bg-light">
        <!-- Sidebar -->
        <Sidebar :class="{ 'd-none d-lg-flex': !sidebarOpen }" @close-sidebar="sidebarOpen = false" />

        <!-- Contenido principal -->
        <div class="main-content">
            <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="container-fluid p-4">

                <!-- Loading -->
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <!-- Error -->
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
                    v-if="!loading"
                    class="ajuste-container"
                >

                    <!-- HEADER -->
                    <div class="ajuste-header">
                        <div>
                            <h2>Ajustes de Inventario</h2>
                            <p>Control y corrección de existencias en inventario</p>
                        </div>
                    </div>

                    <!-- FORMULARIO -->
                    <div class="ajuste-form">

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
                                    @keyup.enter="buscarProducto"
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
                                    step="0.01"
                                    @keyup.enter="agregarAjusteDirecto"
                                    ref="stockFisicoInput"
                                />
                            </div>

                        </div>

                        <!-- RESULTADO AUTOMÁTICO -->
                        <div
                            v-if="resultadoAjuste"
                            class="alert mt-4 mb-0"
                            :class="resultadoAjuste.clase"
                        >
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <strong>
                                        {{ resultadoAjuste.texto }}
                                    </strong>

                                    <span v-if="resultadoAjuste.tipo !== 'sin_ajuste'">
                                        de {{ formatNumber(resultadoAjuste.cantidad) }} unidades
                                    </span>
                                </div>

                                <div class="small">
                                    Sistema:
                                    <strong>{{ formatNumber(resultadoAjuste.stockSistema) }}</strong>
                                    |
                                    Físico:
                                    <strong>{{ formatNumber(resultadoAjuste.stockFisico) }}</strong>
                                    |
                                    Diferencia registrada:
                                    <strong
                                        :class="{
                                            'text-danger': resultadoAjuste.diferenciaRegistrada < 0,
                                            'text-success': resultadoAjuste.diferenciaRegistrada > 0
                                        }"
                                    >
                                        {{ formatSignedNumber(resultadoAjuste.diferenciaRegistrada) }}
                                    </strong>
                                    |
                                    Diferencia actual:
                                    <strong class="text-primary">
                                        {{ formatNumber(resultadoAjuste.diferenciaActual) }}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div class="row align-items-end mt-4">

                            <div class="col-lg-9">
                                <label class="form-label">Observación</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    v-model="razon"
                                    placeholder="Ej: pérdida, sobrante, conteo físico..."
                                />
                            </div>

                           

                        </div>
                    </div>

                    <!-- TABLA -->
                    <div class="ajuste-content">

                        <div class="d-flex justify-content-end mb-3">
                            <button
                                class="btn-guardar"
                                @click="guardarAjuste"
                                :disabled="ajustes.length === 0 || loading"
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
                                        <th>Diferencia Registrada</th>
                                        
                                        <th>Cantidad Ajustada</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    <tr
                                        v-for="(ajuste, index) in ajustes"
                                        :key="ajuste.id"
                                    >
                                        <td>{{ index + 1 }}</td>

                                        <td>{{ ajuste.codigo_producto }}</td>

                                        <td>{{ ajuste.nombre }}</td>

                                        <td>{{ formatNumber(ajuste.stock_anterior) }}</td>

                                        <td>{{ formatNumber(ajuste.stock_fisico) }}</td>

                                        <td>
                                            <span
                                                :class="ajuste.tipo_ajuste === 'perdida'
                                                    ? 'text-danger fw-bold'
                                                    : 'text-success fw-bold'"
                                            >
                                                {{ ajuste.tipo_ajuste === 'perdida' ? 'Pérdida' : 'Sobrante' }}
                                            </span>
                                        </td>

                                        <td>
                                            <strong
                                                :class="ajuste.diferencia_registrada < 0
                                                    ? 'text-danger'
                                                    : 'text-success'"
                                            >
                                                {{ formatSignedNumber(ajuste.diferencia_registrada) }}
                                            </strong>
                                        </td>

                                        

                                        <td>
                                            {{ formatNumber(ajuste.cantidad_ajustada) }}
                                        </td>

                                        <td>

                                            <button
                                                class="btn-editar"
                                                @click="editarAjuste(ajuste)"
                                            >
                                                <i class="bi bi-pencil"></i>
                                            </button>

                                            <button
                                                class="btn-eliminar"
                                                @click="eliminarAjuste(index)"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>

                                        </td>

                                    </tr>

                                    <tr v-if="ajustes.length === 0">

                                        <td
                                            colspan="10"
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
import { ref, nextTick, onMounted, watch, computed } from "vue";
import api from "@/services/api.js";
import Header from "@/components/HeaderVue.vue";
import Sidebar from "@/components/Sidebar.vue";
import router from "@/router";

export default {
    name: "InventarioViews",
    components: { Header, Sidebar },

    setup() {
        const sidebarOpen = ref(false);
        const ajustes = ref([]);
        const loading = ref(false);
        const error = ref(null);
        const usuario = ref(null);

        // Formulario
        const codigoProducto = ref("");
        const productoId = ref(null);
        const productoBusqueda = ref("");
        const cantidadActual = ref(0);
        const stockFisico = ref(0);
        const razon = ref("");

        const productoInput = ref(null);
        const stockFisicoInput = ref(null);

        const formatNumber = (value) => {
            return Number(value || 0).toFixed(2);
        };

        const formatSignedNumber = (value) => {
            const numero = Number(value || 0);

            if (numero > 0) {
                return `+${numero.toFixed(2)}`;
            }

            return numero.toFixed(2);
        };

        /*
        |--------------------------------------------------------------------------
        | Resultado automático del ajuste
        |--------------------------------------------------------------------------
        | diferencia_registrada:
        | físico - sistema
        |
        | Si es negativa = pérdida
        | Si es positiva = sobrante
        |
        | diferencia_actual:
        | antes de guardar la mostramos en 0 porque después del ajuste
        | el sistema quedará igual al físico.
        */
        const resultadoAjuste = computed(() => {
            if (!productoId.value) {
                return null;
            }

            const stockSistema = Number(cantidadActual.value || 0);
            const stockContado = Number(stockFisico.value || 0);

            const diferenciaRegistrada = stockContado - stockSistema;
            const diferenciaActual = 0;

            if (Math.abs(diferenciaRegistrada) <= 0.0001) {
                return {
                    tipo: "sin_ajuste",
                    texto: "Sin ajuste",
                    cantidad: 0,
                    diferenciaRegistrada: 0,
                    diferenciaActual: 0,
                    stockSistema,
                    stockFisico: stockContado,
                    clase: "alert-secondary",
                };
            }

            if (diferenciaRegistrada < 0) {
                return {
                    tipo: "perdida",
                    texto: "Pérdida",
                    cantidad: Math.abs(diferenciaRegistrada),
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
                cantidad: diferenciaRegistrada,
                diferenciaRegistrada,
                diferenciaActual,
                stockSistema,
                stockFisico: stockContado,
                clase: "alert-success",
            };
        });

        // Verificar sesión
        const checkSesion = () => {
            const token = localStorage.getItem("token");
            const userJson = localStorage.getItem("user");

            if (token && userJson) {
                usuario.value = JSON.parse(userJson);
            } else {
                usuario.value = null;
                router.push("/login");
            }
        };

        const limpiarFormulario = () => {
            productoBusqueda.value = "";
            codigoProducto.value = "";
            productoId.value = null;
            cantidadActual.value = 0;
            stockFisico.value = 0;
            razon.value = "";

            nextTick(() => {
                if (productoInput.value) {
                    productoInput.value.focus();
                }
            });
        };

        const buscarProducto = async () => {
            if (!productoBusqueda.value) return;

            try {
                const termino = encodeURIComponent(productoBusqueda.value);

                const res = await api.get(`/productos/buscar?codigo_producto=${termino}`);

                if (res.data && res.data.length > 0) {
                    const producto = res.data[0];

                    codigoProducto.value = producto.codigo_producto;
                    productoId.value = producto.id;
                    productoBusqueda.value = producto.nombre;

                    /*
                    |--------------------------------------------------------------------------
                    | Stock sistema actual
                    |--------------------------------------------------------------------------
                    | Primero intenta usar inventario.stock_actual.
                    | Si tu endpoint no lo manda, usa producto.stock.
                    */
                    const stockSistema = Number(
                        producto.inventario?.stock_actual ??
                        producto.stock_actual ??
                        producto.stock ??
                        0
                    );

                    cantidadActual.value = stockSistema;

                    // El físico inicia igual al sistema.
                    stockFisico.value = stockSistema;

                    error.value = null;
                } else {
                    limpiarFormulario();
                    error.value = "No se encontró el producto.";
                }

                nextTick(() => {
                    if (stockFisicoInput.value) {
                        stockFisicoInput.value.focus();
                    }
                });

            } catch (err) {
                limpiarFormulario();
                error.value = "Error al buscar el producto.";
                console.error("Error al buscar el producto:", err);
            }
        };

        // Guardar ajustes en localStorage
        watch(ajustes, (newVal) => {
            localStorage.setItem("ajustesInventario", JSON.stringify(newVal));
        }, { deep: true });

        const agregarAjusteDirecto = () => {
            if (!productoId.value || !productoBusqueda.value || !usuario.value) {
                error.value = "Primero busca un producto válido.";
                return;
            }

            if (
                stockFisico.value === null ||
                stockFisico.value === "" ||
                Number(stockFisico.value) < 0
            ) {
                error.value = "Ingrese el stock físico contado.";
                return;
            }

            const stockSistema = Number(cantidadActual.value || 0);
            const stockContado = Number(stockFisico.value || 0);

            /*
            |--------------------------------------------------------------------------
            | Diferencia registrada
            |--------------------------------------------------------------------------
            | físico - sistema
            |
            | Sistema 100, físico 90  = -10 pérdida
            | Sistema 100, físico 120 = +20 sobrante
            */
            const diferenciaRegistrada = stockContado - stockSistema;

            if (Math.abs(diferenciaRegistrada) <= 0.0001) {
                error.value = "No hay diferencia entre el stock del sistema y el stock físico.";
                return;
            }

            const tipoAjuste = diferenciaRegistrada > 0 ? "sobrante" : "perdida";
            const cantidadAjuste = Math.abs(diferenciaRegistrada);

            /*
            |--------------------------------------------------------------------------
            | Después del ajuste debe quedar en 0
            |--------------------------------------------------------------------------
            */
            const diferenciaActual = 0;

            const nuevoAjuste = {
                id: productoId.value,
                nombre: productoBusqueda.value,
                codigo_producto: codigoProducto.value,

                stock_anterior: stockSistema,
                stock_fisico: stockContado,

                tipo_ajuste: tipoAjuste,

                diferencia_registrada: diferenciaRegistrada,
              

                perdida_registrada: tipoAjuste === "perdida" ? -cantidadAjuste : 0,
                sobrante_registrado: tipoAjuste === "sobrante" ? cantidadAjuste : 0,

                cantidad_ajustada: cantidadAjuste,

                razon: razon.value || "Ajuste de inventario",
                fecha: new Date().toLocaleString(),
                usuario: usuario.value.name,
            };

            const index = ajustes.value.findIndex(ajuste => ajuste.id === productoId.value);

            if (index !== -1) {
                ajustes.value[index] = nuevoAjuste;
            } else {
                ajustes.value.push(nuevoAjuste);
            }

            limpiarFormulario();
            error.value = null;
        };

        const guardarAjuste = async () => {
            if (ajustes.value.length === 0 || !usuario.value) {
                error.value = "No hay ajustes para guardar o no hay usuario.";
                return;
            }

            try {
                const confirmar = confirm(
                    "¿Está seguro que desea realizar el ajuste de inventario?"
                );

                if (!confirmar) return;

                loading.value = true;
                error.value = null;

                for (const ajuste of ajustes.value) {
                    await api.post("/ajuste", {
                        producto_id: ajuste.id,
                        stock_fisico: ajuste.stock_fisico,
                        motivo: ajuste.razon,
                        user_id: usuario.value.id,
                    });
                }

                ajustes.value = [];
                localStorage.removeItem("ajustesInventario");

                alert("Ajuste de inventario realizado correctamente.");

            } catch (err) {
                error.value = err.response?.data?.message || "Error al guardar los ajustes en el backend.";
                console.error(err);
            } finally {
                loading.value = false;
            }
        };

        const eliminarAjuste = (index) => {
            ajustes.value.splice(index, 1);
        };

        const editarAjuste = (ajuste) => {
            productoId.value = ajuste.id;
            codigoProducto.value = ajuste.codigo_producto;
            productoBusqueda.value = ajuste.nombre;

            cantidadActual.value = Number(ajuste.stock_anterior || 0);
            stockFisico.value = Number(ajuste.stock_fisico || 0);

            razon.value = ajuste.razon;

            nextTick(() => {
                if (stockFisicoInput.value) {
                    stockFisicoInput.value.focus();
                }
            });
        };

        onMounted(() => {
            checkSesion();

            const ajustesGuardados = localStorage.getItem("ajustesInventario");

            if (ajustesGuardados) {
                ajustes.value = JSON.parse(ajustesGuardados);
            }

            nextTick(() => {
                if (productoInput.value) {
                    productoInput.value.focus();
                }
            });
        });

        return {
            sidebarOpen,
            ajustes,
            loading,
            error,
            usuario,

            codigoProducto,
            productoId,
            productoBusqueda,
            cantidadActual,
            stockFisico,
            razon,

            resultadoAjuste,

            productoInput,
            stockFisicoInput,

            formatNumber,
            formatSignedNumber,

            buscarProducto,
            guardarAjuste,
            eliminarAjuste,
            editarAjuste,
            agregarAjusteDirecto,
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
