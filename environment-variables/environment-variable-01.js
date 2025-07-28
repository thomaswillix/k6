import http from 'k6/http';
import { check, sleep } from 'k6';
import encoding from 'k6/encoding';

const BASE_URL = __ENV.SERVER_ADDRESS;

export function setup() {
    const username = __ENV.USERNAME;
    const password = __ENV.PASSWORD;
    const plainCredential = `${username}:${password}`;

    const base64Credential = encoding.b64encode(plainCredential);

    const params = {
        headers: {
            'Authorization': `Basic ${base64Credential}`
        }
    };

    let response = http.post(`${BASE_URL}/api/auth/login`, null, params);

    let data = {
        accessToken: response.json('access-token'),
    }

    return data;
}

export default function (data) {
    let headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${data.accessToken}`
    };

    let response = http.get(`${BASE_URL}/api/product/search?name=chocolate`, { headers });

    check(response, {
        'Status is 2xx': (r) => r.status >= 200 && r.status < 300,
        'Data is not empty': (r) => r.json('data').length > 0,
    });

    sleep(1);
}