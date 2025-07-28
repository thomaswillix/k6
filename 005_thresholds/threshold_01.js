import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =`https://quickpizza.grafana.com`;

export let options = {
    thresholds: {
        http_req_failed: ['rate < 0.01'], // http errors should be less than 1%
        http_req_duration:['p(95) < 200'], // 95% of requests should be below 200ms
        iterations: ['count >= 100', 'count <= 500'], // 100-500 iterations   
    }
};

export default function () {
    http.get(`${BASE_URL}/`);
    sleep(1);
}