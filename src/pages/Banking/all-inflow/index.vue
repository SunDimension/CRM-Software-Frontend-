<template>
  <v-container>
    <v-form>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            :items="banks"
            v-model="selectedBank"
            label="Select Bank"
            outlined
          ></v-select>
        </v-col>

      <!-- Date From -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="dateFrom"
                label="Date From*"
                type="date"
                required
              ></v-text-field>
            </v-col>

       <v-col cols="12" md="6">
              <v-text-field
                v-model="dateTo"
                label="Date To*"
                type="date"
                required
              ></v-text-field>
            </v-col>

        <v-col cols="12">
          <v-btn @click="fetchTransactions" color="primary">Show Transactions</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-data-table :headers="headers" :items="transactions">
      <template v-slot:items="props">
        <td>{{ props.item.date }}</td>
        <td>{{ props.item.amount }}</td>
        <td>{{ props.item.description }}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      banks: ['Moniepoint', 'UBA', 'First Bank'], // Sample bank list
      selectedBank: null,
      dateFrom: null,
      dateTo: null,
      menuFrom: false,
      menuTo: false,
      transactions: [],
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Amount', value: 'amount' },
        { text: 'Description', value: 'description' }
      ]
    };
  },
  methods: {
    fetchTransactions() {
      if (this.selectedBank && this.dateFrom && this.dateTo) {
        // Mock API call to fetch transactions based on selectedBank, dateFrom, and dateTo
        // Replace this with your actual API call
        this.transactions = [
          { date: '2024-09-01', amount: 'N100,000', description: 'Credit deposit' },
          { date: '2024-09-02', amount: 'N2000,000', description: 'Credit repayment' },
           { date: '2024-09-02', amount: 'N800,000', description: 'Credit deposit' },
          { date: '2024-09-04', amount: 'N200,000', description: 'Credit repayment' },
           { date: '2024-09-05', amount: 'N100,000', description: 'Credit deposit' },
          { date: '2024-09-05', amount: 'N150,000', description: 'Credit deposit' }
        ];
      } else {
        alert('Please select bank and dates.');
      }
    }
  }
};
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
