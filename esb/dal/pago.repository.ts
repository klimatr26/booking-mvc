/**
 * ESB - DAL - Repositorio de Pagos
 */

import { BaseRepository } from './base.repository';
import type { Pago } from '../models/entities';

export class PagoRepository extends BaseRepository<Pago> {
  constructor() {
    super('idPago');
  }

  async findByReserva(idReserva: string): Promise<Pago[]> {
    return this.findByField('idReserva', idReserva);
  }

  async findByEstado(estado: 'PENDIENTE' | 'AUTORIZADO' | 'CAPTURADO' | 'RECHAZADO' | 'REEMBOLSADO'): Promise<Pago[]> {
    return this.findByField('estado', estado);
  }

  async findByTransaccionId(transaccionId: string): Promise<Pago | null> {
    const pagos = await this.findAll();
    return pagos.find(p => p.transaccionId === transaccionId) || null;
  }

  async calcularTotalPagado(idReserva: string): Promise<number> {
    const pagos = await this.findByReserva(idReserva);
    return pagos
      .filter(p => p.estado === 'CAPTURADO' || p.estado === 'AUTORIZADO')
      .reduce((total, pago) => total + pago.monto, 0);
  }
}

export const pagoRepository = new PagoRepository();
