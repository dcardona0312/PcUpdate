import { initializeApp } from "firebase/app";

// Importa los servicios que necesitas para Ionic/React
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// ¡AÑADIR ESTE IMPORT!
import { getStorage } from "firebase/storage"; 

// (Opcional) Analytics si lo quieres usar, aunque generalmente no se usa en apps de prueba
import { getAnalytics } from "firebase/analytics"; 

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUoyuEPTOxYvVEm2F6XGmzS-qrdpEhmCw",
  authDomain: "infopc-ff6ab.firebaseapp.com",
  projectId: "infopc-ff6ab",
  storageBucket: "infopc-ff6ab.firebasestorage.app",
  messagingSenderId: "422263020988",
  appId: "1:422263020988:web:7dd9eb8e671ffa2774dfb9",
  measurementId: "G-ND74D6ZV98"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Inicializa y exporta los servicios
const auth = getAuth(app); // Inicializa Autenticación
const db = getFirestore(app); // Inicializa Base de Datos
// ¡AÑADIR ESTA INICIALIZACIÓN!
const storage = getStorage(app); 
const analytics = getAnalytics(app); // Inicializa Analytics

// Exporta todos los servicios para poder importarlos fácilmente en tus componentes
// ¡AÑADIR 'storage' A LAS EXPORTACIONES!
export { app, auth, db, storage, analytics }; 
