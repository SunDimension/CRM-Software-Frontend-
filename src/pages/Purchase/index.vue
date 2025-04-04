<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Vendor, GenericSetUp } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import Create from './createVendor.vue';
import Edit from './editVendor.vue';
import DeleteBtn from './deleteBtn.vue';



interface TableItem  extends Vendor {
 vendor_typeName: string;
 bankName: string;
}


const data = ref<TableItem[]>([]);
const vendor_types = ref<GenericSetUp[]>([]);
const vendor_typeNameMap = ref<Record<number, string>>({});
const bankNameMap = ref<Record<number, string>>({});
const banks = ref<GenericSetUp[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true
    const response =  await makeApiCall<Vendor[]>('GET', '/vendors');
    const vendor_typeResponse  = await makeApiCall<GenericSetUp[]>('GET', '/vendor-types');
    const bankResponse   = await makeApiCall<GenericSetUp[]>('GET', '/banks');
   vendor_types.value = vendor_typeResponse.data;
    banks.value = bankResponse.data;

    bankNameMap.value = banks.value.reduce((map, bank) => {
      bank.id? map[bank.id] = bank.name:'';
      return map;
    }, {} as Record<number, string>);

    vendor_typeNameMap.value = vendor_types.value.reduce((map, vendor_type) => {
      vendor_type.id? map[vendor_type.id] = vendor_type.name:'';
      return map;
    }, {} as Record<number, string>);
    // console.log('data from caalll',response)

      data.value = response.data.map((item: Vendor): TableItem => ({
  ...item,
  vendor_typeName: item.vendor_type_id !== undefined ? vendor_typeNameMap.value[item.vendor_type_id] || '' : '',
  bankName: item.bank_id !== undefined ? bankNameMap.value[item.bank_id] || '' : '',
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
      <VCard title="Vendors">

        <v-row justify="end" cols="12" md="6"><Create :vendors="vendors" @created="handleUpdated"/></v-row>
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
                Contact Fullname
              </th>
              <th class="text-uppercase text-center">
                Phone
              </th>
              <th class="text-uppercase text-center">
                Email
              </th>
              <th class="text-uppercase text-center">
                Vendor Type
              </th>
              <th class="text-uppercase text-center">
                Bank
              </th>
              <th class="text-uppercase text-center">
                Account Number
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
              v-for="vendor, index in data"
              :key="vendor.id"
  
            >
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ vendor.name }}
              </td>
              <td class="text-center">
                {{ vendor.address }}
              </td>
              <td class="text-center">
                {{ vendor.contact_fullname }}
              </td>
              <td class="text-center">
                {{ vendor.phone_number }}
              </td>
              <td class="text-center">
                {{ vendor.email }}
              </td>
              <td class="text-center">
                {{ vendor.Vendor_typeName }}
              </td>
              <td class="text-center">
                {{ vendor.bankName }}
              </td>
              <td class="text-center">
                {{ vendor.account_number }}
              </td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <EditVendor :vendor="vendor" :banks="banks" :vendor_types="vendor_types" @vendorCreated="handleVendorCreated"/>
                  <DeleteBtn :api="`vendors/${vendor.id}`" @deleted="handleVendorCreated"/>
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
