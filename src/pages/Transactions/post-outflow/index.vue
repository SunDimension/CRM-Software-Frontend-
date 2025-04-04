<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Customer, EnhancedPostOutflow, GenericSetUp, PostOutflow } from '@/types/globalTypes'; // Adjust the import path as needed
import { onMounted, ref, } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<EnhancedPostOutflow[]>([]); // Use the new interface
const filteredData = ref<EnhancedPostOutflow[]>([]);
const banks = ref<GenericSetUp[]>([]);
const outflowModes = ref<GenericSetUp[]>([]);
const customers = ref<Customer[]>([]);
const bankNameMap = ref<Record<number, string>>({});
const customerNameMap = ref<Record<number, string>>({});
const outflowModeMap = ref<Record<number, string>>({});
const loading = ref(true);

// Headers for the v-data-table
const headers = [
  { title: 'S/N', key: 'sn' },
  { title: 'Customer', key: 'customer_id' },
  { title: 'Bank', key: 'bank' },
  { title: 'Account Number', key: 'account_number' },
  { title: 'Outflow Amount', key: 'amount' },
  { title: 'Outflow Mode', key: 'outflow_mode' },
  { title: 'Outflow Date', key: 'outflow_date' },
  { title: 'Narration', key: 'narration' },
  { title: '', key: 'actions', sortable: false }
];

const fetchData = async () => {
  try {
    loading.value = true;
    const inflowResponse = await makeApiCall<PostOutflow[]>('GET', '/post-outflows'); // Adjust API endpoint
    const bankResponse = await makeApiCall<GenericSetUp[]>('GET', '/banks');
    const customerResponse = await makeApiCall<Customer[]>('GET', '/customers');
    const outflowModeResponse = await makeApiCall<GenericSetUp[]>('GET', '/outflow-modes');

    // Assign the API data to ref variables
    banks.value = bankResponse.data;
    customers.value = customerResponse.data;
    outflowModes.value = outflowModeResponse.data;

    // Create maps for easy lookup
    bankNameMap.value = banks.value.reduce((map, bank) => {
      if (bank.id) map[bank.id] = bank.name;
      return map;
    }, {} as Record<number, string>);

    customerNameMap.value = customers.value.reduce((map, customer) => {
      if (customer.id) map[customer.id] = customer.name;
      return map;
    }, {} as Record<number, string>);
    outflowModeMap.value = outflowModes.value.reduce((map, mode) => {
      if (mode.id) map[mode.id] = mode.name;
      return map;
    }, {} as Record<number, string>);

    // Process inflow data
    data.value = inflowResponse.data.map((inflow: PostOutflow, index: number) => ({
      sn: index + 1,
      ...inflow,
      bankName: bankNameMap.value[inflow.org_bank ?? 0] ?? 'N/A',
      outflowModeName: outflowModeMap.value[inflow.outflow_mode ?? 0] ?? 'N/A',
    }));

    // handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// const handleFilter = () => {
//   filteredData.value = data.value.filter((inflow) => {
//     return inflow.beneficiary.toLowerCase().includes(search.value.toLowerCase());
//   });
// };

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @inflowCreated="handleUpdated" :banks="banks" :outflowModes="outflowModes"
      :customers="customers" />
  </VRow>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
      Outflow Transactions
      <v-spacer></v-spacer>
      <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" flat hide-details single-line></v-text-field>
    </v-card-title>

    <v-data-table :headers="headers" :items="filteredData" v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.sn="{ item }">
        {{ item.sn }}
      </template>

      <template v-slot:item.customer="{ item }">
        {{ item.customerName ?? 'N/A' }}
      </template>

      <template v-slot:item.bank="{ item }">
        {{ item.bankName }}
      </template>

      <template v-slot:item.account_number="{ item }">
        {{ item.account_number ?? 'N/A' }}
      </template>

      <template v-slot:item.amount="{ item }">
        {{ item.amount ?? 'N/A' }}
      </template>

      <template v-slot:item.outflow_mode="{ item }">
        {{ item.outflowModeName }}
      </template>

      <template v-slot:item.outflow_date="{ item }">
        {{ item.outflow_date ? new Date(item.outflow_date).toLocaleDateString() : 'N/A' }}
      </template>

      <template v-slot:item.narration="{ item }">
        {{ item.narration ?? 'N/A' }}
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @inflowUpdated="handleUpdated" :banks="banks" :outflowModes="outflowModes" :inflow="item"
            :customers="customers" />
          <DeleteBtn :api="`/inflows/${item.id}`" :item_name="'Inflow'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
