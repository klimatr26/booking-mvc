/**
 * Easy Car SOAP Service Adapter
 * Service 19 - Easy Car (Car Rental)
 * Endpoint: http://easycar.runasp.net/IntegracionService.asmx
 * Namespace: http://tuservidor.com/booking/autos
 * Type: ASMX Car Rental Service
 * Operations: 6
 */

import { SoapClient } from './soap-client';
import type { EndpointConfig } from '../utils/config';

// ==================== DTOs ====================

export interface VehiculoDTO {
  IdVehiculo: number;
  IdAgencia: number;
  Marca: string;
  Modelo: string;
  Anio: number;
  Categoria: string;
  Transmision: string;
  Combustible: string;
  Activo: boolean;
  PrecioBaseDia: number;
}

export interface CotizacionDTO {
  Subtotal: number;
  Impuestos: number;
  Total: number;
  Dias: number;
}

export interface PreReservaDTO {
  IdReserva: number;
  CodigoReserva: string;
  IdCliente: number;
  IdAgenciaRetiro: number;
  IdAgenciaDevolucion: number;
  IdVehiculo: number;
  FechaRetiro: string;
  FechaDevolucion: string;
  IdEstado: number;
  Subtotal: number;
  Impuestos: number;
  Total: number;
}

// ==================== Adapter ====================

export class EasyCarSoapAdapter extends SoapClient {
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
   * 1. Buscar Servicios (Vehículos)
   * Busca vehículos disponibles por filtros
   */
  async buscarServicios(
    categoria?: string,
    transmision?: string,
    fechaInicio?: string,
    fechaFin?: string,
    edadConductor?: number
  ): Promise<VehiculoDTO[]> {
    // IMPORTANTE: Este servicio NO acepta campos vacíos
    // Solo incluimos los campos que tienen valores
    let fields = '';
    if (categoria) fields += `<categoria>${categoria}</categoria>`;
    if (transmision) fields += `<transmision>${transmision}</transmision>`;
    if (fechaInicio) fields += `<fechaInicio>${fechaInicio}</fechaInicio>`;
    if (fechaFin) fields += `<fechaFin>${fechaFin}</fechaFin>`;
    if (edadConductor && edadConductor > 0) fields += `<edadConductor>${edadConductor}</edadConductor>`;
    
    const soapBody = `
      <BuscarServicios xmlns="http://tuservidor.com/booking/autos">
        ${fields}
      </BuscarServicios>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/BuscarServicios');
    return this.parseVehiculoList(response);
  }

  /**
   * 2. Obtener Detalle Servicio
   * Obtiene información detallada de un vehículo
   */
  async obtenerDetalleServicio(idVehiculo: number): Promise<VehiculoDTO> {
    const soapBody = `
      <ObtenerDetalleServicio xmlns="http://tuservidor.com/booking/autos">
        <idVehiculo>${idVehiculo}</idVehiculo>
      </ObtenerDetalleServicio>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/ObtenerDetalleServicio');
    return this.parseVehiculo(response);
  }

  /**
   * 3. Verificar Disponibilidad
   * Verifica disponibilidad por rango de fechas
   */
  async verificarDisponibilidad(
    idVehiculo: number,
    inicio: string,
    fin: string
  ): Promise<boolean> {
    const soapBody = `
      <VerificarDisponibilidad xmlns="http://tuservidor.com/booking/autos">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <inicio>${inicio}</inicio>
        <fin>${fin}</fin>
      </VerificarDisponibilidad>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/VerificarDisponibilidad');
    
    const result = this.getNodeText(response, 'VerificarDisponibilidadResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 4. Cotizar Reserva
   * Calcula el precio total estimado de la reserva
   */
  async cotizarReserva(idVehiculo: number, dias: number): Promise<CotizacionDTO> {
    const soapBody = `
      <CotizarReserva xmlns="http://tuservidor.com/booking/autos">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <dias>${dias}</dias>
      </CotizarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/CotizarReserva');
    return this.parseCotizacion(response);
  }

  /**
   * 5. Crear Pre-Reserva
   * Crea una reserva temporal en estado PENDIENTE
   */
  async crearPreReserva(
    idVehiculo: number,
    idCliente: number,
    inicio: string,
    fin: string,
    edadConductor: number
  ): Promise<PreReservaDTO> {
    const soapBody = `
      <CrearPreReserva xmlns="http://tuservidor.com/booking/autos">
        <idVehiculo>${idVehiculo}</idVehiculo>
        <idCliente>${idCliente}</idCliente>
        <inicio>${inicio}</inicio>
        <fin>${fin}</fin>
        <edadConductor>${edadConductor}</edadConductor>
      </CrearPreReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/CrearPreReserva');
    return this.parsePreReserva(response);
  }

  /**
   * 6. Confirmar Reserva
   * Confirma una reserva pendiente y genera factura
   */
  async confirmarReserva(idReserva: number): Promise<boolean> {
    const soapBody = `
      <ConfirmarReserva xmlns="http://tuservidor.com/booking/autos">
        <idReserva>${idReserva}</idReserva>
      </ConfirmarReserva>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/ConfirmarReserva');
    
    const result = this.getNodeText(response, 'ConfirmarReservaResult');
    return result.toLowerCase() === 'true';
  }

  /**
   * 7. Cancelar Reserva
   * Cancela una reserva activa y libera disponibilidad
   */
  async cancelarReservaIntegracion(idReserva: number, motivo: string): Promise<boolean> {
    const soapBody = `
      <CancelarReservaIntegracion xmlns="http://tuservidor.com/booking/autos">
        <idReserva>${idReserva}</idReserva>
        <motivo>${motivo || ''}</motivo>
      </CancelarReservaIntegracion>
    `;

    const envelope = this.buildSoapEnvelope(soapBody);
    const response = await this.call(envelope, 'http://tuservidor.com/booking/autos/CancelarReservaIntegracion');
    
    const result = this.getNodeText(response, 'CancelarReservaIntegracionResult');
    return result.toLowerCase() === 'true';
  }

  // ==================== Parsers ====================

  private parseVehiculoList(doc: Document): VehiculoDTO[] {
    const vehiculos: VehiculoDTO[] = [];
    const nodes = doc.getElementsByTagName('VehiculoDTO');

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      vehiculos.push(this.parseVehiculoNode(node));
    }

    return vehiculos;
  }

  private parseVehiculo(doc: Document): VehiculoDTO {
    const result = doc.getElementsByTagName('ObtenerDetalleServicioResult')[0];
    return this.parseVehiculoNode(result);
  }

  private parseVehiculoNode(node: Element): VehiculoDTO {
    return {
      IdVehiculo: parseInt(this.getChildText(node, 'IdVehiculo')) || 0,
      IdAgencia: parseInt(this.getChildText(node, 'IdAgencia')) || 0,
      Marca: this.getChildText(node, 'Marca'),
      Modelo: this.getChildText(node, 'Modelo'),
      Anio: parseInt(this.getChildText(node, 'Anio')) || 0,
      Categoria: this.getChildText(node, 'Categoria'),
      Transmision: this.getChildText(node, 'Transmision'),
      Combustible: this.getChildText(node, 'Combustible'),
      Activo: this.getChildText(node, 'Activo').toLowerCase() === 'true',
      PrecioBaseDia: parseFloat(this.getChildText(node, 'PrecioBaseDia')) || 0
    };
  }

  private parseCotizacion(doc: Document): CotizacionDTO {
    return {
      Subtotal: parseFloat(this.getNodeText(doc, 'Subtotal')) || 0,
      Impuestos: parseFloat(this.getNodeText(doc, 'Impuestos')) || 0,
      Total: parseFloat(this.getNodeText(doc, 'Total')) || 0,
      Dias: parseInt(this.getNodeText(doc, 'Dias')) || 0
    };
  }

  private parsePreReserva(doc: Document): PreReservaDTO {
    return {
      IdReserva: parseInt(this.getNodeText(doc, 'IdReserva')) || 0,
      CodigoReserva: this.getNodeText(doc, 'CodigoReserva'),
      IdCliente: parseInt(this.getNodeText(doc, 'IdCliente')) || 0,
      IdAgenciaRetiro: parseInt(this.getNodeText(doc, 'IdAgenciaRetiro')) || 0,
      IdAgenciaDevolucion: parseInt(this.getNodeText(doc, 'IdAgenciaDevolucion')) || 0,
      IdVehiculo: parseInt(this.getNodeText(doc, 'IdVehiculo')) || 0,
      FechaRetiro: this.getNodeText(doc, 'FechaRetiro'),
      FechaDevolucion: this.getNodeText(doc, 'FechaDevolucion'),
      IdEstado: parseInt(this.getNodeText(doc, 'IdEstado')) || 0,
      Subtotal: parseFloat(this.getNodeText(doc, 'Subtotal')) || 0,
      Impuestos: parseFloat(this.getNodeText(doc, 'Impuestos')) || 0,
      Total: parseFloat(this.getNodeText(doc, 'Total')) || 0
    };
  }

  private getChildText(parent: Element, tagName: string): string {
    const child = parent.getElementsByTagName(tagName)[0];
    return child?.textContent || '';
  }
}
