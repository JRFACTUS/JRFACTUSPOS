<template>
  <div
    v-if="visible && permisos !== null && permisos.listar"
    class="modal fade show d-block"
    tabindex="-1"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">{{ titulo }}</h5>

          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>

        <div class="modal-body">
          <!-- Buscador -->
          <div class="mb-3">
            <input
              ref="inputBuscar"
              v-model="filtro"
              type="text"
              class="form-control"
              placeholder="Buscar por código o nombre..."
              autofocus
              @input="filtrar"
            />
          </div>

          <!-- Tabla productos -->
          <div
            ref="tableContainer"
            class="table-responsive"
            style="max-height: 400px; overflow-y: auto"
            @scroll="checkScroll"
          >
            <table class="table table-hover text-center align-middle">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Precio compra</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(prod, index) in filtrados"
                  :key="prod.id"
                  :class="{ 'table-primary': index === indiceSeleccionado }"
                  style="cursor: pointer"
                  @dblclick="seleccionar(prod)"
                  @click="indiceSeleccionado = index"
                >
                  <td>{{ prod.codigo_producto }}</td>
                  <td>{{ prod.nombre }}</td>
                  <td>{{ formatPrecio(prod.precio_compra) }}</td>
                  <td>{{ prod.stock }}</td>
                </tr>

                <tr v-if="loading || cargandoMas">
                  <td colspan="4" class="py-3 text-muted">
                    <div
                      class="spinner-border text-primary"
                      role="status"
                    ></div>
                  </td>
                </tr>

                <tr v-if="!loading && filtrados.length === 0">
                  <td colspan="4" class="text-muted py-3">
                    No se encontraron productos
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api, {
  obtenerPermisosPorModulo,
} from "@/services/api.js";

export default {
  name: "ModalCompra",

  props: {
    visible: Boolean,

    titulo: {
      type: String,
      default: "Buscar Productos",
    },
  },

  emits: ["close", "select"],

  data() {
    return {
      permisos: null,

      filtro: "",
      productos: [],
      filtrados: [],

      loading: false,
      cargandoMas: false,

      indiceSeleccionado: 0,

      offset: 0,
      limit: 10,
      total: 0,
    };
  },

  watch: {
    async visible(val) {
      if (val) {
        await this.obtenerPermisos();

        if (!this.permisos?.listar) {
          window.removeEventListener(
            "keydown",
            this.handleKeyNavigation
          );

          this.$emit("close");
          return;
        }

        this.resetModal();

        this.$nextTick(() => {
          this.$refs.inputBuscar?.focus();
        });

        window.addEventListener(
          "keydown",
          this.handleKeyNavigation
        );
      } else {
        window.removeEventListener(
          "keydown",
          this.handleKeyNavigation
        );
      }
    },
  },

  beforeUnmount() {
    window.removeEventListener(
      "keydown",
      this.handleKeyNavigation
    );
  },

  methods: {
    permisoActivo(valor) {
      return (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true"
      );
    },

    async obtenerPermisos() {
      try {
        const respuesta =
          await obtenerPermisosPorModulo("compras");

        const datosRespuesta =
          respuesta?.data?.data ??
          respuesta?.data ??
          respuesta ??
          {};

        const datos =
          datosRespuesta?.permisos ??
          datosRespuesta;

        this.permisos = {
          listar: this.permisoActivo(datos?.listar),
        };
      } catch (error) {
        console.error(
          "Error al obtener permisos de productos:",
          error
        );

        this.permisos = {
          listar: false,
        };
      }
    },

    async resetModal() {
      this.productos = [];
      this.filtrados = [];
      this.offset = 0;
      this.total = 0;
      this.indiceSeleccionado = 0;

      await this.cargarProductos();
    },

    async cargarProductos() {
      if (!this.permisos?.listar) return;

      if (this.loading || this.cargandoMas) return;

      this.loading = this.offset === 0;
      this.cargandoMas = this.offset > 0;

      try {
        const res = await api.get(
          `/productos?limit=${this.limit}&offset=${this.offset}`
        );

        const nuevos = res.data.data;
        this.total = res.data.total;

        this.productos.push(...nuevos);

        const f = this.filtro.toLowerCase();

        this.filtrados = this.productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(f) ||
            p.codigo_producto.toLowerCase().includes(f)
        );

        this.offset += this.limit;
      } catch (e) {
        console.error(
          "Error al cargar productos:",
          e
        );

        alert("No se pudieron cargar los productos.");
      } finally {
        this.loading = false;
        this.cargandoMas = false;
      }
    },

    filtrar() {
      const f = this.filtro.toLowerCase();

      this.filtrados = this.productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(f) ||
          p.codigo_producto.toLowerCase().includes(f)
      );

      this.indiceSeleccionado = 0;
    },

    seleccionar(prod) {
      this.$emit("select", prod);
      this.$emit("close");
    },

    handleKeyNavigation(e) {
      if (
        !this.visible ||
        !this.permisos?.listar ||
        !this.filtrados.length
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();

        if (
          this.indiceSeleccionado <
          this.filtrados.length - 1
        ) {
          this.indiceSeleccionado++;
          this.scrollToSelected();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();

        if (this.indiceSeleccionado > 0) {
          this.indiceSeleccionado--;
          this.scrollToSelected();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();

        const prod =
          this.filtrados[this.indiceSeleccionado];

        if (prod) {
          this.seleccionar(prod);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.$emit("close");
      }
    },

    scrollToSelected() {
      this.$nextTick(() => {
        const table =
          this.$el.querySelector("table");

        const row =
          table.querySelectorAll("tbody tr")[
            this.indiceSeleccionado
          ];

        if (row) {
          row.scrollIntoView({
            block: "nearest",
          });
        }
      });
    },

    checkScroll() {
      const container =
        this.$refs.tableContainer;

      if (!container) return;

      if (
        container.scrollTop +
          container.clientHeight >=
          container.scrollHeight - 50 &&
        this.productos.length < this.total &&
        !this.cargandoMas
      ) {
        this.cargarProductos();
      }
    },

    formatPrecio(v) {
      return `$${parseFloat(v).toFixed(2)}`;
    },
  },
};
</script>

<style scoped>
.table-primary {
  background-color: #cfe2ff !important;
}
</style>
