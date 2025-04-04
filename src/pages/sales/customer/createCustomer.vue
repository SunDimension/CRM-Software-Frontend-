<script setup lang="ts">
import selectCustom from '@/components/forms/selectCustom.vue';
import { makeApiCall } from '@/services/apiService';
import { Customer, GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  customer_types: GenericSetUp[];
  titles: GenericSetUp[];
}>();
const dialog = ref(false);
const emits = defineEmits(['customerCreated']);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    surname (value :string) {
      if (value?.length >= 2) return true

      return 'SurName needs to be at least 2 characters.'
    },
     firstname (value :string) {
      if (value?.length >= 2) return true

      return 'FirstName needs to be at least 2 characters.'
    },

     middlename (value :string) {
      if (value?.length >= 2) return true

      return 'MiddleName needs to be at least 2 characters.'
    },
     fullname (value :string) {
      if (value?.length >= 2) return true

      return 'FullName needs to be at least 2 characters.'
    },
    contact_person (value :string) {
      if (value?.length >= 2) return true

      return "Contact Person's Name needs to be at least 2 characters."
    },
    phone_number (value :string) {
      if (value?.length > 9 && /[0-9-]+/.test(value)) return true
      return 'Phone number needs to be at least 9 digits.'
    },
   

  },
})

const surname = useField('surname');
const firstname = useField('firstname');
const middlename = useField('middlename');
const fullname = useField('fullname');
const address = useField('address');
const phone_number = useField('phone_number');
const customer_type_id = useField('customer_type_id');
const title_id = useField('title_id');


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
  // alert(JSON.stringify(formData, null, 2))
  makeApiCall<Customer>('PUT', `/customer`, formData).then((response) => {
    // console.log(response.data)
    emits('customerCreated');
    dialog.value = false;
  }).finally(() => {
    loading.value = false
  })

})


const customer_types = ref<GenericSetUp[]>([]);
const titles = ref<GenericSetUp[]>([]);
const loading = ref(false)

const handleCustomerTypeSelected = (customer_type: any) => {
  customer_type_id.value = customer_type;
  console.log('Selected customer_type:', customer_type, customer_type_id.value);
}
const handleTitleSelected = (title:any) => {
  title_id.value = title
  console.log('Selected title:', title);
};



</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          class="text-none font-weight-regular"
          color="success-darken-1"
          prepend-icon=""
          text="Add Customer"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card
        title="Create Customer"
      >
        <v-card-text>
          <!--* form sample -->
            <form @submit.prevent="submit">
              <v-text-field
                v-model="surname.value.value"
                :counter="10"
                :error-messages="surname.errorMessage.value"
                label="Surname Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="firstname.value.value"
                :counter="10"
                :error-messages="firstname.errorMessage.value"
                label="Firstname"
                required
              ></v-text-field>

                <v-text-field
                v-model="middlename.value.value"
                :counter="10"
                :error-messages="middlename.errorMessage.value"
                label="Middlename"
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
                  <selectCustom :genericOptions="props.customer_types" :label_cus="'CustomerType'" @optionSelected="handleCustomerTypeSelected" />
                </vCol>
                <vCol cols="6" v-if=props.titles>
                  <selectCustom :genericOptions="props.titles" :label_cus="'Title'" @optionSelected="handleTitleSelected" />
                </vCol>

              </VRow>
              <v-text-field
                v-model="fullname.value.value"
                :counter="10"
                :error-messages="fullname.errorMessage.value"
                label="Fullname"
                required
              ></v-text-field>


              <v-text-field
                v-model="phone_number.value.value"
                :counter="7"
                :error-messages="phone_number.errorMessage.value"
                label="Phone Number"
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
                  color="success-darken-1"
                  type="submit"
                  text="Create"
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
