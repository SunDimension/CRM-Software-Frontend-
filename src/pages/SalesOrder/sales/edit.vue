<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, Customer, InventoryItem, Store } from '@/types/globalTypes';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// State Variables
const router = useRouter();
const route = useRoute();
const showReceipt = ref(false);
const receiptData = ref({});
const isSaving = ref(false);
const customers = ref<Customer[]>([]);
const products = ref<InventoryItem[]>([]);
const stores = ref<Store[]>([]);
const stores_filtered = ref<Store[]>([]);
const selectedCustomer = ref<Customer | null>(null);
const selectedProduct = ref<InventoryItem | null>(null);
const selectedStore = ref<Store | null>(null);
const invoiceItems = ref<Array<{ productId: number, quantity: number, price: number, amount: number, selected?: boolean, store_id?: number, discount: number }>>([]);
const salesOrderNumber = ref<string>("");
const quantity = ref<number>(1);
const price = ref<number>(0);
const discount = ref<number>(0);
const narration = ref<string>("");
const paymentType = ref<string>("Cash");
const amountPaid = ref<number>(0);
const totalAmount = computed(() => invoiceItems.value.reduce((sum, item) => sum + item.amount, 0));
const balance = computed(() => totalAmount.value - amountPaid.value);
const store_id = ref<number>(0);
const useAuth = useAuthStore();
const user = computed(() => useAuth.getUserDetails.user);
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;
const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch });
const store = ref<Store>({ id: parsedUser.store_id, name: parsedUser.store, branch_id: 2, store_type_id: 2 });
const storeItems = ref<any[]>([]);
const transactionSuccess = ref(false);

// Fetch Sales Order Details for Editing
const fetchSalesOrder = async () => {
  const salesOrderId = route.params.id; // Assume route param 'id' contains the sales order ID
  try {
    const response = await makeApiCall<any>('GET', `/sales-order/${salesOrderId}`);
    const data = response.data;
    salesOrderNumber.value = data.sales_order_number;
    selectedCustomer.value = customers.value.find(c => c.id === data.customer_id) || null;
    narration.value = data.narration;
    paymentType.value = data.payment_type;
    amountPaid.value = data.amount_paid;

    const storeDetails = stores.value.find(store => store.id === data.store_id);
    if (storeDetails) {
      selectedStore.value = storeDetails;  // Assuming you have `selectedStore` to store this info
    }
    // Populate invoice items
    invoiceItems.value = data.items.map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      amount: (item.unit_price - item.discount) * item.quantity,
      discount: item.discount,
      store_id: item.store_id
    }));
  } catch (error) {
    console.error('Error fetching sales order details:', error);
  }
};

const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores`);
    stores.value = response.data;
    stores_filtered.value = stores.value;
    if (stores.value.filter(item => item.store_type_id == 2).length > 0) {
      stores_filtered.value = stores.value.filter(item => item.store_type_id == 2);
    }

  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchCustomers = async () => {
  try {
    const response = await makeApiCall<Customer[]>('GET', '/customers');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await makeApiCall<InventoryItem[]>('GET', '/create-items');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchProductDetails = async () => {
  if (!selectedProduct.value) return;
  try {
    // Call the backend to fetch the available quantity
    const response = await makeApiCall<any>('GET', `/get-inventory-by-branch-store/${selectedProduct.value?.id}/${parsedUser.branch_id}`);
    const product = products.value.find(p => p.id === selectedProduct.value?.id);
    storeItems.value = response.data;

    if (product) {
      price.value = response.data[0].selling_price;//product.selling_price;
      product.quantity = response.data[0].quantity; // Assign the 'quantity' field
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
};

// Update Transaction
const updateTransaction = async () => {

  if (isSaving.value) {
    alert('Transaction is already being saved!');
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      sales_order_number: salesOrderNumber.value,
      customer_id: selectedCustomer.value?.id,
      branch_id: branch.value?.id,
      store_id: store.value?.id,
      user_id: user.value?.id,
      total_amount: totalAmount.value,
      items: invoiceItems.value.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        store_id: item.store_id,
        discount: item.discount
      })),
      payment: {
        item_sold_id: null,
        payment_type: paymentType.value,
        amount_paid: amountPaid.value,
        total_amount: totalAmount.value,
      },
    };

    console.log("Payload to backend:", payload);
    await makeApiCall('PUT', `/sales-order/${route.params.id}`, payload);
    transactionSuccess.value = true;
    router.push({ name: 'salesorder-print', params: { no: salesOrderNumber.value } });
  } catch (error) {
    console.error("Error updating transaction:", error);
  }
};

const deleteSelectedItems = () => {
  invoiceItems.value = invoiceItems.value.filter(item => !item.selected);
};

const addToInvoice = async () => {
  console.log(!selectedProduct);

  const product = storeItems.value.find(item => item.create_item_id == selectedProduct.value?.id && item.store_id == selectedStore.value?.id);
  console.log(product);
  if (!selectedProduct.value || quantity.value > (product.quantity || 0)) {
    alert('Not enough quantity available!');
    return;
  }
}
const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Product') {
    fetchProductDetails();
    selectedProduct.value = value;

    if (selectedProduct.value) {
      price.value = selectedProduct.value.selling_price;
    }
  } else if (label === 'Customer') {
    selectedCustomer.value = value;
  }
  else if (label === 'store') {
    // console.log("store",value.value)
    selectedStore.value = value;
  }
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const updateItemAmount = (item: any) => {
  item.amount = (item.price - discount.value) * item.quantity;
};

const handleQuantityChange = (value: any) => {
  //stores_filtered.value = stores.value;
  if (stores.value.filter(item => item.store_type_id == 2).length > 0) {
    // console.log("Quanity Change", value);
    const qty = value.target.value;
    if (qty >= 50) {
      stores_filtered.value = stores.value.filter(item => item.store_type_id == 1);
    }
    else {
      stores_filtered.value = stores.value.filter(item => item.store_type_id == 2);
    }
  }

}
// Initial data fetching
onMounted(() => {
  fetchCustomers();
  fetchProducts();
  fetchStores();
  fetchSalesOrder();
  fetchProductDetails()
});
</script>

<template>
  <v-container class="sales-order" fluid>
    <h2>Edit Sales Order</h2>

    <!-- Customer Selection -->
    <v-row>
      <v-col>
        <filterSelect :genericOptions="customers" :label_cus="'Customer Name*'"
          @optionSelected="(customer) => handleOptionSelected(customer, 'Customer')" v-model="selectedCustomer" />
        <br />
      </v-col>
    </v-row>

    <!-- Display Branch and Store Info -->
    <v-row>
      <v-col>
        <v-text-field :value="branch ? branch.name : 'Loading...'" readonly></v-text-field>
      </v-col>
      <v-col>
        <v-text-field :value="store ? store.name : 'N/A'" readonly
          style="border: none; background-color: transparent;"></v-text-field>
      </v-col>
      <v-col>
        <!-- User Name Display -->
        <v-text-field label="Sales Rep" :value="user.name" readonly outlined persistent-placeholder></v-text-field>
      </v-col>
    </v-row>

    <!-- Product and Sales Details (Grouped in One Line) -->
    <v-row class="form-grid">
      <v-col cols="12" md="3">
        <filterSelect :genericOptions="products" :label_cus="'Product Name*'"
          @optionSelected="(product) => handleOptionSelected(product, 'Product')" v-model="selectedProduct" />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field label="Available Quantity" :value="selectedProduct?.quantity || 'N/A'" readonly outlined
          persistent-placeholder></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field label="Quantity" v-model="quantity" type="number" min="1"
          @change="handleQuantityChange"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field label="Unit Price" v-model="price" readonly></v-text-field>
      </v-col>
    </v-row>

    <v-row class="form-grid">
      <v-col cols="12" md="3">
        <v-text-field label="Discount" v-model="discount" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <filterSelect :genericOptions="stores_filtered" :label_cus="'Store'" v-model="store_id"
          @optionSelected="(store) => handleOptionSelected(store, 'store')" />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field label="Amount" :value="(price - discount) * quantity" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn @click="addToInvoice" :disabled="!selectedProduct || quantity <= 0">
          Update Item in Invoice
        </v-btn>
      </v-col>
    </v-row>

    <!-- Invoice Table -->
    <v-table>
      <thead>
        <tr>
          <th>Select</th>
          <th>S/N</th>
          <th>Product</th>
          <th>Store</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Discount</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in invoiceItems" :key="index">
          <td>
            <v-checkbox v-model="item.selected"></v-checkbox>
          </td>
          <td>{{ index + 1 }}</td>
          <td>{{ products.find(p => p.id === item.productId)?.name }}</td>
          <td>{{ stores.find(p => p.id === item.store_id)?.name }}</td>
          <td>
            <v-text-field v-model="item.quantity" type="number" min="1" @input="updateItemAmount(item)"></v-text-field>
          </td>
          <td>{{ formatNumber(item.price) }}</td>
          <td>{{ formatNumber(item.discount) }}</td>
          <td>{{ formatNumber(item.amount) }}</td>
        </tr>
        <tr v-if="totalAmount > 0">
          <td colspan="5">
            <v-btn @click="deleteSelectedItems">
              Delete Selected
            </v-btn>
          </td>
          <td></td>
          <th>Total</th>
          <td>{{ formatNumber(totalAmount) }}</td>
        </tr>
      </tbody>
    </v-table>

    <!-- Payment Details -->
    <v-row>
      <v-col>
        <v-textarea label="Narration" v-model="narration" multiline></v-textarea>
      </v-col>
      <v-col cols="12" md="6">
        <v-radio-group v-model="paymentType" row>
          <v-radio label="Cash" value="Cash"></v-radio>
          <v-radio label="Bank" value="Bank"></v-radio>
          <v-radio label="Credit" value="Credit"></v-radio>
          <v-radio label="Pay Later" value="PayLater"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>

    <!-- Credit Payment Section -->
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

    <v-alert v-if="transactionSuccess" type="success" dismissible>
      Transaction successfully updated!
    </v-alert>

    <!-- Save Button -->
    <div class="form-actions">
      <v-btn @click="updateTransaction" :disabled="!invoiceItems.length || isSaving">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.form-grid {
  margin-bottom: 20px;
}

.payment-details {
  margin-top: 20px;
}
</style>


<style scoped>
.form-grid {
  margin-bottom: 20px;
}
</style>
