<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" variant="plain">
        <VIcon icon="ri-delete-bin-line" color="error" />
      </v-btn>
    </template>

    <v-card title="Confirm Delete">
      <v-card-text>
        Are you sure you want to delete this {{item_name || 'item'}}? This action cannot be undone.
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn @click="dialog = false" color="grey">Cancel</v-btn>

        <v-btn @click="confirmDelete" color="error">Confirm Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { makeApiCall } from '@/services/apiService';

export default {
  props: {
    item_name: {
      type: String,
      required: false, 
      default: '' 
    },
    api: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      errorMessage: null, 
    };
  },
  methods: {
    async confirmDelete() {
      try {
        this.errorMessage = null
        await makeApiCall('DELETE', this.api);
        this.$emit('deleted'); // Notify the parent component that the branch was deleted
        this.dialog = false; 
      } catch (error) {
        console.error(`Error deleting item:`, error);
        this.errorMessage = `Error deleting item. Please try again.`;
      }
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
}
</style>
