import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext"; // Add this

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider> {/* Add this */}
        <App />
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>
);