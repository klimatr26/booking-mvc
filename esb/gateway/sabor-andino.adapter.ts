// Sabor Andino Restaurant SOAP Adapter
// Servicio 12 - Restaurante
// Endpoint: https://saborandino.runasp.net/Ws_IntegracionRestaurante.asmx
// WSDL: https://saborandino.runasp.net/Ws_IntegracionRestaurante.asmx?wsdl

import { SoapClient } from './soap-client';
import type { EndpointConfig } from '../utils/config';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Servicio DTO (usado en buscarServicios y obtenerDetalleServicio)
 */
export interface ServicioDTO {
  IdServicio: number;
  Nombre: string;
  Tipo: string;
  Ciudad: string;
  Precio: string;
  Clasificacion: string;
  Descripcion: string;
  Politicas: string;
  Reglas: string;
  ImagenURL: string;
}

/**
 * Item de detalle para cotización
 */
export interface ItemDetalle {
  Nombre: string;
  Cantidad: number;
  PrecioUnitario: number;
  PrecioTotal: number;
}

/**
 * Cotización Response
 */
export interface CotizacionDTO {
  Subtotal: number;
  Impuestos: number;
  Total: number;
  Breakdown: ItemDetalle[];
}

/**
 * Pre-Reserva Response
 */
export interface PreReservaDTO {
  PreBookingId: string;
  ExpiraEn: string; // DateTime
}

/**
 * Confirmación Response
 */
export interface ConfirmacionDTO {
  BookingId: string;
  Estado: string;
}

/**
 * Cancelación Response
 */
export interface CancelacionDTO {
  Cancelacion: boolean;
}

/**
 * Disponibilidad Response
 */
export interface DisponibilidadDTO {
  Disponible: boolean;
}

// ============================================================================
// SOAP Adapter
// ============================================================================

export class SaborAndinoSoapAdapter extends SoapClient {
  constructor(endpoint: EndpointConfig) {
    super(endpoint);
  }

  /**
   * Construir sobre SOAP (ASMX style)
   */
  private buildSoapEnvelope(body: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * 1. BUSCAR SERVICIOS
   */
  async buscarServicios(filtros: string): Promise<ServicioDTO[]> {
    const soapBody = `
      <buscarServicios xmlns="http://SaborAndino.ec/Integracion">
        <filtros>${filtros}</filtros>
      </buscarServicios>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/buscarServicios'
    );

    return this.parseServiciosList(response);
  }

  /**
   * 2. OBTENER DETALLE SERVICIO
   */
  async obtenerDetalleServicio(idServicio: number): Promise<ServicioDTO> {
    const soapBody = `
      <obtenerDetalleServicio xmlns="http://SaborAndino.ec/Integracion">
        <idServicio>${idServicio}</idServicio>
      </obtenerDetalleServicio>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/obtenerDetalleServicio'
    );

    return this.parseServicio(response);
  }

  /**
   * 3. VERIFICAR DISPONIBILIDAD
   */
  async verificarDisponibilidad(
    sku: number,
    inicio: Date,
    fin: Date,
    unidades: number
  ): Promise<DisponibilidadDTO> {
    const soapBody = `
      <verificarDisponibilidad xmlns="http://SaborAndino.ec/Integracion">
        <sku>${sku}</sku>
        <inicio>${inicio.toISOString()}</inicio>
        <fin>${fin.toISOString()}</fin>
        <unidades>${unidades}</unidades>
      </verificarDisponibilidad>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/verificarDisponibilidad'
    );

    return this.parseDisponibilidad(response);
  }

  /**
   * 4. COTIZAR RESERVA
   */
  async cotizarReserva(items: ItemDetalle[]): Promise<CotizacionDTO> {
    const itemsXml = items.map(item => `
      <ItemDetalle>
        <Nombre>${item.Nombre}</Nombre>
        <Cantidad>${item.Cantidad}</Cantidad>
        <PrecioUnitario>${item.PrecioUnitario}</PrecioUnitario>
        <PrecioTotal>${item.PrecioTotal}</PrecioTotal>
      </ItemDetalle>
    `).join('');

    const soapBody = `
      <cotizarReserva xmlns="http://SaborAndino.ec/Integracion">
        <items>
          ${itemsXml}
        </items>
      </cotizarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/cotizarReserva'
    );

    return this.parseCotizacion(response);
  }

  /**
   * 5. CREAR PRE-RESERVA
   */
  async crearPreReserva(
    itinerario: string,
    cliente: string,
    holdMinutes: number,
    idemKey: string
  ): Promise<PreReservaDTO> {
    const soapBody = `
      <crearPreReserva xmlns="http://SaborAndino.ec/Integracion">
        <itinerario>${itinerario}</itinerario>
        <cliente>${cliente}</cliente>
        <holdMinutes>${holdMinutes}</holdMinutes>
        <idemKey>${idemKey}</idemKey>
      </crearPreReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/crearPreReserva'
    );

    return this.parsePreReserva(response);
  }

  /**
   * 6. CONFIRMAR RESERVA
   */
  async confirmarReserva(
    preBookingId: string,
    metodoPago: string,
    datosPago: string
  ): Promise<ConfirmacionDTO> {
    const soapBody = `
      <confirmarReserva xmlns="http://SaborAndino.ec/Integracion">
        <preBookingId>${preBookingId}</preBookingId>
        <metodoPago>${metodoPago}</metodoPago>
        <datosPago>${datosPago}</datosPago>
      </confirmarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/confirmarReserva'
    );

    return this.parseConfirmacion(response);
  }

  /**
   * 7. CANCELAR RESERVA
   */
  async cancelarReservaIntegracion(
    bookingId: string,
    motivo: string
  ): Promise<CancelacionDTO> {
    const soapBody = `
      <cancelarReservaIntegracion xmlns="http://SaborAndino.ec/Integracion">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo}</motivo>
      </cancelarReservaIntegracion>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(
      envelope,
      'http://SaborAndino.ec/Integracion/cancelarReservaIntegracion'
    );

    return this.parseCancelacion(response);
  }

  // ============================================================================
  // Parser Methods
  // ============================================================================

  /**
   * Parsear lista de servicios
   */
  private parseServiciosList(doc: Document): ServicioDTO[] {
    const servicios: ServicioDTO[] = [];
    const servicioElements = doc.getElementsByTagName('ServicioDTO');

    for (let i = 0; i < servicioElements.length; i++) {
      const element = servicioElements[i];
      servicios.push(this.parseServicioElement(element));
    }

    return servicios;
  }

  /**
   * Parsear un servicio individual
   */
  private parseServicio(doc: Document): ServicioDTO {
    const resultElement = doc.getElementsByTagName('obtenerDetalleServicioResult')[0];
    if (!resultElement) {
      throw new Error('No se encontró obtenerDetalleServicioResult en la respuesta');
    }
    return this.parseServicioElement(resultElement);
  }

  /**
   * Parsear elemento de servicio
   */
  private parseServicioElement(element: Element): ServicioDTO {
    return {
      IdServicio: parseInt(this.getTextContent(element, 'IdServicio') || '0'),
      Nombre: this.getTextContent(element, 'Nombre') || '',
      Tipo: this.getTextContent(element, 'Tipo') || '',
      Ciudad: this.getTextContent(element, 'Ciudad') || '',
      Precio: this.getTextContent(element, 'Precio') || '',
      Clasificacion: this.getTextContent(element, 'Clasificacion') || '',
      Descripcion: this.getTextContent(element, 'Descripcion') || '',
      Politicas: this.getTextContent(element, 'Politicas') || '',
      Reglas: this.getTextContent(element, 'Reglas') || '',
      ImagenURL: this.getTextContent(element, 'ImagenURL') || ''
    };
  }

  /**
   * Parsear disponibilidad
   */
  private parseDisponibilidad(doc: Document): DisponibilidadDTO {
    const disponible = this.getTextContent(doc.documentElement, 'Disponible');
    return {
      Disponible: disponible?.toLowerCase() === 'true'
    };
  }

  /**
   * Parsear cotización
   */
  private parseCotizacion(doc: Document): CotizacionDTO {
    const resultElement = doc.getElementsByTagName('cotizarReservaResult')[0];
    if (!resultElement) {
      throw new Error('No se encontró cotizarReservaResult en la respuesta');
    }

    const breakdown: ItemDetalle[] = [];
    const breakdownElement = resultElement.getElementsByTagName('Breakdown')[0];
    if (breakdownElement) {
      const itemElements = breakdownElement.getElementsByTagName('ItemDetalle');
      for (let i = 0; i < itemElements.length; i++) {
        const item = itemElements[i];
        breakdown.push({
          Nombre: this.getTextContent(item, 'Nombre') || '',
          Cantidad: parseInt(this.getTextContent(item, 'Cantidad') || '0'),
          PrecioUnitario: parseFloat(this.getTextContent(item, 'PrecioUnitario') || '0'),
          PrecioTotal: parseFloat(this.getTextContent(item, 'PrecioTotal') || '0')
        });
      }
    }

    return {
      Subtotal: parseFloat(this.getTextContent(resultElement, 'Subtotal') || '0'),
      Impuestos: parseFloat(this.getTextContent(resultElement, 'Impuestos') || '0'),
      Total: parseFloat(this.getTextContent(resultElement, 'Total') || '0'),
      Breakdown: breakdown
    };
  }

  /**
   * Parsear pre-reserva
   */
  private parsePreReserva(doc: Document): PreReservaDTO {
    const resultElement = doc.getElementsByTagName('crearPreReservaResult')[0];
    if (!resultElement) {
      throw new Error('No se encontró crearPreReservaResult en la respuesta');
    }

    return {
      PreBookingId: this.getTextContent(resultElement, 'PreBookingId') || '',
      ExpiraEn: this.getTextContent(resultElement, 'ExpiraEn') || ''
    };
  }

  /**
   * Parsear confirmación
   */
  private parseConfirmacion(doc: Document): ConfirmacionDTO {
    const resultElement = doc.getElementsByTagName('confirmarReservaResult')[0];
    if (!resultElement) {
      throw new Error('No se encontró confirmarReservaResult en la respuesta');
    }

    return {
      BookingId: this.getTextContent(resultElement, 'BookingId') || '',
      Estado: this.getTextContent(resultElement, 'Estado') || ''
    };
  }

  /**
   * Parsear cancelación
   */
  private parseCancelacion(doc: Document): CancelacionDTO {
    const resultElement = doc.getElementsByTagName('cancelarReservaIntegracionResult')[0];
    if (!resultElement) {
      throw new Error('No se encontró cancelarReservaIntegracionResult en la respuesta');
    }

    const cancelacion = this.getTextContent(resultElement, 'Cancelacion');
    return {
      Cancelacion: cancelacion?.toLowerCase() === 'true'
    };
  }

  /**
   * Obtener contenido de texto de un elemento hijo
   */
  private getTextContent(parent: Element, tagName: string): string | undefined {
    const elements = parent.getElementsByTagName(tagName);
    if (elements.length > 0) {
      const text = elements[0].textContent;
      return text && text.trim() !== '' ? text : undefined;
    }
    return undefined;
  }
}
