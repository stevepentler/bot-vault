import { AVATARS, MIN_RENDER_INTERVAL, WELCOME_MESSAGES } from './config.js';
import { dom } from './dom.js';
import { 
    addToHistory, 
    getUploadedFiles, 
    clearUploadedFiles,
    setAbortController,
    getAbortController,
    clearAbortController,
    clearHistory
} from './state.js';
import { sendChatRequest, parseStreamingResponse } from './api.js';
import { renderFileList } from './fileHandlers.js';
import { resetJetskiElements, updateWelcomeMessage } from './themeManager.js';
import { styleExternalLinks } from './linkHandlers.js';

// Get selected role from radio buttons
export function getSelectedRole() {
    return document.querySelector('input[name="role"]:checked').value;
}

// Clear welcome message from chat
export function clearWelcomeMessage() {
    const welcomeMsg = dom.chatContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Fade the jetski images after first message
    if (document.body.classList.contains('theme-jetski')) {
        fadeJetskiImagesOnFirstMessage();
    }
}

// Fade jetski images when first message is sent
function fadeJetskiImagesOnFirstMessage() {
    const jetskiImage = document.getElementById('jetskiImage');
    const waveRaceImage = document.getElementById('waveRaceImage');
    
    if (jetskiImage) {
        jetskiImage.classList.add('faded');
        jetskiImage.classList.remove('show');
        jetskiImage.style.animation = 'none';
    }
    
    if (waveRaceImage) {
        waveRaceImage.classList.add('faded');
        waveRaceImage.classList.remove('show');
        waveRaceImage.style.animation = 'none';
    }
    
    // Reduce opacity of manta rays but keep them swimming
    const mantaRays = document.querySelectorAll('.manta-ray');
    mantaRays.forEach(ray => {
        ray.style.opacity = '0.2';
    });
}

// Handle sending a message
export async function handleSendMessage() {
    const text = dom.messageInput.value.trim();
    if (!text && getUploadedFiles().length === 0) return;
    
    clearWelcomeMessage();
    
    const role = getSelectedRole();
    const userMessage = buildUserMessage(text, role);
    
    // Add message to conversation history
    addToHistory(userMessage);
    
    // Display user message
    const fileNames = getUploadedFiles().length > 0 ? getUploadedFiles().map(f => f.name) : null;
    displayMessage(role, text, fileNames);
    
    // Clear input and files
    dom.messageInput.value = '';
    clearUploadedFiles();
    renderFileList();
    adjustTextareaHeight();
    
    // Disable input while waiting
    setInputEnabled(false);
    
    // Create assistant message placeholder
    const assistantMessageGroup = createMessageGroup('assistant');
    
    try {
        await streamChatResponse(assistantMessageGroup);
    } catch (error) {
        displayError(assistantMessageGroup, error.message);
    } finally {
        setInputEnabled(true);
        dom.messageInput.focus();
        stopHeaderAnimation();
    }
}

// Build user message object with files
function buildUserMessage(text, role) {
    let messageContent = text;
    
    const uploadedFiles = getUploadedFiles();
    const imageFiles = uploadedFiles.filter(f => f.isImage);
    const textFiles = uploadedFiles.filter(f => !f.isImage);
    
    // Append text file contents to the message
    if (textFiles.length > 0) {
        const fileContents = textFiles.map(f => 
            `\n\n--- File: ${f.name} ---\n${f.content}`
        ).join('');
        messageContent += fileContents;
    }
    
    const userMessage = { role, content: messageContent };
    
    // Add images array if there are images
    if (imageFiles.length > 0) {
        userMessage.images = imageFiles.map(f => f.base64);
    }
    
    return userMessage;
}

// Enable or disable input elements
export function setInputEnabled(enabled) {
    dom.messageInput.disabled = !enabled;
    dom.sendBtn.disabled = !enabled;
    dom.fileUploadBtn.disabled = !enabled;
}

// Display a message in the chat
export function displayMessage(role, content, files = null) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const message = document.createElement('div');
    message.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = AVATARS[role] || AVATARS.system;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    message.appendChild(avatar);
    message.appendChild(messageContent);
    messageGroup.appendChild(message);
    
    if (files && files.length > 0) {
        const fileInfo = document.createElement('div');
        fileInfo.className = 'message-footer';
        fileInfo.innerHTML = `<div class="footer-item">📎 ${files.length} file${files.length > 1 ? 's' : ''} attached</div>`;
        messageGroup.appendChild(fileInfo);
    }
    
    dom.chatContainer.appendChild(messageGroup);
    scrollToBottom();
}

// Create a message group for streaming responses
export function createMessageGroup(role) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const message = document.createElement('div');
    message.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = AVATARS[role];
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = '<span class="loading-indicator"></span>';
    
    message.appendChild(avatar);
    message.appendChild(messageContent);
    messageGroup.appendChild(message);
    
    dom.chatContainer.appendChild(messageGroup);
    scrollToBottom();
    
    return messageGroup;
}

// Stream chat response from API
async function streamChatResponse(messageGroup) {
    const messageContent = messageGroup.querySelector('.message-content');
    let accumulatedContent = '';
    let metadata = {};
    let wasCancelled = false;
    
    // Create abort controller for this request
    const abortController = new AbortController();
    setAbortController(abortController);
    showCancelButton();
    
    // Add streaming class for cursor animation
    messageContent.classList.add('streaming');
    
    // Use requestAnimationFrame for smoother rendering
    let renderScheduled = false;
    let lastRenderTime = 0;
    
    const scheduleRender = () => {
        if (renderScheduled) return;
        
        const now = Date.now();
        const timeSinceLastRender = now - lastRenderTime;
        
        if (timeSinceLastRender >= MIN_RENDER_INTERVAL) {
            renderScheduled = true;
            requestAnimationFrame(() => {
                const rawHTML = marked.parse(accumulatedContent);
                messageContent.innerHTML = DOMPurify.sanitize(rawHTML);
                styleExternalLinks(messageContent); // Add visual indicators to external links
                lastRenderTime = Date.now();
                renderScheduled = false;
                scrollToBottom();
            });
        }
    };
    
    try {
        const response = await sendChatRequest(abortController.signal);
        
        for await (const data of parseStreamingResponse(response)) {
            if (data.message && data.message.content) {
                accumulatedContent += data.message.content;
                scheduleRender();
            }
            
            if (data.done) {
                metadata = {
                    total_duration: data.total_duration,
                    load_duration: data.load_duration,
                    prompt_eval_count: data.prompt_eval_count,
                    prompt_eval_duration: data.prompt_eval_duration,
                    eval_count: data.eval_count,
                    eval_duration: data.eval_duration
                };
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            wasCancelled = true;
            accumulatedContent += '\n\n_[Response cancelled by user]_';
        } else {
            throw error;
        }
    } finally {
        clearAbortController();
        hideCancelButton();
    }
    
    // Final render and remove streaming class
    const rawHTML = marked.parse(accumulatedContent);
    messageContent.innerHTML = DOMPurify.sanitize(rawHTML);
    styleExternalLinks(messageContent); // Add visual indicators to external links
    messageContent.classList.remove('streaming');
    scrollToBottom();
    
    // Add assistant message to history (only if not cancelled or if there's content)
    if (accumulatedContent.trim()) {
        addToHistory({
            role: 'assistant',
            content: accumulatedContent
        });
    }
    
    // Display metadata footer (only if not cancelled)
    if (!wasCancelled && Object.keys(metadata).length > 0) {
        displayMetadataFooter(messageGroup, metadata);
    }
}

// Display metadata footer with timing information
function displayMetadataFooter(messageGroup, metadata) {
    const footer = document.createElement('div');
    footer.className = 'message-footer';
    
    const formatDuration = (ns) => {
        if (!ns) return 'N/A';
        const seconds = (ns / 1e9).toFixed(2);
        return `${seconds}s`;
    };
    
    const formatTokensPerSecond = (count, duration) => {
        if (!count || !duration) return 'N/A';
        const tokensPerSec = (count / (duration / 1e9)).toFixed(2);
        return `${tokensPerSec} tok/s`;
    };
    
    footer.innerHTML = `
        <div class="footer-item">⏱️ <strong>Total:</strong> ${formatDuration(metadata.total_duration)}</div>
        <div class="footer-item">📝 <strong>Tokens:</strong> ${metadata.eval_count || 'N/A'}</div>
        <div class="footer-item">⚡ <strong>Speed:</strong> ${formatTokensPerSecond(metadata.eval_count, metadata.eval_duration)}</div>
        <div class="footer-item">🔄 <strong>Load:</strong> ${formatDuration(metadata.load_duration)}</div>
    `;
    
    messageGroup.appendChild(footer);
}

// Display error in message group
export function displayError(messageGroup, errorMsg) {
    const messageContent = messageGroup.querySelector('.message-content');
    messageContent.innerHTML = `<p style="color: #dc3545;">❌ Error: ${errorMsg}</p>`;
}

// Show cancel button
function showCancelButton() {
    dom.cancelBtn.style.display = 'flex';
    dom.sendBtn.style.display = 'none';
}

// Hide cancel button
function hideCancelButton() {
    dom.cancelBtn.style.display = 'none';
    dom.sendBtn.style.display = 'flex';
}

// Handle cancel request
export function handleCancelRequest() {
    const controller = getAbortController();
    if (controller) {
        controller.abort();
        clearAbortController();
        hideCancelButton();
    }
}

// Handle reset chat
export function handleResetChat() {
    clearHistory();
    
    const currentTheme = dom.themeSelect.value;
    const messages = currentTheme === 'jetski' ? WELCOME_MESSAGES.jetski : WELCOME_MESSAGES.default;
    
    dom.chatContainer.innerHTML = `
        <div class="welcome-message">
            <h2 class="welcome-title">${messages.title}</h2>
            <p class="welcome-subtitle">${messages.subtitle}</p>
        </div>
    `;
    
    clearUploadedFiles();
    renderFileList();
    resetJetskiElements();
}

// Scroll chat to bottom
export function scrollToBottom() {
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
}

// Adjust textarea height based on content
export function adjustTextareaHeight() {
    dom.messageInput.style.height = 'auto';
    dom.messageInput.style.height = dom.messageInput.scrollHeight + 'px';
}

// Stop header animation
export function stopHeaderAnimation() {
    const header = document.querySelector('.header h1');
    if (header) {
        header.style.animation = 'none';
    }
}
