<template>
  <div class="number-picker-container">
    <!-- Button for picking a number and making a POST request -->
    <button @click="pickNumberAndPost" class="number-picker-button">Pick a Number</button>
    
    <!-- Conditionally render the users list if the response was successful -->
    <div v-if="users.length > 0">
      <div v-for="user in users" :key="user.id">{{ user.nume }}</div>
    </div>
    
    <!-- Display error message if there is an error -->
    <div v-if="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pickedNumber: null,
      users: [],
      error: false,
      errorMessage: ''
    };
  },
  methods: {
    pickNumberAndPost() {
      // Pick a random number between 1 and 9
      this.pickedNumber = Math.floor(Math.random() * 9) + 1;

      // POST request to the backend with the picked number
        axios.post('http://localhost:3000/api/process-number', { number: this.pickedNumber })
        .then(response => {
          // If the number is 9, the response will contain the users
          this.users = response.data;
          this.error = false;
          this.errorMessage = '';
        })
        .catch(error => {
          // If the number is less than 9, the backend will respond with an error
          this.error = true;
          this.errorMessage = error.response.data.error || 'An error occurred.';
          this.users = []; // Reset the users array on error
        });
    }
  }
};
</script>
