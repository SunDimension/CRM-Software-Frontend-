<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalProcessModule } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  item: ApprovalProcessModule;
}>();
const dialog = ref(false);
const emits = defineEmits(['updated']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value: string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
    max_approval_count (value: number) {
      if (value >= 1) return true;
      return 'Max Approval Count must be at least 1.';
    },
  },
});

const name = useField('name');
const max_approval_count = useField('max_approval_count');

name.value.value = props.item.name;
max_approval_count.value.value = props.item.max_approval_count;

const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalProcessModule = {
    name: values.name,
    max_approval_count: values.max_approval_count,
  };

  makeApiCall<ApprovalProcessModule>('PUT', `/approval-process-modules/${props.item.id}`, formData)
    .then((response) => {
      console.log('Approval Process Module updated successfully:', response.data);
      emits('updated');
      dialog.value = false;
    })
    .catch((error) => {
      console.error('Error updating Approval Process Module:', error);
    })
    .finally(() => {
      loading.value = false;
    });
});

const loading = ref(false);
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          variant="plain"
          color="pending"
        >
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <v-card title="Edit Approval Process Module">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name.value.value"
              :error-messages="name.errorMessage.value"
              label="Name"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="max_approval_count.value.value"
              :error-messages="max_approval_count.errorMessage.value"
              label="Max Approval Count"
              type="number"
              required
            ></v-text-field>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
              <v-btn
                color="success-darken-1"
                type="submit"
                text="Update"
                variant="tonal"
                :loading="loading"
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
