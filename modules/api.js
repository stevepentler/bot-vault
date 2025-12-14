import { API_URL, TAGS_API_URL, REQUEST_TIMEOUT_MS, ERROR_MESSAGES } from './config.js';
import { getModel, getStreamEnabled, getTemperature, getHistory } from './state.js';

/**
 * Creates a timeout promise that rejects after specified milliseconds
 * @param {number} ms - Timeout duration in milliseconds
 * @returns {Promise} - Promise that rejects on timeout
 */
function timeoutPromise(ms) {
    return new Promise((_, reject) => 
        setTimeout(() => reject(new Error(ERROR_MESSAGES.API_TIMEOUT)), ms)
    );
}

/**
 * Fetch available models from Ollama with timeout
 * @returns {Promise<Array>} - Array of available models
 * @throws {Error} - If fetch fails or times out
 */
export async function fetchAvailableModels() {
    try {
        const response = await Promise.race([
            fetch(TAGS_API_URL),
            timeoutPromise(REQUEST_TIMEOUT_MS)
        ]);
        
        if (!response.ok) {
            throw new Error(`${ERROR_MESSAGES.API_ERROR} (Status: ${response.status})`);
        }
        
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
        throw error;
    }
}

/**
 * Send chat request to Ollama API with timeout and abort support
 * @param {AbortSignal} abortSignal - Signal to abort the request
 * @returns {Promise<Response>} - Fetch response object
 * @throws {Error} - If request fails, times out, or is aborted
 */
export async function sendChatRequest(abortSignal) {
    try {
        const fetchPromise = fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: getModel(),
                messages: getHistory(),
                stream: getStreamEnabled(),
                keep_alive: "10m",
                options: {
                    temperature: getTemperature()
                }
            }),
            signal: abortSignal
        });
        
        const response = await Promise.race([
            fetchPromise,
            timeoutPromise(REQUEST_TIMEOUT_MS)
        ]);
        
        if (!response.ok) {
            const errorText = response.status === 404 
                ? 'Model not found. Please select a different model.'
                : `${ERROR_MESSAGES.API_ERROR} (Status: ${response.status})`;
            throw new Error(errorText);
        }
        
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error; // Let abort errors propagate as-is
        }
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
        throw error;
    }
}

// Parse streaming response from Ollama
export async function* parseStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            try {
                const data = JSON.parse(line);
                yield data;
            } catch (e) {
                // Skip invalid JSON lines silently
                continue;
            }
        }
    }
}
