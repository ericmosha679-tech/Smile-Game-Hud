// ============================================
// ENHANCED DARK MODE - COMPREHENSIVE SYSTEM
// ============================================

class EnhancedThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.isTransitioning = false;
        this.observers = [];
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupThemeToggle();
        this.setupKeyboardShortcuts();
        this.setupSystemPreferenceDetection();
        this.setupComponentObservers();
        this.applyTheme(this.currentTheme, false);
        this.updateAllThemeElements();
    }

    // Load saved theme from localStorage
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else if (systemPrefersDark) {
            this.currentTheme = 'dark';
            localStorage.setItem('theme', 'dark');
        } else {
            this.currentTheme = 'light';
            localStorage.setItem('theme', 'light');
        }
    }

    // Setup theme toggle buttons
    setupThemeToggle() {
        // Handle all theme toggle buttons
        const themeButtons = document.querySelectorAll('.theme-toggle-btn, [data-theme-toggle]');
        
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        });

        // Handle theme selector dropdowns
        const themeSelectors = document.querySelectorAll('[data-theme-selector]');
        themeSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D for quick theme toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
                this.showThemeNotification();
            }
            
            // Ctrl/Cmd + Shift + L for light mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.setTheme('light');
                this.showThemeNotification();
            }
            
            // Ctrl/Cmd + Shift + N for dark mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.setTheme('dark');
                this.showThemeNotification();
            }
        });
    }

    // Setup system preference detection
    setupSystemPreferenceDetection() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            const hasManualPreference = localStorage.getItem('theme-manual');
            if (!hasManualPreference) {
                this.setTheme(e.matches ? 'dark' : 'light');
                this.showToast(`Auto-switched to ${e.matches ? 'dark' : 'light'} mode (system preference)`, 'info');
            }
        });
    }

    // Setup component observers for dynamic content
    setupComponentObservers() {
        // Observe DOM changes for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.updateThemeElements(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);
    }

    // Toggle between themes
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('theme-manual', 'true');
    }

    // Set specific theme
    setTheme(theme) {
        if (this.isTransitioning) return;
        
        const oldTheme = this.currentTheme;
        this.currentTheme = theme;
        
        this.applyTheme(theme, true);
        this.updateAllThemeElements();
        this.saveTheme(theme);
        this.notifyThemeChange(oldTheme, theme);
    }

    // Apply theme to document
    applyTheme(theme, animate = true) {
        if (animate && !this.isTransitioning) {
            this.isTransitioning = true;
            document.body.classList.add('theme-transitioning');
            
            setTimeout(() => {
                this.executeThemeChange(theme);
                
                setTimeout(() => {
                    document.body.classList.remove('theme-transitioning');
                    this.isTransitioning = false;
                }, 300);
            }, 50);
        } else {
            this.executeThemeChange(theme);
        }
    }

    // Execute the actual theme change
    executeThemeChange(theme) {
        // Remove all theme classes
        document.body.classList.remove('light-mode', 'dark-mode', 'theme-transitioning');
        
        // Add new theme class
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        }
        
        // Update meta theme-color
        this.updateMetaThemeColor(theme);
        
        // Update CSS custom properties if needed
        this.updateCSSVariables(theme);
    }

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const color = theme === 'light' ? '#f8f9fa' : '#0d1b2a';
            metaThemeColor.content = color;
        }
    }

    // Update CSS custom properties dynamically
    updateCSSVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--theme-transition-duration', '0.3s');
        } else {
            root.style.setProperty('--theme-transition-duration', '0.3s');
        }
    }

    // Update all theme-related elements
    updateAllThemeElements() {
        this.updateThemeElements(document.body);
        this.updateThemeIcons();
        this.updateThemeSelectors();
        this.updateComponentThemes();
    }

    // Update theme elements within a container
    updateThemeElements(container) {
        // Update theme toggle icons
        const themeIcons = container.querySelectorAll('.theme-icon');
        themeIcons.forEach(icon => {
            icon.textContent = this.currentTheme === 'light' ? '☀️' : '🌙';
        });

        // Update theme toggle buttons
        const themeButtons = container.querySelectorAll('.theme-toggle-btn');
        themeButtons.forEach(button => {
            const icon = button.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = this.currentTheme === 'light' ? '☀️' : '🌙';
            }
            button.setAttribute('aria-label', `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} mode`);
        });

        // Update theme selector dropdowns
        const themeSelectors = container.querySelectorAll('[data-theme-selector]');
        themeSelectors.forEach(selector => {
            selector.value = this.currentTheme;
        });
    }

    // Update theme-specific icons
    updateThemeIcons() {
        // Update any theme-dependent icons
        const darkIcons = document.querySelectorAll('[data-icon-dark]');
        const lightIcons = document.querySelectorAll('[data-icon-light]');
        
        darkIcons.forEach(icon => {
            icon.style.display = this.currentTheme === 'dark' ? 'inline' : 'none';
        });
        
        lightIcons.forEach(icon => {
            icon.style.display = this.currentTheme === 'light' ? 'inline' : 'none';
        });
    }

    // Update theme selector UI
    updateThemeSelectors() {
        // Update radio buttons
        const darkRadio = document.querySelector('input[name="theme"][value="dark"]');
        const lightRadio = document.querySelector('input[name="theme"][value="light"]');
        
        if (darkRadio && lightRadio) {
            darkRadio.checked = this.currentTheme === 'dark';
            lightRadio.checked = this.currentTheme === 'light';
        }
        
        // Update checkboxes
        const darkCheckbox = document.querySelector('#dark-mode-checkbox');
        if (darkCheckbox) {
            darkCheckbox.checked = this.currentTheme === 'dark';
        }
    }

    // Update component-specific themes
    updateComponentThemes() {
        // Update any components that need theme-specific logic
        this.updateCharts();
        this.updateCanvases();
        this.updateVideos();
        this.updateImages();
    }

    // Update charts and graphs
    updateCharts() {
        // Update any chart libraries that need theme awareness
        if (window.Chart) {
            Chart.defaults.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-secondary').trim();
        }
    }

    // Update canvas elements
    updateCanvases() {
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            // Trigger canvas redraw if needed
            const event = new CustomEvent('themechange', {
                detail: { theme: this.currentTheme }
            });
            canvas.dispatchEvent(event);
        });
    }

    // Update video elements
    updateVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // Adjust video controls styling if needed
        });
    }

    // Update image elements
    updateImages() {
        // Update any theme-dependent images
        const themeImages = document.querySelectorAll('[data-theme-image]');
        themeImages.forEach(img => {
            const darkSrc = img.getAttribute('data-theme-image-dark');
            const lightSrc = img.getAttribute('data-theme-image-light');
            
            if (this.currentTheme === 'dark' && darkSrc) {
                img.src = darkSrc;
            } else if (this.currentTheme === 'light' && lightSrc) {
                img.src = lightSrc;
            }
        });
    }

    // Save theme preference
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event
        const event = new CustomEvent('themechange', {
            detail: { 
                theme: theme,
                previousTheme: this.currentTheme === theme ? 'unknown' : 'dark'
            }
        });
        document.dispatchEvent(event);
    }

    // Notify about theme change
    notifyThemeChange(oldTheme, newTheme) {
        console.log(`Theme changed from ${oldTheme} to ${newTheme}`);
        
        // Show notification for manual changes
        if (localStorage.getItem('theme-manual')) {
            this.showToast(`Switched to ${newTheme} mode`, 'success');
        }
    }

    // Show theme notification
    showThemeNotification() {
        this.showToast(`Current theme: ${this.currentTheme} mode (Ctrl+Shift+D to toggle)`, 'info');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Use existing toast system if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            // Fallback toast implementation
            this.createToast(message, type);
        }
    }

    // Create toast element
    createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast show ${type}`;
        toast.textContent = message;
        
        // Position toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-bg);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Check if dark mode is active
    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    // Check if light mode is active
    isLightMode() {
        return this.currentTheme === 'light';
    }

    // Reset to system preference
    resetToSystemPreference() {
        localStorage.removeItem('theme');
        localStorage.removeItem('theme-manual');
        
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(systemPrefersDark ? 'dark' : 'light');
        this.showToast('Reset to system preference', 'info');
    }

    // Enable automatic theme switching based on time
    enableTimeBasedTheme() {
        const hour = new Date().getHours();
        const isDayTime = hour >= 6 && hour < 18;
        this.setTheme(isDayTime ? 'light' : 'dark');
        localStorage.setItem('theme-mode', 'time-based');
        this.showToast('Enabled time-based theme switching', 'info');
    }

    // Get theme statistics
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            savedPreference: localStorage.getItem('theme'),
            manualOverride: localStorage.getItem('theme-manual') === 'true',
            transitionSupport: CSS.supports('transition', 'color 0.3s'),
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }

    // Export theme configuration
    exportThemeConfig() {
        const config = {
            theme: this.currentTheme,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            stats: this.getThemeStats()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'theme-config.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Theme configuration exported', 'success');
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// ============================================
// THEME TRANSITION ENHANCEMENTS
// ============================================

// Add theme transition class
const themeTransitionStyle = document.createElement('style');
themeTransitionStyle.textContent = `
    body.theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
`;
document.head.appendChild(themeTransitionStyle);

// ============================================
// GLOBAL THEME MANAGER INSTANCE
// ============================================

// Create global theme manager
window.themeManager = new EnhancedThemeManager();

// Make it available globally for other scripts
window.EnhancedThemeManager = EnhancedThemeManager;

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

// Provide backward compatibility for existing theme functions
window.toggleTheme = () => window.themeManager.toggleTheme();
window.setDarkMode = () => window.themeManager.setTheme('dark');
window.setLightMode = () => window.themeManager.setTheme('light');

// ============================================
// DEV TOOLS (for development)
// ============================================

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Add theme debugging tools in development
    window.themeDebug = {
        manager: window.themeManager,
        stats: () => console.table(window.themeManager.getThemeStats()),
        export: () => window.themeManager.exportThemeConfig(),
        test: () => {
            console.log('Testing theme switching...');
            window.themeManager.toggleTheme();
            setTimeout(() => window.themeManager.toggleTheme(), 1000);
        }
    };
    
    console.log('🎨 Theme debugging available: window.themeDebug');
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌙 Enhanced Theme Manager initialized');
    });
} else {
    console.log('🌙 Enhanced Theme Manager initialized');
}
