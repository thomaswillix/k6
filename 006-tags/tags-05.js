import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { sleep } from 'k6';
import http from 'k6/http';

const BASE_URL = 'http://localhost:8888/alphamart';

export default function () {
    const lowDelay = randomIntBetween(100, 500);
    const highDelay = randomIntBetween(600, 2000);

    http.get(`${BASE_URL}/api/basic/custom-delay`,
        {
            tags: {
                customDelay: 'none',
            }
        }
    );

    http.get(`${BASE_URL}/api/basic/custom-delay?delay=${lowDelay}`,
        {
            tags: {
                customDelay: 'low',
            }
        }
    );

    http.get(`${BASE_URL}/api/basic/custom-delay?delay=${highDelay}`,
        {
            tags: {
                customDelay: 'high',
            }
        }
    );

    sleep(1);
}