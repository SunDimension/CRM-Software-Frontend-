<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ref, onMounted } from 'vue';
import Create from './create.vue';
import Edit from './edit.vue';
// import DeleteBtn from '@/components/DeleteBtn.vue';
import { ApprovalType } from '@/types/globalTypes';

const data = ref<ApprovalType[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;

    const approvalTypesResponse = await makeApiCall<ApprovalType[]>('GET', '/approval-types');
    data.value = approvalTypesResponse.data.map((item, index) => ({
      ...item,
      sn: index + 1,
    //   status: item.status_id === 1 ? 'Active' : 'Inactive',
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
      <VCard title="Approval Types">
        <v-row justify="end" cols="12" md="6">
          <Create @created="handleUpdated"/>
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
              <th class="text-uppercase text-center">Description</th>
              <!-- <th class="text-uppercase text-center">Status</th> -->
              <th class="text-uppercase text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="5" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr v-if="data && !loading" v-for="item in data" :key="item.id">
              <td>{{ item.sn }}</td>
              <td>{{ item.name }}</td>
              <td class="text-center">{{ item.description }}</td>
              <!-- <td class="text-center">{{ item.status }}</td> -->
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <Edit :item="item" @updated="handleUpdated"/>
                  <DeleteBtn :api="`approval-types/${item.id}`" @deleted="handleUpdated"/>
                </VRow>
              </td>
            </tr>
            <tr v-if="!loading && (!data || data.length === 0)">
              <td style="text-align: center;" colspan="5">No Available Data</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
