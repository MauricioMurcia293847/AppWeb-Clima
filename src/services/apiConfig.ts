// URL base de la API propia, compartida entre servicios del cliente.
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // En Vercel la API vive en el mismo dominio que el frontend publicado.
  return import.meta.env.PROD ? window.location.origin : "http://127.0.0.1:3001";
}
