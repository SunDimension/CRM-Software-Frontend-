<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import NotificationModal from '@/components/forms/NotificationModal.vue'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'

// import { SalesOrderResource, SalesReceipt, formatNumber } from '@/types/globalTypes';
import type { SalesOrderResource, SalesReceipt } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'

const isSaving = ref(false)
const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')
const notificationModalRef = ref<InstanceType<typeof NotificationModal> | null>(null)

const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter

const salesOrder = ref<SalesOrderResource>()

const totalAmount = ref(0)
const amountPaid = ref(0)
const amountPayable = ref(0)
const balanceAmount = ref(0)
const paymentType = ref<string[]>([])
const payments = ref<{ payment_type: string; amount: number; max: number }[]>([])
const useAuth = useAuthStore()
const depositAmount = ref(0)
const creditBalance = ref(0)

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesOrderResource>('GET', `/sales-order-info/${salesOrderNo}`)

    salesOrder.value = response.data
    totalAmount.value = salesOrder.value.total_amount
    amountPayable.value = salesOrder.value.total_amount - salesOrder.value.credit_balance
    creditBalance.value = salesOrder.value.credit_balance

    let payment_type = salesOrder.value.payment_type
    if (salesOrder.value.payment_type === 'Credit') {
      paymentType.value.push(payment_type)
      payments.value.push({ payment_type, amount: creditBalance.value, max: creditBalance.value })
      payment_type = 'Cash'
    }
    paymentType.value.push(payment_type)
    payments.value.push({ payment_type, amount: totalAmount.value - creditBalance.value, max: totalAmount.value - creditBalance.value })
    amountPaid.value = totalAmount.value
    depositAmount.value = response.data.deposit
    handleAmountChange(0)
  }
  catch (error) {
    console.error('Error fetching Info:', error)
  }
}

const user = computed(() => useAuth.getUserDetails.user)
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null
const formattedTotalAmount = computed(() => formatNumber(totalAmount.value))
const formattedCreditBalance = computed(() => formatNumber(creditBalance.value))
const formattedAmountPayable = computed(() => formatNumber(amountPayable.value))

const saveTransaction = async () => {
  if (isSaving.value) {
    alert('Transaction is already being saved!')

    return
  }

  isSaving.value = true
  try {
    const payload: any = {
      sales_order_id: salesOrder.value?.id,
      sales_invoice: null, // Use invoice ID if applicable
      customer_id: salesOrder.value?.customer_id,
      branch_id: salesOrder.value?.branch_id,
      store_id: salesOrder.value?.store_id,
      sales_receipt_number: `SR-${generateSalesOrderNumber()}`, // Generate unique receipt number
      total_amount: salesOrder.value?.total_amount,
      amount_paid: amountPaid.value,
      payment_type: (paymentType.value.length > 1) ? 'Multi-Payment' : paymentType.value[0], // Handle payment mode dynamically
      receipt_date: new Date().toISOString(),
      payment_detail: payments.value,
      cashier_id: user.value?.id,
      user_id: user.value?.id,
    }

    const recieptResponse = await makeApiCall<SalesReceipt>('POST', '/sales-receipt', payload)

    console.log('Sales Receipt created successfully.')
    router.push({ name: 'sales-receipt', params: { no: recieptResponse.data.sales_receipt_number } })

    // modalType.value = 'success';
    // modalTitle.value = 'Success';
    // modalMessage.value = 'Your operation was successful!';
    // notificationModalRef.value?.openModal();
    // /setTimeout(() => {
    // }, 2000); // Adjust the delay as needed (2000ms = 2 seconds)
  }
  catch (error: any) {
    // Improve error handling
    if (error.response)
      console.error('Error saving transaction:', error.response.data)
    else
      console.error('Error saving transaction:', error.message)

    modalType.value = 'error'
    modalTitle.value = 'Error'
    modalMessage.value = 'An error occurred during the operation.'

    // Access the modal's open method using ref
    notificationModalRef.value?.openModal()
  }
}

const handleAmountChange = (value: any) => {
  amountPaid.value = payments.value.reduce((acc, curr) => Number(acc) + ((curr.payment_type !== 'Credit') ? Number(curr.amount) : 0), 0)
  balanceAmount.value = amountPayable.value - amountPaid.value
}

const generateSalesOrderNumber = () => {
  const currentDate = new Date()
  const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`
  const uniqueId = Math.floor(Math.random() * 10000)

  return `${formattedDate}-${uniqueId}`
}

const handlePaymentChange = (value: any) => {
  console.log(value.target.value)
  console.log(value.target.checked)

  if (value.target.checked) {
    payments.value.push({ payment_type: value.target.value, amount: 0, max: amountPayable.value })
  }
  else {
    const index = payments.value.findIndex(item => item.payment_type == value.target.value)

    payments.value.splice(index, 1)
  }
  handleAmountChange(0)
}

const handlePaymentDepositChange = (value: any) => {
  if (value.target.checked) {
    let valueBalance = depositAmount.value
    if (balanceAmount.value <= depositAmount.value)
      valueBalance = balanceAmount.value

    payments.value.push({ payment_type: 'Deposit', amount: valueBalance, max: valueBalance })
  }
  else {
    const index = payments.value.findIndex(item => item.payment_type == value.target.value)

    payments.value.splice(index, 1)
  }
  handleAmountChange(0)
}

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  fetchSalesOrder()
})
</script>

<template>
  <VContainer class="sales-receipt-page" fluid>
    <!-- Logo and Business Info Section -->
    <VRow class="mt-2">
      <VCol cols="12" md="9">
        <!-- Sales Receipt Info -->
        <h2>Confirm Sales Order</h2>

        <VRow class="mt-2">
          <VCol>
            <h4>Sales Order Number: {{ salesOrder?.sales_order_number }}</h4>
          </VCol>
        </VRow>

        <!-- Customer and Store Details (Grid Layout) -->
        <VRow class="mt-2">
          <VCol cols="3">
            <h4>Customer Name: {{ salesOrder?.customer_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Branch: {{ salesOrder?.branch_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Store: {{ salesOrder?.store_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Sales Rep: {{ salesOrder?.user_name }}</h4>
          </VCol>
        </VRow>
        <!-- Product Table -->
        <VCard class="mt-4" col="12" md="6">
          <VCardTitle>
            <h4>Product Details</h4>
          </VCardTitle>
          <VCardText>
            <!--
              <v-data-table :headers="tableHeaders" :items="salesOrder?.items" class="elevation-1">

              </v-data-table>
            -->
            <!--
              <v-text-field
              label="Cashier Name"
              :value="user.name"
              readonly
              outlined
              persistent-placeholder
              ></v-text-field>
            -->
            <VTable>
              <thead>
                <tr>
                  <!-- <th>Select</th> -->
                  <!-- <th>S/N</th> -->
                  <th>Product</th>
                  <th>Store</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in salesOrder?.items" :key="index">
                  <!-- <td>{{ index + 1 }}</td> -->
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.store_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatNumber(item.unit_price) }}</td>
                  <td>{{ formatNumber(item.discount) }}</td>
                  <td>{{ formatNumber(item.quantity * (item.unit_price - item.discount)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td />
                  <td />
                  <td />
                  <th>TOTAL</th>
                  <th>{{ formatNumber(totalAmount) }}</th>
                </tr>
              </tfoot>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="3">
        <!-- <h2></h2> -->
        <VCard class="mt-4">
          <VCardTitle>
            <h4>Receipt Order</h4>
          </VCardTitle>
          <VCardText>
            <!--
              <v-data-table :headers="tableHeaders" :items="salesOrder?.items" class="elevation-1">

              </v-data-table>
            -->
            <VRow>
              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  <b>Cashier:</b> {{ user.name }}
                </VText>
              </VCol>

              <VCol v-if="creditBalance > 0" cols="12">
                <VText tag="label" class="mb-2">
                  Total Amount Payable
                </VText>
                <VTextField :value="formattedTotalAmount" outlined readonly />
              </VCol>

              <VCol v-if="creditBalance > 0" cols="12">
                <VText tag="label" class="mb-2">
                  Credit Amount Approved
                </VText>
                <VTextField label_cus="Amount Payable*" :value="formattedCreditBalance" outlined readonly />
              </VCol>

              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  Amount Payable
                </VText>
                <VTextField :value="formattedAmountPayable" outlined readonly />
              </VCol>

              <!-- Payment Type Selection -->
              <VCol v-if="depositAmount > 0" cols="12">
                <!-- <v-checkbox-group v-model="paymentType" row label="Apply Available Balance"> -->
                <!-- <v-text tag="label" class="mb-2"></v-text> -->
                <VCheckbox v-model="paymentType" :label="`Use Deposit - N${formatNumber(depositAmount)}`"
                  value="Deposit" @change="handlePaymentDepositChange" />
                <!-- {{ depositAmount }} -->
                <!-- </v-checkbox-group> -->
              </VCol>

              <VCol cols="12">
                <!-- <v-checkbox-group row label="Payment Methods"> -->
                <VText tag="label" class="mb-2">
                  Payment Methods
                </VText>
                <VCheckbox v-model="paymentType" label="Cash" value="Cash" @change="handlePaymentChange" />
                <VCheckbox v-model="paymentType" label="Bank" value="Bank" @change="handlePaymentChange" />
                <VCheckbox v-model="paymentType" label="POS" value="POS" @change="handlePaymentChange" />
                <!-- </v-checkbox-group> -->
              </VCol>

              <!-- <v-col cols="12" v-if="paymentType.length>0"> -->
              <!-- <v-text tag="label" class="mb-2">Payments</v-text> -->

              <!-- <v-text-field label="Amount Payable" v-model="salesOrder!.total_amount" readonly></v-text-field> -->
              <!-- <v-text-field label="Amount Received" type="number" v-model="amountPaid" ></v-text-field> -->
              <!-- <v-text-field label="Amount Payable" v-model="salesOrder!.total_amount" readonly></v-text-field> -->
              <VCol v-for="(item, index) in payments.filter(item => item.payment_type !== 'Credit')" :key="index"
                cols="12">
                <VTextField v-if="item.payment_type !== 'Credit'" v-model="item.amount" :label="item.payment_type"
                  type="number" :max="item.max" @change="handleAmountChange" />
              </VCol>
              <!-- </v-col> -->

              <VCol cols="12">
                <!-- <v-text tag="label" class="mb-2">Balance</v-text> -->
                <VTextField v-model="balanceAmount" type="number" label="Balance" readonly />
              </VCol>

              <VCol cols="12" class="form-actions">
                <!-- <div class="form-actions"> -->
                <VBtn :disabled="balanceAmount != 0 || isSaving" @click="saveTransaction">
                  {{ isSaving ? 'Saving...' : 'Save Transaction' }}
                </VBtn>
                <!-- </div> -->
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCol />
    </VRow>
    <NotificationModal ref="notificationModalRef" :modal-type="modalType" :modal-title="modalTitle"
      :modal-message="modalMessage" />
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
  font-size: 12pt;
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
  font-size: 11pt;
}

.sales-receipt-page {
  padding: 20px;
  font-size: 11pt;
}

.text-right {
  text-align: right;
}

.v-data-table {
  margin-top: 20px;
}

.v-card-title h4 {
  font-size: 10pt;
  /* Adjust card titles */
}

.v-data-table th,
.v-data-table td {
  font-size: 10pt;
  /* Adjust table font size */
}
</style>
