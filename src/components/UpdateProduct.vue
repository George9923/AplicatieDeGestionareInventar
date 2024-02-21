<template>
  <div class="update-product-container">
    <!-- Titlul formularului de actualizare a produsului -->
    <h1 class="update-product-title">Update Product</h1>
    <!-- Formularul pentru actualizare, care previne comportamentul default la submit pentru a folosi o metodă Vue -->
    <form @submit.prevent="submitUpdate">
      <!-- Grup de input pentru numele produsului -->
      <div class="form-group-update">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="product.name" required>
      </div>
      <!-- Grup de select pentru categoria produsului, cu opțiuni generate dinamic -->
      <div class="form-group-update">
        <label for="category">Category:</label>
          <select id="category" v-model="product.category" required>
            <option value="" disabled>Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
            </option>
          </select>
        </div>
      <!-- Grup de textarea pentru descrierea produsului -->
      <div class="form-group-update">
        <label for="description">Description:</label>
        <textarea id="description" v-model="product.description" required></textarea>
      </div>
      <!-- Grup de input pentru prețul produsului -->
      <div class="form-group-update">
        <label for="price">Price:</label>
        <input type="number" id="price" v-model="product.price" required>
      </div>
      <button type="submit" class="action-button update-button">Update Product</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Inițializează structura de date pentru produs, preluând id-ul din ruta curentă
      product: {
        id: this.$route.params.productId,
        name: '',
        category: '',
        description: '',
        price: null
      },
      categories: [] // se adaugă lista de categorii pentru dropdown
    };
  },
  async created() {
    try {
      // Solicită și încarcă detaliile produsului existent
      const productResponse = await fetch(`http://localhost:3000/api/products/${this.product.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (!productResponse.ok) {
        throw new Error('Failed to fetch the product details.');
      }
      const productData = await productResponse.json();
      this.product = { ...this.product, ...productData };

      // Solicită și încarcă lista de categorii pentru dropdown
      const categoryResponse = await fetch('http://localhost:3000/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Necesită autentificare
        }
      });
      if (!categoryResponse.ok) {
        throw new Error('Failed to load categories');
      }
      const categoryData = await categoryResponse.json();
      this.categories = categoryData; // presupunem că API-ul returnează un array de obiecte
    } catch (error) {
      alert(error.message);
      this.$router.push({ name: 'Inventory' });
    }
  },
  methods: {
    async submitUpdate() {
      try {
        // Pregătește produsul pentru actualizare, asigurându-te că prețul este un număr
        const productToUpdate = {
          ...this.product,
          category: this.product.category, // folosește valoarea selectată din dropdown
          price: parseFloat(this.product.price) // convertește prețul într-un număr, dacă este necesar
        };

        // Execută cererea de actualizare a produsului
        const response = await fetch(`http://localhost:3000/api/products/${this.product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify(productToUpdate)
        });

        if (!response.ok) {
          if (response.status === 401) {
          // Gestionare erori specifice și afișare mesaj corespunzător
            throw new Error('You must be logged in to update the product.');
          }
          const resData = await response.json();
          throw new Error(resData.error || 'Failed to update the product.');
        }

        alert('Product updated successfully.'); // Confirmare actualizare
        this.$router.push({ name: 'Inventory' }); // Redirecționează la pagina de inventar
      } catch (error) {
        alert(error.message); // Afișează eroarea
      }
    }
  }
};
</script>
