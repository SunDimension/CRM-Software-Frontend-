<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { formatDate, formatNumber } from '@/types/globalTypes';

const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter
const salesOrder = ref<any>()
const totalAmount = ref<number>(0)

const fetchReceiveOrder = async () => {
  try {
    const response = await makeApiCall<any>('GET', `/receive-orders/${salesOrderNo}`)

    salesOrder.value = response.data
    totalAmount.value = response.data.receiveItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }
  catch (error) {
    console.error('Error fetching Info:', error)
  }
}

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  fetchReceiveOrder()
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
          <strong><u>Store Receipt</u></strong>
        </h3>
      </VCol>
    </VRow>

    <!-- Sales Receipt Info -->
    <VRow class="mt-2 sales-receipt-info">
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>ID: </h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.id }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Vendor:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ salesOrder?.vendor_name }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <VRow>
          <VCol cols="5">
            <h4>Date:</h4>
          </VCol>
          <VCol cols="7" class="value">
            {{ formatDate(salesOrder?.receive_date) }}
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="6">
        <!--
          <VRow>
          <VCol cols="5">
          <h4>Terms:</h4>
          </VCol>
          <VCol cols="7" class="value">
          {{ salesOrder?.payment_type }}
          </VCol>
          </VRow>
        -->
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

    <VRow class="mt-2">
      <VCol cols="12">
        <!-- Product Table -->
        <VCard class="mt-4" col="12" md="6">
          <VCardTitle>
            <h4>Product Details</h4>
          </VCardTitle>
          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <!-- <th>Select</th> -->
                  <!-- <th>S/N</th> -->
                  <th>Product</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <!-- <th>Discount</th> -->
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in salesOrder?.receiveItems" :key="index">
                  <!-- <td>{{ index + 1 }}</td> -->
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatNumber(item.unit_price) }}</td>
                  <!-- <td>{{ formatNumber(item.discount) }}</td> -->
                  <td>{{ formatNumber(item.quantity * item.unit_price) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td />
                  <td />
                  <!-- <td /> -->
                  <th>TOTAL</th>
                  <th>{{ formatNumber(totalAmount) }}</th>
                </tr>
              </tfoot>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
  <!-- Use NotificationModal Component -->
</template>

<style scoped>
.business-header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  font-size: 0.9rem;
}

.business-name {
  color: red;
}

.small-header {
  font-size: 8pt;
  /* Smaller than default headers */
}

.small-text {
  font-size: 0.8rem;
  /* For general text */
}

.business-address,
.business-phone {
  margin: 5px 0;
}

.sales-receipt-title {
  text-decoration: underline;
  font-weight: bold;
  font-size: 12pt;
}

.sales-receipt-page {
  padding: 20px;
  font-size: 12pt;
}

.text-right {
  text-align: right;
}

.v-data-table {
  margin-top: 20px;
}

.v-card-title h4 {
  font-size: 8pt;
  /* Adjust card titles */
}

.v-data-table th,
.v-data-table td {
  font-size: 8pt;
  /* Adjust table font size */
}
</style>
