<template>
  <div v-if="visible" class="loading-overlay">
    <div class="spinner-border text-primary" role="status"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.25);
  z-index: 2000;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
