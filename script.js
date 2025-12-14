// Main application initialization
import { initializeDOMReferences, dom } from './modules/dom.js';
import { setupEventListeners, loadAvailableModels } from './modules/eventHandlers.js';
import { adjustTextareaHeight } from './modules/messageHandlers.js';
import { loadThemePreference } from './modules/themeManager.js';
import { setupLinkInterceptor } from './modules/linkHandlers.js';

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMReferences();
    setupEventListeners();
    setupLinkInterceptor(dom.chatContainer);
    adjustTextareaHeight();
    loadAvailableModels();
    loadThemePreference();
});
