/**
 * ESB - Enterprise Service Bus
 * Punto de entrada principal para integración con servicios SOAP
 * 
 * Arquitectura en capas:
 * - DAL (Data Access Layer): Repositorios y acceso a datos
 * - BLL (Business Logic Layer): Servicios con lógica de negocio
 * - Gateway: Adaptadores SOAP para servicios externos
 * - Orchestration: Orquestación y coordinación de servicios
 */

// Exportar modelos
export * from './models/entities';
export * from './models/dtos';

// Exportar utilidades
export * from './utils/soap-utils';
export * from './utils/config';

// Exportar repositorios (DAL)
export * from './dal';

// Exportar servicios de negocio (BLL)
export * from './bll';

// Exportar adaptadores SOAP (Gateway)
export * from './gateway';

// Exportar orquestador
export { ESBOrchestrator, esbOrchestrator } from './orchestration/orchestrator';

/**
 * API Principal del ESB
 * Esta es la interfaz recomendada para usar el ESB desde tu frontend
 */
import { esbOrchestrator } from './orchestration/orchestrator';
import { usuarioService, reservaService, pagoService } from './bll';
import type { FiltrosBusqueda } from './models/dtos';
import type { Usuario, Reserva, Pago } from './models/entities';

export const ESB = {
  // ==================== Búsqueda e Integración ====================
  
  /**
   * Busca servicios (hoteles, vuelos, autos) en todos los proveedores
   */
  buscarServicios: (filtros: FiltrosBusqueda) => 
    esbOrchestrator.buscarServicios(filtros),
  
  /**
   * Obtiene detalle completo de un servicio
   */
  obtenerDetalleServicio: (idServicio: string, tipo: 'hotel' | 'car' | 'flight' | 'restaurant' | 'package') =>
    esbOrchestrator.obtenerDetalleServicio(idServicio, tipo),
  
  /**
   * Verifica disponibilidad de un servicio
   */
  verificarDisponibilidad: (sku: string, tipo: string, inicio: Date, fin: Date, unidades: number) =>
    esbOrchestrator.verificarDisponibilidad(sku, tipo, inicio, fin, unidades),
  
  /**
   * Cotiza una reserva
   */
  cotizarReserva: (items: any[]) =>
    esbOrchestrator.cotizarReserva(items),
  
  /**
   * Crea una pre-reserva (bloqueo temporal)
   */
  crearPreReserva: (
    itinerario: any[], 
    cliente: { nombre: string; email: string; telefono?: string },
    holdMinutes?: number,
    idemKey?: string
  ) => esbOrchestrator.crearPreReserva(itinerario, cliente, holdMinutes, idemKey),
  
  /**
   * Confirma una reserva
   */
  confirmarReserva: (preBookingId: string, metodoPago: string, datosPago: any) =>
    esbOrchestrator.confirmarReserva(preBookingId, metodoPago, datosPago),
  
  /**
   * Cancela una reserva
   */
  cancelarReserva: (bookingId: string, motivo: string) =>
    esbOrchestrator.cancelarReservaIntegracion(bookingId, motivo),
  
  // ==================== Gestión de Usuarios ====================
  
  usuarios: {
    obtenerTodos: () => usuarioService.obtenerUsuarios(),
    obtenerPorId: (id: string) => usuarioService.obtenerUsuarioPorId(id),
    crear: (usuario: Usuario) => usuarioService.crearUsuario(usuario),
    actualizar: (id: string, usuario: Partial<Usuario>) => usuarioService.actualizarUsuario(id, usuario),
    eliminar: (id: string) => usuarioService.eliminarUsuario(id)
  },
  
  // ==================== Gestión de Reservas ====================
  
  reservas: {
    obtenerTodas: (idUsuario?: string) => reservaService.obtenerReservas(idUsuario),
    obtenerPorId: (id: string) => reservaService.obtenerReservaPorId(id),
    crear: (reserva: Reserva) => reservaService.crearReserva(reserva),
    actualizar: (id: string, reserva: Partial<Reserva>) => reservaService.actualizarReserva(id, reserva),
    cancelar: (id: string) => reservaService.cancelarReserva(id),
    confirmar: (id: string) => reservaService.confirmarReserva(id),
    obtenerDetalles: (idReserva: string) => reservaService.obtenerDetallesReserva(idReserva)
  },
  
  // ==================== Gestión de Pagos ====================
  
  pagos: {
    obtenerTodos: (idReserva?: string) => pagoService.obtenerPagos(idReserva),
    obtenerPorId: (id: string) => pagoService.obtenerPagoPorId(id),
    crear: (pago: Pago) => pagoService.crearPago(pago),
    capturar: (id: string) => pagoService.capturarPago(id),
    reembolsar: (id: string) => pagoService.reembolsarPago(id),
    calcularTotalPagado: (idReserva: string) => pagoService.calcularTotalPagado(idReserva)
  }
};

// Exportar por defecto
export default ESB;
