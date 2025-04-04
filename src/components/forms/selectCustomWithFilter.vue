<template>
  <v-combobox
    v-model="selectedOption"
    :items="props.genericOptions"
    variant="outlined"
    item-title="name" 
    item-value="id" 
    :label="`${props.label_cus} ${props.required ? '*' : ''}`"  
    :required=props.required
  ></v-combobox>
</template>
<script setup lang="ts">
import { GenericSetUp as Gs } from '@/types/globalTypes';
import { defineProps, ref, watch } from 'vue';

const emit = defineEmits(['optionSelected']);
const selectedOption = ref<number|null>(null);

// Define props
const props = defineProps<{
  genericOptions: Gs[];
  label_cus: string;
  prevValue?: number|null|undefined;
  required?: boolean
}>();

// watch and emit the new selection back to the parent compoennt
watch(selectedOption, (newVal) => {
  emit('optionSelected', newVal);
});

onMounted(() => {
  // console.log('props.prevValue--->', props.prevValue, props.label_cus, props.genericOptions);
  if (props.prevValue !== undefined && props.prevValue !== null) {
    selectedOption.value = props.prevValue as null | number;
    // console.log('selectedOption.value--->', selectedOption.value)
  }
})

// console.log('props.genericOptions-->',props.label_cus)

</script>
