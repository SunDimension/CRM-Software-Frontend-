<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'
import type { Branch, GenericSetUp, Store, User } from '@/types/globalTypes'
import { useField, useForm } from 'vee-validate'
import { onMounted, reactive, ref } from 'vue'
import * as yup from 'yup'

// Form visibility and messages
const showDialog = ref(false)
let message = ''


// Reactive variables for dropdowns
const stores = ref<Store[]>([])
const discrepancies = ref<GenericSetUp[]>([])
const users = ref<User[]>([])
// Auth and branch setup
const useAuth = useAuthStore()
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null

// Set up branch and user details
const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch })
const user = ref({ id: parsedUser.id, name: parsedUser.name })

// Reactive form values
const formValues = reactive({
  cash_discrepancy_id: null,
  cash_discrepancy_name: discrepancies.value,
  branch_id: branch.value.id,
  branch_name: branch.value.name,
  user_id: user.value.id,
  user_name: user.value.name,

  // approved_by: null,

  amount: 0,
  discrepancy_amount: 0,
   date: new Date().toISOString().slice(0, 10),
  store_id: null,
  created_at: new Date(),
})

// const cash_discrepancy_id = useField('cash_discrepancy_id')
// const branch_id = useField('branch_id')
// const store_id = useField('store_id')
// const amount = useField('amount')
// const discrepancy_amount = useField('discrepancy_amount')
// const approved_by = useField('approved_by')
// const approval_date = useField('approval_date')
// const date = useField('date')

// Validation schema
const validationSchema = yup.object({
  //   cash_discrepancy_id: yup
  //     .number()
  //     .required('Discrepancy ID is required.')
  //     .typeError('Discrepancy ID must be a number.'),
  //   store_id: yup.number().required('Store is required.'),
  //   approved_by: yup.number().required('Approved By is required.'),
  //   approval_date: yup.date().required('Approval Date is required.').typeError('Approval Date must be valid.'),
  //   amount: yup
  //     .number()
  //     .required('Amount is required.')
  //     .typeError('Amount must be a number.'),
  //   discrepancy_amount: yup
  //     .number()
  //     .required('Discrepancy amount is required.')
  //     .typeError('Discrepancy amount must be a number.'),
  //   date: yup.date().required('Date is required.').typeError('Date must be valid.'),
})

// Using vee-validate's useForm
const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: formValues,
})

// Reactive variables for dropdowns


const cash_discrepancy_id = useField('cash_discrepancy_id')
const discrepancy_amount = useField('discrepancy_amount')

const store_id = useField('store_id')
const amount = useField('amount')
const date = useField('date')
const approved_by = useField('approved_by')

// Fetch Stores
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`)

    stores.value = response.data

    // stores_filtered.value = stores.value.filter(item => item.store_type_id === 2);
  }
  catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Fetch Discrepancy Lines
const fetchDiscrepancies = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/cash-discrepancies')

    discrepancies.value = response.data
  }
  catch (error) {
    console.error('Error fetching discrepancies:', error)
  }
}

// Fetch Users
const fetchUsers = async () => {
  try {
    const response = await makeApiCall<User[]>('GET', '/users')

    users.value = response.data
  }
  catch (error) {
    console.error('Error fetching users:', error)
  }
}

// Submit handler
const submitForm = handleSubmit(async values => {
  try {
    await makeApiCall('POST', '/cashier-remittances', values)
    showDialog.value = true
    message = 'Cashier Remittance created successfully'
  }
  catch (error) {
    console.error('Error creating Cashier Remittance:', error)
  }
})

// Fetch data on mount
onMounted(() => {
  fetchStores()
  fetchDiscrepancies()
  fetchUsers()
})
</script>

<template>
  <VCard title="Cashier Remittance Form">
    <VCardText>
      <form @submit="submitForm">
        <div class="form-grid">
          <!-- Cash Discrepancy Dropdown -->
          <VSelect v-model="cash_discrepancy_id.value.value" :items="discrepancies" item-title="name" item-value="id"
            label="Select Cash Discrepancy" required />

          <!-- Store Dropdown -->
          <VSelect v-model="store_id.value.value" :items="stores" item-title="name" item-value="id" label="Select Store"
            required />

          <!-- Amount Input -->
          <VTextField v-model="amount.value.value" label=" Remittance Amount" type="number" required />

          <!-- Discrepancy Amount Input -->
          <VTextField v-model="discrepancy_amount.value.value" label="Discrepancy Amount" type="number" required />

          <!-- Date Input -->
          <VTextField v-model="formValues.date" label="Date" type="date" required />

          <!-- Approved By Dropdown -->
          <!--
            <VSelect v-model="formValues.approved_by" :items="users" item-title="name" item-value="id" label="Approved By"
            required />
          -->

          <!-- Approval Date Input -->
          <!--
            <VTextField
            v-model="formValues.approval_date"
            label="Approval Date"
            type="date"
            required
            />
          -->

          <!-- Read-only Branch Name -->
          <VTextField v-model="formValues.branch_name" label="Branch Name" readonly />

          <!-- Read-only User Name -->
          <VTextField v-model="formValues.user_name" label="User Name" readonly />
        </div>

        <VBtn type="button" color="red" @click="$emit('cancel')">
          Cancel
        </VBtn>
        <VBtn type="submit" :loading="isSubmitting">
          Submit
        </VBtn>
      </form>
    </VCardText>
  </VCard>

  <VDialog v-model="showDialog" persistent max-width="400">
    <VCard>
      <VCardTitle class="headline">
        Notification
      </VCardTitle>
      <VCardText>{{ message }}</VCardText>
      <VCardActions>
        <VBtn color="primary" @click="showDialog = false">
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
