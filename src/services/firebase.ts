import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCeSecsa0DyP7yH3woXDKXK77dgCaxlXb4",
  authDomain: "cold-email-98515.firebaseapp.com",
  projectId: "cold-email-98515",
  storageBucket: "cold-email-98515.firebasestorage.app",
  messagingSenderId: "278220204935",
  appId: "1:278220204935:web:38e09e6716a68d6724c122"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
