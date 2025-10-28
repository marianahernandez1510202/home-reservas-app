import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

// Configuración de la prueba de carga
export const options = {
  stages: [
    { duration: '20s', target: 10 },  // Ramp-up: 10 usuarios en 20s
    { duration: '40s', target: 30 },  // Carga media: 30 usuarios por 40s
    { duration: '20s', target: 50 },  // Pico de carga: 50 usuarios por 20s
    { duration: '20s', target: 20 },  // Reducción: vuelta a 20 usuarios
    { duration: '20s', target: 0 },   // Ramp-down: 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% de requests deben ser < 1s
    http_req_failed: ['rate<0.1'],     // Menos del 10% de requests pueden fallar
    errors: ['rate<0.15'],             // Menos del 15% de errores
  },
};

// URL base de la API (localhost para pruebas en CI/CD)
const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export default function () {
  // ========================================
  // PRUEBA 1: GET /api/properties
  // Simula usuarios navegando por las propiedades disponibles
  // ========================================
  
  const propertiesResponse = http.get(`${BASE_URL}/properties`, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'GetAllProperties' },
  });

  // Verificaciones para el endpoint de propiedades
  const propertiesCheck = check(propertiesResponse, {
    'GET /properties - status is 200': (r) => r.status === 200,
    'GET /properties - response time < 800ms': (r) => r.timings.duration < 800,
    'GET /properties - has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        // Verificar que la respuesta tenga un array de propiedades
        const properties = body.data || body;
        return Array.isArray(properties) && properties.length > 0;
      } catch (e) {
        console.error('Error parsing properties response:', e);
        return false;
      }
    },
  });

  // Registrar errores si falló alguna verificación
  errorRate.add(!propertiesCheck);

  if (!propertiesCheck) {
    console.log(`⚠️ Properties endpoint failed with status: ${propertiesResponse.status}`);
    sleep(2);
    return;
  }

  // Esperar entre 1 y 3 segundos (simular comportamiento real de usuario)
  sleep(Math.random() * 2 + 1);

  // ========================================
  // PRUEBA 2: GET /api/properties/:id
  // Simula usuarios viendo el detalle de una propiedad específica
  // ========================================
  
  // Obtener un ID de propiedad de la respuesta anterior
  let propertyId = null;
  try {
    const propertiesData = JSON.parse(propertiesResponse.body);
    const properties = propertiesData.data || propertiesData;
    
    if (Array.isArray(properties) && properties.length > 0) {
      // Seleccionar una propiedad aleatoria para simular navegación real
      const randomIndex = Math.floor(Math.random() * properties.length);
      propertyId = properties[randomIndex]._id || properties[randomIndex].id;
    }
  } catch (e) {
    console.error('Error extracting property ID:', e);
  }

  // Solo hacer la petición si tenemos un ID válido
  if (propertyId) {
    const propertyDetailResponse = http.get(`${BASE_URL}/properties/${propertyId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { name: 'GetPropertyDetail' },
    });

    // Verificaciones para el endpoint de detalle de propiedad
    const detailCheck = check(propertyDetailResponse, {
      'GET /properties/:id - status is 200': (r) => r.status === 200,
      'GET /properties/:id - response time < 500ms': (r) => r.timings.duration < 500,
      'GET /properties/:id - has property data': (r) => {
        try {
          const body = JSON.parse(r.body);
          // Verificar que la respuesta contenga datos de la propiedad
          const property = body.data || body;
          return property._id !== undefined || property.id !== undefined;
        } catch (e) {
          console.error('Error parsing property detail response:', e);
          return false;
        }
      },
    });

    errorRate.add(!detailCheck);

    if (!detailCheck) {
      console.log(`⚠️ Property detail failed for ID: ${propertyId}`);
    }

    // Simular que el usuario lee la información (1-2 segundos)
    sleep(Math.random() * 1 + 1);
  }

  // ========================================
  // PRUEBA 3: GET /api/bookings
  // Simula usuarios consultando reservas
  // ========================================
  
  const bookingsResponse = http.get(`${BASE_URL}/bookings`, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'GetBookings' },
  });

  // Verificaciones para el endpoint de bookings
  // Este endpoint puede requerir autenticación, así que aceptamos varios códigos
  check(bookingsResponse, {
    'GET /bookings - response received': (r) => r.status !== 0,
    'GET /bookings - response time < 1000ms': (r) => r.timings.duration < 1000,
    'GET /bookings - valid status code': (r) => {
      // Aceptar 200 (OK), 401 (No autenticado), 403 (No autorizado)
      return r.status === 200 || r.status === 401 || r.status === 403;
    },
  });

  // Pausa final antes de la siguiente iteración
  sleep(1);
}

// Función que se ejecuta al finalizar la prueba
export function handleSummary(data) {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     K6 LOAD TEST SUMMARY - HOME APP      ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  const metrics = data.metrics;
  
  console.log('📊 Test Duration:', Math.round(data.state.testRunDurationMs / 1000), 'seconds');
  console.log('👥 Max Virtual Users:', metrics.vus ? metrics.vus.values.max : 0);
  console.log('🌐 Total HTTP Requests:', metrics.http_reqs ? metrics.http_reqs.values.count : 0);
  
  if (metrics.http_req_failed) {
    const totalReqs = metrics.http_reqs ? metrics.http_reqs.values.count : 0;
    const failedCount = Math.round(metrics.http_req_failed.values.passes || 0);
    const successCount = totalReqs - failedCount;
    console.log('✅ Successful Requests:', successCount);
    console.log('❌ Failed Requests:', failedCount);
  }
  
  if (metrics.http_req_duration) {
    console.log('⏱️  Avg Response Time:', Math.round(metrics.http_req_duration.values.avg), 'ms');
    console.log('📈 P95 Response Time:', Math.round(metrics.http_req_duration.values['p(95)']), 'ms');
    console.log('📉 P99 Response Time:', Math.round(metrics.http_req_duration.values['p(99)']), 'ms');
  }
  
  const successRate = metrics.http_req_failed ? (1 - (metrics.http_req_failed.values.rate || 0)) : 0;
  console.log('✅ Success Rate:', Math.round(successRate * 100), '%');
  console.log('\n' + '═'.repeat(45) + '\n');
  
  return {
    'summary.json': JSON.stringify(data),
    stdout: '', // Ya imprimimos nuestro resumen personalizado arriba
  };
}