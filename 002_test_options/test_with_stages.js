import http from 'k6/http';
import { sleep, check } from 'k6';
import { vu } from 'k6/execution'; // Info del VU actual

//Aquí se inician las configuraciones globales (init de las options)
export const options = {
  stages: [										//Este código está dentro de las options
    // Array de etapas (se ejecutan en orden)
    { duration: '30s', target: 10 }, // 1. Ramp-up: 0 -> 10 VUs en 30s
    { duration: '1m', target: 10 },  // 2. Plateau: Mantener 10 VUs por 1m
    { duration: '15s', target: 20 }, // 3. Ramp-up: 10 -> 20 VUs en 15s
    { duration: '30s', target: 20 }, // 4. Plateau: Mantener 20 VUs por 30s
    { duration: '10s', target: 0 },  // 5. Ramp-down: 20 -> 0 VUs en 10s
  ],
  thresholds: {										//Este código está dentro de las options
    // NombreMétrica: [ 'condición1', 'condición2', ... ]
    // La prueba FALLARÁ si CUALQUIER condición no se cumple.

    'http_req_duration': ['p(95)<500'], // 95% de peticiones < 500ms
    'http_req_failed': ['rate<0.01'],   // Tasa de errores HTTP < 1%
    'checks': ['rate>=0.99'],           // Tasa de éxito de checks >= 99%
    // 'iteration_duration': ['avg<1500'], // Iteración promedio < 1.5s
  },
};

//Crear una constante, darle el valor de la url,
const BASE_URL = "https://quickpizza.grafana.com"

// VU code (virtual user code) es el que van a ejecutar cada uno de los usuarios
export default function() {
  //console.log("Hola mundo");
  const res = http.get(`${BASE_URL}/`);
  if(res.status === 400)
    console.log("¡Petición exitosa!")
  else console.log(`Duración Req: ${res.timings.duration} ms`);

  
  sleep(1);
}
