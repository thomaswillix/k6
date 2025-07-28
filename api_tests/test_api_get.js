import http from 'k6/http';
import { sleep, check } from 'k6';

//Aquí se inician las configuraciones globales (init de las options)
export const options = {
  stages: [
    // Array de etapas (se ejecutan en orden)
    { duration: '10s', target: 72 }, 
    { duration: '30s', target: 72 },  
    { duration: '5s', target: 0 },
  ],
};

//Crear una constante, darle el valor de la url,
const BASE_URL = "https://quickpizza.grafana.com"

// VU code (virtual user code) es el que van a ejecutar cada uno de los usuarios
export default function() {
  const res = http.get(`${BASE_URL}/`);
  check(res, { 'status was 200': (r) => r.status == 200})
  sleep(1);
}
