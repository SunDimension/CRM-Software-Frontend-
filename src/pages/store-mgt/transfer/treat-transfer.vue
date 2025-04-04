<script setup lang="ts">
import NotificationModal from '@/components/forms/NotificationModal.vue'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { formatDate, formatNumber } from '@/types/globalTypes'

const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')
const notificationModalRef = ref<InstanceType<typeof NotificationModal> | null>(null)
const isSaving = ref(false)
const route = useRoute()
const salesOrderNo = route.params.no // Access the route parameter
const salesOrder = ref<any>()
const status = ref<string>('')
const comments = ref<string>('')
const totalAmount = ref<number>(0)
const useAuth = useAuthStore()

const fetchReceiveOrder = async () => {
  try {
    const response = await makeApiCall<any>('GET', `/receive-orders/${salesOrderNo}`)

    salesOrder.value = response.data
    totalAmount.value = response.data.receiveItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    // handleAmountChange(0)
  }
  catch (error) {
    console.error('Error fetching Info:', error)
  }
}

const user = computed(() => useAuth.getUserDetails?.user)

const saveTransaction = async () => {
  if (isSaving.value) {
    alert('Transaction is already being saved!')

    return
  }

  isSaving.value = true
  try {
    const payload: any = {
      id: salesOrder.value?.id,
      status: status.value,
      comment: comments.value,
    }

    // const recieptResponse =
    await makeApiCall<any>('POST', '/approve-receive-order', payload)
    console.log('Receive Order successfully treated.')
    router.push({ name: 'receive-order-print', params: { no: salesOrderNo } })
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
    isSaving.value = false

    // Access the modal's open method using ref
    notificationModalRef.value?.openModal()
  }
}

const handleAmountChange = (value: any) => {
  // amountPaid.value = payments.value.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
  // balanceAmount.value = totalAmount.value - creditApproved.value
}

// Lifecycle hook to fetch data on component mount
onMounted(() => {
  fetchReceiveOrder()
})
</script>

<template>
  <VContainer class="sales-receipt-page" fluid>
    <!-- Logo and Business Info Section -->
    <VRow class="mt-2">
      <VCol cols="12" md="9">
        <!-- Sales Receipt Info -->
        <h2>Store Receipt Order</h2>

        <VRow class="mt-2">
          <VCol>
            <h4>Store Receipt: {{ salesOrder?.id }}</h4>
          </VCol>
        </VRow>

        <!-- Customer and Store Details (Grid Layout) -->
        <VRow class="mt-2">
          <VCol cols="3">
            <h4>Vendor: {{ salesOrder?.vendor_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Branch: {{ salesOrder?.branch_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Store: {{ salesOrder?.store_name }}</h4>
          </VCol>
          <VCol cols="3">
            <h4>Date: {{ formatDate(salesOrder?.receive_date) }}</h4>
          </VCol>
        </VRow>
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
      <VCol cols="12" md="3">
        <!-- <h2></h2> -->
        <VCard class="mt-4">
          <VCardTitle>
            <h3>Treat Receive Order</h3>
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  <b>Approver:</b> {{ user.name }}
                </VText>
              </VCol>
              <VCol cols="12">
                <!-- <v-checkbox-group row label="Payment Methods"> -->
                <VText tag="label" class="mb-2">
                  Action
                </VText>
                <VRadioGroup v-model="status" row>
                  <VRadio label="Approve" value="Approved" aria-selected="true" />
                  <VRadio label="Decline" value="Cancelled" />
                  <!-- <VRadio label="Credit" value="Credit" /> -->
                </VRadioGroup>
              </VCol>

              <VCol cols="12">
                <VText tag="label" class="mb-2">
                  Comment
                </VText>
                <VTextarea v-model="comments" rows="4" :required="status == 'Cancelled'" />
              </VCol>

              <VCol cols="12" class="form-actions">
                <!-- <div class="form-actions"> -->
                <VBtn :disabled="(status === 'Cancelled' && comments == '') || status === ''" @click="saveTransaction">
                  {{ isSaving ? 'Saving...' : 'Submit' }}
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
