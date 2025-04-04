<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalProcessType } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  item: ApprovalProcessType;
}>();

const dialog = ref(false);
const emits = defineEmits(['updated']);

// Form validation schema and fields
const { handleSubmit } = useForm({
  validationSchema: {
    name(value: string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
    // description(value: string) {
    //   if (value?.length >= 10) return true;
    //   return 'Description needs to be at least 10 characters.';
    // },
  },
});

const name = useField('name');
// const description = useField('description');

name.value.value = props.item.name;
// description.value.value = props.item.description;

// Submit handler
const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalProcessType = {
    name: values.name,
    description: values.description,
  };

  makeApiCall<ApprovalProcessType>('PUT', `/approval-process-types/${props.item.id}`, formData)
    .then((response) => {
      console.log('Approval Process Type updated successfully:', response.data);
      emits('updated');
      dialog.value = false;
    })
    .catch((error) => {
      console.error('Error updating approval process type:', error);
    })
    .finally(() => {
      loading.value = false;
    });
});

// Loading state
const loading = ref(false);

</script>

<template>
  <div class="pa-4 text-center">
    <!-- Trigger Button for Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" variant="plain" color="warning">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <!-- Dialog for Edit Form -->
      <v-card title="Edit Approval Process Type">
        <v-card-text>
          <form @submit.prevent="submit">
            <!-- Name Field -->
            <v-text-field
              v-model="name.value.value"
              :error-messages="name.errorMessage.value"
              label="Name"
              required
            ></v-text-field>

            <!-- Description Field -->
            <!-- <v-textarea
              v-model="description.value"
              :error-messages="description.errorMessage.value"
              label="Description"
              rows="4"
              required
            ></v-textarea> -->

            <v-spacer class="my-5"></v-spacer>

            <!-- Form Actions -->
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
