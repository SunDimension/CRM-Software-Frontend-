<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ref, onMounted } from 'vue';
import Create from './create.vue';
import Edit from './edit.vue';
// import DeleteBtn from '@/components/DeleteBtn.vue';
import { ApprovalProcessModule, ApprovalStage, ApprovalProcessFlow } from '@/types/globalTypes';

const data = ref<TableItem[]>([]);
const approvalStages = ref<ApprovalStage[]>([]);
const approvalModules = ref<ApprovalProcessModule[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;

    const approvalStagesResponse = await makeApiCall<ApprovalStage[]>('GET', '/approval-stages');
    const approvalModulesResponse = await makeApiCall<ApprovalProcessModule[]>('GET', '/approval-process-modules');
    const approvalProcessFlowResponse = await makeApiCall<ApprovalProcessFlow[]>('GET', '/approval-process-flows');

    approvalStages.value = approvalStagesResponse.data;
    approvalModules.value = approvalModulesResponse.data;

    const stageMap = approvalStages.value.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {} as Record<string, string>);

    const moduleMap = approvalModules.value.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {} as Record<string, string>);

    data.value = approvalProcessFlowResponse.data.map((item: ApprovalProcessFlow) => ({
      ...item,
      approval_stage_name: stageMap[item.approval_stage_id],
      process_module_name: moduleMap[item.process_module_id],
      status: item.status_id == 1 ? 'Active' : 'Inactive',
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
      <VCard title="Approval Process Flow">
        <v-row justify="end" cols="12" md="6">
          <Create :approvalModules="approvalModules" :approvalStages="approvalStages" @created="handleUpdated"/>
        </v-row>
        <VTable
          fixed-header
          loading
          loading-text="Loading... Please wait"
        >
          <thead>
            <tr>
              <th class="text-uppercase">S/N</th>
              <th class="text-uppercase">Module</th>
              <th class="text-uppercase text-center">Stage</th>
              <th class="text-uppercase text-center">Sequence</th>
              <th class="text-uppercase text-center">Status</th>
              <th class="text-uppercase text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="9" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr v-if="data && !loading" v-for="item, index in data" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.process_module_name }}</td>
              <td class="text-center">{{ item.approval_stage_name }}</td>
              <td class="text-center">{{ item.sequence_no }}</td>
              <td class="text-center">{{ item.status }}</td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <Edit :item="item" :approvalModules="approvalModules" :approvalStages="approvalStages" @updated="handleUpdated"/>
                  <DeleteBtn :api="`approval-process-flows/${item.id}`" @deleted="handleUpdated"/>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="6">No Available Data</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
