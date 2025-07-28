import http from 'k6/http';
import { check, sleep } from 'k6';

// Config of the options of the test
export let options = {
    scenarios: {
       constant_ramp_up_test: {
          executor: 'ramping-arrival-rate',
          startRate: 4,
          timeUnit: '1s', // 2 iterations per second, i.e. 2 RPS
          preAllocatedVUs: 75,
          stages: [
            // Start 2 iterations per `timeUnit` for the first thirty seconds.
            { target: 4, duration: '10s' },
            // Linearly ramp-up to starting 4 iterations per `timeUnit` over the following minute.
            { target: 7, duration: '20s' },
            // Continue ramp-up to 6 iterations per `timeUnit` for the following two minutes.
            { target: 10, duration: '20s' },
            // Linearly ramp-down to starting 10 iterations per `timeUnit` over the last 30 seconds.
            { target: 15, duration: '1m' },
          ]
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