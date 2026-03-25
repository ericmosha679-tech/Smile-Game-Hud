/**
 * Mobile Menu Accessibility & Functionality Test Suite
 * Run this script in the browser console to test the mobile menu implementation
 */

class MobileMenuTester {
    constructor() {
        this.testResults = [];
        this.currentTest = 0;
        this.totalTests = 0;
    }

    // Test utilities
    log(message, type = 'info') {
        const styles = {
            info: 'color: #0066cc',
            success: 'color: #28a745; font-weight: bold',
            error: 'color: #dc3545; font-weight: bold',
            warning: 'color: #ffc107; font-weight: bold'
        };
        console.log(`%c${message}`, styles[type]);
    }

    assert(condition, testName, errorMsg = null) {
        this.totalTests++;
        if (condition) {
            this.log(`✅ PASS: ${testName}`, 'success');
            this.testResults.push({ test: testName, passed: true });
            return true;
        } else {
            this.log(`❌ FAIL: ${testName} - ${errorMsg || 'Condition failed'}`, 'error');
            this.testResults.push({ test: testName, passed: false, error: errorMsg });
            return false;
        }
    }

    // DOM helpers
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    simulateKeyPress(element, key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    simulateClick(element) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Test methods
    async testBasicStructure() {
        this.log('\n🏗️ Testing Basic Structure...', 'info');

        // Test hamburger button exists
        const hamburger = document.getElementById('mobileMenuToggle');
        this.assert(hamburger !== null, 'Hamburger button exists');

        // Test mobile menu panel exists
        const panel = document.getElementById('mobileMenuPanel');
        this.assert(panel !== null, 'Mobile menu panel exists');

        // Test close button exists
        const closeBtn = document.getElementById('mobileMenuClose');
        this.assert(closeBtn !== null, 'Close button exists');

        // Test utility buttons exist
        const utilityBtns = document.querySelectorAll('.mobile-utility-btn');
        this.assert(utilityBtns.length === 4, '4 utility buttons exist');

        // Test navigation items exist
        const navItems = document.querySelectorAll('.mobile-nav-item');
        this.assert(navItems.length > 0, 'Navigation items exist');
    }

    async testARIAAttributes() {
        this.log('\n🎯 Testing ARIA Attributes...', 'info');

        const hamburger = document.getElementById('mobileMenuToggle');
        const panel = document.getElementById('mobileMenuPanel');

        // Test initial ARIA state
        this.assert(
            hamburger.getAttribute('aria-expanded') === 'false',
            'Hamburger aria-expanded initially false'
        );

        this.assert(
            hamburger.getAttribute('aria-controls') === 'mobileMenuPanel',
            'Hamburger aria-controls points to panel'
        );

        this.assert(
            hamburger.getAttribute('aria-label') === 'Open main menu',
            'Hamburger has correct initial aria-label'
        );

        this.assert(
            panel.getAttribute('aria-hidden') === 'true',
            'Panel initially aria-hidden true'
        );

        this.assert(
            panel.getAttribute('role') === 'dialog',
            'Panel has dialog role'
        );

        this.assert(
            panel.getAttribute('aria-modal') === 'true',
            'Panel has aria-modal true'
        );

        // Test utility button ARIA
        const subscriptionBtn = document.getElementById('mobileSubscriptionBtn');
        this.assert(
            subscriptionBtn.getAttribute('aria-label') === 'View subscription plans',
            'Subscription button has proper aria-label'
        );

        this.assert(
            subscriptionBtn.getAttribute('data-action') === 'subscription',
            'Subscription button has correct data-action'
        );
    }

    async testKeyboardNavigation() {
        this.log('\n⌨️ Testing Keyboard Navigation...', 'info');

        const hamburger = document.getElementById('mobileMenuToggle');
        const panel = document.getElementById('mobileMenuPanel');

        // Focus hamburger
        hamburger.focus();
        this.assert(
            document.activeElement === hamburger,
            'Can focus hamburger button'
        );

        // Test Enter key to open
        this.simulateKeyPress(hamburger, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 100));

        this.assert(
            panel.getAttribute('aria-hidden') === 'false',
            'Enter key opens menu'
        );

        this.assert(
            hamburger.getAttribute('aria-expanded') === 'true',
            'aria-expanded updated to true'
        );

        // Test focus trap
        const firstUtilityBtn = document.querySelector('.mobile-utility-btn');
        this.assert(
            document.activeElement === firstUtilityBtn,
            'Focus moves to first utility button'
        );

        // Test Tab navigation
        this.simulateKeyPress(document.activeElement, 'Tab');
        await new Promise(resolve => setTimeout(resolve, 50));

        const secondUtilityBtn = document.querySelectorAll('.mobile-utility-btn')[1];
        this.assert(
            document.activeElement === secondUtilityBtn,
            'Tab moves to next utility button'
        );

        // Test Escape key
        this.simulateKeyPress(document.activeElement, 'Escape');
        await new Promise(resolve => setTimeout(resolve, 100));

        this.assert(
            panel.getAttribute('aria-hidden') === 'true',
            'Escape key closes menu'
        );

        this.assert(
            document.activeElement === hamburger,
            'Focus returns to hamburger'
        );
    }

    async testModalIntegration() {
        this.log('\n🔗 Testing Modal Integration...', 'info');

        const hamburger = document.getElementById('mobileMenuToggle');
        const panel = document.getElementById('mobileMenuPanel');

        // Open menu
        hamburger.focus();
        this.simulateKeyPress(hamburger, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test subscription button
        const subscriptionBtn = document.getElementById('mobileSubscriptionBtn');
        subscriptionBtn.focus();
        this.simulateKeyPress(subscriptionBtn, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify menu closed
        this.assert(
            panel.getAttribute('aria-hidden') === 'true',
            'Menu closes when subscription clicked'
        );

        // Check if modal opened (if exists)
        const subscriptionModal = document.querySelector('#paymentModal, .modal');
        if (subscriptionModal) {
            this.assert(
                !subscriptionModal.classList.contains('hidden'),
                'Subscription modal opened'
            );
        }

        // Close any open modal for next test
        const closeBtn = document.querySelector('.modal-close, .close-modal');
        if (closeBtn) {
            this.simulateClick(closeBtn);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Test login button
        hamburger.focus();
        this.simulateKeyPress(hamburger, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 100));

        const loginBtn = document.getElementById('mobileLoginBtn');
        loginBtn.focus();
        this.simulateKeyPress(loginBtn, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 200));

        this.assert(
            panel.getAttribute('aria-hidden') === 'true',
            'Menu closes when login clicked'
        );
    }

    async testResponsiveBehavior() {
        this.log('\n📱 Testing Responsive Behavior...', 'info');

        const panel = document.getElementById('mobileMenuPanel');
        const originalWidth = window.innerWidth;

        // Test small screen behavior
        if (originalWidth <= 480) {
            this.assert(
                window.getComputedStyle(panel).width === '100vw' || 
                window.getComputedStyle(panel).width === '100%',
                'Full-screen overlay on small screens'
            );
        } else if (originalWidth <= 768) {
            this.assert(
                window.getComputedStyle(panel).width === '320px',
                '320px drawer on tablets'
            );
        }

        // Test hamburger visibility
        const hamburger = document.getElementById('mobileMenuToggle');
        const hamburgerDisplay = window.getComputedStyle(hamburger).display;
        
        if (originalWidth <= 768) {
            this.assert(
                hamburgerDisplay !== 'none',
                'Hamburger visible on mobile'
            );
        } else {
            this.assert(
                hamburgerDisplay === 'none',
                'Hamburger hidden on desktop'
            );
        }
    }

    async testAccessibilityFeatures() {
        this.log('\n♿ Testing Accessibility Features...', 'info');

        const panel = document.getElementById('mobileMenuPanel');
        const hamburger = document.getElementById('mobileMenuToggle');

        // Test focus management
        hamburger.focus();
        this.simulateKeyPress(hamburger, 'Enter');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check focus trap elements
        const focusableElements = panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        this.assert(
            focusableElements.length > 0,
            'Focusable elements found in menu'
        );

        // Test body scroll lock
        const originalOverflow = document.body.style.overflow;
        this.assert(
            document.body.style.overflow === 'hidden',
            'Body scroll locked when menu open'
        );

        // Close menu and verify scroll restored
        this.simulateKeyPress(document.activeElement, 'Escape');
        await new Promise(resolve => setTimeout(resolve, 100));

        this.assert(
            document.body.style.overflow !== 'hidden',
            'Body scroll restored when menu closed'
        );
    }

    async testVisualDesign() {
        this.log('\n🎨 Testing Visual Design...', 'info');

        const utilityBtns = document.querySelectorAll('.mobile-utility-btn');
        const navItems = document.querySelectorAll('.mobile-nav-item');

        // Test admin button styling
        const adminBtn = document.getElementById('mobileAdminBtn');
        const adminStyles = window.getComputedStyle(adminBtn);
        
        this.assert(
            adminStyles.backgroundColor.includes('244, 67, 54') ||
            adminStyles.backgroundColor.includes('f44336'),
            'Admin button has red styling'
        );

        // Test touch target sizes
        const firstBtn = utilityBtns[0];
        const btnStyles = window.getComputedStyle(firstBtn);
        const btnHeight = parseInt(btnStyles.height);
        const btnWidth = parseInt(btnStyles.width);

        this.assert(
            btnHeight >= 44 && btnWidth >= 44,
            'Touch targets meet 44x44px minimum'
        );

        // Test section separation
        const utilitiesSection = document.querySelector('.mobile-utilities-section');
        const sectionStyles = window.getComputedStyle(utilitiesSection);
        
        this.assert(
            sectionStyles.borderBottomWidth !== '0px' ||
            sectionStyles.marginBottom !== '0px',
            'Visual separation between sections'
        );
    }

    async runAllTests() {
        this.log('🚀 Starting Mobile Menu Test Suite...', 'info');
        this.log('=====================================', 'info');

        try {
            await this.testBasicStructure();
            await this.testARIAAttributes();
            await this.testKeyboardNavigation();
            await this.testModalIntegration();
            await this.testResponsiveBehavior();
            await this.testAccessibilityFeatures();
            await this.testVisualDesign();

            this.log('\n=====================================', 'info');
            this.log(`📊 Test Results: ${this.testResults.filter(r => r.passed).length}/${this.totalTests} passed`, 'info');

            const failedTests = this.testResults.filter(r => !r.passed);
            if (failedTests.length > 0) {
                this.log('\n❌ Failed Tests:', 'error');
                failedTests.forEach(test => {
                    this.log(`  - ${test.test}: ${test.error || 'Unknown error'}`, 'error');
                });
            } else {
                this.log('\n🎉 All tests passed! Mobile menu is fully accessible and functional.', 'success');
            }

            return {
                total: this.totalTests,
                passed: this.testResults.filter(r => r.passed).length,
                failed: failedTests.length,
                results: this.testResults
            };

        } catch (error) {
            this.log(`\n💥 Test suite error: ${error.message}`, 'error');
            return { error: error.message };
        }
    }

    // Quick accessibility check
    async quickAccessibilityCheck() {
        this.log('⚡ Quick Accessibility Check...', 'info');

        const checks = [
            () => this.assert(document.getElementById('mobileMenuToggle') !== null, 'Hamburger exists'),
            () => this.assert(document.getElementById('mobileMenuPanel') !== null, 'Menu panel exists'),
            () => this.assert(document.querySelectorAll('.mobile-utility-btn').length === 4, '4 utility buttons'),
            () => this.assert(document.getElementById('mobileMenuToggle').getAttribute('aria-controls') === 'mobileMenuPanel', 'aria-controls correct'),
            () => this.assert(document.getElementById('mobileMenuPanel').getAttribute('role') === 'dialog', 'Panel has dialog role'),
            () => this.assert(document.getElementById('mobileMenuPanel').getAttribute('aria-modal') === 'true', 'Panel has aria-modal'),
        ];

        checks.forEach(check => check());

        this.log(`Quick check complete: ${this.testResults.filter(r => r.passed).length}/${checks.length} passed`, 'info');
    }
}

// Auto-run tests if script is loaded
if (typeof window !== 'undefined') {
    window.mobileMenuTester = new MobileMenuTester();
    
    // Run quick check immediately
    window.mobileMenuTester.quickAccessibilityCheck();
    
    // Make full test suite available
    console.log('🔧 Mobile Menu Tester loaded. Run window.mobileMenuTester.runAllTests() for full test suite.');
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileMenuTester;
}
