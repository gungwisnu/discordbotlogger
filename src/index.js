const { startBot } = require('./bot');
const { startServer } = require('./server');
require('dotenv').config();

console.log('----------------------------------------------------');
console.log('🤖 MENJALANKAN DISCORD LOGGER & ANALYTICS APPLICATION');
console.log('----------------------------------------------------');

// Start the Express API server
startServer();

// Start the Discord Bot client
startBot();

console.log('Aplikasi gabungan berjalan dengan sukses!');
