<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Branch, Warehouse,  } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import Create from './createWarehouse.vue';
import Edit from './editWarehouse.vue';



interface TableItem  extends Warehouse {
  branchName: string;
}


const data = ref<TableItem[]>([]);
const branches = ref<Branch[]>([]);
const branchNameMap = ref<Record<number, string>>({});
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true
    const response =  await makeApiCall<Warehouse[]>('GET', '/warehouses');
    const branchResponse  = await makeApiCall<Branch[]>('GET', '/branches');
    branches.value = branchResponse.data;
    branchNameMap.value = branches.value.reduce((map, branch) => {
      branch.id? map[branch.id] = branch.name:'';
      return map;
    }, {} as Record<number, string>);
    // console.log('data from caalll',response)
    data.value = response.data.map((item: Warehouse) => ({
      ...item,
      branchName: branchNameMap.value[item.branch_id],
    }));
    // console.log(countryNameMap.valsue);
  } catch (error) {
    console.error('Error fetching data:', error);
  }finally {
    loading.value = false
  }

};

const handleUpdated = () => {
  // console.log('updated------>');
  fetchData();
};

onMounted(fetchData);

</script>

<template>
  <VRow>

    <VCol cols="12">
      <VCard title="Warehouses">

        <v-row justify="end" cols="12" md="6"><Create :branches="branches" @created="handleUpdated"/></v-row>
        <VTable
          fixed-header
          loading
          loading-text="Loading... Please wait"
          
        >

          <thead>
            <tr>
              <th class="text-uppercase">
                S/N
              </th>
              <th class="text-uppercase">
                Name
              </th>
              <th class="text-uppercase text-center">
                Address
              </th>
              <th class="text-uppercase text-center">
                Zipcode
              </th>
              <th class="text-uppercase text-center">
                Branch
              </th>
              <th class="text-uppercase text-center">
                Contact Person
              </th>
              <th class="text-uppercase text-center">
                Email
              </th>
              <th class="text-uppercase text-center">
                Phone
              </th>
              <th class="text-uppercase text-center">
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- <tr v-if="!loading" class="loading">Loading...</tr> -->
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="9" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr
              v-if="data && !loading"
              v-for="warehouse, index in data"
              :key="warehouse.id"
  
            >
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ warehouse.name }}
              </td>
              <td class="text-center">
                {{ warehouse.warehouse_address }}
              </td>
              <td class="text-center">
                {{ warehouse.zipcode }}
              </td>
              <td class="text-center">
                {{ warehouse.branchName }}
              </td>
              <td class="text-center">
                {{ warehouse.contact_person }}
              </td>
              <td class="text-center">
                {{ warehouse.email }}
              </td>
              <td class="text-center">
                {{ warehouse.phone }}
              </td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <Edit :warehouse="warehouse" :branches="branches" @updated="handleUpdated"/>
                  <DeleteBtn :api="`branches/${warehouse.id}`" @deleted="handleUpdated"/>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="3">No Availble Data</td>
            </tr>
          </tbody>
        </VTable>
        
      </VCard>
    </VCol>
  </VRow>
</template>
