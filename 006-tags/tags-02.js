import http from 'k6/http';
import { sleep } from 'k6';

const BASE_URL = 'http://localhost:8888/alphamart';

export let options = {
    vus: 40,
    duration: '5s',
    thresholds: {
        'http_req_duration{expected_response: false}': ['p(95) < 3000'],
        'http_req_duration{expected_response: true}': ['p(95) < 200'],
        'http_req_duration{status: 200}': ['p(95) < 200'],
        'http_req_duration{status: 202}': ['p(95) < 200'],
        'http_req_duration{status: 400}': ['p(95) < 3000'],
        'http_req_duration{status: 403}': ['p(95) < 3000'],
        'http_req_duration{status: 415}': ['p(95) < 3000'],
        'http_req_duration{status: 500}': ['p(95) < 3000'],
        'http_reqs{status: 200}': ['count > 1'],
        'http_reqs{status: 202}': ['count > 1'],
        'http_reqs{status: 400}': ['count > 1'],
        'http_reqs{status: 403}': ['count > 1'],
        'http_reqs{status: 415}': ['count > 1'],
        'http_reqs{status: 500}': ['count > 1'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/api/basic/slow-if-error`);
    // Add your desired assertions or other logic here
    sleep(1);
}