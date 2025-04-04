<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import {
  DxFieldChooser,
  DxPivotGrid,
} from 'devextreme-vue/pivot-grid'
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

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
  customer_id: number
  store_id: number
  store_name: string
  total_amount: number
  payment_type: string
}

interface SalesOrderResource {
  id: number
  sales_order_number: string
  customer_name: string
  store_id: number
  store_name: string
  total_amount: number
  payment_type: string
}

// State Variables
const filteredSalesReceipts = ref<SalesReceiptResource[]>([])
const stores = ref<Store[]>([])
const loading = ref(false)
const filtersLoading = ref(false)
const error = ref<string | null>(null)
const stores_filtered = ref<Store[]>([])

// const salesReceipt = ref<SalesReceiptResource>();
const salesOrder = ref<SalesOrderResource>()

// Filter state variables
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)
const selectedStore = ref<Store | null>(null)
const showFilterError = ref(false)
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null

const dataSource = ref<PivotGridDataSource>()

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Readonly fields for totals
const totalSalesOrderCount = ref(0)
const totalSalesOrderValue = ref('0.00')

// Router for navigation
const router = useRouter()

// Fetch stores based on selected branch
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`)

    stores.value = response.data
    stores_filtered.value = stores.value
    if (stores.value.filter(item => item.store_type_id == 2).length > 0)
      stores_filtered.value = stores.value.filter(item => item.store_type_id == 2)
  }
  catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Fetch filtered sales orders based on selected criteria
const fetchFilteredSalesOrders = async (): Promise<void> => {
  if (!fromDate.value || !toDate.value) {
    showFilterError.value = true

    return
  }
  showFilterError.value = false
  loading.value = true

  try {
    const response = await makeApiCall<SalesReceiptResource[]>('POST', '/my-sales-receipts', {
      from_date: fromDate.value,
      to_date: toDate.value,

      // store_id: selectedStore.value.id,
      // page: currentPage.value,
      // per_page: itemsPerPage.value,
    })

    if (response && Array.isArray(response.data)) {
      filteredSalesReceipts.value = response.data
      dataSource.value = new PivotGridDataSource({
        fields: [{
          caption: 'Customer Name',
          dataField: 'customer_name',
          area: 'row',
          sortBySummaryField: 'Total',
          expanded: true,
        },
        {
          caption: 'Receipt Number',
          dataField: 'sales_receipt_number',
          area: 'row',

          // sortBySummaryField: 'Total',
          expanded: true,
        },
        {
          caption: 'Payment Type',
          dataField: 'payment_type',
          area: 'row',
          expanded: true,
        },
        {
          dataField: 'receipt_date',
          dataType: 'date',
          area: 'row',
          expanded: true,
        },
        {
          groupName: 'date',
          groupInterval: 'month',
          visible: false,
        },
        {
          caption: 'Payment Method',
          dataField: 'payment_detail.payment_type',
          area: 'column',
          expanded: true,
        },
        {
          caption: 'Amount Paid',
          dataField: 'payment_detail.amount',
          dataType: 'number',
          summaryType: 'sum',
          format: '#,###.00',
          area: 'data',
        }],
        store: response.data,
      })

      // updateTotals();
    }
    else {
      filteredSalesReceipts.value = []

      // updateTotals();
    }
  }
  catch (err) {
    error.value = 'Error fetching sales orders.'
  }
  finally {
    loading.value = false
  }
}

// Update total sales order count and value
const updateTotals = () => {
  totalSalesOrderCount.value = filteredSalesReceipts.value.length

  const totalValue = filteredSalesReceipts.value.reduce((sum, order) => sum + (order.total_amount || 0), 0)

  totalSalesOrderValue.value = formatNumber(totalValue)
}

const formattedSalesReceipts = computed(() =>
  filteredSalesReceipts.value.map(order => ({
    ...order,
    formattedAmount: formatNumber(order.total_amount || 0),
  })),
)

// Format numbers for display
const formatNumber = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

// Pagination Computations
const paginatedSalesReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value

  return formattedSalesReceipts.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredSalesReceipts.value.length / itemsPerPage.value))

// Navigate to sales order details
const viewOrder = (salesReceiptNumber: string) => router.push({ name: 'sales-receipt', params: { no: salesReceiptNumber } })

// Initial data fetch
// fetchStores();
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="headline">
            All Sales Receipts
          </VCardTitle>

          <!-- Loading and Error Messages -->
          <VAlert v-if="loading" type="info" elevation="2">
            Loading Releases...
          </VAlert>
          <VAlert v-if="filtersLoading" type="info" elevation="2">
            Loading filters...
          </VAlert>
          <VAlert v-if="error" type="error" elevation="2">
            {{ error }}
          </VAlert>
          <VAlert v-if="showFilterError" type="error" elevation="2">
            Please select date range.
          </VAlert>

          <!-- Filter Section -->
          <VRow class="mt-6">
            <VCol cols="12" md="6">
              <VTextField v-model="fromDate" label="From Date" type="date" required />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="toDate" label="To Date" type="date" required />
            </VCol>
          </VRow>

          <!-- View Filtered Data Button -->
          <VRow class="mt-4">
            <VCol cols="12" class="text-right">
              <VBtn color="primary" @click="fetchFilteredSalesOrders">
                View
              </VBtn>
            </VCol>
          </VRow>

          <!-- Readonly Input Fields for Total Sales Orders -->
          <!--
            <v-row class="mt-4">
            <v-col cols="12" md="3">
            <v-text-field v-model="totalSalesOrderCount" label="Total Receipts  (Number)" readonly />
            </v-col>
            <v-col cols="12" md="3">
            <v-text-field v-model="totalSalesOrderValue" label="Total Receipts Value (Total Amount)" readonly />
            </v-col>
            </v-row>
          -->
          <DxPivotGrid id="pivotgrid" ref="pivotGridRef" :data-source="dataSource" :allow-sorting-by-summary="true"
            :allow-filtering="true" :show-borders="true" :show-column-grand-totals="true" :show-row-grand-totals="true"
            :show-row-totals="false" :show-column-totals="false">
            <DxFieldChooser :enabled="true" :height="400" />
          </DxPivotGrid>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
/* Add your styles here */
</style>
