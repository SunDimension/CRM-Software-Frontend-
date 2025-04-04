<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import type { Customer, GenericSetUp, PostInflow } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Reactive variables for form inputs
const selectedBank = ref<number | null>(null)
const selectedInflowStatus = ref<number | null>(null)
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)

// Show table flag
const showTable = ref(false)

// Placeholder for fetched inflows and customers
const inflows = ref<PostInflow[]>([])
const customers = ref<Customer[]>([]) // For customer dropdown options

const router = useRouter()
const route = useRoute()

const banks = ref<GenericSetUp[]>([])
const inflowStatuses = ref<GenericSetUp[]>([])

// Dialog management
const dialog = ref(false)
const selectedCustomer = ref<number | null>(null) // Selected customer ID in the dialog
const currentInflow = ref<PostInflow | null>(null)

// Fetch banks, inflow statuses, and customers on mount
onMounted(() => {
  fetchBanksAndInflowStatuses()
  fetchCustomers() // Fetch customers when component mounts
})

const fetchBanksAndInflowStatuses = async () => {
  try {
    const [banksResponse, statusesResponse] = await Promise.all([
      makeApiCall<{ data: GenericSetUp[] }>('GET', '/banks'),
      makeApiCall<{ data: GenericSetUp[] }>('GET', '/inflow-statuses'),
    ])

    banks.value = (banksResponse.data as unknown) as GenericSetUp[]
    inflowStatuses.value = (statusesResponse.data as unknown) as GenericSetUp[]
  }
  catch (error) {
    console.error('Error fetching banks or inflow statuses:', error)
  }
}

const fetchCustomers = async () => {
  try {
    const response = await makeApiCall<Customer[]>('GET', '/customers')

    customers.value = response.data
  }
  catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Function to format inflow date
const formatInflowDate = (date: string | number | Date | undefined): string => {
  if (!date)
    return 'N/A' // Handle undefined or null cases
  const parsedDate = new Date(date)

  return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString() // Check for invalid date
}

const fetchInflows = async (): Promise<void> => {
  if (!selectedBank.value || !selectedInflowStatus.value || !fromDate.value || !toDate.value) {
    alert('Please select a bank, inflow status, and date range.')

    return
  }

  try {
    const response = await makeApiCall<{ data: PostInflow[] }>('POST', '/search-post-inflows', {
      bank_id: selectedBank.value, // Bank ID selected from dropdown
      inflow_status: selectedInflowStatus.value, // Inflow status from the selector
      from_date: fromDate.value, // Date in format 'YYYY-MM-DD'
      to_date: toDate.value,
    })

    console.log('API Response: ', response) // Debugging to check API response

    if (response && Array.isArray(response.data)) {
      inflows.value = response.data // Set the inflows array directly
      showTable.value = true // Show the table after data is fetched
    }
    else {
      inflows.value = [] // Fallback if the response is empty or doesn't have data
    }
  }
  catch (error) {
    console.error('Error fetching inflows:', error)
    alert('An error occurred while fetching inflows. Please try again later.')
    inflows.value = [] // Reset inflows on error
  }
}

const manageInflow = (item: PostInflow) => {
  // Only proceed if the inflow status is 'unclaimed' (ID 6)
  if (selectedInflowStatus.value === 6) {
    currentInflow.value = item
    selectedCustomer.value = null // Reset customer selection
    dialog.value = true
  } else {
    alert("You cannot manage this inflow as it is not 'unclaimed'.")
  }
}

const submitDialog = async () => {
  if (currentInflow.value && selectedCustomer.value) {
    currentInflow.value.customer_id = selectedCustomer.value

    // Redirect to the sales receipt page with the customer ID and inflow details
    // router.push({
    //   name: 'new-receipt',
    //   params: {
    //     no: currentInflow.value.narration || '',
    //     amount: currentInflow.value.amount || 0,
    //     customerId: selectedCustomer.value,
    //     fromInflow: 'true',
    //   },
    // })

    const response = await makeApiCall<{ data: PostInflow[] }>('PUT', `/post-inflows/${currentInflow.value.id}`, currentInflow.value)
    const val = response.data

    dialog.value = false
    fetchInflows()
  }
}

const resetForm = () => {
  selectedBank.value = null
  selectedInflowStatus.value = null
  fromDate.value = null
  toDate.value = null
  showTable.value = false
  inflows.value = []
}

const getBankName = (id: number | undefined): string => {
  const bank = banks.value.find(b => b.id === id)

  return bank ? bank.name : 'Unknown Bank'
}

const getInflowStatusName = (id: number | undefined): string => {
  const status = inflowStatuses.value.find(s => s.id === id)

  return status ? status.name : 'Unknown Status'
}
</script>

<template>
  <VCard>
    <VCardTitle class="headline">
      Inflows
    </VCardTitle>
    <VCardText>
      <div class="form-grid">
        <!-- Bank and Inflow Status Selectors -->
        <VSelect v-model="selectedBank" :items="banks" item-title="name" item-value="id" label="Select Bank" required />
        <VSelect v-model="selectedInflowStatus" :items="inflowStatuses" item-title="name" item-value="id"
          label="Select Inflow Status" required />

        <!-- Date Range -->
        <VTextField v-model="fromDate" label="From Date" type="date" required />
        <VTextField v-model="toDate" label="To Date" type="date" required />
      </div>

      <!-- Buttons -->
      <VBtn color="primary" @click="fetchInflows">
        View
      </VBtn>
      <VBtn color="red" @click="resetForm">
        Cancel
      </VBtn>

      <!-- Inflows Table -->
      <VDataTable v-if="showTable" :headers="[
        { title: 'S/N', value: 'sn' },
        { title: 'Bank', value: 'bank_id' },
        { title: 'Amount', value: 'amount' },
        { title: 'Narration', value: 'narration' },
        { title: 'Status', value: 'inflow_status' },
        { title: 'Date', value: 'inflow_date' },
        { title: 'Manage', value: 'manage', sortable: false },
      ]" :items="inflows" item-key="id">
        <template #item.bank_id="{ item }">
          {{ getBankName(item.bank_id) }}
        </template>
        <template #item.inflow_status="{ item }">
          {{ getInflowStatusName(item.inflow_status) }}
        </template>
        <template #item.inflow_date="{ item }">
          {{ formatInflowDate(item.inflow_date) }}
        </template>
        <template #item.manage="{ item }">
            <VBtn 
      color="primary" 
      @click="manageInflow(item)" 
      :disabled="selectedInflowStatus !== 6"
      v-if="selectedInflowStatus === 6"
    >
      Manage
    </VBtn>
        </template>
      </VDataTable>

      <!-- Manage Dialog with Customer Select -->
      <VDialog v-model="dialog" max-width="600px">
        <VCard>
          <VCardTitle>Manage Inflow</VCardTitle>
          <VCardText>
            <!-- Customer Select Dropdown -->
            <VSelect v-model="selectedCustomer" :items="customers" item-title="name" item-value="id"
              label="Select Customer" required />
          </VCardText>
          <VCardActions>
            <VBtn color="green darken-1" :disabled="!selectedCustomer" @click="submitDialog">
              Save
            </VBtn>
            <VBtn color="red darken-1" @click="dialog = false">
              Cancel
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VCardText>
  </VCard>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
