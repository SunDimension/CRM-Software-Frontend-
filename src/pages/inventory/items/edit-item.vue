<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp as Gs, InventoryItem, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  // warehouses: Warehouse[];
  // branches: Branch[];
  itemCategories: Gs[];
  // itemTypes: Gs[];
  // taxes: Gs[];
  brands: Gs[];
  // stores: Gs[];
  // dimensions: Gs[];
  vendors: Gs[];
  // manufacturers: Gs[];
  // weights: Gs[];
  // units: Gs[];
  prevValues: InventoryItem;
}>();

const dialog = ref(false);
const apiError = ref<null|string>(null);
const loading = ref(false);
const emits = defineEmits(['updated']);

const { handleSubmit } = useForm({
  validationSchema: {
    name(value: string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
  },
});

const handleOptionSelected = (value: any, label: string) => {
  const fieldKey = labelFieldMap[label];
  if (fieldKey) {
    fields[fieldKey].value.value = value;
  } else {
    console.warn(`Unknown label: ${label}`);
  }
};

type FieldKey = keyof typeof fields;
const labelFieldMap:Record<string, FieldKey> = {
  'Item Category': 'selectedItemCategory',
  // 'Item Type': 'selectedItemType',
  // 'Units': 'selectedUnit',
  // 'Taxes': 'selectedTax',
  // 'Manufacturer': 'selectedManufacturer',
  'Brand': 'selectedBrand',
  // 'Store': 'selectedStore',
  // 'Dimension': 'selectedDimension',
  // 'Weight': 'selectedWeight',
  // 'Branch': 'selectedBranch',
  // 'Warehouse': 'selectedWarehouse',
  'Vendor': 'selectedVendor',
  // 'Unit': 'selectedUnit',
  // 'Tax': 'selectedTax' 
};

const fields = {
  name: useField<string>('name'),
  // quantity: useField<number>('quantity'),
  // description: useField<string>('description'),
  // image_url: useField<string>('image_url'),
  // batch_number: useField<string>('batch_number'),
  // selectedItemType: useField<Gs>('item_type'),
  selectedItemCategory: useField<Gs>('item_category'),
  // selectedUnit: useField<Gs>('unit'),
  // selectedTax: useField<Gs>('tax'),
  // selectedManufacturer: useField<Gs>('manufacturer'),
  selectedBrand: useField<Gs>('brand'),
  // selectedStore: useField<Gs>('store'),
  // costPrice: useField<number>('cost_price'),
  // sellingPrice: useField<number>('selling_price'),
  // barcode: useField<string>('barcode'),
  // reorderLevel: useField<string>('reorder_level'),
  // selectedDimension: useField<Gs>('dimension'),
  // selectedWeight: useField<Gs>('weight'),
  // selectedBranch: useField<Branch>('branch'),
  // selectedWarehouse: useField<Warehouse>('warehouse'),
  selectedVendor: useField<Gs>('vendor')
};

const submit = handleSubmit((values) => {
    loading.value = true;
    const formData: InventoryItem = {
      // user_id: useAuthStore().getUserDetails.user.id,
      name: fields.name.value.value,
      item_category_id: fields.selectedItemCategory.value.value.id ?? 0,
      // item_type_id: fields.selectedItemType.value.value.id ?? 0,
      // description: fields.description.value.value,
      // batch_number: fields.batch_number.value.value,
      // unit_id: fields.selectedUnit.value.value.id ?? 0,
      brand_id: fields.selectedBrand.value.value.id ?? 0,
      // store_id: fields.selectedStore.value.value.id ?? 0,
      // cost_price: fields.costPrice.value.value,
      // selling_price: fields.sellingPrice.value.value,
      // reorder_level: fields.reorderLevel.value.value.toString(),
      // dimension_id: fields.selectedDimension.value.value.id ?? 0,
      // weight_id: fields.selectedWeight.value.value.id ?? 0,
      // branch_id: fields.selectedBranch.value.value.id ?? 0,
      // warehouse: fields.selectedWarehouse.value.value.id ?? 0,
      vendor_id: fields.selectedVendor.value.value.id ?? 0,
      // tax_id: fields.selectedTax.value.value.id ?? 0,
      // manufacturer_id: fields.selectedManufacturer.value.value.id ?? 0,
      // image_url: fields.image_url.value.value,
      // quantity: fields.quantity.value.value,
      // barcode: fields.barcode.value.value,
  };
  // console.log(fields.selectedDimension.value.value)

  makeApiCall<InventoryItem>('PUT', `/create-items/${props.prevValues.id}`, formData)
    .then(() => {
      emits('updated');
      dialog.value = false;
    })
    .catch((error) => {
      apiError.value = error.response?.data?.message || "An unexpected error occurred.";
    })
    .finally(() => {
      loading.value = false;
    });;
});

const setPreviousValues = (prevValues: InventoryItem) => {
  fields.name.value.value = prevValues.name || '';
  // fields.description.value.value = prevValues.description || '';
  // fields.batch_number.value.value = prevValues.batch_number || '';
  // fields.selectedItemType.value.value = props.itemTypes.find(type => type.id === prevValues.item_type_id) || {} as Gs;
  fields.selectedItemCategory.value.value = props.itemCategories.find(category => category.id === prevValues.item_category_id) || {} as Gs;
  // fields.selectedUnit.value.value = props.units.find(unit => unit.id === prevValues.unit_id) || {} as Gs;
  // fields.selectedTax.value.value = props.taxes.find(tax => tax.id === prevValues.tax_id) || {} as Gs;
  // fields.selectedManufacturer.value.value = props.manufacturers.find(manufacturer => manufacturer.id === prevValues.manufacturer_id) || {} as Gs;
  fields.selectedBrand.value.value = props.brands.find(brand => brand.id === prevValues.brand_id) || {} as Gs;
  // fields.selectedStore.value.value = props.stores.find(store => store.id === prevValues.store_id) || {} as Gs;
  // fields.costPrice.value.value = prevValues.cost_price || 0;
  // fields.sellingPrice.value.value = prevValues.selling_price || 0;
  // fields.barcode.value.value = prevValues.barcode || '';
  // fields.reorderLevel.value.value = prevValues.reorder_level ?? '0';
  // fields.selectedDimension.value.value = props.dimensions.find(dimension => dimension.id === prevValues.dimension_id) || {} as Gs;
  // fields.selectedWeight.value.value = props.weights.find(weight => weight.id === prevValues.weight_id) || {} as Gs;
  // fields.selectedBranch.value.value = props.branches.find(branch => branch.id === prevValues.branch_id) || {} as Branch;
  // fields.selectedWarehouse.value.value = props.warehouses.find(warehouse => warehouse.id === prevValues.warehouse) || {} as Warehouse;
  fields.selectedVendor.value.value = props.vendors.find(vendor => vendor.id === prevValues.vendor_id) || {} as Gs;
  console.log('prevValuestaxxxx', prevValues);
};

// Initialize previous values if in edit mode
watch(
  () => dialog,
  () => {
    if (props.prevValues) {
      nextTick(() => { // <-- Add nextTick here
        setPreviousValues(props.prevValues);
      });
    }
  },
  { immediate: true, deep: true } 
);

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>
      <v-card title="Edit Item">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="fields.name.value.value"
              :counter="10"
              :error-messages="fields.name.errorMessage.value"
              label="Item Name"
              required
            ></v-text-field>
            <VRow class="mxt-5 mb-5">
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="itemTypes" :label_cus="'Item Type'" @optionSelected="(item) => handleOptionSelected(item, 'Item Type')" :prevValue="fields.selectedItemType.value.value.id" :required="true"/>
              </vCol> -->
              <vCol cols="6">
                <filterSelect :genericOptions="itemCategories" :label_cus="'Item Category'" @optionSelected="(item) => handleOptionSelected(item, 'Item Category')" :prevValue="fields.selectedItemCategory.value.value.id" :required="true"/>
              </vCol>
            </VRow>
            <!-- <v-textarea
              v-model="fields.description.value.value"
              :counter="100"
              :error-messages="fields.description.errorMessage.value"
              label="Description*"
              rows="3"
            ></v-textarea> -->
            <VRow class="mxt-5 xmb-5">
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="units" :label_cus="'Unit'" @optionSelected="(item) => handleOptionSelected(item, 'Unit')"  :prevValue="fields.selectedUnit.value.value.id"/>
              </vCol> -->
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="manufacturers" :label_cus="'Manufacturer'" @optionSelected="(item) => handleOptionSelected(item, 'Manufacturer')" :prevValue="fields.selectedManufacturer.value.value.id" />
              </vCol> -->
              <vCol cols="6">
                <filterSelect :genericOptions="brands" :label_cus="'Brand'" @optionSelected="(item) => handleOptionSelected(item, 'Brand')" :prevValue="fields.selectedBrand.value.value.id" />
              </vCol>
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="taxes" :label_cus="'Tax'" @optionSelected="(item) => handleOptionSelected(item, 'Tax')"  :prevValue="fields.selectedTax.value.value.id"/>
              </vCol> -->
              <!-- <vCol cols="6">
                <v-text-field
                  v-model="fields.barcode.value.value"
                  :counter="10"
                  :error-messages="fields.barcode.errorMessage.value"
                  label="Barcode*"
                  required
                ></v-text-field> -->
              <!-- </vCol> -->
              <!-- <vCol cols="6">
                <v-text-field
                  v-model="fields.reorderLevel.value.value"
                  :counter="10"
                  :error-messages="fields.reorderLevel.errorMessage.value"
                  label="Reorder Level*"
                  required
                ></v-text-field>
              </vCol> -->
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="dimensions" :label_cus="'Dimension'" @optionSelected="(item)=>handleOptionSelected(item,'Dimension')" :prevValue="fields.selectedDimension.value.value.id" />
              </vCol> -->
              <!-- <vCol cols="6">
                <filterSelect :genericOptions="weights" :label_cus="'Weight'" @optionSelected="(item)=>handleOptionSelected(item,'Weight')" :prevValue="fields.selectedWeight.value.value.id" />
              </vCol> -->
              <vCol cols="6">
                  <filterSelect :genericOptions="vendors" :label_cus="'Vendor'" @optionSelected="(item)=>handleOptionSelected(item,'Vendor')" :prevValue="fields.selectedVendor.value.value.id" />
              </vCol>
              <vCol cols="6">
                  <!-- <filterSelect :genericOptions="stores" :label_cus="'Store'" @optionSelected="(item)=>handleOptionSelected(item,'Store')" :prevValue="fields.selectedStore.value.value.id" /> -->
              </vCol>
            </VRow>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>
    
              <v-btn
                text="Close"
                variant="plain"
                @click="dialog = false"
              ></v-btn>
    
              <v-btn
                color="success-darken-1"
                type="submit"
                :text="'Update Item'"
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
<!-- <script lang="ts">
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script> -->
