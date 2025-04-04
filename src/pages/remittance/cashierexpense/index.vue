<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, Store, User } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { computed, onMounted, reactive, ref } from 'vue';
import * as yup from 'yup';

const showDialog = ref(false);
let message = "";

// Auth Store
const useAuth = useAuthStore();
const user = computed<User>(() => useAuth.getUserDetails?.user);
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;
const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch });
const users = ref<User[]>([]);
// Reactive form values
const formValues = reactive({
  expense_line_id: null,
  store_id: null,
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  branch_id: branch.value.id,
  branch_name: branch.value.name,
  user_id: parsedUser?.id || null,
  user_name: parsedUser?.name || null,
  narration: null,
  // approval_date: new Date(),
  created_at: new Date(),
});

// Validation schema
const validationSchema = yup.object({
  // expense_line_id: yup.number().required('Expense Line is required.'),
  // store_id: yup.number().required('Store is required.'),
  // amount: yup.number().required('Amount is required.').typeError('Amount must be a number.'),
  // date: yup.date().required('Expense date is required.').typeError('Date must be a valid date.'),
  // approved_by: yup.number().required('Approval by is required.'),
  // approval_date: yup.date().required('Approval date is required.').typeError('Approval date must be a valid date.'),
});

// Using vee-validate's useForm
const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: formValues,
});

// Reactive variables for dropdowns
const stores = ref<Store[]>([]);
const expenseLines = ref<GenericSetUp[]>([]);
// const users = ref<User[]>([]); // To store users for the approval dropdown

// Fields
const expense_line_id = useField('expense_line_id');
const store_id = useField('store_id');
const amount = useField('amount');
const narration = useField('narration');
const date = useField('date');
const approved_by = useField('approved_by');


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

// Fetch Expense Lines
const fetchExpenseLines = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/expense-lines');
    expenseLines.value = response.data;
  } catch (error) {
    console.error('Error fetching expense lines:', error);
  }
};

// Fetch Users for Approval Dropdown
const fetchUsers = async () => {
  try {
    const response = await makeApiCall<User[]>('GET', '/users');
    users.value = response.data.map((user) => ({
      ...user,
      id: user.id, // Ensuring `id` exists for item-value
      name: user.name, // Ensuring `name` exists for item-title
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// Submit handler
const submitForm = handleSubmit(async (values, { resetForm }) => {
  try {
    await makeApiCall('POST', '/cashier-expenses', values);
    showDialog.value = true;
    message = "Cash Expense created successfully";

    // Reset the form after successful submission
    resetForm();
  } catch (error) {
    console.error('Error creating Cash Expense:', error);
  }
});


// Fetch data on mount
onMounted(() => {
  fetchStores();
  fetchExpenseLines();
  fetchUsers(); // Fetch users when the form is mounted
});
</script>

<template>
  <v-card title="Cash Expense Form">
    <v-card-text>
      <!-- Use @submit.prevent="submitForm" to ensure proper form submission -->
      <form @submit="submitForm">
        <div class="form-grid">
          <!-- Expense Line Dropdown -->
          <v-select v-model="expense_line_id.value.value" :items="expenseLines" item-title="name" item-value="id"
            label="Select Expense Line" required></v-select>

          <!-- Store Dropdown -->
          <v-select v-model="store_id.value.value" :items="stores" item-title="name" item-value="id"
            label="Select Store" required></v-select>

          <!-- Amount Input -->
          <v-text-field v-model="amount.value.value" label="Amount" type="number" required></v-text-field>
          <v-text-field v-model="narration.value.value" label="Narration" type="text" required></v-text-field>
          <!-- Date Input -->
          <v-text-field v-model="formValues.date" label="Date" type="date" required />

          <!-- Approved By Dropdown -->
          <!-- <v-select v-model="formValues.approved_by" :items="users" item-title="name" item-value="id"
            label="Approved By" required></v-select> -->

          <!-- Approval Date Input -->
          <!-- <v-text-field v-model="formValues.approval_date" label="Approval Date" type="date" required></v-text-field> -->

          <!-- Readonly Fields -->
          <v-text-field v-model="formValues.branch_name" label="Branch Name" readonly></v-text-field>

          <v-text-field v-model="formValues.user_name" label="User Name" readonly></v-text-field>
        </div>

        <v-btn type="button" @click="$emit('cancel')" color="red">Cancel</v-btn>
        <!-- Change type="submit" to trigger form submission -->
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
