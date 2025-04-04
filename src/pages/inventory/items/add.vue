<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { InventoryItem, GenericSetUp as Gs, Vendor } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props for options and mode
const props = defineProps<{
  itemcategories: Gs[];
  brands: Gs[];
//   customerTypes: Gs[];
  vendors: Vendor[];
  mode: 'create' | 'edit';
  item?: InventoryItem; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['itemCreated']);

// Form setup with VeeValidate
const { handleSubmit, resetForm } = useForm();

// Define fields
const name = useField<string>('name');
const batchNumber = useField<string>('batchNumber');
const selectedCategory = ref<Gs | null>(null);
const selectedBrand = ref<Gs | null>(null);
const selectedVendor = ref<Vendor | null>(null);

const loading = ref(false);

// Load data if in edit mode
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.item) {
    const item = props.item;

    // Set field values
    name.value.value = item.name;
    batchNumber.value.value = item.batch_number ?? '';

    // Set category, brand, and vendor
    selectedCategory.value = props.itemcategories.find(c => c.id === item.item_category_id) ?? null;
    selectedBrand.value = props.brands.find(b => b.id === item.brand_id) ?? null;
    selectedVendor.value = props.vendors.find(v => v.id === item.vendor_id) ?? null;
  }
};

// Watch for changes in props to load data if necessary
watch(() => props.item, loadDataForEdit, { immediate: true });

// Handle selected option for dropdowns
const handleOptionSelected = (value: any, label: string)  => {
  if (label === 'Category') {
    selectedCategory.value = value;
  } else if (label === 'Brand') {
    selectedBrand.value = value;
  } else if (label === 'Vendor') {
    selectedVendor.value = value;
  }
};

// Form submission logic
const submit = handleSubmit(async (values) => {
  loading.value = true;
  apiError.value = null;

  // Prepare form data
  const formData: InventoryItem = {
    name: values.name,
    batch_number: values.batchNumber,
    item_category_id: selectedCategory.value?.id ?? 0,
    brand_id: selectedBrand.value?.id ?? 0,
    vendor_id: selectedVendor.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/inventory/${props.item?.id}` : `/inventory`;

  try {
    await makeApiCall<InventoryItem>(apiMethod, apiUrl, formData);
    emits('itemCreated');
    dialog.value = false;
  } catch (error: unknown) {
    apiError.value = "An unexpected error occurred.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          color="success-darken-1"
          :text="'Create Item'"
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
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="name.value.value"
                    label="Item Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="batchNumber.value.value"
                    label="Batch Number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="itemcategories"
                    :label_cus="'Category*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Category')"
                    v-model="selectedCategory"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="brands"
                    :label_cus="'Brand*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Brand')"
                    v-model="selectedBrand"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="vendors"
                    :label_cus="'Vendor*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Vendor')"
                    v-model="selectedVendor"
                  />
                </v-col>
              </v-row>
            </v-container>

            <!-- Display error message if any -->
            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                :text="mode === 'edit' ? 'Update Item' : 'Create Item'"
                variant="tonal"
                :loading="loading"
                :disabled="loading"
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
