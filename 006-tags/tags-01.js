import http from 'k6/http';
import { sleep } from 'k6';

const BASE_URL = 'http://localhost:8888/alphamart';

export default function () {
    const response = http.get(`${BASE_URL}/api/basic/slow-if-error`);
    // Add your desired assertions or other logic here
    sleep(1);
}