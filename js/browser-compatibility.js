// Frontend Browser Compatibility Detection and Warnings
// Helps users identify and resolve browser-specific login/playback issues

class BrowserCompatibilityChecker {
    constructor() {
        this.serverUrl = this.detectServerUrl();
        this.init();
    }

    // Detect server URL based on current location
    detectServerUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8002';
        }
        return 'https://api.suprexon.space';
    }

    // Initialize compatibility checking
    async init() {
        // Check on page load
        await this.checkCompatibility();
        
        // Add event listeners for login forms
        this.addLoginFormListeners();
        
        // Check localStorage/sessionStorage support
        this.checkStorageSupport();
        
        // Check audio support for audio pages
        if (window.location.pathname.includes('dashboard') || 
            window.location.pathname.includes('audio')) {
            this.checkAudioSupport();
        }
    }

    // Get browser information
    getBrowserInfo() {
        const ua = navigator.userAgent.toLowerCase();
        let browser = 'Unknown';
        let version = 'Unknown';
        let mobile = /mobile|tablet|android|iphone|ipad/.test(ua);
        
        if (ua.includes('chrome') && !ua.includes('edg')) {
            browser = 'Chrome';
            const match = ua.match(/chrome\/([0-9.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('firefox')) {
            browser = 'Firefox';
            const match = ua.match(/firefox\/([0-9.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
            browser = 'Safari';
            const match = ua.match(/version\/([0-9.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('edg')) {
            browser = 'Edge';
            const match = ua.match(/edg\/([0-9.]+)/);
            version = match ? match[1] : 'Unknown';
        }

        return {
            browser,
            version,
            mobile,
            userAgent: navigator.userAgent,
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    // Check server-side compatibility
    async checkCompatibility() {
        try {
            const response = await fetch(`${this.serverUrl}/api/compatibility`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const compatibility = await response.json();
                this.handleCompatibilityResults(compatibility);
            }
        } catch (error) {
            console.warn('Could not check server compatibility:', error);
            this.showOfflineCompatibilityCheck();
        }
    }

    // Handle server compatibility results
    handleCompatibilityResults(compatibility) {
        const { warnings, recommendations, support } = compatibility;
        
        if (warnings.length > 0) {
            this.showCompatibilityWarning(warnings, recommendations);
        }
        
        if (support.overall === 'unsupported' || support.overall === 'poor') {
            this.showUnsupportedBrowserWarning(compatibility.browser);
        }
    }

    // Show offline compatibility check (when server is unreachable)
    showOfflineCompatibilityCheck() {
        const browserInfo = this.getBrowserInfo();
        const warnings = [];
        const recommendations = [];

        // Basic browser checks
        if (browserInfo.browser === 'Safari' && browserInfo.mobile) {
            recommendations.push('Safari iOS: Enable "Allow Cross-Website Tracking" in Settings > Safari > Privacy & Security');
        }
        
        if (!browserInfo.cookiesEnabled) {
            warnings.push('Cookies are disabled');
            recommendations.push('Please enable cookies in your browser settings');
        }
        
        if (!browserInfo.onLine) {
            warnings.push('No internet connection detected');
            recommendations.push('Please check your internet connection');
        }

        if (warnings.length > 0 || recommendations.length > 0) {
            this.showCompatibilityWarning(warnings, recommendations);
        }
    }

    // Show compatibility warning modal/banner
    showCompatibilityWarning(warnings, recommendations) {
        const existingWarning = document.getElementById('browser-compatibility-warning');
        if (existingWarning) {
            existingWarning.remove();
        }

        const warningDiv = document.createElement('div');
        warningDiv.id = 'browser-compatibility-warning';
        warningDiv.className = 'compatibility-warning';
        warningDiv.innerHTML = `
            <div class="compatibility-content">
                <div class="compatibility-header">
                    <span class="warning-icon">⚠️</span>
                    <strong>Browser Compatibility Notice</strong>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                ${warnings.length > 0 ? `
                    <div class="warnings">
                        <strong>Issues detected:</strong>
                        <ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${recommendations.length > 0 ? `
                    <div class="recommendations">
                        <strong>Recommendations:</strong>
                        <ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                <div class="compatibility-actions">
                    <button onclick="window.location.reload()" class="retry-btn">Try Again</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dismiss-btn">Dismiss</button>
                </div>
            </div>
        `;

        // Add CSS if not already present
        if (!document.getElementById('compatibility-styles')) {
            const style = document.createElement('style');
            style.id = 'compatibility-styles';
            style.textContent = `
                .compatibility-warning {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                }
                .compatibility-content {
                    padding: 16px;
                }
                .compatibility-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    color: #856404;
                }
                .warning-icon {
                    font-size: 18px;
                }
                .close-btn {
                    margin-left: auto;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #856404;
                }
                .warnings, .recommendations {
                    margin-bottom: 12px;
                    color: #856404;
                }
                .warnings ul, .recommendations ul {
                    margin: 4px 0 0 16px;
                    padding: 0;
                }
                .compatibility-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .retry-btn, .dismiss-btn {
                    padding: 6px 12px;
                    border: 1px solid #ffeaa7;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .retry-btn {
                    background: #856404;
                    color: white;
                }
                .dismiss-btn {
                    background: white;
                    color: #856404;
                }
                @media (max-width: 480px) {
                    .compatibility-warning {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(warningDiv);
    }

    // Show unsupported browser warning
    showUnsupportedBrowserWarning(browserInfo) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'unsupported-browser-warning';
        warningDiv.innerHTML = `
            <div class="unsupported-content">
                <h3>⚠️ Unsupported Browser</h3>
                <p>Your browser (${browserInfo.browser} ${browserInfo.version}) is not supported.</p>
                <p><strong>Recommended browsers:</strong></p>
                <ul>
                    <li>Google Chrome (latest)</li>
                    <li>Mozilla Firefox (latest)</li>
                    <li>Safari (13+)</li>
                    <li>Microsoft Edge (latest)</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Continue Anyway</button>
            </div>
        `;
        
        document.body.appendChild(warningDiv);
    }

    // Check storage support (localStorage, sessionStorage)
    checkStorageSupport() {
        const storageIssues = [];
        
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            storageIssues.push('LocalStorage not available - login sessions may not persist');
        }
        
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
        } catch (e) {
            storageIssues.push('SessionStorage not available - login may fail');
        }

        if (storageIssues.length > 0) {
            this.showCompatibilityWarning(storageIssues, [
                'Enable cookies and local storage in browser settings',
                'Try using incognito/private browsing mode',
                'Clear browser cache and reload the page'
            ]);
        }
    }

    // Check audio support for dashboard pages
    checkAudioSupport() {
        const audio = document.createElement('audio');
        const formats = ['mp3', 'wav', 'm4a', 'aac'];
        const unsupported = [];
        
        formats.forEach(format => {
            const canPlay = audio.canPlayType(`audio/${format}`);
            if (!canPlay || canPlay === 'maybe') {
                unsupported.push(format.toUpperCase());
            }
        });

        if (unsupported.length > 0) {
            this.showCompatibilityWarning(
                [`Limited audio format support: ${unsupported.join(', ')}`],
                [
                    'Update your browser to the latest version',
                    'Try using a different browser',
                    'Install audio codecs for your operating system'
                ]
            );
        }
    }

    // Add login form listeners for enhanced error handling
    addLoginFormListeners() {
        const loginForms = document.querySelectorAll('form[id*="login"], form[action*="login"]');
        
        loginForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                await this.handleLoginAttempt(e);
            });
        });
    }

    // Handle login attempt with compatibility checking
    async handleLoginAttempt(event) {
        const browserInfo = this.getBrowserInfo();
        
        // Log browser info for debugging
        console.log('Login attempt with browser:', browserInfo);
        
        // Check for common issues before form submission
        if (!browserInfo.cookiesEnabled) {
            event.preventDefault();
            this.showCompatibilityWarning(
                ['Cookies are disabled'],
                ['Enable cookies in your browser settings and try again']
            );
            return;
        }
        
        if (!browserInfo.onLine) {
            event.preventDefault();
            this.showCompatibilityWarning(
                ['No internet connection'],
                ['Check your internet connection and try again']
            );
            return;
        }
    }

    // Get troubleshooting info for support
    getTroubleshootingInfo() {
        const browserInfo = this.getBrowserInfo();
        return {
            browser: `${browserInfo.browser} ${browserInfo.version}`,
            userAgent: browserInfo.userAgent,
            mobile: browserInfo.mobile,
            cookiesEnabled: browserInfo.cookiesEnabled,
            onLine: browserInfo.onLine,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            localStorage: this.testStorage('localStorage'),
            sessionStorage: this.testStorage('sessionStorage')
        };
    }

    // Test storage availability
    testStorage(type) {
        try {
            const storage = window[type];
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.browserChecker = new BrowserCompatibilityChecker();
    });
} else {
    window.browserChecker = new BrowserCompatibilityChecker();
}

// Export for manual use
window.BrowserCompatibilityChecker = BrowserCompatibilityChecker;