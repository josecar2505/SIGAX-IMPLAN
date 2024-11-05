// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlRN-0_ijoxBy6SpnKpgBLaPjtniaS6H8",
  authDomain: "sigax-implan.firebaseapp.com",
  projectId: "sigax-implan",
  storageBucket: "sigax-implan.appspot.com",
  messagingSenderId: "290754446727",
  appId: "1:290754446727:web:7fd55246be6cff60873f22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);