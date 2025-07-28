import http from 'k6/http';
import { sleep } from 'k6';

//Crear una constante, darle el valor de la url,
const BASE_URL = "https://quickpizza.grafana.com"

// VU code (virtual user code) es el que van a ejecutar cada uno de los usuarios
export default function() {
    const res = http.get(`${BASE_URL}/`);
    console.log('Response status code: ' + res.status)
    console.log('Response headers: ' + JSON.stringify(res.headers))
    console.log('Response body: ' + res.body)

    sleep(1);
}
