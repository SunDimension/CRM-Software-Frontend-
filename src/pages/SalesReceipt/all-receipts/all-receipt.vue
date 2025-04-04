<script setup lang="ts">

import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { SalesOrderResource } from '@/types/globalTypes';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';


interface Store {
  id: number
  name: string
  branch_id: number
  store_type_id: number
}

interface SalesReceiptResource {
  id: number
  sales_receipt_number: string
  customer_name: string
  store_id?: number
  store_name: string
  total_amount: number
  payment_type: string
  sales_order: SalesOrderResource
  receipt_date: string
  payment_detail: []
}

// Data & State Variables
const filterOption = ref<'Date Only' | 'Date and Store'>('Date and Store')
const filteredSalesReceipts = ref<SalesReceiptResource[]>([])
const stores = ref<Store[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const filtersLoading = ref(false)
const showFilterError = ref(false)
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)
const selectedStore = ref<Store | null>(null)
const totalSalesReceiptCount = ref(0)
const totalSalesReceiptValue = ref('0.00')
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredSalesReceipts.value.length / itemsPerPage.value))
const itemsPerPage = ref(10)
const stores_filtered = ref<Store[]>([])

// const totals = ref({})
const router = useRouter()
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null

const downloadExcel = () => {
  if (filteredSalesReceipts.value.length === 0) {
    alert('No data available for export. Please filter the data first.');
    return;
  }

  // Convert the filtered sales receipts data into a 2D array for Excel
  const worksheetData = filteredSalesReceipts.value.map((receipt) => [
    receipt.sales_receipt_number,
    receipt.customer_name,
    receipt.store_name,
    formatNumber(Number(receipt.total_amount)),
    new Date(receipt.receipt_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    new Date(receipt.sales_order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    receipt.payment_type || 'N/A',
  ]);

  // Define columns for the Excel sheet
  const headers = [
    'Sales Receipt Number',
    'Customer Name',
    'Store Name',
    'Total Amount',
    'Receipt Date',
    'Sales Order Date',
    'Payment Type',
  ].map(header => header.toUpperCase());;

  // Prepare the data for the worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData]);

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Receipts');

  // Export the file with a name
  XLSX.writeFile(wb, 'Confirm Payment.xlsx');
}
// Fetch stores
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

// Fetch filtered sales orders
const fetchFilteredSalesReceipts = async (): Promise<void> => {
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
      params.store_id = selectedStore.value.id;
    }

    const response = await makeApiCall<SalesReceiptResource[]>('POST', '/search-sales-receipts', params);

    filteredSalesReceipts.value = response.data || [];
    updateTotals(); // Call to update totals
  } catch (err) {
    error.value = 'Error fetching sales orders.';
  } finally {
    loading.value = false;
  }
};


// Update totals
const updateTotals = () => {
  totalSalesReceiptCount.value = filteredSalesReceipts.value.length

  const totalValue = filteredSalesReceipts.value.reduce((sum, order) => {
    const amount = Number(order.total_amount) // Convert to number

    console.log(`Order Total Amount: ${order.total_amount}, Converted: ${amount}`) // Debug log for each amount
    if (isNaN(amount)) {
      console.warn(`Invalid total_amount: ${order.total_amount}`)

      return sum // Skip invalid amounts
    }

    return sum + amount
  }, 0)

  console.log(`Calculated Total Sales Order Value: ${totalSalesReceiptValue.value}`)
  totalSalesReceiptValue.value = formatNumber(totalValue) // Debug log for final total
}

const totalByPaymentType = computed(() => {
  const totals: Record<string, number> = {}

  filteredSalesReceipts.value.forEach(receipt => {
    if (receipt.payment_detail != null) {
      receipt.payment_detail.forEach(({ amount, payment_type }: any) => {
        if (!totals[payment_type])
          totals[payment_type] = 0

        totals[payment_type] += Number.parseFloat(amount)
      })
    }
  })

  return totals
})

//   console.log(`Total Sales Order Value: ${totalSalesOrderValue.value}`); // Debugging log
// };

// Format as currency
const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

const viewOrder = (salesReceiptNumber: string) => router.push({ name: 'sales-receipt', params: { no: salesReceiptNumber } })

// Paginated sales orders
const paginatedSalesReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value

  return filteredSalesReceipts.value.slice(start, start + itemsPerPage.value)
})

// Initial Data Fetch
fetchStores()
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="headline">
            All Confirmed Payment
          </VCardTitle>

          <!-- Loading and Error Messages -->
          <VAlert v-if="loading" type="info" elevation="2">
            Loading sales receipts...
          </VAlert>
          <VAlert v-if="filtersLoading" type="info" elevation="2">
            Loading filters...
          </VAlert>
          <VAlert v-if="error" type="error" elevation="2">
            {{ error }}
          </VAlert>
          <VAlert v-if="showFilterError" type="error" elevation="2">
            Please select a store and date range.
          </VAlert>

          <!-- Filter Section -->
          <VRow class="mt-4">
            <VCol cols="12" md="3">
              <VTextField v-model="fromDate" label="From Date" type="date" required />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="toDate" label="To Date" type="date" required />
            </VCol>
            <v-col cols="12" md="3">
              <v-select v-model="filterOption" :items="['Date Only', 'Date and Store']" label="Filter By" required />
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect :genericOptions="stores" :label_cus="'Select Store'" v-model="selectedStore" item-value="id"
                item-text="name" v-if="filterOption === 'Date and Store'" />
            </v-col>

          </VRow>

          <!-- View Filtered Data Button -->
          <VRow class="mt-4">
            <VCol cols="6" class="text-right">
              <VBtn color="primary" @click="fetchFilteredSalesReceipts">
                View
              </VBtn>

              <v-btn @click="downloadExcel" color="" class="excel">Download Excel</v-btn>
            </VCol>
          </VRow>

          <!-- Readonly Input Fields for Total Sales Orders -->
          <VRow class="mt-4">
            <VCol cols="12" md="3">
              <VTextField v-model="totalSalesReceiptCount" label="Total Sales Receipts (Number)" readonly />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="totalSalesReceiptValue" label="Total Sales Receipts (Total Amount)" readonly />
            </VCol>
            <VCol v-for="(total, type) in totalByPaymentType" :key="type" cols="12" md="3">
              <VTextField :value="formatNumber(total)" :label="`${type} Total`" readonly outlined hide-details="auto"
                dense persistent-placeholder />
            </VCol>
          </VRow>

          <!-- Sales Orders Table -->
          <VAlert v-if="!loading && paginatedSalesReceipts.length === 0" type="info" elevation="2" class="mt-4">
            No sales orders found. Please adjust your filters.
          </VAlert>
          <VTable v-if="!loading && paginatedSalesReceipts.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Sales Receipt Number</th>
                <th>Total Amount</th>
                <th>Receipt Date</th>
                <th>Sales Order Date</th>
                <th>Payment Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(salesReceipt, index) in paginatedSalesReceipts" :key="salesReceipt.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ salesReceipt.customer_name }}</td>
                <td>{{ salesReceipt.store_name }}</td>
                <td>{{ salesReceipt.sales_receipt_number }}</td>
                <td>{{ formatNumber(Number(salesReceipt.total_amount)) }}</td>
                <td>{{ salesReceipt.receipt_date ? new Date(salesReceipt.receipt_date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                }) : 'N/A' }}</td>
                <td>
                  {{
                    salesReceipt.sales_order?.created_at
                      ? new Date(salesReceipt.sales_order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month:
                          'short', day: 'numeric'
                      })
                      : 'N/A'
                  }}
                </td>
                <td>{{ salesReceipt.payment_type || 'N/A' }}</td>
                <td>
                  <VBtn small title="View" icon @click="viewOrder(salesReceipt.sales_receipt_number)">
                    <VIcon>ri-eye-line</VIcon>
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>

          <!-- Pagination -->
          <VPagination v-model="currentPage" :length="totalPages" :total-visible="7" class="mt-4" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>
<style scoped>
.excel {
  background-color: #0624d0;
  color: white
}
</style>
