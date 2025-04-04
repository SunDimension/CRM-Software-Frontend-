<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { formatDate, formatNumber } from '@/types/globalTypes'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter

const salesOrder = ref<any>()

const printReceipt = () => {
  window.print()
}

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<any>('GET', `/cashier-expenses/${salesOrderNo}`)

    salesOrder.value = response.data
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
          <strong><u>EXPENSE</u></strong>
        </h3>
      </VCol>
    </VRow>

    <!-- Sales Receipt Info -->
    <VRow class="mt-2 sales-receipt-info">
      <VCol>
        <VCard class="mt-4">
          <VCardTitle />
          <VCardText>
            <!-- Sales Receipt Info -->

            <VRow class="mt-2">
              <VCol>
                <!-- <h4>ID: {{ salesOrder?.id }}</h4> -->
              </VCol>
            </VRow>

            <!-- Customer and Store Details (Grid Layout) -->
            <VRow class="mt-2">
              <VCol cols="6">
                <h4>Expense: {{ salesOrder?.expense_line }}</h4>
              </VCol>
              <VCol cols="6">
                <h4>Branch: {{ salesOrder?.branch_name }}</h4>
              </VCol>
            </VRow>
            <VRow class="mt-2">
              <VCol cols="6">
                <h4>Amount: &#8358; {{ formatNumber(salesOrder?.amount) }}</h4>
              </VCol>
              <VCol cols="6">
                <h4>Date: {{ formatDate(salesOrder?.date) }}</h4>
              </VCol>
            </VRow>
            <VRow class="mt-2">
              <VCol cols="6">
                <h4>Store: {{ salesOrder?.store_name }}</h4>
              </VCol>
              <VCol cols="6">
                <h4>Cashier: {{ salesOrder?.user_name }}</h4>
              </VCol>
            </VRow>
            <VRow class="mt-2">
              <VCol cols="6">
                <h4>Narration: {{ salesOrder?.narration }}</h4>
              </VCol>

            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
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
