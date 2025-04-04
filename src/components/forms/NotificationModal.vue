<template>
  <div>
    <v-dialog v-model="showNotificationModal" max-width="400">
      <v-card>
        <v-card-title class="headline">{{ modalTitle }}</v-card-title>
        <v-card-text>
          <v-alert :type="modalType" border="left" colored-border>
            {{ modalMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="modalType === 'success' ? 'green darken-1' : 'red darken-1'" text @click="closeModal">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';

const props = defineProps<{
  modalType: string;
  modalTitle: string;
  modalMessage: string;
}>();

const showNotificationModal = ref(false); // Controls the visibility of the modal

// Method to open the modal
const openModal = () => {
  showNotificationModal.value = true;
};

// Method to close the modal
const closeModal = () => {
  showNotificationModal.value = false;
};

// You may also want to expose the openModal method to be used by the parent component
defineExpose({
  openModal,
  closeModal
});
</script>

<style scoped>
/* Optional styling */
</style>
