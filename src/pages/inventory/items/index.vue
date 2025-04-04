<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import {  GenericSetUp, InventoryItem, Vendor } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import Create from './add-item.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<InventoryItem[]>([]);
const filteredData = ref<InventoryItem[]>([]);
const itemCategories = ref<GenericSetUp[]>([]);
const brands = ref<GenericSetUp[]>([]);
const vendors = ref<Vendor[]>([]);
// const branches = ref<Branch[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Item Name', key: 'name' },
  { title: 'Batch Number', key: 'batch_number' },
  { title: 'Item Category', key: 'item_category' },
  // { title: 'Branch', key: 'branch_name' },
  { title: '', key: 'actions', sortable: false },
]);

const fetchData = async () => {
  try {
    loading.value = true;

    // Fetch data from the API
    const [itemsResponse, categoriesResponse, brandsResponse, vendorsResponse, ] = await Promise.all([
      makeApiCall<InventoryItem[]>('GET', '/create-items'),
      makeApiCall<GenericSetUp[]>('GET', '/item-categories'),
      makeApiCall<GenericSetUp[]>('GET', '/brands'),
      makeApiCall<Vendor[]>('GET', '/vendors'),
      // makeApiCall<Branch[]>('GET', '/branches'),
    ]);

    // Assign API data to ref variables
    itemCategories.value = categoriesResponse.data;
    brands.value = brandsResponse.data;
    vendors.value = vendorsResponse.data;
    // branches.value = branchesResponse.data;

    // Process inventory data
    data.value = itemsResponse.data.map((item: InventoryItem, index: number) => ({
      sn: index + 1,
      ...item,
    }));

    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
    // Consider adding user feedback for error
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  filteredData.value = data.value.filter((item) => {
    return item.name?.toLowerCase().includes(search.value.toLowerCase());
  });
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create
      :mode="'create'"
      @itemCreated="handleUpdated"
      :itemCategories="itemCategories"
      :brands="brands"
      :vendors="vendors"
      
    />
  </VRow>

  <v-card flat>
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
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="filteredData"
      v-if="filteredData && !loading"
      sticky-header
    >
      <template v-slot:item.sn="{ index }">
        {{ index + 1 }}
      </template>

      <template v-slot:item.name="{ item }">
        {{ item.name ?? 'N/A' }}
      </template>

      <template v-slot:item.batch_number="{ item }">
        {{ item.batch_number ?? 'N/A' }}
      </template>

      <template v-slot:item.item_category="{ item }">
        {{ itemCategories.find(cat => cat.id === item.item_category_id)?.name ?? 'N/A' }}
      </template>

    <!-- <template v-slot:item.branch="{ item }">
        {{ branches.find(bc => bc.id === item.branch_id)?.name ?? 'N/A' }}
    </template>  -->

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <!-- <Edit
            :mode="'edit'"
            @itemUpdated="handleUpdated"
            :prevValues="{ ...item }"
            :itemCategories="itemCategories"
            :brands="brands"
            :vendors="vendors"
            :branches="branches"
          /> -->
          <DeleteBtn :api="`/create-items/${item.id}`" :item_name="'Inventory Item'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
