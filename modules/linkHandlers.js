// Handle link clicks in airgapped environment
// Intercepts external link clicks, copies URL to clipboard, and notifies user

// Setup link click interceptor for chat container
export function setupLinkInterceptor(chatContainer) {
    chatContainer.addEventListener('click', (e) => {
        // Check if the clicked element is a link or inside a link
        const link = e.target.closest('a');
        
        if (link && link.href) {
            const url = link.href;
            
            // Allow localhost links to work normally
            if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
                return; // Let it proceed normally
            }
            
            // Block all other links and copy to clipboard
            e.preventDefault();
            e.stopPropagation();
            
            copyUrlToClipboard(url, link);
        }
    });
}

// Copy URL to clipboard and show notification
async function copyUrlToClipboard(url, linkElement) {
    try {
        if (window.electronAPI && typeof window.electronAPI.copyToClipboard === 'function') {
            window.electronAPI.copyToClipboard(url);
            showLinkNotification(url, linkElement, true);
        } else {
            throw new Error('Electron clipboard API not available');
        }
    } catch (error) {
        // Clipboard copy failed - silently ignore as notification will show failure
        showLinkNotification(url, linkElement, false);
    }
}

// Show notification that link was copied
function showLinkNotification(url, linkElement, success) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'link-notification';
    
    if (success) {
        notification.innerHTML = `
            <div class="link-notification-content">
                <div class="link-notification-icon">🔗</div>
                <div class="link-notification-text">
                    <strong>Link copied to clipboard</strong>
                    <div class="link-notification-url">${truncateUrl(url)}</div>
                    <div class="link-notification-hint">External links are blocked in airgapped mode</div>
                </div>
            </div>
        `;
    } else {
        notification.innerHTML = `
            <div class="link-notification-content">
                <div class="link-notification-icon">⚠️</div>
                <div class="link-notification-text">
                    <strong>External link blocked</strong>
                    <div class="link-notification-url">${truncateUrl(url)}</div>
                    <div class="link-notification-hint">Copy failed - links are not accessible in airgapped mode</div>
                </div>
            </div>
        `;
    }
    
    // Position near the clicked link
    const rect = linkElement.getBoundingClientRect();
    notification.style.position = 'fixed';
    notification.style.left = `${rect.left}px`;
    notification.style.top = `${rect.bottom + 10}px`;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add visual feedback to the link itself
    linkElement.classList.add('link-copied');
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        linkElement.classList.remove('link-copied');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Truncate long URLs for display
function truncateUrl(url, maxLength = 60) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
}

// Add visual indicator to all external links
export function styleExternalLinks(messageContent) {
    const links = messageContent.querySelectorAll('a');
    links.forEach(link => {
        const url = link.href;
        
        // Skip localhost links
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
            return;
        }
        
        // Add indicator that link will be copied instead of opened
        link.classList.add('external-link');
        link.setAttribute('title', 'Click to copy this link (external links blocked in airgapped mode)');
    });
}
