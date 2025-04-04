<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <h2>Audit Trail</h2>
        <v-spacer></v-spacer>
        
        <!-- Enhanced Filter Controls -->
        <v-row>
          <v-col cols="12" sm="3">
            <v-menu
              v-model="fromDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="fromDate"
                  label="From Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  clearable
                  @click:clear="fromDate = null"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker 
                v-model="fromDate" 
                @input="fromDateMenu = false"
                :max="toDate || new Date().toISOString().substr(0, 10)"
              ></v-date-picker>
            </v-menu>
          </v-col>
          
          <v-col cols="12" sm="3">
            <v-menu
              v-model="toDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="toDate"
                  label="To Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  clearable
                  @click:clear="toDate = null"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker 
                v-model="toDate" 
                @input="toDateMenu = false"
                :min="fromDate"
                :max="new Date().toISOString().substr(0, 10)"
              ></v-date-picker>
            </v-menu>
          </v-col>
          
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedAction"
              :items="actionOptions"
              label="Action Type"
              clearable
              multiple
              chips
              small-chips
              deletable-chips
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="3">
            <v-btn 
              color="primary" 
              @click="fetchAuditTrails"
              :disabled="!hasFilters"
              block
              large
            >
              <v-icon left>mdi-magnify</v-icon>
              View Records
            </v-btn>
          </v-col>
        </v-row>

        <!-- Quick Date Range Presets -->
        <v-row class="mt-2">
          <v-col cols="12">
            <div class="text-caption">Quick Date Ranges:</div>
            <v-chip-group>
              <v-chip
                v-for="preset in datePresets"
                :key="preset.label"
                small
                @click="applyDatePreset(preset)"
              >
                {{ preset.label }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="auditTrails"
        :loading="loading"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'show-first-last-page': true
        }"
        class="elevation-1"
      >
        <!-- Table content templates remain the same as previous example -->
        <template v-slot:item.action="{ item }">
          <v-chip :color="getActionColor(item.action)" dark small>
            {{ capitalizeFirstLetter(item.action) }}
          </v-chip>
        </template>

        <template v-slot:item.model_type="{ item }">
          {{ formatModelType(item.model_type) }}
        </template>

        <template v-slot:item.model_data="{ item }">
          <div v-if="item.action === 'create'">
            <div v-for="(value, key) in item.new_values" :key="key">
              <strong>{{ formatFieldName(key) }}:</strong> {{ formatFieldValue(value) }}
            </div>
          </div>
          <div v-else-if="item.action === 'update'">
            <div v-for="(value, key) in item.new_values" :key="key">
              <strong>{{ formatFieldName(key) }}:</strong> 
              <span class="red--text" v-if="item.old_values[key] !== undefined">
                {{ formatFieldValue(item.old_values[key]) }} →
              </span>
              <span class="green--text">{{ formatFieldValue(value) }}</span>
            </div>
          </div>
          <div v-else-if="item.action === 'delete'">
            <div v-for="(value, key) in item.old_values" :key="key">
              <strong>{{ formatFieldName(key) }}:</strong> {{ formatFieldValue(value) }}
            </div>
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template v-slot:no-data>
          <v-alert type="info" class="ma-4">
            No audit records found for the selected filters
          </v-alert>
        </template>

        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { makeApiCall } from '@/services/apiService';
import { formatDate } from '@/types/globalTypes';

export default {
  name: 'AuditTrail',
  data() {
    return {
      loading: false,
      auditTrails: [],
      headers: [
        { text: 'Action', value: 'action', width: '120px' },
        { text: 'Model Type', value: 'model_type', width: '150px' },
        { text: 'Model Data', value: 'model_data' },
        { text: 'User', value: 'user.name', width: '150px' },
        { text: 'Date/Time', value: 'created_at', width: '180px' },
      ],
      
      // Filter controls
      fromDate: null,
      fromDateMenu: false,
      toDate: null,
      toDateMenu: false,
      selectedAction: null,
      actionOptions: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject'],

      // Date range presets
      datePresets: [
        { label: 'Today', days: 0 },
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'This Month', days: 'month' },
        { label: 'Last Month', days: 'last_month' },
        { label: 'This Year', days: 'year' },
      ],

      // Model and field mappings (same as previous example)
      modelTypeMap: {
        'App\\Models\\User': 'User',
        'App\\Models\\Product': 'Product',
        'App\\Models\\Order': 'Order',
      },
      fieldNameMap: {
        'name': 'Name',
        'email': 'Email',
        'title': 'Title',
        'price': 'Price',
        'quantity': 'Quantity',
      }
    };
  },
  computed: {
    hasFilters() {
      return this.fromDate || this.toDate || this.selectedAction?.length > 0;
    }
  },
  methods: {
    async fetchAuditTrails() {
      this.loading = true;
      try {
        const params = {
          from_date: this.fromDate,
          to_date: this.toDate,
          action: this.selectedAction?.join(','), // Handle multiple actions
          with_model: true
        };

        // Remove null/undefined params
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined || params[key] === '') {
            delete params[key];
          }
        });

        const response = await makeApiCall('GET', '/audit-trails', params);
        this.auditTrails = response.data;
      } catch (error) {
        console.error('Error fetching audit trails:', error);
        this.$toast.error('Failed to fetch audit records');
      } finally {
        this.loading = false;
      }
    },
    
    applyDatePreset(preset) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (preset.days === 'month') {
        // First day of current month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.fromDate = firstDay.toISOString().substr(0, 10);
        this.toDate = today.toISOString().substr(0, 10);
      } 
      else if (preset.days === 'last_month') {
        // First and last day of previous month
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.fromDate = firstDayLastMonth.toISOString().substr(0, 10);
        this.toDate = lastDayLastMonth.toISOString().substr(0, 10);
      }
      else if (preset.days === 'year') {
        // First day of current year
        const firstDayYear = new Date(today.getFullYear(), 0, 1);
        this.fromDate = firstDayYear.toISOString().substr(0, 10);
        this.toDate = today.toISOString().substr(0, 10);
      }
      else {
        // Standard day-based presets
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - preset.days);
        this.fromDate = fromDate.toISOString().substr(0, 10);
        this.toDate = today.toISOString().substr(0, 10);
      }
    },

    // Other methods remain the same as previous example
    getActionColor(action) {
      const colors = {
        create: 'green',
        update: 'blue',
        delete: 'red',
        login: 'purple',
        logout: 'deep-purple',
        approve: 'teal',
        reject: 'orange'
      };
      return colors[action.toLowerCase()] || 'grey';
    },
    
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    formatModelType(modelType) {
      return this.modelTypeMap[modelType] || modelType.split('\\').pop();
    },
    
    formatFieldName(fieldName) {
      return this.fieldNameMap[fieldName] || 
        fieldName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },
    
    formatFieldValue(value) {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'object') return JSON.stringify(value);
      return value.toString();
    },
    
    formatDate,
   
  },
  mounted() {
    // Apply default preset (Last 7 Days)
    this.applyDatePreset(this.datePresets[1]);
  }
};
</script>

<style scoped>
.red--text {
  color: #ff5252;
  text-decoration: line-through;
  margin-right: 4px;
}
.green--text {
  color: #4caf50;
}
.v-chip-group {
  margin-top: 4px;
}
</style>
