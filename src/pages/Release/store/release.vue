<template>
  <v-container class="release-form" fluid>
    <v-row>
      <v-col>
        <h2>Release Products</h2>

        <v-form @submit.prevent="fetchReceiptData">
          <v-text-field
            label="Sales Receipt Number"
            v-model="salesReceiptId"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary">Fetch</v-btn>
        </v-form>

        <v-card v-if="receiptData" class="mt-4">
          <v-card-title>
            <h3>Customer Details</h3>
          </v-card-title>
          <v-card-text>
            <p><strong>Customer Name:</strong> {{ receiptData.customer_id }}</p>
            <p><strong>Branch:</strong> {{ receiptData.branch_id }}</p>
            <p><strong>Store:</strong> {{ receiptData.store_id }}</p>
          </v-card-text>

          <v-card-title>
            <h3>Products</h3>
          </v-card-title>
          <v-data-table
            :headers="tableHeaders"
            :items="receiptData.items_sold"
            item-key="id"
          >
            <template v-slot:item.action="{ item }">
              <v-btn @click="releaseItem(item)" color="success">Release</v-btn>
            </template>
          </v-data-table>

          <v-btn @click="releaseAll" color="primary" class="mt-3">Release All</v-btn>
        </v-card>

        <v-alert v-if="message" type="success" dismissible>
          {{ message }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      salesReceiptId: '',
      receiptData: null,
      message: '',
      tableHeaders: [
        { text: 'Product', value: 'product_name' },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Price per Unit', value: 'price_per_unit' },
        { text: 'Total Amount', value: 'total_amount' },
        { text: 'Action', value: 'action', sortable: false }
      ],
      // Dummy data for demonstration purposes
      dummyData: {
        'SR-001': {
          customer_id: 'Abdullahi Gambo',
          branch_id: 'Mararaba Branch',
          store_id: 'Mega Main',
          items_sold: [
            {
              id: 1,
              product_name: 'Viva Plus 180G ',
              quantity: 2,
              price_per_unit: 850,
              total_amount: 1700,
            },
            {
              id: 2,
              product_name: 'Goldenvita 1kg ',
              quantity: 1,
              price_per_unit: 1500,
              total_amount: 1500,
            }
          ]
        },
        'SR-002': {
          customer_id: 'Hajiya Fatima',
          branch_id: 'Mararaba Branch',
          store_id: 'Mega Main',
          items_sold: [
            {
              id: 3,
              product_name: 'Nittol Antiodour 90g x 51',
              quantity: 1,
              price_per_unit: 25,
              total_amount: 25,
            },
            {
              id: 4,
              product_name: 'Chic Soap 1kg',
              quantity: 3,
              price_per_unit: 500,
              total_amount: 1500,
            },
            {
              id: 5,
              product_name: 'Goldenvita 1kg',
              quantity: 3,
              price_per_unit: 6000,
              total_amount: 18000,
            },
            {
              id: 6,
              product_name: 'Dangote Flour 1kg',
              quantity: 3,
              price_per_unit: 5000,
              total_amount: 1500,
            }
          ]
        }
      }
    };
  },
  methods: {
    // Fetch receipt data based on the sales receipt ID (using dummy data)
    fetchReceiptData() {
      if (this.dummyData[this.salesReceiptId]) {
        this.receiptData = this.dummyData[this.salesReceiptId];
        this.message = '';
      } else {
        this.message = 'Please enter a valid Sales Receipt Number.';
      }
    },
    // Release individual item
    releaseItem(item) {
      // Remove the item from the items_sold array
      this.receiptData.items_sold = this.receiptData.items_sold.filter(i => i.id !== item.id);
      this.message = `${item.product_name} has been deducted from inventory.`;
    },
    // Release all items in the receipt
    releaseAll() {
      this.receiptData.items_sold = [];
      this.message = 'All items have been deducted from inventory.';
    }
  }
};
</script>

<style scoped>
.release-form {
  margin: 20px;
}
</style>
