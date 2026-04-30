import { createServer } from 'http';
import { readFileSync, watchFile, existsSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 7777;
const VIEWER_DIR = join(__dirname, '../viewer');

// MIME types
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.json': 'application/json',
};

// Event store for SSE clients
const clients = new Set();
let eventHistory = [];
const MAX_HISTORY = 1000;

// Parse agent event from various formats
function parseEvent(data) {
  // Beaver-bot format: { type, agent, tool, message, timestamp }
  // Claude Code hook format: { event_type, ... }
  // Normalize to unified format
  return {
    id: Date.now(),
    type: data.type || data.event_type || 'unknown',
    agent: data.agent || data.agent_type || 'worker',
    tool: data.tool || null,
    message: data.message || data.text || '',
    file: data.file || null,
    status: data.status || 'active',
    timestamp: data.timestamp || Date.now(),
    raw: data,
  };
}

// Broadcast event to all SSE clients
function broadcast(event) {
  const normalized = parseEvent(event);
  eventHistory.push(normalized);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.shift();
  }
  
  const payload = `data: ${JSON.stringify(normalized)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (e) {
      clients.delete(client);
    }
  }
}

// Send initial history to new client
function sendHistory(client) {
  for (const event of eventHistory.slice(-100)) {
    client.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

// Parse request body for POST
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Route handler
function routeHandler(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // SSE endpoint - GET /events
  if (url.pathname === '/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    clients.add(res);
    sendHistory(res);
    
    req.on('close', () => clients.delete(res));
    return;
  }
  
  // Event ingestion - POST /event
  if (url.pathname === '/event' && req.method === 'POST') {
    parseBody(req).then(data => {
      broadcast(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }
  
  // Batch events - POST /events
  if (url.pathname === '/events' && req.method === 'POST') {
    parseBody(req).then(data => {
      const events = Array.isArray(data) ? data : data.events || [data];
      for (const event of events) {
        broadcast(event);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: events.length }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }
  
  // REST API endpoints
  if (url.pathname === '/history' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(eventHistory.slice(-100)));
    return;
  }
  
  if (url.pathname === '/clear' && req.method === 'POST') {
    eventHistory = [];
    broadcast({ type: 'system', message: 'History cleared', status: 'done' });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  
  if (url.pathname === '/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      clients: clients.size,
      events: eventHistory.length,
      uptime: process.uptime(),
    }));
    return;
  }
  
  // Serve static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = join(VIEWER_DIR, filePath);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(VIEWER_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (existsSync(filePath)) {
    const ext = '.' + filePath.split('.').pop();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}

// Create HTTP server
const server = createServer(routeHandler);

server.listen(PORT, () => {
  console.log(`🎮 Pixel Agent Viewer running at http://localhost:${PORT}`);
  console.log(`   SSE: http://localhost:${PORT}/events`);
  console.log(`   API: POST /event, GET /history, POST /clear`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.close();
  process.exit(0);
});

export { broadcast, server };
