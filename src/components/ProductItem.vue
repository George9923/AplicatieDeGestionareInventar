<template>
  <div v-if="product" class="product-view-container">   
      <!-- Afișează detaliile produsului -->      
      <h1 class="product-view-title">{{ product.name }}</h1>
      <p class="product-view-category">Category: {{ product.category }}</p>
      <p class="product-view-description">Description: {{ product.description }}</p>
      <p class="product-view-price">Price: ${{ product.price }}</p>
      
      <!-- Încărcarea fișierului -->
      <input type="file" id="file-upload" class="file-upload" @change="handleFileUpload" />
      <label for="file-upload" class="action-button file-upload-button">Încărcare Fișier</label>
    
      <!-- Afișează istoricul încărcărilor, dacă există -->
        <div v-if="uploadHistory.length" class="upload-history-container">
              <h2>Istoric Încărcări</h2>
              <table class="upload-history-table">
                <thead>
                  <tr>
                    <th>Uploaded On</th>
                    <th>File</th>
                    <th>File Size</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(file, index) in uploadHistory" :key="index">
                    <td>{{ file.uploadedOn }}</td>
                    <td>{{ file.name }}</td>
                    <td>{{ file.size }}</td>
                    <td>
                      <!-- Buton pentru descărcarea fiecărui fișier -->
                      <button @click="downloadFile(file)">Download</button>
                    </td>
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
      product: null, // Inițializarea informațiilor produsului ca fiind null
      uploadHistory: [], // Lista inițială goală pentru istoricul încărcărilor
      selectedFile: null // Fișierul selectat pentru încărcare este inițial null
    };
  },
  async created() {
    // Când componenta este creată, preia detaliile produsului și istoricul încărcărilor
    const productId = this.$route.params.id;
    await this.fetchProductDetails(productId);
    await this.fetchUploadHistory();
  },
  methods: {
    async fetchProductDetails(productId) {
      // Solicită detaliile produsului de la server
      try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        this.product = await response.json();
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    },
    // Actualizează fișierul selectat atunci când un utilizator alege un fișier
    handleFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadFile() {
      // Încarcă fișierul selectat pe server
      if (!this.selectedFile) {
        alert('Please select a file to upload.');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${this.$store.state.authToken}` // Presupunând că ai implementat autentificarea
          }
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        this.uploadHistory.push(result.file); // Adaugă fișierul încărcat în istoric
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    },
    // Descarcă fișierul selectat
    async downloadFile(file) {
      window.open(`http://localhost:3000/download/${file.filename}`);
    },
    // Preia istoricul încărcărilor de la server
    async fetchUploadHistory() {
      try {
        const response = await fetch('http://localhost:3000/api/uploadHistory', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.$store.state.authToken}` // Utilizează tokenul JWT pentru autentificare
          }
        });

        if (response.ok) {
          this.uploadHistory = await response.json(); // Actualizează istoricul încărcărilor în starea componentei
        } else {
          throw new Error('Failed to fetch upload history');
        }
      } catch (error) {
        console.error('Error fetching upload history:', error);
      }
    }
  }
};
</script>