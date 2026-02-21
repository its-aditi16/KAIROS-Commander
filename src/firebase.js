// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9ANocdKzMWyLcLooUdci6xB3WpJVPk_M",
    authDomain: "kairos-52061.firebaseapp.com",
    projectId: "kairos-52061",
    storageBucket: "kairos-52061.firebasestorage.app",
    messagingSenderId: "134513131899",
    appId: "1:134513131899:web:4124b9eb0db8097e353dde",
    measurementId: "G-T4LD3S1E31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);