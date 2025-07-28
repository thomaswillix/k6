import { sleep, check } from 'k6';
import http from 'k6/http';

//Aquí se inician las configuraciones globales (init de las options)
export const options = {
  scenarios: {
    request_rate_20rps_60s: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '2m',
      preAllocatedVUs: 5, // how large the initial pool of VUs would be
      maxVUs: 10, // if the preAllocatedVUs are not enough, we can initialize more
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration:['p(95)<300'] // 95% of requests should be below 30000ms (30s)
  }
};

//Crear una constante, darle el valor de la url,
const BASE_URL = "https://quickpizza.grafana.com"

// VU code (virtual user code) es el que van a ejecutar cada uno de los usuarios
export default function() {
  const payload = JSON.stringify({
    name: 'lorem',
    surname: 'ipsum',
  });
  const headers = { 'Content-Type': 'application/json'};
  const res = http.post(BASE_URL+'/api/post', payload, {headers});
  check(res, { 
    'status was 200 or 201': (r) => r.status == 200 || r.status == 201,
    'req duration < 5s' : (r) => r.timings.duration < 150, // r.timings.duration == latencia
  });
}