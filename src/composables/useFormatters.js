// src/composables/useFormatters.js

export function useFormatters() {
  // Formatear fecha completa (fecha + hora)
  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${dateStr} ${timeStr}`;
  };

  // Formatear solo fecha (sin hora)
  const formatDateOnly = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear moneda (pesos mexicanos)
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Formatear número con separadores de miles
  const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('es-MX').format(number);
  };

  return {
    formatDate,
    formatDateOnly,
    formatCurrency,
    formatNumber
  };
}