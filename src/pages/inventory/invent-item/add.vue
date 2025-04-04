<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, InventoryItem,Store,Branch,Vendor, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  mode: 'create' | 'edit';
  inventoryItem?: InventoryItem; // Optional for edit mode
  itemCategories: Gs[];
  itemTypes: Gs[];
  units: Gs[];
  
  brands: Gs[];
  dimensions: Gs[];
  taxes: Gs[];
  warehouses: Warehouse[];
  weights: Gs[];
  branches: Branch[];
  stores: Store[];
  vendors: Vendor[];
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['inventoryItemCreated']);

const { handleSubmit } = useForm({
  validationSchema: {
    name(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Name is required.';
    },
    cost_price(value: number) {
      if (!isNaN(value) && value > 0) return true;
      return 'Cost price must be a positive number.';
    },
    selling_price(value: number) {
      if (!isNaN(value) && value > 0) return true;
      return 'Selling price must be a positive number.';
    },
  },
});

// Define form fields
const name = useField('name');
const description = useField('description');
const batch_number = useField('batch_number');
const cost_price = useField('cost_price');
const selling_price = useField('selling_price');
const discount = useField('discount');
const reorder_level = useField('reorder_level');




const selectedCategory = ref<Gs | null>(null);

const selectedType = ref<Gs | null>(null);
const selectedUnit = ref<Gs | null>(null);
const selectedBrand = ref<Gs | null>(null);
const selectedDimension = ref<Gs | null>(null);
const selectedTax = ref<Gs | null>(null);

const selectedWeight = ref<Gs | null>(null);
const selectedBranch = ref<Branch | null>(null);
const selectedWarehouse= ref<Warehouse | null>(null);
const selectedStore = ref<Store | null>(null);
const selectedVendor = ref<Vendor | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.inventoryItem) {
    name.value.value = props.inventoryItem.name;
    description.value.value = props.inventoryItem.description;
    batch_number.value.value = props.inventoryItem.batch_number || '';
    cost_price.value.value = props.inventoryItem.cost_price;
    selling_price.value.value = props.inventoryItem.selling_price;
    discount.value.value = props.inventoryItem.discount || 0;
    reorder_level.value.value = props.inventoryItem.reorder_level;
    
 
    selectedCategory.value = props.itemCategories.find(category => category.id === props.inventoryItem?.item_category_id) ?? null;
    selectedType.value = props.itemTypes.find(type => type.id === props.inventoryItem?.item_type_id) ?? null;
     selectedWarehouse.value = props.warehouses.find(warehouse => warehouse.id === props.inventoryItem?.warehouse) ?? null;
    selectedUnit.value = props.units.find(unit => unit.id === props.inventoryItem?.unit_id) ?? null;
    selectedBrand.value = props.brands.find(brand => brand.id === props.inventoryItem?.brand_id) ?? null;
    selectedDimension.value = props.dimensions.find(dim => dim.id === props.inventoryItem?.dimension_id) ?? null;
    selectedTax.value = props.taxes.find(tax => tax.id === props.inventoryItem?.tax_id) ?? null;
    selectedWeight.value = props.weights.find(weight => weight.id === props.inventoryItem?.weight_id) ?? null;
    selectedBranch.value = props.branches.find(branch => branch.id === props.inventoryItem?.branch_id) ?? null;
    selectedStore.value = props.stores.find(store => store.id === props.inventoryItem?.store_id) ?? null;
    selectedVendor.value = props.vendors.find(vendor => vendor.id === props.inventoryItem?.vendor_id) ?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.inventoryItem, loadDataForEdit, { immediate: true });

// Handle option selection from custom selects
const handleOptionSelected = (value: any, label: string) => {
  switch (label) {
    case 'Category': selectedCategory.value = value; break;
    case 'Type': selectedType.value = value; break;
    case 'Unit': selectedUnit.value = value; break;
    case 'Brand': selectedBrand.value = value; break;
    case 'Dimension': selectedDimension.value = value; break;
    case 'Tax': selectedTax.value = value; break;
    case 'Weight': selectedWeight.value = value; break;
    case 'Branch': selectedBranch.value = value; break;
    case 'Store': selectedStore.value = value; break;
    case 'Vendor': selectedVendor.value = value; break;
    case 'Warehouse': selectedWarehouse.value = value; break;
  }
};


  


const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;

  const formData: InventoryItem = {
    name: values.name,
    description: values.description,
    batch_number: values.batch_number,
    cost_price: values.cost_price,
    selling_price: values.selling_price,
    discount: values.discount,
    reorder_level: values.reorder_level,
    warehouse: values.warehouse,
    item_category_id: selectedCategory.value?.id ?? 0,
    item_type_id: selectedType.value?.id ?? 0,
    unit_id: selectedUnit.value?.id ?? 0,
    brand_id: selectedBrand.value?.id ?? 0,
    dimension_id: selectedDimension.value?.id ?? 0,
    tax_id: selectedTax.value?.id ?? 0,
    weight_id: selectedWeight.value?.id ?? 0,
    branch_id: selectedBranch.value?.id ?? 0,
    store_id: selectedStore.value?.id,
    vendor_id: selectedVendor.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/create-items/${props.inventoryItem?.id}` : `/inventory-items`;

  makeApiCall<InventoryItem>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('inventoryItemCreated');
      dialog.value = false;
    })
    .catch(() => {
      apiError.value = 'An unexpected error occurred.';
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          :text="`Create Inventory Item`"
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

      <v-card :title="mode === 'edit' ? 'Edit Inventory Item' : 'Create Inventory Item'">
        <v-card-text>
          <form @submit.prevent="submit">
            <!-- Name Field -->
            <v-text-field
              v-model="name.value.value"
              :error-messages="name.errorMessage.value"
              label="Item Name*"
              required
              class="mb-5"
            />

            <!-- Category, Type, Unit, Brand Selectors -->
            <filterSelect :genericOptions="itemCategories" :label_cus="'Item Category*'" @optionSelected="(item) => handleOptionSelected(item, 'Category')" v-model="selectedCategory" />
            <filterSelect :genericOptions="itemTypes" :label_cus="'Item Type*'" @optionSelected="(item) => handleOptionSelected(item, 'Type')" v-model="selectedType" />
            <filterSelect :genericOptions="units" :label_cus="'Unit*'" @optionSelected="(item) => handleOptionSelected(item, 'Unit')" v-model="selectedUnit" />
            <filterSelect :genericOptions="brands" :label_cus="'Brand*'" @optionSelected="(item) => handleOptionSelected(item, 'Brand')" v-model="selectedBrand" />

            <!-- Cost Price and Selling Price Fields -->
            <v-text-field
              v-model="cost_price.value.value"
              :error-messages="cost_price.errorMessage.value"
              label="Cost Price*"
              type="number"
              required
              class="mb-5"
            />
            <v-text-field
              v-model="selling_price.value.value"
              :error-messages="selling_price.errorMessage.value"
              label="Selling Price*"
              type="number"
              required
              class="mb-5"
            />

            <!-- Discount, Reorder Level, and Batch Number Fields -->
            <v-text-field v-model="discount.value.value" label="Discount" type="number" class="mb-5" />
            <v-text-field v-model="reorder_level.value.value" label="Reorder Level*" class="mb-5" />
            <v-text-field v-model="batch_number.value.value" label="Batch Number" class="mb-5" />

            <!-- Dimension, Tax, Manufacturer, Weight, Branch, Store, and Vendor Selectors -->
            <filterSelect :genericOptions="dimensions" :label_cus="'Dimension*'" @optionSelected="(item) => handleOptionSelected(item, 'Dimension')" v-model="selectedDimension" />
            <filterSelect :genericOptions="taxes" :label_cus="'Tax*'" @optionSelected="(item) => handleOptionSelected(item, 'Tax')" v-model="selectedTax" />

            <filterSelect :genericOptions="weights" :label_cus="'Weight*'" @optionSelected="(item) => handleOptionSelected(item, 'Weight')" v-model="selectedWeight" />
            <filterSelect :genericOptions="branches" :label_cus="'Branch*'" @optionSelected="(item) => handleOptionSelected(item, 'Branch')" v-model="selectedBranch" />
            <filterSelect :genericOptions="stores" :label_cus="'Store'" @optionSelected="(item) => handleOptionSelected(item, 'Store')" v-model="selectedStore" />
            <filterSelect :genericOptions="vendors" :label_cus="'Vendor*'" @optionSelected="(item) => handleOptionSelected(item, 'Vendor')" v-model="selectedVendor" />
            <filterSelect :genericOptions="warehouses" :label_cus="'Warehouse*'" @optionSelected="(item) => handleOptionSelected(item, 'Warehouse')" v-model="selectedWarehouse" />

            <!-- Warehouse and Barcode Fields -->
           
           
            <!-- Error Message Display -->
            <div v-if="apiError" class="text-error">{{ apiError }}</div>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
              <v-btn color="success-darken-1" type="submit" :text="mode === 'edit' ? 'Update Item' : 'Create Item'" variant="tonal" :loading="loading">
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
