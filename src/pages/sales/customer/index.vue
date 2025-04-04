<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Customer, GenericSetUp } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { VRow } from 'vuetify/lib/components/index.mjs';
import CreateCustomer from './createCustomer.vue';
import EditCustomer from './editCustomer.vue';



interface TableItem  extends Customer {
  customerTypeName: string;
  titleName: string;
}


const data = ref<TableItem[]>([]);
const customer_types = ref<GenericSetUp[]>([]);
const customerTypeNameMap = ref<Record<number, string>>({});
const titleNameMap = ref<Record<number, string>>({});
const titles = ref<GenericSetUp[]>([]);
const loading = ref(true)

const fetchData = async () => {
  try {
    loading.value = true
    const response =  await makeApiCall<Customer[]>('GET', '/customers');
    const customer_typeResponse  = await makeApiCall<GenericSetUp[]>('GET', '/customer-types');
    const titleResponse   = await makeApiCall<GenericSetUp[]>('GET', '/titles');
    customer_types.value = customer_typeResponse.data;
    titles.value = titleResponse.data;
    titleNameMap.value = titles.value.reduce((map, title) => {
     title.id? map[title.id] = title.name:'';
      return map;
    }, {} as Record<number, string>);
    customerTypeNameMap.value = customer_types.value.reduce((map, customer_type) => {
      customer_type.id? map[customer_type.id] = customer_type.name: '';
      return map;
    }, {} as Record<number, string>);
    // console.log('data from caalll',response)
    data.value = response.data.map((item: Customer) => ({
      ...item,
      customerTypeName: customerTypeNameMap.value[item.customer_type_id], // Add stateName field
      titleName: titleNameMap.value[item.title_id], // Add stateName field
    }));
    // console.log(countryNameMap.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }finally {
    loading.value = false
  }

};

const handleCustomerCreated = () => {
  fetchData();
};

onMounted(fetchData);

</script>

<template>
  <VRow>

    <VCol cols="12">
      <VCard title="Customer">

        <v-row justify="end" cols="12" md="6"><CreateCustomer :titles="titles" :customer_types="customer_types" @customerCreated="handleCustomerCreated"/></v-row>
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
                Surname
              </th>
              <th class="text-uppercase">
                Firstname
              </th>
              <th class="text-uppercase">
                Middlename
              </th>
              <th class="text-uppercase">
                Fullname
              </th>
              <th class="text-uppercase text-center">
                Address
              </th>
              <th class="text-uppercase text-center">
                Phone
              </th>
              <th class="text-uppercase text-center">
                Customer Type
              </th>
              <th class="text-uppercase text-center">
                Title
              </th>
              <th class="text-uppercase text-center">
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- <tr v-if="!loading" class="loading">Loading...</tr> -->
            <tr v-if="loading" class="loading" style="block-size: 300px;">
              <td colspan="9" class="text-center">
                <v-progress-circular indeterminate size="180" />
              </td>
            </tr>

            <tr
              v-if="data && !loading"
              v-for="customer, index in data"
              :key="customer.id"
            >
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ customer.surname }}
              </td>
              <td>
                {{ customer.firstname }}
              </td>
              <td>
                {{ customer.middlename }}
              </td>
              <td>
                {{ customer.fullname }}
              </td>
              <td class="text-center">
                {{ customer.address }}
              </td>
            
              <td class="text-center">
                {{ customer.phone_number }}
              </td>
              <td class="text-center">
                {{ customer.customerTypeName }}
              </td>
              <td class="text-center">
                {{ customer.titleName }}
              </td>
              <td class="text-center">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                  <EditCustomer :customers="customer" :titles="titles" :customer_types="customer_types" @CustomerCreated="handleCustomerCreated"/>
                  <DeleteBtn :api="`customer/${customer.id}`" @onDeleted="handleCustomerCreated"/>
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
