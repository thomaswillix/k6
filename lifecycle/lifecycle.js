import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ============================================================================
// INIT CONTEXT - Se ejecuta una sola vez al inicio, antes que todo
// ============================================================================
// En esta fase se inicializan variables, se cargan datos externos,
// se configuran métricas personalizadas y se definen constantes.
// Todo lo que esté aquí se ejecuta una sola vez por VU (Virtual User)

console.log('🚀 Iniciando configuración del test...');

// Configuración del test - define cuántos usuarios virtuales y por cuánto tiempo
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up: aumenta a 10 usuarios en 30s
    { duration: '1m', target: 10 },   // Mantiene 10 usuarios por 1 minuto  
    { duration: '30s', target: 20 },  // Aumenta a 20 usuarios en 30s
    { duration: '1m', target: 20 },   // Mantiene 20 usuarios por 1 minuto
    { duration: '30s', target: 0 },   // Ramp-down: reduce a 0 usuarios en 30s
  ],
  thresholds: {
    // Criterios de éxito/fallo del test
    http_req_duration: ['p(95)<2000'],  // 95% de requests deben ser < 2s
    http_req_failed: ['rate<0.05'],     // Menos del 5% de requests pueden fallar
    checks: ['rate>0.95'],              // Más del 95% de checks deben pasar
  },
};

// Métricas personalizadas que se pueden usar durante el test
const loginSuccessRate = new Rate('login_success_rate');
const apiResponseTime = new Trend('api_response_time');
const errorCounter = new Counter('custom_errors');

// Datos de prueba que se usarán durante el test
const testUsers = [
  { username: 'user1@example.com', password: 'password123' },
  { username: 'user2@example.com', password: 'password456' },
  { username: 'user3@example.com', password: 'password789' },
];

// URLs base que se usarán en el test
const BASE_URL = 'https://httpbin.org';

console.log('✅ Configuración inicial completada');

// ============================================================================
// SETUP FUNCTION - Se ejecuta una sola vez antes de que empiecen los VUs
// ============================================================================
// Aquí se prepara el entorno: crear datos de prueba, hacer login de admin,
// preparar bases de datos, etc. El valor que retorna está disponible para
// todos los VUs durante el test.

export function setup() {
  console.log('🔧 Ejecutando setup - preparando entorno de pruebas...');
  
  // Ejemplo: hacer una llamada para preparar datos de prueba
  const setupResponse = http.get(`${BASE_URL}/uuid`);
  
  check(setupResponse, {
    'Setup request successful': (r) => r.status === 200,
  });
  
  // Simular preparación de datos
  const testData = {
    sessionToken: 'fake-admin-token-12345',
    testStartTime: Date.now(),
    apiKey: 'test-api-key-67890',
  };
  
  console.log('✅ Setup completado - datos preparados');
  
  // Los datos retornados estarán disponibles como parámetro en la función default
  return testData;
}

// ============================================================================
// DEFAULT FUNCTION - El corazón del test, se ejecuta por cada VU repetidamente
// ============================================================================
// Esta función se ejecuta continuamente por cada usuario virtual durante
// toda la duración del test. Aquí van las acciones que simulan el comportamiento
// real de los usuarios.

export default function (data) {
  // 'data' contiene lo que retornó la función setup()
  
  // Seleccionar un usuario aleatorio para esta iteración
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  console.log(`👤 VU ${__VU} - Iteración ${__ITER} - Simulando usuario: ${user.username}`);
  
  // ========================================
  // ESCENARIO 1: Login de usuario
  // ========================================
  
  const loginPayload = JSON.stringify({
    username: user.username,
    password: user.password,
    api_key: data.apiKey // Usando datos del setup
  });
  
  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.sessionToken}`,
    },
  };
  
  // Simular llamada de login
  const loginResponse = http.post(`${BASE_URL}/post`, loginPayload, loginParams);
  
  // Verificar que el login fue exitoso
  const loginSuccess = check(loginResponse, {
    'Login status is 200': (r) => r.status === 200,
    'Login response time < 1000ms': (r) => r.timings.duration < 1000,
    'Login response contains data': (r) => r.json().hasOwnProperty('json'),
  });
  
  // Registrar métrica personalizada
  loginSuccessRate.add(loginSuccess);
  apiResponseTime.add(loginResponse.timings.duration);
  
  if (!loginSuccess) {
    errorCounter.add(1);
    console.log(`❌ Login falló para usuario ${user.username}`);
  }
  
  // Pausa realista entre acciones (simula tiempo de lectura del usuario)
  sleep(1);
  
  // ========================================
  // ESCENARIO 2: Consultar datos del usuario
  // ========================================
  
  if (loginSuccess) {
    const userDataResponse = http.get(`${BASE_URL}/get?user=${user.username}`, {
      headers: {
        'Authorization': `Bearer ${data.sessionToken}`,
      },
    });
    
    check(userDataResponse, {
      'User data status is 200': (r) => r.status === 200,
      'User data response time < 500ms': (r) => r.timings.duration < 500,
      'Response contains args': (r) => r.json().hasOwnProperty('args'),
    });
    
    apiResponseTime.add(userDataResponse.timings.duration);
  }
  
  // Pausa entre requests
  sleep(2);
  
  // ========================================
  // ESCENARIO 3: Actualizar perfil de usuario
  // ========================================
  
  const updatePayload = JSON.stringify({
    user_id: Math.floor(Math.random() * 1000),
    profile_data: {
      last_login: new Date().toISOString(),
      session_count: Math.floor(Math.random() * 100),
    }
  });
  
  const updateResponse = http.put(`${BASE_URL}/put`, updatePayload, loginParams);
  
  check(updateResponse, {
    'Update status is 200': (r) => r.status === 200,
    'Update response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  // Pausa final antes de la siguiente iteración
  sleep(1);
  
  console.log(`✅ VU ${__VU} completó iteración ${__ITER}`);
}

// ============================================================================
// TEARDOWN FUNCTION - Se ejecuta una sola vez al final del test
// ============================================================================
// Aquí se hace la limpieza: eliminar datos de prueba, cerrar conexiones,
// enviar reportes, limpiar caches, etc. Recibe como parámetro los datos
// que retornó la función setup().

export function teardown(data) {
  console.log('🧹 Ejecutando teardown - limpiando entorno de pruebas...');
  
  // Ejemplo: limpiar datos de prueba creados durante el setup
  const cleanupResponse = http.delete(`${BASE_URL}/delete`, {
    headers: {
      'Authorization': `Bearer ${data.sessionToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  check(cleanupResponse, {
    'Cleanup request successful': (r) => r.status === 200,
  });
  
  // Calcular estadísticas finales
  const testDuration = Date.now() - data.testStartTime;
  console.log(`📊 Test completado en ${testDuration}ms`);
  
  // Simular envío de reporte final
  const reportData = {
    test_duration: testDuration,
    session_token: data.sessionToken,
    cleanup_status: 'completed',
  };
  
  const reportResponse = http.post(`${BASE_URL}/post`, JSON.stringify(reportData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  console.log('✅ Teardown completado - limpieza finalizada');
}

// ============================================================================
// RESUMEN DE LAS FASES:
// ============================================================================
// 
// 1. INIT: Se ejecuta 1 vez por VU al inicio
//    - Configurar opciones del test
//    - Definir métricas personalizadas  
//    - Cargar datos estáticos
//    - Inicializar constantes
//
// 2. SETUP: Se ejecuta 1 vez antes de empezar el test
//    - Preparar entorno de pruebas
//    - Crear datos de prueba
//    - Hacer configuraciones iniciales
//    - Retorna datos para usar en default function
//
// 3. DEFAULT: Se ejecuta repetidamente por cada VU
//    - Contiene la lógica principal del test
//    - Simula acciones reales de usuarios
//    - Hace requests HTTP y valida respuestas
//    - Registra métricas
//
// 4. TEARDOWN: Se ejecuta 1 vez al final del test
//    - Limpia datos de prueba
//    - Cierra conexiones
//    - Genera reportes finales
//    - Restaura el estado inicial
//
// ============================================================================