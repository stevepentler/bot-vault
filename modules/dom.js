// DOM element references
export const dom = {
    chatContainer: null,
    messageInput: null,
    sendBtn: null,
    fileInput: null,
    fileUploadBtn: null,
    fileList: null,
    fileUploadArea: null,
    modelSelect: null,
    streamToggle: null,
    cancelBtn: null,
    themeSelect: null,
    temperatureSlider: null,
    temperatureValue: null,
    resetBtn: null
};

// Initialize DOM references
export function initializeDOMReferences() {
    dom.chatContainer = document.getElementById('chatContainer');
    dom.messageInput = document.getElementById('messageInput');
    dom.sendBtn = document.getElementById('sendBtn');
    dom.fileInput = document.getElementById('fileInput');
    dom.fileUploadBtn = document.getElementById('fileUploadBtn');
    dom.fileList = document.getElementById('fileList');
    dom.fileUploadArea = document.getElementById('fileUploadArea');
    dom.modelSelect = document.getElementById('modelSelect');
    dom.streamToggle = document.getElementById('streamToggle');
    dom.cancelBtn = document.getElementById('cancelBtn');
    dom.themeSelect = document.getElementById('themeSelect');
    dom.temperatureSlider = document.getElementById('temperatureSlider');
    dom.temperatureValue = document.getElementById('temperatureValue');
    dom.resetBtn = document.getElementById('resetBtn');
}
