// Configuration constants
const isBrowser = typeof window !== 'undefined';
const isElectronRenderer = isBrowser && !!window.electronAPI;

// In Electron: use localhost directly; in browser/LAN mode: use proxied /ollama
export const API_BASE_URL = isElectronRenderer ? 'http://localhost:11434' : '/ollama';
export const API_URL = `${API_BASE_URL}/api/chat`;
export const TAGS_API_URL = `${API_BASE_URL}/api/tags`;

export const DEFAULT_MODEL = 'gemma3:4b';
export const DEFAULT_STREAM_ENABLED = true;
export const DEFAULT_TEMPERATURE = 0.1;
export const MIN_RENDER_INTERVAL = 100; // Minimum time between renders in ms
export const TEXTAREA_DEBOUNCE_MS = 150; // Debounce time for textarea adjustments
export const MAX_FILE_SIZE_MB = 100; // Maximum file size in megabytes
export const MAX_FILE_COUNT = 10; // Maximum number of files
export const REQUEST_TIMEOUT_MS = 120000; // 2 minutes timeout for API requests

export const THEME_STORAGE_KEY = 'bot-vault-theme';
export const DEFAULT_THEME = 'dark';

export const AVATARS = {
    user: '💀',
    assistant: '🧠',
    system: '⚙️'
};

export const WELCOME_MESSAGES = {
    jetski: {
        title: 'Kowabunga!',
        subtitle: 'Time to ride the wave of AI!'
    },
    default: {
        title: 'Ask me anything!',
        subtitle: 'My dad won\'t let me talk to the internet.'
    }
};

export const ANIMATION_TIMINGS = {
    lightningDuration: 1500,
    jetskiSlideIn: 2000,
    jetskiDisplayTime: 20000,
    jetskiSlideOut: 2000,
    waveRaceDelay: 22000,
    waveRaceTotalTime: 35000,
    audioFadeDelay: 20000,
    audioFadeDuration: 10000,
    audioInitialFade: 30000
};

export const ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    text: ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'text/html', 'text/css', 'text/javascript']
};

export const ERROR_MESSAGES = {
    FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
    TOO_MANY_FILES: `Maximum ${MAX_FILE_COUNT} files allowed`,
    INVALID_FILE_TYPE: 'File type not supported',
    API_TIMEOUT: 'Request timed out. Please try again.',
    API_ERROR: 'Failed to communicate with Ollama. Is it running?',
    MODEL_LOAD_ERROR: 'Failed to load available models',
    NETWORK_ERROR: 'Network error occurred. Check your connection.'
};
