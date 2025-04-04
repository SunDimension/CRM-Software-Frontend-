<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import CreateBranch from './createBranch.vue';
import EditBranch from './editBranch.vue';

interface TableItem  extends Branch {
  stateName: string;
  countryName: string;
  regionName: string;
}

const data = ref<TableItem[]>([]);
const states = ref<GenericSetUp[]>([]);
const stateNameMap = ref<Record<number, string>>({});
const countryNameMap = ref<Record<number, string>>({});
const regionNameMap = ref<Record<number, string>>({});
const countries = ref<GenericSetUp[]>([]);
const regions = ref<GenericSetUp[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await makeApiCall<Branch[]>('GET', '/branches');
    const stateResponse = await makeApiCall<GenericSetUp[]>('GET', '/states');
    const countryResponse = await makeApiCall<GenericSetUp[]>('GET', '/countries');
    const regionResponse = await makeApiCall<GenericSetUp[]>('GET', '/regions');

    states.value = stateResponse.data;
    countries.value = countryResponse.data;
    regions.value = regionResponse.data;

    countryNameMap.value = countries.value.reduce((map, country) => {
      if (country.id) map[country.id] = country.name;
      return map;
    }, {} as Record<number, string>);

    stateNameMap.value = states.value.reduce((map, state) => {
      if (state.id) map[state.id] = state.name;
      return map;
    }, {} as Record<number, string>);

    regionNameMap.value = regions.value.reduce((map, region) => {
      if (region.id) map[region.id] = region.name;
      return map;
    }, {} as Record<number, string>);

    data.value = response.data.map((item: Branch) => ({
      ...item,
      stateName: stateNameMap.value[item.state_id],
      countryName: countryNameMap.value[item.country_id],
      regionName: regionNameMap.value[item.region_id],
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleBranchCreated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Branches">
        <v-row justify="end" cols="12" md="6">
          <CreateBranch :countries="countries" :states="states" :regions="regions" @branchCreated="handleBranchCreated"/>
        </v-row>
        <VTable fixed-header loading loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">S/N</th>
              <th class="text-uppercase">Name</th>
              <th class="text-uppercase text-center">Address</th>
              <th class="text-uppercase text-center">Contact Person</th>
              <th class="text-uppercase text-center">Email</th>
              <th class="text-uppercase text-center">Phone</th>
              <th class="text-uppercase text-center">State</th>
              <th class="text-uppercase text-center">Country</th>
              <th class="text-uppercase text-center">Region</th>
              <th class="text-uppercase text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 300px;">
              <td colspan="10" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>
            <tr v-if="data && !loading" v-for="branch, index in data" :key="branch.id">
              <td>{{ index + 1 }}</td>
              <td>{{ branch.name }}</td>
              <td class="text-center">{{ branch.address }}</td>
              <td class="text-center">{{ branch.contact_person }}</td>
              <td class="text-center">{{ branch.email }}</td>
              <td class="text-center">{{ branch.phone }}</td>
              <td class="text-center">{{ branch.stateName }}</td>
              <td class="text-center">{{ branch.countryName }}</td>
              <td class="text-center">{{ branch.regionName }}</td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <EditBranch :branch="branch" :countries="countries" :states="states":regions="regions" @branchCreated="handleBranchCreated"/>
                  <DeleteBtn :api="`branches/${branch.id}`" @deleted="handleBranchCreated"/>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="10">No Available Data</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
