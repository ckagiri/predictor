import startServer from './server.js';

(async () => {
  await startServer();
})().catch((error: unknown) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
