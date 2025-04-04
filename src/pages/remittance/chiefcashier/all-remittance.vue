<script setup lang="ts">
import { computed, ref } from 'vue';
import { makeApiCall } from '@/services/apiService';
import * as XLSX from 'xlsx';
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';

// Interfaces
interface CashierRemittance {
  id: number;
  branch_name: string;
  store_name: string;
  user_name: string;
  amount: number;
  cash_discrepancy_name: string;
  discrepancy_amount: number;
  date: Date;
}

interface Store {
  id: number;
  name: string;
  store_type_id: number;
}

// Data & State Variables
const stores = ref<Store[]>([]);
const filteredCashierRemittal = ref<CashierRemittance[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showFilterError = ref(false);
const filterOption = ref<'Date Only' | 'Date and Store'>('Date and Store');
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);
const selectedStore = ref<number | null>(null);
const totalRemittancesCount = ref(0);
const totalRemittancesValue = ref('0.00');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const stores_filtered = ref<Store[]>([])
const router = useRouter()
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null


const totalPages = computed(() =>
  Math.ceil(filteredCashierRemittal.value.length / itemsPerPage.value)
);
const paginatedRemittances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCashierRemittal.value.slice(start, start + itemsPerPage.value);
});




const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`)

    stores.value = response.data
    stores_filtered.value = stores.value.filter(item => item.store_type_id === 2)
  }
  catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Fetch Remittances
const fetchFilteredCashierRemittal = async () => {
  if (
    (filterOption.value === 'Date and Store' && (!selectedStore.value || !fromDate.value || !toDate.value)) ||
    (filterOption.value === 'Date Only' && (!fromDate.value || !toDate.value))
  ) {
    showFilterError.value = true;
    return;
  }

  showFilterError.value = false;
  loading.value = true;

  try {
    const params: any = {
      from_date: fromDate.value,
      to_date: toDate.value,
      page: currentPage.value,
      per_page: itemsPerPage.value,
    };

    if (filterOption.value === 'Date and Store' && selectedStore.value) {
      params.store_id = selectedStore.value; // Make sure to pass the store's ID
    }

    const response = await makeApiCall<CashierRemittance[]>('POST', '/search-cashier-remittance', params);
    filteredCashierRemittal.value = response.data || [];
    updateTotals();
  } catch (err) {
    error.value = 'Error fetching remittances.';
  } finally {
    loading.value = false;
  }
};


// Update Totals
// const updateTotals = () => {
//   totalRemittancesCount.value = filteredCashierRemittal.value.length;
//   totalRemittancesValue.value = filteredCashierRemittal.value
//     .reduce((sum, remittance) => sum + remittance.amount, 0)
//     .toFixed(2);
// };

const updateTotals = () => {
   totalRemittancesCount.value = filteredCashierRemittal.value.length;
  const totalValue = filteredCashierRemittal.value.reduce((sum, remittance) => {
    const amount = Number(remittance.amount); // Convert to number
    console.log(`Order Total Amount: ${remittance.amount}, Converted: ${amount}`);  // Debug log for each amount
    if (isNaN(amount)) {
      console.warn(`Invalid total_amount: ${remittance.amount}`);
      return sum;  // Skip invalid amounts
    }
    return sum + amount;
  }, 0);
  console.log(`Calculated Total Sales Order Value: ${totalRemittancesValue.value}`);
  totalRemittancesValue.value = formatNumber(totalValue); // Debug log for final total
};

// Export to Excel
const downloadExcel = () => {
  if (filteredCashierRemittal.value.length === 0) {
    alert('No data available for export. Please filter the data first.');
    return;
  }

  const worksheetData = filteredCashierRemittal.value.map((remittance) => [
    remittance.branch_name,
    remittance.store_name,
    remittance.user_name,
    remittance.amount,
    remittance.cash_discrepancy_name,
    remittance.discrepancy_amount,
    new Date(remittance.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  ]);

  const headers = [
    'Branch Name',
    'Store Name',
    'Cashier Name',
    'Amount',
    'Discrepancy',
    'Discrepancy Amount',
    'Date',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cashier Remittances');
  XLSX.writeFile(wb, 'Cashier_Remittances.xlsx');
};

// Fetch Stores
// const fetchStores = async () => {
//   try {
//     const response = await makeApiCall<Store[]>('GET', '/my-stores');
//     stores.value = response.data;
//   } catch (err) {
//     console.error('Error fetching stores:', err);
//   }
// };

const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

// Initialize Data
fetchStores();
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="headline">All Cashier Cash Remittances</v-card-title>

          <!-- Loading and Error Messages -->
          <v-alert v-if="loading" type="info" elevation="2">Loading remittances...</v-alert>
          <v-alert v-if="error" type="error" elevation="2">{{ error }}</v-alert>
          <v-alert v-if="showFilterError" type="error" elevation="2">
            Please select a valid date range and store (if applicable).
          </v-alert>

          <!-- Filter Section -->
          <v-row class="mt-4">
            <v-col cols="12" md="3">
              <v-text-field v-model="fromDate" label="From Date" type="date" required></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="toDate" label="To Date" type="date" required></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-select v-model="filterOption" :items="['Date Only', 'Date and Store']" label="Filter By"
                required></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect :genericOptions="stores" :label_cus="'Select Store'" v-model="selectedStore" item-value="id"
                item-text="name" v-if="filterOption === 'Date and Store'" />
            </v-col>
            <v-col cols="6" class="text-right">
              <v-btn @click="fetchFilteredCashierRemittal" color="primary">View</v-btn>
              <v-btn @click="downloadExcel" color="secondary" class="excel">Download Excel</v-btn>
            </v-col>
          </v-row>

          <!-- Remittances Summary -->
          <v-row class="mt-4">
            <v-col cols="12" md="3">
              <v-text-field v-model="totalRemittancesCount" label="Total Records" readonly />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="totalRemittancesValue" label="Total Amount (₦)" readonly />
            </v-col>
          </v-row>

          <!-- Remittances Table -->
          <v-alert
            v-if="!loading && paginatedRemittances.length === 0"
            type="info"
            elevation="2"
            class="mt-4"
          >
            No remittances found. Please adjust your filters.
          </v-alert>
          <v-table v-if="!loading && paginatedRemittances.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Branch</th>
                <th>Store</th>
                <th>Cashier</th>
                <th>Amount</th>
                <th>Discrepancy</th>
                <th>Discrepancy Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(remittance, index) in paginatedRemittances" :key="remittance.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ remittance.branch_name }}</td>
                <td>{{ remittance.store_name }}</td>
                <td>{{ remittance.user_name }}</td>
                <td>{{ formatNumber(Number(remittance.amount)) }}</td>
              <td>{{ remittance.cash_discrepancy_name }}</td>
                <td>{{ formatNumber(Number(remittance.discrepancy_amount)) }}</td>
                <td>
                  {{
                    remittance.date
                      ? new Date(remittance.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'
                  }}
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
<style scoped>
.excel {
  background-color: #0624d0;
  color: white
}
</style>

