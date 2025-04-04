<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Account, GenericSetUp, InventoryItem, PaymentVoucher, PaymentVoucherDetail, Vendor, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { onMounted, reactive, ref } from 'vue';
import * as yup from 'yup';

const step = ref(1);
const showDialog = ref(false);
let message = "";

let voucherDetails = reactive<PaymentVoucherDetail[]>([
  {
    item_id: 0,
    amount: 0,
    description: '',
	quantity: 1,
	expense_account_id: ''	
  },
]);

let formValues = reactive<any>({
    payment_date: new Date(),
    vendor_id: 0,
    warehouse_id: 0,
    branch_id: '',
    tax_id: '',
    payment_mode_id: 0, 
    expense_account_id: ''	,
    voucher_details: voucherDetails,
    description: ''
});



const validationSchema = yup.object({
  payment_date: yup.string().required('Payment date is required.'),
  vendor_id: yup.string().required('Vendor is required.'),
  warehouse_id: yup.number().nullable().required('Warehouse is required.'),
  total_amount: yup.number().required('Total amount is required.'),
  voucher_details: yup.array().of(
    yup.object({
      account_id: yup.string().required('Account is required.'),
      account_no: yup.string().nullable(),
      amount: yup.number().required('Amount is required.').typeError('Amount must be a number.'),
      description: yup.string().required('Description is required.'),
    })
  ),
});

const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: formValues,
});

const accounts = ref<Account[]>([]);
const vendors = ref<Vendor[]>([]);
const warehouses = ref<Warehouse[]>([]);
const items = ref<InventoryItem[]>([]);
const paymentModes = ref<GenericSetUp[]>([]);
// const paymentModes = ref<InventoryItem[]>([]);
const taxes = ref<GenericSetUp[]>([]);


const payment_date = useField('payment_date', formValues.payment_date);
const vendor_id = useField('vendor_id', formValues.vendor_id);
const warehouse_id = useField('warehouse_id', formValues.warehouse_id);
const branch_id = useField('branch_id', formValues.branch_id);
const tax_id = useField('tax_id', formValues.tax_id);
const payment_mode_id = useField('payment_mode_id', formValues.payment_mode_id);
const expense_account_id = useField('expense_account_id', formValues.expense_account_id);
const description = useField('description', formValues.description);

const fetchAccounts = async () => {
  try {
    const response = await makeApiCall<Account[]>('GET', '/accounts');
    accounts.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchItems = async () => {
  try {
    const response = await makeApiCall<InventoryItem[]>('GET', '/create-items');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchVendors = async () => {
  try {
    const response = await makeApiCall<Vendor[]>('GET', '/vendors');
    vendors.value = response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
  }
};

const fetchWarehouses = async () => {
  try {
    const response = await makeApiCall<Warehouse[]>('GET', '/warehouses');
    warehouses.value = response.data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
};

const fetchPaymentMode = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/payment-modes');
    paymentModes.value = response.data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
};

const fetchTaxes = async () => {
  try {
    const response = await makeApiCall<Warehouse[]>('GET', '/taxes');
    taxes.value = response.data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
};

// Auto-fill account_no based on account_id
// watch(
//   () => voucherDetails.map(detail => detail.account_id),
//   (newAccountIds) => {
//     newAccountIds.forEach((accountId, index) => {
//       const selectedAccount = accounts.value.find(account => account.id === accountId);
//       if (selectedAccount) {
//         voucherDetails[index].account_no = selectedAccount.code;
//       }
//     });
//   }
// );

const submit = handleSubmit(async (values) => {
  try {
    await makeApiCall<PaymentVoucher>('POST', '/payment-vouchers', values);
    showDialog.value = true;
    message = "Payment Voucher created successfully";
  } catch (error) {
    console.error('Error creating Payment Voucher:', error);
  }
});

const submitForm = async (event: any) => {
  event.preventDefault();
  try {
    const data = {
        expense_date: payment_date.value.value,
        vendor_id: vendor_id.value.value,
        voucher_entries: voucherDetails,
        warehouse_id: warehouse_id.value.value,
        branch_id: branch_id.value.value,
        tax_id: tax_id.value.value,
        payment_mode_id: payment_mode_id.value.value, 
        expense_account_id: expense_account_id.value.value,
        description: description.value.value
      }
    //formValues.value.journal_entries = journalDetails;
    console.log(JSON.stringify(data));
    
    await makeApiCall<PaymentVoucher>('POST', '/payment-vouchers', data).then((d)=> {
        step.value++;
      showDialog.value = true;
      message = "Payment Voucher created successfully";
    });
  } catch (error) {
    console.error('Error creating Payment Entry:', error);
  }
};

const addRow = () => {
  voucherDetails.push({
    item_id: 0,
    amount: 0,
    description: '',
	quantity: 1,
	expense_account_id: ''
  });
};

const removeRow = (index: number) => {
  if (index > 0) {
    voucherDetails.splice(index, 1);
  }
};

function  getAccountName(id: any) {
    const account = accounts.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

  function  getVendorName(id: any) {
    const account = vendors.value.find(account => account?.id === id);
    return account ? account.vendor_name : 'Unknown';
  }
  function  getItemName(id: any) {
    const account = items.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

  function  getWarehouseName(id: any) {
    const account = warehouses.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

  function  getPaymentModeName(id: any) {
    const account = paymentModes.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

  function  getTaxName(id: any) {
    const account = taxes.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

onMounted(() => {
  fetchAccounts();
  fetchVendors();
  fetchWarehouses();
  fetchItems();
  fetchPaymentMode();
  fetchTaxes();

});

</script>

<template>
  <v-card title="Create Payment Voucher">
    <v-card-text>
      <form @submit="submitForm($event)">
        <v-stepper v-model="step" :alt-label="true">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1" editable>Payment Voucher</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2" editable>Confirmation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3" editable>Completion</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <!-- Step 1: Payment Voucher -->
            <v-stepper-content step="1" v-if="step === 1">
              <div class="form-grid">
                <v-text-field
                  v-model="payment_date.value.value"
                  :error-messages="payment_date.errorMessage.value"
                  label="Payment Date"
                  type="date"
                  required
                ></v-text-field>
                <v-select
                  v-model="vendor_id.value.value"
                  :items="vendors"
                  item-title="name"
                  item-value="id"
                  label="Vendor"
                  required
                ></v-select>
                <v-select
                  v-model="warehouse_id.value.value"
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  label="Warehouse"
                  required
                ></v-select>
                

                <v-select
                  v-model="payment_mode_id.value.value"
                  :items="paymentModes"
                  item-title="name"
                  item-value="id"
                  label="Mode of Payment "
                  required
                ></v-select>

                <v-select
                  v-model="tax_id.value.value"
                  :items="taxes"
                  item-title="name"
                  item-value="id"
                  label="Tax"
                  required
                ></v-select>

                <v-select
                  v-model="expense_account_id.value.value"
                  :items="accounts"
                  item-title="name"
                  item-value="id"
                  label="Paying Account"
                  required
                ></v-select>

                <v-textarea
                  v-model="description.value.value"
                  label="Description"
                  required
                ></v-textarea>
               
                
              </div>

              <br>
              <div v-for="(detail, index) in voucherDetails" :key="index" class="form-grid2">
                <v-select
                  v-model="detail.item_id"
                  :items="items"
                  item-title="name"
                  item-value="id"
                  label="Item"
                  required
                ></v-select>
                <v-text-field
                  v-model="detail.description"
                  label="Description"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="detail.quantity"
                  label="Quantity"
                  type="number"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="detail.amount"
                  label="Amount"
                  type="number"
                  required
                ></v-text-field>
                <v-text-field
                  label=""
                  readonly
                >{{  detail.amount * detail.quantity}}</v-text-field>
                
                <v-btn icon @click="removeRow(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-btn @click="addRow">Add Voucher Detail</v-btn>
              <v-btn @click="step++" :disabled="!payment_date.value">Next</v-btn>
            </v-stepper-content>

            <!-- Step 2: Confirmation -->
            <v-stepper-content step="2" v-if="step === 2">
              <v-card class="mt-5">
                <v-card-title>Confirmation</v-card-title>
                <v-list dense class="form-grid">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Payment Date</v-list-item-title>
                      <v-list-item-subtitle>{{ payment_date.value.value }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Vendor</v-list-item-title>
                      <v-list-item-subtitle>{{ getVendorName(vendor_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Warehouse</v-list-item-title>
                      <v-list-item-subtitle>{{ getWarehouseName(warehouse_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Mode of Payment</v-list-item-title>
                      <v-list-item-subtitle>{{ getPaymentModeName(payment_mode_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Tax</v-list-item-title>
                      <v-list-item-subtitle>{{ getTaxName(tax_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Paying Account</v-list-item-title>
                      <v-list-item-subtitle>{{ getAccountName(expense_account_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                </v-list>

                <v-divider></v-divider>

              <v-list dense>
                <v-list-item-group class="form-grid2 text-bold">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Item</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Description</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Quantity</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.account_no }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Unit Price</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.amount }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Total</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.description }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
                  <v-list-item-group v-for="(detail, index) in voucherDetails" :key="index" >
                    <v-list-item>
                      <v-list-item-content class="form-grid2">
                        <!-- <v-list-item-title></v-list-item-title> -->
                        <v-list-item-title>{{ index + 1 }}. {{ getItemName(detail.item_id) }}</v-list-item-title>
                        <v-list-item-title>{{ detail.description }}</v-list-item-title>
                        <v-list-item-title>{{ detail.quantity }}</v-list-item-title>
                        <v-list-item-title>{{ detail.amount }}</v-list-item-title>
                        <v-list-item-title>{{ detail.amount* detail.quantity }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>

              <v-btn @click="step--">Previous</v-btn>
              <v-btn type="submit" :loading="isSubmitting">Submit</v-btn>
            </v-stepper-content>

            <!-- Step 3: Completion -->
            <v-stepper-content step="3" v-if="step === 3">
                <v-card class="mt-5">
                <v-card-title>Completion</v-card-title>
                <v-list dense class="form-grid">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Payment Date</v-list-item-title>
                      <v-list-item-subtitle>{{ payment_date.value.value }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Vendor</v-list-item-title>
                      <v-list-item-subtitle>{{ getVendorName(vendor_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Warehouse</v-list-item-title>
                      <v-list-item-subtitle>{{ getWarehouseName(warehouse_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Mode of Payment</v-list-item-title>
                      <v-list-item-subtitle>{{ getPaymentModeName(payment_mode_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Tax</v-list-item-title>
                      <v-list-item-subtitle>{{ getTaxName(tax_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Paying Account</v-list-item-title>
                      <v-list-item-subtitle>{{ getAccountName(expense_account_id.value.value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                </v-list>

                <v-divider></v-divider>

              <v-list dense>
                <v-list-item-group class="form-grid2 text-bold">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Item</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Description</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Quantity</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.account_no }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Unit Price</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.amount }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Total</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.description }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
                  <v-list-item-group v-for="(detail, index) in voucherDetails" :key="index" >
                    <v-list-item>
                      <v-list-item-content class="form-grid2">
                        <!-- <v-list-item-title></v-list-item-title> -->
                        <v-list-item-title>{{ index + 1 }}. {{ getItemName(detail.item_id) }}</v-list-item-title>
                        <v-list-item-title>{{ detail.description }}</v-list-item-title>
                        <v-list-item-title>{{ detail.quantity }}</v-list-item-title>
                        <v-list-item-title>{{ detail.amount }}</v-list-item-title>
                        <v-list-item-title>{{ detail.amount* detail.quantity }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>
              <v-btn @click="step = 1">Create New Voucher</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </form>
    </v-card-text>
  </v-card>
  <v-dialog v-model="showDialog" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Notification</v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" text @click="showDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* .form-grid2 {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr auto;
  gap: 16px;
} */

.form-grid2 {
  display: grid;
  grid-template-columns: 4fr 4fr 4fr 4fr 4fr 1fr; /* Two columns with equal width */
  gap: 16px; /* Adjust the gap between columns as needed */
  padding-bottom: 2px;
}

.form-grid > * {
  min-width: 0; /* Ensures the items do not overflow */
}

</style>
