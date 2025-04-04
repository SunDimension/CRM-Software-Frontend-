<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp as Gs, InventoryItem, Store, StoreItem, User } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '@/store/auth';

// Define Props
const props = defineProps<{
  branches: Branch[];
  user: User[];
  itemCategories: Gs[];
  mode: 'create' | 'edit';
  storeItem?: StoreItem; // Optional for edit mode
}>();

const useAuth = useAuthStore();
const user = computed<User>(() => useAuth.getUserDetails?.user);
const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null;
const branch = ref<Branch>({ id: parsedUser.branch_id, name: parsedUser.branch });

const dialog = ref(false);
const apiError = ref<string | null>(null);
const loading = ref(false);
const emits = defineEmits(['storeItemCreated']);

// Vee-Validate Form and Fields
const { handleSubmit, resetForm } = useForm();

const costPrice = useField<number>('cost_price');
const sellingPrice = useField<number>('selling_price');
const reorderLevel = useField<number>('reorder_level');
const quantity = useField<number>('quantity');
const discount = useField<number>('discount');

const selectedStore = ref<Store | null>(null);
const selectedBranch = ref<Branch | null>(null);
const selectedItemCategory = ref<Gs | null>(null);
const selectedItem = ref<InventoryItem | null>(null);

const stores = ref<Store[]>([]); // Dynamically fetched stores
const products = ref<InventoryItem[]>([]); // Dynamically fetched items

// Fetch Stores Function
const fetchStores = async () => {
  try {
    const response = await makeApiCall<Store[]>('GET', `/my-stores/${parsedUser.branch_id}`);
    stores.value = response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
  }
};

// Fetch Products Function
const fetchProducts = async () => {
  try {
    const response = await makeApiCall<InventoryItem[]>('GET', '/create-items');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Load Data for Edit Mode
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.storeItem) {
    const item = props.storeItem;

    costPrice.value.value = item.cost_price;
    sellingPrice.value.value = item.selling_price;
    reorderLevel.value.value = item.reorder_level;
    quantity.value.value = item.quantity;
    discount.value.value = item.discount ?? 0;

    selectedStore.value = stores.value.find((store) => store.id === item.store_id) ?? null;
    selectedBranch.value = props.branches.find((branch) => branch.id === item.branch_id) ?? null;
    selectedItemCategory.value = props.itemCategories.find((cat) => cat.id === item.item_category_id) ?? null;
    selectedItem.value = products.value.find((it) => it.id === item.create_item_id) ?? null;
  }
};

// Watch for Changes in StoreItem Prop
watch(() => props.storeItem, loadDataForEdit, { immediate: true });

// Load Stores and Products on Component Mount
onMounted(() => {
  fetchStores();
  fetchProducts();
});

// Handle Option Selection
const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Store') {
    selectedStore.value = value;
  } else if (label === 'Item Category') {
    selectedItemCategory.value = value;
  } else if (label === 'Item') {
    selectedItem.value = value;
  } else if (label === 'Branch') {
    selectedBranch.value = value;
  }
};

// Submit Form
const submit = handleSubmit(async (values) => {
  loading.value = true;
  apiError.value = null;
  console.log('Form Data:', values);

  const formData: StoreItem = {
    id: props.storeItem?.id,
    cost_price: values.cost_price,
    selling_price: values.selling_price,
    reorder_level: values.reorder_level,
    quantity: values.quantity,
    quantity_holding: values.quantity_holding,
    discount: values.discount,
    store_id: selectedStore.value?.id ?? 0,
    branch_id: selectedBranch.value?.id ?? 0,
    item_category_id: selectedItemCategory.value?.id ?? 0,
    create_item_id: selectedItem.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/store-items/${props.storeItem?.id}` : `/store-items`;

  try {
    await makeApiCall<StoreItem>(apiMethod, apiUrl, formData);
    emits('storeItemCreated');
    dialog.value = false;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      apiError.value = axiosError.response?.data?.message || "An unexpected error occurred.";
    } else {
      apiError.value = "An unexpected error occurred.";
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-if="mode === 'create'" class="text-none font-weight-regular" color="success-darken-1"
          text="Create Store Item" variant="tonal" v-bind="activatorProps" />
        <v-btn v-if="mode === 'edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Store Item' : 'Create Store Item'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="stores" :label_cus="'Store*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Store')" v-model="selectedStore" />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="branches" :label_cus="'Branch*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Branch')" v-model="selectedBranch" />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="itemCategories" :label_cus="'Item Category*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Item Category')"
                    v-model="selectedItemCategory" />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="products" :label_cus="'Item*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Item')" v-model="selectedItem" />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="costPrice.value.value" label="Cost Price" type="number" required />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="sellingPrice.value.value" label="Selling Price" type="number" required />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="reorderLevel.value.value" label="Reorder Level" type="number" required />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="quantity.value.value" label="Quantity" type="number" required />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="discount.value.value" label="Discount (%)" type="number" />
                </v-col>
              </v-row>
            </v-container>

            <div v-if="apiError" class="text-error">{{ apiError }}</div>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text="Close" variant="plain" @click="dialog = false" />
              <v-btn color="success-darken-1" type="submit"
                :text="mode === 'edit' ? 'Update Store Item' : 'Create Store Item'" variant="tonal" :loading="loading"
                :disabled="loading">
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
