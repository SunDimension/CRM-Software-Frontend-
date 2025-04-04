
<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalType } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

const dialog = ref(false);
const emits = defineEmits(['created']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name(value: string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
    description(value: string) {
      if (value?.length >= 4) return true;
      return 'Description needs to be at least 4 characters.';
    },
  },
});

const name = useField('name');
const description = useField('description');

const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalType = {
    name: values.name,
    description: values.description,
  };

  makeApiCall<ApprovalType>('POST', '/approval-types', formData)
    .then((response) => {
      console.log('Approval Type created successfully:', response.data);
      emits('created');
      dialog.value = false;
    })
    .catch((error) => {
      console.error('Error creating approval type:', error);
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
        <v-btn v-bind="activatorProps" variant="tonal" color="success-darken-1">
          Add Approval Type
        </v-btn>
      </template>

      <v-card title="Create Approval Type">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name.value.value"
              :error-messages="name.errorMessage.value"
              label="Name"
              required
            ></v-text-field>

            <v-textarea
              v-model="description.value.value"
              :error-messages="description.errorMessage.value"
              label="Description"
              rows="4"
              required
            ></v-textarea>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>
      
              <v-btn text="Close" variant="plain" @click="dialog.value = false"></v-btn>
      
              <v-btn color="success-darken-1" type="submit" text="Create" variant="tonal" :loading="loading.value">
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

<script lang="ts">
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script>
