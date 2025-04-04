<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, InventoryItem, Store, TransferOrder } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  stores: Store[];
  items: InventoryItem[];
  transferReasons: Gs[];
  mode: 'create' | 'edit';
  transferOrder?: TransferOrder; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['transferOrderCreated']);

const { handleSubmit } = useForm({
  validationSchema: {
    transfer_quantity(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Transfer Quantity is required.';
    },
  },
});

const transfer_order_number = useField('transfer_order_number');
const transfer_date = useField('transfer_date');
const transfer_quantity = useField('transfer_quantity');
const selectedSource = ref<Store | null>(null);
const selectedDestination = ref<Store | null>(null);
const selectedItem = ref<InventoryItem | null>(null);
const selectedTransferReason = ref<Gs | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.transferOrder) {
    transfer_order_number.value.value = props.transferOrder.transfer_order_number;
    transfer_date.value.value = props.transferOrder.transfer_date;
    transfer_quantity.value.value = props.transferOrder.transfer_quantity;
    selectedSource.value = props.stores.find(store => store.id === props.transferOrder?.source_id)?? null;
    selectedSource.value = props.stores.find(store => store.id === props.transferOrder?.source_id) ?? null;
    selectedDestination.value = props.stores.find(store => store.id === props.transferOrder?.destination_id) ?? null;   
     selectedItem.value = props.items.find(item => item.id === props.transferOrder?.item_id) ?? null;
    selectedTransferReason.value = props.transferReasons.find(reason => reason.id === props.transferOrder?.transfer_reason)?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.transferOrder, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Source') {
    selectedSource.value = value;
  } else if (label === 'Destination') {
    selectedDestination.value = value;
  } else if (label === 'Item') {
    selectedItem.value = value;
  } else if (label === 'Transfer Reason') {
    selectedTransferReason.value = value;
  }
};

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;

  const formData: TransferOrder = {
    transfer_order_number: values.transfer_order_number,
    transfer_date: values.transfer_date,
    transfer_reason: selectedTransferReason.value?.id ?? 0,
    source_id: selectedSource.value?.id ?? 0,
    destination_id: selectedDestination.value?.id ?? 0,
    transfer_quantity: values.transfer_quantity,
    item_id: selectedItem.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/transfer-orders/${props.transferOrder?.id}` : `/transfer-orders`;

  makeApiCall<TransferOrder>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('transferOrderCreated');
      dialog.value = false;
    })
    .catch(() => {
      apiError.value = "An unexpected error occurred.";
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>


<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          prepend-icon=""
          :text="`Create Transfer Order`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          variant="plain"
          color="pending"
        >
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Transfer Order' : 'Create Transfer Order'">
        <v-card-text>
          <form @submit.prevent="submit">
            <!-- Transfer Date Field -->
            <v-text-field
              v-model="transfer_date.value.value"
              label="Transfer Date*"
              required
              type="date"
              class="mb-5"
            ></v-text-field>

            <!-- Transfer Reason Selector -->
            <filterSelect
              :genericOptions="transferReasons"
              :label_cus="'Transfer Reason*'"
              @optionSelected="(item) => handleOptionSelected(item, 'Transfer Reason')"
              v-model="selectedTransferReason" 
            />

            <!-- Source and Destination Selectors -->
            <VRow class="mt-5 mb-5">
              <vCol cols="6">
                <filterSelect
                  :genericOptions="stores"
                  :label_cus="'Source*'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Source')"
                  v-model="selectedSource" 
                />
              </vCol>
              <vCol cols="6">
                <filterSelect
                  :genericOptions="stores"
                  :label_cus="'Destination*'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Destination')"
                  v-model="selectedDestination" 
                />
              </vCol>
            </VRow>

            <!-- Transfer Quantity Field -->
            <v-text-field
              v-model="transfer_quantity.value.value"
              :error-messages="transfer_quantity.errorMessage.value"
              label="Transfer Quantity*"
              type="number"
              required
              class="mb-5"
            ></v-text-field>

            <!-- Item Selector -->
            <filterSelect
              :genericOptions="items"
              :label_cus="'Item*'"
              @optionSelected="(item) => handleOptionSelected(item, 'Item')"
              v-model="selectedItem" 
            />

            <!-- Image Upload Field -->
            <v-file-input accept="image/*" label="Image Upload" class="my-5"></v-file-input>

            <!-- Error Message Display -->
            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                :text="mode === 'edit' ? 'Update Transfer Order' : 'Create Transfer Order'"
                variant="tonal"
                :loading="loading"
              >
                <template #loader>
                  <v-progress-circular indeterminate size="24" class="mr-2" />
                </template>
              </v-btn>
            </v-card-actions>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
