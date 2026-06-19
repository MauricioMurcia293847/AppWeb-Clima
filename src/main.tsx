import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Buscamos el contenedor definido en index.html.
const rootElement = document.getElementById("root");

// Si el contenedor no existe, detenemos la app con un error claro.
if (!rootElement) {
  throw new Error("No se encontro el elemento raiz de la aplicacion.");
}

// StrictMode ayuda a detectar patrones problematicos durante el desarrollo.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
