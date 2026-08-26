import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";

const pulishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if(!pulishableKey){
  throw new Error("Missing publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.");
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={pulishableKey} afterSignOutUrl="/login">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
