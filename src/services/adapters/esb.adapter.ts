import type { FilterState, SearchResult } from "../../models/types";
import { soapCall } from "../../core/http";
import { mockSearch } from "./mock.adapter";

/**
 * Cuando tengas el ESB, cambia ENDPOINT y mapea el response.
 */
const ENDPOINT = "/esb/booking/search";

export async function esbSearch(query: string, filters?: FilterState): Promise<SearchResult[]> {
  // Envelope de ejemplo (ajusta nombres/namespaces según tu WSDL)
  const envelope = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:book="http://your-esb/booking">
    <soapenv:Header/>
    <soapenv:Body>
      <book:SearchRequest>
        <book:query>${escapeXml(query)}</book:query>
        <book:kinds>${(filters?.kinds || []).join(",")}</book:kinds>
        <book:priceMin>${filters?.priceMin ?? ""}</book:priceMin>
        <book:priceMax>${filters?.priceMax ?? ""}</book:priceMax>
        <book:city>${filters?.city ?? ""}</book:city>
        <book:ratingMin>${filters?.ratingMin ?? ""}</book:ratingMin>
        <book:sort>${filters?.sort ?? ""}</book:sort>
      </book:SearchRequest>
    </soapenv:Body>
  </soapenv:Envelope>`.trim();

  try {
    // Llamada SOAP (por ahora ignoramos la respuesta para evitar TS "unused")
    await soapCall(ENDPOINT, envelope);

    // TODO: cuando el ESB esté listo: parsear XML y mapear a SearchResult[]
    // const xml = await soapCall(ENDPOINT, envelope);
    // return parseSearchXml(xml);

    // Temporal (sin backend): devolvemos mock
    return mockSearch(query);
  } catch {
    return mockSearch(query);
  }
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;"
  }[c]!));
}
