<template>
  <div class="form-container">
    <div class="form-group">
      <label for="customer-select">Select a Customer:</label>
      <div class="select-wrapper">
        <select id="customer-select" v-model="selectedCustomerId" @change="updateCustomerDetails" class="large-select">
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
        <span class="custom-arrow">&#9660;</span>
      </div>
    </div>
    
    <div v-if="selectedCustomer">
      <h3>Customer Details:</h3>
      <table class="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Credit Limit</th>
            <th>Current Balance</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ selectedCustomer.name }}</td>
            <td>{{ selectedCustomer.creditLimit }}</td>
            <td>{{ selectedCustomer.currentBalance }}</td>
            <td>Settled</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedCustomerId: null,
      customers: [
        { id: 1, name: 'Alhaji Abbas Hamza', creditLimit: 50000, currentBalance: 15000 },
        { id: 2, name: 'Mr. Abdullahi Adamu', creditLimit: 32000, currentBalance: 5000 },
        { id: 3, name: 'Mallam Yusuf Kabiru', creditLimit: 75000, currentBalance: 2500 }
      ],
      selectedCustomer: null
    };
  },
  methods: {
    updateCustomerDetails() {
      this.selectedCustomer = this.customers.find(customer => customer.id === this.selectedCustomerId);
    }
  }
};
</script>

<style scoped>
.form-container {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.large-select {
  width: 100%;
  height: 40px;
  font-size: 16px;
  padding-right: 40px; /* Extra space for the custom arrow */
  box-sizing: border-box;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px; /* Position the arrow */
  transform: translateY(-50%);
  border: solid black;
  border-width: 0 3px 3px 3px; /* Arrow shape */
  border-color: black transparent transparent transparent;
  width: 0;
  height: 0;
  pointer-events: none; /* Allow clicks to pass through the arrow */
}

.custom-arrow {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 18px; /* Size of the arrow */
  color: #333; /* Color of the arrow */
  pointer-events: none; /* Allow clicks to pass through */
}
.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-table th,
.customer-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.customer-table th {
  background-color: #f4f4f4;
}

.customer-table tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
