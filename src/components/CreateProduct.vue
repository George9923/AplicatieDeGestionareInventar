<template>
  <div class="create-product-container">

    <!-- Titlul formularului pentru crearea unui nou produs -->
    <h1>Create New Product</h1>

    <!-- Formular pentru crearea unui nou produs, prevenind comportamentul default de submit pentru a folosi o metodă Vue -->
    <form @submit.prevent="submitProduct">
    
    <!-- Grup pentru numele produsului -->
      <div class="form-group">
        <label for="name">Product Name:</label>
        <input type="text" id="name" v-model="product.name" required>
      </div>

      <!-- Grup pentru selectarea categoriei produsului -->
      <div class="form-group">
        <label for="category">Category:</label>
        <select id="category" v-model="product.category" required>
          <option value="" disabled>Select category</option>
          <!-- Opțiuni generate dinamic pentru categorii, folosind v-for pentru iterare -->
          <option v-for="category in categories" :key="category.id" :value="category.name">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- Grup pentru descrierea produsului -->
      <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" v-model="product.description" required></textarea>
      </div>

      <!-- Grup pentru prețul produsului -->
      <div class="form-group">
        <label for="price">Price:</label>
        <input type="number" id="price" v-model="product.price" required>
      </div>

      <!-- Buton pentru trimiterea formularului -->
      <button type="submit" class="action-button create-button">Add Product</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Structura de date pentru un nou produs
      product: {
        name: '',
        category: '', // categoria va fi un șir de caractere, nu un obiect
        description: '',
        price: null
      },
      categories: [] // Lista de categorii disponibile pentru selecție
    };
  },
  async created() {
    try {
      // Încarcă categoriile de la server când componenta este creată
      const response = await fetch('http://localhost:3000/api/categories');
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      // Presupune că serverul returnează un array de obiecte cu id și name
      const data = await response.json();
      this.categories = data;  // Salvează categoriile în starea componentei
    } catch (error) {
      alert(error.message);
    }
  },
  methods: {
    async submitProduct() {
      try {
        const productToSubmit = {
          ...this.product,
          price: parseFloat(this.product.price) // Converteste prețul într-un număr
        };

        // Trimiterea datelor produsului la server
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify(productToSubmit)
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You must be logged in to create a product.');
          } else {
            throw new Error('Failed to create product');
          }
        }

        const responseData = await response.json();
        alert(`Product created successfully with the Name: ${responseData.name}`);
        this.$router.push({ name: 'Inventory' }); // Navighează înapoi la inventar
      } catch (error) {
        alert(error.message);
      }
    }
  }
};
</script>

