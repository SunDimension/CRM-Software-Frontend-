<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { onMounted, reactive, ref } from 'vue';
import * as yup from 'yup';

const showDialog = ref(false);
let message = "";

// Reactive form values
let formValues = reactive({
    bank_id: '',
    amount: 0,
    narration: '',
    inflow_date: new Date(),
    // inflow_status is no longer needed in the form, setting it in submit logic
});

// Validation schema
const validationSchema = yup.object({
    bank_id: yup.number().required('Bank is required.'),
    amount: yup.number().required('Amount is required.').typeError('Amount must be a number.'),
    narration: yup.string().required('Narration is required.'),
    inflow_date: yup.date().required('Inflow date is required.').typeError('Inflow date must be a valid date.'),
});

// Using vee-validate's useForm
const { handleSubmit, isSubmitting } = useForm({
    validationSchema,
    initialValues: formValues,
});

// Reactive variables for dropdowns
const banks = ref<GenericSetUp[]>([]);

// Fields
const bank_id = useField('bank_id');
const amount = useField('amount');
const narration = useField('narration');
const inflow_date = useField('inflow_date');

// Fetch Banks
const fetchBanks = async () => {
    try {
        const response = await makeApiCall<GenericSetUp[]>('GET', '/banks');
        banks.value = response.data;
    } catch (error) {
        console.error('Error fetching banks:', error);
    }
};

// Submit handler
const submitForm = handleSubmit(async (values) => {
    try {
        // Automatically set inflow_status to "Unclaimed" (assuming its ID is known, e.g., 1)
        const inflowData = {
            ...values,
            inflow_status: 1,  // Assuming 1 corresponds to "Unclaimed"
        };

        await makeApiCall('POST', '/post-inflows', inflowData);
        showDialog.value = true;
        message = "Post Inflow created successfully";
    } catch (error) {
        console.error('Error creating Post Inflow:', error);
    }
});

// Fetch data on mount
onMounted(() => {
    fetchBanks();
});
</script>

<template>
  <v-card title="Post Inflow Form">
    <v-card-text>
      <form @submit="submitForm">
        <div class="form-grid">
          <v-select
            v-model="bank_id.value.value"
            :items="banks"
            item-title="name"
            item-value="id"
            label="Select Bank"
            required
          ></v-select>

          <v-text-field
            v-model="amount.value.value"
            label="Amount"
            type="number"
            required
          ></v-text-field>

          <v-textarea
            v-model="narration.value.value"
            label="Narration"
          ></v-textarea>

          <v-text-field
            v-model="inflow_date.value.value"
            label="Inflow Date"
            type="date"
          ></v-text-field>
        </div>

        <v-btn type="button" @click="$emit('cancel')" color="red">Cancel</v-btn>
        <v-btn type="submit" :loading="isSubmitting">Submit</v-btn>
      </form>
    </v-card-text>
  </v-card>

  <v-dialog v-model="showDialog" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Notification</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-btn color="primary"  @click="showDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
