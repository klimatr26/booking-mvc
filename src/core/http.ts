import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080", // ESB/gateway
  timeout: 10000,
});

// Ejemplo de SOAP (cuando toque): enviar XML al ESB que devuelve JSON
export async function soapCall(endpoint: string, xmlEnvelope: string) {
  const { data } = await http.post(endpoint, xmlEnvelope, {
    headers: { "Content-Type": "text/xml;charset=UTF-8" },
  });
  return data; // idealmente ESB lo normaliza; si no, parseas XML aquí
}
