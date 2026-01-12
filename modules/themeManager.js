import { THEME_STORAGE_KEY, DEFAULT_THEME, WELCOME_MESSAGES, ANIMATION_TIMINGS } from './config.js';
import { dom } from './dom.js';

// Update welcome message based on theme
export function updateWelcomeMessage(theme) {
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    
    if (welcomeTitle && welcomeSubtitle) {
        const messages = theme === 'jetski' ? WELCOME_MESSAGES.jetski : WELCOME_MESSAGES.default;
        welcomeTitle.textContent = messages.title;
        welcomeSubtitle.textContent = messages.subtitle;
    }
}

// Handle theme change event
export function handleThemeChange(e) {
    const theme = e.target.value;
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// Apply theme to the page
export function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    const jetskiImage = document.getElementById('jetskiImage');
    const waveRaceImage = document.getElementById('waveRaceImage');
    const mantaRays = document.querySelectorAll('.manta-ray');
    const jetskiAudio = document.getElementById('jetskiAudio');
    
    updateWelcomeMessage(theme);
    
    if (theme === 'jetski') {
        triggerLightningAnimation();
        playJetskiAudio(jetskiAudio);
    } else {
        hideJetskiElements(jetskiImage, waveRaceImage, mantaRays);
        stopJetskiAudio(jetskiAudio);
    }
}

// Play jetski theme audio
function playJetskiAudio(jetskiAudio) {
    if (jetskiAudio) {
        jetskiAudio.volume = 0.3;
        jetskiAudio.play().catch(() => {
            // Audio autoplay prevented - user interaction required
        });
        
        setTimeout(() => {
            fadeOutAudio(jetskiAudio, ANIMATION_TIMINGS.audioFadeDuration);
        }, ANIMATION_TIMINGS.audioFadeDelay);
    }
}

// Stop jetski theme audio
function stopJetskiAudio(jetskiAudio) {
    if (jetskiAudio) {
        jetskiAudio.pause();
        jetskiAudio.currentTime = 0;
    }
}

// Hide all jetski theme elements
function hideJetskiElements(jetskiImage, waveRaceImage, mantaRays) {
    if (jetskiImage) {
        jetskiImage.style.display = 'none';
        jetskiImage.classList.remove('show', 'faded');
    }
    if (waveRaceImage) {
        waveRaceImage.style.display = 'none';
        waveRaceImage.classList.remove('show', 'faded');
    }
    mantaRays.forEach(ray => {
        ray.style.display = 'none';
        ray.classList.remove('active');
    });
}

// Load theme preference from localStorage
export function loadThemePreference() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    dom.themeSelect.value = savedTheme;
    document.body.className = `theme-${savedTheme}`;
    
    updateWelcomeMessage(savedTheme);
    
    if (savedTheme === 'jetski') {
        triggerLightningAnimation();

        const jetskiAudio = document.getElementById('jetskiAudio');
        if (jetskiAudio) {
            setTimeout(() => {
                jetskiAudio.volume = 0.25;
                jetskiAudio.play().catch(() => {
                    // Audio autoplay prevented - user interaction required
                });
                
                fadeOutAudio(jetskiAudio, ANIMATION_TIMINGS.audioInitialFade);
            }, 500);
        }
    }
}

// Create jetski elements if they don't exist
function ensureJetskiElements() {
    if (!document.getElementById('lightningContainer')) {
        const lightningHTML = `
            <div class="lightning-container" id="lightningContainer">
                <svg class="lightning-bolt bolt-1" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-2" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-3" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-4" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-5" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-6" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-7" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
                <svg class="lightning-bolt bolt-8" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <path class="bolt-path" d="M 50 0 L 35 75 L 55 75 L 30 150 L 70 80 L 50 80 L 65 25 Z" />
                </svg>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', lightningHTML);
    }
    
    if (!document.getElementById('jetskiAudio')) {
        const audioHTML = `
            <audio id="jetskiAudio">
                <source src="music/WaveRaceMainTitle.mp3" type="audio/mpeg">
            </audio>
        `;
        document.body.insertAdjacentHTML('beforeend', audioHTML);
    }
}

// Trigger lightning animation sequence
export function triggerLightningAnimation() {
    ensureJetskiElements();
    const lightningContainer = document.getElementById('lightningContainer');
    lightningContainer.classList.add('active');
    
    setTimeout(() => {
        lightningContainer.classList.remove('active');
        
        if (document.body.classList.contains('theme-jetski')) {
            showJetskiSequence();
            showMantaRays();
            scheduleWaveRaceSequence();
        }
    }, ANIMATION_TIMINGS.lightningDuration);
}

// Show jetski animation sequence
function showJetskiSequence() {
    const jetskiImage = document.getElementById('jetskiImage');
    if (!jetskiImage) return;
    
    // Position jetski off-screen to the right
    jetskiImage.style.position = 'absolute';
    jetskiImage.style.left = '100%';
    jetskiImage.style.top = '50%';
    jetskiImage.style.transform = 'translateY(-50%)';
    jetskiImage.style.opacity = '0.6';
    jetskiImage.style.display = 'block';
    jetskiImage.classList.add('show');
    
    // Force reflow
    void jetskiImage.offsetWidth;
    
    // Animate jetski sliding in from the right to center
    jetskiImage.style.transition = 'left 2s ease-out';
    jetskiImage.style.left = '50%';
    jetskiImage.style.transform = 'translate(-50%, -50%)';
    
    // After sliding in, start the wild animation
    setTimeout(() => {
        jetskiImage.style.transition = 'none';
        jetskiImage.style.animation = 'jetskiWild 6s infinite ease-in-out';
    }, ANIMATION_TIMINGS.jetskiSlideIn);
    
    // Schedule slide out
    setTimeout(() => {
        slideOutJetski(jetskiImage);
    }, ANIMATION_TIMINGS.jetskiDisplayTime);
}

// Slide out jetski animation
function slideOutJetski(jetskiImage) {
    if (!jetskiImage || !document.body.classList.contains('theme-jetski')) return;
    
    // Remove the wild animation and reset transform origin
    jetskiImage.style.animation = 'none';
    jetskiImage.style.transformOrigin = 'center';
    
    // Get current computed position
    const rect = jetskiImage.getBoundingClientRect();
    jetskiImage.style.position = 'fixed';
    jetskiImage.style.top = rect.top + 'px';
    jetskiImage.style.left = rect.left + 'px';
    jetskiImage.style.transform = 'none';
    
    // Force reflow
    void jetskiImage.offsetWidth;
    
    // Animate jetski sliding out to the left
    jetskiImage.style.transition = 'left 2s ease-in, opacity 0.5s ease-in 1.5s';
    jetskiImage.style.left = '-100%';
    jetskiImage.style.opacity = '0';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        jetskiImage.style.display = 'none';
        jetskiImage.classList.remove('show');
    }, ANIMATION_TIMINGS.jetskiSlideOut);
}

// Show manta ray animations
function showMantaRays() {
    const mantaRays = document.querySelectorAll('.manta-ray');
    mantaRays.forEach(ray => {
        ray.style.display = 'block';
        ray.classList.remove('active');
        void ray.offsetWidth; // Force reflow
        ray.classList.add('active');
    });
}

// Schedule Wave Race 64 image sequence
function scheduleWaveRaceSequence() {
    // Show Wave Race 64 image
    setTimeout(() => {
        showWaveRaceImage();
    }, ANIMATION_TIMINGS.waveRaceDelay);
    
    // Hide Wave Race 64 image
    setTimeout(() => {
        hideWaveRaceImage();
    }, ANIMATION_TIMINGS.waveRaceTotalTime);
}

// Show Wave Race 64 image
function showWaveRaceImage() {
    const waveRaceImage = document.getElementById('waveRaceImage');
    if (!waveRaceImage || !document.body.classList.contains('theme-jetski')) return;
    
    waveRaceImage.style.display = 'block';
    waveRaceImage.style.opacity = '0';
    waveRaceImage.classList.add('show');
    
    setTimeout(() => {
        waveRaceImage.style.transition = 'opacity 1s ease';
        waveRaceImage.style.opacity = '';
    }, 50);
}

// Hide Wave Race 64 image
function hideWaveRaceImage() {
    const waveRaceImage = document.getElementById('waveRaceImage');
    if (!waveRaceImage || !document.body.classList.contains('theme-jetski')) return;
    
    waveRaceImage.style.transition = 'opacity 1s ease';
    waveRaceImage.style.opacity = '0';
    
    setTimeout(() => {
        waveRaceImage.style.display = 'none';
        waveRaceImage.classList.remove('show');
    }, 1000);
}

// Fade out audio over duration
export function fadeOutAudio(audioElement, duration) {
    const startVolume = audioElement.volume;
    const fadeStep = startVolume / (duration / 100);
    
    const fadeInterval = setInterval(() => {
        if (audioElement.volume > fadeStep) {
            audioElement.volume = Math.max(0, audioElement.volume - fadeStep);
        } else {
            audioElement.volume = 0;
            audioElement.pause();
            audioElement.currentTime = 0;
            clearInterval(fadeInterval);
        }
    }, 100);
}

// Reset jetski theme elements
export function resetJetskiElements() {
    if (!document.body.classList.contains('theme-jetski')) return;
    
    const jetskiImage = document.getElementById('jetskiImage');
    const waveRaceImage = document.getElementById('waveRaceImage');
    const mantaRays = document.querySelectorAll('.manta-ray');
    
    if (jetskiImage) {
        jetskiImage.style.display = 'none';
        jetskiImage.classList.remove('show', 'faded');
        jetskiImage.style.animation = '';
    }
    
    if (waveRaceImage) {
        waveRaceImage.style.display = 'none';
        waveRaceImage.classList.remove('show', 'faded');
    }
    
    mantaRays.forEach(ray => {
        ray.style.display = 'none';
        ray.classList.remove('active');
        ray.style.opacity = '';
    });
}

// Create bubble effect at specific position
export function createBubbleEffect(x, y) {
    // Only create bubbles in jetski theme
    if (!document.body.classList.contains('theme-jetski')) {
        return;
    }
    
    // Create or get bubble container
    let bubbleContainer = document.getElementById('bubbleContainer');
    if (!bubbleContainer) {
        bubbleContainer = document.createElement('div');
        bubbleContainer.id = 'bubbleContainer';
        bubbleContainer.className = 'bubble-container';
        document.body.appendChild(bubbleContainer);
    }
    
    // Create 5-8 bubbles with random sizes and animations
    const bubbleCount = Math.floor(Math.random() * 4) + 5; // 5-8 bubbles
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random bubble variant
        const variants = ['', 'bubble-wobble', 'bubble-spiral'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        if (randomVariant) {
            bubble.classList.add(randomVariant);
        }
        
        // Random size between 10px and 30px
        const size = Math.floor(Math.random() * 20) + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Position near the click point with some randomness
        const offsetX = Math.random() * 40 - 20; // -20 to 20
        const offsetY = Math.random() * 20 - 10; // -10 to 10
        bubble.style.left = `${x + offsetX}px`;
        bubble.style.top = `${y + offsetY}px`;
        
        // Random delay for staggered effect
        const delay = Math.random() * 200; // 0-200ms delay
        bubble.style.animationDelay = `${delay}ms`;
        
        bubbleContainer.appendChild(bubble);
        
        // Remove bubble after animation completes
        setTimeout(() => {
            bubble.remove();
        }, 2000 + delay);
    }
    
    // Clean up container if empty
    setTimeout(() => {
        if (bubbleContainer && bubbleContainer.children.length === 0) {
            bubbleContainer.remove();
        }
    }, 3000);
}
