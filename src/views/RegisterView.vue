<template>
  <div class="form-container">
    <h1 class="view-title">Register</h1>

    <!-- Afișează mesajul de eroare în cazul în care există o problemă la înregistrare -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    
    <!-- Formularul de înregistrare -->
    <form @submit.prevent="register" class="form">
      <input type="email" v-model="email" placeholder="Email" required class="input-field">
      <input type="password" v-model="password" placeholder="Password" required class="input-field">
      <button type="submit" class="action-button register-button">Register</button>
    </form>
  </div>
</template>


<script>
export default {
  data() {
    return {
      email: '', // Stocarea adresei de email introduse de utilizator
      password: '', // Stocarea parolei introduse de utilizator
      errorMessage: '', // Mesaj pentru erori de autentificare
    };
  },
  methods: {
      async register() {

        // Validare adresa de email și parolă înainte de înregistrare
        if (!this.isValidEmail(this.email)) {
          this.errorMessage = 'Adresa de email nu este validă.';
          return;
        }
        if (!this.isStrongPassword(this.password)) {
          this.errorMessage = 'Parola nu este suficient de puternică.';
          return;
        }

        // Trimite o cerere de înregistrare către server
        try {
          const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });

          if (!response.ok) {
          // În caz de eroare, încearcă să obții mesajul de eroare din răspunsul serverului
            try {
              const errorData = await response.json();
              if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
              // Presupunând că serverul trimite erorile într-un format standardizat
                this.errorMessage = errorData.errors.map(e => e.msg).join(', ');
              } else {
              // Presupunând că serverul trimite un mesaj de eroare simplu
                this.errorMessage = errorData.message || 'A apărut o eroare necunoscută.';
              }
            } catch {
            // Dacă nu există un răspuns JSON sau nu poate fi parsat, afișează un mesaj generic
              this.errorMessage = 'A apărut o eroare la comunicarea cu serverul.';
            }
          } else {
          // Înregistrarea a reușit, redirecționează către pagina de login
            this.$router.push('/login');
          }
        } catch (error) {
        // Gestionarea erorilor de rețea sau a altor probleme neașteptate
          this.errorMessage = 'Conexiunea la server a eșuat sau a apărut o eroare necunoscută.';
        }
      },
    // Verifică dacă adresa de email este validă folosind o expresie regulată  
    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    // Verifică dacă parola este destul de puternică
    isStrongPassword(password) {
      const isLongEnough = password.length >= 6;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /\W/.test(password);
      return isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }
  }
};
</script>