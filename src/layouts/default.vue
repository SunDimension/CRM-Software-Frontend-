<script lang="ts" setup>
import DefaultLayoutWithVerticalNav from './components/DefaultLayoutWithVerticalNav.vue';
</script>

<template>
  <DefaultLayoutWithVerticalNav>
    <RouterView />
  </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";

/* Print-specific styles */
@media print {

  /* Hide elements with the "no-print" class */
  .no-print {
    display: none !important;
  }

  /* Customize layout for print */
  body {
    margin: 0 !important;
    // margin-top: 0;
  }

  main {
    padding: 3px !important;
    // font-size: 14px;
    line-height: 1.2;
  }

  .layout-page-content {
    padding: 3px !important;
    margin: 0 !important;
  }

  .page-content-container {
    padding: 3px !important;
    margin: 0 !important;
  }

  .layout-content-wrapper {
    margin: 0 !important;
    padding: 3px !important;

  }
}
</style>
