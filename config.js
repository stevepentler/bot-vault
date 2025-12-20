// Configuration for Bot Vault
// Controls network access modes and security settings

/**
 * LAN_ACCESS_MODE - Enable local network access
 * 
 * When false (default): Application is fully airgapped
 *   - Only localhost connections allowed
 *   - No external network access
 *   - Most secure mode
 * 
 * When true: Application allows local network access
 *   - Accessible from other devices on your local network
 *   - Ollama proxied through Express server
 * 
 * Set via environment variable:
 *   LAN_ACCESS_MODE=true npm start
 *   LAN_ACCESS_MODE=true npm run server
 */
const LAN_ACCESS_MODE = process.env.LAN_ACCESS_MODE === 'true' || false;

// Port for the Express server (when using npm run server)
const SERVER_PORT = process.env.PORT || 4311;

/**
 * Security Configuration
 * 
 * ALLOWED_IPS - Comma-separated list of allowed IP addresses (optional)
 *   If not set, allows all LAN connections
 *   Example: ALLOWED_IPS=192.168.7.192,192.168.7.100
 */
const ALLOWED_IPS = process.env.ALLOWED_IPS 
    ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim())
    : null;

// Export configuration
module.exports = {
    LAN_ACCESS_MODE,
    SERVER_PORT,
    ALLOWED_IPS
};
