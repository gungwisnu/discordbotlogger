// Handle unhandled rejections and uncaught exceptions to prevent the process from crashing on temporary/network errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception] Error:', error);
  process.exit(1);
});

const db = require('./database');
const { startBot } = require('./bot');
const { startServer } = require('./server');
require('dotenv').config();

console.log('----------------------------------------------------');
console.log('🤖 MENJALANKAN DISCORD LOGGER & ANALYTICS APPLICATION');
console.log('----------------------------------------------------');

(async () => {
  try {
    // Initialize Database (MySQL or local file fallback)
    await db.initDatabase();

    // Start the Express API server
    startServer();

    // Start the Discord Bot client
    startBot();

    console.log('Aplikasi gabungan berjalan dengan sukses!');
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
})();
