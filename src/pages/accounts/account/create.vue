<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Account, AccountGroup, AccountSubtype, AccountType } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  accountgroups: AccountGroup[];
  account_types: AccountType[];
  account_subtypes: AccountSubtype[];
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
const account_group_id = useField('account_group_id');
const account_type_id = useField('account_type_id');
const account_subtype_id = useField('account_subtype_id');
const code = useField('code');


// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  const selectedGroup = Number(account_group_id.value) ;//forced the type number to appease the typescript gods
  // console.log(selectedState, selectedCountry)
  
  // Include state and country or any other customeSelect elements used in the values, for some reason custome selects are not working
  const formData:Account = {
    // ...values !for some reason typscript is complaining here but it works
    name: values.name,
    code: values.code,
    account_group_id: values.account_group_id.id,
    account_type_id: values.account_type_id.id,
    account_subtype_id: values.account_subtype_id.id,
  };
  
  // alert(JSON.stringify(formData, null, 2))
  makeApiCall<AccountType>('POST', `/accounts`, formData).then((response) => {
    console.log(response.data);
    emits('created');
    dialog.value = false;
  }).finally(() => {
    loading.value = false
  })

})


const loading = ref(false)

const handleSelected = (branch:any) => {
account_group_id.value = branch
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
          text="Add Account"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card
        title="Create Account"
      >
        <v-card-text>
          <!--* form sample -->
            <form @submit.prevent="submit">
              <v-text-field
                v-model="name.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                label="Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="code.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                label="Code"
                required
              ></v-text-field>
              
              <VRow class="mxt-5 mb-5">
                <vCol cols="12" v-if=props.accountgroups>
                  <v-combobox
                    v-model="account_group_id.value.value"
                    :items="props.accountgroups"
                    variant="outlined"
                    item-title="name" 
                    item-value="id" 
                    label="Account Group"
                    
                  ></v-combobox>
                </vCol>

              </VRow>
              <VRow class="mxt-5 mb-5">
                <vCol cols="12" v-if=props.account_types>
                  <v-combobox
                    v-model="account_type_id.value.value"
                    :items="props.account_types"
                    variant="outlined"
                    item-title="name" 
                    item-value="id" 
                    label="Account Type"
                  ></v-combobox>
                </vCol>

              </VRow>
              <VRow class="mxt-5 mb-5">
                <vCol cols="12" v-if=props.account_subtypes>
                  <v-combobox
                    v-model="account_subtype_id.value.value"
                    :items="props.account_subtypes"
                    variant="outlined"
                    item-title="name" 
                    item-value="id" 
                    label="Account Sub Type"
                    
                  ></v-combobox>
                </vCol>

              </VRow>
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
