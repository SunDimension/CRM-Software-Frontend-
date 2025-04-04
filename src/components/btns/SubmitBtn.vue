<template>
  <v-btn
    :loading="loading"
    :disabled="loading || error"
    class="mx-2"
    @click="$emit('click')" 
    >
    <template v-slot="{ isLoading }">
      <v-progress-circular v-if="isLoading" indeterminate size="24" color="primary" />
      <span v-else>{{ text }}</span>
      <v-icon v-if="error" color="error">mdi-alert</v-icon>
    </template>
  </v-btn>
  <span v-if="error" class="text-error">{{ error }}</span>
</template>

<script>
export default {
  props: {
    text: String, // Button text (required)
    loading: Boolean, // Loading state (optional)
    error: String, // Error message (optional)
  },
};
</script>

<style scoped>
.text-error {
  font-size: 0.8rem;
  margin-block-start: 4px;
}
</style>
