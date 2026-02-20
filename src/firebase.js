//src/firebase.js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4T595CXa5fNc0Esnk2nrWFYgHKb2tEAI",
  authDomain: "mauli-home-enterior.firebaseapp.com",
  projectId: "mauli-home-enterior",
  storageBucket: "mauli-home-enterior.appspot.com",
  messagingSenderId: "573187988410",
  appId: "1:573187988410:web:45eb85327e7efdff901b83",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export these
export const auth = getAuth(app);
export const db = getFirestore(app);


// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyA4T595CXa5fNc0Esnk2nrWFYgHKb2tEAI",
//   authDomain: "mauli-home-enterior.firebaseapp.com",
//   projectId: "mauli-home-enterior",
//   storageBucket: "mauli-home-enterior.appspot.com", // FIXED
//   messagingSenderId: "573187988410",
//   appId: "1:573187988410:web:45eb85327e7efdff901b83",
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);
