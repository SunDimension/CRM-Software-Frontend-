<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import type { SalesOrderResource } from '@/types/globalTypes'
import { formatDate, formatNumber } from '@/types/globalTypes'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter

const salesOrder = ref<SalesOrderResource>()
const printReceipt = () => {
  window.print()
}

// Dummy data for financials
const totalAmount = ref(3500)
const creditAmount = ref(3500)
const amountPayable = ref(3500)

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesOrderResource>('GET', `/sales-order-info/${salesOrderNo}`)

    salesOrder.value = response.data
    totalAmount.value = salesOrder.value.total_amount
    creditAmount.value = salesOrder.value.credit_balance
    amountPayable.value = salesOrder.value.total_amount - salesOrder.value.credit_balance
  }
  catch (error) {
    console.error('Error fetching Info:', error)
  }
}

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  fetchSalesOrder()
})
</script>

<template>
  <VContainer class="sales-receipt-page" fluid>
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
          <strong><u>INVOICE (CREDIT)</u></strong>
        </h3>
      </VCol>
    </VRow>

    <!-- Sales Receipt Info -->
    <VRow class="mt-2 sales-receipt-info">
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Order Number: </h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.sales_order_number }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Customer:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.customer_name }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Date:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ formatDate(salesOrder!?.created_at) }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Terms:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.payment_type }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Branch:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.branch_name }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Store:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.store_name }}
          </VCol>
        </VRow>
      </VCol>
    </VRow>
    <br>

    <!-- Product Table -->
    <VCard class="mt-4">
      <VCardTitle>
        <h4>Product Details</h4>
      </VCardTitle>
      <VCardText>
        <VTable class="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Quantity</th>
              <th>Unit Price (N)</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesOrder?.items" :key="index">
              <td>{{ item.product_name }}</td>
              <td>{{ item.store_name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatNumber(item.unit_price) }}</td>
              <td>{{ formatNumber(item.discount) }}</td>
              <td>{{ formatNumber(item.quantity * item.unit_price) }}</td>
            </tr>
            <tr>
              <td colspan="4" />
              <th>Total</th>
              <td>{{ formatNumber(totalAmount) }}</td>
            </tr>
            <tr>
              <td colspan="4" />
              <th>Credit Approved</th>
              <td>{{ formatNumber(creditAmount) }}</td>
            </tr>
            <tr>
              <td colspan="4" />
              <th>Amount Payable</th>
              <td>{{ formatNumber(amountPayable) }}</td>
            </tr>
          </tbody>
        </VTable>
        <VRow class="sales-rep-row">
          <VCol cols="5">
            <h4 class="sales-rep-label">
              Sales Rep: {{ salesOrder?.user_name }}
            </h4>
          </VCol>
          <VCol cols="5">
            <h4 class="sales-rep-label">
              Credit Approved By: {{ salesOrder?.user_name }}
            </h4>
          </VCol>
        </VRow>
        <VRow justify="end" class="mt-4">
          <VBtn color="primary" class="no-print" @click="printReceipt">
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
/* Overall Page Style */
.sales-receipt-page {
  padding: 20px;
  background-color: #f9f9f9;
  /* Light background for contrast */
}

.business-header {
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
}

.business-name {
  color: #c70616f0;
  /* Brand color */
  font-size: 24px;
  /* Larger font size */
}

.business-address,
.business-phone {
  margin: 5px 0;
}

.sales-receipt-title {
  font-size: 28px;
  /* Increased size */
  color: #c70616f0;
  /* Consistent with business name */
  text-decoration: underline;
}

.text-right {
  text-align: right;
}

/* Product Table Styles */
.product-table {
  width: 100%;
  /* Full width */
  margin-top: 20px;
  border-collapse: collapse;
  /* Remove gaps between cells */
}

.product-table th,
.product-table td {
  border: 1px solid #ddd;
  /* Light border for table cells */
  padding: 8px;
  /* Add padding for better readability */
  text-align: center;
  /* Center text */
}

.product-table th {
  background-color: #3f51b5;
  /* Header color */
  color: white;
  /* White text */
}

.product-table tr:nth-child(even) {
  background-color: #f2f2f2;
  /* Zebra striping */
}

.product-table tr:hover {
  background-color: #ddd;
  /* Highlight on hover */
}

/* Sales Rep Style */
.sales-rep-row {
  margin-top: 10px;
  /* Adjust margin for spacing */
}

.sales-rep-label {
  margin-bottom: 0;
  /* Remove bottom margin from the label */
  font-weight: bold;
  /* Bold label for emphasis */
}

h4 {
  margin: 0;
  /* Remove default margin */
}

.sales-receipt-info h4 {
  margin-bottom: 2px;
  /* Reduce bottom margin */
}

.sales-receipt-info .value {
  margin-top: 0;
  /* Ensure no extra space above the value */
}
</style>
