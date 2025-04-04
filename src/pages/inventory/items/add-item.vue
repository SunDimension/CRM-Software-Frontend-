<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, InventoryItem, Vendor } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  // warehouses: Warehouse[];
  // branch: Branch[];
  itemCategories: Gs[];
  // itemTypes:Gs[];
  // taxes:Gs[];
  brands: Gs[];
  // dimensions:Gs[];
  vendors: Vendor[];
  // manufacturers:Gs[];
  // weights:Gs[];
  // units:Gs[];
  // stores:Gs[];
  mode: 'create' | 'edit';
  prevValues?: InventoryItem
}>();
const dialog = ref(false);
const apiError = ref<null | string>(null);
const emits = defineEmits(['updated']);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name(value: string) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    },
  },
})

// console.log('props.stores?????????????????????????/',props.units, props.stores)


const fields = {
  name: useField<string>('name'),
  quantity: useField<number>('quantity'),
  // description: useField<string>('description'),
  // image_url: useField<string>('image_url'),
  // batch_number: useField<string>('batch_number'),
  // selectedItemType: useField<Gs>('item_type'),
  selectedItemCategory: useField<Gs>('item_category'),
  // selectedUnit: useField<Gs>('unit'),
  // selectedTax: useField<Gs>('tax'),
  selectedBrand: useField<Gs>('brand'),
  // selectedStore: useField<Gs>('store'),
  // costPrice: useField<number>('cost_price'),
  // sellingPrice: useField<number>('selling_price'),
  // reorderLevel: useField<string>('reorder_level'),
  // selectedDimension: useField<Gs>('dimension'),
  // selectedWeight: useField<Gs>('weight'),
  // selectedBranch: useField<Branch>('branch'),
  // selectedWarehouse: useField<Warehouse>('warehouse'),
  selectedVendor: useField<Vendor>('vendor')
};

// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;
  // const selectedState = Number(state_id.value) ;//forced the type number to appease the typescript gods
  // const selectedCountry = Number(country_id.value);
  console.log('selectedState', fields)

  // Include state and country or any other customeSelect elements used in the values, for some reason custome selects are not working
  // console.log('Unit ID:', fields.selectedUnit.value?.value);
  const formData: InventoryItem = {
    // user_id: useAuthStore().getUserDetails.user.id,
    name: fields.name.value.value,
    item_category_id: fields.selectedItemCategory.value.value.id ?? 0,
    // item_type_id: fields.selectedItemType.value.value.id ?? 0,
    // description: fields.description.value.value,
    // batch_number: fields.batch_number.value.value, // Provide a default value if needed
    // unit_id: fields.selectedUnit.value.value.id ?? 0,
    brand_id: fields.selectedBrand.value.value.id ?? 0,
    // store_id: fields.selectedStore.value.value.id ?? 0,
    // cost_price: fields.costPrice.value.value,
    // selling_price: fields.sellingPrice.value.value,
    // reorder_level: fields.reorderLevel.value.value.toString(), // Convert to string as per interface
    // dimension_id: fields.selectedDimension.value.value.id ?? 0,
    // weight_id: fields.selectedWeight.value.value.id ?? 0,
    // branch_id: fields.selectedBranch.value.value.id ?? 0,
    // warehouse: fields.selectedWarehouse.value.value.id ?? 0, // Assuming 'warehouse' is the ID, not object
    vendor_id: fields.selectedVendor.value.value.id ?? 0,
    // tax_id: fields.selectedTax.value.value.id ?? 0,

    // quantity: fields.quantity.value.value, // Provide a default or handle image uploads separately

  };
  // console.warn('fsields.selectedUnit.value.value', fields.selectedUnit.value.value??0, formData);

  // alert(JSON.stringify(formData, null, 2));
  const method = props.mode === 'edit' ? 'PUT' : 'POST';
  const api_url = props.mode === 'edit' ? `/create-items/${props.prevValues?.id}` : '/create-items';

  // makeApiCall<InventoryItem>(method, api_url, formData).then((response) => {
  //   // console.log(response.data)
  //   emits('updated');
  //   dialog.value = false;
  // }).finally(() => {
  //   loading.value = false
  // })
  makeApiCall<InventoryItem>(method, api_url, formData)
    .then((response) => {
      emits('updated');
      // emits('itemUpdated', response.data); // Assuming your API returns the updated item
      dialog.value = false;
      // resetForm();
    })
    .catch((error) => {
      // Handle errors here
      if (error.response && error.response.data) {
        apiError.value = error.response.data.message || "An error occurred while processing your request.";
      } else {
        apiError.value = "An unexpected error occurred.";
      }

      // Emit an event to notify the parent component of the error
      // emits('itemUpdateFailed', apiError.value); 
    })
    .finally(() => {
      loading.value = false;
    });
})

const setPreviousValues = (prevValues: InventoryItem) => {
  // console.log('prev values updated successfully...i think',  prevValues.item_type_id)
  fields.name.value.value = prevValues.name || '';
  // fields.quantity.value.value = prevValues.quantity || '';
  // fields.description.value.value = prevValues.description || '';
  // fields.image_url.value.value = prevValues.image_url || '';
  // fields.batch_number.value.value = prevValues.batch_number || '';
  // fields.selectedItemType.value.value = props.itemTypes.find(type => type.id === prevValues.item_type_id) || {} as Gs;
  fields.selectedItemCategory.value.value = props.itemCategories.find(category => category.id === prevValues.item_category_id) || {} as Gs;
  // fields.selectedUnit.value.value = props.units.find(unit => unit.id === prevValues.unit_id) || {} as Gs;
  // fields.selectedTax.value.value = props.taxes.find(tax => tax.id === prevValues.tax_id) || {} as Gs;
  fields.selectedBrand.value.value = props.brands.find(brand => brand.id === prevValues.brand_id) || {} as Gs;
  // fields.costPrice.value.value = prevValues.cost_price || 0;
  // fields.sellingPrice.value.value = prevValues.selling_price || 0;

  // fields.reorderLevel.value.value = prevValues.reorder_level?? ' 0';
  // fields.selectedDimension.value.value = props.dimensions.find(dimension => dimension.id === prevValues.dimension_id) || {} as Gs;
  // fields.selectedWeight.value.value = props.weights.find(weight => weight.id === prevValues.weight_id) || {} as Gs;
  // fields.selectedBranch.value.value = props.branch.find(branch => branch.id === prevValues.branch_id) || {} as Branch;
  // fields.selectedWarehouse.value.value = props.warehouses.find(warehouse => warehouse.id === prevValues.warehouse) || {} as Warehouse;
  fields.selectedVendor.value.value = props.vendors.find(vendor => vendor.id === prevValues.vendor_id) || {} as Vendor;
  // fields.selectedStore.value.value = props.stores.find(store => store.id === prevValues.store_id) || {} as Gs;
  // fields.selectedStore.value.value = props.stores.find(store => store.id === prevValues.store_id) || {} as Gs;
  console.log('prev values updated successfullcy...i think', fields.selectedVendor.value.value.id, props.vendors.find(vendor => vendor.id === prevValues.vendor_id))
};
// console.log(props.prevValues)
// Initialize previous values if in edit mode
// if (props.mode === 'edit' && props.prevValues) {
//   setPreviousValues(props.prevValues);
// }


const states = ref<Gs[]>([]);
const countries = ref<Gs[]>([]);
const loading = ref(false);

type FieldKey = keyof typeof fields;
const labelFieldMap: Record<string, FieldKey> = {
  'Item Category': 'selectedItemCategory',
  // 'Item Type': 'selectedItemType',
  // 'Units': 'selectedUnit',
  // 'Taxes': 'selectedTax',
  'Brand': 'selectedBrand',
  // 'Dimension': 'selectedDimension',
  // 'Weight': 'selectedWeight',
  // 'Branch': 'selectedBranch',
  // 'Warehouse': 'selectedWarehouse',
  'Vendor': 'selectedVendor',
  // 'Unit': 'selectedUnit',
  // 'Store': 'selectedStore',
  // 'Tax': 'selectedTax' 
};

// const handleOptionSelected = (value: any, label: string) => {
//   switch (label) {
//     case 'Item Category':
//       selectedItemCategory.value.value = value; 
//       break;
//     case 'Item Type':
//       selectedItemType.value.value = value;
//       break;
//     case 'Units':
//       selectedUnit.value.value = value;
//       break;
//     case 'Taxes':
//       selectedTax.value.value = value;
//       break;
//     case 'Manufacturer':
//       selectedManufacturer.value.value = value;
//       break;
//     case 'Brand':
//       selectedBrand.value.value = value;
//       break;
//     case 'Dimension':
//       selectedDimension.value.value = value;
//       break;
//     case 'Weight':
//       selectedWeight.value.value = value;
//       break;
//     case 'Branch':
//       selectedBranch.value.value = value;
//       break;
//     case 'Warehouse':
//       selectedWarehouse.value.value = value;
//       break;
//     case 'Vendor':
//       selectedVendor.value.value = value;
//       break;
//     case 'Item Types':
//       selectedItemType.value.value = value;
//       break;
//     case 'Unit':
//       selectedUnit.value.value = value;
//       break;
//     case 'Tax':
//       selectedTax.value.value = value;
//       break;
//     default:
//       console.warn(`Unknown label: ${label}`);
//   }
// };
const handleOptionSelected = (value: any, label: string) => {
  const fieldKey = labelFieldMap[label];
  if (fieldKey) {
    fields[fieldKey].value.value = value;
  } else {
    console.warn(`Unknown label: ${label}`);
  }
};

// onMounted( () => {
//   console.log('console.log----->',fields.selectedItemCategory.value.value)
// })

// watch(
//   () => dialog,
//   (newPrevValues) => {
//     // console.log('console.log modal oopeeeeeend-////---->', props.mode)
//     if (props.mode === 'edit' && props.prevValues) {
//       setPreviousValues(props.prevValues);
//       // console.log('console.log modal oopeeeeeend inside if----->',props.prevValues)
//     }
//   },
//   { immediate: true, deep: true } 
// );
// watch(
//   () => fields.image_url.value.value, // Access the image URL correctly
//   (newImageUrl) => {
//     console.log("Image changed:", newImageUrl);
//     // Now you have the actual image URL, you can use it to display the image
//   },
//   { immediate: true }
// );

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-if="mode == 'create'" class="text-none font-weight-regular" color="success-darken-1" prepend-icon=""
          :text="`Add Item`" variant="tonal" v-bind="activatorProps"></v-btn>
        <v-btn v-if="props.mode == 'edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Item' : 'Create Item'">
        <v-card-text>
          <!--* form sample -->
          <form @submit.prevent="submit">
            <v-text-field v-model="fields.name.value.value" :counter="10"
              :error-messages="fields.name.errorMessage.value" label="Item Name" required></v-text-field>
            <VRow class="mxt-5 mb-5">
              <!-- <vCol cols="6">
                  <filterSelect :genericOptions="itemTypes" :label_cus="'Item Type'" @optionSelected="(item)=>handleOptionSelected(item,'Item Type')" :prevValue="props.mode === 'edit' ? fields.selectedItemType.value.value.id : null" :required="true"/>
                </vCol> -->
              <vCol cols="6">
                <filterSelect :genericOptions="itemCategories" :label_cus="'Item Category'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Item Category')"
                  :prevValue="props.mode === 'edit' ? fields.selectedItemCategory.value.value.id : null"
                  :required="true" />
              </vCol>
              <vCol cols="6">
                <filterSelect :genericOptions="brands" :label_cus="'Brand'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Brand')"
                  :prevValue="props.mode === 'edit' ? fields.selectedBrand.value.value.id : null" />
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
              <!-- <vCol cols="6" v-if="props.mode!=='edit'">
                  <v-text-field
                    v-model="fields.quantity.value.value"
                    :counter="10"
                    :error-messages="fields.quantity.errorMessage.value"
                    label="Quantity"
                    type="number"
                    required
                  ></v-text-field> -->
              <!-- <filterSelect :genericOptions="units" :label_cus="'Units'" @optionSelected="(item)=>handleOptionSelected(item,'Unit')" /> -->
              <!-- </vCol> -->
              <!-- <vCol cols="6">
                  <filterSelect :genericOptions="units" :label_cus="'Unit'" @optionSelected="(item)=>handleOptionSelected(item,'Unit')"  :prevValue="props.mode === 'edit' ? fields.selectedUnit.value.value.id : null"/>
                </vCol> -->


              <!-- <vCol cols="6" v-if="props.mode!=='edit'">
                  <!-- <v-text-field
                    v-model="fields.costPrice.value.value"
                    :error-messages="fields.costPrice.errorMessage.value"
                    label="Cost Price*"
                    required
                    type="number"
                  ></v-text-field> -->
              <!-- </vCol>  -->
              <!-- <vCol cols="6" v-if="props.mode!=='edit'">
                  <v-text-field
                    v-model="fields.sellingPrice.value.value"
                    :error-messages="fields.sellingPrice.errorMessage.value"
                    label="Selling Price*"
                    required
                    type="number"
                  ></v-text-field>
                </vCol> -->
              <!-- <vCol cols="6">
                  <filterSelect :genericOptions="taxes" :label_cus="'Tax'" @optionSelected="(item)=>handleOptionSelected(item,'Tax')"  :prevValue="props.mode === 'edit' ? fields.selectedTax.value.value.id : null"/>
                </vCol> -->

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
                  <filterSelect :genericOptions="dimensions" :label_cus="'Dimension'" @optionSelected="(item)=>handleOptionSelected(item,'Dimension')" :prevValue="props.mode === 'edit' ? fields.selectedDimension.value.value.id : null" />
                </vCol> -->
              <!-- <vCol cols="6">
                  <filterSelect :genericOptions="weights" :label_cus="'Weight'" @optionSelected="(item)=>handleOptionSelected(item,'Weight')" :prevValue="props.mode === 'edit' ? fields.selectedWeight.value.value.id : null" />
                </vCol> -->
              <!-- <vCol cols="6" v-if="props.mode !== 'edit'">
                <filterSelect :genericOptions="branch" :label_cus="'Branch'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Branch')" />
              </vCol> -->
              <!-- <vCol cols="6" v-if="props.mode!=='edit'">
                  <filterSelect :genericOptions="warehouses" :label_cus="'Warehouse'" @optionSelected="(item)=>handleOptionSelected(item,'Warehouse')" />
                </vCol> -->
              <vCol cols="6">
                <filterSelect :genericOptions="vendors" :label_cus="'Vendor'"
                  @optionSelected="(item) => handleOptionSelected(item, 'Vendor')"
                  :prevValue="props.mode === 'edit' ? fields.selectedVendor.value.value.id : null" />
              </vCol>
              <!-- <vCol cols="6" class="target">
                  <filterSelect :genericOptions="stores" :label_cus="'Store'" @optionSelected="(item)=>handleOptionSelected(item,'Store')" :prevValue="fields.selectedStore.value.value.id" />
                </vCol> -->
              <!-- <vCol cols="6" class="target">
                  <filterSelect 
                    :genericOptions="stores" 
                    :label_cus="'Store'" 
                    @optionSelected="(item) => handleOptionSelected(item, 'Store')" 
                    :prevValue="props.mode === 'edit' ? fields.selectedStore.value.value.id : null" 
                  />
                </vCol> -->
            </VRow>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn color="success-darken-1" type="submit" :text="props.mode === 'edit' ? 'Update Item' : 'Add Item'"
                variant="tonal" :loading="loading">
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
