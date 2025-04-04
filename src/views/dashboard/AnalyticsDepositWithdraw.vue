<script setup lang="ts">
import accessBankLogo from '@images/logos/accesslogo.png'
import firstBankLogo from '@images/logos/firstbank.png'
import gtBankLogo from '@images/logos/gtlogo.png'
import moniepoint from '@images/logos/moniepoint.jpg'
import zenithBankLogo from '@images/logos/zenithlogo.png'

const deposits = [
  {
    title: 'GTBank',
    subtitle: 'Customer Purchase',
    amount: '+₦990,650.00',
    logo: gtBankLogo,
  },
  {
    title: 'Zenith Bank',
    subtitle: 'Customer Purchase',
    amount: '+₦957,000.99',
    logo: zenithBankLogo,
  },
  {
    title: 'Access Bank',
    subtitle: 'Customer Debt Service',
    amount: '+₦7,100,225.90',
    logo: accessBankLogo,
  },
  {
    title: 'Monie Point',
    subtitle: 'Wallet deposit',
    amount: '+₦2,108,934.78',
    logo: moniepoint,
  },
  {
    title: 'First Bank',
    subtitle: 'Customer Purchase',
    amount: '+₦1,60,837.67',
    logo: firstBankLogo,
  },
]
const withdraws = [
  {
    title: 'First Bank',
    subtitle: 'Customer Purchase',
    amount: '-₦60,837.00',
    logo: firstBankLogo,
  },
  {
    title: 'Access Bank',
    subtitle: 'Customer Debt Service',
    amount: '-₦192,705.66',
    logo: accessBankLogo,
  },
  {
    title: 'Zenith Bank',
    subtitle: 'Customer Purchase',
    amount: '-₦400,957.22',
    logo: zenithBankLogo,
  },
  {
    title: 'GTBank',
    subtitle: 'Customer Purchase',
    amount: '-₦40,650.44',
    logo: gtBankLogo,
  },
  {
    title: 'Monie Point',
    subtitle: 'Wallet deposit',
    amount: '-₦80,934.00',
    logo: moniepoint,
  },
]

// const withdraws = [
//   {
//     title: 'Google Adsense',
//     subtitle: 'PayPal deposit',
//     amount: '-₦145',
//     logo: google,
//   },
//   {
//     title: 'GitHub Enterprise',
//     subtitle: 'Security & compliance',
//     amount: '-₦1870',
//     logo: github,
//   },
//   {
//     title: 'Upgrade Slack Plan',
//     subtitle: 'Debit card deposit',
//     amount: '-₦450',
//     logo: slack,
//   },
//   {
//     title: 'DigitalOcean',
//     subtitle: 'Cloud Hosting',
//     amount: '-₦540',
//     logo: digitalOcean,
//   },
//   {
//     title: 'AWS Account',
//     subtitle: 'Choosing a Cloud Platform',
//     amount: '-₦21',
//     logo: aws,
//   },
// ]
</script>

<template>
  <VCard title="Recent Transactions">
    <VRow no-gutters>
      <VCol
        cols="12"
        md="6"
      >
        <VCardItem>
          <VCardTitle>Deposit</VCardTitle>

          <template #append>
            <h6 class="text-h6">
              <a
                href="javascript:void(0)"
                class="text-primary"
              >View All</a>
            </h6>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="deposit in deposits"
              :key="deposit.logo"
            >
              <template #prepend>
                <div class="me-4">
                  <VImg
                    :height="30"
                    :width="30"
                    :src="deposit.logo"
                  />
                </div>
              </template>

              <VListItemTitle class="font-weight-medium mb-1">
                {{ deposit.title }}
              </VListItemTitle>
              <VListItemSubtitle class="text-body-1">
                {{ deposit.subtitle }}
              </VListItemSubtitle>

              <template #append>
                <VListItemAction class="text-success font-weight-medium">
                  {{ deposit.amount }}
                </VListItemAction>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCol>

      <VDivider :vertical="$vuetify.display.mdAndUp" />

      <VCol
        cols="12"
        md="6"
      >
        <VCardItem>
          <VCardTitle>Withdraw</VCardTitle>

          <template #append>
            <h6 class="text-h6">
              <a
                href="javascript:void(0)"
                class="text-primary"
              >View All</a>
            </h6>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="withdraw in withdraws"
              :key="withdraw.logo"
            >
              <template #prepend>
                <div class="me-4">
                  <VImg
                    :height="30"
                    :width="30"
                    :src="withdraw.logo"
                  />
                </div>
              </template>

              <VListItemTitle class="font-weight-medium mb-1">
                {{ withdraw.title }}
              </VListItemTitle>
              <VListItemSubtitle class="text-body-1">
                {{ withdraw.subtitle }}
              </VListItemSubtitle>

              <template #append>
                <VListItemAction>
                  <span class="text-error font-weight-medium">
                    {{ withdraw.amount }}
                  </span>
                </VListItemAction>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.25rem;
}
</style>
