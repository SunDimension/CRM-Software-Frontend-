<template>
  <div class="grid-container">
    <div class="grid-item">
      <label for="bank-select">Select a Bank:</label>
      <div class="select-wrapper">
        <select id="bank-select" v-model="selectedBank" @change="updateBalance" class="large-select">
          <option v-for="bank in banks" :key="bank.id" :value="bank.id">
            {{ bank.name }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="grid-item" v-if="selectedBank">
      <h3>Bank Balance:</h3>
      <p>{{ bankBalance }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedBank: null,
      banks: [
        { id: 1, name: 'Moniepoint', balance: 1000000 },
        { id: 2, name: 'UBA', balance: 2020000 },
        { id: 3, name: 'First Bank', balance: 4300000 },
         { id: 4, name: 'Fidelity Bank', balance: 30000000 },
          { id: 5, name: 'Fcmb Bank', balance: 73000000 },
           { id: 6, name: 'Stanbic Bank', balance: 48000000 },
      ],
      bankBalance: null
    };
  },
  methods: {
    updateBalance() {
      const bank = this.banks.find(b => b.id === this.selectedBank);
      if (bank) {
        this.bankBalance = bank.balance;
      } else {
        this.bankBalance = null;
      }
    }
  }
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns of equal width */
  gap: 20px; /* Space between grid items */
  align-items: center; /* Align items vertically centered */
}

.grid-item {
  padding: 10px;
  border: 1px solid #ddd; /* Optional: border around grid items */
  border-radius: 5px; /* Optional: rounded corners */
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%; /* Full width of the container */
}

.large-select {
  width: 100%; /* Full width of the container */
  height: 40px; /* Height of the select element */
  font-size: 16px; /* Font size inside the select element */
  padding-right: 30px; /* Space for the arrow */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

.large-select::-ms-expand {
  display: none; /* Hide default arrow in IE */
}

.select-wrapper::after {
  content: '▼'; /* Custom arrow symbol */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Allow clicks to pass through the arrow */
  font-size: 18px; /* Size of the custom arrow */
  color: #333; /* Color of the custom arrow */
}
</style>
