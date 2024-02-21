<template>
  <div class="content-container">
    <!-- Container pentru inventar și filtre -->

    <div class="inventory-page">
      <!-- Container pentru inventar -->
      <div class="inventory-container">
        <div class="inventory-header">
          <h1 class="inventory-title">Inventory</h1>

          <!-- Meniu derulant pentru sortare -->

          <select 
            v-model="sortKey" 
            @change="sortProducts" 
            class="sort-button"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>

          <!-- Buton pentru crearea unui produs nou -->

          <button 
            @click="createNewProduct" 
            class="action-button-inventory create-button-inventory"
          >
            Create New Product
          </button>
        </div>
        
        <ul class="product-list">

          <!-- Loop pentru afișarea produselor -->
          <li 
            v-for="product in paginatedProducts" 
            :key="product.id" 
            class="product-item"
          >
            <h2 class="product-title">{{ product.name }}</h2>
            <p>Category: {{ product.category }}</p>
            <p>Description: {{ product.description }}</p>
            <p>Price: ${{ product.price }}</p>
            <div class="product-actions">

                <!-- Buton pentru vizualizarea unui produs -->
              <button 
                @click="viewProduct(product.id)" 
                class="action-button view-button"
              >
                View Product
              </button>


                <!-- Buton pentru actualizarea unui produs -->
              <button 
                @click="updateProduct(product.id)" 
                class="action-button update-button-inventory"
              >
                Update Product
              </button>


                <!-- Buton pentru ștergerea unui produs -->
              <button 
                @click="goToDeleteProduct(product.id)" 
                class="action-button delete-button"
              >
                Delete Product
              </button>
            </div>
          </li>
        </ul>

        <!-- Controale pentru paginare -->
        <div class="pagination-controls">

          <!-- Buton pentru pagina anterioară -->
          <button 
            @click="prevPage" 
            class="pagination-button"
            :disabled="currentPage <= 1"
          >
            Previous
          </button>

          <!-- Buton pentru pagina următoare -->
          <button 
            @click="nextPage" 
            class="pagination-button"
            :disabled="!hasNextPage"
          >
            Next
          </button>
        </div>
      </div>
      
      <!-- Container pentru filtrele de categorii -->
      <div class="filters-container">
        <h3>Categories</h3>

        <!-- Loop pentru afișarea categoriilor ca casete de bifat -->
        <div v-for="category in categories" :key="category" class="category-filter">
          <input 
            type="checkbox" 
            :id="category" 
            :value="category" 
            v-model="selectedCategories"
          />
          <label :for="category">{{ category }}</label>
        </div>
      </div>

    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      products: [], // Stocarea listei de produse
      categories: [], // Stocarea categoriilor disponibile
      selectedCategories: [], // Stocarea categoriilor selectate de utilizator
      sortKey: 'name', // Stocarea cheii de sortare implicită
      currentPage: 1, // Stocarea paginii curente
      productsPerPage: 10, // Numărul de produse afișate pe pagină
    };
  },
  computed: {

    // Returnează o copie sortată a listei de produse în funcție de cheia de sortare
    sortedProducts() {
      return [...this.products].sort((a, b) => {
        if (this.sortKey === 'name') {
          return a.name.localeCompare(b.name);
        } else if (this.sortKey === 'price') {
          return a.price - b.price;
        }
      });
    },

    // Returnează produsele filtrate în funcție de categoriile selectate
    filteredProducts() {
      if (this.selectedCategories.length === 0) {
        return this.sortedProducts;
      }
      return this.sortedProducts.filter(product =>
        this.selectedCategories.includes(product.category)
      );
    },

    // Returnează o pagină de produse bazată pe pagina curentă și numărul de produse per pagină
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.productsPerPage;
      const end = start + this.productsPerPage;
      return this.filteredProducts.slice(start, end);
    },

    // Verifică dacă există o pagină următoare
    hasNextPage() {
      return this.currentPage * this.productsPerPage < this.filteredProducts.length;
    },
    
    // Verifică dacă există o pagină anterioară
      hasPrevPage() {
    // Află dacă nu ești pe prima pagină
    return this.currentPage > 1;
    }
  },
  methods: {
    sortProducts() {
      // Funcție pentru a gestiona sortarea produselor (logica în computed 'sortedProducts')
    },

    // Funcție pentru a naviga la pagina anterioară
    prevPage() {
      if (this.currentPage) this.currentPage--;
    },

    // Funcție pentru a naviga la pagina următoare
    nextPage() {
      if (this.hasNextPage) this.currentPage++;
    },

    // Funcție pentru a naviga la vizualizarea unui produs specific
    viewProduct(productId) {
      this.$router.push({ name: 'ProductView', params: { id: productId } });
    },

    // Funcție pentru a crea un produs nou
    createNewProduct() {
      this.$router.push({ name: 'CreateProduct' });
    },

    // Funcție pentru a actualiza un produs specific
    updateProduct(productId) {
      this.$router.push({ name: 'UpdateProduct', params: { productId: productId } });
    },

    // Funcție pentru a naviga la ștergerea unui produs specific
    goToDeleteProduct(productId) {
      this.$router.push({ name: 'DeleteProduct', params: { productId: productId } });
    },

    // Funcție asincronă pentru a obține categoriile disponibile dintr-o sursă externă
    async fetchCategories() {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        this.categories = data.map(cat => cat.name);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
  },

  // Funcție asincronă care se execută la crearea componentei
  // pentru a obține lista de produse și categorii  
  async created() {
    try {
      const productResponse = await fetch('http://localhost:3000/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (!productResponse.ok) {
        throw new Error('Failed to fetch products');
      }
      this.products = await productResponse.json();
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    await this.fetchCategories();
  }
};
</script>