<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, Customer, GenericSetUp, InventoryItem, Store } from '@/types/globalTypes';
import { computed, onMounted, ref, } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import { default as Create } from '../../customers/customer/add.vue';

// State Variables
// To store the success message

const router = useRouter();

const showReceipt = ref(false);
const receiptData = ref({});
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

const isSaving = ref(false);
const user = computed(() => useAuth.getUserDetails.user);
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;

const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch }); // Static branch
const store = ref<Store>({ id: parsedUser.store_id, name: parsedUser.store, branch_id: 2, store_type_id: 2 });
const storeItems = ref<any[]>([]);

const titles = ref<GenericSetUp[]>([]);
const customerTypes = ref<GenericSetUp[]>([]);
const branches = ref<Branch[]>([]);
const loading = ref(true);

const generateSalesOrderNumber = () => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  const uniqueId = Math.floor(Math.random() * 10000);
  return `SO-${formattedDate}-${uniqueId}`;
};

// Fetch Customers, Products, Branch, Store details
const fetchCustomers = async () => {
  try {
    const response = await makeApiCall<Customer[]>('GET', '/customers');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const titleResponse = await makeApiCall<GenericSetUp[]>('GET', '/titles');
    const customerTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/customer-types');
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches');
    // Assign the API data to ref variables
    titles.value = titleResponse.data;
    customerTypes.value = customerTypeResponse.data;
    branches.value = branchResponse.data;

  } catch (error) {
    console.error('Error fetching data:', error);
    // Consider adding user feedback for error
  } finally {
    loading.value = false;
  }
};

const fetchCustomerDetails = () => {
  const customer = customers.value.find(c => c.id === selectedCustomer.value?.id);
  if (customer) {
    selectedCustomer.value = customer;
    console.log("Customer details:", customer);
  } else {
    console.error('Customer not found');
  }
};

const fetchProducts = async () => {
  try {
    const response = await makeApiCall<InventoryItem[]>('GET', '/my-store-items');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores`);
    stores.value = response.data;
    /*stores_filtered.value = stores.value;
    if (stores.value.filter(item => item.store_type_id == 2).length > 0) {
      stores_filtered.value = stores.value.filter(item => item.store_type_id == 2);
    }*/

  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

// Fetch Product Details based on selection
// Fetch Product Details based on selection (Including Available Quantity)
const fetchProductDetails = async () => {
  if (!selectedProduct.value) return;
  try {
    // Call the backend to fetch the available quantity
    const response = await makeApiCall<any>('GET', `/get-inventory-by-store/${selectedProduct.value?.id}`);
    const product = products.value.find(p => p.id === selectedProduct.value?.id);
    storeItems.value = response.data;

    console.log("store items", storeItems.value)

    if (product) {
      price.value = response.data[0].selling_price;//product.selling_price;
      product.quantity = response.data[0].quantity; // Assign the 'quantity' field

      stores_filtered.value = stores.value.filter(item => 
        storeItems.value.some(allowed => 
            allowed.store_id === item.id && allowed.create_item_id === selectedProduct.value?.id
        )
    );
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
};

// Add product to invoice
const addToInvoice = async () => {
  console.log(!selectedProduct);

  const product = storeItems.value.find(item => item.create_item_id == selectedProduct.value?.id && item.store_id == selectedStore.value?.id);
  console.log(product);
  if (!selectedProduct.value || quantity.value > (product.quantity || 0)) {
    alert('Not enough quantity available!');
    return;
  }

  price.value = product.selling_price;

  invoiceItems.value.push({
    productId: product.create_item_id!,
    quantity: quantity.value,
    price: price.value,
    amount: (price.value - discount.value) * quantity.value,
    discount: discount.value,
    store_id: selectedStore.value?.id
  });

  // Reset after adding to invoice
  selectedProduct.value = null;
  quantity.value = 1;
  price.value = 0;
  store_id.value = 0;
  // stores_filtered.value = stores.value.filter(item=> item.store_type_id ==1);
  stores_filtered.value = stores.value;
  if (stores.value.filter(item => item.store_type_id == 2).length > 0) {
    stores_filtered.value = stores.value.filter(item => item.store_type_id == 2);
  }

};
const getPaymentModeId = (paymentType: string): number | undefined => {
  switch (paymentType.toLowerCase()) {
    case 'cash':
      return 1;  // Assuming 1 is the backend ID for 'Cash'
    case 'bank':
      return 2;  // Assuming 2 is the backend ID for 'Bank'
    case 'paylater':
      return 3;  // Assuming 3 is the backend ID for 'PayLater'
    case 'credit':
      return 4;  // Assuming 4 is the backend ID for 'Credit'
    default:
      return undefined; // Return undefined for invalid types
  }
};

// Delete Selected Items
const deleteSelectedItems = () => {
  invoiceItems.value = invoiceItems.value.filter(item => !item.selected);
};

// Save the Sales Order Transaction
// Define the interface for the Sales Order Response
interface SalesOrderResponse {
  id: number;
  sales_order_number: string;// or string, depending on your API
  // Add other fields that your API returns as necessary
}

// Define the interface for the Item Sold Response
interface ItemSoldResponse {
  id: number; // or string
}

// Define the type for invoice items
interface InvoiceItem {
  productId: number;
  quantity: number;
  price: number;
  amount: number;
  store_id: number;
  discount: number
}

// Define the type for the payment details
interface PaymentDetails {
  item_sold_id?: number | null;
  payment_type: 'Cash' | 'Bank' | 'Paylater'; // Update as per your business logic
  amount_paid: number;
  total_amount: number;
}
const updateItemAmount = (item: any) => {
  item.amount = (item.price - discount.value) * item.quantity;
};

const saveTransaction = async () => {

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
      } as PaymentDetails,
    };

    console.log("Payload to backend:", payload);

    const salesOrderResponse = await makeApiCall<SalesOrderResponse>('POST', '/sales-order', payload);

  
    console.log("Transaction saved successfully:", salesOrderResponse);
    transactionSuccess.value = true;
    router.push({ name: 'salesorder-print', params: { no: salesOrderResponse.data.sales_order_number } });

    console.log("Sales Receipt created successfully.");
  } catch (error: any) {
    // Improve error handling
    if (error.response) {
      console.error("Error saving transaction:", error.response.data);
    } else {
      console.error("Error saving transaction:", error.message);
    }
  }
};

enum PaymentMode {
  Cash = 'Cash',       // Use string literals
  Bank = 'Bank',       // Use string literals
  PayLater = 'PayLater', // Use string literals
  Credit = 'Credit'    // Added Credit as well for consistency
}

const transactionSuccess = ref(false);

const handleQuantityChange = (value: any) => {
  //stores_filtered.value = stores.value;

  stores_filtered.value = stores.value.filter(item => 
        storeItems.value.some(allowed => 
            allowed.store_id === item.id && allowed.create_item_id === selectedProduct.value?.id
        )
  );
  if (stores_filtered.value.filter(item => item.store_type_id == 2).length > 0) {
    console.log("Quanity Change", value);
    const qty = value.target.value;
    if (qty >= 50) {
      stores_filtered.value = stores_filtered.value.filter(item => item.store_type_id == 1);
    }
    else {
      stores_filtered.value = stores_filtered.value.filter(item => item.store_type_id == 2);
    }
  }

}
const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Product') {
    selectedProduct.value = value;
    fetchProductDetails();
    console.log("new sote", storeItems.value);
  
    console.log("new filter", stores_filtered.value);
    console.log("new filter1", selectedProduct.value);

    if (selectedProduct.value) {
      price.value = selectedProduct.value.selling_price;
    }
  } else if (label === 'Customer') {
    selectedCustomer.value = value;
  }
  else if (label === 'store') {
    selectedStore.value = value;

    if (selectedProduct.value) {
      const product2 = storeItems.value.find(p => p.create_item_id === selectedProduct.value?.id && p.store_id === selectedStore.value.id);
      price.value = product2.selling_price;//product.selling_price;
      selectedProduct.value.quantity = product2.quantity; // Assign the 'quantity' field
      console.log(product2)
      console.log("store",selectedStore.value)
      console.log("produt",selectedProduct.value)
    }
  }
};

const handleUpdated = () => {
  fetchCustomers();
};


const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  salesOrderNumber.value = generateSalesOrderNumber();
  fetchCustomers();
  fetchProducts();
  fetchStores();
  fetchProductDetails();
  fetchData();

});
</script>


<template>
  <v-container class="sales-order" fluid>
    <h2>Create Sales Order</h2>

    <!-- Customer Selection -->
    <v-row>
      <v-col>
      
        <!-- <v-row> -->
        <filterSelect :genericOptions="customers" :label_cus="'Customer Name*'"
          @optionSelected="(customer) => handleOptionSelected(customer, 'Customer')" v-model="selectedCustomer" />
        <br />
      </v-col>

      <v-col cols="10" md="3">
        <Create :mode="'create'" @customerCreated="handleUpdated" :titles="titles" :branches="branches"
          :customerTypes="customerTypes" />

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

      <!-- Product Selection -->
      <v-col cols="12" md="3">
        <filterSelect :genericOptions="products" :label_cus="'Product Name*'"
          @optionSelected="(product) => handleOptionSelected(product, 'Product')" v-model="selectedProduct" />
      </v-col>
      <!-- Quantity to Purchase -->
      <v-col cols="12" md="3">
        <v-text-field label="Quantity" v-model="quantity" type="number" min="1"
          @change="handleQuantityChange"></v-text-field>
      </v-col>

            <v-col cols="12" md="3">
        <filterSelect :genericOptions="stores_filtered" :label_cus="'Store'" v-model="store_id"
          @optionSelected="(store) => handleOptionSelected(store, 'store')" />
      </v-col>

      <!-- Available Quantity -->
      <v-col cols="12" md="3">
        <v-text-field label="Available Quantity" :value="selectedProduct?.quantity || 'N/A'" readonly outlined
          persistent-placeholder></v-text-field>
      </v-col>

      
    </v-row>
    <v-row class="form-grid">
      <v-col cols="12" md="3">
        <v-text-field label="Unit Price" v-model="price" readonly></v-text-field>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-text-field label="Discount" v-model="discount" readonly></v-text-field>
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field label="Amount" :value="(price - discount) * quantity" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn @click="addToInvoice" :disabled="!selectedProduct || quantity <= 0">
          Add Item to Invoice
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
          <!-- <td></td> -->
          <!-- <td></td> -->
          <td></td>
          <th>Total</th>
          <td>{{ formatNumber(totalAmount) }}</td>
        </tr>
      </tbody>
    </v-table>

    <!-- Delete Button -->

    <!-- Payment Details -->
    <v-row>
      <v-col>
        <v-textarea label="Narration" v-model="narration" multiline></v-textarea>
      </v-col>

      <!-- Payment Type Selection -->
      <v-col cols="12" md="6">
        <v-radio-group v-model="paymentType" row>
          <v-radio label="Cash" value="Cash"></v-radio>
          <v-radio label="Bank" value="Bank"></v-radio>
          <v-radio label="Credit" value="Credit"></v-radio>
          <!-- <v-radio label="Pay Later" value="PayLater"></v-radio> -->
        </v-radio-group>
      </v-col>
    </v-row>

    <!-- Credit Payment Section -->
    <!-- <v-row v-if="paymentType === 'Credit'">
      <v-col cols="12" md="4">
        <v-text-field label="Credit Limit" type="number"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field label="Credit Balance" type="number"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field label="Credit Amount" type="number"></v-text-field>
      </v-col>
    </v-row> -->

    <v-alert v-if="transactionSuccess" type="success" dismissible>
      Transaction successfully saved!
    </v-alert>

    <!-- Save Button -->
    <div class="form-actions">
      <v-btn @click="saveTransaction" :disabled="!invoiceItems.length || isSaving">
        {{ isSaving ? 'Saving...' : 'Save Transaction' }}
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
