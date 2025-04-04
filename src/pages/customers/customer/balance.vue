<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { type Branch, type CustomerResource, type GenericSetUp, formatNumber } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';

// Reactive references
const search = ref('')
const currentPage = ref<number>(1)
const data = ref<Customer[]>([])
const filteredData = ref<Customer[]>([])
const titles = ref<GenericSetUp[]>([])
const customerTypes = ref<GenericSetUp[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Full Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Phone Number', key: 'phone_number' },
  { title: 'Customer Type', key: 'customer_type' },
  { title: 'Branch', key: 'branch' },
  { title: 'Deposit Balance (₦)', key: 'total_inflow_outflow' },
  { title: 'Credit Balance (₦)', key: 'total_credit_payment' },
  { title: '', key: 'actions', sortable: false },
])

const fetchData = async () => {
  try {
    loading.value = true

    const customerResponse = await makeApiCall<CustomerResource[]>('GET', '/customer-balances')

    // const titleResponse = await makeApiCall<GenericSetUp[]>('GET', '/titles');
    const customerTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/customer-types')
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches')

    // Assign the API data to ref variables
    // titles.value = titleResponse.data
    customerTypes.value = customerTypeResponse.data
    branches.value = branchResponse.data

    // Process customer data
    data.value = customerResponse.data.map((customer: CustomerResource, index: number) => ({
      sn: index + 1,
      ...customer,
    }))

    handleFilter()
  }
  catch (error) {
    console.error('Error fetching data:', error)

    // Consider adding user feedback for error
  }
  finally {
    loading.value = false
  }
}

const handleFilter = () => {
  filteredData.value = data.value.filter((customer: any) => {
    return customer.name.toLowerCase().includes(search.value.toLowerCase())
  })
}

const handleUpdated = () => {
  fetchData()
}

onMounted(fetchData)
</script>

<template>
  <VRow>
    <VCard flat>
      <VCardTitle class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Customer Balances
        <VSpacer />
        <VTextField v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line />
      </VCardTitle>

      <VDataTable v-if="filteredData && !loading" :headers="headers" :items="filteredData" sticky-header>
        <template #item.sn="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.name="{ item }">
          {{ item.name ?? 'N/A' }}
        </template>

        <template #item.address="{ item }">
          {{ item.address ?? 'N/A' }}
        </template>

        <template #item.phone_number="{ item }">
          {{ item.phone_number ?? 'N/A' }}
        </template>

        <template #item.branch="{ item }">
          {{ branches.find(bc => bc.id === item.branch_id)?.name ?? 'N/A' }}
        </template>

        <template #item.customer_type="{ item }">
          {{ customerTypes.find(ct => ct.id === item.customer_type_id)?.name ?? 'N/A' }}
        </template>

        <template #item.total_inflow_outflow="{ item }">
          <div class="text-right">
            {{ formatNumber(Number(item.total_inflow) - Number(item.total_outflow)) ?? 'N/A' }}
          </div>
        </template>

        <template #item.total_credit_payment="{ item }">
          <div class="text-right">
            {{ formatNumber(item.total_credit - item.total_payment) ?? 'N/A' }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <VRow justify="end" style="flex-wrap:nowrap">
            <a :href="`/customers/statement/${item.id}`">View Statement</a>
          </VRow>
        </template>
      </VDataTable>

      <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
        <VProgressCircular indeterminate size="180" />
      </div>
    </VCard>
  </vrow>
</template>
