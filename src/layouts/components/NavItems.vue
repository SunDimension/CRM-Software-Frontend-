<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import NavGroupCustom from '@/layouts/components/NavGroupCustom.vue'
import type { PropType } from 'vue'

interface NavigationItem {
  title: string
  icon: string
  children: Array<{
    title: string
    link?: string
    icon?: string
    children?: Array<{ title: string; link: string }>
  }>
  isStudent?: boolean
  isAdmin?: boolean
}

const props = defineProps({
  nav_obj: {
    type: Object as PropType<NavigationItem>,
    required: true,
  },
})

const authStore = useAuthStore()
const router = useRouter()

// Debug info
onMounted(() => {
  console.log('Auth Store User:', authStore.user)
  console.log('User Roles:', authStore.user?.roles)
})

// Check if the current user is a student
const isStudent = computed(() => {
  const roles = authStore.user?.roles || []
  return Array.isArray(roles) &&
    roles.some(role => {
      const roleName = role?.name?.toLowerCase()
      return roleName === 'student' || role?.id === 2
    })
})

// Filter nav items based on role
const filteredNavigationLinks = computed(() => {
  return navigationLinks.filter(item =>
    isStudent.value ? item.isStudent : item.isAdmin
  )
})

// Unwrapped version of dashboard route
const dashboardRoute = computed(() =>
  isStudent.value ? '/student-dashboard' : '/dashboard'
)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const navigationLinks: NavigationItem[] = [
  // ... same navigation links as before ...
  {
    title: 'Storage & Optimization',
    icon: 'ri-exchange-dollar-line',
    isAdmin: true,
    children: [
      {
        title: 'Storage',
        icon: 'ri-exchange-dollar-line',
        children: [
          { title: 'Company', link: '/setup/company' },
          { title: 'Primary Folder', link: '/setup/primary-folder' },
          { title: 'Sub Folder', link: '/setup/subfolder' },
          { title: 'Upload', link: '/setup/uploads' },
          { title: 'Manage Files', link: '/setup/all-uploads' },
        ],
      },
    ],
  },
  {
    title: 'Document Mgt',
    icon: 'ri-file-text-line',
    isAdmin: true,
    children: [
      { title: 'Document Review', link: '/setup/pending-upload' },
    ],
  },
  {
    title: 'Doc Collaboration',
    icon: 'ri-share-line',
    isAdmin: true,
    children: [
      { title: 'Document Sharing', link: '/setup/share-upload' },
    ],
  },
  {
    title: 'Admin Tools',
    icon: 'ri-tools-line',
    isAdmin: true,
    children: [
      { title: 'User Roles', link: '/customers/customer' },
      { title: 'Manage Users', link: '/coming-soon' },
      { title: 'Recycle Bin', link: '/coming-soon' },
    ],
  },
  {
    title: 'Reports',
    icon: 'ri-bar-chart-line',
    isAdmin: true,
    children: [
      { title: 'Report', link: '/coming-soon' },
    ],
  },
  {
    title: 'Audit Trail',
    icon: 'ri-history-line',
    isAdmin: true,
    children: [
      {
        title: 'Audit Trail',
        link: '/audit-trails',
      },
    ]
  },
  {
    title: 'System Setup',
    icon: 'ri-settings-2-line',
    isAdmin: true,
    children: [
      { title: 'Audit Action', link: '/setup/audit-action' },
      { title: 'File Type', link: '/setup/filetype' },
      { title: 'File Status', link: '/setup/filestatus' },
      { title: 'Year', link: '/setup/year' },
    ],
  },
  {
    title: 'View Application',
    icon: 'ri-file-list-line',
    isStudent: true,
    children: [
      { title: 'Application', link: '/student/application' },
    ]
  },
  {
    title: 'Document Attached',
    icon: 'ri-attachment-line',
    isStudent: true,
    children: [
      { title: 'Documents', link: '/student/documents' },
    ]
  },
  {
    title: 'Payment Details',
    icon: 'ri-money-dollar-circle-line',
    isStudent: true,
    children: [
      { title: 'Payment Details', link: '/student/payments' },
    ]
  },
  {
    title: 'Terms & Privacy Policy',
    icon: 'ri-shield-check-line',
    isStudent: true,
    children: [
      { title: 'Terms & Privacy', link: '/student/terms' },
    ]
  },
  {
    title: 'Edit Profile',
    icon: 'ri-user-settings-line',
    isStudent: true,
    children: [
      { title: 'Profile', link: '/student/profile' },
    ]
  },
]
</script>

<template>
  <div class="no-print">
    <VerticalNavLink
      :item="{
        title: 'Dashboard',
        to: dashboardRoute,
        icon: 'ri-home-smile-line',
      }"
    />

    <NavGroupCustom
      v-for="navGroup in filteredNavigationLinks"
      :key="navGroup.title"
      :nav_obj="navGroup"
    />

    <VerticalNavLink
      :item="{
        title: 'Log Out',
        icon: 'ri-login-box-line',
      }"
      @click="handleLogout"
    />
  </div>
</template>
