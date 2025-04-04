<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'
import type { GenericSetUp, Store } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'
import { useFieldArray, useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const step = ref(1)
const showDialog = ref(false)
const message = ''
const isLoading = ref(false)
const status = ref<string>('')
const useAuth = useAuthStore()
const savedData = ref<{}>({})
const user = useAuth.getUserDetails?.user

// Validation Schema
const schema = yup.object({
  store_id: yup.number().required('Store is required').positive('Select a valid store'),
  branch_id: yup.number().required('Branch is required').positive('Select a valid branch'),
  change_reason_id: yup.number().required('Reason for Change is required').positive('Select a valid reason'),
  items: yup.array().of(
    yup.object().shape({
      product_id: yup.number().required('Product is required').positive('Select a valid product').label('Item'),
      cost_price: yup.number().required('Cost Price is required').min(0, 'Cost Price must be at least 0').label('Unit Cost Price'),
      current_selling_price: yup.number().required('Current Selling Price is required').min(0, 'Current Selling Price must be at least 0').label('Current Selling Price'),
      new_selling_price: yup.number().required('New Selling Price is required').min(0, 'Selling Price must be at least 0').label('New Selling Price'),
      mark_up: yup.number().nullable(),
    }),
  ),
})

// Form Setup
const { handleSubmit, errors, values, defineField, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    store_id: 0,
    branch_id: user?.branch_id || 0,
    change_reason_id: 0,
    details: [],
  },
})

const [store_id, store_idAttrs] = defineField('store_id')
const [change_reason_id, change_reason_idAttrs] = defineField('change_reason_id')

const { fields, push, remove } = useFieldArray('details')

// Mock Data
const stores = ref<Store[]>([])
const products = ref<any[]>([])
const reasons = ref<GenericSetUp[]>([])

// Add an Item
const addItem = () => {
  push({
    product_id: 0,
    cost_price: 0,
    new_selling_price: 0,
    current_selling_price: 0,
    mark_up: 10,
  })
}

const removeItem = (index: number) => {
  remove(index)
}

const nextStep = () => {
  if (step.value < 3)
    step.value++
}

const prevStep = () => {
  if (step.value > 1)
    step.value--
}

// Submit Handler
const submit = handleSubmit(data => {
  console.log('Form submitted:', data)
  nextStep()
})

const saveRequest = async () => {
  isLoading.value = true
  try {
    console.log('Form submitted:', values)

    const response = await makeApiCall<{}>('POST', '/price-changes', values)

    status.value = response.data.status
    isLoading.value = false

    nextStep()
  }
  catch (error) {
    console.error('Error fetching products:', error)
    isLoading.value = false

    // prevStep()
  }
}

const newRequest = async () => {
  step.value = 1
  setFieldValue('details', [])
  addItem()
}

const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', '/my-stores-with-items')

    stores.value = response.data
  }
  catch (error) {
    console.error('Error fetching stores:', error)
  }
}

const fetchReasons = async () => {
  try {
    const response = await makeApiCall<[]>('GET', '/change-reasons')

    reasons.value = response.data
  }
  catch (error) {
    console.error('Error fetching stores:', error)
  }
}

function getItemValue(id: any, data: any) {
  const item = data.find(item => item?.id === id)

  return item ? item.name : 'N/A'
}

function getStoreItemValue(id: any, data: any) {
  const item = data.find(item => item?.create_item_id === id)

  return item ? item.name : 'N/A'
}

function loadStoreItems(value: any) {
  console.log(value)

  const store = stores.value.find(s => s.id === value)
  if (store)
    products.value = store?.items // Assuming `store.items` contains product data
}

// Fetch Data
onMounted(async () => {
  // values.branch_id = user?.branch_id
  if (values.details.length === 0) {
    push({
      product_id: 0,
      cost_price: 0,
      new_selling_price: 0,
      current_selling_price: 0,
      mark_up: 10,
    })
  }
  try {
    await Promise.all([
      fetchStores(),
      fetchReasons(),
    ])

    // console.log(stores.value)
  }
  catch (error) {
    console.error('Error during data fetch:', error)
  }

  // console.log('Fields:', fields)
})

watch(errors, newErrors => {
  console.log('Validation errors:', newErrors)
})

// Track changes for `store_id`
watch(
  () => values.store_id,
  (newValue, oldValue) => {
    console.log(`store_id changed from ${oldValue} to ${newValue}`)

    // Call a function or handle the change
    if (newValue)
      loadStoreItems(newValue)
  },
)

watch(
  () => [...values.details],
  (newItems, oldItems) => {
    newItems.forEach((item, index) => {
      if (item.product_id !== oldItems[index]?.product_id) {
        const selectedProduct = products.value.find(product => product.create_item_id == item.product_id)
        if (selectedProduct) {
          // console.log(selectedProduct)
          item.cost_price = selectedProduct.cost_price
          item.mark_up = 10
          item.current_selling_price = selectedProduct.selling_price
          item.new_selling_price = item.cost_price * (1 + item.mark_up / 100) | 0
        }
      }

      if (item.mark_up !== oldItems[index]?.mark_up)
        item.new_selling_price = item.cost_price * (1 + item.mark_up / 100) || 0

      if (item.new_selling_price !== oldItems[index]?.new_selling_price)
        item.mark_up = (item.new_selling_price - item.cost_price) / (item.cost_price * 1.0) * 100.0 || 0
    })
  },
  { deep: true },
)
</script>

<template>
  <VCard>
    <VCardTitle>Price Adjustment</VCardTitle>
    <VCardText>
      <VStepper v-model="step" :alt-label="true">
        <VStepperHeader color="primary" elevation="3" rounded>
          <VStepperStep :complete="step > 1" step="1" editable complete-icon="ri-check-circle"
            error-icon="ri-alert-circle" color="green">
            Request
          </VStepperStep>
          <VDivider />
          <VStepperStep :complete="step > 2" step="2" editable complete-icon="ri-check-circle" color="blue"
            error-icon="mdi-alert-circle">
            Confirmation
          </VStepperStep>
          <VDivider />
          <VStepperStep step="3" editable complete-icon="mdi-check-circle" color="green" error-icon="mdi-alert-circle">
            Completion
          </VStepperStep>
        </VStepperHeader>

        <VStepperItems>
          <VStepperContent v-if="step === 1" step="1">
            <VForm @submit="submit">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField :value="user.branch ? user.branch : 'Loading...'" readonly />

                  <!-- <input v-model="branch_id" type="hidden" :value="user.branch_id"> -->
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect v-model="store_id" label="Store" :items="stores" item-value="id" item-title="name"
                    :error-messages="errors?.store_id" required @input="loadStoreItems" />
                </VCol>

                <VCol cols="12" md="6">
                  <VSelect v-model="change_reason_id" label="Reason for Change" :items="reasons" item-value="id"
                    item-title="name" :error-messages="errors?.change_reason_id" required />
                </VCol>
              </VRow>

              <!-- Receive Items Section -->
              <VDivider />
              <VCardSubtitle>Store Items</VCardSubtitle>

              <VRow v-for="(item, index) in fields" :key="index">
                <VCol cols="12" md="3">
                  <VSelect v-model="item.value.product_id" label="Product" :items="products" item-value="create_item_id"
                    item-title="name" :loading="products.length === 0"
                    :error-messages="errors?.[`items[${index}].product_id`]" required />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.cost_price" label="Cost Price" type="number"
                    :error-messages="errors?.[`items[${index}].cost_price`]" required readonly />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.current_selling_price" label="Current Selling Price" type="number"
                    :error-messages="errors?.[`items[${index}].current_selling_price`]" required readonly />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.mark_up" label="Mark up(%)" type="number"
                    :error-messages="errors?.[`items[${index}].mark_up`]" required />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.new_selling_price" label="New Selling Price" type="number"
                    :error-messages="errors?.[`items[${index}].new_selling_price`]" required />
                </VCol>
                <VCol cols="12" md="1" class="d-flex align-center">
                  <VBtn icon @click="removeItem(index)">
                    <VIcon icon="ri-alert-circle" />
                  </VBtn>
                </VCol>
              </VRow>

              <VBtn color="primary" class="mt-4" @click="addItem">
                Add Item
              </VBtn>
              <VBtn color="success" class="mt-4 pull-right" type="submit">
                Proceed
              </VBtn>
            </VForm>
            <!-- <v-btn  :disabled="!payment_date.value">Next</v-btn> -->
          </VStepperContent>
          <VStepperContent v-if="step === 2" step="2">
            <VList dense>
              <VRow>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Branch
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ user.branch }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Store
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ getItemValue(store_id, stores) }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>

                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Reason for Change
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ getItemValue(change_reason_id, reasons) }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
              </VRow>
            </VList>
            <!-- Loop through journalDetails and display each entry -->
            <VDivider />
            <VTable class="product-table">
              <thead>
                <tr>
                  <!-- <th>#</th> -->
                  <th>Product</th>
                  <th>Cost Price (N)</th>
                  <th>Current Selling Price (N)</th>
                  <th>Mark up(%)</th>
                  <th>New Selling Price (N)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in fields" :key="index">
                  <td>
                    {{ index + 1 }}. {{ getStoreItemValue(entry.value.product_id, products) }}
                  </td>
                  <td>{{ formatNumber(entry.value.cost_price) }}</td>
                  <td text-right>
                    {{ formatNumber(entry.value.current_selling_price) }}
                  </td>
                  <td text-right>
                    {{ formatNumber(entry.value.mark_up) }}
                  </td>
                  <td text-right>
                    {{ formatNumber(entry.value.new_selling_price) }}
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VBtn color="primary" class="mt-4" @click="prevStep">
              Back
            </VBtn>
            <VBtn color="success" class="mt-4" :loading="isLoading" :disabled="isLoading" @click="saveRequest">
              Submit
            </VBtn>
            <!-- <v-btn  :disabled="!payment_date.value">Next</v-btn> -->
          </VStepperContent>
          <VStepperContent v-if="step === 3" step="3">
            <VList dense>
              <VRow>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Branch
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ user.branch }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Store
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ getItemValue(store_id, stores) }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Reason for Change
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ getItemValue(change_reason_id, reasons) }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
                <VCol cols="12" md="6">
                  <VListItem>
                    <VListItemContent class="d-flex justify-between align-center">
                      <VListItemTitle class="mr-2">
                        Status
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ status }}
                      </VListItemSubtitle>
                    </VListItemContent>
                  </VListItem>
                </VCol>
              </VRow>
            </VList>
            <!-- Loop through journalDetails and display each entry -->
            <VDivider />
            <VTable class="product-table">
              <thead>
                <tr>
                  <!-- <th>#</th> -->
                  <th>Product</th>
                  <th>Cost Price (N)</th>
                  <th>Current Selling Price (N)</th>
                  <th>Mark up(%)</th>
                  <th>New Selling Price (N)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in fields" :key="index">
                  <td>
                    {{ index + 1 }}. {{ getStoreItemValue(entry.value.product_id, products) }}
                  </td>
                  <td>{{ formatNumber(entry.value.cost_price) }}</td>
                  <td text-right>
                    {{ formatNumber(entry.value.current_selling_price) }}
                  </td>
                  <td text-right>
                    {{ formatNumber(entry.value.mark_up) }}
                  </td>
                  <td text-right>
                    {{ formatNumber(entry.value.new_selling_price) }}
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VBtn color="success" class="mt-4" @click="newRequest">
              New Price Adjustment
            </VBtn>
            <!-- <v-btn  :disabled="!payment_date.value">Next</v-btn> -->
          </VStepperContent>
        </VStepperItems>
      </VStepper>
      <!-- </VForm> -->
    </VCardText>
  </VCard>

  <!-- </VContainer> -->
</template>

<style scoped>
/* Add custom styles here if needed */
</style>
