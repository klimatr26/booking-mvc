/**
 * ESB - Gateway - Cliente SOAP Base
 * Cliente HTTP para llamadas SOAP a servicios externos
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ESBLogger, parseSoapResponse, hasSoapFault, getSoapFaultMessage } from '../utils/soap-utils';
import type { EndpointConfig } from '../utils/config';

const logger = ESBLogger.getInstance();

export class SoapClient {
  private axiosInstance: AxiosInstance;
  private endpoint: EndpointConfig;

  constructor(endpoint: EndpointConfig) {
    this.endpoint = endpoint;
    this.axiosInstance = axios.create({
      baseURL: endpoint.url,
      timeout: endpoint.timeout || 30000,
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      }
    });
  }

  /**
   * Ejecuta una llamada SOAP
   */
  async call(soapEnvelope: string, soapAction?: string): Promise<Document> {
    if (!this.endpoint.enabled) {
      throw new Error(`El endpoint ${this.endpoint.url} está deshabilitado`);
    }

    logger.info(`Llamada SOAP a ${this.endpoint.url}`, { soapAction });

    const config: AxiosRequestConfig = {};
    if (soapAction) {
      config.headers = { 'SOAPAction': soapAction };
    }

    try {
      const response = await this.axiosInstance.post('', soapEnvelope, config);
      const doc = await parseSoapResponse(response.data);

      // Verificar si hay un SOAP Fault
      if (hasSoapFault(doc)) {
        const faultMessage = getSoapFaultMessage(doc);
        logger.error('SOAP Fault recibido', { message: faultMessage });
        throw new Error(`SOAP Fault: ${faultMessage}`);
      }

      logger.info('Respuesta SOAP recibida exitosamente');
      return doc;
    } catch (error: any) {
      logger.error('Error en llamada SOAP', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(`Error HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se recibió respuesta del servidor');
      } else {
        // Error al configurar la petición
        throw error;
      }
    }
  }

  /**
   * Extrae un valor de texto de un nodo XML
   */
  protected getNodeText(doc: Document, tagName: string): string {
    const node = doc.getElementsByTagName(tagName)[0];
    return node?.textContent || '';
  }

  /**
   * Extrae múltiples valores de nodos XML
   */
  protected getNodeTexts(doc: Document, tagName: string): string[] {
    const nodes = doc.getElementsByTagName(tagName);
    const texts: string[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const text = nodes[i].textContent;
      if (text) texts.push(text);
    }
    return texts;
  }

  /**
   * Extrae un número de un nodo XML
   */
  protected getNodeNumber(doc: Document, tagName: string, defaultValue: number = 0): number {
    const text = this.getNodeText(doc, tagName);
    return text ? parseFloat(text) : defaultValue;
  }

  /**
   * Extrae un booleano de un nodo XML
   */
  protected getNodeBoolean(doc: Document, tagName: string, defaultValue: boolean = false): boolean {
    const text = this.getNodeText(doc, tagName).toLowerCase();
    if (text === 'true' || text === '1') return true;
    if (text === 'false' || text === '0') return false;
    return defaultValue;
  }

  /**
   * Extrae una fecha de un nodo XML
   */
  protected getNodeDate(doc: Document, tagName: string): Date | null {
    const text = this.getNodeText(doc, tagName);
    return text ? new Date(text) : null;
  }
}
