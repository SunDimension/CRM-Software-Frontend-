<template>
  <v-combobox
    v-model="selectedOption"
    :items="props.genericOptions"
    variant="outlined"
    item-title="name" 
    item-value="id" 
    :label=props.label_cus
  ></v-combobox>
</template>
<script setup lang="ts">
import { GenericSetUp } from '@/types/globalTypes';
import { defineProps, ref, watch } from 'vue';

const emit = defineEmits(['optionSelected']);
const selectedOption = ref<string|null>(null);

// Define props
const props = defineProps<{
  genericOptions: GenericSetUp[];
  label_cus: string;
  prevValue?: string;
}>();

// watch and emit the new selection back to the parent compoennt
watch(selectedOption, (newVal) => {
  emit('optionSelected', newVal);
});

onMounted(() => {
  // console.log('props.prevValue--->', props.prevValue, props.label_cus, props.genericOptions);
  if (props.prevValue !== undefined) {
    selectedOption.value = props.prevValue as null | string;
    console.log('selectedOption.value--->', selectedOption.value)
  }
})

// console.log('props.genericOptions-->',props.label_cus)

</script>
