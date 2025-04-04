<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Account, AccountGroup, AccountSubtype, AccountType } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import Create from './create.vue';
import Edit from './edit.vue';



interface TableItem  extends Account {
  account_group: string;
  account_type: string;
  account_subtype: string;
}


const data = ref<TableItem[]>([]);
const accountgroups = ref<AccountGroup[]>([]);
const account_types = ref<AccountType[]>([]);
const account_subtypes = ref<AccountSubtype[]>([]);
const accountgroupMap = ref<Record<string, string>>({});
const accountTypeMap = ref<Record<string, string>>({});
const accountSubMap = ref<Record<string, string>>({});
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true
    const response =  await makeApiCall<Account[]>('GET', '/accounts');
    const dataAG  = await makeApiCall<AccountGroup[]>('GET', '/account-groups');
    const dataAT = await makeApiCall<AccountType[]>('GET', '/account-types');
    const dataAST  = await makeApiCall<AccountSubtype[]>('GET', '/account-subtypes');
    accountgroups.value = dataAG.data;
    account_types.value = dataAT.data;
    account_subtypes.value = dataAST.data;
    accountgroupMap.value = accountgroups.value.reduce((map, item) => {
      item.id? map[item.id] = item.name:'';
      return map;
    }, {} as Record<string, string>);
    accountTypeMap.value = account_types.value.reduce((map, item) => {
      item.id? map[item.id] = item.name:'';
      return map;
    }, {} as Record<string, string>);
    accountSubMap.value = account_subtypes.value.reduce((map, item) => {
      item.id? map[item.id] = item.name:'';
      return map;
    }, {} as Record<string, string>);
    // console.log('data from caalll',response)
    data.value = response.data.map((item: Account) => ({
      ...item,
      account_group: accountgroupMap.value[item.account_group_id],
      account_type: accountTypeMap.value[item.account_type_id],
      account_subtype: accountSubMap.value[item.account_subtype_id],
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
      <VCard title="Accounts">

        <v-row justify="end" cols="12" md="6"><Create :accountgroups="accountgroups" :account_types="account_types" :account_subtypes="account_subtypes" @created="handleUpdated"/></v-row>
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
                Code
              </th>
              <th class="text-uppercase text-center">
               Account Group
              </th>
              <th class="text-uppercase text-center">
                Account Type
              </th><th class="text-uppercase text-center">
                Account Sub Type
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
              v-for="item, index in data"
              :key="item.id"
  
            >
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ item.name }}
              </td>
              <td class="text-center">
                {{ item.code }}
              </td>
              <td class="text-center">
                {{ item.account_group }}
              </td>
              <td class="text-center">
                {{ item.account_type }}
              </td>
              <td class="text-center">
                {{ item.account_subtype }}
              </td>
              
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <Edit :item="item" :accountgroups="accountgroups" :account_types="account_types" :account_subtypes="account_subtypes" @updated="handleUpdated"/>
                  <DeleteBtn :api="`accounts/${item.id}`" @deleted="handleUpdated"/>
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
