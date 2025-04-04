<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, Store } from '@/types/globalTypes';
import { onMounted, reactive, ref } from 'vue';

// Form visibility and messages
const showDialog = ref(false);
let message = "";

// Auth and branch setup
const useAuth = useAuthStore();
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

// Set up branch and user details
const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch });
const user = ref({ id: parsedUser.id, name: parsedUser.name });
const stores = ref<Store[]>([]);
const banks = ref<GenericSetUp[]>([]);

// Reactive form values
const formValues = reactive({
  bank_id: null,
  bank_name: banks.value, // Bank selection
  store_id: null, // Store selection
  account_number: '', // Account number
  amount: 0, // Amount for remittance
  date: new Date().toISOString().slice(0, 10), // Date formatted for input[type="date"]
  branch_id: branch.value.id, // Branch ID
  user_id: user.value.id, // User ID
  branch_name: branch.value.name, // Branch name
  user_name: user.value.name, // User name
});

// Reactive variables for dropdowns


// Fetch Stores
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`);
    stores.value = response.data;
    // stores_filtered.value = stores.value.filter(item => item.store_type_id === 2);
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

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
const submitForm = async () => {
  console.log('Submitting form with values:', formValues); // Debugging: Log payload
  try {
    await makeApiCall('POST', '/bank-remittances', formValues);
    showDialog.value = true;
    message = "Bank Remittance created successfully";
  } catch (error) {
    console.error('Error creating Bank Remittance:', error);
  }
};

// Fetch data on mount
onMounted(() => {
  fetchStores();
  fetchBanks();
});
</script>

<template>
  <v-card title="Bank Remittance Form">
    <v-card-text>
      <form @submit.prevent="submitForm">
        <div class="form-grid">
          <!-- Bank Dropdown -->
          <v-select
            v-model="formValues.bank_id"
            :items="banks"
            item-title="name"
            item-value="id"
            label="Select Bank"
            required
          />

          <!-- Account Number Input -->
          <v-text-field
            v-model="formValues.account_number"
            label="Account Number"
            type="text"
            required
          />

          <!-- Store Dropdown -->
          <v-select
            v-model="formValues.store_id"
            :items="stores"
            item-title="name"
            item-value="id"
            label="Select Store"
            required
          />

          <!-- Amount Input -->
          <v-text-field
            v-model="formValues.amount"
            label="Amount"
            type="number"
            required
          />

          <!-- Date Input -->
          <v-text-field
            v-model="formValues.date"
            label="Date"
            type="date"
            required
          />

          <!-- Read-only Branch Name -->
          <v-text-field
            v-model="formValues.branch_name"
            label="Branch Name"
            readonly
          />

          <!-- Read-only User Name -->
          <v-text-field
            v-model="formValues.user_name"
            label="User Name"
            readonly
          />
        </div>

        <v-btn type="button" @click="$emit('cancel')" color="red">
          Cancel
        </v-btn>
        <v-btn type="submit">
          Submit
        </v-btn>
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
