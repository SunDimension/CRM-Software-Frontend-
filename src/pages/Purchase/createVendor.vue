<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, Vendor } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  vendor_types: GenericSetUp[];
  banks: GenericSetUp[];
}>();
const dialog = ref(false);
const emits = defineEmits(['vendorCreated']);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true

      return 'SurName needs to be at least 2 characters.'
    },

    address (value :string) {
      if (value?.length >= 2) return true

      return 'SurName needs to be at least 2 characters.'
    },
    contact (value :string) {
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

const name = useField('name');
const address = useField('address');
const contact_title = useField('contact_title');
const contact_designation = useField('contact_designation');
const contact_surname = useField('contact_surname');
const contact_firstname = useField('contact_firstname');
const contact_middlename = useField('contact_middlename');
const contact_fullname = useField('contact_fullname');
const vendor_type_id = useField('vendor_type_id');
const phone_number = useField('phone_number');
const email = useField('email');
const image_url = useField('image_url');
const tin = useField('tin');
const bank_id = useField('bank_id');
const account_number = useField('account_number');


// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  const selectedCustomerType = Number(vendor_type_id.value) ;//forced the type number to appease the typescript gods
  const selectedTitle = Number(bank_id.value);
  // console.log(selectedState, selectedCountry)
  
  // Include state and country or any other customeSelect elements used in the values, for some reason custome selects are not working
  const formData:Vendor = {
    // ...values !for some reason typscript is complaining here but it works
    name: values.name,
    address: values.address,
    contact_title: values.contact_title,
     contact_designation: values.contact_designation,
    contact_surname: values.contact_surname,
    contact_firstname: values.contact_firstname,
    contact_middlename: values.contact_middlename,
    contact_fullname: values.contact_fullname,
    vendor_type_id: selectedCustomerType,
    phone_number: values.phone_number,
    email: values.email,
    image_url: values.image_url,
    tin: values.tin,
    bank_id: selectedTitle,
    account_number: values.account_number,
  };
  // alert(JSON.stringify(formData, null, 2))
  makeApiCall<Vendor>('POST', `/vendor`, formData).then((response) => {
    // console.log(response.data)
    emits('vendorCreated');
    dialog.value = false;
  }).finally(() => {
    loading.value = false
  })

})


const vendor_types = ref<GenericSetUp[]>([]);
const banks = ref<GenericSetUp[]>([]);
const loading = ref(false)

const handleVendorTypeSelected = (vendor_type: any) => {
  vendor_type_id.value = vendor_type;
  console.log('Selected vendor_type:', vendor_type, vendor_type_id.value);
}
const handleBankSelected = (bank:any) => {
  bank_id.value = bank
  console.log('Selected bank:', bank);
};



</script>
