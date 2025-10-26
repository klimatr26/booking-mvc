/**
 * Hotel UIO SOAP Service Adapter
 * Service 16 - Hotel Service with Invoicing
 * Endpoint: http://hoteluio.runasp.net/Services/HotelService.asmx
 * Namespace: http://mio.hotel/booking
 * Type: ASMX Hotel Service
 * Operations: 8 (includes obtenerFactura)
 */

import { SoapClient } from './soap-client';
import type { EndpointConfig } from '../utils/config';

// ==================== DTOs ====================

export interface HotelDTO {
  IdHotel: number;
  Nombre: string;
  Ciudad: string;
  Direccion: string;
  Estrellas: number;
  Telefono: string;
  Correo: string;
  Descripcion: string;
  Imagen: string;
}

export interface FacturaDTO {
  IdFactura: number;
  NumeroFactura: string;
  FechaEmision: string; // DateTime ISO
  Subtotal: number;
  Impuestos: number;
  Total: number;
  XmlSRI: string; // XML para SRI (Servicio de Rentas Internas Ecuador)
}

// ==================== Adapter ====================

export class HotelUIOSoapAdapter extends SoapClient {
  constructor(endpoint: EndpointConfig) {
    super(endpoint);
  }

  /**
   * Build SOAP 1.1 Envelope (ASMX style)
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
   * 1. buscarServicios - Busca hoteles por nombre/ciudad, precio o fecha
   */
  async buscarServicios(
    filtro?: string,
    precio?: number,
    fecha?: string
  ): Promise<HotelDTO[]> {
    const soapBody = `
      <buscarServicios xmlns="http://mio.hotel/booking">
        ${filtro ? `<filtro>${filtro}</filtro>` : '<filtro xsi:nil="true" />'}
        ${precio !== undefined ? `<precio>${precio}</precio>` : '<precio xsi:nil="true" />'}
        ${fecha ? `<fecha>${fecha}</fecha>` : '<fecha xsi:nil="true" />'}
      </buscarServicios>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/buscarServicios');
    return this.parseHoteles(response);
  }

  /**
   * 2. obtenerDetalleServicio - Obtiene el detalle completo de un hotel
   */
  async obtenerDetalleServicio(idHotel: number): Promise<HotelDTO> {
    const soapBody = `
      <obtenerDetalleServicio xmlns="http://mio.hotel/booking">
        <idHotel>${idHotel}</idHotel>
      </obtenerDetalleServicio>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/obtenerDetalleServicio');
    return this.parseHotel(response);
  }

  /**
   * 3. verificarDisponibilidad - Verifica disponibilidad real de una habitación
   */
  async verificarDisponibilidad(
    idHabitacion: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<boolean> {
    const soapBody = `
      <verificarDisponibilidad xmlns="http://mio.hotel/booking">
        <idHabitacion>${idHabitacion}</idHabitacion>
        <fechaInicio>${fechaInicio}</fechaInicio>
        <fechaFin>${fechaFin}</fechaFin>
      </verificarDisponibilidad>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/verificarDisponibilidad');
    
    const result = this.getNodeText(response, 'verificarDisponibilidadResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 4. cotizarReserva - Calcula el costo total de la estancia con impuestos
   */
  async cotizarReserva(
    idHabitacion: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<number> {
    const soapBody = `
      <cotizarReserva xmlns="http://mio.hotel/booking">
        <idHabitacion>${idHabitacion}</idHabitacion>
        <fechaInicio>${fechaInicio}</fechaInicio>
        <fechaFin>${fechaFin}</fechaFin>
      </cotizarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/cotizarReserva');
    
    const result = this.getNodeText(response, 'cotizarReservaResult');
    return parseFloat(result) || 0;
  }

  /**
   * 5. crearPreReserva - Crea una pre-reserva (estado PENDIENTE) y bloquea disponibilidad
   */
  async crearPreReserva(
    idCliente: number,
    idHabitacion: number,
    fechaCheckin: string,
    fechaCheckout: string
  ): Promise<number> {
    const soapBody = `
      <crearPreReserva xmlns="http://mio.hotel/booking">
        <idCliente>${idCliente}</idCliente>
        <idHabitacion>${idHabitacion}</idHabitacion>
        <fechaCheckin>${fechaCheckin}</fechaCheckin>
        <fechaCheckout>${fechaCheckout}</fechaCheckout>
      </crearPreReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/crearPreReserva');
    
    const result = this.getNodeText(response, 'crearPreReservaResult');
    return parseInt(result) || 0;
  }

  /**
   * 6. confirmarReserva - Confirma una reserva y registra el pago y factura
   */
  async confirmarReserva(
    idReserva: number,
    idMetodoPago: number
  ): Promise<boolean> {
    const soapBody = `
      <confirmarReserva xmlns="http://mio.hotel/booking">
        <idReserva>${idReserva}</idReserva>
        <idMetodoPago>${idMetodoPago}</idMetodoPago>
      </confirmarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/confirmarReserva');
    
    const result = this.getNodeText(response, 'confirmarReservaResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 7. obtenerFactura - Obtiene la factura asociada a una reserva (UNIQUE FEATURE!)
   */
  async obtenerFactura(idReserva: number): Promise<FacturaDTO> {
    const soapBody = `
      <obtenerFactura xmlns="http://mio.hotel/booking">
        <idReserva>${idReserva}</idReserva>
      </obtenerFactura>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/obtenerFactura');
    return this.parseFactura(response);
  }

  /**
   * 8. cancelarReservaIntegracion - Cancela una reserva y libera las fechas
   */
  async cancelarReservaIntegracion(
    bookingId: number,
    motivo: string
  ): Promise<boolean> {
    const soapBody = `
      <cancelarReservaIntegracion xmlns="http://mio.hotel/booking">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo || ''}</motivo>
      </cancelarReservaIntegracion>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://mio.hotel/booking/cancelarReservaIntegracion');
    
    const result = this.getNodeText(response, 'cancelarReservaIntegracionResult');
    return result.toLowerCase() === 'true';
  }

  // ==================== Parsers ====================

  private parseHoteles(doc: Document): HotelDTO[] {
    const hoteles: HotelDTO[] = [];
    const nodes = doc.getElementsByTagName('Hotel');

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      hoteles.push({
        IdHotel: parseInt(this.getChildText(node, 'IdHotel')) || 0,
        Nombre: this.getChildText(node, 'Nombre'),
        Ciudad: this.getChildText(node, 'Ciudad'),
        Direccion: this.getChildText(node, 'Direccion'),
        Estrellas: parseInt(this.getChildText(node, 'Estrellas')) || 0,
        Telefono: this.getChildText(node, 'Telefono'),
        Correo: this.getChildText(node, 'Correo'),
        Descripcion: this.getChildText(node, 'Descripcion'),
        Imagen: this.getChildText(node, 'Imagen')
      });
    }

    return hoteles;
  }

  private parseHotel(doc: Document): HotelDTO {
    return {
      IdHotel: parseInt(this.getNodeText(doc, 'IdHotel')) || 0,
      Nombre: this.getNodeText(doc, 'Nombre'),
      Ciudad: this.getNodeText(doc, 'Ciudad'),
      Direccion: this.getNodeText(doc, 'Direccion'),
      Estrellas: parseInt(this.getNodeText(doc, 'Estrellas')) || 0,
      Telefono: this.getNodeText(doc, 'Telefono'),
      Correo: this.getNodeText(doc, 'Correo'),
      Descripcion: this.getNodeText(doc, 'Descripcion'),
      Imagen: this.getNodeText(doc, 'Imagen')
    };
  }

  private parseFactura(doc: Document): FacturaDTO {
    return {
      IdFactura: parseInt(this.getNodeText(doc, 'IdFactura')) || 0,
      NumeroFactura: this.getNodeText(doc, 'NumeroFactura'),
      FechaEmision: this.getNodeText(doc, 'FechaEmision'),
      Subtotal: parseFloat(this.getNodeText(doc, 'Subtotal')) || 0,
      Impuestos: parseFloat(this.getNodeText(doc, 'Impuestos')) || 0,
      Total: parseFloat(this.getNodeText(doc, 'Total')) || 0,
      XmlSRI: this.getNodeText(doc, 'XmlSRI')
    };
  }

  /**
   * Helper: Get text content from child node
   */
  private getChildText(parent: Element, tagName: string): string {
    const child = parent.getElementsByTagName(tagName)[0];
    return child?.textContent || '';
  }
}
