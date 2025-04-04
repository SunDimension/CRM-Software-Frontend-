<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, PostInflow } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { defineEmits, defineProps, ref, watch } from 'vue';

// Define props
const props = defineProps<{
  banks: Gs[]; // Generic setup for banks
  mode: 'create' | 'edit';
  post_inflow?: { id: number; amount: number; narration?: string; bank_id: number; inflow_status: number, inflow_date: Date }; // Optional inflow for edit mode
}>();

const apiError = ref<string | null>(null);
const emits = defineEmits(['inflowCreated']);
const dialog = ref(false);
const loading = ref(false);

// Form setup using vee-validate
const { handleSubmit } = useForm();
const amount = useField('amount');
const narration = useField('narration');
const inflow_date = useField('inflow_date');
const selectedBank = ref<Gs | null>(null);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.post_inflow) {
    amount.value.value = props.post_inflow.amount;
    inflow_date.value.value = props.post_inflow.inflow_date || '';
    narration.value.value = props.post_inflow.narration || '';
    selectedBank.value = props.banks.find(bank => bank.id === props.post_inflow?.bank_id) ?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.post_inflow, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Bank') {
    selectedBank.value = value;
  }
};

// Submit function
const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;

  const formData = {
    amount: values.amount,
    narration: values.narration,
    inflow_date: values.inflow_date,
    bank_id: selectedBank.value?.id ?? 0,
    inflow_status: 'Unclaimed', // Default inflow status as "Unclaimed"
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/post-inflows/${props.post_inflow?.id}` : `/post-inflows`;
  
  makeApiCall<PostInflow>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('inflowCreated');
      dialog.value = false;
    })
    .catch(() => {
      apiError.value = "An unexpected error occurred.";
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>






<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          :text="`Create Inflow`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          variant="plain"
        >
          <v-icon icon="mdi-pencil" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Inflow' : 'Create Inflow'">
        <v-card-text>
          <form @submit.prevent="submit">
            <!-- Inflow Amount Field -->
            <v-text-field
              v-model="amount.value.value"
              label="Inflow Amount*"
              type="number"
              required
              :error-messages="amount.errorMessage.value"
              class="mb-5"
            ></v-text-field>

            <!-- Narration Field -->
            <v-textarea
              v-model="narration.value.value"
              label="Narration"
              rows="3"
            ></v-textarea>

            <!-- Bank Selector -->
            <filterSelect
              :genericOptions="banks"
              :label_cus="'Select Bank*'"
              @optionSelected="(item) => handleOptionSelected(item, 'Bank')"
              v-model="selectedBank"
            />

            <!-- Inflow Date -->
            <v-text-field
              v-model="inflow_date.value.value"
              label="Inflow Date*"
              type="date"
              class="mb-5"
            ></v-text-field>

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
                :text="mode === 'edit' ? 'Update Inflow' : 'Create Inflow'"
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




<style scoped>
/* Add your styles here if necessary */
.text-error {
  color: red;
}
</style>

