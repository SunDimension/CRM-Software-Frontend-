<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp, Store } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<Store[]>([]);
const filteredData = ref<Store[]>([]);
const storeTypes = ref<GenericSetUp[]>([]);
const branches = ref<Branch[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Store Name', key: 'name' },
  { title: 'Branch', key: 'branch' },
  { title: 'Store Type', key: 'store_type' },
  { title: '', key: 'actions', sortable: false }
]);

const fetchData = async () => {
  try {
    loading.value = true;
    const storeResponse = await makeApiCall<Store[]>('GET', '/stores');
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches');
    const storeTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/store-types');

    // Assign the API data to ref variables
    branches.value = branchResponse.data;
    storeTypes.value = storeTypeResponse.data;

    // Process store data
    data.value = storeResponse.data.map((store: Store, index: number) => ({
      sn: index + 1,
      ...store,
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
  filteredData.value = data.value.filter((store) => {
    return store.name.toLowerCase().includes(search.value.toLowerCase());
  });
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @storeCreated="handleUpdated"
      :branches="branches"
      :storeTypes="storeTypes"
    />
  </VRow>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
      Stores
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

      <template v-slot:item.branch="{ item }">
        {{ branches.find(branch => branch.id === item.branch_id)?.name ?? 'N/A' }}
      </template>

      <template v-slot:item.store_type="{ item }">
        {{ storeTypes.find(st => st.id === item.store_type_id)?.name ?? 'N/A' }}
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @storeCreated="handleUpdated"
            :branches="branches"
            :storeTypes="storeTypes"
            :store="item"
          />
          <DeleteBtn :api="`/stores/${item.id}`" :item_name="'Store'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
