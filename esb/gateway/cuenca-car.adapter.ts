/**
 * 🚗 Cuenca Car Rental SOAP Adapter
 * Servicio SOAP para búsqueda y reserva de autos de arriendo
 * Endpoint: http://wscuencaarriendoautos.runasp.net/WS_IntegracionServicioAUTOS.asmx
 * Namespace: http://arriendoautos.com/integracion
 */

import { SoapClient } from './soap-client';
import { buildSoapEnvelope } from '../utils/soap-utils';
import type { EndpointConfig } from '../utils/config';

// =====================================================
// DTOs de Arriendo de Autos Cuenca
// =====================================================

export interface DTO_ServicioIntegracion {
  IdVehiculo: number;
  AgencyId: number;
  Ciudad: string;
  Categoria: string;
  Transmision: string;
  Marca: string;
  Modelo: string;
  PrecioDia: number;
  Disponible: boolean;
}

export interface DTO_DetalleServicio {
  IdVehiculo: number;
  Marca: string;
  Modelo: string;
  Categoria: string;
  Transmision: string;
  PrecioDia: number;
  Agencia: string;
  Ciudad: string;
  Direccion: string;
  Imagenes: string[];
  Politicas: string;
  Reglas: string;
}

export interface DTO_ItemCotizacion {
  Concepto: string;
  Valor: number;
}

export interface DTO_Cotizacion {
  Total: number;
  IVA: number;
  Neto: number;
  Detalle: DTO_ItemCotizacion[];
}

export interface DTO_PreReserva {
  PreBookingId: string;
  ExpiraEn: string; // dateTime
}

export interface DTO_ReservaIntegracion {
  BookingId: string;
  Estado: string;
}

// =====================================================
// Cuenca Car Rental SOAP Adapter
// =====================================================

export class CuencaCarRentalSoapAdapter extends SoapClient {
  private namespace: string;

  constructor(endpoint: EndpointConfig) {
    super(endpoint);
    this.namespace = endpoint.namespace;
  }

  /**
   * Helper para extraer valor de un tag XML
   */
  private getTagValue(parent: Element | Document, tagName: string): string {
    const elements = parent.getElementsByTagName(tagName);
    if (elements.length > 0 && elements[0].firstChild) {
      return elements[0].firstChild.nodeValue || '';
    }
    return '';
  }

  /**
   * Helper para extraer array de strings
   */
  private getStringArray(parent: Element, arrayTagName: string): string[] {
    const arrayElement = parent.getElementsByTagName(arrayTagName)[0];
    if (!arrayElement) return [];
    
    const stringElements = arrayElement.getElementsByTagName('string');
    const result: string[] = [];
    for (let i = 0; i < stringElements.length; i++) {
      const value = stringElements[i].textContent || '';
      if (value) result.push(value);
    }
    return result;
  }

  /**
   * 1️⃣ buscarServicios - Búsqueda unificada de autos
   */
  async buscarServicios(ciudad?: string, categoria?: string): Promise<DTO_ServicioIntegracion[]> {
    const body = `
      <buscarServicios xmlns="${this.namespace}">
        ${ciudad ? `<ciudad>${ciudad}</ciudad>` : '<ciudad/>'}
        ${categoria ? `<categoria>${categoria}</categoria>` : '<categoria/>'}
      </buscarServicios>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/buscarServicios"`);
    const items = xml.getElementsByTagName('DTO_ServicioIntegracion');
    
    const result: DTO_ServicioIntegracion[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      result.push({
        IdVehiculo: parseInt(this.getTagValue(item, 'IdVehiculo')),
        AgencyId: parseInt(this.getTagValue(item, 'AgencyId')),
        Ciudad: this.getTagValue(item, 'Ciudad'),
        Categoria: this.getTagValue(item, 'Categoria'),
        Transmision: this.getTagValue(item, 'Transmision'),
        Marca: this.getTagValue(item, 'Marca'),
        Modelo: this.getTagValue(item, 'Modelo'),
        PrecioDia: parseFloat(this.getTagValue(item, 'PrecioDia')),
        Disponible: this.getTagValue(item, 'Disponible') === 'true'
      });
    }
    
    return result;
  }

  /**
   * 2️⃣ obtenerDetalleServicio - Obtiene detalle completo del servicio
   */
  async obtenerDetalleServicio(idServicio: number): Promise<DTO_DetalleServicio> {
    const body = `
      <obtenerDetalleServicio xmlns="${this.namespace}">
        <idServicio>${idServicio}</idServicio>
      </obtenerDetalleServicio>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/obtenerDetalleServicio"`);
    const result = xml.getElementsByTagName('obtenerDetalleServicioResult')[0];
    
    return {
      IdVehiculo: parseInt(this.getTagValue(result, 'IdVehiculo')),
      Marca: this.getTagValue(result, 'Marca'),
      Modelo: this.getTagValue(result, 'Modelo'),
      Categoria: this.getTagValue(result, 'Categoria'),
      Transmision: this.getTagValue(result, 'Transmision'),
      PrecioDia: parseFloat(this.getTagValue(result, 'PrecioDia')),
      Agencia: this.getTagValue(result, 'Agencia'),
      Ciudad: this.getTagValue(result, 'Ciudad'),
      Direccion: this.getTagValue(result, 'Direccion'),
      Imagenes: this.getStringArray(result, 'Imagenes'),
      Politicas: this.getTagValue(result, 'Politicas'),
      Reglas: this.getTagValue(result, 'Reglas')
    };
  }

  /**
   * 3️⃣ verificarDisponibilidad - Verifica disponibilidad de vehículo
   */
  async verificarDisponibilidad(
    idVehiculo: number,
    inicio: Date,
    fin: Date,
    unidades: number
  ): Promise<boolean> {
    const body = `
      <verificarDisponibilidad xmlns="${this.namespace}">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <inicio>${inicio.toISOString()}</inicio>
        <fin>${fin.toISOString()}</fin>
        <unidades>${unidades}</unidades>
      </verificarDisponibilidad>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/verificarDisponibilidad"`);
    const resultado = this.getTagValue(xml, 'verificarDisponibilidadResult');
    
    return resultado === 'true';
  }

  /**
   * 4️⃣ cotizarReserva - Calcula total de reserva
   */
  async cotizarReserva(idVehiculo: number, inicio: Date, fin: Date): Promise<DTO_Cotizacion> {
    const body = `
      <cotizarReserva xmlns="${this.namespace}">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <inicio>${inicio.toISOString()}</inicio>
        <fin>${fin.toISOString()}</fin>
      </cotizarReserva>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/cotizarReserva"`);
    const result = xml.getElementsByTagName('cotizarReservaResult')[0];
    
    // Parsear items de cotización
    const detalleItems = result.getElementsByTagName('DTO_ItemCotizacion');
    const detalle: DTO_ItemCotizacion[] = [];
    for (let i = 0; i < detalleItems.length; i++) {
      const item = detalleItems[i];
      detalle.push({
        Concepto: this.getTagValue(item, 'Concepto'),
        Valor: parseFloat(this.getTagValue(item, 'Valor'))
      });
    }
    
    return {
      Total: parseFloat(this.getTagValue(result, 'Total')),
      IVA: parseFloat(this.getTagValue(result, 'IVA')),
      Neto: parseFloat(this.getTagValue(result, 'Neto')),
      Detalle: detalle
    };
  }

  /**
   * 5️⃣ crearPreReserva - Crea pre-reserva temporal
   */
  async crearPreReserva(idVehiculo: number, idUsuario: number): Promise<DTO_PreReserva> {
    const body = `
      <crearPreReserva xmlns="${this.namespace}">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <idUsuario>${idUsuario}</idUsuario>
      </crearPreReserva>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/crearPreReserva"`);
    const result = xml.getElementsByTagName('crearPreReservaResult')[0];
    
    return {
      PreBookingId: this.getTagValue(result, 'PreBookingId'),
      ExpiraEn: this.getTagValue(result, 'ExpiraEn')
    };
  }

  /**
   * 6️⃣ confirmarReserva - Confirma reserva y genera comprobante
   */
  async confirmarReserva(
    preBookingId: string,
    metodoPago: string,
    monto: number
  ): Promise<DTO_ReservaIntegracion> {
    const body = `
      <confirmarReserva xmlns="${this.namespace}">
        <preBookingId>${preBookingId}</preBookingId>
        <metodoPago>${metodoPago}</metodoPago>
        <monto>${monto}</monto>
      </confirmarReserva>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/confirmarReserva"`);
    const result = xml.getElementsByTagName('confirmarReservaResult')[0];
    
    return {
      BookingId: this.getTagValue(result, 'BookingId'),
      Estado: this.getTagValue(result, 'Estado')
    };
  }

  /**
   * 7️⃣ cancelarReservaIntegracion - Cancela reserva existente
   */
  async cancelarReservaIntegracion(bookingId: string, motivo: string): Promise<boolean> {
    const body = `
      <cancelarReservaIntegracion xmlns="${this.namespace}">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo}</motivo>
      </cancelarReservaIntegracion>
    `;
    const envelope = buildSoapEnvelope(body);
    
    const xml = await this.call(envelope, `"${this.namespace}/cancelarReservaIntegracion"`);
    const resultado = this.getTagValue(xml, 'cancelarReservaIntegracionResult');
    
    return resultado === 'true';
  }
}
