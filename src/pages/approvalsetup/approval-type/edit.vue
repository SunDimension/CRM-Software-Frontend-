<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalType } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  item: ApprovalType;
}>();

const dialog = ref(false);
const emits = defineEmits(['updated']);

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

// Populate the fields with existing values
name.value.value = props.item.name;
description.value.value = props.item.description;

const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalType = {
    name: values.name,
    description: values.description,
  };

  makeApiCall<ApprovalType>('PUT', `/approval-types/${props.item.id}`, formData)
    .then((response) => {
      console.log('Approval Type updated successfully:', response.data); 
      emits('updated'); 
      dialog.value = false;
    })
    .catch((error) => {
      console.error('Error updating approval type:', error);
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
        <v-btn v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>
      
      <v-card title="Edit Approval Type">
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
      
              <v-btn color="success-darken-1" type="submit" text="Update" variant="tonal" :loading="loading.value">
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
