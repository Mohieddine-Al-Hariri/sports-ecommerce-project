// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_Key,
  authDomain: FIREBASE_AUTHDOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_API_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};
// const firebaseConfig = {
//   apiKey: "AIzaSyBaxvmojc3pZB6QXUcSpSPTOdC-x07Nxi8",
//   authDomain: "sportsecommerce-proj-try1-gu.firebaseapp.com",
//   projectId: "sportsecommerce-proj-try1-gu",
//   storageBucket: "sportsecommerce-proj-try1-gu.appspot.com",
//   messagingSenderId: "633746400501",
//   appId: "1:633746400501:web:97f45bd2546dedcd7a91bc",
//   measurementId: "G-PBKZZ0XZBK"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);