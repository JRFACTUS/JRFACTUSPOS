// src/composables/useDataTable.js
import { ref, onBeforeUnmount, nextTick } from 'vue';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';

export function useDataTable(data, customConfig = {}) {
  const tableRef = ref(null);
  let dataTable = null;
  let isInitializing = false;

  const defaultConfig = {
    responsive: true,
    destroy: true,
    language: {
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros",
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior"
      },
      zeroRecords: "No se encontraron registros",
      emptyTable: "No hay datos registrados"
    }
  };

  const dataTableConfig = { ...defaultConfig, ...customConfig };

  const initDataTable = async () => {
    if (isInitializing) return;
    isInitializing = true;

    try {
      if (dataTable) {
        dataTable.destroy();
        dataTable = null;
      }

      await nextTick();

      if (tableRef.value && data.value.length > 0) {
        dataTable = $(tableRef.value).DataTable(dataTableConfig);
      }
    } catch (e) {
      console.error("Error al inicializar DataTable:", e);
    } finally {
      isInitializing = false;
    }
  };

  onBeforeUnmount(() => {
    if (dataTable) {
      try {
        dataTable.destroy();
        dataTable = null;
      } catch (e) {
        console.warn("Error al limpiar DataTable:", e);
      }
    }
  });

  return { tableRef, initDataTable };
}