import GenericSetUpComponent from '@/pages/setup/generic_setup/index.vue'
import { useAuthStore } from '@/store/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: 'dashboard' },

    {
      path: '/',
      component: () => import('@/layouts/default.vue'),
      children: [
        {
          path: 'dashboard',
          component: () => import('@/pages/dashboard.vue'),
        },
        {
          path: 'student-dashboard',
          component: () => import('@/pages/student-dashboard.vue'),
        },
        {
          path: 'account-settings',
          component: () => import('@/pages/account-settings.vue'),
        },
        {
          path: 'typography',
          component: () => import('@/pages/typography.vue'),
        },
        {
          path: 'icons',
          component: () => import('@/pages/icons.vue'),
        },
        {
          path: 'cards',
          component: () => import('@/pages/cards.vue'),
        },
        {
          path: 'tables',
          component: () => import('@/pages/tables.vue'),
        },
        {
          path: 'form-layouts',
          component: () => import('@/pages/form-layouts.vue'),
        },
        {
          path: 'form-sample',
          component: () => import('@/pages/form-layouts.vue'),
        },
        {
          path: 'coming-soon',
          component: () => import('@/pages/coming-soon.vue'),
        },

        // router.js
        {
          path: '/edit-profile',
          name: 'edit-profile',
          component: () => import('@/pages/setup/edit-profile.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/document-attached',
          name: 'document-attached',
          component: () => import('@/pages/setup/document-attached.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/payment-details',
          name: 'payment-details',
          component: () => import('@/pages/setup/payment-details.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/view-application',
          name: 'view-application',
          component: () => import('@/pages/setup/view-application.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/audit-trails',
          name: 'audit-trails',
          component: () => import('@/components/audit/AuditTrail.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'store',
          name: 'store-manager',
          children: [
            {
              path: 'store-receipt',
              component: () => import('@/pages/store-mgt/receipt/receipt-wizard.vue'),
              name: 'store-receipt',
            },
            {
              path: 'receive-print/:no',
              component: () => import('@/pages/store-mgt/receipt/receive-print.vue'),
              name: 'receive-order-print',
            },
            {
              path: 'treat-receive/:no',
              component: () => import('@/pages/store-mgt/receipt/treat-receive.vue'),
              name: 'treat-print',
            },
            {
              path: 'receipt-pending',
              component: () => import('@/pages/store-mgt/receipt/list-pending.vue'),
              name: 'store-mgt-receipt-pending',
            },
            {
              path: 'all-receipt',
              component: () => import('@/pages/store-mgt/receipt/all-receipts.vue'),
              name: 'store-mgt-receipts',
            },
            {
              path: 'set-price',
              component: () => import('@/pages/store-mgt/pricing/price-wizard.vue'),
              name: 'store-mgt-price',
            },
            {
              path: 'price-pending',
              component: () => import('@/pages/store-mgt/pricing/list-pending.vue'),
              name: 'store-mgt-price-pending',
            },
            {
              path: 'treat-price/:no',
              component: () => import('@/pages/store-mgt/pricing/treat-price.vue'),
              name: 'store-mgt-price-treat',
            },
            {
              path: 'price-print/:no',
              component: () => import('@/pages/store-mgt/pricing/price-print.vue'),
              name: 'store-mgt-price-print',
            },
          ],
        },
        {
          path: 'setup',
          name: 'setup',
          children: [
            {
              path: 'branch',
              component: () => import('@/pages/setup/branch/index.vue'),
              name: 'branch',
            },
            {
              path: 'uploads',
              component: () => import('@/pages/setup/uploads/index.vue'),
              name: 'uploads-doc',
            },
            {
              path: 'pending-upload',
              component: () => import('@/pages/setup/uploads/list-pending.vue'),
              name: 'pending-upload',
            },
            {
              path: 'treat-upload/:id',
              component: () => import('@/pages/setup/uploads/treat-upload.vue'),
              name: 'treat-upload',
            },
            {
              path: 'all-uploads',
              component: () => import('@/pages/setup/uploads/all-uploads.vue'),
              name: 'uploads',
            },
            {
              path: 'share-upload',
              component: () => import('@/pages/setup/uploads/share-upload.vue'),
              name: 'share-upload-document',
            },
            {
              path: 'primary-folder',
              component: () => import('@/pages/setup/primary-folder/index.vue'),
              name: 'primary-folder',
            },
            {
              path: 'personal-information-form',
              component: () => import('@/pages/setup/personal-information-form.vue'),
              name: 'personal-information-form',
            },
            {
              path: 'emergency-contact',
              component: () => import('@/pages/setup/emergency-contact.vue'),
              name: 'emergency-contact',
            },
            {
              path: 'education',
              component: () => import('@/pages/setup/personal-information-form.vue'),
              name: 'education',
            },
            {
              path: 'documents',
              component: () => import('@/pages/setup/documents/index.vue'),
              name: 'documents',
            },
            {
              path: 'student-program-choices',
              component: () => import('@/pages/setup/student-program-choices.vue'),
              name: 'student-program-choices',
            },

            {
              path: 'student-educational-qualifications',
              name: 'student-educational-qualifications',
              component: () => import('@/pages/setup/student-educational-qualifications.vue'),
            },

            {
              path: 'about-us',
              name: 'about-us',
              component: () => import('@/pages/setup/aboutUs.vue'),
            },
            {
              path: 'files',
              component: () => import('@/pages/setup/files/index.vue'),
              name: 'file',
            },

            {
              path: 'subfolder',
              component: () => import('@/pages/setup/subfolder/index.vue'),
              name: 'subfolder',
            },

            // Basic Entities
            {
              path: 'company',
              component: GenericSetUpComponent,
              props: { api_route: 'companies', item_name: 'company' },
              name: 'company',
            },
            // { path: 'primary-folder', component: GenericSetUpComponent, props: { api_route: 'primary-folders', item_name: 'primary folder' }, name: 'primary-folder' },
            {
              path: 'filetype',
              component: GenericSetUpComponent,
              props: { api_route: 'filetypes', item_name: 'file type' },
              name: 'file-type',
            },
            {
              path: 'filestatus',
              component: GenericSetUpComponent,
              props: { api_route: 'filestatuses', item_name: 'files status' },
              name: 'file-status',
            },
            {
              path: 'audit-action',
              component: GenericSetUpComponent,
              props: { api_route: 'audit-actions', item_name: 'audit action' },
              name: 'audit-action',
            },
            // { path: 'subfolder', component: GenericSetUpComponent, props: { api_route: 'subfolders', item_name: 'subfolder' }, name: 'subfolder' },
            {
              path: 'unit',
              component: GenericSetUpComponent,
              props: { api_route: 'units', item_name: 'unit' },
              name: 'unit',
            },
            {
              path: 'weight',
              component: GenericSetUpComponent,
              props: { api_route: 'weights', item_name: 'weight' },
              name: 'weight',
            },
            {
              path: 'status',
              component: GenericSetUpComponent,
              props: { api_route: 'statuses', item_name: 'status' },
              name: 'status',
            },
            {
              path: 'attribute',
              component: GenericSetUpComponent,
              props: { api_route: 'attributes', item_name: 'attribute' },
              name: 'attribute',
            },
            {
              path: 'bank',
              component: GenericSetUpComponent,
              props: { api_route: 'banks', item_name: 'bank' },
              name: 'bank',
            },
            {
              path: 'vendor-type',
              component: GenericSetUpComponent,
              props: { api_route: 'vendor-types', item_name: 'vendor type' },
              name: 'vendor-type',
            },
            {
              path: 'brand',
              component: GenericSetUpComponent,
              props: { api_route: 'brands', item_name: 'brand' },
              name: 'brand',
            },
            {
              path: 'payment-type',
              component: GenericSetUpComponent,
              props: { api_route: 'payment-types', item_name: 'payment type' },
              name: 'payment-type',
            },
            {
              path: 'designation',
              component: GenericSetUpComponent,
              props: { api_route: 'designations', item_name: 'designation' },
              name: 'designation',
            },
            {
              path: 'payment-terms',
              component: GenericSetUpComponent,
              props: { api_route: 'payment-terms', item_name: 'payment terms' },
              name: 'payment-terms',
            },
            {
              path: 'carrier',
              component: GenericSetUpComponent,
              props: { api_route: 'carriers', item_name: 'carrier' },
              name: 'carrier',
            },
            {
              path: 'title',
              component: GenericSetUpComponent,
              props: { api_route: 'titles', item_name: 'title' },
              name: 'title',
            },
            {
              path: 'role',
              component: GenericSetUpComponent,
              props: { api_route: 'roles', item_name: 'role' },
              name: 'role',
            },
            {
              path: 'manufacturer',
              component: GenericSetUpComponent,
              props: { api_route: 'manufacturers', item_name: 'manufacturer' },
              name: 'manufacturer',
            },
            {
              path: 'adjustment-type',
              component: GenericSetUpComponent,
              props: { api_route: 'adjustment-types', item_name: 'adjustment type' },
              name: 'adjustment-type',
            },
            {
              path: 'discount',
              component: GenericSetUpComponent,
              props: { api_route: 'discounts', item_name: 'discount' },
              name: 'discount',
            },
            {
              path: 'payment-mode',
              component: GenericSetUpComponent,
              props: { api_route: 'payment-modes', item_name: 'payment mode' },
              name: 'payment-mode',
            },
            {
              path: 'customer-type',
              component: GenericSetUpComponent,
              props: { api_route: 'customer-types', item_name: 'customer type' },
              name: 'customer-type',
            },
            {
              path: 'expense-line',
              component: GenericSetUpComponent,
              props: { api_route: 'expense-lines', item_name: 'expense-line' },
              name: 'expense-line',
            },
            {
              path: 'region',
              component: GenericSetUpComponent,
              props: { api_route: 'regions', item_name: 'region' },
              name: 'region',
            },
            {
              path: 'cash-discrepancy',
              component: GenericSetUpComponent,
              props: { api_route: 'cash-discrepancies', item_name: 'cash-discrepancy' },
              name: 'cash-discrepancy',
            },

            {
              path: 'reason',
              component: GenericSetUpComponent,
              props: { api_route: 'reasons', item_name: 'reason' },
              name: 'reason',
            },

            {
              path: 'settle-credit',
              component: GenericSetUpComponent,
              props: { api_route: 'settle-credits', item_name: 'settle-credit' },
              name: 'settle-credit',
            },

            {
              path: 'inflow-status',
              component: GenericSetUpComponent,
              props: { api_route: 'inflow-statuses', item_name: 'inflow-status' },
              name: 'inflow-status',
            },

            {
              path: 'outflow-mode',
              component: GenericSetUpComponent,
              props: { api_route: 'outflow-modes', item_name: 'outflow-mode' },
              name: 'outflow-mode',
            },

            {
              path: 'post-inflow',
              component: GenericSetUpComponent,
              props: { api_route: 'post-inflow', item_name: 'post-inflows' },
              name: 'post-inflow',
            },

            {
              path: 'post-outflow',
              component: GenericSetUpComponent,
              props: { api_route: 'post-outflow', item_name: 'post-outflows' },
              name: 'post-outflow',
            },

            // { path: 'customer', component: GenericSetUpComponent, props: { api_route: 'customers', item_name: 'customer' }, name: 'customer' },

            {
              path: 'service-type',
              component: GenericSetUpComponent,
              props: { api_route: 'service-types', item_name: 'service-type' },
              name: 'service-type',
            },

            {
              path: 'year',
              component: GenericSetUpComponent,
              props: { api_route: 'years', item_name: 'year' },
              name: 'year',
            },
            {
              path: 'school',
              component: GenericSetUpComponent,
              props: { api_route: 'school', item_name: 'school' },
              name: 'school',
            },
            {
              path: 'level-of-study',
              component: GenericSetUpComponent,
              props: { api_route: 'level-of-study', item_name: 'level-of-study' },
              name: 'level-of-study',
            },
            {
              path: 'social-media',
              component: GenericSetUpComponent,
              props: { api_route: 'social-media', item_name: 'social-media' },
              name: 'social-media',
            },
            {
              path: 'file-type',
              component: GenericSetUpComponent,
              props: { api_route: 'file-type', item_name: 'file-type' },
              name: 'file-type',
            },
            // Unique Groups
            // { path: 'warehouse', component: GenericSetUpComponent, props: { api_route: 'warehouses', item_name: 'warehouse' }, name: 'warehouse' },

            // Question Routes
            {
              path: 'tax',
              component: GenericSetUpComponent,
              props: { api_route: 'taxes', item_name: 'tax' },
              name: 'tax',
            },

            // ... other children for the 'setup' route (if any)
          ],
        },

        {
          path: 'account',
          name: 'account',
          children: [
            // Nested children for the 'setup' route
            {
              path: 'group',
              component: () => import('@/pages/accounts/account_group/index.vue'),
              name: 'group',
            },
            {
              path: 'type',
              component: () => import('@/pages/accounts/account_type/index.vue'),
              name: 'type',
            },
            {
              path: 'subtype',
              component: () => import('@/pages/accounts/account_subtype/index.vue'),
              name: 'subtype',
            },
            {
              path: 'accounts',
              component: () => import('@/pages/accounts/account/index.vue'),
              name: 'accounts',
            },

            // {
            //   path: 'journal-type',
            //   component: () => import('@/pages/accounts/journal-type/index.vue'),
            //   name: 'journal-type',
            // },
          ],
        },
        {
          path: 'journal',
          name: 'journal',
          children: [
            // Nested children for the 'setup' route
            {
              path: 'type',
              component: () => import('@/pages/accounts/journal-type/index.vue'),
              name: 'journal-typew',
            },
            {
              path: 'wizard',
              component: () => import('@/pages/journals/journal-wizard.vue'),
              name: 'journal-wizard',
            },
          ],
        },

        {
          path: 'voucher',
          name: 'voucher',
          children: [
            // Nested children for the 'setup' route
            {
              path: 'wizard',
              component: () => import('@/pages/payments/payment-wizard.vue'),
              name: 'voucher-wizard',
            },
          ],
        },
        {
          path: 'approval-setup',
          name: 'approval-setup',
          children: [
            // Nested children for the 'setup' route
            {
              path: 'process-flow',
              component: () => import('@/pages/approvalsetup/process-flow/index.vue'),
              name: 'process-flow',
            },
            {
              path: 'type',
              component: () => import('@/pages/approvalsetup/approval-type/index.vue'),
              name: 'approval-type',
            },
            {
              path: 'process-type',
              component: () => import('@/pages/approvalsetup/process-type/index.vue'),
              name: 'process-type',
            },
            {
              path: 'stage',
              component: () => import('@/pages/approvalsetup/approval-stage/index.vue'),
              name: 'approval-stage',
            },
            {
              path: 'module',
              component: () => import('@/pages/approvalsetup/process-module/index.vue'),
              name: 'process-module',
            },
          ],
        },

        // {
        //   path: 'approvals',
        //   name: 'approvals',
        //   children: [ // Nested children for the 'setup' route
        //     {
        //       path: 'pending-journals',
        //       component: () => import('@/pages/approvals/journal/index.vue'),
        //       name: 'pending-journals',
        //     },

        //   ],
        // },

        {
          path: 'Uploads',
          name: 'release-stock',
          children: [
            {
              path: '/Release/store',
              component: () => import('@/pages/Release/store/release.vue'),
              name: '',
            },
          ],
        },

        {
          path: 'remittance',
          name: 'remittance',
          children: [
            {
              path: 'cashierexpense',
              component: () => import('@/pages/remittance/cashierexpense/index.vue'),
              name: 'cashierexpense',
            },
            {
              path: 'pending-expense',
              component: () => import('@/pages/remittance/cashierexpense/list-pending.vue'),
              name: 'pending-expense',
            },
            {
              path: 'all-expense',
              component: () => import('@/pages/remittance/cashierexpense/all-expense.vue'),
              name: 'expense-order',
            },
            {
              path: 'treat-expense/:no',
              component: () => import('@/pages/remittance/cashierexpense/treat.vue'),
              name: 'treat-expense',
            },
            {
              path: 'print-expense/:no',
              component: () => import('@/pages/remittance/cashierexpense/print.vue'),
              name: 'print-expense',
            },
            {
              path: 'cashierRemittance',
              component: () => import('@/pages/remittance/cashierRemittance/index.vue'),
              name: 'cashierRemittance',
            },
            {
              path: 'pending-remittance',
              component: () => import('@/pages/remittance/cashierRemittance/list-pending.vue'),
              name: 'pending-remittance',
            },
            {
              path: 'all-remittance',
              component: () => import('@/pages/remittance/chiefcashier/all-remittance.vue'),
              name: 'cash-order',
            },
            {
              path: 'treat-remittance/:no',
              component: () => import('@/pages/remittance/cashierRemittance/treat-remittance.vue'),
              name: 'treat-remittance-page',
            },
            {
              path: 'print-remittance/:no',
              component: () => import('@/pages/remittance/cashierRemittance/print.vue'),
              name: 'print-remittance',
            },
            {
              path: 'bankremittance',
              component: () => import('@/pages/remittance/bankremittance/index.vue'),
              name: 'bankremittance',
            },
            {
              path: 'bank-pending',
              component: () => import('@/pages/remittance/bankremittance/list-pending.vue'),
              name: 'pending-bank-remittance',
            },
            {
              path: 'treat-bank/:no',
              component: () => import('@/pages/remittance/bankremittance/treat-bank.vue'),
              name: 'treat-bank-remit',
            },
            {
              path: 'print-bank-remit/:no',
              component: () => import('@/pages/remittance/bankremittance/print.vue'),
              name: 'print-bank-remit',
            },
            {
              path: 'all-bank-remit',
              component: () => import('@/pages/remittance/bankremittance/all-bank-remit.vue'),
              name: 'bank-rmit',
            },
          ],
        },

        {
          path: 'salesorder',
          name: 'salesorder',
          children: [
            {
              path: 'sales',
              component: () => import('@/pages/SalesOrder/sales/index.vue'),
              name: 'salesorder',
            },
            {
              path: 'sales-order-edit/:id',
              component: () => import('@/pages/SalesOrder/sales/edit.vue'),
              name: 'sales-order-edit',
            },

            {
              path: 'all-sales',
              component: () => import('@/pages/SalesOrder/all-sales/all-order.vue'),
              name: 'sales-order',
            },
            {
              path: 'invoice-print/:no',
              component: () => import('@/pages/SalesOrder/sales/print.vue'),
              name: 'salesorder-print',
            },
            {
              path: 'credit-pending',
              component: () => import('@/pages/SalesOrder/credit-pending/list-credit.vue'),
              name: 'salesorder-print2',
            },
            {
              path: 'receipt-pending',
              component: () => import('@/pages/SalesOrder/receipt-pending/list-receipt.vue'),
              name: 'salesorder-print3',
            },

            {
              path: 'awaiting-payment',
              component: () => import('@/pages/SalesOrder/receipt-pending/list-receipt-credit.vue'),
              name: 'salesorder-print4',
            },
            {
              path: 'treat-credit/:no',
              component: () => import('@/pages/SalesOrder/credit-pending/treat-credit.vue'),
              name: 'sales-order-treat-credit',
            },
            {
              path: 'credit-print/:no',
              component: () => import('@/pages/SalesOrder/credit-pending/print.vue'),
              name: 'credit-print',
            },
          ],
        },
        {
          path: 'transactions',
          name: 'transactions',
          children: [
            {
              path: 'post-outflow',
              component: () => import('@/pages/Transactions/post-outflow/index.vue'),
              name: 'transactions',
            },

            {
              path: 'inflow-transactions',
              component: () => import('@/pages/Transactions/inflow-transactions/index.vue'),
              name: 'inflow-transactions',
            },
            {
              path: 'outflow-transactions',
              component: () => import('@/pages/Transactions/outflow-transactions/index.vue'),
              name: 'outflow-transactions',
            },
            {
              path: 'all-outflow',
              component: () => import('@/pages/Transactions/All-Outflow/index.vue'),
              name: 'all-outflow',
            },

            {
              path: 'all-inflow',
              component: () => import('@/pages/Transactions/All-Inflow/index.vue'),
              name: 'all-inflow',
            },

            //  {
            //   path: '/edit-inflow/:id',
            //   component: () => import('@/pages/Transactions/All-Inflow/edit.vue'),
            //   name: 'EditInflow',
            // },
          ],
        },

        {
          path: 'salesManager',
          name: 'sales-orders',
          children: [
            {
              path: '/SalesManager/salesorder',
              component: () => import('@/pages/SalesManager/salesorder/sales.vue'),
              name: 'sales-list',
            },
          ],
        },

        {
          path: 'customers',
          name: 'customers',
          children: [
            {
              path: 'customer',
              component: () => import('@/pages/customers/customer/index.vue'),
              name: 'customer-profile',
            },
            {
              path: 'balance',
              component: () => import('@/pages/customers/customer/balance.vue'),
              name: 'customer-balance',
            },
            {
              path: 'statement/:no',
              component: () => import('@/pages/customers/customer/statement.vue'),
              name: 'customer-statement',
            },
            {
              path: 'credit',
              component: () => import('@/pages/customers/customer/credit-customer.vue'),
              name: 'credit-customer',
            },
          ],
        },

        {
          path: 'release',
          name: 'release',
          children: [
            {
              path: 'release',
              component: () => import('@/pages/Release/store/release.vue'),
              name: 'sales-orders',
            },
            {
              path: 'pending',
              component: () => import('@/pages/Release/store/release-pending.vue'),
              name: 'release-pending',
            },
            {
              path: 'print/:no',
              component: () => import('@/pages/Release/store/release-print.vue'),
              name: 'release-print',
            },
            {
              path: 'print/:no',
              component: () => import('@/pages/Release/store/release-print.vue'),
              name: 'release-print',
            },
            {
              path: 'new-release/:no',
              component: () => import('@/pages/Release/store/new-release.vue'),
              name: 'new-release',
            },
            {
              path: 'all-release',
              component: () => import('@/pages/Release/all-release/all-release.vue'),
              name: 'all-release',
            },
          ],
        },

        {
          path: 'SalesReceipt',
          name: 'salesreceipt',
          children: [
            {
              path: '/SalesReceipt/sales-receipt/:no',
              component: () => import('@/pages/SalesReceipt/sales-receipt/receipt.vue'),
              name: 'sales-receipt',
            },
            {
              path: '/SalesReceipt/new-receipt/:no',
              component: () => import('@/pages/SalesReceipt/new-receipt/new-receipt.vue'),
              name: 'new-receipt',
            },
            {
              path: '/SalesReceipt/new-receipt-credit/:no',
              component: () => import('@/pages/SalesReceipt/new-receipt/new-receipt-credit.vue'),
              name: 'new-receipt-credit',
            },
            {
              path: 'all-receipts',
              component: () => import('@/pages/SalesReceipt/all-receipts/all-receipt.vue'),
              name: 'all-receipts',
            },
            {
              path: 'my-receipts',
              component: () => import('@/pages/SalesReceipt/all-receipts/my-receipts.vue'),
              name: 'my-receipts',
            },
            {
              path: 'sales-receipt-x/:no',
              component: () => import('@/pages/SalesReceipt/sales-receipt/receiptx.vue'),
              name: 'sales-receipt-x',
            },
          ],
        },

        {
          path: 'user-management',
          name: 'user-management',
          children: [
            {
              path: 'users',
              component: () => import('@/pages/user-mgt/users/index.vue'),
              name: 'customer',
            },
            {
              path: 'roles',
              component: () => import('@/pages/user-mgt/roles/index.vue'),
              name: 'roles',
            },
            {
              path: 'permissions',
              component: () => import('@/pages/user-mgt/permissions/index.vue'),
              name: 'permissions',
            },
          ],
        },
        {
          path: 'inventory',
          name: 'inventory',
          children: [
            {
              path: 'items',
              component: () => import('@/pages/inventory/items/index.vue'),
              name: 'items',
            },
            {
              path: 'transfer-orders',
              component: () => import('@/pages/inventory/transfer-orders/index.vue'),
              name: 'transfer-orders',
            },
            {
              path: 'inventory-adjustments',
              component: () => import('@/pages/inventory/inventory-adjustments/index.vue'),
              name: 'inventory-adjustments',
            },
            {
              path: 'store-items',
              component: () => import('@/pages/inventory/store-items/index.vue'),
              name: 'store-items',
            },
            {
              path: 'set-limits',
              component: () => import('@/pages/inventory/set-limits/index.vue'),
              name: 'set-limits',
            },
          ],
        },
        {
          path: 'purchase',
          name: 'purchase',
          children: [
            {
              path: 'vendor',
              component: () => import('@/pages/Purchase/vendor/index.vue'),
              name: 'vendor',
            },

            //    {
            //   path: 'vendor-target',
            //   component: () => import('@/pages/Purchase/vendor-target/index.vue'),
            //   name: 'vendor-target',
            // },
          ],
        },
        {
          path: 'banking',
          name: 'banking',
          children: [
            {
              path: '/banking/all-inflow',
              component: () => import('@/pages/Banking/all-inflow/index.vue'),
              name: 'AllInflow',
            },
            {
              path: '/banking/bank-balance',
              component: () => import('@/pages/Banking/bank-balance/index.vue'),
              name: 'BankBalance',
            },
            {
              path: '/banking/settle-credit',
              component: () => import('@/pages/Banking/settle-credit/index.vue'),
              name: 'SettleCredit',
            },
          ],
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/blank.vue'),
      children: [
        {
          path: 'login',
          component: () => import('@/pages/login.vue'),
        },
        {
          path: 'register',
          component: () => import('@/pages/register.vue'),
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('@/pages/[...error].vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  useAuthStore().checkLocalStorage() // rehydrate from localStorage

  const authStore = useAuthStore()
  const isLoggedIn = authStore.status.loggedIn
  const publicPages = ['/login', '/register'] // Allow access to login/register

  // Check if the user is logged in
  if (!isLoggedIn && !publicPages.includes(to.path)) {
    next('/login') // Redirect to login if not logged in and not a public page
  } else if (isLoggedIn && publicPages.includes(to.path)) {
    next('/') // Redirect to DASH if logged in and a public page
  } else if (isLoggedIn && (to.path === '/dashboard' || to.path === '/')) {
    // Check if user has student role
    const isStudent =
      Array.isArray(authStore.user?.roles) &&
      authStore.user.roles.some(role => role.name.toLowerCase() === 'student' || role.id === 2)

    // Direct students to student-dashboard, others to regular dashboard
    if (isStudent) {
      next('/student-dashboard')
    } else {
      next()
    }
  } else {
    next() // Proceed if logged in or accessing a public page
  }
})

export default router
