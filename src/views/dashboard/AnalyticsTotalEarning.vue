<script setup lang="ts">
import aviato from '@images/logos/aviato.png';
import bitbank from '@images/logos/bitbank.png';
import zipcar from '@images/logos/zipcar.png';

const earnings = [
  {
    avatar: zipcar,
    title: 'Moniport',
    subtitle: 'Vuejs, React & HTML',
    amount: '50,000',
    progress: 'primary',
  },
  {
    avatar: bitbank,
    title: 'XYZ Company',
    subtitle: 'Sketch, Figma & XD',
    amount: '40,000',
    progress: 'info',
  },
  {
    avatar: aviato,
    title: 'ABC Company',
    subtitle: 'HTML & Anguler',
    amount: '30,000',
    progress: 'secondary',
  },
]
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Total Uploads</VCardTitle>

      <template #append>
        <div class="me-n3">
          <MoreBtn />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <div class="d-flex align-center">
        <h3 class="text-h3">
          120,000
        </h3>

        <VIcon
          size="24"
          icon="ri-arrow-up-s-line"
          color="success"
        />
        <div class="text-success">
          10%
        </div>
      </div>
      <div class="text-body-1 mb-12">
        Compared to 80,000 last year
      </div>

      <VList class="card-list">
        <VListItem
          v-for="earning in earnings"
          :key="earning.title"
        >
          <!-- <template #prepend>
            <VAvatar
              rounded
              :image="earning.avatar"
              variant="tonal"
            />
          </template> -->

          <VListItemTitle class="font-weight-medium">
            {{ earning.title }}
          </VListItemTitle>
          <!-- <VListItemSubtitle class="text-body-1">
            {{ earning.subtitle }}
          </VListItemSubtitle> -->

          <template #append>
            <div>
              <h6 class="text-h6 mb-2">
                {{ earning.amount }}
              </h6>
              <VProgressLinear
                :color="earning.progress"
                model-value="80"
                rounded-bar
                rounded
              />
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5rem;
}
</style>
