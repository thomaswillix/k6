import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'; // Lib para parsear CSV
import { sleep, check } from 'k6';
import { vu } from 'k6/execution'; // Para obtener info del VU

import { SharedArray } from 'k6/data'; // Objeto k6 para compartir datos

// --- Init Context ---
const csvData = new SharedArray('datosDeUsuarios', function () {
  // Cargar archivo (ruta relativa al CWD) UNA VEZ
  const fileContent = open('usuarios.csv');
  // Parsear CSV (header: true usa la 1ra fila como claves)
  return papaparse.parse(fileContent, { header: true }).data;
  // .data da un array de objetos: [{username: 'user01', ...}, ...]
});
// ¡csvData ahora es un array compartido y de solo lectura!


export default function() {
// Estrategia 1: Secuencial por VU (cada VU toma una línea)
  const userIndex = vu.idInTest - 1; // idInTest (1-based) a índice (0-based)
  const currentUser = csvData[userIndex % csvData.length]; // Módulo (%) asegura índice válido

// Estrategia 2: Aleatoria
  // const randomIndex = Math.floor(Math.random() * csvData.length);
  // const currentUser = csvData[randomIndex];

  console.log(`VU ${vu.idInTest} usando: ${currentUser.username}`);

  // Usar los datos en peticiones:
  // http.post(urlLogin, { user: currentUser.username, pwd: currentUser.password });
  sleep(1);
}