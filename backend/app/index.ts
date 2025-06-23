import { startWebServer } from './server.js';

(async () => {
  await startWebServer();
})().catch((error: unknown) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
