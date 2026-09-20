import express from 'express';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
let pythonProcess: ChildProcess | null = null;

function startBackendService() {
  console.log('[LexPilot] Launching FastAPI backend on 127.0.0.1:8001...');
  
  pythonProcess = spawn('python3', ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', '8001'], {
    stdio: 'inherit',
    env: { ...process.env },
  });

  pythonProcess.on('error', (err) => {
    console.error('[LexPilot] Failed to spawn Python backend process:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[LexPilot] Python backend process exited with code ${code}, signal ${signal}`);
  });
}

function cleanup() {
  if (pythonProcess && !pythonProcess.killed) {
    console.log('[LexPilot] Terminating Python backend process...');
    pythonProcess.kill('SIGTERM');
  }
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('exit', () => {
  cleanup();
});

async function startServer() {
  // Start backend
  startBackendService();

  const app = express();

  // Proxy /api calls to the FastAPI backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8001',
      changeOrigin: true,
    })
  );

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LexPilot] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LexPilot] Failed to start server:', err);
  cleanup();
  process.exit(1);
});
