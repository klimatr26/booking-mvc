/**
 * ✈️ Adaptador SOAP para SkyAndes - Servicio de Vuelos
 * Endpoint: http://skyandesintegracion.runasp.net/WS_Integracion.asmx
 * Namespace: http://skyandes.com/integracion/
 */

import { SoapClient } from './soap-client';
import { buildSoapEnvelope } from '../utils/soap-utils';

// ==================== DTOs ====================

export interface DTO_Flight {
  FlightId: number;
  OriginId: number;
  DestinationId: number;
  Airline: string;
  FlightNumber: string;
  DepartureTime: Date;
  ArrivalTime: Date;
  Duration: string;
  CancellationPolicy: string;
  CabinClass: string;
  AircraftId: number;
}

export interface DTO_PreReserva {
  PreBookingId: number;
  ExpiraEn: Date;
}

export interface DTO_Reserva {
  BookingId: number;
  Estado: string;
}

export interface DTO_Cotizacion {
  Total: number;
  Impuestos: number;
  BasePrice: number;
  PromoDiscount: number;
}

// ==================== Adaptador SOAP ====================

export class SkyAndesFlightSoapAdapter extends SoapClient {
  
  /**
   * 1️⃣ Busca vuelos disponibles por origen, destino, fecha y cabina
   */
  async buscarServicios(
    originId: number,
    destinationId: number,
    fecha: Date,
    cabinClass: string
  ): Promise<DTO_Flight[]> {
    const body = `
      <buscarServicios xmlns="http://skyandes.com/integracion/">
        <OriginId>${originId}</OriginId>
        <DestinationId>${destinationId}</DestinationId>
        <Fecha>${fecha.toISOString()}</Fecha>
        <CabinClass>${cabinClass}</CabinClass>
      </buscarServicios>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/buscarServicios"');
    
    const flights: DTO_Flight[] = [];
    const items = xml.getElementsByTagName('DTOFlight');
    
    for (let i = 0; i < items.length; i++) {
      flights.push(this.parseFlightFromElement(items[i]));
    }
    
    return flights;
  }

  /**
   * 2️⃣ Obtiene el detalle completo de un vuelo
   */
  async obtenerDetalleServicio(idServicio: number): Promise<DTO_Flight> {
    const body = `
      <obtenerDetalleServicio xmlns="http://skyandes.com/integracion/">
        <idServicio>${idServicio}</idServicio>
      </obtenerDetalleServicio>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/obtenerDetalleServicio"');
    
    const resultElement = xml.getElementsByTagName('obtenerDetalleServicioResult')[0];
    if (!resultElement) throw new Error('No se encontró el resultado del servicio');
    
    return this.parseFlightFromElement(resultElement);
  }

  /**
   * 3️⃣ Valida la disponibilidad de asientos para un vuelo
   */
  async verificarDisponibilidad(
    sku: number,
    inicio: Date,
    fin: Date,
    unidades: number
  ): Promise<boolean> {
    const body = `
      <verificarDisponibilidad xmlns="http://skyandes.com/integracion/">
        <sku>${sku}</sku>
        <inicio>${inicio.toISOString()}</inicio>
        <fin>${fin.toISOString()}</fin>
        <unidades>${unidades}</unidades>
      </verificarDisponibilidad>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/verificarDisponibilidad"');
    
    const result = this.getTagValue(xml, 'verificarDisponibilidadResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 4️⃣ Calcula el total estimado (impuestos y promo) para una reserva
   */
  async cotizarReserva(flightId: number, passengers: number): Promise<DTO_Cotizacion> {
    const body = `
      <cotizarReserva xmlns="http://skyandes.com/integracion/">
        <flightId>${flightId}</flightId>
        <passengers>${passengers}</passengers>
      </cotizarReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/cotizarReserva"');
    
    return {
      Total: parseFloat(this.getTagValue(xml, 'Total') || '0'),
      Impuestos: parseFloat(this.getTagValue(xml, 'Impuestos') || '0'),
      BasePrice: parseFloat(this.getTagValue(xml, 'BasePrice') || '0'),
      PromoDiscount: parseFloat(this.getTagValue(xml, 'PromoDiscount') || '0')
    };
  }

  /**
   * 5️⃣ Crea una pre-reserva temporal (estado Pending)
   */
  async crearPreReserva(
    userId: number,
    flightId: number,
    holdMinutes: number,
    idemKey: string
  ): Promise<DTO_PreReserva> {
    const body = `
      <crearPreReserva xmlns="http://skyandes.com/integracion/">
        <userId>${userId}</userId>
        <flightId>${flightId}</flightId>
        <holdMinutes>${holdMinutes}</holdMinutes>
        <idemKey>${idemKey}</idemKey>
      </crearPreReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/crearPreReserva"');
    
    return {
      PreBookingId: parseInt(this.getTagValue(xml, 'PreBookingId') || '0'),
      ExpiraEn: new Date(this.getTagValue(xml, 'ExpiraEn') || '')
    };
  }

  /**
   * 6️⃣ Confirma y emite la reserva (registra pago y cambia estado)
   */
  async confirmarReserva(
    preBookingId: number,
    metodoPago: string,
    monto: number,
    datosPago: string
  ): Promise<DTO_Reserva> {
    const body = `
      <confirmarReserva xmlns="http://skyandes.com/integracion/">
        <preBookingId>${preBookingId}</preBookingId>
        <metodoPago>${metodoPago}</metodoPago>
        <monto>${monto}</monto>
        <datosPago>${datosPago}</datosPago>
      </confirmarReserva>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/confirmarReserva"');
    
    return {
      BookingId: parseInt(this.getTagValue(xml, 'BookingId') || '0'),
      Estado: this.getTagValue(xml, 'Estado') || ''
    };
  }

  /**
   * 7️⃣ Cancela la reserva y marca el pago como Refunded
   */
  async cancelarReserva(bookingId: number, motivo: string): Promise<boolean> {
    const body = `
      <cancelarReservaIntegracion xmlns="http://skyandes.com/integracion/">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo}</motivo>
      </cancelarReservaIntegracion>
    `;

    const soapEnvelope = buildSoapEnvelope(body);
    const xml = await this.call(soapEnvelope, '"http://skyandes.com/integracion/cancelarReservaIntegracion"');
    
    const result = this.getTagValue(xml, 'cancelarReservaIntegracionResult');
    return result.toLowerCase() === 'true';
  }

  // ==================== Helpers de Parseo ====================

  private parseFlightFromElement(element: Element | Document): DTO_Flight {
    return {
      FlightId: parseInt(this.getTagValue(element, 'FlightId') || '0'),
      OriginId: parseInt(this.getTagValue(element, 'OriginId') || '0'),
      DestinationId: parseInt(this.getTagValue(element, 'DestinationId') || '0'),
      Airline: this.getTagValue(element, 'Airline') || '',
      FlightNumber: this.getTagValue(element, 'FlightNumber') || '',
      DepartureTime: new Date(this.getTagValue(element, 'DepartureTime') || ''),
      ArrivalTime: new Date(this.getTagValue(element, 'ArrivalTime') || ''),
      Duration: this.getTagValue(element, 'Duration') || '',
      CancellationPolicy: this.getTagValue(element, 'CancellationPolicy') || '',
      CabinClass: this.getTagValue(element, 'CabinClass') || '',
      AircraftId: parseInt(this.getTagValue(element, 'AircraftId') || '0')
    };
  }

  private getTagValue(parent: Element | Document, tagName: string): string {
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? (elements[0].textContent || '') : '';
  }
}
