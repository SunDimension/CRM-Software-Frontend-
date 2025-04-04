<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { SalesReceiptResource } from '@/types/globalTypes';
import { onMounted, ref, computed } from 'vue';

const data = ref<SalesReceiptResource[]>([]);
const loading = ref(true);
const searchTerm = ref('');

const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

const fetchData = async () => {
  try {
    loading.value = true;
    const dataResponse = await makeApiCall<SalesReceiptResource[]>('GET', `/pending-release/${parsedUser.store_id}`);
    data.value = dataResponse.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdated = () => {
  fetchData();
};

const filteredData = computed(() => {
  if (!searchTerm.value) return data.value;
  return data.value.filter((item) =>
    item.sales_receipt_number.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

onMounted(fetchData);
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Pending Release">
        
        <!-- Search Bar -->
        <VTextField
          v-model="searchTerm"
          label="Search by Receipt Number"
          placeholder="Enter receipt number"
          outlined
          clearable
          class="mb-4"
        />

        <!-- Table -->
        <VTable
          fixed-header
          loading
          loading-text="Loading... Please wait"
        >
          <thead>
            <tr>
              <th class="text-uppercase">S/N</th>
              <th class="text-uppercase">Receipt No</th>
              <th class="text-uppercase">Customer</th>
              <th class="text-uppercase text-center">Branch</th>
              <th class="text-uppercase text-center">Store</th>
              <th class="text-uppercase text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="9" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr v-if="filteredData && !loading" v-for="(item, index) in filteredData" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.sales_receipt_number }}</td>
              <td>{{ item.sales_order.customer_name }}</td>
              <td class="text-center">{{ item.sales_order.branch_name }}</td>
              <td class="text-center">{{ item.sales_order.store_name }}</td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <a :href="'/release/new-release/'+item.sales_receipt_number">Proceed</a>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!filteredData || filteredData.length === 0)">
              <td style="text-align: center;" colspan="6">No Matching Receipts Found</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
