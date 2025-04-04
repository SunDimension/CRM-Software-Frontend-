<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp as Gs, InventoryAdjustment, InventoryItem, Store, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  branches: Branch[];
  warehouses: Warehouse[];
  stores: Store[];
  adjustmentTypes: Gs[];
  reasons: Gs[];
  itemCategories: Gs[];
  items: InventoryItem[];
  mode: 'create' | 'edit';
  adjustment?: InventoryAdjustment; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['inventoryAdjustmentCreated']);

const { handleSubmit } = useForm({
  validationSchema: {
    quantity(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Quantity is required.';
    },
  },
});

// Fields and selection refs
const selectedAdjustmentType = ref<Gs | null>(null);
const selectedWarehouse = ref<Warehouse | null>(null);
const selectedStore = ref<Store | null>(null);
const selectedBranch = ref<Branch | null>(null);
const selectedReason = ref<Gs | null>(null);
const selectedItemCategory = ref<Gs | null>(null);
const selectedItem = ref<InventoryItem | null>(null);

// Form fields
const date = useField<string>('date');
const description = useField<string | undefined>('description');
const quantity = useField<number>('quantity');
const costPrice = useField<number | undefined>('cost_price');
const sellingPrice = useField<number | undefined>('selling_price');

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.adjustment) {
    date.value.value = props.adjustment.date;
    description.value.value = props.adjustment.description ?? ''; 
    quantity.value.value = props.adjustment.quantity;
    costPrice.value.value = props.adjustment.cost_price;
    sellingPrice.value.value = props.adjustment.selling_price;

    selectedAdjustmentType.value = props.adjustmentTypes.find(type => type.id === props.adjustment.adjustment_type_id) ?? null;
    selectedWarehouse.value = props.warehouses.find(warehouse => warehouse.id === props.adjustment.warehouse_id) ?? null;
    selectedStore.value = props.stores.find(store => store.id === props.adjustment?.store_id) ?? null;
    selectedBranch.value = props.branches.find(branch => branch.id === props.adjustment.branch_id) ?? null;
    selectedReason.value = props.reasons.find(reason => reason.id === props.adjustment.reason_id) ?? null;
    selectedItemCategory.value = props.itemCategories.find(category => category.id === props.adjustment.item_category_id) ?? null;
    selectedItem.value = props.items.find(item => item.id === props.adjustment.item_id) ?? null;
  }
};

// Handle option selection
const handleOptionSelected = (value: any, label: string) => {
  switch (label) {
    case 'Adjustment Type':
      selectedAdjustmentType.value = value;
      break;
    case 'Warehouse':
      selectedWarehouse.value = value;
      break;
    case 'Store':
      selectedStore.value = value;
      break;
    case 'Branch':
      selectedBranch.value = value;
      break;
    case 'Reason':
      selectedReason.value = value;
      break;
    case 'Item Category':
      selectedItemCategory.value = value;
      break;
    case 'Item':
      selectedItem.value = value;
      break;
  }
};

// Watch for changes in props to update form data
watch(() => props.adjustment, loadDataForEdit, { immediate: true });

const submit = handleSubmit(async (values) => {
  loading.value = true;
  apiError.value = null;

  const formData: InventoryAdjustment = {
    adjustment_type_id: selectedAdjustmentType.value?.id ?? 0,
    item_id: selectedItem.value?.id ?? 0,
    date: date.value.value,
    branch_id: selectedBranch.value?.id ?? 0,
    warehouse_id: selectedWarehouse.value?.id ?? 0,
    store_id: selectedStore.value?.id ?? 0,
    reason_id: selectedReason.value?.id ?? 0,
    description: description.value.value ?? undefined, // Handle optional field
    item_category_id: selectedItemCategory.value?.id ?? 0,
    quantity: quantity.value.value,
    cost_price: costPrice.value.value ?? undefined, // Handle optional field
    selling_price: sellingPrice.value.value ?? undefined, // Handle optional field
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/inventory-adjustments/${props.adjustment?.id}` : `/inventory-adjustments`;

  try {
    await makeApiCall<InventoryAdjustment>(apiMethod, apiUrl, formData);
    emits('inventoryAdjustmentCreated');
    dialog.value = false;
  } catch (error) {
    apiError.value = 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
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
          text="Create Inventory Adjustment"
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

      <v-card :title="mode === 'edit' ? 'Edit Inventory Adjustment' : 'Create Inventory Adjustment'">
        <v-card-text>
          <form @submit.prevent="submit">
            <!-- Adjustment Date Field -->
            <v-text-field
              v-model="date.value.value"
              label="Date*"
              required
              type="date"
              class="mb-5"
            ></v-text-field>

            <!-- Adjustment Type Selector -->
            <filterSelect
              :genericOptions="adjustmentTypes"
              label_cus="Adjustment Type*"
              @optionSelected="(item) => handleOptionSelected(item, 'Adjustment Type')"
              v-model="selectedAdjustmentType"
            />

            <!-- Warehouse and Store Selectors -->
            <v-row class="mt-5 mb-5">
              <v-col cols="6">
                <filterSelect
                  :genericOptions="warehouses"
                  label_cus="Warehouse"
                  @optionSelected="(item) => handleOptionSelected(item, 'Warehouse')"
                  v-model="selectedWarehouse"
                />
              </v-col>
              <v-col cols="6">
                <filterSelect
                  :genericOptions="stores"
                  label_cus="Store"
                  @optionSelected="(item) => handleOptionSelected(item, 'Store')"
                  v-model="selectedStore"
                />
              </v-col>
            </v-row>

            <!-- Branch and Reason Selectors -->
            <v-row class="mt-5 mb-5">
              <v-col cols="6">
                <filterSelect
                  :genericOptions="branches"
                  label_cus="Branch"
                  @optionSelected="(item) => handleOptionSelected(item, 'Branch')"
                  v-model="selectedBranch"
                />
              </v-col>
              <v-col cols="6">
                <filterSelect
                  :genericOptions="reasons"
                  label_cus="Reason*"
                  @optionSelected="(item) => handleOptionSelected(item, 'Reason')"
                  v-model="selectedReason"
                />
              </v-col>
            </v-row>

            <!-- Item Category and Item Selectors -->
            <v-row class="mt-5 mb-5">
              <v-col cols="6">
                <filterSelect
                  :genericOptions="itemCategories"
                  label_cus="Item Category"
                  @optionSelected="(item) => handleOptionSelected(item, 'Item Category')"
                  v-model="selectedItemCategory"
                />
              </v-col>
              <v-col cols="6">
                <filterSelect
                  :genericOptions="items"
                  label_cus="Item*"
                  @optionSelected="(item) => handleOptionSelected(item, 'Item')"
                  v-model="selectedItem"
                />
              </v-col>
            </v-row>

            <!-- Quantity Field -->
            <v-text-field
              v-model="quantity.value.value"
              :error-messages="quantity.errorMessage.value"
              label="Quantity*"
              type="number"
              required
              class="mb-5"
            ></v-text-field>

            <!-- Cost Price and Selling Price Fields -->
            <v-row class="mt-5 mb-5">
              <v-col cols="6">
                <v-text-field
                  v-model="costPrice.value.value"
                  label="Cost Price"
                  type="number"
                  class="mb-5"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="sellingPrice.value.value"
                  label="Selling Price"
                  type="number"
                  class="mb-5"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Description Field -->
            <v-text-field
              v-model="description.value.value"
              label="Description*"
              required
              class="mb-5"
            ></v-text-field>

            <!-- API Error Display -->
            <v-alert v-if="apiError" type="error" dismissible>
              {{ apiError }}
            </v-alert>
          </form>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-card-actions>
          <v-btn color="secondary" @click="dialog = false">Cancel</v-btn>
          <v-btn
            :disabled="loading"
            @click="submit"
            color="primary"
          >
            {{ mode === 'edit' ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


