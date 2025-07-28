import http from 'k6/http';
import { sleep, check } from 'k6';

const BASE_URL = "https://quickpizza.grafana.com"

export default function() {
    const response = http.get(`${BASE_URL}/`);
    check(response, { 
        'response status code is 200': (r) => r.status == 200,
        'response duration < 500 ms': (r) => r.timings.duration < 500,
        'response body contains field "message" and is not an empty string':
            (r) => r.json().message !== undefined && r.json().message !== '',
    });
    
    sleep(1);
}
