// Importarea funcției createStore din Vuex pentru a crea un nou magazin de stări
import { createStore } from 'vuex';

const store = createStore({
  state() {
    // Inițializarea stării magazinului Vuex
    // Verifică dacă există un token de utilizator în localStorage la încărcarea aplicației
    const userToken = localStorage.getItem('userToken');
    return {
        token: userToken, // Stocarea token-ului de utilizator, poate fi null dacă nu este autentificat
        isAuthenticated: !!userToken // Determină dacă utilizatorul este autentificat prin prezența token-ului
    };
  },
  getters: {
    // Getter pentru verificarea stării de autentificare
    isAuthenticated(state) {
      return state.isAuthenticated; // Returnează true sau false pe baza stării de autentificare
    }
  },
  mutations: {
    setToken(state, token) {
      // Mutații pentru actualizarea stării magazinului
      state.token = token; // Actualizează token-ul în starea magazinului
      localStorage.setItem('userToken', token); // Salvează noul token în localStorage pentru persistență
    },
    clearToken(state) {
      state.token = null; // Resetează token-ul în starea magazinului
      localStorage.removeItem('userToken'); // Șterge token-ul din localStorage
    },
    setAuthenticationState(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated; // Actualizează starea de autentificare în magazin
    }
  },
  actions: {
    // Acțiuni pentru a efectua operațiuni asincrone sau logica de afaceri
    login({ commit }, token) {
      // Logica de autentificare, primește token-ul ca parametru
      // console.log("Setting token in Vuex:", token); // Adăugați log aici
      commit('setToken', token); // Actualizează starea token-ului prin mutație
      commit('setAuthenticationState', true); // Setează utilizatorul ca autentificat
    },
    logout({ commit }) {
      // Logica de delogare
      commit('clearToken'); // Șterge token-ul curent
      commit('setAuthenticationState', false); // Resetează starea de autentificare
    },
    setAuthentication({ commit }, isAuthenticated) {
      // Permite actualizarea explicită a stării de autentificare
      commit('setAuthenticationState', isAuthenticated); // Actualizează starea de autentificare
    }
  }
});

// Exportă instanța store pentru a fi utilizată în aplicație
export default store;
