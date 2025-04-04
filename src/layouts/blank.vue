<template>
  <div class="layout-wrapper layout-blank">
    <RouterView />
  </div>
</template>

<style>
.layout-wrapper.layout-blank {
  flex-direction: column;
}

/* Print-specific styles */
@media print {

  /* Hide elements with the "no-print" class */
  .no-print {
    display: none !important;
  }

  /* Customize layout for print */
  body {
    margin: 0;
  }

  main {
    padding: 3px !important;
    /* // font-size: 14px; */
    line-height: 1.2;
  }
}
</style>
