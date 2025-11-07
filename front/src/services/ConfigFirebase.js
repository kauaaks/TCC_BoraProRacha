// services/ConfigFirebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1LkHVfVQJCduSmzkN_feSMxdfOImX0hk",
  authDomain: "boraproracha-7b226.firebaseapp.com",
  projectId: "boraproracha-7b226",
  storageBucket: "boraproracha-7b226.firebasestorage.app",
  messagingSenderId: "300815071427",
  appId: "1:300815071427:web:cb8f474404351ed8150a76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
