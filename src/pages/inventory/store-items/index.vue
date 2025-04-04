<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, InventoryItem, Store, StoreItem } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Reactive Variables
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<StoreItem[]>([]);
const filteredData = ref<StoreItem[]>([]);
const stores = ref<Store[]>([]);
const branches = ref<Branch[]>([]);
const items = ref<InventoryItem[]>([]);
const itemCategories = ref<GenericSetUp[]>([]);
const storeNameMap = ref<Record<number, string>>({});
const branchNameMap = ref<Record<number, string>>({});
const itemCategoryNameMap = ref<Record<number, string>>({});
const itemNameMap = ref<Record<number, string>>({});
const loading = ref(true);

// Authentication Store
const useAuth = useAuthStore();

// Table Headers
const headers = [
  { title: 'S/N', key: 'sn' },
  { title: 'Item Name', key: 'create_item_name' },
  { title: 'Category', key: 'item_category_name' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Holding Quantity', key: 'quantity_holding' },
  { title: 'Store', key: 'store_name' },
  { title: 'Cost Price', key: 'cost_price' },
  { title: 'Selling Price', key: 'selling_price' },
  { title: '', key: 'actions', sortable: false }
];
const formatToNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);

// Fetch Data Function
const fetchData = async () => {
  try {
    loading.value = true;
    const [response, storeResponse, branchResponse, itemResponse, categoryResponse] = await Promise.all([
      makeApiCall<StoreItem[]>('GET', '/store-items'),
      makeApiCall<Store[]>('GET', '/stores'),
      makeApiCall<Branch[]>('GET', '/branches'),
      makeApiCall<InventoryItem[]>('GET', '/create-items'),
      makeApiCall<GenericSetUp[]>('GET', '/item-categories')
    ]);

    // Populate Data Maps
    stores.value = storeResponse.data;
    branches.value = branchResponse.data;
    items.value = itemResponse.data;
    itemCategories.value = categoryResponse.data;

    storeNameMap.value = stores.value.reduce((map, store) => {
      if (store.id) map[store.id] = store.name;
      return map;
    }, {} as Record<number, string>);

    branchNameMap.value = branches.value.reduce((map, branch) => {
      if (branch.id) map[branch.id] = branch.name;
      return map;
    }, {} as Record<number, string>);

    itemNameMap.value = items.value.reduce((map, item) => {
      if (item.id) map[item.id] = item.name;
      return map;
    }, {} as Record<number, string>);

    itemCategoryNameMap.value = itemCategories.value.reduce((map, category) => {
      if (category.id) map[category.id] = category.name;
      return map;
    }, {} as Record<number, string>);

    // Process Data
    data.value = response.data.map((item: StoreItem, index: number) => ({
      sn: index + 1,
      ...item,
      store_name: storeNameMap.value[item.store_id],
      item_category_name: itemCategoryNameMap.value[item.item_category_id],
      create_item_name: itemNameMap.value[item.create_item_id],
      // user_name: capitalize_cus(useAuth.getUserDetails.user.name),
      //   cost_price: formatToNaira(item.cost_price),     // Format cost_price
      //   selling_price: formatToNaira(item.selling_price)

    }));

    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Filter Data Function
const handleFilter = (item?: any, type: 'store' | 'category' | 'item' | 'search' | "" = "") => {
  const searchTerm = search.value.toLowerCase();
  switch (type) {
    case 'store':
      filteredData.value = data.value.filter((i) => i.store_id === item.id);
      break;

    case 'category':
      filteredData.value = data.value.filter((i) => i.item_category_id === item.id);
      break;
    case 'item':
      filteredData.value = data.value.filter((i) => i.create_item_id === item.id);
      break;
    default:
      filteredData.value = data.value;
  }
};

// Refresh Data on Update
const handleUpdated = () => {
  fetchData();
};

// Component Lifecycle Hook
onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @storeItemCreated="handleUpdated" :stores="stores" :items="items"
      :itemCategories="itemCategories" :branches="branches" />
  </VRow>

  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Store Items
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>

      <VRow>
        <VCol>
          <filterSelect :genericOptions="stores" :label_cus="'Store'"
            @optionSelected="(item) => handleFilter(item, 'store')" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="itemCategories" :label_cus="'Category'"
            @optionSelected="(item) => handleFilter(item, 'category')" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="items" :label_cus="'Item'"
            @optionSelected="(item) => handleFilter(item, 'item')" />
        </VCol>
      </VRow>
    </VCard>

    <v-divider></v-divider>

    <v-data-table v-model:search="search" v-model:page="currentPage" :items="filteredData" :headers="headers"
      v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
           <!-- <Edit :mode="'edit'" @storeItemCreated="handleUpdated" :stores="stores" :items="items"
            :itemCategories="itemCategories" :branches="branches" :storeItem="item" /> -->
          <DeleteBtn :api="`store-items/${item.id}`" :item_name="'Store Item'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
