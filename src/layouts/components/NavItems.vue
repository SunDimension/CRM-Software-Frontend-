<script lang="ts" setup>
import NavGroupCustom from '@/layouts/components/NavGroupCustom.vue'
import { useAuthStore } from '@/store/auth'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import type { PropType } from 'vue'
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  nav_obj: {
    type: Object as PropType<NavigationItem>,
    required: true,
  },
})

const useAuth = useAuthStore()
const router = useRouter()
function handleLogout() {
  // Implement your logout logic here (e.g., call an API, clear tokens)
  // console.log('User logged out!');
  useAuth.logout()
  router.push('/login')
}
interface NavigationItem {
  title: string
  icon?: string
  link?: string
  roles?: string[] // Optional property
  children?: NavigationItem[] // Optional nested children
}

const navigationLinks: NavigationItem[] = [

  {
    title: 'Storage &  Optimization',
    icon: 'ri-exchange-dollar-line',
    // roles: ['admin', 'Sales Rep', 'Cashier', 'Branch Manager'],
    children: [
      {
        title: 'Storage',
        icon: 'ri-exchange-dollar-line',

        children: [
          // { title: 'Company', link: '/setup/company' },
          { title: 'Primary Folder', link: '/setup/primary-folder' },
          { title: 'Sub Folder', link: '/setup/subfolder' },
          { title: 'Upload', link: '/setup/uploads' },
          // {title: 'File Upload',link:'/setup/files'},
          { title: 'Manage  Files', link: '/setup/all-uploads' },
          // { title: 'New Sales ', link: '/salesorder/sales', roles: ['admin', 'sales', 'Sales Rep'] },
          // { title: 'View All Sales', link: '/salesorder/all-sales', roles: ['admin', 'sales', 'Sales Rep', 'Branch Manager'] },
        ],
      },
      // {
      //   title: 'Manage Sales',
      //   icon: 'ri-exchange-dollar-line',
      //   roles: ['admin', 'Cashier', 'Branch Manager'],
      //   children: [
      //     { title: 'Confirm Sales', link: '/salesorder/receipt-pending', roles: ['admin', 'Cashier'] },

      //     { title: 'View All Confirmed Sales', link: '/salesreceipt/all-receipts', roles: ['admin', 'Cashier', 'Branch Manager'] },

      //     // { title: 'My Confirmed Sales', link: '/salesreceipt/my-receipts', roles: ['Cashier'] },

      //   ],
      // },
      // {
      //   title: 'Manage Credit',
      //   icon: 'ri-exchange-dollar-line',
      //   roles: ['admin', 'Cashier', 'Branch Manager'],
      //   children: [
      //     // { title: 'Confirm Sales', link: '/salesorder/receipt-pending', roles: ['admin', 'Cashier'] },
      //     { title: 'Payment for Credit', link: '/salesorder/awaiting-payment', roles: ['admin', 'Cashier'] },
      //     { title: ' Assign Credit Limit', link: '/customers/credit', roles: ['admin', 'Branch Manager', 'Cashier'] },
      //     { title: ' Customer Balances', link: '/customers/balance', roles: ['admin', 'Cashier'] },

      //     { title: 'Approve Credit Sales', link: '/salesorder/credit-pending', roles: ['admin', 'Cashier'] },

      //   ],
      // },
    ],
  },

  //     {
  //   title: 'Sales Receipt',
  //   icon: 'ri-exchange-dollar-line',
  //   children: [
  //     // { title: 'Cashier', link: '/salesreceipt/sales-receipt/:no' },
  //     // { title: 'Cashier-Payment', link: '/salesreceipt/new-receipt/:no' },

  //   ],
  // },
  {
    title: 'Document Mgt',
    icon: 'ri-exchange-dollar-line',
    // roles: ['admin', 'sales', 'Sales Rep', 'Branch Manager'],
    children: [
      // { title: 'Document Review', link: '/customers/customer' },
      { title: 'Document Review', link: '/setup/pending-upload' },
      { title: 'Company', link: '/setup/company' },
    ],
  },


  {
    title: 'Doc Collaboration',
    icon: 'ri-exchange-dollar-line',
    // roles: ['admin', 'sales', 'Sales Rep', 'Branch Manager'],
    children: [
      { title: 'Document Sharing', link: '/setup/share-upload' },
    ],
  },


  {
    title: 'Admin  Tools',
    icon: 'ri-exchange-dollar-line',
    // roles: ['admin', 'sales', 'Sales Rep', 'Branch Manager'],
    children: [
      { title: 'User Roles', link: '/user-management/roles' },
      { title: 'Users', link: '/user-management/users' },
      { title: 'Permissions', link: '/user-management/permissions' },
      { title: 'Recycle Bin', link: '/setup/recycle-bin' },
      // { title: 'Audit Trail', link: '/coming-soon' },
    ],
  },

  {
    title: 'Reports',
    icon: 'ri-exchange-dollar-line',
    // roles: ['admin', 'sales', 'Sales Rep', 'Branch Manager'],
    children: [
      { title: 'Report', link: '/coming-soon' },
    ],
  },

  {
    title: 'Audit Trail',
    icon: 'ri-history-line',
    roles: ['admin', 'manager'], // Optional role restriction
    children: [
      {
        title: 'Audit Trail',
        link: '/audit-trails',
        icon: 'ri-eye-line' // Optional child icon
      },
      // Add more children if needed
    ]
  },


  // {
  //   title: 'Admin  Tools',
  //   icon: 'ri-file-list-line', // Note: The icon has changed as per your request
  //   // roles: ['admin', 'Storekeeper', 'Branch Manager', 'Cashier'],
  //   children: [
  //     // {
  //     //   // title: 'Track Expense',
  //     //   // icon: 'ri-exchange-dollar-line',
  //     //   // children: [
  //     //   //   { title: 'Cashier Expenses', link: '/remittance/cashierexpense' }, // Corrected link based on your original structure
  //     //   //   { title: 'Pending Expenses', link: '/remittance/pending-expense' }, // Corrected link based on your original structure
  //     //   //   { title: 'All Expenses', link: '/remittance/all-expense' }, // Corrected link based on your original structure
  //     //   //   // { title: 'Item Transfer', link: '/inventory/transfer-orders' },
  //     //   //   // { title: 'Item Adjustment', link: '/inventory/inventory-adjustments' },
  //     //   //   // { title: 'Store Items', link: '/inventory/store-items' },
  //     //   // ],
  //     // },
  //     {
  //       title: 'Cashier Remittance',
  //       icon: 'ri-account-pin-box-line',
  //       roles: ['admin', 'Cashier'],
  //       children: [
  //         { title: 'Cashier Remittance', link: '/remittance/cashierremittance', roles: ['admin', 'Cashier'] },
  //         { title: 'Pending Remittance', link: '/remittance/pending-remittance', roles: ['admin', 'Cashier'] },

  //         // { title: 'Cashier Remittance', link: '/remittance/p', roles: ['admin', 'Storekeeper'] },

  //         // { title: 'All Release', link: '/release/all-release' },
  //         // { title: 'Return', link: '/coming-soon' },

  //       ],
  //     },
  //     {
  //       title: 'Bank Remittance',
  //       icon: 'ri-account-pin-box-line',
  //       roles: ['admin', 'Cashier'],
  //       children: [
  //         { title: 'Bank Remittance', link: '/remittance/bankremittance', roles: ['admin', 'Cashier'] },
  //         // { title: 'Pending Bank Remittance', link: '/remittance/bank-pending' },

  //         // { title: 'All Release', link: '/release/all-release' },
  //         // { title: 'Return', link: '/coming-soon' },

  //       ],
  //     },

  //     {
  //       title: 'Chief Cashier',
  //       icon: 'ri-account-pin-box-line',
  //       roles: ['admin', 'Cashier'],
  //       children: [
  //         { title: 'Chief Cashier', link: '/remittance/all-remittance', roles: ['admin', 'Storekeeper'] },
  //         // { title: 'Pending Bank Remittance', link: '/remittance/pending-bank-remittance' },
  //         // { title: 'All Release', link: '/release/all-release' },
  //         // { title: 'Return', link: '/coming-soon' },

  //       ],
  //     },

  //     {
  //       title: 'View Bank Deposits',
  //       icon: 'ri-account-pin-box-line',
  //       roles: ['admin', 'Cashier', 'Branch Manager'],
  //       children: [
  //         { title: 'All Bank Deposit', link: '/remittance/all-bank-remit', roles: ['admin', 'Branch Manager'] },
  //         // { title: 'All Bank Deposit', link: '/coming-soon', roles: ['admin', 'Storekeeper'] },
  //         // { title: 'Pending Bank Remittance', link: '/remittance/pending-bank-remittance' },
  //         // { title: 'All Release', link: '/release/all-release' },
  //         // { title: 'Return', link: '/coming-soon' },

  //       ],
  //     },

  //   ],
  // },

  // {
  //   title: 'Banking',
  //   icon: 'ri-exchange-dollar-line',
  //   roles: ['admin', 'Cashier'],
  //   children: [
  //     { title: 'Post Inflow', link: '/transactions/inflow-transactions' },
  //     { title: 'View All Inflows', link: '/transactions/all-inflow' },
  //     { title: 'Post Outflow', link: '/transactions/outflow-transactions' },
  //     { title: ' View All Outflows', link: '/transactions/all-outflow' },
  //     { title: ' Bank Balance', link: '/coming-soon', roles: ['admin'] },
  //     { title: ' Settle Credit Sales', link: '/coming-soon', roles: ['admin'] },
  //   ],
  // },

  // {
  //   title: 'Accounting',
  //   icon: 'ri-account-pin-box-line',
  //   roles: ['admin'],
  //   children: [
  //     { title: 'Accounts', link: '/account/accounts' },
  //     { title: 'Group', link: '/account/group' },
  //     { title: 'Types', link: '/account/type' },
  //     { title: 'Subtype', link: '/account/subtype' },
  //     { title: 'Journal Transaction', link: '/journal/wizard' },
  //   ],
  // },
  {
    title: 'System Setup',
    icon: 'ri-settings-2-line',
    roles: ['admin', 'system setup', 'Storekeeper', 'Branch Manager'],
    children: [
      // { title: 'Adjustment type', link: '/setup/adjustment-type' },
      // { title: 'Attribute', link: '/setup/attribute' },
      // { title: 'Bank', link: '/setup/bank' },
      // { title: 'Branch', link: '/setup/branch' },
      // { title: 'Company', link: '/setup/company' },


      { title: 'Audit Action', link: '/setup/audit-action' },
      { title: 'File Type', link: '/setup/filetype' },
      { title: 'File Status', link: '/setup/filestatus' },
      { title: 'Year', link: '/setup/year' },
      // { title: 'Expense Line', link: '/setup/expense-line' },
      // { title: 'Item category', link: '/setup/item-category' },
      // { title: 'Item type', link: '/setup/item-type' },
      // { title: 'Payment mode', link: '/setup/payment-mode' },
      // { title: 'Payment terms', link: '/setup/payment-terms' },
      // { title: 'Payment type', link: '/setup/payment-type' },
      // { title: 'Reason', link: '/setup/reason' }, // setup/ Added for the generic replication
      // { title: 'Role', link: '/setup/role' },
      // { title: 'Region', link: '/setup/region' },
      // { title: 'Manufacturer', link: '/setup/manufacturer' },
      // { title: 'State', link: '/setup/state' },
      // { title: 'Status', link: '/setup/status' },
      // { title: 'Store', link: '/setup/store' },
      // { title: 'Tax', link: '/setup/tax' }, // setup/ Added for the generic replication
      // { title: 'Title', link: '/setup/title' },
      // { title: 'Unit', link: '/setup/unit' },
      // { title: 'Vendor type', link: '/setup/vendor-type' },
      // { title: 'Warehouse', link: '/setup/warehouse' },
      // { title: 'Weight', link: '/setup/weight' },
      // { title: 'Inflow-status', link: '/setup/inflow-status' },
      // { title: 'Outflow-mode', link: '/setup/Outflow-mode' },

    ],
  },

  // {
  //   title: 'Purchases',
  //   icon: 'ri-secure-payment-line',
  //   roles: ['admin', 'Storekeeper', 'Branch Manager'],
  //   children: [
  //     {
  //       title: 'Vendor',
  //       icon: 'ri-account-pin-box-line',
  //       roles: ['admin', 'Storekeeper', 'Branch Manager'],
  //       children: [
  //         { title: 'Vendors', link: '/purchase/vendor', roles: ['admin', 'Storekeeper', 'Branch Manager'] },
  //         { title: 'Vendor Target', link: '/coming-soon', roles: ['admin'] },
  //       ],
  //     },
  //     { title: 'Purchase Orders', link: '/coming-soon', roles: ['admin'] },
  //     { title: 'Purchase Received', link: '/coming-soon', roles: ['admin'] },
  //     { title: 'Payment Made', link: '/coming-soon', roles: ['admin'] },
  //   ],
  // },

  // {
  //   title: 'Reports',
  //   icon: 'ri-file-chart-line',
  //   roles: ['admin'],
  //   children: [
  //     { title: 'Sales Report', link: '/coming-soon' },
  //     { title: 'Customer Report', link: '/coming-soon' },
  //     { title: 'Inventory Report', link: '/coming-soon' },
  //     {
  //       title: 'Store Report',
  //       icon: 'ri-account-pin-box-line',
  //       children: [
  //         { title: 'Release Report', link: '/coming-soon' },
  //         { title: 'Return Report', link: '/coming-soon' },
  //       ],
  //     },
  //     {
  //       title: 'Purchase Report',
  //       icon: 'ri-account-pin-box-line',
  //       children: [
  //         { title: 'Vendor Report', link: '/coming-soon' },
  //       ],
  //     },
  //   ],

  // },
  // {
  //   title: 'Control Panel',
  //   icon: 'ri-exchange-dollar-line',
  //   roles: ['admin', 'Branch Manager'],
  //   children: [
  //     {
  //       title: 'Store Receipt',
  //       roles: ['admin', 'Store Keeper', 'Store Admin', 'Branch Manager'],
  //       icon: 'ri-exchange-dollar-line',
  //       children: [
  //         { title: 'New Receipt', link: '/store/store-receipt', roles: ['admin', 'Store Keeper', 'Store Admin', 'Branch Manager'] },
  //         { title: 'Pending Approval', link: '/store/receipt-pending', roles: ['admin', 'Store Admin', 'Branch Manager'] },
  //         { title: 'All Receipt', link: '/store/all-receipt' },

  //         // { title: 'New Receipt', link: '/store/store-receip', roles: ['admin', 'Store Keeper', 'Store Admin'] },
  //       ],
  //     },
  // {
  //   title: 'Price Adjustment',
  //   roles: ['admin', 'Store Keeper', 'Store Admin', 'Branch Manager'],
  //   icon: 'ri-exchange-dollar-line',
  //   children: [
  //     { title: 'New Adjustment', link: '/store/set-price' },
  //     { title: 'Pending Approval', link: '/store/price-pending' },

  //     // { title: 'All Receipt', link: '/store/all-receipt', roles: ['admin', 'Store Keeper', 'Store Admin'] },

  //   ],


  // },

  // {
  //   title: 'Set Sales Limit',
  //   // roles: ['admin', 'Store Keeper', 'Store Admin', 'Branch Manager'],
  //   icon: 'ri-exchange-dollar-line',
  //   children: [
  //     { title: 'Set Limit', link: '/inventory/set-limits' },
  //     // { title: 'Pending Approval', link: '/store/price-pending', roles: ['admin', 'Branch Manager'] },

  //     // { title: 'All Receipt', link: '/store/all-receipt', roles: ['admin', 'Store Keeper', 'Store Admin'] },

  //   ],


  // },

  // { title: 'Change Item Price', link: '/coming-soon' },
  // { title: 'Item Discount', link: '/coming-soon' },

  //   ],
  // },
  // {
  //   title: 'Payment',
  //   icon: 'ri-exchange-dollar-line',
  //   // roles: ['admin'],
  //   children: [
  //     { title: 'Payment Transaction', link: '/voucher/wizard' },

  //   ],
  // },
  // {
  //   title: 'User Management',
  //   icon: 'ri-group-line',
  //   // roles: ['admin'],
  //   children: [
  //     { title: 'Users', link: '/user-management/users' },
  //     { title: 'Roles', link: '/user-management/roles' },
  //     { title: 'Permissions', link: '/user-management/permissions' },
  //     { title: 'Previlege Assignment ', link: '/coming-soon' },
  //   ],
  // },

  // {
  //   title: 'DOCUMENT UPLOAD',
  //   icon: 'ri-file-upload-line',
  //   children: [] // Empty since there were no children in the original
  // },
  // {
  //   title: 'APPROVALS',
  //   icon: 'ri-shake-hands-line',
  //   children: [] // Empty since there were no children in the original
  // },
  // {
  //   title: 'NOTIFICATIONS',
  //   icon: 'ri-notification-line',
  //   children: [] // Empty since there were no children in the original
  // },

]

interface Role {
  id: number
  name: string
}// Get user's roles as names

// interface NavigationItem {
//   title: string;
//   icon: string;
//   link?: string;
//   roles?: string[]; // Optional property
//   children?: NavigationItem[]; // Optional nested children
// }

const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)).user : null

// const userRoleNames = computed(() => parsedUser.roles.map((role: any) => role.name.toLowerCase()))

// console.log(useAuth.user.roles);

// Filter navigation links based on user role names
// const filteredNavigationLinks = computed(() => {

//     return navigationLinks
//         .map(group => ({
//             ...group,
//             children: group.children?.filter(item => !item.roles || item.roles.some(roleName => userRoleNames.value.includes(roleName.toLowerCase()))) || [],
//         }))
//         .filter(group => !group.roles || group.roles.some(roleName => userRoleNames.value.includes(roleName.toLowerCase())));
// });

const filteredNavigationLinks = computed(() => {
  const filterLinks = (links: NavigationItem[]): NavigationItem[] => {
    return links
      // .filter(link => !link.roles || link.roles.some(roleName => userRoleNames.value.includes(roleName.toLowerCase())))
      .map(link => ({
        ...link,
        children: link.children ? filterLinks(link.children) : undefined,
      }))
  }

  return filterLinks(navigationLinks)
})
</script>

<template>
  <!-- 👉 Dashboards -->
  <div class="no-print">
    <VerticalNavLink :item="{
      title: 'Dashboard',
      to: '/dashboard',
      // badgeContent: '5',
      // badgeClass: 'bg-error',
      icon: 'ri-home-smile-line',
    }" />

    <NavGroupCustom v-for="navGroup in filteredNavigationLinks" :key="navGroup.title" :nav_obj="navGroup" />

    <VerticalNavLink :item="{
      title: 'Log Out',
      icon: 'ri-login-box-line',
    }" @click="handleLogout" />
  </div>
</template>
