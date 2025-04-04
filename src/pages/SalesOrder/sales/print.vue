<template>
  <v-container class="sales-receipt-page" fluid>
    <!-- Logo and Business Info Section -->
    <v-row justify="start" class="mb-3">
      <v-btn color="blue" @click="router.back()" class="go-back">
       Go Back
      </v-btn>
    </v-row>
    <v-row class="business-header" justify="space-between" align="center">
      <v-col cols="8">
        <h2 class="business-name">Hamir Global Venture</h2>
        <h4 class="business-address">
          {{ branchDetails ? branchDetails.address : 'Loading address...' }}</h4>
        <h4 class="business-phone"> Phone: {{ branchDetails ? branchDetails.phone : 'Loading phone...' }}</h4> 
      </v-col>
      <v-col cols="4" class="text-right">
        <v-img src="/logo.png" alt="Business Logo" max-width="150"></v-img>
      </v-col>
    </v-row>

    <!-- Sales Receipt Title -->
    <v-row class="text-center mt-4">
      <v-col>
        <h3 class="sales-receipt-title">
          <strong><u>INVOICE</u></strong>
        </h3>
      </v-col>
    </v-row>

    <!-- Sales Receipt Info -->
    <v-row class="mt-2 sales-receipt-info">
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Order Number: </h4>
          </v-col>
          <v-col cols="7" class="value">{{ salesOrder?.sales_order_number }}</v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Customer:</h4>
          </v-col>
          <v-col cols="7" class="value">{{ salesOrder?.customer_name }}</v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Date:</h4>
          </v-col>
          <v-col cols="7" class="value">{{ formatDate(salesOrder!?.created_at) }}</v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Terms:</h4>
          </v-col>
          <v-col cols="7" class="value">{{ salesOrder?.payment_type }}</v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Branch:</h4>
          </v-col>
          <v-col cols="7" class="value">{{ salesOrder?.branch_name }}</v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col cols="5">
            <h4>Store:</h4>
          </v-col>
          <v-col cols="7" class="value">{{ salesOrder?.store_name }}</v-col>
        </v-row>
      </v-col>
    </v-row>
    <br>

    <!-- Product Table -->
    <v-card class="mt-4">
      <v-card-title>
        <h4>Product Details</h4>
      </v-card-title>
      <v-card-text>
        <v-table class="product-table">
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
              <td colspan="4"></td>
              <th>Total</th>
              <td>{{ formatNumber(totalAmount) }}</td>
            </tr>
            <tr>
              <td colspan="4"></td>
              <th>Total Quantity</th>
              <td>{{ totalQuantity }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-row class="sales-rep-row">
          <v-col cols="5">
            <h4 class="sales-rep-label">Sales Rep: {{ salesOrder?.user_name }}</h4>
          </v-col>

        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { SalesOrderResource, formatDate, formatNumber,Branch } from '@/types/globalTypes';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const salesOrderNo = route.params.no; // Access the route parameter
const router = useRouter();

const salesOrder = ref<SalesOrderResource>();
const branchDetails = ref<Branch | null>(null);
const totalAmount = ref(3500);

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesOrderResource>('GET', `/sales-order-info/${salesOrderNo}`);
    salesOrder.value = response.data;
    totalAmount.value = salesOrder.value.total_amount;
  } catch (error) {
    console.error('Error fetching sales order:', error);
  }
};

const fetchBranchDetails = async (branchId: number) => {
  try {
    const response = await makeApiCall<Branch>('GET', `/branches/${branchId}`);
    branchDetails.value = response.data;
  } catch (error) {
    console.error('Error fetching branch details:', error);
    branchDetails.value = null; // Reset on error
  }
};

const totalQuantity = computed(() => {
  return salesOrder.value?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

onMounted(async () => {
  await fetchSalesOrder();
  if (salesOrder.value?.branch_id) {
    await fetchBranchDetails(salesOrder.value.branch_id);
  }
});

</script>

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

td{
  text-align: left !important
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
.go-back{
  background-color:#0624d0;
  color:white 
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
