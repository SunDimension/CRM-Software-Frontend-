<script setup lang="ts">
import selectCustom from '@/components/forms/selectCustom.vue';
import { makeApiCall } from '@/services/apiService';
import { Customer, GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { defineEmits, ref } from 'vue';

// Define props
const props = defineProps<{
  customer_types: GenericSetUp[];
  titles: GenericSetUp[];
  customers: Customer
}>();
const dialog = ref(false);
const emits = defineEmits(['customerCreated']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    },
    contact_person (value :string) {
      if (value?.length >= 2) return true

      return "Contact Person's Name needs to be at least 2 characters."
    },
    phone (value :string) {
      if (value?.length > 9 && /[0-9-]+/.test(value)) return true
      return 'Phone number needs to be at least 9 digits.'
    },
    email (value :string) {
      if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true
      return 'Must be a valid e-mail.'
    },

  },
})

const surname = useField('surname');
const firstname = useField('firstname');
const middlename = useField('middlename');
const fullname = useField('fullname');
const address = useField('address');
const phone_number = useField('phone_number');
const email = useField('email');
const customer_type_id = useField<number>('customer_type_id');
const title_id = useField<number>('title_id');


surname.value.value = props.customers.surname;
firstname.value.value = props.customers.firstname;
middlename.value.value = props.customers.middlename;
fullname.value.value = props.customers.fullname;
address.value.value = props.customers.address;
phone_number.value.value = props.customers.phone_number;
customer_type_id.value.value = props.customers.customer_type_id;
title_id.value.value = props.customers.title_id;


// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  const selectedCustomerType = Number(customer_type_id.value) ;//forced the type number to appease the typescript gods
  const selectedTitle = Number(title_id.value);
  // console.log(selectedState, selectedCountry)
  
  // Include state and country or any other customeSelect elements used in the values, for some reason custome selects are not working
  const formData:Customer = {
    // ...values !for some reason typscript is complaining here but it works
    surname: values.surname,
    firstname: values.firstname,
    middlename: values.middlename,
    fullname: values.fullname,
    address: values.address,
    phone_number: values.phone_number,
    customer_type_id: selectedCustomerType,
    title_id: selectedTitle,
  };

  makeApiCall<Customer>('PUT', `/customer/${Number(props.customers.id)}`, formData)
  .then((response) => {
    console.log('Customer updated successfully:', response.data); 
    emits('customerCreated'); 
    dialog.value = false;
  })
  .catch((error) => {
    console.error('Error updating customer:', error);
  })
  .finally(() => {
    loading.value = false;
  });

})


const customer_types = ref<GenericSetUp[]>([]);
const titles = ref<GenericSetUp[]>([]);
const loading = ref(false)

const handleCustomerTypeSelected = (customer_type: any) => {
  customer_type_id.value = customer_type;
  // console.log('Selected state:', state_id.value);
}
const handleTitleSelected = (title:any) => {
  title_id.value = title
  // console.log('Selected country:', country);
};



</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" variant="plain" color="pending">
        <VIcon icon="ri-edit-line" color="warning"/>
      </v-btn>
    </template>
      
      

      <v-card
        title="Edit Branch"
      >
        <v-card-text>
          <!--* form sample 
          !still working on the displaaying the value -->
            <form @submit.prevent="submit">
              <v-text-field
                v-model="surname.value.value"
                :counter="10"
                :error-messages="surname.errorMessage.value"
                label=" Surname"
                required
              ></v-text-field>

              <v-text-field
                v-model="firstname.value.value"
                :counter="10"
                :error-messages="firstname.errorMessage.value"
                label=" Firstname"
                required
              ></v-text-field>

              <v-text-field
                v-model="middlename.value.value"
                :counter="10"
                :error-messages="middlename.errorMessage.value"
                label=" Middlename"
                required
              ></v-text-field>

              <v-text-field
                v-model="fullname.value.value"
                :counter="10"
                :error-messages="fullname.errorMessage.value"
                label=" Fullname"
                required
              ></v-text-field>

              <v-text-field
                v-model="address.value.value"
                :counter="10"
                :error-messages="address.errorMessage.value"
                label="Address"
                required
              ></v-text-field>

              
              <VRow class="mxt-5 mb-5">
                <!-- {{st.name}} -->
                <vCol cols="6" v-if=props.customer_types>
                  <selectCustom :genericOptions="props.customer_types" :prevValue="props.customers.customer_type_id" :label_cus="'Customer Type'" @optionSelected="handleCustomerTypeSelected" />
                </vCol>
                <vCol cols="6" v-if=props.titles>
                  <selectCustom :genericOptions="props.titles" :prevValue="props.customers.title_id" :label_cus="'Title'" @optionSelected="handleTitleSelected" />
                </vCol>

              </VRow>
            


              <v-text-field
                v-model="phone_number.value.value"
                :counter="7"
                :error-messages="phone_number.errorMessage.value"
                label="Phone Number"
                required
              ></v-text-field>


              <v-text-field
                v-model="email.value.value"
                :error-messages="email.errorMessage.value"
                label="E-mail"
                required
              ></v-text-field>

              <v-spacer class="my-5"></v-spacer>

              <v-card-actions>
                <v-spacer></v-spacer>
      
                <v-btn
                  text="Close"
                  variant="plain"
                  @click="dialog = false"
                ></v-btn>
      
                <v-btn
                  color="primary"
                  type="submit"
                  text="Update"
                  variant="tonal"
                  :loading="loading"
                >
                  <template #loader>
                    <v-progress-circular indeterminate size="24" class="mr-2" />
                  </template>
              
                </v-btn>
              </v-card-actions>
            </form>


        </v-card-text>


      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script>
