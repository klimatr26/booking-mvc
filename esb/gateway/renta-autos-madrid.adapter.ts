/**
 * Renta Autos Madrid SOAP Service Adapter
 * Service 20 - Renta Autos Madrid (Car Rental)
 * Endpoint: http://rentaautosmadrid.runasp.net/IntegracionService.asmx
 * Namespace: http://rentaautos.es/integracion
 * Type: ASMX Car Rental Service
 * Operations: 8 (including Ping)
 */

import { SoapClient } from './soap-client';
import type { EndpointConfig } from '../utils/config';

// ==================== DTOs ====================

export interface FiltroDTO {
  TipoServicio?: string;
  Ciudad?: string;
  Categoria?: string;
  Gearbox?: string;
  PrecioMin?: number;
  PrecioMax?: number;
}

export interface ServicioDTO {
  Id: number;
  Nombre: string;
  Categoria: string;
  Gearbox: string;
  Ciudad: string;
  Precio: number;
  Hotel: string;
  Disponible: boolean;
  Imagenes: string[];
}

export interface DetalleCotizacionDTO {
  Descripcion: string;
  Dias: number;
  PrecioDia: number;
}

export interface CotizacionDTO {
  Total: number;
  Impuesto: number;
  Subtotal: number;
  Dias: number;
  Detalle: DetalleCotizacionDTO[];
}

export interface PreReservaDTO {
  PreBookingId: number;
  ExpiraEn: string;
  Exito: boolean;
  Mensaje: string;
}

// ==================== Adapter ====================

export class RentaAutosMadridSoapAdapter extends SoapClient {
  constructor(endpoint: EndpointConfig) {
    super(endpoint);
  }

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
   * 0. Ping - Health check
   */
  async ping(): Promise<string> {
    const soapBody = `<Ping xmlns="http://rentaautos.es/integracion"/>`;
    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/Ping');
    return this.getNodeText(response, 'PingResult');
  }

  /**
   * 1. Buscar Servicios (Autos)
   * Búsqueda unificada de servicios (autos disponibles)
   */
  async buscarServicios(filtro?: FiltroDTO): Promise<ServicioDTO[]> {
    let filtroXml = '';
    if (filtro) {
      filtroXml = '<filtro>';
      if (filtro.TipoServicio) filtroXml += `<TipoServicio>${filtro.TipoServicio}</TipoServicio>`;
      if (filtro.Ciudad) filtroXml += `<Ciudad>${filtro.Ciudad}</Ciudad>`;
      if (filtro.Categoria) filtroXml += `<Categoria>${filtro.Categoria}</Categoria>`;
      if (filtro.Gearbox) filtroXml += `<Gearbox>${filtro.Gearbox}</Gearbox>`;
      if (filtro.PrecioMin !== undefined) filtroXml += `<PrecioMin>${filtro.PrecioMin}</PrecioMin>`;
      if (filtro.PrecioMax !== undefined) filtroXml += `<PrecioMax>${filtro.PrecioMax}</PrecioMax>`;
      filtroXml += '</filtro>';
    }

    const soapBody = `
      <BuscarServicios xmlns="http://rentaautos.es/integracion">
        ${filtroXml}
      </BuscarServicios>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/BuscarServicios');
    return this.parseServicioList(response);
  }

  /**
   * 2. Obtener Detalle Servicio
   * Obtiene el detalle completo de un servicio (auto)
   */
  async obtenerDetalleServicio(idServicio: number): Promise<ServicioDTO> {
    const soapBody = `
      <ObtenerDetalleServicio xmlns="http://rentaautos.es/integracion">
        <idServicio>${idServicio}</idServicio>
      </ObtenerDetalleServicio>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/ObtenerDetalleServicio');
    return this.parseServicio(response);
  }

  /**
   * 3. Verificar Disponibilidad
   * Verifica si un vehículo está disponible entre dos fechas
   */
  async verificarDisponibilidad(
    sku: number,
    inicio: string,
    fin: string,
    unidades: number
  ): Promise<boolean> {
    const soapBody = `
      <VerificarDisponibilidad xmlns="http://rentaautos.es/integracion">
        <sku>${sku}</sku>
        <inicio>${inicio}</inicio>
        <fin>${fin}</fin>
        <unidades>${unidades}</unidades>
      </VerificarDisponibilidad>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/VerificarDisponibilidad');
    
    const result = this.getNodeText(response, 'VerificarDisponibilidadResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 4. Cotizar Reserva
   * Calcula el precio total (subtotal, impuesto y total) para un auto y fechas dadas
   */
  async cotizarReserva(autoId: number, inicio: string, fin: string): Promise<CotizacionDTO> {
    const soapBody = `
      <CotizarReserva xmlns="http://rentaautos.es/integracion">
        <autoId>${autoId}</autoId>
        <inicio>${inicio}</inicio>
        <fin>${fin}</fin>
      </CotizarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/CotizarReserva');
    return this.parseCotizacion(response);
  }

  /**
   * 5. Crear Pre-Reserva
   * Crea una pre-reserva temporal pendiente de confirmación
   */
  async crearPreReserva(
    usuarioId: number,
    autoId: number,
    inicio: string,
    fin: string,
    holdMinutes: number
  ): Promise<PreReservaDTO> {
    const soapBody = `
      <CrearPreReserva xmlns="http://rentaautos.es/integracion">
        <usuarioId>${usuarioId}</usuarioId>
        <autoId>${autoId}</autoId>
        <inicio>${inicio}</inicio>
        <fin>${fin}</fin>
        <holdMinutes>${holdMinutes}</holdMinutes>
      </CrearPreReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/CrearPreReserva');
    return this.parsePreReserva(response);
  }

  /**
   * 6. Confirmar Reserva
   * Confirma y emite reserva. Retorna true si se acepta la confirmación.
   */
  async confirmarReserva(
    preBookingId: number,
    metodoPago: string,
    datosPago: string
  ): Promise<boolean> {
    const soapBody = `
      <ConfirmarReserva xmlns="http://rentaautos.es/integracion">
        <preBookingId>${preBookingId}</preBookingId>
        <metodoPago>${metodoPago || ''}</metodoPago>
        <datosPago>${datosPago || ''}</datosPago>
      </ConfirmarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/ConfirmarReserva');
    
    const result = this.getNodeText(response, 'ConfirmarReservaResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 7. Cancelar Reserva
   * Cancela la reserva por bookingId (int)
   */
  async cancelarReservaIntegracion(bookingId: number, motivo: string): Promise<boolean> {
    const soapBody = `
      <CancelarReservaIntegracion xmlns="http://rentaautos.es/integracion">
        <bookingId>${bookingId}</bookingId>
        <motivo>${motivo || ''}</motivo>
      </CancelarReservaIntegracion>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://rentaautos.es/integracion/CancelarReservaIntegracion');
    
    const result = this.getNodeText(response, 'CancelarReservaIntegracionResult');
    return result.toLowerCase() === 'true';
  }

  // ==================== Parsers ====================

  private parseServicioList(doc: Document): ServicioDTO[] {
    const servicios: ServicioDTO[] = [];
    const nodes = doc.getElementsByTagName('ServicioDTO');

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      servicios.push(this.parseServicioNode(node));
    }

    return servicios;
  }

  private parseServicio(doc: Document): ServicioDTO {
    const result = doc.getElementsByTagName('ObtenerDetalleServicioResult')[0];
    return this.parseServicioNode(result);
  }

  private parseServicioNode(node: Element): ServicioDTO {
    const imagenes: string[] = [];
    const imagenesNode = node.getElementsByTagName('Imagenes')[0];
    if (imagenesNode) {
      const stringNodes = imagenesNode.getElementsByTagName('string');
      for (let i = 0; i < stringNodes.length; i++) {
        imagenes.push(stringNodes[i].textContent || '');
      }
    }

    return {
      Id: parseInt(this.getChildText(node, 'Id')) || 0,
      Nombre: this.getChildText(node, 'Nombre'),
      Categoria: this.getChildText(node, 'Categoria'),
      Gearbox: this.getChildText(node, 'Gearbox'),
      Ciudad: this.getChildText(node, 'Ciudad'),
      Precio: parseFloat(this.getChildText(node, 'Precio')) || 0,
      Hotel: this.getChildText(node, 'Hotel'),
      Disponible: this.getChildText(node, 'Disponible').toLowerCase() === 'true',
      Imagenes: imagenes
    };
  }

  private parseCotizacion(doc: Document): CotizacionDTO {
    const detalles: DetalleCotizacionDTO[] = [];
    const detalleNodes = doc.getElementsByTagName('DetalleCotizacionDTO');
    
    for (let i = 0; i < detalleNodes.length; i++) {
      const node = detalleNodes[i];
      detalles.push({
        Descripcion: this.getChildText(node, 'Descripcion'),
        Dias: parseInt(this.getChildText(node, 'Dias')) || 0,
        PrecioDia: parseFloat(this.getChildText(node, 'PrecioDia')) || 0
      });
    }

    return {
      Total: parseFloat(this.getNodeText(doc, 'Total')) || 0,
      Impuesto: parseFloat(this.getNodeText(doc, 'Impuesto')) || 0,
      Subtotal: parseFloat(this.getNodeText(doc, 'Subtotal')) || 0,
      Dias: parseInt(this.getNodeText(doc, 'Dias')) || 0,
      Detalle: detalles
    };
  }

  private parsePreReserva(doc: Document): PreReservaDTO {
    return {
      PreBookingId: parseInt(this.getNodeText(doc, 'PreBookingId')) || 0,
      ExpiraEn: this.getNodeText(doc, 'ExpiraEn'),
      Exito: this.getNodeText(doc, 'Exito').toLowerCase() === 'true',
      Mensaje: this.getNodeText(doc, 'Mensaje')
    };
  }

  private getChildText(parent: Element, tagName: string): string {
    const child = parent.getElementsByTagName(tagName)[0];
    return child?.textContent || '';
  }
}
