import { sleep } from 'k6';
import http from 'k6/http';

const BASE_URL = "https://quickpizza.grafana.com"

// VU code (virtual user code) es el que van a ejecutar cada uno de los usuarios
export default function() {
    const payload = JSON.stringify({
        name: 'lorem',
        surname: 'ipsum',
    });
    const headers = { 'Content-Type': 'application/json'};
    const res = http.post(BASE_URL+'/api/post', payload, {headers});
    
    console.log('Response status code: ' + res.status)
    console.log('Response headers: ' + JSON.stringify(res.headers))
    console.log('Response body: ' + res.body)

    sleep(1)
}