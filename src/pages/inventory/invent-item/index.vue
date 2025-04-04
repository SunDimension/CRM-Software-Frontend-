<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { capitalize_cus } from '@/filters';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, InventoryItem, Store, Vendor, Warehouse } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

const search = ref('');
const currentPage = ref<number>(1);
const data = ref<InventoryItem[]>([]);
const filteredData = ref<InventoryItem[]>([]);
const branches = ref<Branch[]>([]);
const stores = ref<Store[]>([]);
const warehouses = ref<Warehouse[]>([]);
const vendors = ref<Vendor[]>([]);
const units = ref<GenericSetUp[]>([]);
const dimensions = ref<GenericSetUp[]>([]);
const brands = ref<GenericSetUp[]>([]);  
const taxes = ref<GenericSetUp[]>([]); 
const weights = ref<GenericSetUp[]>([]); 
const itemTypes = ref<GenericSetUp[]>([]); 
const items = ref<InventoryItem[]>([]);
const itemCategories = ref<GenericSetUp[]>([]); // Item categories
const loading = ref(true);

const useAuth = useAuthStore();

const headers = [
  { title: 'S/N', key: 'sn' },
  { title: 'Item Name', key: 'name' },
  { title: 'Category', key: 'item_category_id' },
  { title: 'Store', key: 'store_id' },
  { title: 'Branch', key: 'branch_id' },
  { title: 'Cost Price', key: 'cost_price' },
  { title: 'Selling Price', key: 'selling_price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const fetchData = async () => {
  try {
    loading.value = true;

    // Fetch inventory items, branches, stores, and item categories
    const [itemResponse, branchResponse, storeResponse, itemCategoryResponse] = await Promise.all([
      makeApiCall<InventoryItem[]>('GET', '/create-items'),
      makeApiCall<Branch[]>('GET', '/branches'),
      makeApiCall<Store[]>('GET', '/stores'),
      makeApiCall<GenericSetUp[]>('GET', '/item-categories'),
      makeApiCall<GenericSetUp[]>('GET', '/item-types'),
      makeApiCall<GenericSetUp[]>('GET', '/units'),
      makeApiCall<GenericSetUp[]>('GET', '/dimensions'),
      makeApiCall<GenericSetUp[]>('GET', '/weights'),
      makeApiCall<GenericSetUp[]>('GET', '/brands'),
      makeApiCall<GenericSetUp[]>('GET', '/taxes'),
      makeApiCall<Vendor[]>('GET', '/vendors'),
      makeApiCall<Warehouse[]>('GET', '/warehouses')
    ]);

    items.value = itemResponse.data;
    branches.value = branchResponse.data;
    stores.value = storeResponse.data;
    itemCategories.value = itemCategoryResponse.data;

    data.value = items.value;
    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const handleFilter = (item?: any, type: 'branch' | 'store' | 'itemCategory' | 'search' | "" = "") => {
  const searchTerm = search.value.toLowerCase();
  
  switch (type) {
    case 'branch':
      return filteredData.value = data.value.filter(i => i.branch_id === item.id);
    case 'store':
      return filteredData.value = data.value.filter(i => i.store_id === item.id);
    case 'itemCategory':
      return filteredData.value = data.value.filter(i => i.item_category_id === item.id);
    case 'search':
      return filteredData.value = data.value.filter(i =>
        i.name.toLowerCase().includes(searchTerm)
       
      );
    default:
      return filteredData.value = data.value;
  }
};

const handleUpdated = () => {
  fetchData();
};
</script>
<template>
 <VRow class="mb-4">
    <Create 
      mode="create" 
      @inventoryItemCreated="handleUpdated" 
      :itemCategories="itemCategories" 
      :itemTypes="itemTypes" 
      :units="units" 
      :brands="brands" 
      :dimensions="dimensions" 
      :taxes="taxes" 
      :warehouses="warehouses" 
      :weights="weights" 
      :branches="branches" 
      :stores="stores" 
      :vendors="vendors" 
    />
  </VRow>
  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Inventory Items
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          density="compact"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
          @input="handleFilter('', 'search')"
        ></v-text-field>
      </v-card-title>
      <VRow>
        <VCol>
          <filterSelect :genericOptions="branches" :label_cus="'Branch'" @optionSelected="(item) => handleFilter(item, 'branch')" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="stores" :label_cus="'Store'" @optionSelected="(item) => handleFilter(item, 'store')" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="itemCategories" :label_cus="'Item Category'" @optionSelected="(item) => handleFilter(item, 'itemCategory')" />
        </VCol>
      </VRow>
    </VCard>

    <v-divider></v-divider>

    <v-data-table v-model:search="search" v-model:page="currentPage" :items="filteredData" :headers="headers" v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.sn="{ item, index }">
        {{ index + 1 }}
      </template>
      <template v-slot:item.item_category_id="{ item }">
        {{ itemCategories.find(cat => cat.id === item.item_category_id)?.name ?? 'N/A' }}
      </template>
      <template v-slot:item.branch_id="{ item }">
        {{ branches.find(branch => branch.id === item.branch_id)?.name ?? 'N/A' }}
      </template>
      <template v-slot:item.store_id="{ item }">
        {{ stores.find(store => store.id === item.store_id)?.name ?? 'N/A' }}
      </template>
      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @inventoryItemUpdated="handleUpdated"
           :itemCategories="itemCategories" 
      :itemTypes="itemTypes" 
      :units="units" 
      :brands="brands" 
      :dimensions="dimensions" 
      :taxes="taxes" 
      :warehouses="warehouses" 
      :weights="weights" 
      :branches="branches" 
      :stores="stores" 
      :vendors="vendors" 
            :inventoryItem="item"
          />
          <DeleteBtn :api="`inventory-items/${item.id}`" :item_name="'Inventory Item'" @deleted="handleUpdated"/>
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
