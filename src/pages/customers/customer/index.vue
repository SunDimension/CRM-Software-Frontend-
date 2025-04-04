<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Branch, Customer, GenericSetUp } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<Customer[]>([]);
const filteredData = ref<Customer[]>([]);
const titles = ref<GenericSetUp[]>([]);
const customerTypes = ref<GenericSetUp[]>([]);
const branches = ref<Branch[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Full Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Phone Number', key: 'phone_number' },
  { title: 'Customer Type', key: 'customer_type' },
  { title: 'Branch', key: 'branch' },
  { title: '', key: 'actions', sortable: false }
]);

const fetchData = async () => {
  try {
    loading.value = true;
    const customerResponse = await makeApiCall<Customer[]>('GET', '/customers');
    const titleResponse = await makeApiCall<GenericSetUp[]>('GET', '/titles');
    const customerTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/customer-types');
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches');
    // Assign the API data to ref variables
    titles.value = titleResponse.data;
    customerTypes.value = customerTypeResponse.data;
    branches.value = branchResponse.data;

    // Process customer data
    data.value = customerResponse.data.map((customer: Customer, index: number) => ({
      sn: index + 1,
      ...customer,
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
  filteredData.value = data.value.filter((customer) => {
    return customer.name.toLowerCase().includes(search.value.toLowerCase());
  });
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @customerCreated="handleUpdated"
      :titles="titles"
      :branches = "branches"
      :customerTypes="customerTypes"
    />
  </VRow>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
      Customers
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



      <template v-slot:item.address="{ item }">
        {{ item.address ?? 'N/A' }}
      </template>

      <template v-slot:item.phone_number="{ item }">
        {{ item.phone_number ?? 'N/A' }}
      </template>

      <template v-slot:item.branch="{ item }">
        {{ branches.find(bc => bc.id === item.branch_id)?.name ?? 'N/A' }}
      </template>

      <template v-slot:item.customer_type="{ item }">
        {{ customerTypes.find(ct => ct.id === item.customer_type_id)?.name ?? 'N/A' }}
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @customerCreated="handleUpdated"
            :titles="titles"
            :customerTypes="customerTypes"
            :branches = "branches"
            :customer="item"
          />
          <DeleteBtn :api="`/customers/${item.id}`" :item_name="'Customer'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
