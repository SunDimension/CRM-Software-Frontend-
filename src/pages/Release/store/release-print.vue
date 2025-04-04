<template>
  <v-container class="sales-receipt-page" fluid>
    <!-- Sales Receipt Card -->
    <v-card class="mt-4">
      <v-card-text>
        <!-- Logo and Business Info Section -->
        <v-row class="business-header" justify="space-between" align="center">
          <v-col cols="8">
            <h2 class="business-name">Hamir Global Venture</h2>
            <h4 class="business-address">
              Old Karu, Behind Adonai Hospital, Mararaba, Nasarawa State, Nigeria
            </h4>
            <h4 class="business-phone">Phone: 09043193540, 08022056781</h4>
          </v-col>
          <v-col cols="4" class="text-right">
            <v-img src="/logo.png" alt="Business Logo" max-width="150"></v-img>
          </v-col>
        </v-row>

        <!-- Sales Receipt Title -->
        <v-row class="text-center mt-4">
          <v-col>
            <h3 class="sales-receipt-title">
              <strong><u>ITEM RELEASE</u></strong>
            </h3>
          </v-col>
        </v-row>

        <!-- Sales Receipt Info -->
        <v-row class="mt-2 sales-receipt-info">
          <v-col cols="6">
            <h4>Release ID.: {{ salesRelease?.id }}</h4>
          </v-col>
          <v-col cols="6">
            <h4>Customer: {{ salesRelease?.customer_name }}</h4>
          </v-col>
          <v-col cols="6">
            <h4>Release Date: {{ formatDate(salesRelease?.release_date) }}</h4>
          </v-col>
          <v-col cols="6">
            <h4>Branch: {{ salesRelease?.branch_name }}</h4>
          </v-col>
          <v-col cols="6">
            <h4>Store of Release: {{ salesRelease?.store_name }}</h4>
          </v-col>
          <v-col cols="6">
            <h4>Released By: {{ salesRelease?.user_name }}</h4>
          </v-col>
        </v-row>
        <br />

        <!-- Product Table -->
        <v-table class="product-table">
          <thead>
            <tr>
              <th colspan="3" class="text-center">Items Released</th>
            </tr>
            <tr>
              <th>Product</th>
              <!-- <th>Store</th> -->
              <th>Quantity</th>
              <!-- <th>Unit Price (N)</th> -->
              <th>Amount (N)</th>
              <!-- <th>Status</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesRelease?.items" :key="index">
              <td>{{ item.product_name }}</td>
              <!-- <td>{{ item.store_name }}</td> -->
              <td>{{ item.quantity }}</td>
              <td>{{ formatNumber(item.amount) }}</td>
              <!-- <td>{{ formatNumber(item.) }}</td> -->
              <!-- <td>{{ item.store_name }}</td> -->
            </tr>
            <!-- <tr>
              <td></td>
              <td></td>
              <td></td>
              <th>TOTAL</th>
              <th>{{ formatNumber(totalAmount) }}</th>
              <td></td>
            </tr>
        
            <tr v-for="(item, index) in salesReceipt?.payment_detail" :key="index">
              
              <td></td>
              <td></td>
              <td></td>
              <th>{{item.payment_type.toUpperCase()}}</th>
              <th>{{ formatNumber(item.amount ?? 0) }}</th>
              <td></td>

            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <th>BALANCE</th>
              <th>{{ totalAmount && salesRelease ?  formatNumber(totalAmount - salesReceipt.amount_paid): 'Loading..' }}</th>
              <td></td>

            </tr> -->
          </tbody>
        </v-table>

        <!-- Sales Rep and Cashier Info -->
        <!-- <v-row class="sales-rep-row mt-2">
          <v-col cols="6">
            <h4 class="sales-rep-label">Sales Rep: {{ salesOrder?.user_name }}</h4>
          </v-col>
          <v-col cols="6">
            <h4 class="cashier-label">Cashier: {{ salesRelease?.cashier_name }}</h4>
          </v-col>
        </v-row> -->

        <!-- Print Button -->
        <v-row justify="end" class="mt-4">
          <v-btn color="primary" @click="printReceipt">
            Print 
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { SalesOrderResource, SalesReleaseResource, formatDate, formatNumber } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const salesOrderNo = route.params.no;

const salesRelease = ref<SalesReleaseResource>();
// const salesReceipt = ref<SalesReceiptResource>();
const salesOrder = ref<SalesOrderResource>();

const totalAmount = ref(3500);

const printReceipt = () => {
  window.print();
};

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesReleaseResource>('GET', '/release/' + salesOrderNo);
      salesRelease.value = response.data;
    // salesOrder.value = salesReceipt.value.sales_order;
    // totalAmount.value = salesOrder.value?.total_amount;
  } catch (error) {
    console.error('Error fetching Info:', error);
  }
};

onMounted(() => {
  fetchSalesOrder();
});
</script>

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
  v-btn {
    display: none;
  }
  .sales-receipt-page {
    padding: 0;
  }
  @page {
    margin: 1cm;
  }
}
</style>
