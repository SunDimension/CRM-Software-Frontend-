<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import type { SalesOrderResource, SalesReceiptResource } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'

const route = useRoute()
const salesOrderNo = route.params.no

const salesReceipt = ref<SalesReceiptResource>()
const salesOrder = ref<SalesOrderResource>()

const totalAmount = ref(0)
const totalPaid = ref()

const printReceipt = () => {
  window.print()
}

const printReceiptx = () => {
  router.push({ name: 'sales-receipt', params: { no: salesOrderNo } })
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
    <!-- Logo and Business Info Section -->
    <VRow class="business-header" justify="space-between" align="center">
      <VCol cols="12" class="text-right">
        <VImg src="/logo.png" alt="Business Logo" max-width="120" />
      </VCol>
      <VCol cols="12">
        <!--
          <h2 class="business-name">
          Hamir Global Venture
          </h2>
        -->
        <h4 class="business-address">
          Old Karu, Behind Adonai Hospital, Mararaba, Nasarawa State, Nigeria
        </h4>
        <h4 class="business-phone">
          Phone: 09043193540, 08022056781
        </h4>
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
      <VCol cols="12">
        <h4>Receipt No.: {{ salesReceipt?.sales_receipt_number }}</h4>
        <h4>Customer: {{ salesOrder?.customer_name }}</h4>
        <h4>Receipt Date: {{ salesReceipt?.receipt_date }}</h4>
        <h4>Branch: {{ salesOrder?.branch_name }}</h4>
        <h4>Store: {{ salesOrder?.store_name }}</h4>
        <h4>Payment Method: {{ salesReceipt?.payment_type }}</h4>
      </VCol>
    </VRow>
    <br>

    <h4 class="text-center">
      Product Details
    </h4>

    <p v-for="(item, index) in salesOrder?.items" :key="index">
      {{ item.quantity }} x {{ item.product_name }} ({{ item.store_name }}) = &#8358;{{ formatNumber(item.quantity
        * item.unit_price) }}
    </p>

    <h4>TOTAL: &#8358;{{ formatNumber(totalAmount) }}</h4>

    <h4 v-for="(item, index) in salesReceipt?.payment_detail" :key="index">
      {{ item.payment_type.toUpperCase() }}: &#8358;{{ formatNumber(item.amount ?? 0) }}
    </h4>

    <h4>
      BALANCE: &#8358;{{ totalAmount && salesReceipt ? formatNumber(totalAmount - totalPaid)
        : 'Loading..' }}
    </h4>

    <!-- Sales Rep and Cashier Info -->
    <VRow class="sales-rep-row mt-2">
      <VCol cols="12">
        <h4 class="sales-rep-label">
          Sales Rep: {{ salesOrder?.user_name }}
        </h4>

        <h4 class="cashier-label">
          Cashier: {{ salesReceipt?.cashier_name }}
        </h4>
      </VCol>
    </VRow>

    <!-- Print Button -->
    <VRow justify="end" class="mt-4">
      <VBtn color="primary" class="no-print" @click="printReceiptx">
        View A5 Paper Version
      </VBtn> &nbsp;
      <VBtn color="primary" class="no-print" @click="printReceipt">
        Print Receipt
      </VBtn>
    </VRow>
  </VContainer>
</template>

<style scoped>
/* General Page Style */
.sales-receipt-page {
  padding: 20px;
  background-color: #f9f9f9;
}

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

.sales-rep-label,
.cashier-label {
  margin-bottom: 0;
  font-weight: bold;
}

/* Print Styling */
@media print {
  .sales-receipt-page {
    padding: 2px !important;
    background-color: #f9f9f9;
    font-size: 10px !important;
  }

  .business-header {
    padding-bottom: 0px;
    /* text-align: center; */
    text-align: center !important;
  }

  .business-address,
  .business-phone {
    margin: 0px;
    text-align: center !important;
  }

  .sales-rep-row {
    margin-top: 1px !important;
  }

  .product-table {
    width: 100%;
    margin-top: 2px;
    border-collapse: collapse;
  }

  p {
    margin-block-end: 0 !important;
  }

  .sales-receipt-title {
    font-size: 20px;
    color: #c70616f0;
    text-decoration: underline;
  }

  v-btn {
    display: none;
  }

  .sales-receipt-page,
  th,
  td {
    padding: 0;
    font-size: 10px !important;
  }

  h4 {
    padding: 0;
    font-size: 10px !important;
  }

  h3,
  h2 {
    padding: 0;
    font-size: 12px !important;
  }

  @page {
    margin: 0.1in !important;
  }
}
</style>
