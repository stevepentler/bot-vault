import { addUploadedFile, removeUploadedFile, getUploadedFiles, clearUploadedFiles } from './state.js';
import { dom } from './dom.js';
import { MAX_FILE_SIZE_MB, MAX_FILE_COUNT, ALLOWED_FILE_TYPES, ERROR_MESSAGES } from './config.js';

/**
 * Validates file size, count, and type
 * @param {File} file - File to validate
 * @param {number} currentFileCount - Current number of uploaded files
 * @returns {Object} - { valid: boolean, error: string|null }
 */
function validateFile(file, currentFileCount) {
    // Check file count limit
    if (currentFileCount >= MAX_FILE_COUNT) {
        return { valid: false, error: ERROR_MESSAGES.TOO_MANY_FILES };
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return { valid: false, error: `${ERROR_MESSAGES.FILE_TOO_LARGE}: ${file.name}` };
    }
    
    // Check file type
    const isValidImage = ALLOWED_FILE_TYPES.images.includes(file.type);
    const isValidText = ALLOWED_FILE_TYPES.text.includes(file.type);
    
    if (!isValidImage && !isValidText) {
        return { valid: false, error: `${ERROR_MESSAGES.INVALID_FILE_TYPE}: ${file.name}` };
    }
    
    return { valid: true, error: null };
}

/**
 * Shows error notification to user
 * @param {string} message - Error message to display
 */
function showFileError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'file-error-notification';
    errorDiv.textContent = message;
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
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 4000);
}

// Read file as base64 for images
export function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Extract base64 data without the data:image/...;base64, prefix
            const base64 = e.target.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Read file content as text
export function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Sanitize filename for safe display
function sanitizeFileName(fileName) {
    // Remove any HTML special characters and control characters
    return fileName
        .replace(/[<>'"&]/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
}

/**
 * Handle file upload event with validation
 * @param {Event} e - File input change event
 */
export async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    const currentFileCount = getUploadedFiles().length;
    
    let hasErrors = false;
    
    for (const file of files) {
        const validation = validateFile(file, getUploadedFiles().length);
        
        if (!validation.valid) {
            showFileError(validation.error);
            hasErrors = true;
            continue;
        }
        
        const sanitizedName = sanitizeFileName(file.name);
        
        try {
            if (ALLOWED_FILE_TYPES.images.includes(file.type)) {
                const base64 = await readFileAsBase64(file);
                addUploadedFile({
                    name: sanitizedName,
                    type: file.type,
                    isImage: true,
                    base64: base64
                });
            } else if (ALLOWED_FILE_TYPES.text.includes(file.type)) {
                const content = await readFileContent(file);
                addUploadedFile({
                    name: sanitizedName,
                    type: file.type,
                    isImage: false,
                    content: content
                });
            }
        } catch (error) {
            showFileError(`Failed to read file: ${sanitizedName}`);
            hasErrors = true;
        }
    }
    
    // Re-render the entire file list to avoid duplicates in the UI
    renderFileList();
    dom.fileInput.value = '';
}

// Display file chip in UI
export function displayFileChip(fileName) {
    const chip = document.createElement('div');
    chip.className = 'file-chip';
    
    const fileNameSpan = document.createElement('span');
    fileNameSpan.textContent = `📎 ${fileName}`;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeFile(fileName));
    
    chip.appendChild(fileNameSpan);
    chip.appendChild(removeBtn);
    dom.fileList.appendChild(chip);
}

// Remove file from uploaded files
export function removeFile(fileName) {
    removeUploadedFile(fileName);
    renderFileList();
}

// Render the complete file list
export function renderFileList() {
    dom.fileList.innerHTML = '';
    const files = getUploadedFiles();
    files.forEach(file => displayFileChip(file.name));
}

// Make removeFile globally accessible for onclick handlers
if (typeof window !== 'undefined') {
    window.removeFile = removeFile;
}
