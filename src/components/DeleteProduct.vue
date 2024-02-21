<template>
  <div class="delete-product-container">
    <!-- Titlul și întrebarea de confirmare pentru ștergerea produsului -->
    <h1>Delete Product</h1>
    <p>Are you sure you want to delete this product?</p>
    <!-- Buton pentru confirmarea ștergerii -->
    <button @click="confirmDelete" class="delete-confirm">Yes, delete it</button>
    <!-- Buton pentru anularea acțiunii și revenirea la pagina anterioară -->
    <button @click="cancelDelete" class="delete-cancel">No, go back</button>
  </div>
</template>

<script>
export default {
  props: {
    productId: String // Proprietate pentru a primi id-ul produsului care trebuie șters
  },
  methods: {
        async confirmDelete() {
        try {
        // Execută cererea de ștergere către server pentru produsul specificat
            const response = await fetch(`http://localhost:3000/api/products/${this.productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
            });

            if (!response.ok) {
            if (response.status === 401) {
            // Tratează cazul în care utilizatorul nu este autentificat
                throw new Error('Failed to delete the product. You must be logged in.');
            }

            try {
                const resData = await response.json();
                throw new Error(resData.error || 'Failed to delete the product.');
            } catch (jsonParseError) {
            // Tratează cazul în care răspunsul nu este în format JSON valid
                throw new Error('Failed to delete the product. Server response is not in JSON format.');
            }
            }
            // Confirmarea ștergerii produsului și navigarea către pagina de inventar
            alert('Product deleted successfully.');
            this.$router.push({ name: 'Inventory' });
        } catch (error) {
            // Afișează un mesaj de eroare dacă ștergerea a eșuat
            alert(error.message);
        }
        },
    cancelDelete() {
      // Navighează înapoi la pagina de inventar fără a șterge produsul
      this.$router.push({ name: 'Inventory' });
    }
  }
};
</script>

