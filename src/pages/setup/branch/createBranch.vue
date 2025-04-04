<script setup lang="ts">
import selectCustom from '@/components/forms/selectCustom.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  states: GenericSetUp[];
  countries: GenericSetUp[];
  regions: GenericSetUp[];
}>();
const dialog = ref(false);
const emits = defineEmits(['branchCreated']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true;
      return 'Name needs to be at least 2 characters.';
    },
    contact_person (value :string) {
      if (value?.length >= 2) return true;
      return "Contact Person's Name needs to be at least 2 characters.";
    },
    phone (value :string) {
      if (value?.length > 9 && /[0-9-]+/.test(value)) return true;
      return 'Phone number needs to be at least 9 digits.';
    },
  },
});

const name = useField('name');
const contact_person = useField('contact_person');
const address = useField('address');
const phone = useField('phone');
const email = useField('email');
const state_id = useField('state_id');
const country_id = useField('country_id');
const region_id = useField('region_id');

const submit = handleSubmit((values) => {
  loading.value = true;
  const selectedState = Number(state_id.value);
  const selectedCountry = Number(country_id.value);
  const selectedRegion = Number(region_id.value);
  
  const formData:Branch = {
    name: values.name,
    contact_person: values.contact_person,
    address: values.address,
    phone: values.phone,
    email: values.email,
    state_id: selectedState,
    country_id: selectedCountry,
    region_id: selectedRegion,
  };

  makeApiCall<Branch>('POST', `/branches`, formData).then((response) => {
    emits('branchCreated');
    dialog.value = false;
  }).finally(() => {
    loading.value = false;
  });
});

const states = ref<GenericSetUp[]>([]);
const countries = ref<GenericSetUp[]>([]);
const regions = ref<GenericSetUp[]>([]);
const loading = ref(false);

const handleStateSelected = (state: any) => {
  state_id.value = state;
};
const handleCountrySelected = (country: any) => {
  country_id.value = country;
};
const handleRegionSelected = (region: any) => {
  region_id.value = region;
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
          text="Add Branch"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card title="Create Branch">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name.value.value"
              :counter="10"
              :error-messages="name.errorMessage.value"
              label="Branch Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="address.value.value"
              :counter="10"
              :error-messages="name.errorMessage.value"
              label="Address"
              required
            ></v-text-field>

            <VRow class="mxt-5 mb-5">
              <vCol cols="4" v-if=props.states>
                <selectCustom :genericOptions="props.states" :label_cus="'State'" @optionSelected="handleStateSelected" />
              </vCol>
              <vCol cols="4" v-if=props.countries>
                <selectCustom :genericOptions="props.countries" :label_cus="'Country'" @optionSelected="handleCountrySelected" />
              </vCol>
              <vCol cols="4" v-if=props.regions>
                <selectCustom :genericOptions="props.regions" :label_cus="'Region'" @optionSelected="handleRegionSelected" />
              </vCol>
            </VRow>

            <v-text-field
              v-model="contact_person.value.value"
              :counter="10"
              :error-messages="contact_person.errorMessage.value"
              label="Contact Person"
              required
            ></v-text-field>

            <v-text-field
              v-model="phone.value.value"
              :counter="7"
              :error-messages="phone.errorMessage.value"
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
              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
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
