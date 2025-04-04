<template>
  <!-- Main Parent Navigation Group -->
  <VerticalNavGroup
    :item="{
      title: props.nav_obj.title,
      icon: props.nav_obj.icon,
    }"
    @click="toggleParent"
  >
    <!-- Render children if the parent is open -->
    <div v-if="parentState.isOpen">
      <template v-for="child in props.nav_obj.children" :key="child.title">
        <!-- If child has no children, render it as a link -->
        <VerticalNavLink
          v-if="!child.children"
          :item="{
            title: child.title,
            icon: child.icon || 'ri-refresh-line', // Customize the icon if needed
            to: child.link,
          }"
          @click.stop
        />

        <!-- If child has children, render it as a collapsible group -->
        <VerticalNavGroup
          v-else
          :item="{
            title: child.title,
            icon: child.icon,
          }"
          @click.stop="toggleChild(child.title)"
        >
          <!-- Render nested children if the group is expanded -->
          <div v-if="childState[child.title]">
            <VerticalNavLink
              v-for="nestedChild in child.children"
              :key="nestedChild.title"
              :item="{
                title: nestedChild.title,
                icon: 'ri-refresh-line',
                to: nestedChild.link,
              }"
              @click.stop
            />
          </div>
        </VerticalNavGroup>
      </template>
    </div>
  </VerticalNavGroup>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';

// Define props for the navigation object
const props = defineProps<{
  nav_obj: {
    title: string;
    icon: string;
    children: Array<{
      title: string;
      link?: string;
      icon?: string;
      children?: Array<{ title: string; link: string }>;
    }>;
  };
}>();

// State to track whether the parent group is open
const parentState = reactive({
  isOpen: false,
});

// State for individual collapsible items
const childState = reactive<Record<string, boolean>>({});

// Toggle parent open/close state
const toggleParent = () => {
  parentState.isOpen = !parentState.isOpen;
  console.log(`Toggled parent: ${props.nav_obj.title}, isOpen: ${parentState.isOpen}`);
};

// Toggle child open/close state for collapsible folders
const toggleChild = (childTitle: string) => {
  // Initialize child state if it doesn't exist
  if (!(childTitle in childState)) {
    childState[childTitle] = false;
  }
  childState[childTitle] = !childState[childTitle];
  console.log(`Toggled child: ${childTitle}, isOpen: ${childState[childTitle]}`);
};
</script>

<style scoped>
/* Example styles for open state */
.VerticalNavGroup {
  transition: all 0.3s ease;
}

.VerticalNavGroup.open {
  background-color: #f0f0f0; /* Example highlight */
}
</style>
