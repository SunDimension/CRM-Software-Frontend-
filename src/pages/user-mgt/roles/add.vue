<template>
  <div>
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          color="success"
          variant="tonal"
          v-bind="activatorProps"
        >
          Create Role
        </v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          color="warning"
        >
          Edit Role
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span>{{ mode === 'edit' ? 'Edit Role' : 'Create Role' }}</span>
        </v-card-title>
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="roleName"
              label="Role Name"
              
              required
            ></v-text-field>

            <v-select
              v-model="selectedPermissions"
              :items="permissions"
              item-value="id"
              item-title="name"
              label="Permissions"
              multiple
           
              required
            >
           </v-select>

            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="success"
            type="submit"
            @click="submit"
            :loading="loading"
            :disabled="loading"
          >
            <template #loader>
              <v-progress-circular indeterminate size="24" />
            </template>
            {{ mode === 'edit' ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ref, watch } from 'vue';
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { Permission } from '@/types/globalTypes'; // Adjust according to your types
import { useForm } from 'vee-validate';

const props = defineProps<{
  mode: 'create' | 'edit';
  role?: { id: number; name: string; permissions: Permission[] }; // Role type
  permissions: []; // List of available permissions
}>();
// console.log(permissions)
const dialog = ref(false);
const roleName = ref<string>(''); // Define the type for roleName
const selectedPermissions = ref<number[]>([]); // Initialize as an empty array of numbers
const apiError = ref<string | null>(null);
const loading = ref(false);

const { handleSubmit } = useForm({
  validationSchema: {
    // required: (value: string | number[]) => !!value.length || 'This field is required',
  },
});

// Watch for changes in props to populate form data for edit mode
watch(() => props.role, (newVal) => {
  if (props.mode === 'edit' && newVal) {
    roleName.value = newVal.name; // Populate with existing role name

    // Ensure newVal.permissions is defined and an array before mapping
    if (newVal.permissions && Array.isArray(newVal.permissions)) {
      selectedPermissions.value = newVal.permissions.map(permission => permission.id); // Map permission IDs
    } else {
      selectedPermissions.value = []; // Reset if permissions are not defined or not an array
    }
  } else {
    // Reset permissions if mode is create
    selectedPermissions.value = [];
  }
}, { immediate: true });

// Submit handler
const submit = handleSubmit(async () => {
  loading.value = true;
  apiError.value = null;

  const apiUrl = props.mode === 'edit' ? `/roles/${props.role?.id}` : '/roles';
  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';

  try {
    await makeApiCall(apiMethod, apiUrl, {
      name: roleName.value,
      permissions: selectedPermissions.value,
    });
    dialog.value = false;
  } catch (error) {
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


<style scoped>
.text-error {
  color: red;
}
</style>
