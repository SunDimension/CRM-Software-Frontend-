<script setup lang="ts">
import miscMaskDark from '@images/pages/misc-mask-dark.png';
import miscMaskLight from '@images/pages/misc-mask-light.png';
import tree from '@images/pages/tree.png';
import { useTheme } from 'vuetify';

const vuetifyTheme = useTheme();

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? miscMaskLight
    : miscMaskDark;
});
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="Under Testing"
      title="This Page is Under Testing"
      description="We are currently testing this page. Please check back later."
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VBtn
        to="/dashboard"
        class="mt-10"
      >
        Back to Home
      </VBtn>
    </div>

    <!-- 👉 Footer -->
    <VImg
      :src="tree"
      class="misc-footer-tree d-none d-md-block"
    />

    <VImg
      :src="authThemeMask"
      class="misc-footer-img d-none d-md-block"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/pages/misc.scss";

.misc-footer-tree {
  inline-size: 15.625rem;
  inset-block-end: 3.5rem;
  inset-inline-start: 0.375rem;
}
</style>
