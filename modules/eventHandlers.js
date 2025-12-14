import { dom } from './dom.js';
import { setModel, setStreamEnabled, setTemperature } from './state.js';
import { fetchAvailableModels } from './api.js';
import { TEXTAREA_DEBOUNCE_MS } from './config.js';

/**
 * Creates a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
import { handleFileUpload } from './fileHandlers.js';
import { 
    handleSendMessage, 
    handleCancelRequest, 
    handleResetChat,
    adjustTextareaHeight 
} from './messageHandlers.js';
import { handleThemeChange, createBubbleEffect } from './themeManager.js';

// Setup all event listeners
export function setupEventListeners() {
    dom.sendBtn.addEventListener('click', handleSendMessage);
    
    dom.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Debounce textarea height adjustment for better performance
    const debouncedAdjustHeight = debounce(adjustTextareaHeight, TEXTAREA_DEBOUNCE_MS);
    
    dom.messageInput.addEventListener('input', () => {
        debouncedAdjustHeight();
        toggleFileUploadArea();
    });
    
    dom.messageInput.addEventListener('focus', toggleFileUploadArea);
    dom.messageInput.addEventListener('blur', (e) => {
        // Delay the collapse to allow clicks on file upload area
        setTimeout(() => {
            // Only collapse if not hovering over file upload area
            if (!dom.fileUploadArea.matches(':hover')) {
                toggleFileUploadArea();
            }
        }, 200);
    });
    
    // Prevent collapse when interacting with file upload area
    dom.fileUploadArea.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent textarea from losing focus
        dom.fileUploadArea.classList.remove('collapsed');
    });
    
    dom.fileUploadArea.addEventListener('click', () => {
        dom.fileUploadArea.classList.remove('collapsed');
    });
    
    dom.fileUploadBtn.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', handleFileUpload);
    dom.modelSelect.addEventListener('change', handleModelChange);
    dom.streamToggle.addEventListener('change', handleStreamToggle);
    dom.cancelBtn.addEventListener('click', handleCancelRequest);
    dom.themeSelect.addEventListener('change', handleThemeChange);
    dom.temperatureSlider.addEventListener('input', handleTemperatureChange);
    dom.resetBtn.addEventListener('click', handleResetChat);
    
    // Add bubble effects to dropdowns
    dom.modelSelect.addEventListener('click', (e) => {
        createBubbleEffect(e.clientX, e.clientY);
    });
    
    dom.themeSelect.addEventListener('click', (e) => {
        createBubbleEffect(e.clientX, e.clientY);
    });
    
    // Initialize the file upload area as collapsed
    toggleFileUploadArea();
}

// Toggle file upload area visibility based on text input state
function toggleFileUploadArea() {
    const hasText = dom.messageInput.value.trim().length > 0;
    const isFocused = document.activeElement === dom.messageInput;
    const isHovered = dom.fileUploadArea.matches(':hover');
    
    if (hasText || isFocused || isHovered) {
        dom.fileUploadArea.classList.remove('collapsed');
    } else {
        dom.fileUploadArea.classList.add('collapsed');
    }
}

// Handle model selection change
function handleModelChange(e) {
    setModel(e.target.value);
    
    // Trigger bubbles at dropdown location
    const rect = dom.modelSelect.getBoundingClientRect();
    createBubbleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

// Handle stream toggle change
function handleStreamToggle(e) {
    setStreamEnabled(e.target.checked);
    const streamValue = document.getElementById('streamValue');
    if (streamValue) {
        streamValue.textContent = e.target.checked ? 'On' : 'Off';
    }
    
    // Trigger bubbles at toggle location
    const rect = dom.streamToggle.getBoundingClientRect();
    createBubbleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

// Handle temperature slider change
function handleTemperatureChange(e) {
    const temp = parseFloat(e.target.value);
    setTemperature(temp);
    
    // Translate numeric values to text labels
    let tempLabel;
    if (temp <= 0.2) {
        tempLabel = 'Low';
    } else if (temp <= 0.5) {
        tempLabel = 'Med';
    } else if (temp <= 1.0) {
        tempLabel = 'High';
    } else {
        tempLabel = temp.toFixed(1); // Fallback for other values
    }
    
    dom.temperatureValue.textContent = tempLabel;
    
    // Trigger bubbles at slider thumb location
    const rect = dom.temperatureSlider.getBoundingClientRect();
    const sliderValue = (temp - 0.1) / (0.7 - 0.1); // Normalized 0-1
    const thumbX = rect.left + (rect.width * sliderValue);
    createBubbleEffect(thumbX, rect.top + rect.height / 2);
}

// Load available models from Ollama
export async function loadAvailableModels() {
    try {
        const models = await fetchAvailableModels();
        
        dom.modelSelect.innerHTML = '';
        
        if (models.length === 0) {
            dom.modelSelect.innerHTML = '<option value="">No models available</option>';
            return;
        }
        
        // Populate dropdown with available models
        models.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            
            // Select the default model or the first one
            if (model.name === 'gemma3:4b' || index === 0) {
                option.selected = true;
                setModel(model.name);
            }
            
            dom.modelSelect.appendChild(option);
        });
    } catch (error) {
        dom.modelSelect.innerHTML = '<option value="">⚠️ Failed to load models - Is Ollama running?</option>';
        
        // Show user-friendly error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
        `;
        errorDiv.textContent = 'Failed to load models. Please ensure Ollama is running on localhost:11434';
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}
