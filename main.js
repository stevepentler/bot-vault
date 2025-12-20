const { app, BrowserWindow, session, ipcMain, clipboard } = require('electron');
const path = require('path');
const { LAN_ACCESS_MODE } = require('./config');

// IPC handler for secure clipboard copy from renderer
ipcMain.on('copy-to-clipboard', (event, text) => {
    if (typeof text === 'string') {
        clipboard.writeText(text);
    }
});

// Log current mode on startup
console.log('='.repeat(60));
console.log('Bot Vault - Electron Desktop App');
console.log('='.repeat(60));
console.log(`Mode: ${LAN_ACCESS_MODE ? '🔓 LAN Access Enabled' : '🔒 Airgapped (localhost only)'}`);
console.log('='.repeat(60));
console.log('');

// Suppress CoreText font warnings on macOS
app.commandLine.appendSwitch('disable-font-subpixel-positioning');
app.commandLine.appendSwitch('enable-font-antialiasing');
app.commandLine.appendSwitch('disable-features', 'FontSrcLocalMatching');

// Disable hardware acceleration for better compatibility
app.disableHardwareAcceleration();

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            nodeIntegration: false, // Do not expose Node.js in renderer
            contextIsolation: true, // Isolate context for security
            webSecurity: true, // Enforce same-origin policy
            allowRunningInsecureContent: false,
            webviewTag: false, // Disable <webview> tag
            sandbox: true, // Enable renderer sandbox
            preload: path.join(__dirname, 'preload.js') // Securely expose APIs
        },
        icon: path.join(__dirname, 'images/hammerhead.png'),
        title: 'Robot Vault'
    });

    // Prevent navigation to new URLs (disable will-navigate)
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
            console.warn('Blocked navigation attempt to:', url);
        }
    });

    // Prevent new windows/popups (disable new-window)
    mainWindow.webContents.setWindowOpenHandler(() => {
        console.warn('Blocked attempt to open a new window or popup.');
        return { action: 'deny' };
    });

    // Disable WebAssembly in renderer
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const csp = (details.responseHeaders['Content-Security-Policy'] || details.responseHeaders['content-security-policy'] || [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data:; " +
            "connect-src 'self' http://localhost:* http://127.0.0.1:*; " +
            "media-src 'self'; " +
            "font-src 'self'; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self';"
        ])[0];
        // Add 'wasm-unsafe-eval' and 'wasm-eval' to script-src to block WASM
        const newCsp = csp.replace('script-src ', "script-src 'none' ");
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [newCsp]
            }
        });
    });

    // Deny all permission requests (camera, mic, etc.)
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        console.warn('Blocked permission request for:', permission);
        callback(false);
    });

    // Set Content Security Policy headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data:; " +
                    "connect-src 'self' http://localhost:* http://127.0.0.1:*; " +
                    "media-src 'self'; " +
                    "font-src 'self'; " +
                    "object-src 'none'; " +
                    "base-uri 'self'; " +
                    "form-action 'self';"
                ]
            }
        });
    });

    // Block all external network requests
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
        const url = details.url;
        
        // Allow localhost connections (for Ollama API)
        if (url.startsWith('http://localhost:') || 
            url.startsWith('http://127.0.0.1:') ||
            url.startsWith('file://')) {
            callback({ cancel: false });
            return;
        }
        
        // Block all other external requests
        console.log('Blocked external request:', url);
        callback({ cancel: true });
    });

    // Load the index.html file with error handling
    mainWindow.loadFile('index.html').catch((err) => {
        console.error('Failed to load index.html:', err);
    });

    // Open DevTools in development (optional - comment out for production)
    // if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
