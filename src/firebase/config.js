import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAHbkCdeck5ukecr57Ihhy-ge157qORsqk",
  authDomain: "proiect-tic-dbbf1.firebaseapp.com",
  projectId: "proiect-tic-dbbf1",
  storageBucket: "proiect-tic-dbbf1.appspot.com",
  messagingSenderId: "293252342080",
  appId: "1:293252342080:web:f377540ee212ee1b461aa5",
  measurementId: "G-6N7CJE7MQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
