<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Permission } from '@/types/globalTypes'; // Update this path as necessary
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  mode: 'create' | 'edit';
  permission?: Permission; // Optional prop for edit mode
}>()

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['permissionCreated']);

const { handleSubmit, resetForm } = useForm({
  validationSchema: {
    // Add validation schema if needed
  },
});

// Define form fields
const name = useField<string>('name');

// Loading state
const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.permission) {
    const permission = props.permission;
    name.value.value = permission.name; // Set name from the permission object
  }
};

// Watch for changes in props to update form data
watch(() => props.permission, loadDataForEdit, { immediate: true });

const submit = handleSubmit(async (values) => {
  loading.value = true;
  apiError.value = null;
  console.log('Form Data:', values);

  const formData: Permission = {
    name: values.name,
    // Add any other fields if necessary
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/permissions/${props.permission?.id}` : `/permissions`;

  try {
    await makeApiCall<Permission>(apiMethod, apiUrl, formData);
    emits('permissionCreated'); // Emit event to notify parent component
    dialog.value = false; // Close dialog
    resetForm(); // Reset form after submission
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      apiError.value = axiosError.response?.data?.message || "An unexpected error occurred.";
    } else {
      apiError.value = "An unexpected error occurred.";
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          :text="`Create Permission`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          variant="plain"
          color="pending"
        >
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Permission' : 'Create Permission'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name.value.value"
                    label="Permission Name"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <!-- Error Message Display -->
            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                :text="mode === 'edit' ? 'Update Permission' : 'Create Permission'"
                variant="tonal"
                :loading="loading"
                :disabled="loading"  
              >
                <template #loader>
                  <v-progress-circular indeterminate size="24" class="mr-2" />
                </template>
              </v-btn>
            </v-card-actions>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
