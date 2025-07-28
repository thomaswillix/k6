import http from 'k6/http';
import { check, sleep } from 'k6';

// Config of the options of the test
export let options = {
    // Config of the number of VU's (Virtual Users) and the test duration for each stage
    scenarios: {
        constant_request_rate_20_VUs: {
          executor: 'constant-arrival-rate',
          rate: 3,
          timeUnit: '1s', // 3 iterations per second, i.e. 3 RPS
          duration: '10m',
          preAllocatedVUs: 20,
          maxVUs: 60, // if the preAllocatedVUs are not enough, we can initialize more
        }
      },
    thresholds: {
        http_req_failed: ['rate<0.05'], // http errors should be less than 5%
        http_req_duration:['p(95)<30000'] // 95% of requests should be below 30000ms (30s)
    }
};

export default function () {
    const api_key = __ENV.API_KEY // Environment Variables
    // Definition of the endpont's URL
    const api = __ENV.API
    const base_url = __ENV.BASE_URL
    const endpoint =`https://${api}.${base_url}/${__ENV.ENDPOINT}`;

    // Def of the payload we'll send in the POST request
    const payload = JSON.stringify({    
        "messages": [
            {
               "type": "human",
                "content": "qué cosas se pueden llevar en el avión y con qué medidas máximas?, medidas . x . x"
            }
        ]
    });

    const headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json',
    };

    // POST request
    let res = http.post(endpoint, payload, { headers: headers });

    // Verification of the response
    check(res, {
        'is status 200': (r) => r.status === 200,
        'response is not empty': (r) => {
            const jsonResponse = r.json();
            console.log(jsonResponse)
            return  jsonResponse.response.length > 0 && jsonResponse.response !== '';
        },
        'req duration < 5s' : (r) => r.timings.duration < 5000, // r.timings.duration == latencia
    });
}