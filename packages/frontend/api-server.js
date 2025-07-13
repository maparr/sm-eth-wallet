import http from 'http';
import walletHandler from './api/wallet/generate.js';
import signHandler from './api/transaction/sign.js';

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    req.body = body ? JSON.parse(body) : {};
    
    // Create Vercel-compatible response object
    const vercelRes = {
      setHeader: res.setHeader.bind(res),
      status: (code) => {
        res.statusCode = code;
        return vercelRes;
      },
      json: (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      },
      end: res.end.bind(res)
    };
    
    // Route to appropriate handler
    if (req.url === '/api/wallet/generate' && req.method === 'POST') {
      walletHandler(req, vercelRes);
    } else if (req.url === '/api/transaction/sign' && req.method === 'POST') {
      signHandler(req, vercelRes);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
});

server.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});