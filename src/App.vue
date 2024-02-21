<template>
  <div id="app">
    <nav class="navbar-container">
      <!-- Afișează întotdeauna legătura către pagina "Inventory" -->
      <router-link to="/inventory">Inventory</router-link>

      <!-- Afișează întotdeauna legătura către pagina "Inventory" -->
      <router-link to="/create-category">Test</router-link>

      <!-- Pentru utilizatorii neautentificați -->
      <!-- Afișează legăturile către "Register" și "Login" doar dacă utilizatorul nu este autentificat -->
      <router-link to="/register" v-if="!isAuthenticated">Register</router-link>
      <router-link to="/login" v-if="!isAuthenticated">Login</router-link>

      <!-- Pentru utilizatorii autentificați -->
      <!-- Afișează butonul "Logout" doar dacă utilizatorul este autentificat -->
      <button v-if="isAuthenticated" @click="logout" class="logout-button">Logout</button>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['isAuthenticated'])  // Utilizăm getter-ul din Vuex pentru a verifica starea de autentificare
  },
  methods: {
    ...mapActions({
      performLogout: 'logout'
    }),
    logout() {
      // Apelăm acțiunea de logout din Vuex și redirecționăm către pagina de login după logout
      this.performLogout().then(() => {
        this.$router.push('/login'); // Redirect către pagina de login după logout
      });
    }
  }
};
</script>