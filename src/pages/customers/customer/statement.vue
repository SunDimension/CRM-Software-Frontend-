<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import type { Branch, CreditTransactionResource, CustomerResource, GenericSetUp, PostInflow, PostOutflow } from '@/types/globalTypes'
import { formatDate, formatNumber } from '@/types/globalTypes'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Reactive references
const search = ref('')
const currentPage = ref<number>(1)
const data = ref<CustomerResource>()
const outflowModes = ref<GenericSetUp[]>([])
const filteredData = ref<PostInflow[]>([])
const filteredDataOutflow = ref<PostOutflow[]>([])
const filteredDataCredit = ref<CreditTransactionResource[]>([])
const banks = ref<GenericSetUp[]>([])
const customerTypes = ref<GenericSetUp[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)

const salesOrderNo = route.params.no

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Date', key: 'name' },

  // { title: 'Address', key: 'address' },
  // { title: 'Phone Number', key: 'phone_number' },
  { title: 'Bank', key: 'customer_type' },

  // { title: 'Branch', key: 'branch' },
  { title: 'Amount (₦)', key: 'total_inflow_outflow' },

  // { title: 'Credit Balance (₦)', key: 'total_credit_payment' },
  // { title: '', key: 'actions', sortable: false },
])

const headers3 = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Date', key: 'name' },

  // { title: 'Address', key: 'address' },
  // { title: 'Phone Number', key: 'phone_number' },
  { title: 'Mode', key: 'outflow_mode' },
  { title: 'Bank', key: 'customer_type' },

  // { title: 'Branch', key: 'branch' },
  { title: 'Amount (₦)', key: 'total_inflow_outflow' },

  // { title: '', key: 'actions', sortable: false },
])

const headers2 = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Type', key: 'type' },
  { title: 'Date', key: 'date' },
  { title: 'Credit Limit', key: 'credit_limit' },
  { title: 'Balance Before Transaciton', key: 'credit_limit_before' },
  { title: 'Amount', key: 'amount' },

  // { title: 'Deposit Balance (₦)', key: 'total_inflow_outflow' },
  // { title: 'Credit Balance (₦)', key: 'total_credit_payment' },
  // { title: '', key: 'actions', sortable: false },
])

const activeTab = ref(0)

const tabs = ref([
  { id: 1, name: 'tab1', label: 'Inflow Transactions', content: 'This is the overview content.' },
  { id: 3, name: 'tab3', label: 'Outflow Transactions', content: 'This is the overview content.' },
  { id: 2, name: 'tab2', label: 'Credit Transactions', content: 'Here are the details.' },

  // { id: 3, name: 'tab3', label: 'Settings', content: 'Customize your settings here.' },
])

const fetchData = async () => {
  try {
    loading.value = true

    const customerResponse = await makeApiCall<CustomerResource>('GET', `/customer-balance-history/${salesOrderNo}`)

    const titleResponse = await makeApiCall<GenericSetUp[]>('GET', '/outflow-modes')
    const bankResponse = await makeApiCall<GenericSetUp[]>('GET', '/banks')
    const customerTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/customer-types')
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches')

    // Assign the API data to ref variables
    // titles.value = titleResponse.data
    outflowModes.value = titleResponse.data
    customerTypes.value = customerTypeResponse.data
    branches.value = branchResponse.data
    banks.value = bankResponse.data

    // Process customer data
    data.value = customerResponse.data
    filteredData.value = data.value?.inflows
    filteredDataOutflow.value = data.value?.outflows
    filteredDataCredit.value = data.value?.creditTransactions

    // handleFilter()
  }
  catch (error) {
    console.error('Error fetching data:', error)

    // Consider adding user feedback for error
  }
  finally {
    loading.value = false
  }
}

// const handleFilter = () => {
//   filteredData.value = data.value?.inflows.filter((customer: any) => {
//     return customer.name.toLowerCase().includes(search.value.toLowerCase())
//   })
// }

const handleUpdated = () => {
  fetchData()
}

onMounted(fetchData)
</script>

<template>
  <VCard>
    <VCardText>
      <h2>Statement of Account for {{ data?.firstname }} {{ data?.middlename }} {{ data?.surname }} </h2>
      <!-- Tabs Navigation -->
      <VTabs v-model="activeTab" grow>
        <VTab v-for="(tab, index) in tabs" :key="index">
          {{ tab.label }}
        </VTab>
      </VTabs>

      <!-- Tabs Content -->
      <div v-show="activeTab === 0">
        <VCard>
          <VCardText>
            <VDataTable v-if="filteredData && !loading" :headers="headers" :items="filteredData" sticky-header>
              <template #item.sn="{ index }">
                {{ index + 1 }}
              </template>

              <template #item.name="{ item }">
                {{ formatDate(item.inflow_date) ?? 'N/A' }}
              </template>

              <template #item.customer_type="{ item }">
                {{ banks.find(ct => ct.id === item.bank_id)?.name ?? 'N/A' }}
              </template>

              <template #item.total_inflow_outflow="{ item }">
                <div class="text-right">
                  {{ formatNumber(Number(item.amount)) ?? 'N/A' }}
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </div>
      <div v-show="activeTab === 1">
        <VCard>
          <VCardText>
            <VDataTable v-if="filteredData && !loading" :headers="headers3" :items="filteredDataOutflow" sticky-header>
              <template #item.sn="{ index }">
                {{ index + 1 }}
              </template>

              <template #item.name="{ item }">
                {{ formatDate(item.outflow_date) ?? 'N/A' }}
              </template>

              <template #item.customer_type="{ item }">
                {{ banks.find(ct => ct.id === item.bene_bank)?.name ?? 'N/A' }}
              </template>
              <template #item.outflow_mode="{ item }">
                {{ outflowModes.find(ct => ct.id === item.outflow_mode)?.name ?? 'N/A' }}
              </template>

              <template #item.total_inflow_outflow="{ item }">
                <div class="text-right">
                  {{ formatNumber(Number(item.amount)) ?? 'N/A' }}
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </div>
      <div v-show="activeTab === 2">
        <VCard>
          <VCardText>
            <VDataTable v-if="filteredData && !loading" :headers="headers2" :items="filteredDataCredit" sticky-header>
              <template #item.sn="{ index }">
                {{ index + 1 }}
              </template>

              <template #item.date="{ item }">
                {{ formatDate(item.created_at) ?? 'N/A' }}
              </template>

              <template #item.type="{ item }">
                {{ item.type ?? 'N/A' }}
              </template>

              <template #item.credit_limit_before="{ item }">
                <div class="text-right">
                  {{ formatNumber(Number(item.credit_balance_before)) ?? 'N/A' }}
                </div>
              </template>
              <template #item.credit_limit="{ item }">
                <div class="text-right">
                  {{ formatNumber(Number(item.credit_limit)) ?? 'N/A' }}
                </div>
              </template>

              <template #item.amount="{ item }">
                <div class="text-right">
                  {{ formatNumber(Number(item.amount)) ?? 'N/A' }}
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </div>
    </VCardText>
  </VCard>
</template>
