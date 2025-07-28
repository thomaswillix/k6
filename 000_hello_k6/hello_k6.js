import http from 'k6/http';

export default function (){
    const url = 'https://www.google.com';
    const res = http.get(url);

    console.log(res.body)
}