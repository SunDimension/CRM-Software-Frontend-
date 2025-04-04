<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, Vendor, } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<Vendor[]>([]);
const filteredData = ref<Vendor[]>([]);
const titles = ref<GenericSetUp[]>([]);
const designations = ref<GenericSetUp[]>([]);
const vendorTypes = ref<GenericSetUp[]>([]);
const serviceTypes = ref<GenericSetUp[]>([]);
const banks = ref<GenericSetUp[]>([]);
const bankNameMap = ref<Record<number, string>>({});
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Vendor Name', key: 'name' },
  { title: 'Title', key: 'title' },
  { title: 'Designation', key: 'designation' },
  { title: 'Phone Number', key: 'contact_phone_number' },
  { title: 'Email', key: 'contact_email' },
  { title: 'TIN', key: 'tin' },
  { title: 'Bank', key: 'bank' },
  { title: 'Account Number', key: 'account_number' },
  { title: 'Account Name', key: 'account_name' },
  { title: '', key: 'actions', sortable: false }
]);

const fetchData = async () => {
  try {
    loading.value = true;
    const vendorResponse = await makeApiCall<Vendor[]>('GET', '/vendors');
    const titleResponse = 
    await makeApiCall<GenericSetUp[]>('GET', '/titles');
    const designationResponse = await makeApiCall<GenericSetUp[]>('GET', '/designations');
    const vendorTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/vendor-types');
    const serviceTypeResponse = await makeApiCall<GenericSetUp[]>('GET', '/service-types');
    const bankResponse = await makeApiCall<GenericSetUp[]>('GET', '/banks');

    // Assign the API data to ref variables
    titles.value = titleResponse.data;
    designations.value = designationResponse.data;
    vendorTypes.value = vendorTypeResponse.data;
    serviceTypes.value = serviceTypeResponse.data;
    banks.value = bankResponse.data;

    bankNameMap.value = banks.value.reduce((map, bank) => {
      if (bank.id) map[bank.id] = bank.name;
      return map;
    }, {} as Record<number, string>);

    // Process vendor data
    data.value = vendorResponse.data.map((vendor: Vendor, index: number) => ({
      sn: index + 1,
      ...vendor,
      bankName: bankNameMap.value[vendor.bank ?? 0] ?? 'N/A',
    }));

    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  filteredData.value = data.value.filter((vendor) => {
    return vendor.name.toLowerCase().includes(search.value.toLowerCase());
  });
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @vendorCreated="handleUpdated"
      :titles="titles"
      :designations="designations"
      :vendorTypes="vendorTypes"
      :serviceTypes="serviceTypes"
      :banks="banks"
    />
  </VRow>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
      Vendors
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

      <template v-slot:item.title="{ item }">
        {{ titles.find(t => t.id === item.title)?.name ?? 'N/A' }}
      </template>

      <template v-slot:item.designation="{ item }">
        {{ designations.find(d => d.id === item.designation)?.name ?? 'N/A' }}
      </template>

     <template v-slot:item.bank="{ item }">
  {{ bankNameMap[item.bank] ?? 'N/A' }}
</template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @vendorCreated="handleUpdated"
            :titles="titles"
            :designations="designations"
            :vendorTypes="vendorTypes"
            :serviceTypes="serviceTypes"
            :banks="banks"
            :vendor="item"
          />
          <DeleteBtn :api="`/vendors/${item.id}`" :item_name="'Vendor'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
