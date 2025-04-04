<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { makeApiCall } from '@/services/apiService'
import { formatNumber } from '@/types/globalTypes'
import type { SalesOrderResource } from '@/types/globalTypes'

const data = ref<SalesOrderResource[]>([])
const loading = ref(true)
const searchTerm = ref('')

// Fetch data from the API
const fetchData = async () => {
  try {
    loading.value = true

    const dataResponse = await makeApiCall<SalesOrderResource[]>('GET', '/sales-orders-pending-receipt')

    data.value = dataResponse.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
  finally {
    loading.value = false
  }
}

// Method to cancel an order
// Method to cancel an order
const cancelOrder = async (orderId: number) => {
  const confirmed = await confirm('Are you sure you want to cancel this order?') // Optional confirmation dialog
  if (!confirmed)
    return

  try {
    loading.value = true
    await makeApiCall('POST', `/sales-orders/${orderId}/cancel`) // Adjust API endpoint
    console.log(`Order ${orderId} canceled successfully`)

    // Remove the canceled order from the data array
    data.value = data.value.filter(item => item.id !== orderId)

    // Optionally display a success message
    alert('Order successfully canceled!')
  }
  catch (error) {
    console.error('Error canceling order:', error)
    alert('Failed to cancel the order. Please try again.')
  }
  finally {
    loading.value = false
  }
}

const handleUpdated = () => {
  fetchData()
}

// Filter data based on search term
const filteredData = computed(() => {
  if (!searchTerm.value)
    return data.value
  const searchLower = searchTerm.value.toLowerCase()

  return data.value.filter(item =>
    item.sales_order_number.toLowerCase().includes(searchLower)
    || item.customer_name.toLowerCase().includes(searchLower),
  )
})

// Fetch data when the component is mounted
onMounted(fetchData)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Pending Sales Orders">
        <!-- Search Bar -->
        <VCol cols="10" md="6">
          <VTextField v-model="searchTerm" label="Search by Order Number or Customer Name"
            placeholder="Enter order number or customer name" outlined clearable class="mb-4" />
        </VCol>

        <!-- Table -->
        <VTable fixed-header loading loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">
                S/N
              </th>
              <th class="text-uppercase">
                Order No
              </th>
              <th class="text-uppercase">
                Customer
              </th>
              <th class="text-uppercase text-center">
                Branch
              </th>
              <th class="text-uppercase text-center">
                Store
              </th>

              <th class="text-uppercase text-center">
                Amount (&#8358;)
              </th>
              <th class="text-uppercase text-center">
                Order Date
              </th>
              <th class="text-uppercase text-center" />
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="9" class="text-center">
                <VProgressCircular indeterminate size="180" />
              </td>
            </tr>

            <tr v-for="(item, index) in filteredData" v-if="filteredData && !loading" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.sales_order_number }}</td>
              <td>{{ item.customer_name }}</td>
              <td class="text-center">
                {{ item.branch_name }}
              </td>
              <td class="text-center">
                {{ item.store_name }}
              </td>
              <td class="text-center">
                {{ formatNumber(item.total_amount) }}
              </td>
              <td>
                {{ item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month:
                    'short',
                  day: 'numeric',
                }) : 'N/A' }}
              </td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <a :href="`/SalesReceipt/new-receipt/${item.sales_order_number}`">Proceed</a>

                  <VBtn small outlined class="cancel" @click="cancelOrder(item.id)">
                    Cancel
                  </VBtn>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!filteredData || filteredData.length === 0)">
              <td style="text-align: center;" colspan="6">
                No Matching Orders Found
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.cancel {
  background-color: #0624d0 !important;
  color: white
}
</style>
