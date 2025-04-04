<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { capitalize_cus } from '@/filters';
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { Branch, GenericSetUp, InventoryItem, Store, Warehouse, InventoryAdjustment } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';// Assuming `edit.vue` exists

interface TableItem extends InventoryAdjustment {
  branchName: string;
  storeName: string;
  warehouseName: string; // Added warehouseName
  itemName: string;
  adjustmentReasonName: string;
}

const currentPage = ref<number>(1);
const data = ref<TableItem[]>([]);
const filteredData = ref<TableItem[]>([]);
const branches = ref<Branch[]>([]);
const stores = ref<Store[]>([]);
const warehouses = ref<Warehouse[]>([]); // Added warehouses
const items = ref<InventoryItem[]>([]);
const adjustmentReasons = ref<GenericSetUp[]>([]);
const branchNameMap = ref<Record<number, string>>({});
const storeNameMap = ref<Record<number, string>>({});
const warehouseNameMap = ref<Record<number, string>>({}); // Added warehouseNameMap
const itemNameMap = ref<Record<number, string>>({});
const adjustmentReasonNameMap = ref<Record<number, string>>({});
const loading = ref(true);

const useAuth = useAuthStore();

const headers = [
    { title: 'S/N', key: 'sn' },
    { title: 'Adjustment #', key: 'id' },
    { title: 'Adjustment Reason', key: 'adjustmentReasonName' },
    { title: 'Status', key: 'status' },
    { title: 'Adjustment Quantity', key: 'quantity' },
    { title: 'Adjustment Date', key: 'date' },
    { title: 'Branch', key: 'branchName' },
    { title: 'Store', key: 'storeName' },
    { title: 'Warehouse', key: 'warehouseName' }, // Added warehouse column
    { title: 'Item', key: 'itemName' },
    { title: 'Created By', key: 'created_by' },
    { title: 'Created Time', key: 'created_time' },
    { title: 'Last Modified By', key: 'last_modified_by' },
    { title: 'Last Modified Time', key: 'last_modified_time' },
    { title: '', key: 'actions', sortable: false }
];

const fetchData = async () => {
  try {
    loading.value = true;
    const [response, branchResponse, storeResponse, warehouseResponse, itemResponse, adjustmentReasonResponse] = await Promise.all([
      makeApiCall<InventoryAdjustment[]>('GET', '/inventory-adjustments'),
      makeApiCall<Branch[]>('GET', '/branches'),
      makeApiCall<Store[]>('GET', '/stores'),
      makeApiCall<Warehouse[]>('GET', '/warehouses'), // Added warehouses API endpoint
      makeApiCall<InventoryItem[]>('GET', '/create-items'),
      makeApiCall<GenericSetUp[]>('GET', '/reasons')
    ]);

    branches.value = branchResponse.data;
    stores.value = storeResponse.data;
    warehouses.value = warehouseResponse.data; // Handle warehouses response
    items.value = itemResponse.data;
    adjustmentReasons.value = adjustmentReasonResponse.data;

    branchNameMap.value = branches.value.reduce((map, branch) => {
      if (branch.id) map[branch.id] = branch.name;
      return map;
    }, {} as Record<number, string>);

    storeNameMap.value = stores.value.reduce((map, store) => {
      if (store.id) map[store.id] = store.name;
      return map;
    }, {} as Record<number, string>);

    warehouseNameMap.value = warehouses.value.reduce((map, warehouse) => { // Map warehouses
      if (warehouse.id) map[warehouse.id] = warehouse.name;
      return map;
    }, {} as Record<number, string>);

    itemNameMap.value = items.value.reduce((map, item) => {
      if (item.id) map[item.id] = item.name;
      return map;
    }, {} as Record<number, string>);

    adjustmentReasonNameMap.value = adjustmentReasons.value.reduce((map, reason) => {
      if (reason.id) map[reason.id] = reason.name;
      return map;
    }, {} as Record<number, string>);

    data.value = response.data.map((adjustment: InventoryAdjustment, index: number) => ({
      sn: index + 1,
      ...adjustment,
      branchName: branchNameMap.value[adjustment.branch_id],
      storeName: storeNameMap.value[adjustment.store_id],
      warehouseName: warehouseNameMap.value[adjustment.warehouse_id], // Map warehouse names
      itemName: itemNameMap.value[adjustment.item_id],
      adjustmentReasonName: adjustmentReasonNameMap.value[adjustment.reason_id],
    }));
    filteredData.value = data.value; // Initialize filtered data
  } catch (error) {
    console.error('Error fetching data:', error);
    // Optional: Show user-friendly error message here
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const handleUpdated = () => {
  fetchData();
};
</script>



<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @inventoryAdjustmentCreated="handleUpdated" 
      :branches="branches"
      :stores="stores" 
      :warehouses="warehouses" 
      :items="items"
      :adjustmentReasons="adjustmentReasons"
    />
  </VRow>
  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Inventory Adjustments
        <v-spacer></v-spacer>
        <!-- Removed search field -->
      </v-card-title>
      <VRow>
        <VCol>
            <!-- Updated to reflect branches -->
            <filterSelect :genericOptions="branches" :label_cus="'Branch'" />
        </VCol>
        <VCol>
          <!-- Updated to reflect stores -->
          <filterSelect :genericOptions="stores" :label_cus="'Store'" />
        </VCol>
        <VCol>
          <!-- Added warehouse filter -->
          <filterSelect :genericOptions="warehouses" :label_cus="'Warehouse'" />
        </VCol>
        <VCol>
          <filterSelect :genericOptions="items" :label_cus="'Item'" />
        </VCol>
      </VRow>
    </VCard>

    <v-divider></v-divider>

    <v-data-table v-model:page="currentPage" :items="filteredData" :headers="headers" v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.date="{ item }">
        {{ new Date(item.date).toLocaleString()}}
      </template>
      <template v-slot:item.id="{ item }">
         {{item.id ?? 'N/A'}}
      </template>
      <template v-slot:item.created_time="{ item }">
          N/A
      </template>
      <template v-slot:item.last_modified_time="{ item }">
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
          <Edit :mode="'edit'" @inventoryAdjustmentCreated="handleUpdated"
            :branches="branches"
            :stores="stores" 
            :warehouses="warehouses" 
            :items="items"
            :adjustmentReasons="adjustmentReasons"
            :inventoryAdjustment="item"
          />
          <DeleteBtn :api="`inventory-adjustments/${item.id}`" :item_name="'Inventory Adjustment'" @deleted="handleUpdated"/>
        </VRow>
      </template>
    </v-data-table>
    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>


