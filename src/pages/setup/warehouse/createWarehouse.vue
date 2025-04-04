<script setup lang="ts">
import selectCustom from '@/components/forms/selectCustom.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  branches: Branch[];
}>();
const dialog = ref(false);
const emits = defineEmits(['created']);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    }
  },
})

const name = useField('name');
const warehouse_address = useField('warehouse_address');
const contact_person = useField('contact_person');
const zipcode = useField('zipcode');
const phone = useField('phone');
const email = useField('email');
const branch_id = useField('branch_id');


// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  const selectedBranch = Number(branch_id.value) ;//forced the type number to appease the typescript gods
  // console.log(selectedState, selectedCountry)
  
  // Include state and country or any other customeSelect elements used in the values, for some reason custome selects are not working
  const formData:Warehouse = {
    // ...values !for some reason typscript is complaining here but it works
    name: values.name,
    warehouse_address: values.warehouse_address,
    zipcode: values.zipcode,
    contact_person: values.contact_person,
    phone: values.phone,
    email: values.email,//all the way to here
    branch_id: selectedBranch,
  };
  // alert(JSON.stringify(formData, null, 2))
  makeApiCall<Warehouse>('POST', `/warehouses`, formData).then((response) => {
    console.log(response.data);
    emits('created');
    dialog.value = false;
  }).finally(() => {
    loading.value = false
  })

})


const loading = ref(false)

const handleBranchSelected = (branch:any) => {
  branch_id.value = branch
  console.log('Selected branch:', branch);
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
          text="Add Warehouse"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card
        title="Create Warehouse"
      >
        <v-card-text>
          <!--* form sample -->
            <form @submit.prevent="submit">
              <v-text-field
                v-model="name.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                label="Warehouse Name*"
                required
              ></v-text-field>

              <v-text-field
                v-model="warehouse_address.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                label="Address*"
                required
              ></v-text-field>
              <v-text-field
                v-model="zipcode.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                label="Zipcode"
                required
              ></v-text-field>

              
              <VRow class="mxt-5 mb-5">
                <vCol cols="12" v-if=props.branches>
                  <selectCustom :genericOptions="props.branches" :label_cus="'Branch'" @optionSelected="handleBranchSelected" />
                </vCol>

              </VRow>
              <v-text-field
                v-model="contact_person.value.value"
                :counter="10"
                :error-messages="contact_person.errorMessage.value"
                label="Contact Person*"
                required
              ></v-text-field>


              <v-text-field
                v-model="phone.value.value"
                :counter="7"
                :error-messages="phone.errorMessage.value"
                label="Phone Number*"
                required
              ></v-text-field>


              <v-text-field
                v-model="email.value.value"
                :error-messages="email.errorMessage.value"
                label="E-mail*"
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
