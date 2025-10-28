/**
 * Netlify Function - Car Search
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const company = event.queryStringParameters?.company;
    
    if (!company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing company parameter' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { pickupDate, returnDate, location } = body;

    console.log(`[Netlify Function] Buscando carros en ${company}...`);

    let servicios: any[] = [];
    
    switch (company) {
      case 'easycar': {
        const { EasyCarAdapter } = await import('../../esb/gateway/easy-car.adapter');
        const { defaultConfig } = await import('../../esb/utils/config');
        const adapter = new EasyCarAdapter(defaultConfig.endpoints.easyCar);
        servicios = await adapter.buscarServicios('');
        break;
      }
      
      case 'cuencacar': {
        const { CuencaCarAdapter } = await import('../../esb/gateway/cuenca-car.adapter');
        const { defaultConfig } = await import('../../esb/utils/config');
        const adapter = new CuencaCarAdapter(defaultConfig.endpoints.cuencaCar);
        servicios = await adapter.buscarServicios('');
        break;
      }
      
      case 'rentcar': {
        const { RentCarAdapter } = await import('../../esb/gateway/rent-car.adapter');
        const { defaultConfig } = await import('../../esb/utils/config');
        const adapter = new RentCarAdapter(defaultConfig.endpoints.rentCar);
        servicios = await adapter.buscarServicios('');
        break;
      }
      
      case 'backendcuenca': {
        const { BackendCuencaAdapter } = await import('../../esb/gateway/backend-cuenca.adapter');
        const { defaultConfig } = await import('../../esb/utils/config');
        const adapter = new BackendCuencaAdapter(defaultConfig.endpoints.backendCuenca);
        servicios = await adapter.buscarServicios('');
        break;
      }
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown company: ${company}` })
        };
    }

    console.log(`[Netlify Function] ${servicios.length} carros encontrados`);

    const carros = servicios.map(servicio => ({
      id: servicio.IdServicio,
      marca: servicio.Nombre,
      modelo: servicio.Tipo || 'Sedan',
      precio: parseFloat(servicio.Precio) || 0,
      descripcion: servicio.Descripcion,
      foto: servicio.ImagenURL
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(carros)
    };

  } catch (error: any) {
    console.error('[Netlify Function] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error al buscar carros',
        message: error.message
      })
    };
  }
};

export { handler };
