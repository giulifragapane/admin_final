import axios from "axios";

/**
 * Desarrollo: VITE_API_BASE=/backend → proxy de Vite → VITE_API_URL
 * Producción: VITE_API_BASE o VITE_API_URL apuntan al backend real
 */
const baseURL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers["content-type"] ?? "");

    if (contentType.includes("text/html")) {
      return Promise.reject(
        new Error(
          "El servidor devolvió HTML en lugar de datos. Cerrá otras pestañas del admin, reiniciá `pnpm dev` y abrí solo la URL que muestra la terminal.",
        ),
      );
    }

    return response;
  },
  (error) => {
    const detail = error.response?.data?.detail;
    const attemptedUrl = error.config
      ? `${error.config.baseURL ?? ""}${error.config.url ?? ""}`
      : "";

    const message =
      detail ??
      (error.code === "ERR_NETWORK"
        ? `No se pudo conectar con el servidor${attemptedUrl ? ` (${attemptedUrl})` : ""}. Verificá que el backend esté en ${import.meta.env.VITE_API_URL ?? "http://localhost:8000"} y que uses la URL exacta de \`pnpm dev\`.`
        : error.message) ??
      "Error inesperado en la petición";

    return Promise.reject(new Error(message));
  },
);
