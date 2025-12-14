import { DEFAULT_MODEL, DEFAULT_STREAM_ENABLED, DEFAULT_TEMPERATURE } from './config.js';

// Application state
export const state = {
    model: DEFAULT_MODEL,
    streamEnabled: DEFAULT_STREAM_ENABLED,
    temperature: DEFAULT_TEMPERATURE,
    conversationHistory: [],
    uploadedFiles: [],
    currentAbortController: null
};

// State accessors and mutators
export function setModel(model) {
    state.model = model;
}

export function getModel() {
    return state.model;
}

export function setStreamEnabled(enabled) {
    state.streamEnabled = enabled;
}

export function getStreamEnabled() {
    return state.streamEnabled;
}

export function setTemperature(temp) {
    state.temperature = temp;
}

export function getTemperature() {
    return state.temperature;
}

export function addToHistory(message) {
    state.conversationHistory.push(message);
}

export function getHistory() {
    return state.conversationHistory;
}

export function clearHistory() {
    state.conversationHistory = [];
}

export function addUploadedFile(file) {
    // Check if a file with the same name already exists
    const existingFile = state.uploadedFiles.find(f => f.name === file.name);
    if (existingFile) {
        // Update the existing file instead of adding a duplicate
        const index = state.uploadedFiles.indexOf(existingFile);
        state.uploadedFiles[index] = file;
    } else {
        state.uploadedFiles.push(file);
    }
}

export function removeUploadedFile(fileName) {
    state.uploadedFiles = state.uploadedFiles.filter(f => f.name !== fileName);
}

export function getUploadedFiles() {
    return state.uploadedFiles;
}

export function clearUploadedFiles() {
    state.uploadedFiles = [];
}

export function setAbortController(controller) {
    state.currentAbortController = controller;
}

export function getAbortController() {
    return state.currentAbortController;
}

export function clearAbortController() {
    state.currentAbortController = null;
}
