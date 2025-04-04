<script setup lang="ts">
import { computed, ref } from 'vue';
import { makeApiCall } from '@/services/apiService';
import * as XLSX from 'xlsx';
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { useRouter } from 'vue-router';

// Interfaces
interface CashExpense {
  id: number;
  expense_line_id: number;
  expense_line:string;
  branch_id: number;
  branch_name: string;
  amount: number;
  date: Date;
  user_id: number;
  user_name: string;
  store_id: number;
  store_name:string;
  created_at: Date;
  approval_date: Date;
  approved_by: number;
}

interface Store {
  id: number;
  name: string;
  store_type_id: number;
}

// Data & State Variables
const stores = ref<Store[]>([]);
const filteredCashExpenses = ref<CashExpense[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showFilterError = ref(false);
const filterOption = ref<'Date Only' | 'Date and Store'>('Date and Store');
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);
const selectedStore = ref<number | null>(null);
const totalExpensesCount = ref(0);
const totalExpensesValue = ref('0.00');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const stores_filtered = ref<Store[]>([]);
const router = useRouter();
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

const totalPages = computed(() =>
  Math.ceil(filteredCashExpenses.value.length / itemsPerPage.value)
);

const paginatedCashExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCashExpenses.value.slice(start, start + itemsPerPage.value);
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

// Fetch Expenses
const fetchFilteredCashExpenses = async () => {
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
      params.store_id = selectedStore.value;
    }

    const response = await makeApiCall<CashExpense[]>('POST', '/search-cashier-expense', params);
    filteredCashExpenses.value = response.data || [];
    updateTotals();
  } catch (err) {
    error.value = 'Error fetching expenses.';
  } finally {
    loading.value = false;
  }
};

// Update Totals
// const updateTotals = () => {
//   totalExpensesCount.value = filteredCashExpenses.value.length;
//   totalExpensesValue.value = filteredCashExpenses.value
//     .reduce((sum, expense) => sum + expense.amount, 0)
//     .toFixed(2);
// };



const updateTotals = () => {
   totalExpensesCount.value = filteredCashExpenses.value.length;
  const totalValue = filteredCashExpenses.value.reduce((sum, expense) => {
    const amount = Number(expense.amount); // Convert to number
    console.log(`Order Total Amount: ${expense.amount}, Converted: ${amount}`);  // Debug log for each amount
    if (isNaN(amount)) {
      console.warn(`Invalid total_amount: ${expense.amount}`);
      return sum;  // Skip invalid amounts
    }
    return sum + amount;
  }, 0);
  console.log(`Calculated Total Sales Order Value: ${totalExpensesValue.value}`);
  totalExpensesValue.value = formatNumber(totalValue); // Debug log for final total
};

// Export to Excel
const downloadExcel = () => {
  if (filteredCashExpenses.value.length === 0) {
    alert('No data available for export. Please filter the data first.');
    return;
  }

  const worksheetData = filteredCashExpenses.value.map((expense) => [
    expense.branch_name,
    expense.store_id,
    expense.user_name,
    expense.amount,
    new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  ]);

  const headers = [
    'Branch Name',
    'Store ID',
    'User Name',
    'Amount',
    'Date',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cashier Expenses');
  XLSX.writeFile(wb, 'Cashier_Expenses.xlsx');
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

// Initialize Data
fetchStores();
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="headline">All Cashier Cash Expenses</v-card-title>

          <!-- Loading and Error Messages -->
          <v-alert v-if="loading" type="info" elevation="2">Loading expenses...</v-alert>
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
              <v-select v-model="filterOption" :items="['Date Only', 'Date and Store']" label="Filter By" required></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect :genericOptions="stores" :label_cus="'Select Store'" v-model="selectedStore" item-value="id" item-text="name" v-if="filterOption === 'Date and Store'" />
            </v-col>
            <v-col cols="6" class="text-right">
              <v-btn @click="fetchFilteredCashExpenses" color="primary">View</v-btn>
              <v-btn @click="downloadExcel" color="secondary" class="excel">Download Excel</v-btn>
            </v-col>
          </v-row>

          <!-- Expenses Summary -->
          <v-row class="mt-4">
            <v-col cols="12" md="3">
              <v-text-field v-model="totalExpensesCount" label="Total Records" readonly />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="totalExpensesValue" label="Total Amount (₦)" readonly />
            </v-col>
          </v-row>

          <!-- Expenses Table -->
          <v-alert v-if="!loading && paginatedCashExpenses.length === 0" type="info" elevation="2" class="mt-4">
            No expenses found. Please adjust your filters.
          </v-alert>
          <v-table v-if="!loading && paginatedCashExpenses.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Branch</th>
                <th>Store</th>
                <th>User</th>
                <th>Amount</th>
                <th>Expense Line</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(expense, index) in paginatedCashExpenses" :key="expense.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ expense.branch_name }}</td>
                <td>{{ expense.store_name }}</td>
                <td>{{ expense.user_name }}</td>
                <td>{{ formatNumber(Number(expense.amount)) }}</td>
                <td>{{ expense.expense_line}}</td>
                <td>{{ new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</td>
                
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
