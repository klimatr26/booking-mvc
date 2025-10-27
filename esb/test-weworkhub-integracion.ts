/**
 * WeWorkHub Integración - Test Suite
 * Servicio 11: Hub de Integración Multi-Servicio
 * Endpoint: http://inegracion.runasp.net/WS_Integracion.asmx
 */

import { WeWorkHubIntegracionSoapAdapter } from './gateway/weworkhub-integracion.adapter';
import { getESBConfig } from './utils/config';
import type {
  FiltrosBusquedaSoapDto,
  ItemItinerarioSoapDto,
  UsuarioSoapDto
} from './gateway/weworkhub-integracion.adapter';

// ============================================================================
// TEST RUNNER
// ============================================================================

async function testWeWorkHubIntegracion() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  WEWORKHUB INTEGRACIÓN - TEST DE TODAS LAS OPERACIONES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const config = getESBConfig();
  const adapter = new WeWorkHubIntegracionSoapAdapter(config.endpoints.weWorkHubIntegracion);

  let testServicio: any = null;
  let testItems: ItemItinerarioSoapDto[] = [];
  let preBookingId: string = '';
  let reservaId: string = '';

  // ============================================================================
  // 1. BUSCAR SERVICIOS
  // ============================================================================
  console.log('🔍 1. BUSCAR SERVICIOS');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  try {
    const filtros: FiltrosBusquedaSoapDto = {
      serviceType: 'HOTEL',
      ciudad: 'Quito',
      fechaInicio: '2025-11-01',
      fechaFin: '2025-11-03',
      precioMin: 30,
      precioMax: 120,
      amenities: ['WiFi', 'Desayuno'],
      clasificacionMin: 3,
      adultos: 2,
      ninos: 0
    };

    console.log('📤 Request:');
    console.log(JSON.stringify(filtros, null, 2));

    const servicios = await adapter.buscarServicios(filtros);
    
    console.log(`\n✅ Servicios encontrados: ${servicios.length}\n`);
    
    if (servicios.length > 0) {
      testServicio = servicios[0];
      console.log('📋 Primer servicio:');
      console.log(`   ID: ${testServicio.idServicio}`);
      console.log(`   Tipo: ${testServicio.serviceType}`);
      console.log(`   Nombre: ${testServicio.nombre}`);
      console.log(`   Ciudad: ${testServicio.ciudad}`);
      console.log(`   Precio desde: ${testServicio.moneda} ${testServicio.precioDesde}`);
      console.log(`   Clasificación: ${testServicio.clasificacion} ⭐`);
      console.log(`   Amenities: ${testServicio.amenities.join(', ')}`);
      console.log(`   Disponible: ${testServicio.disponible ? '✅ Sí' : '❌ No'}\n`);
    }
  } catch (error: any) {
    console.error('❌ Error en buscarServicios:', error.message);
    console.log('⚠️  No se puede continuar sin servicios. Abortando tests.\n');
    return;
  }

  // ============================================================================
  // 2. OBTENER DETALLE DEL SERVICIO
  // ============================================================================
  console.log('\n🔍 2. OBTENER DETALLE DEL SERVICIO');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  try {
    console.log(`📤 Request: idServicio = ${testServicio.idServicio}`);
    
    const detalle = await adapter.obtenerDetalleServicio(testServicio.idServicio);
    
    console.log('\n✅ Detalle obtenido:');
    console.log(`   ID: ${detalle.idServicio}`);
    console.log(`   Nombre: ${detalle.nombre}`);
    console.log(`   Ciudad: ${detalle.ciudad}`);
    console.log(`   Precio: ${detalle.moneda} ${detalle.precioDesde}`);
    console.log(`   Clasificación: ${detalle.clasificacion} ⭐`);
    console.log(`   Disponible: ${detalle.disponible ? '✅ Sí' : '❌ No'}\n`);
  } catch (error: any) {
    console.error('❌ Error en obtenerDetalleServicio:', error.message);
  }

  // ============================================================================
  // 3. VERIFICAR DISPONIBILIDAD
  // ============================================================================
  console.log('\n🔍 3. VERIFICAR DISPONIBILIDAD');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  try {
    const sku = testServicio.idServicio;
    const inicio = '2025-12-15';
    const fin = '2025-12-20';
    const unidades = 1;

    console.log('📤 Request:');
    console.log(`   SKU: ${sku}`);
    console.log(`   Fecha inicio: ${inicio}`);
    console.log(`   Fecha fin: ${fin}`);
    console.log(`   Unidades: ${unidades}`);
    
    const disponible = await adapter.verificarDisponibilidad(sku, inicio, fin, unidades);
    
    console.log(`\n${disponible ? '✅' : '❌'} Disponible: ${disponible ? 'Sí' : 'No'}\n`);

    if (disponible) {
      testItems = [{
        sku,
        serviceType: testServicio.serviceType,
        fechaInicio: inicio,
        fechaFin: fin,
        unidades,
        precioUnitario: testServicio.precioDesde
      }];
    }
  } catch (error: any) {
    console.error('❌ Error en verificarDisponibilidad:', error.message);
  }

  // ============================================================================
  // 4. COTIZAR RESERVA
  // ============================================================================
  console.log('\n💰 4. COTIZAR RESERVA');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  if (testItems.length === 0) {
    console.log('⚠️  No hay items para cotizar. Saltando...\n');
  } else {
    try {
      console.log('📤 Request:');
      console.log(`   Items: ${testItems.length}`);
      testItems.forEach((item, index) => {
        console.log(`   Item ${index + 1}:`);
        console.log(`      SKU: ${item.sku}`);
        console.log(`      Tipo: ${item.serviceType}`);
        console.log(`      Unidades: ${item.unidades}`);
        console.log(`      Precio unitario: ${item.precioUnitario}`);
      });
      
      const cotizacion = await adapter.cotizarReserva(testItems);
      
      console.log('\n✅ Cotización obtenida:');
      console.log(`   Subtotal: ${cotizacion.moneda} ${cotizacion.subtotal.toFixed(2)}`);
      console.log(`   Impuestos: ${cotizacion.moneda} ${cotizacion.impuestos.toFixed(2)}`);
      console.log(`   Fees: ${cotizacion.moneda} ${cotizacion.fees.toFixed(2)}`);
      console.log(`   TOTAL: ${cotizacion.moneda} ${cotizacion.total.toFixed(2)}`);
      if (cotizacion.breakdown && cotizacion.breakdown.length > 0) {
        console.log('\n   Desglose:');
        cotizacion.breakdown.forEach(line => {
          console.log(`      • ${line}`);
        });
      }
      console.log();
    } catch (error: any) {
      console.error('❌ Error en cotizarReserva:', error.message);
    }
  }

  // ============================================================================
  // 5. CREAR PRE-RESERVA
  // ============================================================================
  console.log('\n📝 5. CREAR PRE-RESERVA');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  if (testItems.length === 0) {
    console.log('⚠️  No hay items para pre-reservar. Saltando...\n');
  } else {
    try {
      const cliente: UsuarioSoapDto = {
        NumeroIdentificacion: '0102030405',
        TipoIdentificacion: 'CEDULA',
        Email: 'test@example.com',
        Nombres: 'Juan Carlos',
        Apellidos: 'Pérez González',
        Telefono: '+593987654321',
        Nacionalidad: 'Ecuatoriana',
        Active: true
      };

      const holdMinutes = 30;
      const idemKey = `TEST-${Date.now()}`;

      console.log('📤 Request:');
      console.log(`   Cliente: ${cliente.Nombres} ${cliente.Apellidos}`);
      console.log(`   Email: ${cliente.Email}`);
      console.log(`   Hold: ${holdMinutes} minutos`);
      console.log(`   Idempotency Key: ${idemKey}`);
      
      const preReserva = await adapter.crearPreReserva(testItems, cliente, holdMinutes, idemKey);
      
      preBookingId = preReserva.preBookingId;
      
      console.log('\n✅ Pre-reserva creada:');
      console.log(`   Pre-Booking ID: ${preReserva.preBookingId}`);
      console.log(`   Expira en: ${preReserva.expiraEn}`);
      console.log(`   Monto bloqueo: ${preReserva.montoBloqueo}`);
      console.log(`   Estado: ${preReserva.estado}\n`);
    } catch (error: any) {
      console.error('❌ Error en crearPreReserva:', error.message);
    }
  }

  // ============================================================================
  // 6. CONFIRMAR RESERVA
  // ============================================================================
  console.log('\n✅ 6. CONFIRMAR RESERVA');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  if (!preBookingId) {
    console.log('⚠️  No hay pre-reserva para confirmar. Saltando...\n');
  } else {
    try {
      const metodoPago = 'TARJETA_CREDITO';
      const datosPago = JSON.stringify({
        numeroTarjeta: '4111111111111111',
        nombreTitular: 'JUAN PEREZ',
        fechaExpiracion: '12/26',
        cvv: '123'
      });

      console.log('📤 Request:');
      console.log(`   Pre-Booking ID: ${preBookingId}`);
      console.log(`   Método de pago: ${metodoPago}`);
      
      const reserva = await adapter.confirmarReserva(preBookingId, metodoPago, datosPago);
      
      reservaId = reserva.CodigoReserva;
      
      console.log('\n✅ Reserva confirmada:');
      console.log(`   ID Reserva: ${reserva.IdReserva}`);
      console.log(`   UUID: ${reserva.UuidReserva}`);
      console.log(`   Código: ${reserva.CodigoReserva}`);
      console.log(`   Estado: ${reserva.EstadoReserva}`);
      console.log(`   Check-in: ${reserva.FechaCheckin}`);
      console.log(`   Check-out: ${reserva.FechaCheckout}`);
      console.log(`   Total: ${reserva.Moneda} ${reserva.TotalReserva || reserva.Subtotal}\n`);
    } catch (error: any) {
      console.error('❌ Error en confirmarReserva:', error.message);
    }
  }

  // ============================================================================
  // 7. CANCELAR RESERVA
  // ============================================================================
  console.log('\n🚫 7. CANCELAR RESERVA');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  if (!reservaId && !preBookingId) {
    console.log('⚠️  No hay reserva para cancelar. Saltando...\n');
  } else {
    try {
      const bookingId = reservaId || preBookingId;
      const motivo = 'Prueba de integración - Cancelación automática';

      console.log('📤 Request:');
      console.log(`   Booking ID: ${bookingId}`);
      console.log(`   Motivo: ${motivo}`);
      
      const cancelado = await adapter.cancelarReservaIntegracion(bookingId, motivo);
      
      console.log(`\n${cancelado ? '✅' : '❌'} Cancelado: ${cancelado ? 'Sí' : 'No'}\n`);
    } catch (error: any) {
      console.error('❌ Error en cancelarReservaIntegracion:', error.message);
    }
  }

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESUMEN DEL TEST');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Servicio: WeWorkHub Integración (Hub Multi-Servicio)');
  console.log('  Endpoint: http://inegracion.runasp.net/WS_Integracion.asmx');
  console.log('  Operaciones: 7 (buscar, detalle, verificar, cotizar, pre-reserva, confirmar, cancelar)');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// ============================================================================
// EJECUTAR TEST
// ============================================================================

testWeWorkHubIntegracion().catch(error => {
  console.error('\n💥 Error fatal en el test:', error);
  process.exit(1);
});
