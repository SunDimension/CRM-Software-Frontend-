<template>
  <v-container class="sales-receipt-page" fluid>
    <!-- Logo and Business Info Section -->
  
    <v-row class="mt-2">
      <v-col cols="12" md="9"> 
      <!-- Sales Receipt Info -->
      <h2>Initiate Release</h2>
      <v-row class="mt-2">
        <v-col>
          <h4>Receipt Number: {{ salesOrder?.sales_receipt_number }}</h4>
        </v-col>
      </v-row>

      <!-- Customer and Store Details (Grid Layout) -->
      <v-row class="mt-2">
        <v-col cols="4">
          <h4>Customer Name: {{ salesOrder?.sales_order.customer_name }}</h4>
        </v-col>
        <v-col cols="4">
          <h4>Branch: {{ salesOrder?.sales_order.branch_name }}</h4>
        </v-col>
        <v-col cols="4">
          <h4>Store: {{ salesOrder?.sales_order.store_name }}</h4>
        </v-col>
      </v-row>
       <!-- Product Table -->
    <v-card class="mt-4">
      <v-card-title>
        <h4>Items To Release</h4>
      </v-card-title>
      <v-card-text>
        <!-- <v-data-table :headers="tableHeaders" :items="salesOrder?.items" class="elevation-1">
          
        </v-data-table> -->
        <v-table>
          <thead>
            <tr>
             
            <th>
              <v-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
              ></v-checkbox>

            </th>
              <th>Product</th>
              <th>Store</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesOrder?.sales_order.items" :key="index">
              <td>
                <!-- <v-checkbox label="Cash" value="Cash" v-model="item.id" @change="addItemForRelease"></v-checkbox> -->
                <v-checkbox
                v-model="selectedItems"
                :value="item.id"
              ></v-checkbox>
              </td>
              <td>{{ item.product_name }}</td>
              <td>{{ item.store_name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatNumber(item.unit_price) }}</td>
              <td>{{ formatNumber(item.discount) }}</td>
              <td>{{ formatNumber(item.quantity* (item.unit_price-item.discount)) }}</td>
            </tr>
          </tbody>
          <!-- <tfoot>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <th>TOTAL</th>
              <th>{{ formatNumber(totalAmount) }}</th>
            </tr>
          </tfoot> -->
        </v-table>

      </v-card-text>
    </v-card>

      </v-col>
      <v-col cols="12" md="3">
        <!-- <h2></h2> -->
        <v-card class="mt-4">
      <v-card-title>
        <h4>Receipt Order</h4>
      </v-card-title>
      <v-card-text>
        <!-- <v-data-table :headers="tableHeaders" :items="salesOrder?.items" class="elevation-1">
          
        </v-data-table> -->
        <v-row>
          <v-col cols="12">
            <v-table>
            <thead>
              <tr>
              
                <th>Product</th>
                <!-- <th>Store</th> -->
                <th>QTY</th>
                
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredItems" :key="index">
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity }}</td>
                
              </tr>
            </tbody>
            <!-- <tfoot>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <th>TOTAL</th>
                <th>{{ formatNumber(totalAmount) }}</th>
              </tr>
            </tfoot> -->
          </v-table>
        </v-col>
          <v-col cols="12" class="form-actions">
             <!-- <div class="form-actions"> -->
          <v-btn @click="saveTransaction" :disabled="filteredItems?.length<=0">
            Release Items
            </v-btn>
        <!-- </div> -->
          </v-col>
        </v-row>

      </v-card-text>
    </v-card>
      </v-col>
    </v-row>

   
    <v-row>

      <v-col>
      
     
        <!-- Delete Button -->
        
        <br/>

          <!-- For Credit Payment -->
          <v-row v-if="paymentType === 'Credit'">
            <v-col cols="12" md="4">
              <v-text-field label="Credit Limit" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field label="Credit Balance" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field label="Credit Amount" type="number"></v-text-field>
            </v-col>
          </v-row>

      </v-col>
    </v-row>
  </v-container>
  
</template>

<script setup lang="ts">
import { router } from '@/plugins/router';
import { makeApiCall } from '@/services/apiService';
import { Release, SalesReceiptResource, formatNumber } from '@/types/globalTypes';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const salesOrderNo = route.params.no; // Access the route parameter
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;
const salesOrder = ref<SalesReceiptResource>();

const totalAmount = ref(3500);
const amountPaid = ref(3000);
const balanceAmount = ref(500);
const paymentType = ref('Cash');
const selectedItems = ref<number[]>([]);
  const selectAll = ref(false);

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesReceiptResource>('GET', '/new-release-order-info/'+salesOrderNo+'/'+parsedUser.store_id);
    salesOrder.value = response.data;
    totalAmount.value = salesOrder.value.total_amount; 
    // paymentType.value = salesOrder.value.payment_type;
    // amountPaid.value = salesOrder.value.total_amount; 
    
  } catch (error) {
    console.error('Error fetching Info:', error);
  }
};


// Toggle all items when the "Select All" checkbox is clicked
const toggleSelectAll = () => {
  if (selectAll.value) {
    // If selecting all, add all item IDs to `selectedItems`
    selectedItems.value = salesOrder.value?.sales_order.items.map(item => item.id);
  } else {
    // If deselecting all, clear `selectedItems`
    selectedItems.value = [];
  }
};

// Watch selectedItems to keep `selectAll` in sync with individual selections
watch(selectedItems, (newVal) => {
  if (newVal.length === salesOrder.value?.sales_order.items.length) {
    selectAll.value = true;
  } else {
    selectAll.value = false;
  }
});

// Computed property to filter items by selectedItems
const filteredItems = computed(() => {
  return salesOrder.value?.sales_order.items.filter(item => selectedItems.value.includes(item.id));
});


const saveTransaction = async () => {
    try {
        const payload: any = {
          sales_receipt_id: salesOrder.value?.id,
            customer_id: salesOrder.value?.customer_id,
            branch_id: salesOrder.value?.branch_id,
            store_id: parsedUser.store_id,
            user_id: parsedUser.id,
            release_date: new Date().toISOString(),
            items: filteredItems.value
        };

      const recieptResponse =  await makeApiCall<Release>('POST',`/release`, payload);
      router.push({ name: 'release-print', params:{ no: recieptResponse.data.id} });
      
      console.log("Sales Release created successfully.");
    } catch (error: any) {
        // Improve error handling
        if (error.response) {
            console.error("Error saving transaction:", error.response.data);
        } else {
            console.error("Error saving transaction:", error.message);
        }
    }
};

const generateSalesOrderNumber = () => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
    const uniqueId = Math.floor(Math.random() * 10000);
    return `${formattedDate}-${uniqueId}`;
};

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  fetchSalesOrder();
});

</script>

<style scoped>
.business-header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.business-name {
  color: red;
}

.business-address,
.business-phone {
  margin: 5px 0;
}

.sales-receipt-title {
  text-decoration: underline;
  font-weight: bold;
}

.sales-receipt-page {
  padding: 20px;
}

.text-right {
  text-align: right;
}

.v-data-table {
  margin-top: 20px;
}
</style>
