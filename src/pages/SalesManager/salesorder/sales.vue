<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, Customer, InventoryItem, Store, User } from '@/types/globalTypes';
import axios from "axios";
import { computed, onMounted, ref, } from 'vue';

// State Variables
 // To store the success message

const showReceipt = ref(false);
const receiptData = ref({});
const customers = ref<Customer[]>([]);
const products = ref<InventoryItem[]>([]);
           
const selectedCustomer = ref<Customer | null>(null);
const selectedProduct = ref<InventoryItem | null>(null);
const invoiceItems = ref<Array<{ productId: number, quantity: number, price: number, amount: number,  selected?: boolean  }>>([]);
const salesOrderNumber = ref<string>("");
const quantity = ref<number>(1);
const price = ref<number>(0);
const discount = ref<number>(0);
const narration = ref<string>("");
const paymentType = ref<string>("Cash");
const amountPaid = ref<number>(0);
const totalAmount = computed(() => invoiceItems.value.reduce((sum, item) => sum + item.amount, 0));
const balance = computed(() => totalAmount.value - amountPaid.value);
const branch = ref<Branch>({ id: 1, name: 'Mararaba Branch',address:'maraba nasarawa state',contact_person:'Mohammed Yusuf',email:'admin@app.com',phone:'08136545821',state_id:9,country_id:1 }); // Static branch
const store = ref<Store>({ id: 1, name: 'Mega Main',branch_id:2,store_type_id:2 });







// Generate Sales Order Number
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
    const response = await makeApiCall<InventoryItem[]>('GET', '/create-items');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};



// const fetchUserDetails = async () => {
//       try {
//         const user = authStore.user;

//         console.log('Logged-in User:', user);

//         if (user && user.branch && user.store) {
//           branch.value = user.branch;
//           store.value = user.store;
//         } else {
//           console.error('User does not have valid branch or store assigned.');
//         }
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     };







// Fetch Product Details based on selection
const fetchProductDetails = () => {
    const product = products.value.find(p => p.id === selectedProduct.value?.id);
    if (product) {
        price.value = product.selling_price; // Assuming this is the field for price
    }
};




// Add product to invoice
const addToInvoice = () => {
    if (!selectedProduct.value) return;
    const product = products.value.find(p => p.id === selectedProduct.value?.id);
    if (!product) return;

    invoiceItems.value.push({
        productId: product.id!,
        quantity: quantity.value,
        price: price.value,
        amount: (price.value - discount.value) * quantity.value
    });

    // Reset after adding to invoice
    selectedProduct.value = null;
    quantity.value = 1;
    price.value = 0;
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
}

// Define the type for the payment details
interface PaymentDetails {
     item_sold_id?: number | null;
    payment_type: 'Cash' | 'Bank' | 'Paylater'; // Update as per your business logic
    amount_paid: number;
    total_amount: number;
}

const saveTransaction = async () => {
    try {
        const payload = {
            sales_order_number: salesOrderNumber.value,
            customer_id: selectedCustomer.value?.id,
            branch_id: branch.value?.id,
            store_id: store.value?.id,
            total_amount: totalAmount.value,
            items: invoiceItems.value.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.price,
            })),
            payment: {
                item_sold_id: null,
                payment_type: paymentType.value,
                amount_paid: amountPaid.value,
                total_amount: totalAmount.value,
            } as PaymentDetails,
        };

        console.log("Payload to backend:", payload);

        const salesOrderResponse = await makeApiCall<SalesOrderResponse>('POST', '/sales-orders', payload);
        const salesOrder = salesOrderResponse.data;
    showReceipt.value = true;
        receiptData.value = {
            salesOrderNumber: salesOrder.sales_order_number,
            totalAmount: totalAmount.value,
            customerName: selectedCustomer.value?.name,
            paymentType: paymentType.value,
            amountPaid: amountPaid.value,
            balance: balance.value,
            invoiceItems: invoiceItems.value,
        };
        console.log("Transaction saved successfully:", salesOrderResponse.data);
        transactionSuccess.value = true;

         setTimeout(() => {
            transactionSuccess.value = false;
        }, 3000); // 3 seconds
    
        const itemSoldIds: number[] = [];

        for (const item of invoiceItems.value) {
            const itemSoldResponse = await axios.post<ItemSoldResponse>(`/api/item-sold`, {
                sales_order_id: salesOrder.id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.price,
                amount: item.amount,
                sales_date: new Date().toISOString(),
            });
            const itemSoldId = itemSoldResponse.data.id; // Assuming the backend response contains the item_sold_id
            itemSoldIds.push(itemSoldId);
        }

        if (paymentType.value === 'Credit') {
            await axios.post(`/api/sales-invoice`, {
                sales_order_id: salesOrder.id,
                product_id: invoiceItems.value[0].productId, // Assuming 1 invoice per order
                unit_price: invoiceItems.value[0].price,
                amount: totalAmount.value,
                sales_invoice_number: `INV-${generateSalesOrderNumber()}`, // Generate unique invoice number
                invoice_date: new Date().toISOString(),
            });
        }   if (itemSoldIds.length > 0) {
            payload.payment.item_sold_id = itemSoldIds[0]; // Update with the first item_sold_id
        }

        if (['Bank', 'Cash', 'PayLater'].includes(paymentType.value)) {
            const salesInvoice = paymentType.value !== 'PayLater'
                ? null
                : await axios.get(`/api/sales-invoice/${salesOrder.id}`); // Fetch Sales Invoice if PayLater
          
            await axios.post(`/api/sales-receipt`, {
                sales_order: salesOrder.id,
                sales_invoice: salesInvoice?.data?.id || null, // Use invoice ID if applicable
                customer_id: selectedCustomer.value?.id,
                branch_id: branch.value?.id,
                store_id: store.value?.id,
                sales_receipt_number: `SR-${generateSalesOrderNumber()}`, // Generate unique receipt number
                total_amount: totalAmount.value,
                amount_paid: amountPaid.value,
                payment_type: paymentType.value,  // Handle payment mode dynamically
                item_sold_id: payload.payment.item_sold_id,
                receipt_date: new Date().toISOString(),
            });
            console.log("Payload for Sales Receipt:", {
    sales_order: salesOrder.id,
    sales_invoice: salesInvoice?.data?.id || null, // Use invoice ID if applicable
    customer_id: selectedCustomer.value?.id,
    branch_id: branch.value?.id,
    store_id: store.value?.id,
    sales_receipt_number: `SR-${generateSalesOrderNumber()}`,
    total_amount: totalAmount.value,
    amount_paid: amountPaid.value,
    payment_type: paymentType.value,
    item_sold_id: payload.payment.item_sold_id, // Log this to verify
    receipt_date: new Date().toISOString(),
});
        }
        
        
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




const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Product') {
    selectedProduct.value = value;

     if (selectedProduct.value) {
      price.value = selectedProduct.value.selling_price;
    }
  }else if (label === 'Customer'){
    selectedCustomer.value = value;
  }
  };
 


// Lifecycle hook to fetch data on component mount
onMounted(() => {
    salesOrderNumber.value = generateSalesOrderNumber();
    fetchCustomers();
    fetchProducts();

});
</script>


<template>
  <v-container class="sales-order" fluid>
    <v-row>
      <v-col>
        <h2>Create Sales Order</h2>
        <v-text-field
          label="Sales Order Number"
          v-model="salesOrderNumber"
          readonly
        ></v-text-field>

        <!-- Display Branch and Store Info -->
          <v-row>
      <v-col >
        <v-text-field
          :value="branch ? branch.name : 'Loading...'"  
          readonly
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          :value="store ? store.name : 'N/A'"  
          readonly
           style="border: none; background-color: transparent;"
        ></v-text-field>
      </v-col>
    </v-row>

        <!-- Customer and Product Selection -->
        <v-row class="form-grid">
          <v-col>
            <filterSelect
              :genericOptions="customers"
              :label_cus="'Customer Name*'"
              @optionSelected="(customer) => handleOptionSelected(customer, 'Customer')"
              v-model="selectedCustomer" 
            />
          </v-col>
          <v-col>
         <filterSelect
              :genericOptions="products"
              :label_cus="'Product Name*'"
              @optionSelected="(product) => handleOptionSelected(product, 'Product')"
              v-model="selectedProduct" 
            />
          </v-col>
          <v-col>
            <v-text-field
              label="Quantity"
              v-model="quantity"
              type="number"
              min="1"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              label="Price"
              v-model="price"
              readonly
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              label="Amount"
              :value="(price - discount) * quantity"
              readonly
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn @click="addToInvoice" :disabled="!selectedProduct || quantity <= 0">
              Add to Invoice
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
              <th>Quantity</th>
              <th>Price</th>
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
              <td>{{ item.quantity }}</td>
              <td>{{ item.price }}</td>
              <td>{{ item.amount }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Delete Button -->
        <v-btn @click="deleteSelectedItems">
          Delete Selected Items
        </v-btn>

        <!-- Payment Details -->
     <v-row>
          <v-col>
            <v-text-field
              label="Narration"
              v-model="narration"
              multiline
            ></v-text-field>
          </v-col>

          <!-- Payment Type Selection -->
    <v-col cols="12" md="6">
    <v-radio-group v-model="paymentType" row>
      <v-radio label="Cash" value="Cash"></v-radio>
      <v-radio label="Bank" value="Bank"></v-radio>
      <v-radio label="Credit" value="Credit"></v-radio>
      <v-radio label="Pay Later" value="PayLater"></v-radio>
    </v-radio-group>
  </v-col>
          </v-row>
          <div v-if="['Cash', 'Bank', 'PayLater'].includes(paymentType)">
            <v-text-field
              label="Total Amount"
              :value="totalAmount"
              readonly
            ></v-text-field>
            <v-text-field
              label="Amount Paid"
              v-model="amountPaid"
              type="number"
              min="0"
            ></v-text-field>
            <v-text-field
              label="Balance"
              :value="balance"
              readonly
            ></v-text-field>
          </div>

          <!-- For Credit Payment -->
          <div v-if="paymentType === 'Credit'">
            <v-text-field label="Credit Limit" type="number"></v-text-field>
            <v-text-field label="Credit Balance" type="number"></v-text-field>
            <v-text-field label="Credit Amount" type="number"></v-text-field>
          </div>

          <v-alert v-if="balance < 0" type="warning">
            Warning: Amount paid exceeds total!
          </v-alert>
        <!-- </div> -->
      <v-alert v-if="transactionSuccess" type="success" dismissible>
          Transaction successfully saved!
        </v-alert>
        <!-- Save Button -->
        <div class="form-actions">
          <v-btn @click="saveTransaction" :disabled="!invoiceItems.length">
            Save Transaction
          </v-btn>
        </div>
      </v-col>
    </v-row>
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
 
        
