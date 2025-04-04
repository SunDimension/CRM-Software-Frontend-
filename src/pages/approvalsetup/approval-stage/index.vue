<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalStage, ApprovalProcessType } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow, VCol, VCard, VTable, VProgressCircular, VIcon } from 'vuetify/lib/components/index.mjs';
import Create from './create.vue';
import Edit from './edit.vue';

interface TableItem extends ApprovalStage {
  process_type: string;
}

const data = ref<TableItem[]>([]);
const processTypes = ref<ApprovalProcessType[]>([]);
const processTypeMap = ref<Record<string, string>>({});
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await makeApiCall<ApprovalStage[]>('GET', '/approval-stages');
    const dataResponse = await makeApiCall<ApprovalProcessType[]>('GET', '/approval-process-types');
    
    processTypes.value = dataResponse.data;
    processTypeMap.value = processTypes.value.reduce((map, item) => {
      item.id ? (map[item.id] = item.name) : '';
      return map;
    }, {} as Record<string, string>);

    data.value = response.data.map((item: ApprovalStage) => ({
      ...item,
      process_type: processTypeMap.value[item.process_type_id],
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);

</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Approval Stages">
        <v-row justify="end" cols="12" md="6">
          <Create :processTypes="processTypes" @created="handleUpdated" />
        </v-row>
        <VTable fixed-header :loading="loading" loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">S/N</th>
              <th class="text-uppercase">Name</th>
              <th class="text-uppercase text-center">Process Type</th>
              <th class="text-uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="4" class="text-center">
                <VProgressCircular indeterminate size="180" />
              </td>
            </tr>
            <tr v-if="data && !loading" v-for="(item, index) in data" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td class="text-center">{{ item.process_type }}</td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap: nowrap">
                  <Edit :item="item" :processTypes="processTypes" @updated="handleUpdated" />
                  <DeleteBtn :api="`/approval-stages/${item.id}`" @deleted="handleUpdated" />
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="4">No Available Data</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
