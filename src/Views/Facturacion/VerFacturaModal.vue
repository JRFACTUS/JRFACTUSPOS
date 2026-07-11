<template>
  <div class="modal fade" id="verFacturaModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">

        <!-- HEADER -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-receipt"></i> Factura — {{ factura?.uuid ?? "Sin timbrar" }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>

        <!-- BODY -->
        <div class="modal-body">

          <!-- CLIENTE -->
          <div class="row mb-4">
            <div class="col-md-4">
              <strong>Cliente:</strong><br />
              {{ factura?.cliente?.razon_social }}
            </div>

            <div class="col-md-4">
              <strong>UID Receptor:</strong><br />
              {{ factura?.receptor_uid }}
            </div>

            <div class="col-md-4">
              <strong>Serie:</strong><br />
              {{ factura?.serie }}
            </div>
          </div>

          <!-- DATOS FISCALES -->
          <div class="row mb-4">
            <div class="col-md-4">
              <strong>Uso CFDI:</strong><br />
              {{ factura?.uso_cfdi?.descripcion }}
            </div>

            <div class="col-md-4">
              <strong>Moneda:</strong><br />
              {{ factura?.moneda?.clave_moneda }}
            </div>

            <div class="col-md-4">
              <strong>Régimen Fiscal:</strong><br />
              {{ factura?.regimen_fiscal?.descripcion }}
            </div>
          </div>

          <!-- PAGO -->
          <div class="row mb-4">
            <div class="col-md-6">
              <strong>Forma de Pago:</strong><br />
              {{ factura?.forma_pago?.clave_pago }} -
              {{ factura?.forma_pago?.descripcion_pago }}
            </div>

            <div class="col-md-6">
              <strong>Método de Pago:</strong><br />
              {{ factura?.metodo_pago?.clave_pago }} -
              {{ factura?.metodo_pago?.descripcion_pago }}
            </div>
          </div>

          <!-- OTROS DATOS -->
          <div class="row mb-4">
            <div class="col-md-6">
              <strong>Objeto Impuesto:</strong><br />
              {{ factura?.objeto_imp?.descripcion_objeto }}
            </div>

            <div class="col-md-6">
              <strong>Lugar Expedición:</strong><br />
              {{ factura?.lugarexpedicion }}
            </div>
          </div>

          <!-- FECHAS -->
          <div class="row mb-4">
            <div class="col-md-6">
              <strong>Fecha:</strong><br />
              {{ factura?.created_at }}
            </div>

            <div class="col-md-6">
              <strong>UUID:</strong><br />
              {{ factura?.uuid ?? "Sin timbrar" }}
            </div>
          </div>

          <hr />

          <!-- CONCEPTOS -->
          <h5 class="mb-3"><i class="bi bi-box-seam"></i> Conceptos</h5>

          <div class="table-responsive">
            <table class="table table-bordered table-striped">
              <thead class="table-secondary">
                <tr>
                  <th>ClaveProdServ</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Clave Unidad</th> <!-- 👈 AÑADIDO -->
                  <th>Valor Unitario</th>
                  <th>Importe</th>
                  <th>IVA hola como</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(c, i) in factura?.conceptos" :key="i">
                  <td>{{ c.ClaveProdServ }}</td>
                  <td>{{ c.Descripcion }}</td>
                  <td>{{ c.Cantidad }}</td>

                  <!-- 👇 SOLO ESTE DATO NUEVO -->
                  <td>{{ c.ClaveUnidad }}</td>

                  <td>${{ Number(c.ValorUnitario).toFixed(2) }}</td>
                  <td>${{ Number(c.Importe).toFixed(2) }}</td>

                  <td>
                    {{
                      c.Impuestos?.Traslados?.[0]?.Importe
                        ? "$" + Number(c.Impuestos.Traslados[0].Importe).toFixed(2)
                        : "$0.00"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


        </div>

        <!-- FOOTER -->
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as bootstrap from "bootstrap";

export default {
  name: "VerFacturaModal",

  props: {
    factura: Object,
    mostrar: Boolean,
  },

  data() {
    return {
      modalInstance: null, // ✔ nombre permitido por ESLint
    };
  },

  watch: {
    mostrar(nuevo) {
      const modalEl = document.getElementById("verFacturaModal");

      // Crear instancia solo una vez
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(modalEl);

        modalEl.addEventListener("hidden.bs.modal", () => {
          this.$emit("cerrar");
        });
      }

      // Mostrar u ocultar modal
      if (nuevo) {
        this.modalInstance.show();
      } else {
        this.modalInstance.hide();
      }
    },
  },
};
</script>


<style scoped>
.table th,
.table td {
  vertical-align: middle !important;
}
</style>
