<script setup lang="ts">
import NotificationModal from '@/components/forms/NotificationModal.vue'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import type { SalesOrderResource, SalesReceipt } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'

const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')
const notificationModalRef = ref<InstanceType<typeof NotificationModal> | null>(null)
const isSaving = ref(false);
const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter

const salesOrder = ref<SalesOrderResource>()

const totalAmount = ref<number>(0)
const amountPaid = ref<number>(0)
const balanceAmount = ref<number>(0)
const paymentType = ref<string[]>([])
const payments = ref<{ payment_type: string; amount: number; max: number }[]>([])
const useAuth = useAuthStore()
const depositAmount = ref<number>(0)
const creditLimit = ref<number>(0)
const creditBalance = ref<number>(0)
const creditApproved = ref<number>(0)

const fetchSalesOrder = async () => {
  try {
    const response = await makeApiCall<SalesOrderResource>('GET', `/sales-order-info/${salesOrderNo}`)

    salesOrder.value = response.data
    totalAmount.value = salesOrder.value.total_amount
    paymentType.value.push(salesOrder.value.payment_type)
    payments.value.push({ payment_type: salesOrder.value.payment_type, amount: totalAmount.value, max: totalAmount.value })
    amountPaid.value = totalAmount.value
    depositAmount.value = response.data.deposit
    creditLimit.value = salesOrder.value.customer.credit_limit
    creditBalance.value = salesOrder.value.customer.credit_balance
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
const formattedBalanceAmount = computed(() => formatNumber(balanceAmount.value))

const saveTransaction = async () => {
  if (isSaving.value) {
    alert('Transaction is already being saved!');
    return;
  }

  isSaving.value = true;
  try {
    const payload: any = {
      sales_order_id: salesOrder.value?.id,
      customer_id: salesOrder.value?.customer_id,
      branch_id: salesOrder.value?.branch_id,
      store_id: salesOrder.value?.store_id,
      credit_date: new Date().toISOString(),
      cashier_id: user.value?.id,
      user_id: user.value?.id,
      credit_limit: salesOrder.value?.customer.credit_limit,
      amount: creditApproved.value,
      credit_balance_before: salesOrder.value?.customer.credit_balance,
      type: 'credit',
    }

    // const recieptResponse =
    await makeApiCall<SalesReceipt>('POST', '/credit-transactions', payload)

    console.log('Credit created successfully.')
    router.push({ name: 'credit-print', params: { no: salesOrderNo } })
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
  // amountPaid.value = payments.value.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
  balanceAmount.value = totalAmount.value - creditApproved.value
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
            <VRow>
              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  <b>Cashier:</b> {{ user.name }}
                </VText>
              </VCol>

              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  Credit Limit
                </VText>
                <VTextField :value="formattedCreditBalance" outlined readonly />
              </VCol>
              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  Credit Approval Amount*
                </VText>
                <VTextField v-model="creditApproved" type="number" @change="handleAmountChange" />
              </VCol>
              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  Order Amount
                </VText>
                <VTextField :value="formattedTotalAmount" outlined readonly />
              </VCol>

              <!-- </v-col> -->

              <VCol cols="12">
                <VText>New Amount Payable </VText>
                <VTextField :value="formattedBalanceAmount" readonly />
              </VCol>

              <VCol cols="12" class="form-actions">
                <!-- <div class="form-actions"> -->
                <VBtn
                  :disabled="Number(creditApproved) > creditBalance || Number(creditApproved) == 0 || Number(creditApproved) > totalAmount || isSaving"
                  @click="saveTransaction">

                  {{ isSaving ? 'Saving...' : 'Approve Transaction' }}
                </VBtn>
                <!-- </div> -->
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
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
