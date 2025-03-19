import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS once
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Add this line for Bootstrap JS
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);