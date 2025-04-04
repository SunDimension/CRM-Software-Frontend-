<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'
import type { Branch, GenericSetUp } from '@/types/globalTypes'
import { formatNumber } from '@/types/globalTypes'
import { useFieldArray, useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import * as yup from 'yup'

const step = ref(1)
const showDialog = ref(false)
const message = ''
const isLoading = ref(false)
const status = ref<string>('')

// Validation Schema
const schema = yup.object({
  receive_date: yup.string().required('Receive Date is required'),
  store_id: yup.number().required('Store is required').positive('Select a valid store'),
  branch_id: yup.number().required('Branch is required').positive('Select a valid branch'),

  // vendor_id: yup.number().nullable(),

  vendor_id: yup.number().required('Vendor is required').positive('Select a valid vendor'),
  items: yup.array().of(
    yup.object().shape({
      product_id: yup.number().required('Product is required').positive('Select a valid product').label('Item'),
      quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1').label('Quanity'),
      unit_price: yup.number().required('Unit Price is required').min(0, 'Unit Price must be at least 0').label('Unit Price'),
      description: yup.string().nullable(),
    }),
  ),
})

// Form Setup
const { handleSubmit, errors, values, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    receive_date: '',
    store_id: 0,
    branch_id: 0,
    vendor_id: 0,
    items: [],
  },
})

const [receive_date, receive_dateAttrs] = defineField('receive_date')
const [store_id, store_idAttrs] = defineField('store_id')
const [branch_id, branch_idAttrs] = defineField('branch_id')
const [vendor_id, vendor_idAttrs] = defineField('vendor_id')

const { fields, push, remove } = useFieldArray('items')

// Mock Data
const stores = ref<Store[]>([])
const branches = ref<Branch[]>([])
const products = ref<GenericSetUp[]>([])
const vendors = ref<GenericSetUp[]>([]) // Added vendors

const headers = [
  { text: 'Product', value: 'product' },
  { text: 'Quantity', value: 'quantity' },
  { text: 'Unit Price', value: 'unit_price' },
  { text: 'Total', value: 'total' },
  { text: 'Description', value: 'description' },
]

// Add an Item
const addItem = () => {
  push({
    product_id: 0,
    quantity: 1, // Default quantity to 1 for clarity
    unit_price: 0,
    description: '',
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

    const response = await makeApiCall<{}>('POST', '/receive-orders', values)

    status.value = response.data.status

    // console.log(savedData.value)
    isLoading.value = false
    nextStep()
  }
  catch (error) {
    console.error('Error fetching products:', error)
    isLoading.value = false
    prevStep()
  }
}

const fetchProducts = async () => {
  try {
    const response = await makeApiCall<InventoryItem[]>('GET', '/my-store-items')

    products.value = response.data
  }
  catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', '/my-stores')

    stores.value = response.data
  }
  catch (error) {
    console.error('Error fetching stores:', error)
  }
}

const fetchBranches = async () => {
  try {
    const response = await makeApiCall<Branch[]>('GET', '/branches')

    branches.value = response.data
  }
  catch (error) {
    console.error('Error fetching branches:', error)
  }
}

const fetchVendors = async () => {
  try {
    const response = await makeApiCall<GenericSetUp[]>('GET', '/vendors')

    vendors.value = response.data
  }
  catch (error) {
    console.error('Error fetching vendors:', error)
  }
}

function getItemValue(id: any, data: any) {
  const item = data.find(item => item?.id === id)

  return item ? item.name : 'N/A'
}

// Fetch Data
onMounted(async () => {
  if (values.items.length === 0) {
    push({
      product_id: 0,
      quantity: 1,
      unit_price: 0,
      description: '',
    })
  }
  try {
    await Promise.all([
      fetchProducts(),
      fetchStores(),
      fetchBranches(),
      fetchVendors(),
    ])
    console.log(stores.value)
  }
  catch (error) {
    console.error('Error during data fetch:', error)
  }
})
</script>

<template>
  <VCard>
    <VCardTitle>Create Receive Order</VCardTitle>
    <VCardText>
      <VForm @submit="submit">
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
            <VStepperStep step="3" editable complete-icon="mdi-check-circle" color="green"
              error-icon="mdi-alert-circle">
              Completion
            </VStepperStep>
          </VStepperHeader>

          <VStepperItems>
            <VStepperContent v-if="step === 1" step="1">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField v-model="receive_date" label="Receive Date" type="date"
                    :error-messages="errors?.receive_date" required />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect v-model="store_id" label="Store" :items="stores" item-value="id" item-title="name"
                    :error-messages="errors?.store_id" required />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect v-model="branch_id" label="Branch" :items="branches" item-value="id" item-title="name"
                    :error-messages="errors?.branch_id" required />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect v-model="vendor_id" label="Vendor" :items="vendors" item-value="id" item-title="name"
                    :error-messages="errors?.vendor_id" />
                </VCol>
              </VRow>

              <!-- Receive Items Section -->
              <VDivider />
              <VCardSubtitle>Receive Items</VCardSubtitle>

              <VRow v-for="(item, index) in fields" :key="index">
                <VCol cols="12" md="3">
                  <VSelect v-model="item.value.product_id" label="Product" :items="products" item-value="id"
                    item-title="name" :error-messages="errors?.[`items[${index}].product_id`]" required />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.quantity" label="Quantity" type="number"
                    :error-messages="errors?.[`items[${index}].quantity`]" required />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField v-model="item.value.unit_price" label="Unit Price" type="number"
                    :error-messages="errors?.[`items[${index}].unit_price`]" required />
                </VCol>
                <VCol cols="12" md="4">
                  <VTextField v-model="item.value.description" label="Description"
                    :error-messages="errors?.[`items[${index}].description`]" />
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
              <!-- <v-btn  :disabled="!payment_date.value">Next</v-btn> -->
            </VStepperContent>
            <VStepperContent v-if="step === 2" step="2">
              <VList dense>
                <VRow>
                  <VCol cols="12" md="6">
                    <VListItem>
                      <VListItemContent class="d-flex justify-between align-center">
                        <VListItemTitle class="mr-2">
                          Receipt Date
                        </VListItemTitle>
                        <VListItemSubtitle>{{ values.receive_date }}</VListItemSubtitle>
                      </VListItemContent>
                    </VListItem>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VListItem>
                      <VListItemContent class="d-flex justify-between align-center">
                        <VListItemTitle class="mr-2">
                          Vendor
                        </VListItemTitle>
                        <VListItemSubtitle>
                          {{ getItemValue(vendor_id, vendors) }}
                        </VListItemSubtitle>
                      </VListItemContent>
                    </VListItem>
                  </VCol>
                  <VCol cols="12" md="6">
                    <VListItem>
                      <VListItemContent class="d-flex justify-between align-center">
                        <VListItemTitle class="mr-2">
                          Branch
                        </VListItemTitle>
                        <VListItemSubtitle>
                          {{ getItemValue(branch_id, branches) }}
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
                </VRow>
              </VList>
              <!-- Loop through journalDetails and display each entry -->
              <VDivider />
              <VTable class="product-table">
                <thead>
                  <tr>
                    <!-- <th>#</th> -->
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price (N)</th>
                    <th>Total</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in fields" :key="index">
                    <td>
                      {{ index + 1 }}. {{ getItemValue(entry.value.product_id, products) }}
                    </td>
                    <td>{{ entry.value.quantity }}</td>
                    <td text-right>
                      {{ formatNumber(entry.value.unit_price) }}
                    </td>
                    <td text-right>
                      {{ formatNumber(entry.value.quantity * entry.value.unit_price) }}
                    </td>
                    <td text-right>
                      {{ entry.value.description }}
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
                          Receipt Date
                        </VListItemTitle>
                        <VListItemSubtitle>{{ values.receive_date }}</VListItemSubtitle>
                      </VListItemContent>
                    </VListItem>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VListItem>
                      <VListItemContent class="d-flex justify-between align-center">
                        <VListItemTitle class="mr-2">
                          Vendor
                        </VListItemTitle>
                        <VListItemSubtitle>
                          {{ getItemValue(vendor_id, vendors) }}
                        </VListItemSubtitle>
                      </VListItemContent>
                    </VListItem>
                  </VCol>
                  <VCol cols="12" md="6">
                    <VListItem>
                      <VListItemContent class="d-flex justify-between align-center">
                        <VListItemTitle class="mr-2">
                          Branch
                        </VListItemTitle>
                        <VListItemSubtitle>
                          {{ getItemValue(branch_id, branches) }}
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
                    <th>Quantity</th>
                    <th>Unit Price (N)</th>
                    <th>Total</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in fields" :key="index">
                    <td>
                      {{ index + 1 }}. {{ getItemValue(entry.value.product_id, products) }}
                    </td>
                    <td>{{ entry.value.quantity }}</td>
                    <td text-right>
                      {{ formatNumber(entry.value.unit_price) }}
                    </td>
                    <td text-right>
                      {{ formatNumber(entry.value.quantity * entry.value.unit_price) }}
                    </td>
                    <td text-right>
                      {{ entry.value.description }}
                    </td>
                  </tr>
                </tbody>
              </VTable>

              <!-- <v-btn  :disabled="!payment_date.value">Next</v-btn> -->
            </VStepperContent>
          </VStepperItems>
        </VStepper>
      </VForm>
    </VCardText>
  </VCard>

  <!-- </VContainer> -->
</template>

<style scoped>
/* Add custom styles here if needed */
</style>
