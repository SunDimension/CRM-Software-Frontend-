<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalProcessModule } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{}>();
const dialog = ref(false);
const emits = defineEmits(['created']);

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

const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalProcessModule = {
    name: values.name,
    max_approval_count: values.max_approval_count,
  };

  makeApiCall<ApprovalProcessModule>('POST', `/approval-process-modules`, formData)
    .then((response) => {
      console.log(response.data);
      emits('created');
      dialog.value = false;
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
          class="text-none font-weight-regular"
          color="success-darken-1"
          text="Add Approval Process Module"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card title="Create Approval Process Module">
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
                text="Create"
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
