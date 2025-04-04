<script setup lang="ts">
import { capitalize_cus } from '@/filters';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp } from '@/types/globalTypes';
import { onMounted, ref, watch } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import Create from './create.vue';

const props = defineProps<{
  item_name: string;
  api_route: string;
}>();

// console.log(props.item_name);

const data = ref<GenericSetUp[]>([]);
const loading = ref(true);
const item_name = ref('');
const api_route = ref('/');

item_name.value = props.item_name;
api_route.value = '/' + props.api_route;

const fetchData = async () => {
  try {
    loading.value = true
    const response = await makeApiCall<GenericSetUp[]>('GET', api_route.value);//!replace
    // console.log('data from caalll',response)
    data.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false
  }
};

const handleCreated = () => {
  console.log("Refetching data...");
  fetchData();
};


onMounted(fetchData);
watch(() => props.api_route, (newRoute) => {
  item_name.value = props.item_name;
  api_route.value = '/' + props.api_route;
  fetchData();

});

</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- <VCard :title="$filters.capitalize_cus(item_name)"> -->
      <VCard :title="capitalize_cus(item_name)">
        <v-row justify="end" cols="12" md="6">
          <Create mode="create" :item_name="capitalize_cus(item_name)" :api_route="api_route"
            @created="handleCreated" />
        </v-row>
        <VTable fixed-header loading loading-text="Loading... Please wait">
          <thead>
            <tr>
              <th class="text-uppercase">
                S/N
              </th>
              <th class="text-uppercase">
                Name
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <!-- <tr v-if="!loading" class="loading">Loading...</tr> -->
            <tr v-if="loading" class="loading" style="block-size: 18.75rem;">
              <td colspan="9" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr v-if="data && !loading" v-for="item, index in data" :key="item.id">
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ item.name }}
              </td>
              <td>
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <Create mode="edit" :item_obj="item" :item_name="capitalize_cus(item_name)"
                    :api_route="api_route + '/' + item.id" @created="handleCreated" />
                  <!-- <Edit :item="item" @Created="handleCreated"/> -->
                  <DeleteBtn :api="`${api_route}/${item.id}`" @deleted="handleCreated" />
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
