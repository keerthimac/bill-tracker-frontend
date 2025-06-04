import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Import Provider
import { store } from "./app/store"; // Import your store
import App from "./App";
import "./index.css"; // Or your global stylesheet

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* Wrap App with Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
