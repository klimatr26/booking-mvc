/**
 * 🏨 Adaptador SOAP para Hotel Boutique Paris
 * Endpoint: http://hotelboutique.runasp.net/WS_Integracion.asmx
 * Namespace: http://hotelparis.com/integracion
 */

import { SoapClient } from './soap-client';
import { buildSoapEnvelope } from '../utils/soap-utils';

// ==================== DTOs ====================

export interface DTO_Room {
  RoomId: number;
  HotelId: number;
  RoomType: string;
  NumberBeds: number;
  OccupancyAdults: number;
  OccupancyChildren: number;
  Board: string;
  Amenities: string;
  BreakfastIncluded: boolean;
  PricePerNight: number;
  Currency: string;
  IsReserved: boolean;
  CreatedAt: Date;
  HotelName: string;
  City: string;
}

export interface DTO_Cotizacion {
  Subtotal: number;
  Impuestos: number;
  Total: number;
  Desglose: string;
}

export interface DTO_PreReserva {
  PreBookingId: string;
  RoomId: number;
  UserId: number;
  ExpiraEn: Date;
}

export interface DTO_Reserva {
  BookingId: string;
  Estado: string;
  MetodoPago: string;
  FechaConfirmacion: Date;
}

// ==================== Adaptador SOAP ====================

export class HotelBoutiqueSoapAdapter extends SoapClient {
  
  /**
   * 1️⃣ Búsqueda unificada por ciudad, fechas, precio, amenities, clasificación
   */
  async buscarServicios(
    ciudad?: string,
    inicio?: Date,
    fin?: Date,
    precioMin?: number,
    precioMax?: number,
    amenities?: string
  ): Promise<DTO_Room[]> {
    const body = `
      <buscarServicios xmlns="http://hotelparis.com/integracion">
        <ciudad>${ciudad || ''}</ciudad>
        <inicio>${inicio ? inicio.toISOString() : ''}</inicio>
        <fin>${fin ? fin.toISOString() : ''}</fin>
        <precioMin>${precioMin || 0}</precioMin>
        <precioMax>${precioMax || 9999}</precioMax>
        <amenities>${amenities || ''}</amenities>
      </buscarServicios>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/buscarServicios"');
    
    const rooms: DTO_Room[] = [];
    const items = xml.getElementsByTagName('DTO_Room');
    
    for (let i = 0; i < items.length; i++) {
      rooms.push(this.parseRoomFromElement(items[i]));
    }
    
    return rooms;
  }

  /**
   * 2️⃣ Devuelve el detalle completo de un servicio/habitación
   */
  async obtenerDetalleServicio(idServicio: number): Promise<DTO_Room> {
    const body = `
      <obtenerDetalleServicio xmlns="http://hotelparis.com/integracion">
        <idServicio>${idServicio}</idServicio>
      </obtenerDetalleServicio>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/obtenerDetalleServicio"');
    
    const resultElement = xml.getElementsByTagName('obtenerDetalleServicioResult')[0];
    if (!resultElement) throw new Error('No se encontró el detalle de la habitación');
    
    return this.parseRoomFromElement(resultElement);
  }

  /**
   * 3️⃣ Verifica la disponibilidad de una habitación por fechas
   */
  async verificarDisponibilidad(
    sku: number,
    inicio: Date,
    fin: Date,
    unidades: number
  ): Promise<boolean> {
    const body = `
      <verificarDisponibilidad xmlns="http://hotelparis.com/integracion">
        <sku>${sku}</sku>
        <inicio>${inicio.toISOString()}</inicio>
        <fin>${fin.toISOString()}</fin>
        <unidades>${unidades}</unidades>
      </verificarDisponibilidad>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/verificarDisponibilidad"');
    
    const result = this.getTagValue(xml, 'verificarDisponibilidadResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 4️⃣ Calcula el total de una reserva (precio + impuestos)
   */
  async cotizarReserva(roomIds: number[]): Promise<DTO_Cotizacion> {
    const roomIdsXml = roomIds.map(id => `<int>${id}</int>`).join('');
    
    const body = `
      <cotizarReserva xmlns="http://hotelparis.com/integracion">
        <roomIds>
          ${roomIdsXml}
        </roomIds>
      </cotizarReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/cotizarReserva"');
    
    return {
      Subtotal: parseFloat(this.getTagValue(xml, 'Subtotal') || '0'),
      Impuestos: parseFloat(this.getTagValue(xml, 'Impuestos') || '0'),
      Total: parseFloat(this.getTagValue(xml, 'Total') || '0'),
      Desglose: this.getTagValue(xml, 'Desglose') || ''
    };
  }

  /**
   * 5️⃣ Crea una pre-reserva temporal que expira automáticamente
   */
  async crearPreReserva(
    roomId: number,
    userId: number,
    holdMinutes: number
  ): Promise<DTO_PreReserva> {
    const body = `
      <crearPreReserva xmlns="http://hotelparis.com/integracion">
        <roomId>${roomId}</roomId>
        <userId>${userId}</userId>
        <holdMinutes>${holdMinutes}</holdMinutes>
      </crearPreReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/crearPreReserva"');
    
    return {
      PreBookingId: this.getTagValue(xml, 'PreBookingId') || '',
      RoomId: parseInt(this.getTagValue(xml, 'RoomId') || '0'),
      UserId: parseInt(this.getTagValue(xml, 'UserId') || '0'),
      ExpiraEn: new Date(this.getTagValue(xml, 'ExpiraEn') || '')
    };
  }

  /**
   * 6️⃣ Confirma una pre-reserva y la convierte en reserva final
   */
  async confirmarReserva(
    preBookingId: string,
    metodoPago: string,
    datosPago: string
  ): Promise<DTO_Reserva> {
    const body = `
      <confirmarReserva xmlns="http://hotelparis.com/integracion">
        <preBookingId>${preBookingId}</preBookingId>
        <metodoPago>${metodoPago}</metodoPago>
        <datosPago>${datosPago}</datosPago>
      </confirmarReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/confirmarReserva"');
    
    return {
      BookingId: this.getTagValue(xml, 'BookingId') || '',
      Estado: this.getTagValue(xml, 'Estado') || '',
      MetodoPago: this.getTagValue(xml, 'MetodoPago') || '',
      FechaConfirmacion: new Date(this.getTagValue(xml, 'FechaConfirmacion') || '')
    };
  }

  /**
   * 7️⃣ Cancela una reserva confirmada con reglas tarifarias
   */
  async cancelarReserva(bookingId: string, motivo: string): Promise<boolean> {
    const body = `
      <cancelarReservaIntegracion xmlns="http://hotelparis.com/integracion">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo}</motivo>
      </cancelarReservaIntegracion>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://hotelparis.com/integracion/cancelarReservaIntegracion"');
    
    const result = this.getTagValue(xml, 'cancelarReservaIntegracionResult');
    return result.toLowerCase() === 'true';
  }

  // ==================== Helpers de Parseo ====================

  private parseRoomFromElement(element: Element | Document): DTO_Room {
    return {
      RoomId: parseInt(this.getTagValue(element, 'RoomId') || '0'),
      HotelId: parseInt(this.getTagValue(element, 'HotelId') || '0'),
      RoomType: this.getTagValue(element, 'RoomType') || '',
      NumberBeds: parseInt(this.getTagValue(element, 'NumberBeds') || '0'),
      OccupancyAdults: parseInt(this.getTagValue(element, 'OccupancyAdults') || '0'),
      OccupancyChildren: parseInt(this.getTagValue(element, 'OccupancyChildren') || '0'),
      Board: this.getTagValue(element, 'Board') || '',
      Amenities: this.getTagValue(element, 'Amenities') || '',
      BreakfastIncluded: this.getTagValue(element, 'BreakfastIncluded')?.toLowerCase() === 'true',
      PricePerNight: parseFloat(this.getTagValue(element, 'PricePerNight') || '0'),
      Currency: this.getTagValue(element, 'Currency') || 'USD',
      IsReserved: this.getTagValue(element, 'IsReserved')?.toLowerCase() === 'true',
      CreatedAt: new Date(this.getTagValue(element, 'CreatedAt') || ''),
      HotelName: this.getTagValue(element, 'HotelName') || '',
      City: this.getTagValue(element, 'City') || ''
    };
  }

  private getTagValue(parent: Element | Document, tagName: string): string {
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? (elements[0].textContent || '') : '';
  }
}
