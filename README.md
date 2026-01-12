# Bot Vault's - Desktop App
Local chatbot powered by Ollama - **✌"Airgapped"✌ Electron Application**

> **Disclaimer:** While this application is designed with airgap principles and privacy in mind, there is **no absolute guarantee** that it is fully airgapped or immune to all data leaks. Computers connected to the internet are inherently impossible to airgap. This is an attempt to provide strong local privacy, but users should independently verify and take additional precautions as needed for sensitive environments.

## Overview

Bot Vault is a **desktop application** for interacting with local Large Language Models (LLMs) through Ollama. Built with Electron, it provides a modern, feature-rich UI for conversational AI without requiring cloud services, API keys, or external internet connectivity. The app is designed to be airgapped, but see the disclaimer above.

### 🔒 ✌"Airgap-like"✌ Security


This application attempts to be airgapped and blocks all external network requests at the Electron session level. Your data is intended to stay on your local machine, but absolute airgap cannot be guaranteed (see disclaimer above).

**What is Allowed:**
- ✅ **Localhost connections only** (`http://localhost:*` and `http://127.0.0.1:*`) - for your local Ollama API
- ✅ **Local file access** (`file://*`) - for application resources

**What is Blocked:**
- ❌ **All external HTTP/HTTPS requests** - No cloud services
- ❌ **All CDN resources** - No external libraries loaded at runtime
- ❌ **All external domains** - Complete internet isolation
- ❌ **Telemetry and analytics** - No data collection or phone-home

**Security Implementation Details:**
- Network request filtering enforced at the Electron `session.defaultSession.webRequest` level
- Context isolation enabled (`contextIsolation: true`)
- Node integration disabled in renderer (`nodeIntegration: false`)
- Web security enabled with same-origin policy enforcement
- No remote content loading capabilities
- All dependencies bundled locally (marked.js included in node_modules)

> **Note:** While these measures are implemented, users should review the code and network activity for their own assurance.

## Application Type

## Preload Script & IPC Security

This app uses a secure Electron preload script (`preload.js`) to expose only safe, minimal APIs to the renderer process. This is critical for security:

- **No Node.js in Renderer:** The renderer (UI) cannot access Node.js APIs directly (`nodeIntegration: false`).
- **Context Isolation:** The renderer runs in a separate context (`contextIsolation: true`).
- **Preload Bridge:** Only specific, whitelisted APIs are exposed to the renderer via Electron's `contextBridge`.
- **IPC Messaging:** If the renderer needs to communicate with the main process, it does so through these safe APIs, not direct Node.js access.

**Why this matters:**
- Prevents untrusted web content from accessing the filesystem, network, or other sensitive resources.
- Reduces the attack surface for XSS or remote code execution.
- Ensures all privileged operations are handled in the main process, not the renderer.

**Example:**
```js
// In preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
```

See the `preload.js` file for details and only add new APIs with care.

**Desktop Application** (not web-based):
- Runs as a native macOS/Windows/Linux app via Electron
- No web browser required (Electron uses Chromium internally)
- Persistent window state and preferences
- System-level integration with native UI

> **Browser mode is available for convenience and development, but is not recommended for secure or ✌"airgapped"✌ use.**

## What is Ollama?

[Ollama](https://ollama.ai) is a tool that makes it easy to run large language models locally on your computer. It handles model management, provides a simple API, and optimizes performance for local execution.

### Why Ollama?

- **Privacy**: All conversations stay on your machine - no data sent to external servers
- **Cost-effective**: No API fees or usage limits
- **Offline capable**: Works without an internet connection once models are downloaded
- **Fast**: Optimized for local hardware (CPU/GPU)
- **Open source**: Free to use with access to many open-source models

## Features

### 🧠 Multi-Model Support
- Dynamically loads all available Ollama models
- Switch between models without restarting
- Conversation history maintained when switching models

### 🎨 Theme Options
- **No-Fun Mode**: Clean, minimal interface for serious work
- **Dark Mode**: Modern dark theme with blue accents
- **⚡Jetski Mode⚡**: Radical 80s/90s aesthetic with:
  - Multi-colored lightning bolt animations (8 bolts!)
  - Animated jetski imagery with wild movements
  - Wave Race 64 tribute imagery
  - Swimming manta ray animations
  - Hammerhead shark toggle/slider elements
  - Underwater bubble effects on interactions
  - Wave Race 64 theme music (local MP3 file, auto-fades after 20 seconds)
  - Custom welcome messages ("Kowabunga!")
  - Tropical wave and bounce animations
  - Checkered flag animated header
  - Theme preference saved to localStorage

### 💬 Advanced Chat Interface
- **Real-time streaming**: See responses as they're generated
- **Markdown rendering**: Full support for formatted text, code blocks, lists, and more
- **Role selection**: Send messages as User, System, or Assistant
- **Conversation history**: Full context maintained throughout the session
- **Chat reset**: Clear conversation history with reset button (🔄)

### 📎 File Attachments
- **Image support**: Attach images for vision-capable models (e.g., LLaVA). Only works if a vision model is loaded.
- **Text files**: Include plain text document contents in your prompts
- **PDF files**: Not currently supported for text extraction. Only plain text and image files are processed.
- Multiple file uploads per message

> **Note:** File attachments are processed locally and not uploaded externally. PDF and other document types are not yet supported for text extraction. Always verify your own security needs.

### 📊 Performance Metrics
- Response time tracking
- Token generation speed (tokens/second)
- Model load time
- Token count per response

### ⚙️ Advanced Controls
- **Creativity slider**: Adjust response randomness (Low/Med/High)
- **Streaming toggle**: Switch between streaming and non-streaming modes
- **Cancel button**: Stop ongoing responses mid-generation
- **Keep-alive**: Models stay loaded for 10 minutes after last use

## Prerequisites

**Required:**
1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/) - Required to run Electron
2. **Ollama** - Install from [ollama.ai](https://ollama.ai) - Runs your AI models locally
3. **At least one Ollama model** - Download a model to get started

**System Requirements:**
- macOS 10.13+, Windows 10+, or modern Linux distribution
- Minimum 8GB RAM (16GB+ recommended for larger models)
- 5GB+ free disk space for models

## Installation

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai/download](https://ollama.ai/download)

### 2. Download a Model

```bash
# Popular models to try:
ollama pull gemma3:4b         # Google's Gemma 3 (4B) - Fast and capable
ollama pull llama3.2          # Meta's Llama 3.2 (3B) - Great all-rounder
ollama pull mistral           # Mistral 7B - Excellent balance
ollama pull phi3              # Microsoft Phi-3 - Strong coding model
```

View all available models at [ollama.ai/library](https://ollama.ai/library)

### 3. Install Application Dependencies

Navigate to the Bot Vault directory and install the required packages:

```bash
cd /code/bot-vault
npm install
```

This installs:
- **Electron** (~200MB) - Desktop application framework
- **marked.js** - Markdown rendering library (bundled locally, no CDN)

### 4. Start Ollama Server

The Ollama server must be running before launching the app:

```bash
ollama serve
```

The server will run on `http://localhost:11434` and stay active in the background.

**Verify Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with your installed models.

### 5. Launch the Desktop Application

**Option A: ✌"Airgapped"✌ Mode (Default - Most Secure)**
```bash
npm start
```
The Electron app will open as a native desktop window. The application runs in ✌"airgapped"✌ mode with localhost-only access.

**Option B: LAN Access Mode (Local Netork)**
```bash
npm run start:lan
# or
LAN_ACCESS_MODE=true npm start
```
The Electron app will open with local network access enabled. You can access the app from other devices on your home network.

**Option C: Web Server Mode (Browser Access on LAN)**
```bash
npm run server
```
Starts an Express web server accessible from any device on your local network via browser on port 4311. See [Local Network Access](#local-network-access-lan) section below for details.

---

## Local Network Access (LAN)

Bot Vault supports **LAN Access Mode** to make the app accessible from other devices on your home network (phones, tablets, other computers) while maintaining strong security by blocking all external traffic.

### 🔒 Security Model

**LAN_ACCESS_MODE=false (Default - ✌"Airgapped"✌)**
- ✅ Localhost only (`127.0.0.1`, `localhost`)
- ❌ All other connections blocked
- 🔒 Most secure mode

**LAN_ACCESS_MODE=true (Local Network)**
- ✅ Localhost allowed
- ✅ Specific LAN IP allowed (`192.168.7.192`)
- ❌ All external/public IPs blocked
- ❌ Internet access disabled
- 🏠 Suitable for home network access

### Running in LAN Mode

#### Method 1: Electron Desktop App (LAN Mode)

Start the Electron app with LAN access enabled:

```bash
npm run start:lan
```

Or with environment variable:
```bash
LAN_ACCESS_MODE=true npm start
```

The app window will open on your computer.

#### Method 2: Web Server (Browser Access)

Start the Express web server to access Bot Vault from a browser on any device:

```bash
npm run server
```

The server will display your local network address. For example:
```
============================================================
Bot Vault - Local Network Server
============================================================
🚀 Server running on:
   Local:   http://localhost:4311
   Network: http://192.168.7.192:4311
============================================================
📱 Access from other devices: http://192.168.7.192:4311
============================================================
🔒 Security Configuration:
   ✅ IP Whitelist: 192.168.7.192
   ✅ Request Logging: Enabled (access.log)
   ✅ CORS: Restricted to same-origin
============================================================
```

**Ollama connectivity:** The LAN server proxies Ollama at `/ollama`, so Ollama stays bound to `localhost:11434`. Browser clients call `http://192.168.7.192:4311/ollama/...` and the server forwards securely to localhost.

### Accessing from Other Devices

Once the server is running:

1. **On the computer running Bot Vault:** Note the Network IP address shown (e.g., `192.168.7.192`)

2. **On your phone/tablet/other computer:** 
   - Connect to the **same WiFi network**
   - Open a web browser
   - Navigate to `http://192.168.7.192:4311`

3. **Start chatting!** All conversations happen locally on your network.

### Hostname Alias (macOS /etc/hosts)

You can add a friendly hostname so you can visit the app at `http://botvault:4311` instead of typing the IP. Note: `/etc/hosts` only maps hostnames to IPs — it cannot alias a port. You will still include `:4311` in the URL.

Replace `192.168.7.192` below with your machine’s LAN IP if different.

1) Backup and append mapping

```bash
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d-%H%M%S)
echo "192.168.7.192 botvault" | sudo tee -a /etc/hosts
```

2) Flush DNS cache (macOS)

```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

3) Test the hostname and access the app

```bash
ping -c 2 botvault
curl http://botvault:4311
# or open in a browser
open http://botvault:4311
```

Optional (quality‑of‑life): create a shell alias to open the app quickly from Terminal:

```bash
echo "alias botvault='open http://botvault:4311'" >> ~/.zshrc && source ~/.zshrc
# Now you can just run:
botvault
```

### Security Considerations

✅ **Built-in Security Features:**
- **Request Logging:** All access logged to `access.log`
- **CORS Protection:** Restricted to same-origin requests only
- **Ollama Isolation:** Stays on localhost, never exposed to network

⚠️ **Important Notes:**
- Only use on your **trusted home network**
- Don't use on public WiFi or untrusted networks
- Ensure your router firewall blocks external access to port 4311

🔒 **IP Whitelist Security:**

By default, when `ALLOWED_IPS` is not set, **all LAN devices can access** the server.

**To restrict access to specific IP addresses (recommended):**

```bash
# Single IP
ALLOWED_IPS=192.168.7.192 npm run server

# Multiple IPs (comma-separated)
ALLOWED_IPS=192.168.7.192,192.168.7.237 npm run server

# Using the secure script (from package.json)
npm run server:secure  # Restricts to 192.168.7.192
```

**To allow all LAN devices (default, less secure):**
```bash
# Omit ALLOWED_IPS entirely
npm run server
# or
LAN_ACCESS_MODE=true node server.js
```

#### **Security Example**

With IP whitelist enabled:

```bash
ALLOWED_IPS=192.168.7.192 npm run server
```

This restricts access to:
- ✅ Only IP address 192.168.7.192
- ✅ All requests logged for audit
- ✅ CORS restricted to same-origin

### Security Status Display

When the server starts, it displays your active security configuration:

**With IP Whitelist enabled:**
```
============================================================
🔒 Security Configuration:
   ✅ IP Whitelist: 192.168.7.192
   ✅ Request Logging: Enabled (access.log)
   ✅ CORS: Restricted to same-origin
============================================================
```

**Without IP Whitelist (default):**
```
============================================================
🔒 Security Configuration:
   ⚠️  IP Whitelist: Disabled (all LAN IPs allowed)
   ✅ Request Logging: Enabled (access.log)
   ✅ CORS: Restricted to same-origin
============================================================
```

🔒 **For Maximum Security:**
- Use airgapped mode (`npm start`) when not needing LAN access
- **Always configure IP whitelist** (`ALLOWED_IPS`) when using LAN mode to restrict access
- Use `npm run server:secure` for quick secure setup with single IP
- Only enable LAN mode when actively using from other devices
- Review `access.log` periodically for unauthorized access attempts

### Development Mode (Both Server + Desktop)

Run both the web server and Electron app simultaneously:

```bash
npm run dev
```

This starts:
- Express server on `http://192.168.7.192:4311` (LAN accessible)
- Electron desktop window (LAN mode enabled)

Useful for development and testing LAN access.

---

## Alternative: Running in a Browser (Less Secure)

⚠️ **Important**: Running the application in a browser provides **reduced ✌airgap✌ protection** compared to the Electron desktop app. This method is technically functional but **not recommended** for security-sensitive use cases.

### Setup with HTTP Server

Since modern browsers block ES6 modules when opening files directly (`file://`), you need to serve the application through a local HTTP server.

**Option 1: Python HTTP Server** (Python 3)
```bash
# Navigate to the Bot Vault directory
cd /code/bot-vault

# Start the server on port 8000
python3 -m http.server 8000
```

**Option 2: Node.js http-server**
```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Start the server
http-server -p 8000
```

**Option 3: Node.js with npx** (no installation needed)
```bash
npx http-server -p 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Airgap Tradeoffs When Using a Browser

#### ❌ **Reduced Security vs Electron:**

1. **No Network Request Filtering**
   - Browsers cannot block external HTTP requests at the session level
   - JavaScript code *could* theoretically make external API calls
   - Electron enforces blocking via `session.webRequest` - browsers cannot do this
   - You must trust the application code completely

2. **Browser Extensions Can Interfere**
   - Ad blockers, privacy extensions, or analytics blockers may inject code
   - Extensions have access to page content and can make external requests
   - Browser extensions can phone home with your data
   - Electron runs in an isolated environment without extensions

3. **Browser Telemetry**
   - Browsers may send usage statistics to Google/Mozilla/Microsoft
   - Some browsers report page visits, timing data, or crash reports
   - Electron's telemetry is controlled by your app configuration

4. **Content Security Policy Limitations**
   - Browsers rely on voluntary CSP headers
   - Malicious code could remove or bypass CSP
   - Electron enforces security at the process level, outside the renderer

5. **DNS Leaks**
   - Browsers may perform DNS prefetching for links
   - This reveals domain names to your DNS provider
   - Electron can disable all network protocols except localhost

6. **Auto-Update & Sync**
   - Browser features like sync may upload localStorage data
   - Safe Browsing features may check URLs against external databases
   - Electron doesn't have these features by default

#### ✅ **What Still Works:**

- ✅ Core chat functionality with Ollama
- ✅ All UI features and themes
- ✅ File attachments (images and text)
- ✅ Markdown rendering
- ✅ Local preferences storage
- ✅ Localhost connections to Ollama API

### Browser-Specific Considerations

**Best Practices if Using Browser Mode:**

1. **Use a Privacy-Focused Browser**
   - Brave (with shields up)
   - Firefox with strict privacy settings
   - Ungoogled Chromium

2. **Disable Extensions**
   - Run in Incognito/Private mode (disables most extensions)
   - Or manually disable all extensions

3. **Block All External Connections at Firewall Level**
   - Use Little Snitch (macOS), GlassWire (Windows), or iptables (Linux)
   - Create rules to block the browser from accessing internet
   - Allow only localhost:8000 and localhost:11434

4. **Disconnect from Internet Entirely**
   - The most secure approach if using browser mode
   - Turn off WiFi and unplug Ethernet
   - This guarantees no data leakage

5. **Inspect Network Tab**
   - Open Developer Tools (F12)
   - Monitor the Network tab for any external requests
   - All requests should be to localhost only

### Recommendation: Use Electron

**For the most secure data profile this application offers, use the Electron desktop app (`npm start`)** instead of browser mode. The Electron version provides:

- ✅ Guaranteed network request blocking at the OS level
- ✅ No browser extensions or interference
- ✅ No browser telemetry or tracking
- ✅ No DNS prefetching or background connections
- ✅ Complete control over the runtime environment

**Browser mode is acceptable for:**
- Testing and development
- Non-sensitive conversations
- Convenience when Electron is unavailable
- Situations where you control all network access via firewall

**Browser mode is NOT recommended for:**
- Sensitive data or conversations
- Confidential work environments
- Compliance requirements (HIPAA, SOC2, etc.)
- High-security or classified information
- Any data that should not be exposed to a browser, when anything could happen

## Usage

### Basic Chat
1. Select your model from the dropdown in the header
2. Type your message in the input box
3. Press Enter or click the send button
4. Watch the response stream in real-time

### Attaching Files


**Images:**
- Click the attachment button (📎)
- Select one or more images
- Works with vision-capable models (e.g., `gemma`, `llava`, `bakllava`). Only works if a vision model is loaded.

**Text Files:**
- Attach any text-based file (.txt, .md, .js, .py, etc.)
- Contents are automatically included in your prompt

**PDF Files:**
- PDF uploads are not supported for text extraction. Use plain text files instead.

### Role Selection

Change how your message is interpreted:
- **User** (default): Regular user questions/prompts
- **System**: Set system-level instructions or context
- **Assistant**: Simulate previous assistant responses (useful for fine-tuning behavior)

### Streaming Toggle

- **Streaming ON** (default): See responses as they're generated
- **Streaming OFF**: Wait for the complete response before displaying

### Canceling Responses

Click the cancel button (⊗) to stop generation mid-response. Useful for lengthy or off-topic answers.

### Temperature Control

Adjust the creativity slider to control response randomness:
- **Low (0.1)**: More focused and deterministic responses
- **Med (0.4)**: Balanced creativity and coherence  
- **High (0.7)**: More creative and varied responses

### Resetting Chat

Click the reset button (🔄) in the header to:
- Clear conversation history
- Reset all uploaded files
- Start fresh with a new conversation
- Reset jetski theme animations (if active)

## External Requests

### How to Verify the Application is Blocking External Requests

You can verify that the application is blocking external requests by enabling Developer Tools:

1. **Enable DevTools**: Edit `main.js` and uncomment this line:
   ```javascript
   mainWindow.webContents.openDevTools();
   ```

2. **Restart the application**: `npm start`

3. **Check the console**: Any blocked external requests will appear as:
   ```
   Blocked external request: https://example.com/...
   ```

### Network Policy Implementation

The airgap is enforced in `main.js` using Electron's `webRequest` API:

```javascript
session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const url = details.url;
    
    // Allow only localhost connections (for Ollama API)
    if (url.startsWith('http://localhost:') || 
        url.startsWith('http://127.0.0.1:') ||
        url.startsWith('file://')) {
        callback({ cancel: false });
    } else {
        // Block all other external requests
        console.log('Blocked external request:', url);
        callback({ cancel: true });
    }
});
```

### What Data Stays Local

✅ **Stored Locally Only:**
- All chat conversations (in-memory, cleared on app restart)
- Theme preferences (localStorage)
- Model settings (localStorage)
- Temperature and streaming preferences
- Uploaded files (in-memory until reset)

❌ **Never Sent Externally:**
- Your prompts and questions
- AI model responses
- Uploaded images or documents
- User preferences
- Usage statistics
- Telemetry data

**Every component now runs locally:**
- ✅ AI Models (Ollama running locally)
- ✅ Application code (HTML/CSS/JS)
- ✅ Libraries (marked.js in node_modules)
- ✅ Fonts/Images/Audio (lystem fonts, local files, ocal MP3 file)

**The only network connection:** `localhost:11434` for Ollama API

## Technical Architecture

### Architecture Diagram

```
 +-------------------+
 |   Electron Main   |  (main.js)
 |-------------------|
 |  Airgap Enforcer  |
 |  Window Creation  |
 |  Preload Bridge   |
 +---------+---------+
           |
           v
 +-------------------+
 | Electron Renderer |  (index.html, script.js)
 |-------------------|
 |   UI Components   |
 |   ES6 Modules     |
 |   Theme Manager   |
 |   File Handlers   |
 +---------+---------+
           |
           v
 +-------------------+
 |   Ollama Server   |  (localhost:11434)
 |-------------------|
 |   Local LLM API   |
 +-------------------+
```

### Application Stack
- **Electron** - Cross-platform desktop framework (Chromium + Node.js)
- **Pure HTML/CSS/JavaScript** - No frontend frameworks
- **ES6 Modules** - Modern modular architecture
- **Marked.js** - Markdown parsing (bundled locally)
- **Ollama** - Local LLM inference engine

### File Structure

```
Bot Vault/
├── main.js              # Electron main process (strict policies)
├── package.json         # Dependencies and scripts
├── index.html           # Application UI structure
├── script.js            # Application entry point
├── modules/             # ES6 modules
│   ├── config.js        # Configuration constants
│   ├── state.js         # State management
│   ├── dom.js           # DOM element references
│   ├── api.js           # Ollama API integration
│   ├── fileHandlers.js  # File upload processing
│   ├── messageHandlers.js # Chat logic and rendering
│   ├── themeManager.js  # Theme switching and animations
│   └── eventHandlers.js # Event listener setup
├── styles/              # CSS files
│   ├── fonts.css        # System font definitions
│   ├── styles.css       # Base styles and animations
│   ├── theme-dark.css   # Dark mode theme
│   └── theme-jetski.css # Jetski mode (80s/90s aesthetic)
├── images/              # Local image assets
│   ├── jetski.jpg
│   ├── wave-race-64.jpg
│   ├── manta-ray.png
│   └── hammerhead.png
├── music/               # Local audio files
│   └── WaveRaceMainTitle.mp3
├── fonts/               # (Optional custom fonts directory)
├── node_modules/        # Bundled dependencies
│   ├── electron/        # Desktop framework
│   └── marked/          # Markdown renderer
├── README.md            # This file
└── ELECTRON-README.md   # Additional Electron-specific details
```

### Modular Design

The application is organized into focused modules for maintainability and testability:

#### **modules/config.js**
- Configuration constants (API URLs, defaults)
- Avatar mappings
- Welcome messages
- Animation timings

#### **modules/state.js**
- Centralized state management
- Conversation history
- File uploads tracking
- Model settings (temperature, streaming)
- Accessor/mutator functions for state

#### **modules/dom.js**
- DOM element references
- Single source of truth for UI elements

#### **modules/api.js**
- Ollama API integration
- Model fetching
- Chat request handling
- Streaming response parsing (async generator pattern)

#### **modules/fileHandlers.js**
- File upload processing
- Image to base64 conversion
- Text file reading
- File list UI management

#### **modules/messageHandlers.js**
- Message sending and receiving
- Chat UI rendering
- Message streaming with throttled updates
- Metadata display (timing, tokens)
- Cancel and reset functionality

#### **modules/themeManager.js**
- Theme switching logic
- Lightning animations
- Jetski sequence orchestration
- Manta ray animations
- Audio control and fading
- Theme persistence (localStorage)

#### **modules/eventHandlers.js**
- Event listener setup
- User interaction handlers
- Model/temperature/stream controls

#### **script.js**
- Main application entry point
- Module orchestration
- Initialization sequence

### How It Works

1. **Initialization**: `script.js` loads all modules and sets up the application
2. **User Input**: Messages and files collected via `messageHandlers.js`
3. **State Management**: Conversation context maintained in `state.js`
4. **API Request**: Messages sent to Ollama via `api.js`
5. **Streaming Response**: Server-sent events parsed with async generators
6. **Markdown Rendering**: Raw markdown converted to formatted HTML
7. **Metrics Display**: Performance data extracted and displayed

### API Endpoints Used

**All endpoints are localhost only:**

**Chat Completion:**
```
POST http://localhost:11434/api/chat
```

**List Models:**
```
GET http://localhost:11434/api/tags
```

### Message Format

```javascript
{
  "model": "gemma3:4b",
  "messages": [
    {
      "role": "user",
      "content": "Your message here",
      "images": ["base64_encoded_image"] // optional
    }
  ],
  "stream": true,
  "keep_alive": "10m",
  "options": {
    "temperature": 0.2
  }
}
```

## Building Distributable Apps

To package the application for distribution to other machines:

### Install electron-builder

```bash
npm install --save-dev electron-builder
```

### Add build configuration to package.json

```json
"scripts": {
  "start": "electron .",
  "build": "electron-builder",
  "build:mac": "electron-builder --mac",
  "build:win": "electron-builder --win",
  "build:linux": "electron-builder --linux"
},
"build": {
  "appId": "bot-vault",
  "productName": "Bot Vault",
  "files": [
    "main.js",
    "index.html",
    "script.js",
    "modules/**/*",
    "styles/**/*",
    "images/**/*",
    "music/**/*",
    "node_modules/marked/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "icon": "images/hammerhead.png"
  },
  "win": {
    "icon": "images/hammerhead.png"
  },
  "linux": {
    "category": "Utility"
  }
}
```

### Build the application

```bash
# Build for your current platform
npm run build

# Or build for specific platform
npm run build:mac      # macOS .dmg
npm run build:win      # Windows .exe
npm run build:linux    # Linux .AppImage
```

The distributable app will be in the `dist/` folder and can be installed on other machines without requiring Node.js or npm (Ollama still required).

## Troubleshooting

**PDF uploads:** Not supported for text extraction. Use plain text files instead.

### App won't start
- Ensure Node.js is installed: `node --version`
- Run `npm install` to install dependencies
- Check terminal for error messages
- Verify Electron is installed: `ls node_modules/electron`

### Models not loading
- Ensure Ollama is running: `ollama serve`
- Verify the server is accessible: `curl http://localhost:11434/api/tags`
- Check that you have at least one model: `ollama list`
- Ensure Ollama is on the default port 11434

### "Blocked external request" in console
- This is **expected behavior** - the airgap is working correctly
- Only localhost requests to Ollama should succeed
- If you see these messages, your data is protected

### Images not working
- Use a vision-capable model (e.g., `ollama pull llava`)
- Ensure images are in a supported format (JPEG, PNG, GIF)

### Slow responses
- Try a smaller model (e.g., `gemma3:1b` instead of `llama2:70b`)
- Check your system resources (CPU/GPU usage)
- Ensure no other heavy processes are running

### Fonts look different than web version
- The desktop app uses system fonts instead of Google Fonts
- This is intentional for the airgap
- Fonts vary by operating system:
  - macOS: San Francisco
  - Windows: Segoe UI
  - Linux: System default

## Customization

### Change Default Model
Edit `modules/config.js`:
```javascript
export const DEFAULT_MODEL = 'your-preferred-model';
```

### Adjust Temperature Default
Edit `modules/config.js`:
```javascript
export const DEFAULT_TEMPERATURE = 0.1; // Adjust randomness
```

### Adjust API URL
Edit `modules/config.js`:
```javascript
export const API_URL = 'http://your-host:port/api/chat';
```

### Styling
Styles are organized in the `styles/` directory:
- `styles.css` - Base styles, animations, and layout
- `theme-dark.css` - Dark mode color scheme
- `theme-jetski.css` - Jetski mode styles, lightning animations, and 80s/90s theme

Customize colors, fonts, and animations in these files as desired.

## Model Recommendations

Choosing the right model depends on your hardware capabilities and use case. This guide helps you find the best model for your needs.

---

## 📊 Models by RAM Capacity

### 💻 Less than 24GB RAM (Entry Level)

**Best for:** Laptops, personal computers, quick experiments

#### **Qwen 2.5 (3B)** - `qwen2.5:3b` ⭐ Recommended
- **RAM Required:** ~4GB
- **Download:** `ollama pull qwen2.5:3b`
- **Strengths:**
  - Excellent reasoning for its size
  - Strong multilingual support (especially Chinese, Japanese, Korean)
  - Good at math and coding
  - Fast inference speed
  - Punches above its weight class
- **Weaknesses:**
  - Smaller knowledge base than larger models
  - May struggle with very complex tasks
- **Best For:** General chat, coding assistance, multilingual conversations, resource-constrained systems

#### **Llama 3.2 (3B)** - `llama3.2:3b`
- **RAM Required:** ~4GB
- **Download:** `ollama pull llama3.2:3b`
- **Strengths:**
  - Meta's latest small model
  - Excellent instruction following
  - Good general knowledge
  - Strong chat capabilities
- **Weaknesses:**
  - Not specialized for any particular domain
- **Best For:** General-purpose chatbot, everyday questions, balanced performance

#### **Phi-3 Mini (3.8B)** - `phi3:mini`
- **RAM Required:** ~4GB
- **Download:** `ollama pull phi3:mini`
- **Strengths:**
  - Outstanding coding capabilities for its size
  - Strong reasoning and problem-solving
  - Excellent mathematical skills
  - High-quality outputs
- **Weaknesses:**
  - Can be verbose
  - Smaller knowledge cutoff date
- **Best For:** Coding assistance, technical tasks, math problems, educational use

#### **Gemma 2 (2B)** - `gemma2:2b`
- **RAM Required:** ~3GB
- **Download:** `ollama pull gemma2:2b`
- **Strengths:**
  - Google's efficient small model
  - Fast inference
  - Good safety guardrails
  - Solid instruction following
- **Weaknesses:**
  - Can be overly cautious
  - Limited creative writing
- **Best For:** Safe deployments, quick responses, educational environments

#### **Llama 3.2 (1B)** - `llama3.2:1b`
- **RAM Required:** ~2GB
- **Download:** `ollama pull llama3.2:1b`
- **Strengths:**
  - Extremely fast responses
  - Minimal resource usage
  - Good for simple queries
- **Weaknesses:**
  - Limited reasoning capabilities
  - Struggles with complex instructions
- **Best For:** Very resource-constrained systems, simple Q&A, basic chatbots

#### **Vision Models for <24GB RAM:**

**LLaVA (7B)** - `llava:7b`
- **RAM Required:** ~8GB
- **Download:** `ollama pull llava:7b`
- **Capabilities:** Understand and describe images, visual Q&A
- **Best For:** Image analysis, accessibility tools, visual assistance

---

### ⚡ 24GB RAM (Performance Sweet Spot)

**Best for:** Developers, power users, small teams

#### **Qwen 2.5 (14B)** - `qwen2.5:14b` ⭐ Recommended
- **RAM Required:** ~16GB
- **Download:** `ollama pull qwen2.5:14b`
- **Strengths:**
  - Excellent all-around performance
  - Superior reasoning capabilities
  - Strong coding and math skills
  - Outstanding multilingual support
  - Good creative writing
  - Large context window (128K tokens)
- **Weaknesses:**
  - Slightly slower than smaller models
- **Best For:** Professional development, complex reasoning, multilingual work, technical writing

#### **Mistral (7B)** - `mistral:7b`
- **RAM Required:** ~7GB
- **Download:** `ollama pull mistral:7b`
- **Strengths:**
  - Great balance of speed and quality
  - Strong performance across many tasks
  - Good code generation
  - Efficient architecture
  - Large context window (32K tokens)
- **Weaknesses:**
  - Can be less creative than alternatives
  - Occasionally overconfident
- **Best For:** All-around use, coding, professional writing, general assistance

#### **Llama 3.1 (8B)** - `llama3.1:8b`
- **RAM Required:** ~8GB
- **Download:** `ollama pull llama3.1:8b`
- **Strengths:**
  - Excellent general performance
  - Strong reasoning capabilities
  - Good at complex instructions
  - Massive context window (128K tokens)
  - Multilingual support
- **Weaknesses:**
  - Not specialized for specific tasks
- **Best For:** Complex tasks, long conversations, document analysis

#### **DeepSeek Coder V2 (16B)** - `deepseek-coder-v2:16b`
- **RAM Required:** ~18GB
- **Download:** `ollama pull deepseek-coder-v2:16b`
- **Strengths:**
  - Exceptional coding capabilities
  - Supports 338 programming languages
  - Strong debugging skills
  - Code completion and infilling
  - Project-level understanding
- **Weaknesses:**
  - Specialized for coding (weaker at general chat)
  - Less creative writing ability
- **Best For:** Software development, code review, debugging, refactoring

#### **Mixtral 8x7B** - `mixtral:8x7b`
- **RAM Required:** ~24GB (sparse model - only uses ~13GB active)
- **Download:** `ollama pull mixtral:8x7b`
- **Strengths:**
  - Mixture-of-Experts architecture (efficient)
  - Near 70B performance at 7B speed
  - Excellent reasoning
  - Strong multilingual capabilities
  - Good at complex tasks
- **Weaknesses:**
  - High memory requirement for loading
  - Can be slower than dense models
- **Best For:** Complex reasoning, multilingual tasks, professional work

---

### 🚀 32GB RAM (Professional Tier)

**Best for:** Professionals, researchers, high-quality outputs

#### **Qwen 2.5 (32B)** - `qwen2.5:32b` ⭐ Recommended
- **RAM Required:** ~24GB
- **Download:** `ollama pull qwen2.5:32b`
- **Strengths:**
  - Top-tier reasoning and problem-solving
  - Exceptional coding capabilities
  - Outstanding multilingual support
  - Strong creative writing
  - Excellent instruction following
  - 128K context window
- **Weaknesses:**
  - Requires significant RAM
  - Slower inference than smaller models
- **Best For:** Professional software development, research, complex analysis, multilingual projects

#### **Llama 3.1 (70B)** - `llama3.1:70b` (requires quantization)
- **RAM Required:** ~28GB (with Q4 quantization)
- **Download:** `ollama pull llama3.1:70b`
- **Strengths:**
  - Excellent reasoning capabilities
  - Strong across all domains
  - Massive 128K context window
  - Great instruction following
- **Weaknesses:**
  - Requires quantization for 32GB RAM
  - Slower inference
- **Best For:** Complex reasoning, long-context work, professional tasks

#### **Command R (35B)** - `command-r:35b`
- **RAM Required:** ~28GB
- **Download:** `ollama pull command-r:35b`
- **Strengths:**
  - Optimized for RAG (Retrieval-Augmented Generation)
  - Strong tool use and function calling
  - Good at following complex instructions
  - Business-focused capabilities
- **Weaknesses:**
  - Specialized use case
  - Less creative than general models
- **Best For:** Business applications, tool use, RAG systems, enterprise chatbots

---

### 🏆 64GB+ RAM (State-of-the-Art)

**Best for:** Research, production systems, maximum quality

#### **Qwen 2.5 (72B)** - `qwen2.5:72b` ⭐ Recommended
- **RAM Required:** ~48GB
- **Download:** `ollama pull qwen2.5:72b`
- **Strengths:**
  - Cutting-edge performance across all tasks
  - Best-in-class reasoning and problem-solving
  - Exceptional coding capabilities (rivals GPT-4)
  - Outstanding multilingual support
  - Superior creative writing
  - Strong mathematical reasoning
  - 128K context window
- **Weaknesses:**
  - Requires high-end hardware
  - Slower inference (worth it for quality)
  - Large download size (~40GB)
- **Best For:** Professional development, research, complex problem-solving, production systems

#### **Llama 3.1 (70B)** - `llama3.1:70b`
- **RAM Required:** ~48GB
- **Download:** `ollama pull llama3.1:70b`
- **Strengths:**
  - Near GPT-4 class performance
  - Exceptional reasoning and creativity
  - Strong across all domains
  - Excellent code generation
  - 128K context window
- **Weaknesses:**
  - Requires high-end hardware (MacBook Pro M4 Max/Ultra with 64GB+)
  - Slower inference
- **Best For:** Professional work, complex reasoning, research, creative writing

#### **Llama 3.3 (70B)** - `llama3.3:70b`
- **RAM Required:** ~48GB
- **Download:** `ollama pull llama3.3:70b`
- **Strengths:**
  - Latest Meta model (December 2024)
  - Improved reasoning over 3.1
  - Better instruction following
  - Strong multilingual capabilities
  - 128K context window
- **Weaknesses:**
  - Requires high-end hardware
  - Large model size
- **Best For:** Cutting-edge AI applications, research, maximum quality output

#### **DeepSeek Coder V2 (236B)** - `deepseek-coder-v2:236b`
- **RAM Required:** ~140GB (requires specialized hardware)
- **Download:** `ollama pull deepseek-coder-v2:236b`
- **Strengths:**
  - Best coding model available
  - Exceptional code generation
  - Project-level understanding
  - State-of-the-art debugging
- **Weaknesses:**
  - Extremely demanding hardware requirements
  - Only practical for high-end workstations
- **Best For:** Enterprise software development, large codebases

---

## 🎯 Models by Use Case

### 💼 Best for General Chat & Conversation
1. **<24GB:** `qwen2.5:3b`, `llama3.2:3b`
2. **24GB:** `qwen2.5:14b`, `llama3.1:8b`
3. **32GB:** `qwen2.5:32b`
4. **64GB+:** `qwen2.5:72b`, `llama3.3:70b`

### 💻 Best for Coding & Software Development
1. **<24GB:** `phi3:mini`, `qwen2.5:3b`
2. **24GB:** `deepseek-coder-v2:16b`, `qwen2.5:14b`
3. **32GB:** `qwen2.5:32b`, `deepseek-coder-v2:16b`
4. **64GB+:** `qwen2.5:72b`, `deepseek-coder-v2:236b`

### ✍️ Best for Creative Writing
1. **<24GB:** `llama3.2:3b`, `qwen2.5:3b`
2. **24GB:** `llama3.1:8b`, `mixtral:8x7b`
3. **32GB:** `qwen2.5:32b`, `llama3.1:70b` (Q4)
4. **64GB+:** `llama3.3:70b`, `qwen2.5:72b`

### 🔬 Best for Research & Analysis
1. **<24GB:** `qwen2.5:3b`, `phi3:mini`
2. **24GB:** `qwen2.5:14b`, `mistral:7b`
3. **32GB:** `qwen2.5:32b`, `llama3.1:70b` (Q4)
4. **64GB+:** `qwen2.5:72b`, `llama3.3:70b`

### 🌍 Best for Multilingual Work
1. **<24GB:** `qwen2.5:3b`
2. **24GB:** `qwen2.5:14b`, `mixtral:8x7b`
3. **32GB:** `qwen2.5:32b`
4. **64GB+:** `qwen2.5:72b`

### 🖼️ Best for Vision (Image Understanding)
1. **<24GB:** `llava:7b`, `moondream:latest`
2. **24GB:** `llava:13b`, `llava-llama3:8b`
3. **32GB+:** `llava:34b`

### 📐 Best for Math & Logic
1. **<24GB:** `phi3:mini`, `qwen2.5:3b`
2. **24GB:** `qwen2.5:14b`, `deepseek-coder-v2:16b`
3. **32GB:** `qwen2.5:32b`
4. **64GB+:** `qwen2.5:72b`

### ⚡ Best for Speed (Fast Responses)
1. **Ultra-Fast:** `llama3.2:1b`, `gemma2:2b`
2. **Fast & Capable:** `qwen2.5:3b`, `llama3.2:3b`
3. **Balanced:** `mistral:7b`, `llama3.1:8b`

### 🔒 Best for Privacy/Security (Strong Safety)
1. **<24GB:** `gemma2:2b`, `phi3:mini`
2. **24GB:** `gemma2:9b`
3. **32GB+:** `gemma2:27b`

---

## 📈 Performance Tiers Explained

### **Tier 1: Ultra-Fast (1-3B)**
- Response Time: Near-instant (100-500ms per token)
- Use When: Speed is critical, simple tasks, resource constraints
- Tradeoff: Less sophisticated reasoning

### **Tier 2: Balanced (7-16B)**
- Response Time: Fast (200-800ms per token)
- Use When: Everyday work, good enough for most tasks
- Tradeoff: Best speed-to-quality ratio

### **Tier 3: High-Quality (32-40B)**
- Response Time: Moderate (500-1500ms per token)
- Use When: Complex reasoning, professional output required
- Tradeoff: Slower but noticeably better

### **Tier 4: State-of-the-Art (70B+)**
- Response Time: Slower (1-3s per token)
- Use When: Maximum quality needed, complex problems
- Tradeoff: Requires patience but exceptional results

---

## 💡 Quick Selection Guide

**Start Here Based on Your Mac:**

| Mac Configuration | Recommended Model | Command |
|------------------|------------------|---------|
| 8GB RAM | `llama3.2:1b` | `ollama pull llama3.2:1b` |
| 16GB RAM | `qwen2.5:3b` | `ollama pull qwen2.5:3b` |
| 24GB RAM | `qwen2.5:14b` | `ollama pull qwen2.5:14b` |
| 32GB RAM | `qwen2.5:32b` | `ollama pull qwen2.5:32b` |
| 48GB RAM | `llama3.1:70b` (Q4) | `ollama pull llama3.1:70b` |
| 64GB+ RAM | `qwen2.5:72b` | `ollama pull qwen2.5:72b` |

**MacBook Pro M4 Max (48GB+):** Can run 70B models comfortably
**MacBook Pro M4 Pro (24GB):** Sweet spot is 14B-16B models
**MacBook Air M3 (16GB):** Stick with 3B-7B models

---

## 🎓 Model Recommendations Summary

**If you can only download ONE model:**
- **16GB RAM or less:** `qwen2.5:3b` - Best small model overall
- **24GB RAM:** `qwen2.5:14b` - Perfect balance of speed and quality
- **32GB RAM:** `qwen2.5:32b` - Professional-grade performance
- **64GB+ RAM:** `qwen2.5:72b` - State-of-the-art everything

**If you want to try THREE models (complete coverage):**
```bash
ollama pull qwen2.5:3b      # Fast and capable
ollama pull qwen2.5:14b     # Balanced powerhouse
ollama pull llava:7b        # Vision capabilities
```

---

## 🔍 How to Check Your Available RAM

**macOS:**
```bash
# Check total RAM
sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}'

# Check available RAM
vm_stat | grep "Pages free" | awk '{print $3*4096/1024/1024/1024 " GB free"}'
```

**Rule of Thumb:** Leave 4-8GB for macOS and other apps. If you have 16GB total, use models requiring ≤10GB.

---

## Fun Features

### 🎮 Jetski Mode Easter Eggs
- **Lightning on Load**: Multi-colored lightning bolts strike when you first enter Jetski mode
- **Underwater Bubbles**: Interactive bubble animations appear when clicking controls
- **Manta Ray**: A friendly manta ray swims across the screen
- **Wave Race 64 Music**: Nostalgic theme music plays and fades out automatically
- **Hammerhead Controls**: Toggle switches and sliders feature hammerhead shark graphics

## Privacy & Security Summary

### What This App Does
- ✅ Runs entirely on your local machine
- ✅ Processes all conversations locally via Ollama
- ✅ Stores preferences in local browser storage (localStorage)
- ✅ Reads files you explicitly select
- ✅ Connects only to localhost:11434 for Ollama

### What This App Does NOT Do
- ❌ Send data to external servers or APIs
- ❌ Connect to CDNs or cloud services
- ❌ Stream audio from the internet
- ❌ Download fonts or resources from the web
- ❌ Phone home or send telemetry
- ❌ Track usage or collect analytics
- ❌ Require an internet connection (after initial setup)

### Perfect For
- Privacy-conscious users
- Secure environments (government, healthcare, finance)
- Local networks
- Offline work
- Sensitive data analysis
- Personal AI assistant without cloud dependencies

## Differences from Web Version

### Changes Made for ✌Airgap✌
1. **Electron wrapper** - Now a desktop app instead of web page
2. **Bundled dependencies** - marked.js included locally
3. **System fonts** - No Google Fonts CDN
5. **Network filtering** - Electron session-level request blocking

### Identical Features
✅ All chat functionality
✅ All visual themes and animations
✅ File attachments (images and text)
✅ Model switching
✅ Streaming responses
✅ Temperature control
✅ Message roles
✅ Markdown rendering
✅ Conversation history
✅ Performance metrics

## Additional Resources

- **Electron-specific documentation**: See `ELECTRON-README.md` for detailed Electron setup and development information
- **Ollama documentation**: [ollama.ai/docs](https://ollama.ai/docs)
- **Ollama model library**: [ollama.ai/library](https://ollama.ai/library)

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to submit issues or pull requests for improvements!

## Acknowledgments

- **Ollama** - For making local LLMs accessible and easy to use
- **Electron** - For the cross-platform desktop framework
- **Marked.js** - For markdown rendering
- Open source LLM community for their incredible models
- Wave Race 64 for the nostalgic inspiration 🏄‍♂️⚡
