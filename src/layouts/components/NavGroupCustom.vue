<template>
  <div>
    <!-- Render the parent as a clickable link if a link is defined,
         otherwise as plain text -->
    <VerticalNavLink v-if="props.nav_obj.link" :item="{
      title: props.nav_obj.title,
      icon: props.nav_obj.icon,
      to: props.nav_obj.link
    }" />
    <div v-else class="parent-no-link">
      <span class="parent-title">{{ props.nav_obj.title }}</span>
    </div>

    <!-- Render children (if any) always visible -->
    <div v-if="props.nav_obj.children && props.nav_obj.children.length">
      <template v-for="child in props.nav_obj.children" :key="child.title">
        <!-- If child has no further children, render as a clickable link -->
        <VerticalNavLink v-if="!child.children" :item="{
          title: child.title,
          icon: child.icon || 'ri-refresh-line',
          to: child.link
        }" />
        <!-- If child has its own children, recursively render using NavGroupCustom -->
        <NavGroupCustom v-else :nav_obj="child" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
import NavGroupCustom from './NavGroupCustom.vue'; // recursive import for nested children

const props = defineProps<{
  nav_obj: {
    title: string;
    icon: string;
    link?: string;
    children?: Array<{
      title: string;
      link?: string;
      icon?: string;
      children?: Array<{ title: string; link: string }>;
    }>;
  };
}>();
</script>

<style scoped>
.parent-no-link {
  padding: 10px;
  font-weight: bold;
  /* You can add additional styling if needed */
}
</style>
