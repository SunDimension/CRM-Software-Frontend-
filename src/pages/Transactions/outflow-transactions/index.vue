<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Customer, GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { onMounted, reactive, ref } from 'vue';
import * as yup from 'yup';

// State variables
const showDialog = ref(false);
let message = "";

// Reactive form values
let formValues = reactive({
  id: 0,
  org_bank: '',
  customer_id: '',
  account_name: '',
  account_number: '',
  bene_bank: '',
  amount: 0,
  narration: '',
  outflow_date: new Date(),
  outflow_mode: '',
});

// Validation schema
const validationSchema = yup.object({
  org_bank: yup.number().required('Originating bank is required.'),
  customer_id: yup.string().required('Customer is required.'),
  account_name: yup.string(),
  account_number: yup.number().required('Account number is required.').typeError('Account number must be a number.'),
  bene_bank: yup.number().required('Beneficiary bank is required.'),
  amount: yup.number().required('Amount is required.').typeError('Amount must be a number.'),
  narration: yup.string(),
  outflow_date: yup.date().required('Outflow date is required.').typeError('Outflow date must be a valid date.'),
  outflow_mode: yup.number().required('Outflow mode is required.'),
});

// Using vee-validate's useForm
const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: formValues,
});

// Reactive variables for dropdowns
const banks = ref<GenericSetUp[]>([]);
const customers = ref<Customer[]>([]);
const outflowModes = ref<GenericSetUp[]>([]);

// Fields
const org_bank = useField('org_bank');
// const customer_id = useField('beneficiary');
const account_name = useField('account_name');
const account_number = useField('account_number');
const bene_bank = useField('bene_bank');
const amount = useField('amount');
const narration = useField('narration');
const outflow_date = useField('outflow_date');
const outflow_mode = useField('outflow_mode');

// Fetch Banks and Outflow Modes
const fetchBanks = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/banks');
    banks.value = response.data;
  } catch (error) {
    console.error('Error fetching banks:', error);
  }
};

const fetchOutflowModes = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/outflow-modes');
    outflowModes.value = response.data;
  } catch (error) {
    console.error('Error fetching outflow modes:', error);
  }
};

const fetchCustomers = async () => {
  try {
    const response = await makeApiCall<Customer[]>('GET', '/customers');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

// Submit handler
const submitForm = handleSubmit(async (values) => {
  try {
    await makeApiCall('POST', '/post-outflows', values);
    showDialog.value = true;
    message = "Post Outflow created successfully";
  } catch (error) {
    console.error('Error creating Post Outflow:', error);
  }
});

// Fetch data on mount
onMounted(() => {
  fetchBanks();
  fetchOutflowModes();
  fetchCustomers();
});
</script>

<template>
  <v-card title="Post Outflow Form">
    <v-card-text>
      <form @submit="submitForm">
        <div class="form-grid">
          <v-select v-model="org_bank.value.value" :items="banks" item-title="name" item-value="id"
            label="Select Originating Bank" required></v-select>

          <v-select v-model="customers" :items="customers" item-title="name" item-value="id" label="Select Customer"
            required></v-select>

          <v-text-field v-model="account_name.value.value" label="Account Name"></v-text-field>

          <v-text-field v-model="account_number.value.value" label="Account Number" type="number"
            required></v-text-field>

          <v-select v-model="bene_bank.value.value" :items="banks" item-title="name" item-value="id"
            label="Select Beneficiary Bank" required></v-select>

          <v-text-field v-model="amount.value.value" label="Amount" type="number" required></v-text-field>

          <v-textarea v-model="narration.value.value" label="Narration"></v-textarea>

          <v-text-field v-model="outflow_date.value.value" label="Outflow Date" type="date"></v-text-field>

          <v-select v-model="outflow_mode.value.value" :items="outflowModes" item-title="name" item-value="id"
            label="Select Outflow Mode" required></v-select>
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
        <v-btn color="primary" @click="showDialog = false">Close</v-btn>
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
