<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalProcessModule } from '@/types/globalTypes';
import { ref, onMounted } from 'vue';
import { VRow, VCol, VCard, VTable, VBtn, VProgressCircular, VIcon, VDialog, VCardActions, VCardText, VTextField } from 'vuetify/components';
import Create from './create.vue';
import Edit from './edit.vue';

const data = ref<ApprovalProcessModule[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await makeApiCall<ApprovalProcessModule[]>('GET', '/approval-process-modules');
    data.value = response.data;
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
      <VCard title="Approval Process Modules">
        <v-row justify="end" cols="12" md="6">
          <Create @created="handleUpdated" />
        </v-row>

        <VTable
          fixed-header
          loading
          loading-text="Loading... Please wait"
        >
          <thead>
            <tr>
              <th class="text-uppercase">S/N</th>
              <th class="text-uppercase">Name</th>
              <th class="text-uppercase text-center">Max Approval Count</th>
              <th class="text-uppercase text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading" class="loading">
              <td colspan="4" class="text-center">
                <VProgressCircular indeterminate size="180" />
              </td>
            </tr>

            <tr v-if="data && !loading" v-for="(item, index) in data" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td class="text-center">{{ item.max_approval_count }}</td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap: nowrap">
                  <Edit :item="item" @updated="handleUpdated" />
                  <DeleteBtn :api="`/approval-process-modules/${item.id}`" @deleted="handleUpdated" />
                </VRow>
              </td>
            </tr>

            <tr v-if="!loading && (!data || data.length === 0)">
              <td colspan="4" style="text-align: center;">No Available Data</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
