<template>
  <div>
    <h1 class="view-title">Login</h1>

    <!-- Afișează mesajul de eroare în caz de autentificare eșuată -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    
    <!-- Formularul de login -->
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required>
      <input type="password" v-model="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '', // Stocarea adresei de email introduse de utilizator
      password: '', // Stocarea parolei introduse de utilizator
      errorMessage: '', // Stocarea mesajului de eroare în caz de autentificare eșuată
    };
  },
  methods: {
    ...mapActions(['login', 'setAuthentication']), // Importăm acțiunile 'login' și 'setAuthentication' din Vuex

    async login() {
      try {

        // Trimite o cerere de autentificare către server
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        // În caz de eroare, extrage mesajul de eroare din răspunsul serverului
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to login');
        }

        // În caz de autentificare reușită, obține token-ul de autentificare din răspuns
        const data = await response.json();
        // console.log("Token received from server:", data.token); 
        localStorage.setItem('userToken', data.token);
        // console.log("Token stored in LocalStorage:", localStorage.getItem('userToken')); 

        // Actualizează starea de autentificare în Vuex pentru a marca utilizatorul ca autentificat
        this.setAuthentication(true);

        // Redirecționează utilizatorul către pagina de inventar
        this.$router.push('/inventory');
        
        // În caz de eroare, afișează mesajul de eroare și înregistrează eroarea în consolă
      } catch (error) {
        this.errorMessage = error.message;
        console.error("Error logging in", error);
      }
    }
  }
};
</script>
