<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import type { SalesOrderResource, SalesReceiptResource } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'

const route = useRoute()
const salesOrderNo = route.params.no

// const router = useRouter();

const salesReceipt = ref<SalesReceiptResource>()
const salesOrder = ref<SalesOrderResource>()

const totalAmount = ref(0)
const totalPaid = ref(0)

const printReceipt = () => {
  window.print()
}

const totalQuantity = computed(() => {
  return salesOrder.value?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
})

const printReceiptx = () => {
  router.push({ name: 'sales-receipt-x', params: { no: salesOrderNo } })
}

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesReceiptResource>('GET', `/sales-receipt-info/${salesOrderNo}`)

    salesReceipt.value = response.data
    salesOrder.value = salesReceipt.value.sales_order
    totalAmount.value = salesOrder.value?.total_amount
    totalPaid.value = salesReceipt.value.payment_detail.reduce((acc, curr) => Number(acc) + ((curr.payment_type !== 'Credit') ? Number(curr.amount) : 0), 0)
  }
  catch (error) {
    console.error('Error fetching Info:', error)
  }
}

onMounted(() => {
  fetchSalesOrder()
})
</script>

<template>
  <VContainer class="sales-receipt-page" fluid>
    <!-- Sales Receipt Card -->
    <VCard>
      <VCardText>
        <VRow justify="start" class="mb-3">
          <VBtn color="blue" class="go-back no-print" @click="router.back()">
            Go Back
          </VBtn>
        </VRow>
        <!-- Logo and Business Info Section -->
        <VRow class="business-header" justify="space-between" align="center">
          <VCol cols="8">
            <h2 class="business-name">
              Hamir Global Venture
            </h2>
            <h4 class="business-address">
              Old Karu, Behind Adonai Hospital, Mararaba, Nasarawa State, Nigeria
            </h4>
            <h4 class="business-phone">
              Phone: 09043193540, 08022056781
            </h4>
          </VCol>
          <VCol cols="4" class="text-right">
            <VImg src="/logo.png" alt="Business Logo" max-width="150" />
          </VCol>
        </VRow>

        <!-- Sales Receipt Title -->
        <VRow class="text-center mt-4">
          <VCol>
            <h3 class="sales-receipt-title">
              <strong><u>SALES RECEIPT</u></strong>
            </h3>
          </VCol>
        </VRow>

        <!-- Sales Receipt Info -->
        <VRow class="mt-2 sales-receipt-info">
          <VCol cols="6">
            <h4>Receipt No.: {{ salesReceipt?.sales_receipt_number }}</h4>
          </VCol>
          <VCol cols="6">
            <h4>Customer Name: {{ salesOrder?.customer_name }}</h4>
          </VCol>
          <VCol cols="6">
            <h4>Receipt Date: {{ salesReceipt?.receipt_date }}</h4>
          </VCol>
          <VCol cols="6">
            <h4>Branch: {{ salesOrder?.branch_name }}</h4>
          </VCol>
          <VCol cols="6">
            <h4>Store: {{ salesOrder?.store_name }}</h4>
          </VCol>
          <VCol cols="6">
            <h4>Payment Method: {{ salesReceipt?.payment_type }}</h4>
          </VCol>
        </VRow>
        <br>

        <!-- Product Table -->
        <VTable class="product-table">
          <thead>
            <tr>
              <th colspan="5" class="text-center">
                Product Details
              </th>
            </tr>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Quantity</th>
              <th>Unit Price (N)</th>
              <th>Amount (N)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesOrder?.items" :key="index">
              <td>{{ item.product_name }}</td>
              <td>{{ item.store_name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatNumber(item.unit_price) }}</td>
              <td>{{ formatNumber(item.quantity * item.unit_price) }}</td>
            </tr>
            <tr>
              <td />
              <td />
              <td />
              <th>TOTAL</th>
              <th>{{ formatNumber(totalAmount) }}</th>
            </tr>

            <tr v-for="(item, index) in salesReceipt?.payment_detail" :key="index">
              <td />
              <td />
              <td />
              <th>{{ item.payment_type.toUpperCase() }}</th>
              <th>{{ formatNumber(item.amount ?? 0) }}</th>
            </tr>

            <tr>
              <td />
              <td />
              <td>{{ totalQuantity }}</td>
              <th>BALANCE</th>
              <th>
                {{ totalAmount && salesReceipt ? formatNumber(totalAmount - totalPaid) : 'Loading..' }}
              </th>
            </tr>
          </tbody>
        </VTable>

        <!-- Sales Rep and Cashier Info -->
        <VRow class="sales-rep-row mt-2">
          <VCol cols="6">
            <h4 class="sales-rep-label">
              Sales Rep: {{ salesOrder?.user_name }}
            </h4>
          </VCol>
          <VCol cols="6">
            <h4 class="cashier-label">
              Cashier: {{ salesReceipt?.cashier_name }}
            </h4>
          </VCol>
        </VRow>

        <!-- Print Button -->
        <VRow justify="end" class="mt-4">
          <VBtn color="primary" class="no-print" @click="printReceiptx">
            View Terminal Printer Version
          </VBtn> &nbsp;
          <VBtn color="primary" class="no-print" @click="printReceipt">
            Print Receipt
          </VBtn>
        </VRow>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<style scoped>
.business-header {
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
}

.business-name {
  color: #c70616f0;
  font-size: 24px;
}

.business-address,
.business-phone {
  margin: 5px 0;
}

.sales-receipt-title {
  font-size: 28px;
  color: #c70616f0;
  text-decoration: underline;
}

.text-right {
  text-align: right;
}

/* Product Table Style */
.product-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.go-back {
  background-color: #0624d0;
  color: white
}

.product-table th {
  background-color: #3f51b5;
  color: white;
}

.product-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.product-table tr:hover {
  background-color: #ddd;
}

/* Sales Rep and Cashier Info */
.sales-rep-row {
  margin-top: 10px;
}

td {
  text-align: left !important
}

.sales-rep-label,
.cashier-label {
  margin-bottom: 0;
  font-weight: bold;
}

/* Print Styling */

@media print {
  v-btn {
    display: none;
  }

  .business-name {
    color: #c70616f0;
    font-size: 13pt !important;
  }

  h4 {
    padding: 0 !important;
    font-size: 9pt !important;
  }

  h3,
  h2 {
    padding: 0 !important;
    font-size: 10pt !important;
  }

  @page {
    margin: 0.3cm !important;
  }

  .product-table {
    width: 100% !important;
    margin-top: 1px !important;
    border-collapse: collapse;
    font-size: 9pt !important;
  }

  .product-table th,
  .product-table td {
    border: 1px solid #ddd;
    padding: 1px !important;
    text-align: center;
    height: fit-content !important;
  }

  .product-table th {
    background-color: #3f51b5;
    color: white;
    font-size: 9pt !important;
    padding: 1px !important;
  }

  .product-table tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .product-table tr:hover {
    background-color: #ddd;
  }

  /* Sales Rep and Cashier Info */
  .sales-rep-row {
    margin-top: 1px !important;
  }

  .v-col {
    padding: 2px !important;
  }

  .sales-rep-label,
  .cashier-label {
    margin-bottom: 0 !important;
    font-weight: bold;
  }

}
</style>
