<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { capitalize_cus } from '@/filters';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, InventoryItem, Store, TransferOrder } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';

interface TableItem extends TransferOrder {
  sourceName: string;
  destinationName: string;
  itemName: string;
  transferReasonName: string;
}

const search = ref('');
const currentPage = ref<number>(1);
const data = ref<TableItem[]>([]);
const filteredData = ref<TableItem[]>([]);
const branches = ref<Branch[]>([]);
const stores = ref<Store[]>([]); // Updated from warehouses to stores
const items = ref<InventoryItem[]>([]);
const transferReasons = ref<GenericSetUp[]>([]);
const storeNameMap = ref<Record<number, string>>({}); // Updated from warehouseNameMap
const itemNameMap = ref<Record<number, string>>({});
const transferReasonNameMap = ref<Record<number, string>>({});
const loading = ref(true);

const useAuth = useAuthStore();

const headers = [
    { title: 'S/N', key: 'sn' },
    { title: 'Transfer Order #', key: 'transfer_order_number' },
    { title: 'Transfer Reason', key: 'transferReasonName' },
    { title: 'Status', key: 'status' },
    { title: 'Transfer Quantity', key: 'transfer_quantity' },
    { title: 'Transfer Date', key: 'transfer_date' },
    { title: 'Source', key: 'sourceName' },
    { title: 'Destination', key: 'destinationName' },
    { title: 'Created By', key: 'created_by' },
    { title: 'Created Time', key: 'transfer_date' },
    { title: 'Last Modified By', key: 'last_modified_by' },
    { title: 'Last Modified Time', key: 'last_modified_time' },
    { title: '', key: 'actions', sortable: false }
];

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await makeApiCall<TransferOrder[]>('GET', '/transfer-orders');
    const branchResponse = await makeApiCall<Branch[]>('GET', '/branches');
    const storeResponse = await makeApiCall<Store[]>('GET', '/stores'); // Updated API endpoint if needed
    const itemResponse = await makeApiCall<InventoryItem[]>('GET', '/create-items');
    const transferReasonResponse = await makeApiCall<GenericSetUp[]>('GET','/reasons');
    
    branches.value = branchResponse.data;
    stores.value = storeResponse.data; // Updated from warehouses to stores
    items.value = itemResponse.data;
    transferReasons.value = transferReasonResponse.data;

    storeNameMap.value = stores.value.reduce((map, store) => {
      store.id ? map[store.id] = store.name : '';
      return map;
    }, {} as Record<number, string>);

    itemNameMap.value = items.value.reduce((map, item) => {
      item.id ? map[item.id] = item.name : '';
      return map;
    }, {} as Record<number, string>);
    
    transferReasonNameMap.value = transferReasons.value.reduce((map, reason) => {
      reason.id ? map[reason.id] = reason.name : '';
      return map;
    }, {} as Record<number, string>);
    
    data.value = response.data.map((order: TransferOrder, index: number) => ({
      sn: index + 1,
      ...order,
      sourceName: storeNameMap.value[order.source_id], // Updated from warehouseNameMap to storeNameMap
      destinationName: storeNameMap.value[order.destination_id], // Updated from warehouseNameMap to storeNameMap
      itemName: itemNameMap.value[order.item_id],
      transferReasonName: transferReasonNameMap.value[order.transfer_reason],
    }));
    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const handleFilter = (item?: any, type: 'source'|'destination'|'item'|'search'|""="") => {
  const searchTerm = search.value.toLowerCase();
  switch(type) {
    case 'source':
      return filteredData.value = data.value.filter(item_ => item_.source_id === item.id);
    case 'destination':
      return filteredData.value = data.value.filter(item_ => item_.destination_id === item.id);
    case 'item':
      return filteredData.value = data.value.filter(item_ => item_.item_id === item.id);
    case 'search':
      return filteredData.value = data.value.filter(item_ => 
        item_.transfer_order_number.toLowerCase().includes(searchTerm)
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
    <Create :mode="'create'" @transferOrderCreated="handleUpdated" 
      :branches="branches"
      :stores="stores" 
      :items="items"
      :transferReasons="transferReasons"
    />
  </VRow>
  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Transfer Orders
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
      <VRow>
        <VCol>
            <!-- Updated to reflect stores -->
            <filterSelect :genericOptions="stores" :label_cus="'Source'" @optionSelected="(item)=>handleFilter(item, 'source')" />
        </VCol>
        <VCol>
          <!-- Updated to reflect stores -->
          <filterSelect :genericOptions="stores" :label_cus="'Destination'" @optionSelected="(item)=>handleFilter(item, 'destination')" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="items" :label_cus="'Item'" @optionSelected="(item)=>handleFilter(item, 'item')" />
        </VCol>
      </VRow>
    </VCard>

    <v-divider></v-divider>

    <v-data-table v-model:search="search" v-model:page="currentPage" :items="filteredData" :headers="headers" v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.transfer_date="{ item }">
        {{ new Date(item.transfer_date * 1000).toLocaleString()}}
      </template>
      <template v-slot:item.transfer_order_number="{ item }">
         {{item.transfer_order_number ?? 'N/A'}}
      </template>
      <template v-slot:item.last_modified_time="{ item }">
          N/A
      </template>
      <template v-slot:item.created_time="{ item }">
          N/A
      </template>
      <template v-slot:item.created_by="{ item }">
        {{ capitalize_cus(useAuth.getUserDetails.user.name) }}
      </template>
      <template v-slot:item.last_modified_by="{ item }">
        {{ capitalize_cus(useAuth.getUserDetails.user.name) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @transferOrderCreated="handleUpdated"
            :branches="branches"
            :stores="stores" 
            :items="items"
            :transferReasons="transferReasons"
            :transferOrder="item"
          />
          <DeleteBtn :api="`transfer-orders/${item.id}`" :item_name="'Transfer Order'" @deleted="handleUpdated"/>
        </VRow>
      </template>
    </v-data-table>
    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>

