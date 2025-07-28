import http from 'k6/http';
import exec from 'k6/execution';

export default function (){
    http.get('https://www.google.com')
    const durationInSecond = (exec.instance.currentTestRunDuration / 1000).toFixed(2);

    console.log(`Iteration: ${exec.scenario.iterationInTest}, `
        + `VU: ${exec.vu.idInTest}, `
        + `Script has been running for: ${durationInSecond} seconds`);
}