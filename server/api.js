/**
 * API REST Server - Backend que usa ESB para llamar a servicios SOAP
 * Este servidor corre en Node.js y expone endpoints REST para el frontend
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Importar configuración del ESB
let esbConfig;
(async () => {
  const configModule = await import('../esb/utils/config.ts');
  esbConfig = configModule.defaultConfig;
})();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Server running' });
});

// ==================== RESTAURANTES ====================

/**
 * Buscar mesas en Sabor Andino
 * POST /api/restaurants/saborandino/search
 */
app.post('/api/restaurants/saborandino/search', async (req, res) => {
  try {
    console.log('[API] 🍽️  Buscando mesas en Sabor Andino...');
    
    // Importar dinámicamente el ESB (archivo TypeScript)
    const { SaborAndinoSoapAdapter } = await import('../esb/gateway/sabor-andino.adapter.ts');
    const { defaultConfig } = await import('../esb/utils/config.ts');
    const adapter = new SaborAndinoSoapAdapter(defaultConfig.endpoints.saborAndino);
    
    const { fecha, personas, hora } = req.body;
    
    // Sabor Andino usa buscarServicios con filtros VACÍOS (retorna todas las mesas)
    // El servicio no soporta filtrado, retorna todo el catálogo
    const filtros = '';
    
    console.log('[API] 📝 Filtros:', filtros === '' ? '(vacío - retorna todas las mesas)' : filtros);
    const servicios = await adapter.buscarServicios(filtros);
    console.log('[API] 📦 Servicios recibidos del adapter:', servicios.length);
    
    if (servicios.length > 0) {
      console.log('[API] 🔍 Primer servicio:', servicios[0]);
    }
    
    // Transformar servicios a formato de mesas
    const mesas = servicios.map(servicio => ({
      id: servicio.IdServicio,
      numero: servicio.IdServicio,
      capacidad: personas || 2,
      precio: parseFloat(servicio.Precio) || 0,
      disponible: true,
      nombre: servicio.Nombre,
      descripcion: servicio.Descripcion
    }));
    
    console.log(`[API] ✅ ${mesas.length} mesas encontradas`);
    res.json(mesas);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    console.error('[API] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al buscar mesas', 
      message: error.message 
    });
  }
});

/**
 * Buscar mesas en El Cangrejo Feliz
 * POST /api/restaurants/elcangrejofeliz/search
 */
app.post('/api/restaurants/elcangrejofeliz/search', async (req, res) => {
  try {
    console.log('[API] 🦀 Buscando mesas en El Cangrejo Feliz...');
    
    const { ElCangrejoFelizSoapAdapter } = await import('../esb/gateway/cangrejo-feliz.adapter.ts');
    const adapter = new ElCangrejoFelizSoapAdapter();
    
    const { fecha, personas, hora } = req.body;
    const result = await adapter.buscarMesas(fecha, personas, hora);
    
    console.log(`[API] ✅ ${result.length} mesas encontradas`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar mesas', 
      message: error.message 
    });
  }
});

/**
 * Buscar mesas en Sanctum Cortejo
 * POST /api/restaurants/sanctumcortejo/search
 */
app.post('/api/restaurants/sanctumcortejo/search', async (req, res) => {
  try {
    console.log('[API] 🍷 Buscando mesas en Sanctum Cortejo...');
    
    const { SanctumCortejoSoapAdapter } = await import('../esb/gateway/sanctum-cortejo.adapter.ts');
    const adapter = new SanctumCortejoSoapAdapter();
    
    const { fecha, personas, hora } = req.body;
    const result = await adapter.buscarMesas(fecha, personas, hora);
    
    console.log(`[API] ✅ ${result.length} mesas encontradas`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar mesas', 
      message: error.message 
    });
  }
});

/**
 * Buscar mesas en Siete Mares
 * POST /api/restaurants/sietemares/search
 */
app.post('/api/restaurants/sietemares/search', async (req, res) => {
  try {
    console.log('[API] 🐟 Buscando mesas en Siete Mares...');
    
    const { SieteMaresSoapAdapter } = await import('../esb/gateway/siete-mares.adapter.ts');
    const adapter = new SieteMaresSoapAdapter();
    
    const { fecha, personas, hora } = req.body;
    const result = await adapter.buscarMesas(fecha, personas, hora);
    
    console.log(`[API] ✅ ${result.length} mesas encontradas`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar mesas', 
      message: error.message 
    });
  }
});

// ==================== HOTELES ====================

/**
 * Buscar habitaciones en KM25 Madrid Hotel
 * POST /api/hotels/km25madrid/search
 */
app.post('/api/hotels/km25madrid/search', async (req, res) => {
  try {
    console.log('[API] 🏨 Buscando habitaciones en KM25 Madrid...');
    
    const { KM25MadridHotelSoapAdapter } = await import('../esb/gateway/km25madrid-hotel.adapter.ts');
    const adapter = new KM25MadridHotelSoapAdapter();
    
    const { fechaEntrada, fechaSalida, personas } = req.body;
    const result = await adapter.buscarHabitaciones(fechaEntrada, fechaSalida, personas);
    
    console.log(`[API] ✅ ${result.length} habitaciones encontradas`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar habitaciones', 
      message: error.message 
    });
  }
});

/**
 * Buscar habitaciones en WeWorkHub
 * POST /api/hotels/weworkhub/search
 */
app.post('/api/hotels/weworkhub/search', async (req, res) => {
  try {
    console.log('[API] 🏢 Buscando habitaciones en WeWorkHub...');
    
    const { WeWorkHubIntegracionSoapAdapter } = await import('../esb/gateway/weworkhub-integracion.adapter.ts');
    const adapter = new WeWorkHubIntegracionSoapAdapter();
    
    const { fechaEntrada, fechaSalida, personas } = req.body;
    const result = await adapter.buscarHabitaciones(fechaEntrada, fechaSalida, personas);
    
    console.log(`[API] ✅ ${result.length} habitaciones encontradas`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar habitaciones', 
      message: error.message 
    });
  }
});

// ==================== CARROS ====================

/**
 * Buscar vehículos en Easy Car
 * POST /api/cars/easycar/search
 */
app.post('/api/cars/easycar/search', async (req, res) => {
  try {
    console.log('[API] 🚗 Buscando vehículos en Easy Car...');
    
    const { EasyCarSoapAdapter } = await import('../esb/gateway/easy-car.adapter.ts');
    const adapter = new EasyCarSoapAdapter();
    
    const { fechaInicio, fechaFin, ciudad } = req.body;
    const result = await adapter.buscarVehiculos(fechaInicio, fechaFin, ciudad);
    
    console.log(`[API] ✅ ${result.length} vehículos encontrados`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar vehículos', 
      message: error.message 
    });
  }
});

/**
 * Buscar vehículos en Cuenca Car
 * POST /api/cars/cuencacar/search
 */
app.post('/api/cars/cuencacar/search', async (req, res) => {
  try {
    console.log('[API] 🚙 Buscando vehículos en Cuenca Car...');
    
    const { CuencaCarRentalSoapAdapter } = await import('../esb/gateway/cuenca-car.adapter.ts');
    const adapter = new CuencaCarRentalSoapAdapter();
    
    const { fechaInicio, fechaFin, ciudad } = req.body;
    const result = await adapter.buscarVehiculos(fechaInicio, fechaFin, ciudad);
    
    console.log(`[API] ✅ ${result.length} vehículos encontrados`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar vehículos', 
      message: error.message 
    });
  }
});

/**
 * Buscar vehículos en Autos Rent Car
 * POST /api/cars/rentcar/search
 */
app.post('/api/cars/rentcar/search', async (req, res) => {
  try {
    console.log('[API] 🚕 Buscando vehículos en Autos Rent Car...');
    
    const { AutosRentCarSoapAdapter } = await import('../esb/gateway/autos-rentcar.adapter.ts');
    const adapter = new AutosRentCarSoapAdapter();
    
    const { fechaInicio, fechaFin, ciudad } = req.body;
    const result = await adapter.buscarVehiculos(fechaInicio, fechaFin, ciudad);
    
    console.log(`[API] ✅ ${result.length} vehículos encontrados`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar vehículos', 
      message: error.message 
    });
  }
});

/**
 * Buscar vehículos en Backend Cuenca
 * POST /api/cars/backendcuenca/search
 */
app.post('/api/cars/backendcuenca/search', async (req, res) => {
  try {
    console.log('[API] 🚐 Buscando vehículos en Backend Cuenca...');
    
    const { BackendCuencaSoapAdapter } = await import('../esb/gateway/backend-cuenca.adapter.ts');
    const adapter = new BackendCuencaSoapAdapter();
    
    const { fechaInicio, fechaFin, ciudad } = req.body;
    const result = await adapter.buscarVehiculos(fechaInicio, fechaFin, ciudad);
    
    console.log(`[API] ✅ ${result.length} vehículos encontrados`);
    res.json(result);
    
  } catch (error) {
    console.error('[API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar vehículos', 
      message: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 API Server corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoints REST disponibles:`);
  console.log(`\n   🍽️  RESTAURANTES:`);
  console.log(`   - POST /api/restaurants/saborandino/search`);
  console.log(`   - POST /api/restaurants/elcangrejofeliz/search`);
  console.log(`   - POST /api/restaurants/sanctumcortejo/search`);
  console.log(`   - POST /api/restaurants/sietemares/search`);
  console.log(`\n   🏨 HOTELES:`);
  console.log(`   - POST /api/hotels/km25madrid/search`);
  console.log(`   - POST /api/hotels/weworkhub/search`);
  console.log(`\n   🚗 CARROS:`);
  console.log(`   - POST /api/cars/easycar/search`);
  console.log(`   - POST /api/cars/cuencacar/search`);
  console.log(`   - POST /api/cars/rentcar/search`);
  console.log(`   - POST /api/cars/backendcuenca/search`);
  console.log(`\n   ✅ GET /api/health\n`);
});
