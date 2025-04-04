<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { GenericSetUp } from '@/types/globalTypes'; // Adjust as necessary
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Define the PostInflow interface
interface PostInflow {
  id?: number;
  bank_id: number;
  amount: number;
  narration?: string;
  inflow_status?: number;
  inflow_date: Date;
}

// Extend the PostInflow with additional properties for the UI
interface TableItem extends PostInflow {
  bankName: string;
  inflowStatusName: string;
}

const search = ref('');
const currentPage = ref<number>(1);
const data = ref<TableItem[]>([]);
const filteredData = ref<TableItem[]>([]);
const banks = ref<GenericSetUp[]>([]); // List of banks as GenericSetUp
const inflowStatuses = ref<GenericSetUp[]>([]); // List of inflow statuses as GenericSetUp
const loading = ref(true);

const useAuth = useAuthStore();

// Table headers configuration
const headers = [
  { title: 'S/N', key: 'sn' },
  { title: 'Inflow Amount', key: 'amount' },
  { title: 'Narration', key: 'narration' },
  { title: 'Status', key: 'inflowStatusName' },
  { title: 'Inflow Date', key: 'inflow_date' },
  { title: 'Bank', key: 'bankName' },
  { title: 'Created By', key: 'created_by' },
  { title: 'Created Time', key: 'created_at' },
  { title: 'Last Modified By', key: 'last_modified_by' },
  { title: 'Last Modified Time', key: 'updated_at' },
  { title: '', key: 'actions', sortable: false }
];

// Function to fetch inflow data, banks, and inflow statuses from the API
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await makeApiCall<PostInflow[]>('GET', '/post-inflows');
    const bankResponse = await makeApiCall<GenericSetUp[]>('GET', '/banks'); // Fetch banks
    const inflowStatusResponse = await makeApiCall<GenericSetUp[]>('GET', '/inflow-statuses'); // Fetch inflow statuses

    banks.value = bankResponse.data; // Store banks for dropdown
    inflowStatuses.value = inflowStatusResponse.data; // Store inflow statuses for dropdown

    data.value = response.data.map((inflow: PostInflow, index: number) => ({
      sn: index + 1,
      ...inflow,
      bankName: getGenericNameById(banks.value, inflow.bank_id), // Get bank name
      inflowStatusName: inflow.inflow_status !== undefined
        ? getGenericNameById(inflowStatuses.value, inflow.inflow_status) // Get inflow status name if defined
        : 'Unknown Status', // Default value if inflow_status is undefined
    }));
    handleFilter(); // Apply initial filters
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};


// Function to get the name of a generic item by its ID
const getGenericNameById = (items: GenericSetUp[], id: number) => {
  const item = items.find(item => item.id === id);
  return item ? item.name : 'Unknown';
};

// Fetch data when the component is mounted
onMounted(fetchData);

// Function to handle filtering of data
const handleFilter = (item?: any, type: 'bank' | 'search' | "" = "") => {
  const searchTerm = search.value.toLowerCase();
  switch (type) {
    case 'bank':
      filteredData.value = data.value.filter(item_ => item_.bank_id === item.id);
      break;
    case 'search':
      filteredData.value = data.value.filter(item_ =>
        item_.narration?.toLowerCase().includes(searchTerm)
      );
      break;
    default:
      filteredData.value = data.value; // Reset filter
  }
};

// Function to refresh data after an update
const handleUpdated = () => {
  fetchData();
};
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @inflowCreated="handleUpdated" :banks="banks" :inflowStatuses="inflowStatuses" />
  </VRow>
  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Inflows Transaction
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>
      <VRow>
        <VCol>
          <filterSelect :genericOptions="banks" :label_cus="'Bank'"
            @optionSelected="(item) => handleFilter(item, 'bank')" />
        </VCol>
      </VRow>
    </VCard>

    <v-divider></v-divider>

    <v-data-table v-model:search="search" v-model:page="currentPage" :items="filteredData" :headers="headers"
      v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.inflow_date="{ item }">
        {{ new Date(item.inflow_date).toLocaleDateString() }} <!-- Format date as needed -->
      </template>
      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @inflowUpdated="handleUpdated" :inflow="item" :banks="banks"
            :inflowStatuses="inflowStatuses" />
          <DeleteBtn :api="`inflows/${item.id}`" :item_name="'Inflow'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>
    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
