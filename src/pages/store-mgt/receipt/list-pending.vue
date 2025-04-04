<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { computed, onMounted, ref } from 'vue'

const data = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')

// Fetch data from the API
const fetchData = async () => {
  try {
    loading.value = true

    const dataResponse = await makeApiCall<any[]>('GET', '/pending-receive-orders')

    data.value = dataResponse.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
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
    item.id.toLowerCase().includes(searchLower)
    || item.vendor_name.toLowerCase().includes(searchLower),
  )
})

// Fetch data when the component is mounted
onMounted(fetchData)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Pending Store Receipts">
        <!-- Search Bar -->
        <VCol cols="10" md="6">
          <VTextField v-model="searchTerm" label="Search by Order Number or Vendor Name"
            placeholder="Enter order number or Vendor name" outlined clearable class="mb-4" />
        </VCol>

        <!-- Table -->
        <VTable fixed-header loading loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">
                S/N
              </th>
              <th class="text-uppercase">
                Date
              </th>
              <th class="text-uppercase">
                Vendor
              </th>
              <th class="text-uppercase text-center">
                Branch
              </th>
              <th class="text-uppercase text-center">
                Store
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
              <td>
                {{ item.receive_date ? new Date(item.receive_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month:
                    'short',
                  day: 'numeric',
                }) : 'N/A' }}
              </td>
              <td>{{ item.vendor_name }}</td>
              <td class="text-center">
                {{ item.branch_name }}
              </td>
              <td class="text-center">
                {{ item.store_name }}
              </td>
              <!--
                <td class="text-center">
                {{ formatNumber(item.total_amount) }}
                </td>
              -->
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <a :href="`/store/treat-receive/${item.id}`">Proceed</a>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!filteredData || filteredData.length === 0)">
              <td style="text-align: center;" colspan="6">
                No Matching Records Found
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
