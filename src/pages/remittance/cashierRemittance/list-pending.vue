<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { formatNumber } from '@/types/globalTypes'
import { onMounted, ref } from 'vue'

const data = ref<any[]>([])
const loading = ref(true)

const fetchData = async () => {
  try {
    loading.value = true

    const dataResponse = await makeApiCall<any[]>('GET', '/cashier-remittance-pending')

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

onMounted(fetchData)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Pending Cashier Remittance">
        <VTable fixed-header loading loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">
                S/N
              </th>
              <!--
                <th class="text-uppercase">
                Order No
                </th>
              -->
              <th class="text-uppercase">
                Cashier
              </th>
              <th class="text-uppercase text-center">
                Branch
              </th>
              <th class="text-uppercase text-center">
                Store
              </th>
              <th class="text-uppercase text-center">
                Amount
              </th>
              <th class="text-uppercase text-center">
                Cash Discrepancy
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

            <tr v-for="item, index in data" v-if="data && !loading" :key="item.id">
              <td>{{ index + 1 }}</td>
              <!-- <td>{{ item.sales_order_number }}</td> -->
              <td>{{ item.user_name }}</td>
              <td class="text-center">
                {{ item.branch_name }}
              </td>
              <td class="text-center">
                {{ item.store_name }}
              </td>

              <td class="text-center">
                {{ formatNumber(item.amount) }}
              </td>
                 <td class="text-center">
               {{ item.discrepancy_amount || 'N/A' }}
              </td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <a :href="`/remittance/treat-remittance/${item.id}`">Proceed</a>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="6">
                No Available Data
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
