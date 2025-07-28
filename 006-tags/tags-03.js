import http from 'k6/http';
import { sleep } from 'k6';

const BASE_URL = 'http://localhost:8888/alphamart';

export default function () {
    const response = http.get(`${BASE_URL}/api/basic/slow-if-error`);
    const responseTwo = http.get(`${BASE_URL}/api/basic/fast`);

    sleep(1);
}