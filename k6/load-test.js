import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

// Configuración de la prueba de carga
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up: 10 usuarios en 30s
    { duration: '1m', target: 50 },   // Carga media: 50 usuarios por 1min
    { duration: '30s', target: 100 }, // Pico de carga: 100 usuarios por 30s
    { duration: '1m', target: 50 },   // Reducción: vuelta a 50 usuarios
    { duration: '30s', target: 0 },   // Ramp-down: 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests deben ser < 500ms
    http_req_failed: ['rate<0.05'],   // Menos del 5% de requests pueden fallar
    errors: ['rate<0.1'],             // Menos del 10% de errores
  },
};

// URL base de la API (localhost para pruebas locales)
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
    tags: { name: 'GetProperties' },
  });

  // Verificaciones para el endpoint de propiedades
  const propertiesCheck = check(propertiesResponse, {
    'GET /properties - status is 200': (r) => r.status === 200,
    'GET /properties - response time < 500ms': (r) => r.timings.duration < 500,
    'GET /properties - has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        // Verificar que la respuesta tenga datos válidos
        return body.success !== false && (Array.isArray(body.data) || Array.isArray(body));
      } catch (e) {
        console.error('Error parsing properties response:', e);
        return false;
      }
    },
  });

  // Registrar errores si falló alguna verificación
  errorRate.add(!propertiesCheck);

  // Esperar entre 1 y 3 segundos (simular comportamiento real de usuario)
  sleep(Math.random() * 2 + 1);

  // ========================================
  // PRUEBA 2: GET /api/properties/:id
  // Simula usuarios viendo el detalle de una propiedad específica
  // ========================================
  
  // Intentar obtener un ID de propiedad de la respuesta anterior
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
      'GET /properties/:id - response time < 300ms': (r) => r.timings.duration < 300,
      'GET /properties/:id - has property data': (r) => {
        try {
          const body = JSON.parse(r.body);
          // Verificar que la respuesta contenga datos de la propiedad
          return body.success !== false && (body._id !== undefined || body.id !== undefined || body.data);
        } catch (e) {
          console.error('Error parsing property detail response:', e);
          return false;
        }
      },
    });

    errorRate.add(!detailCheck);

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
  check(bookingsResponse, {
    'GET /bookings - response received': (r) => r.status !== 0,
    'GET /bookings - response time < 1000ms': (r) => r.timings.duration < 1000,
    'GET /bookings - valid status code': (r) => r.status === 200 || r.status === 401 || r.status === 403,
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
  console.log('👥 Max Virtual Users:', metrics.vus.values.max);
  console.log('🌐 Total HTTP Requests:', metrics.http_reqs.values.count);
  console.log('❌ Failed Requests:', Math.round(metrics.http_req_failed.values.passes || 0));
  console.log('⏱️  Avg Response Time:', Math.round(metrics.http_req_duration.values.avg), 'ms');
  console.log('📈 P95 Response Time:', Math.round(metrics.http_req_duration.values['p(95)']), 'ms');
  console.log('📉 P99 Response Time:', Math.round(metrics.http_req_duration.values['p(99)']), 'ms');
  console.log('✅ Success Rate:', Math.round((1 - (metrics.http_req_failed.values.rate || 0)) * 100), '%');
  console.log('\n' + '═'.repeat(45) + '\n');
  
  return {
    'summary.json': JSON.stringify(data),
    stdout: '', // Ya imprimimos nuestro resumen personalizado arriba
  };
}