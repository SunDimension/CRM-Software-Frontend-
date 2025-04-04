<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'

interface Store {
  id: number
  name: string
  branch_id: number
  store_type_id: number
}

interface SalesOrderResource {
  id: number
  sales_order_number: string
  customer_name: string
  store_id?: number
  store_name: string
  total_amount: number
  payment_type: string
  created_at?: string
}

// Data & State Variables
const filterOption = ref<'Date Only' | 'Date and Store'>('Date and Store')
const filteredSalesOrders = ref<SalesOrderResource[]>([])
const stores = ref<Store[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const filtersLoading = ref(false)
const showFilterError = ref(false)
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)
const selectedStore = ref<Store | null>(null)
const totalSalesOrderCount = ref(0)
const totalSalesOrderValue = ref('0.00')
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredSalesOrders.value.length / itemsPerPage.value))
const itemsPerPage = ref(10)
const stores_filtered = ref<Store[]>([])
const router = useRouter()
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null

const downloadExcel = () => {
  if (filteredSalesOrders.value.length === 0) {
    alert('No data available for export. Please filter the data first.')

    return
  }

  const worksheetData = filteredSalesOrders.value.map(order => [
    order.sales_order_number,
    order.customer_name,
    order.store_name,
    formatNumber(Number(order.total_amount)),
    order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      : 'N/A',
  ])

  // Define columns for the Excel sheet
  const headers = [
    'Sales Order Number',
    'Customer Name',
    'Store Name',
    'Total Amount',
    'Sales Date',

  ].map(header => header.toUpperCase())

  // Prepare the data for the worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData])

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Sales Orders')

  // Export the file with a name
  XLSX.writeFile(wb, 'Sales Orders.xlsx')
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
const fetchFilteredSalesOrders = async (): Promise<void> => {
  if (
    (filterOption.value === 'Date and Store' && (!selectedStore.value || !fromDate.value || !toDate.value))
    || (filterOption.value === 'Date Only' && (!fromDate.value || !toDate.value))
  ) {
    showFilterError.value = true

    return
  }

  showFilterError.value = false
  loading.value = true

  try {
    const params: any = {
      from_date: fromDate.value,
      to_date: toDate.value,
      page: currentPage.value,
      per_page: itemsPerPage.value,
    }

    if (filterOption.value === 'Date and Store' && selectedStore.value)
      params.store_id = selectedStore.value.id

    const response = await makeApiCall<SalesOrderResource[]>('POST', '/search-sales-orders', params)

    filteredSalesOrders.value = response.data || []
    updateTotals() // Call to update totals
  }
  catch (err) {
    error.value = 'Error fetching sales orders.'
  }
  finally {
    loading.value = false
  }
}

// Update totals
const updateTotals = () => {
  totalSalesOrderCount.value = filteredSalesOrders.value.length

  const totalValue = filteredSalesOrders.value.reduce((sum, order) => {
    const amount = Number(order.total_amount) // Convert to number

    console.log(`Order Total Amount: ${order.total_amount}, Converted: ${amount}`) // Debug log for each amount
    if (isNaN(amount)) {
      console.warn(`Invalid total_amount: ${order.total_amount}`)

      return sum // Skip invalid amounts
    }

    return sum + amount
  }, 0)

  console.log(`Calculated Total Sales Order Value: ${totalSalesOrderValue.value}`)
  totalSalesOrderValue.value = formatNumber(totalValue) // Debug log for final total
}

//   console.log(`Total Sales Order Value: ${totalSalesOrderValue.value}`); // Debugging log
// };

// Format as currency
const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

const viewOrder = (salesOrderNumber: string) => router.push({ name: 'salesorder-print', params: { no: salesOrderNumber } })

const editOrder = (id: number) => {
  router.push({ name: 'sales-order-edit', params: { id } })
}

// Paginated sales orders
const paginatedSalesOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value

  return filteredSalesOrders.value.slice(start, start + itemsPerPage.value)
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
            All Sales Orders
          </VCardTitle>

          <!-- Loading and Error Messages -->
          <VAlert v-if="loading" type="info" elevation="2">
            Loading sales orders...
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
            <VCol cols="12" md="3">
              <VSelect v-model="filterOption" :items="['Date Only', 'Date and Store']" label="Filter By" required>
              </VSelect>
            </VCol>
            <VCol cols="12" md="3">
              <FilterSelect :generic-options="stores" :label_cus="'Select Store'" v-model="selectedStore"
                item-value="id" v-if="filterOption === 'Date and Store'" item-text="name" />
            </VCol>
          </VRow>

          <!-- View Filtered Data Button -->
          <VRow class="mt-4">
            <VCol cols="6" class="text-right">
              <VBtn color="primary" @click="fetchFilteredSalesOrders">
                View
              </VBtn>
              <VBtn color="" @click="downloadExcel" class="excel">
                Download Excel
              </VBtn>
            </VCol>
          </VRow>

          <!-- Readonly Input Fields for Total Sales Orders -->
          <VRow class="mt-4">
            <VCol cols="12" md="3">
              <VTextField v-model="totalSalesOrderCount" label="Total Sales Orders (Number)" readonly />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="totalSalesOrderValue" label="Total Sales Orders (Total Amount)" readonly />
            </VCol>
          </VRow>

          <!-- Sales Orders Table -->
          <VAlert v-if="!loading && paginatedSalesOrders.length === 0" type="info" elevation="2" class="mt-4">
            No sales orders found. Please adjust your filters.
          </VAlert>
          <VTable v-if="!loading && paginatedSalesOrders.length > 0" class="mt-4">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Sales Order Number</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Payment Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(salesOrder, index) in paginatedSalesOrders" :key="salesOrder.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ salesOrder.customer_name }}</td>
                <td>{{ salesOrder.store_name }}</td>
                <td>{{ salesOrder.sales_order_number }}</td>
                <td>{{ formatNumber(Number(salesOrder.total_amount)) }}</td>
                <td>
                  {{ salesOrder.created_at ? new Date(salesOrder.created_at).toLocaleDateString('en-US', {
                    year:
                      'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : 'N/A' }}
                </td>
                <td>{{ salesOrder.payment_type || 'N/A' }}</td>
                <td>
                  <VBtn small @click="viewOrder(salesOrder.sales_order_number)" title="View" icon>
                    <VIcon>ri-eye-line</VIcon>
                  </VBtn>
                  <VBtn small @click="editOrder(salesOrder.id)" title="Edit" icon color="primary">
                    <VIcon>ri-pencil-line</VIcon>
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
