const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { 
    LAN_ACCESS_MODE, 
    SERVER_PORT,
    ALLOWED_IPS
} = require('./config');

const app = express();
const PORT = SERVER_PORT;

// Trust proxy headers
app.set('trust proxy', true);

// Request logging
const logFile = path.join(__dirname, 'access.log');
function logRequest(req, message = '') {
    const timestamp = new Date().toISOString();
    const clientIp = req.ip || req.connection.remoteAddress;
    const logEntry = `${timestamp} | ${clientIp} | ${req.method} ${req.originalUrl} | ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
    console.log(logEntry.trim());
}

// Check if LAN_ACCESS_MODE is enabled
if (!LAN_ACCESS_MODE) {
    console.error('='.repeat(60));
    console.error('❌ ERROR: LAN_ACCESS_MODE is disabled');
    console.error('='.repeat(60));
    console.error('The Express server requires LAN_ACCESS_MODE to be enabled.');
    console.error('');
    console.error('To start the server in LAN mode, use:');
    console.error('  LAN_ACCESS_MODE=true npm run server');
    console.error('');
    console.error('For airgapped mode (localhost only), use:');
    console.error('  npm start');
    console.error('='.repeat(60));
    process.exit(1);
}

// Get local IP address for display
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Security Middleware

// 1. IP Whitelist Filter
if (ALLOWED_IPS && ALLOWED_IPS.length > 0) {
    app.use((req, res, next) => {
        const clientIp = req.ip || req.connection.remoteAddress;
        const normalizedClientIp = clientIp.replace(/^::ffff:/, ''); // Remove IPv6 prefix
        
        if (ALLOWED_IPS.includes(normalizedClientIp) || clientIp === '127.0.0.1' || clientIp === '::1') {
            next();
        } else {
            logRequest(req, `BLOCKED - IP not in whitelist`);
            res.status(403).json({ 
                error: 'Access denied',
                message: 'Your IP address is not authorized to access this service'
            });
        }
    });
}

// Selective Request Logging (only log specific endpoints)
app.use((req, res, next) => {
    const isHomePage = req.method === 'GET' && req.originalUrl === '/';
    const isOllama = req.originalUrl.startsWith('/ollama/api/');
    
    if (isHomePage || isOllama) {
        logRequest(req, 'REQUEST');
    }
    next();
});

// Serve only the assets needed by the browser client
app.use('/modules', express.static(path.join(__dirname, 'modules')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/music', express.static(path.join(__dirname, 'music')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Serve favicon and apple touch icons from bot_vault.png
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', 'bot_vault.png'));
});

// Restrictive CORS headers - only allow requests from the server itself
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const host = req.headers.host;
    
    // Only allow same-origin requests
    if (origin && origin.includes(host)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Proxy Ollama requests - strip origin headers to bypass Ollama's localhost-only restriction
app.use('/ollama', (req, res, next) => {
    // Remove headers that would cause Ollama to reject non-localhost requests
    delete req.headers.origin;
    delete req.headers.referer;
    delete req.headers.host;
    next();
});

app.use(
    '/ollama',
    createProxyMiddleware({
        target: 'http://localhost:11434',
        changeOrigin: true,
        pathRewrite: { '^/ollama': '' },
        onProxyReq(proxyReq) {
            proxyReq.setHeader('host', 'localhost:11434');
        },
        onError(err, req, res) {
            console.error('Ollama proxy error:', err.message);
            res.status(502).json({ error: 'Failed to communicate with Ollama. Is it running?' });
        }
    })
);

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Bot Vault server is running',
        mode: LAN_ACCESS_MODE ? 'lan' : 'airgapped',
        lanAccessEnabled: LAN_ACCESS_MODE
    });
});

// Start the server - bind to 0.0.0.0 to allow LAN access
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('='.repeat(60));
    console.log('Bot Vault - Local Network Server');
    console.log('='.repeat(60));
    console.log(`🚀 Server running on:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://${localIP}:${PORT}`);
    console.log('='.repeat(60));
    console.log(`📱 Access from other devices: http://${localIP}:${PORT}`);
    console.log('='.repeat(60));
    console.log('🔒 Security Configuration:');
    if (ALLOWED_IPS && ALLOWED_IPS.length > 0) {
        console.log(`   ✅ IP Whitelist: ${ALLOWED_IPS.join(', ')}`);
    } else {
        console.log(`   ⚠️  IP Whitelist: Disabled (all LAN IPs allowed)`);
    }
    console.log(`   ✅ Request Logging: Enabled (access.log)`);
    console.log(`   ✅ CORS: Restricted to same-origin`);
    console.log('='.repeat(60));
});
