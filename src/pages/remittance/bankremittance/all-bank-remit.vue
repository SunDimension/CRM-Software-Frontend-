<script setup lang="ts">
import { computed, ref } from 'vue';
import { makeApiCall } from '@/services/apiService';
import * as XLSX from 'xlsx';
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { useRouter } from 'vue-router';

// Interfaces
interface BankRemittance {
  id: number;
  bank_id: number;
  bank_name: string;
  branch_id: number;
  branch_name: string;
  amount: number;
  account_number: number;
  date: Date;
  user_id: number;
  user_name: string;
  store_id: number;
  store_name:string;
  created_at: Date;
}

interface Store {
  id: number;
  name: string;
  store_type_id: number;
}

interface GenericSetUp {
  id?: number
  name: string
}

// Data & State Variables
const stores = ref<Store[]>([]);
const banks = ref<GenericSetUp[]>([]);
const filteredBankRemittances = ref<BankRemittance[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showFilterError = ref(false);
const filterOption = ref<'Date Only' | 'Date and Store'>('Date and Store');
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);
const selectedStore = ref<number | null>(null);
const selectedBank = ref<number | null>(null);
const totalRemittancesCount = ref(0);
const totalRemittancesValue = ref('0.00');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const stores_filtered = ref<Store[]>([]);
const router = useRouter();
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

const totalPages = computed(() =>
  Math.ceil(filteredBankRemittances.value.length / itemsPerPage.value)
);

const paginatedBankRemittances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBankRemittances.value.slice(start, start + itemsPerPage.value);
});

// Fetch Stores
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`);
    stores.value = response.data;
    stores_filtered.value = stores.value.filter(item => item.store_type_id === 2);
  } catch (error) {
    console.error('Error fetching stores:', error);
  }
};

// Fetch Banks
const fetchBanks = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/banks');
    banks.value = response.data;
  } catch (error) {
    console.error('Error fetching banks:', error);
  }
};

// Fetch Remittances
const fetchFilteredBankRemittances = async () => {
  if (
    (filterOption.value === 'Date and Store' && (!selectedStore.value || !selectedBank.value || !fromDate.value || !toDate.value)) ||
    (filterOption.value === 'Date Only' && (!selectedBank.value || !fromDate.value || !toDate.value))
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

    if (selectedBank.value) {
      params.bank_id = selectedBank.value.id;
    }
    if (filterOption.value === 'Date and Store' && selectedStore.value) {
      params.store_id = selectedStore.value;
    }

    const response = await makeApiCall<BankRemittance[]>('POST', '/search-bank-remittance', params);
    filteredBankRemittances.value = response.data || [];
    updateTotals();
  } catch (err) {
    error.value = 'Error fetching remittances.';
  } finally {
    loading.value = false;
  }
};

// Update Totals
// const updateTotals = () => {
//   totalRemittancesCount.value = filteredBankRemittances.value.length;
//   totalRemittancesValue.value = filteredBankRemittances.value
//     .reduce((sum, remittance) => sum + remittance.amount, 0)
//     .toFixed(2);
// };


const updateTotals = () => {
   totalRemittancesCount.value = filteredBankRemittances.value.length;
  const totalValue = filteredBankRemittances.value.reduce((sum, remittance) => {
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
  if (filteredBankRemittances.value.length === 0) {
    alert('No data available for export. Please filter the data first.');
    return;
  }

  const worksheetData = filteredBankRemittances.value.map((remittance) => [
    remittance.bank_name,
    remittance.branch_name,
    remittance.store_name,
    remittance.user_name,
    remittance.amount,
    remittance.account_number,
    new Date(remittance.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  ]);

  const headers = [
    'Bank Name',
    'Branch Name',
    'Store ID',
    'User Name',
    'Amount',
    'Account Number',
    'Date',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bank Remittances');
  XLSX.writeFile(wb, 'Bank_Remittances.xlsx');
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

// Initialize Data
fetchStores();
fetchBanks();
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="headline">All Bank Remittances</v-card-title>

          <!-- Loading and Error Messages -->
          <v-alert v-if="loading" type="info" elevation="2">Loading remittances...</v-alert>
          <v-alert v-if="error" type="error" elevation="2">{{ error }}</v-alert>
          <v-alert v-if="showFilterError" type="error" elevation="2">
            Please select a valid date range, bank, and store (if applicable).
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
              <v-select v-model="filterOption" :items="['Date Only', 'Date and Store']" label="Filter By" required></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect :genericOptions="banks" :label_cus="'Select Bank'" v-model="selectedBank" item-value="id" item-text="name" />
            </v-col>
            <v-col cols="12" md="3" v-if="filterOption === 'Date and Store'">
              <filterSelect :genericOptions="stores" :label_cus="'Select Store'" v-model="selectedStore" item-value="id" item-text="name" />
            </v-col>
            <v-col cols="6" class="text-right">
              <v-btn @click="fetchFilteredBankRemittances" color="primary">View</v-btn>
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
          <v-alert v-if="!loading && paginatedBankRemittances.length === 0" type="info" elevation="2" class="mt-4">
            No remittances found. Please adjust your filters.
          </v-alert>
          <v-table v-if="!loading && paginatedBankRemittances.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Bank</th>
                <th>Branch</th>
                <th>Store</th>
                <th>Cashier Name</th>
                <th>Amount</th>
                <th>Account Number</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(remittance, index) in paginatedBankRemittances" :key="remittance.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ remittance.bank_name }}</td>
                <td>{{ remittance.branch_name }}</td>
                <td>{{ remittance.store_name }}</td>
                <td>{{ remittance.user_name }}</td>
                <td>{{ formatNumber(Number(remittance.amount)) }}</td>
                <td>{{ remittance.account_number }}</td>
                <td>{{ new Date(remittance.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</td>
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
  color: white;
}
</style>
