<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { JournalType } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  item: JournalType;
}>();
const dialog = ref(false);
const emits = defineEmits(['updated']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value: string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
    sign (value: number) {
      if (value === -1 || value === 1) return true;
      return 'Sign must be -1 or 1.';
    }
  },
});

const name = useField('name');
const sign = useField('sign');

name.value = props.item.name;
sign.value = props.item.sign;

const submit = handleSubmit((values) => {
  const formData: JournalType = {
    name: values.name,
    sign: values.sign,
  };

  makeApiCall<JournalType>('PUT', `/journal-types/${props.item.id}`, formData)
    .then((response) => {
      emits('updated');
      dialog.value = false;
    })
    .finally(() => {
      handleReset();
    });
});

const loading = ref(false);
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <v-card title="Edit Journal Type">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name.value"
              :error-messages="name.errorMessage"
              label="Name"
              required
            ></v-text-field>

            <v-select
              v-model="sign.value"
              :items="[-1, 1]"
              :error-messages="sign.errorMessage"
              label="Sign"
              required
            ></v-select>

            <v-spacer class="my-5"></v-spacer>

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
