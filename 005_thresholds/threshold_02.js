import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =`https://quickpizza.grafana.com`;

// run this file with: k6 run threshold_02.js --config configuration.json --vus 20 --iterations 99
export default function () {
    http.get(`${BASE_URL}/`);
    sleep(1);
}