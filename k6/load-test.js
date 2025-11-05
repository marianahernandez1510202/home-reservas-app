import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

// Configuración de la prueba de carga
export const options = {
  //  Configuración para K6 Cloud
  ext: {
    loadimpact: {
      projectID: 5252933,  // Tu project ID de K6 Cloud
      name: 'HOME App - CI/CD Load Test',
      note: 'Load testing for HOME reservation app',
    }
  },
  
  stages: [
    { duration: '20s', target: 10 },  // Ramp-up: 10 usuarios en 20s
    { duration: '40s', target: 30 },  // Carga media: 30 usuarios por 40s
    { duration: '20s', target: 50 },  // Pico de carga: 50 usuarios por 20s
    { duration: '20s', target: 20 },  // Reducción: vuelta a 20 usuarios
    { duration: '20s', target: 0 },   // Ramp-down: 0 usuarios
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests deben ser < 2s
    http_req_failed: ['rate<0.05'],    // Menos del 5% de requests pueden fallar
  },
  
  //  Tags para mejor organización en K6 Cloud
  tags: {
    environment: 'ci-cd',
    app: 'home-reservas',
  },
};

// URL base de la API (localhost para pruebas en CI/CD)
const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export default function () {

  const propertiesResponse = http.get(`${BASE_URL}/properties`, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { 
      name: 'GetAllProperties',
      endpoint: '/properties',
    },
  });

  // Verificaciones para el endpoint de propiedades
  const propertiesCheck = check(propertiesResponse, {
    'GET /properties - status is 200': (r) => r.status === 200,
    'GET /properties - response time < 800ms': (r) => r.timings.duration < 800,
    'GET /properties - has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        const properties = body.data || body;
        return Array.isArray(properties) && properties.length > 0;
      } catch (e) {
        console.error('Error parsing properties response:', e);
        return false;
      }
    },
  });

  errorRate.add(!propertiesCheck);

  if (!propertiesCheck) {
    console.log(`⚠️ Properties endpoint failed with status: ${propertiesResponse.status}`);
    sleep(2);
    return;
  }

  sleep(Math.random() * 2 + 1);
  
  let propertyId = null;
  try {
    const propertiesData = JSON.parse(propertiesResponse.body);
    const properties = propertiesData.data || propertiesData;
    
    if (Array.isArray(properties) && properties.length > 0) {
      const randomIndex = Math.floor(Math.random() * properties.length);
      propertyId = properties[randomIndex]._id || properties[randomIndex].id;
    }
  } catch (e) {
    console.error('Error extracting property ID:', e);
  }

  if (propertyId) {
    const propertyDetailResponse = http.get(`${BASE_URL}/properties/${propertyId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { 
        name: 'GetPropertyDetail',
        endpoint: '/properties/:id',
      },
    });

    const detailCheck = check(propertyDetailResponse, {
      'GET /properties/:id - status is 200': (r) => r.status === 200,
      'GET /properties/:id - response time < 500ms': (r) => r.timings.duration < 500,
      'GET /properties/:id - has property data': (r) => {
        try {
          const body = JSON.parse(r.body);
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

    sleep(Math.random() * 1 + 1);
  }

  
  const bookingsResponse = http.get(`${BASE_URL}/bookings`, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { 
      name: 'GetBookings',
      endpoint: '/bookings',
    },
  });

  check(bookingsResponse, {
    'GET /bookings - response received': (r) => r.status !== 0,
    'GET /bookings - response time < 1000ms': (r) => r.timings.duration < 1000,
    'GET /bookings - valid status code': (r) => {
      return r.status === 200 || r.status === 401 || r.status === 403;
    },
  });

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
    'stdout': '', // Ya imprimimos nuestro resumen personalizado arriba
  };
}