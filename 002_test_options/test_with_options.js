import http from 'k6/http';
import exec from 'k6/execution';
import { sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// This file will run with the specified options
export const options = {
    vus: 10,
    duration: '5m',
    iterations: 50,
};

export default function (){
    http.get('https://www.google.com')
    const durationInSecond = (exec.instance.currentTestRunDuration / 1000).toFixed(2);

    console.log(`Iteration: ${exec.scenario.iterationInTest}, `
        + `VU: ${exec.vu.idInTest}, `
        + `Script has been running for: ${durationInSecond} seconds`);
    
    sleep(randomIntBetween(1, 3));    
}