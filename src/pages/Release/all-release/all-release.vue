<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="headline">All Releases</v-card-title>

          <!-- Loading and Error Messages -->
          <v-alert v-if="loading" type="info" elevation="2">Loading sales orders...</v-alert>
          <v-alert v-if="filtersLoading" type="info" elevation="2">Loading filters...</v-alert>
          <v-alert v-if="error" type="error" elevation="2">{{ error }}</v-alert>
          <v-alert v-if="showFilterError" type="error" elevation="2">Please select a store and date range.</v-alert>

          <!-- Filter Section -->
          <v-row class="mt-4">
            <v-col cols="12" md="4">
              <v-text-field v-model="fromDate" label="From Date" type="date" required></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="toDate" label="To Date" type="date" required></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <filterSelect
                :genericOptions="stores"
                :label_cus="'Select Store'"
                v-model="selectedStore"
                item-value="id"
                item-text="name"
              />
            </v-col>
          </v-row>

          <!-- View Filtered Data Button -->
          <v-row class="mt-4">
            <v-col cols="12" class="text-right">
              <v-btn @click="fetchFilteredSalesOrders" color="primary">View</v-btn>
            </v-col>
          </v-row>

          <!-- Readonly Input Fields for Total Sales Orders -->
          <v-row class="mt-4">
            <v-col cols="12" md="3">
              <v-text-field v-model="totalSalesOrderCount" label="Total Released Items (Number)" readonly />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="totalSalesOrderValue" label="Total Release Item Value (Total Amount)" readonly />
            </v-col>
          </v-row>

          <!-- Sales Orders Table -->
          <v-alert v-if="!loading && formattedSalesReceipts.length === 0" type="info" elevation="2" class="mt-4">
            No release found. Please adjust your filters.
          </v-alert>
          <v-table v-if="!loading && formattedSalesReceipts.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Sales Receipt Number</th>
                <th>Total Amount</th>
                <th>Payment Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(salesRelease, index) in paginatedsalesRelease" :key="salesRelease.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ salesRelease?.customer_name }}</td>
                <td>{{ salesRelease?.store_name }}</td>
                <td>{{ salesRelease.sales_receipt_id }}</td>
                <td>{{ salesRelease.formattedAmount }}</td>
                <td>{{ salesRelease.payment_type || 'N/A' }}</td>
                <td>
                  <v-btn small @click="viewOrder(salesRelease.sales_receipt_number)" title="View" icon>
                    <v-icon>ri-eye-line</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Pagination -->
          <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" class="mt-4" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

interface Store {
  id: number;
  name: string;
  branch_id: number;
  store_type_id:number;
}

interface SalesReceiptResource {
  id: number;
  sales_receipt_number: string;
  customer_name: string;
  customer_id:number;
  store_id: number;
  store_name: string;
  total_amount: number;
  payment_type: string;
}

interface SalesReleaseResource {
  id: number;
  sales_receipt_number: string;
  sales_receipt_id:number;
  customer_name: string;
  customer_id:number;
  store_id: number;
  store_name: string;
  total_amount: number;
  payment_type: string;
}

interface SalesOrderResource {
  id: number;
  sales_order_number: string;
  customer_name: string;
  store_id: number;
  store_name: string;
  total_amount: number;
  payment_type: string;
}

// State Variables
const filteredSalesReceipts = ref<SalesReleaseResource[]>([]);
const stores = ref<Store[]>([]);
const loading = ref(false);
const filtersLoading = ref(false);
const error = ref<string | null>(null);
const stores_filtered = ref<Store[]>([]);
// const salesReceipt = ref<SalesReceiptResource>();
const salesOrder = ref<SalesOrderResource>();


// Filter state variables
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);
const selectedStore = ref<Store | null>(null);
const showFilterError = ref(false);
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Readonly fields for totals
const totalSalesOrderCount = ref(0);
const totalSalesOrderValue = ref('0.00');

// Router for navigation
const router = useRouter();

// Fetch stores based on selected branch
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`);
    stores.value = response.data;
    stores_filtered.value = stores.value;
    if(stores.value.filter(item=> item.store_type_id == 2).length>0) {
      stores_filtered.value = stores.value.filter(item=> item.store_type_id == 2);
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

// Fetch filtered sales orders based on selected criteria
const fetchFilteredSalesOrders = async (): Promise<void> => {
  if (!selectedStore.value || !fromDate.value || !toDate.value) {
    showFilterError.value = true;
    return;
  }
  showFilterError.value = false;
  loading.value = true;

  try {
    const response = await makeApiCall<SalesReleaseResource[]>('POST', '/search-sales-release', {
      from_date: fromDate.value,
      to_date: toDate.value,
      store_id: selectedStore.value.id,
      page: currentPage.value,
      per_page: itemsPerPage.value,
    });

    if (response && Array.isArray(response.data)) {
      filteredSalesReceipts.value = response.data;
      updateTotals();
    } else {
      filteredSalesReceipts.value = [];
      updateTotals();
    }
  } catch (err) {
    error.value = 'Error fetching sales orders.';
  } finally {
    loading.value = false;
  }
};

// Update total sales order count and value
const updateTotals = () => {
  totalSalesOrderCount.value = filteredSalesReceipts.value.length;
  const totalValue = filteredSalesReceipts.value.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  totalSalesOrderValue.value = formatNumber(totalValue);
};
const formattedSalesReceipts = computed(() =>
  filteredSalesReceipts.value.map(order => ({
    ...order,
    formattedAmount: formatNumber(order.total_amount || 0),
  }))
);
// Format numbers for display
const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

// Pagination Computations
const paginatedsalesRelease = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return formattedSalesReceipts.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredSalesReceipts.value.length / itemsPerPage.value));

// Navigate to sales order details
const viewOrder = (salesOrderNo: string) => router.push({ name: 'release-print', params: { no: salesOrderNo } });

// Initial data fetch
fetchStores();
</script>

<style scoped>
/* Add your styles here */
</style>
