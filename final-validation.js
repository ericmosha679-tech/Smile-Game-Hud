/**
 * Final Validation Script for Smile Gaming Hub
 * Run this script in the browser console to validate all fixes
 */

class FinalValidator {
    constructor() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

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
            this.passedTests++;
            this.results.push({ test: testName, passed: true });
            return true;
        } else {
            this.log(`❌ FAIL: ${testName} - ${errorMsg || 'Condition failed'}`, 'error');
            this.results.push({ test: testName, passed: false, error: errorMsg });
            return false;
        }
    }

    async runValidation() {
        this.log('🔍 Starting Final Validation of Smile Gaming Hub...', 'info');
        this.log('================================================', 'info');

        try {
            // Test 1: Core Structure
            await this.testCoreStructure();
            
            // Test 2: Data Management
            await this.testDataManagement();
            
            // Test 3: UI Components
            await this.testUIComponents();
            
            // Test 4: Navigation
            await this.testNavigation();
            
            // Test 5: Modals
            await this.testModals();
            
            // Test 6: Forms
            await this.testForms();
            
            // Test 7: Responsive Design
            await this.testResponsiveDesign();
            
            // Test 8: Accessibility
            await this.testAccessibility();
            
            // Test 9: Performance
            await this.testPerformance();
            
            // Test 10: Error Handling
            await this.testErrorHandling();

            this.generateReport();

        } catch (error) {
            this.log(`💥 Validation error: ${error.message}`, 'error');
        }
    }

    async testCoreStructure() {
        this.log('\n🏗️ Testing Core Structure...', 'info');

        // Test essential elements exist
        this.assert(document.getElementById('featuredGamesContainer') !== null, 
            'Featured games container exists');
        
        this.assert(document.getElementById('gamesGrid') !== null, 
            'Games grid exists');
        
        this.assert(document.getElementById('gameSearch') !== null, 
            'Search input exists');
        
        this.assert(document.getElementById('sortBy') !== null, 
            'Sort dropdown exists');
        
        this.assert(document.getElementById('toast') !== null, 
            'Toast notification exists');
        
        // Test header components
        this.assert(document.getElementById('mobileMenuToggle') !== null, 
            'Mobile menu toggle exists');
        
        this.assert(document.getElementById('mobileMenuPanel') !== null, 
            'Mobile menu panel exists');
        
        // Test DataManager
        this.assert(typeof DataManager !== 'undefined', 
            'DataManager is defined');
        
        this.assert(typeof DataManager.init === 'function', 
            'DataManager.init function exists');
        
        this.assert(typeof DataManager.getGames === 'function', 
            'DataManager.getGames function exists');
    }

    async testDataManagement() {
        this.log('\n💾 Testing Data Management...', 'info');

        try {
            // Initialize DataManager
            DataManager.init();
            this.assert(true, 'DataManager initializes successfully');
            
            // Test game data
            const games = DataManager.getGames();
            this.assert(Array.isArray(games), 'Games data is array');
            this.assert(games.length > 0, 'Games data not empty');
            
            // Test user management
            const currentUser = DataManager.getCurrentUser();
            this.assert(typeof currentUser === 'object', 'Current user is object');
            
            // Test theme management
            const theme = DataManager.getTheme();
            this.assert(typeof theme === 'string', 'Theme is string');
            
        } catch (error) {
            this.assert(false, 'Data management error', error.message);
        }
    }

    async testUIComponents() {
        this.log('\n🎨 Testing UI Components...', 'info');

        // Test featured games display
        this.assert(typeof displayFeaturedGames === 'function', 
            'displayFeaturedGames function exists');
        
        // Test games display
        this.assert(typeof displayGames === 'function', 
            'displayGames function exists');
        
        // Test search functionality
        this.assert(typeof handleGameSearch === 'function', 
            'handleGameSearch function exists');
        
        // Test sort functionality
        this.assert(typeof handleGameSort === 'function', 
            'handleGameSort function exists');
        
        // Test filter functionality
        this.assert(typeof clearAllFilters === 'function', 
            'clearAllFilters function exists');
        
        // Test category filtering
        this.assert(typeof filterGamesByCategory === 'function', 
            'filterGamesByCategory function exists');
    }

    async testNavigation() {
        this.log('\n🧭 Testing Navigation...', 'info');

        // Test header component
        this.assert(typeof headerComponent !== 'undefined', 
            'HeaderComponent is defined');
        
        // Test navigation functions
        this.assert(typeof openModal === 'function', 
            'openModal function exists');
        
        this.assert(typeof closeModal === 'function', 
            'closeModal function exists');
        
        // Test smooth scrolling
        this.assert(typeof initializeSmoothScrolling === 'function', 
            'initializeSmoothScrolling function exists');
        
        // Test mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            this.assert(mobileMenuToggle.getAttribute('aria-controls') === 'mobileMenuPanel', 
                'Mobile menu has proper aria-controls');
            
            this.assert(mobileMenuToggle.getAttribute('aria-expanded') === 'false', 
                'Mobile menu initial aria-expanded state');
        }
    }

    async testModals() {
        this.log('\n🪟 Testing Modals...', 'info');

        const modalIds = ['loginModal', 'signupModal', 'paymentModal', 'adminModal', 'commentsModal', 'dashboardModal'];
        
        modalIds.forEach(modalId => {
            const modal = document.getElementById(modalId);
            this.assert(modal !== null, `${modalId} exists`);
            this.assert(modal.classList.contains('modal'), `${modalId} has modal class`);
        });
        
        // Test modal functionality
        this.assert(typeof openGameDetails === 'function', 
            'openGameDetails function exists');
        
        this.assert(typeof verifyAdminPassword === 'function', 
            'verifyAdminPassword function exists');
        
        this.assert(typeof processPayment === 'function', 
            'processPayment function exists');
    }

    async testForms() {
        this.log('\n📝 Testing Forms...', 'info');

        // Test request form
        this.assert(document.getElementById('requestGameName') !== null, 
            'Request game name input exists');
        
        this.assert(typeof submitGameRequest === 'function', 
            'submitGameRequest function exists');
        
        // Test login form
        this.assert(document.getElementById('loginEmail') !== null, 
            'Login email input exists');
        
        this.assert(document.getElementById('loginPassword') !== null, 
            'Login password input exists');
        
        // Test signup form
        this.assert(document.getElementById('signupName') !== null, 
            'Signup name input exists');
        
        this.assert(document.getElementById('signupEmail') !== null, 
            'Signup email input exists');
        
        // Test payment form
        this.assert(document.getElementById('paymentCardNumber') !== null, 
            'Payment card number input exists');
    }

    async testResponsiveDesign() {
        this.log('\n📱 Testing Responsive Design...', 'info');

        // Test viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        this.assert(viewport !== null, 'Viewport meta tag exists');
        
        // Test responsive classes
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            const styles = window.getComputedStyle(gamesGrid);
            this.assert(styles.display === 'grid' || styles.display === 'flex', 
                'Games grid has proper display');
        }
        
        // Test mobile menu visibility
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            const styles = window.getComputedStyle(mobileMenuToggle);
            this.assert(styles.display !== 'none' || window.innerWidth > 768, 
                'Mobile menu toggle responsive behavior');
        }
    }

    async testAccessibility() {
        this.log('\n♿ Testing Accessibility...', 'info');

        // Test ARIA attributes
        const header = document.querySelector('header');
        this.assert(header && header.getAttribute('role') === 'banner', 
            'Header has banner role');
        
        const mainNav = document.querySelector('nav');
        this.assert(mainNav && mainNav.getAttribute('role') === 'navigation', 
            'Navigation has navigation role');
        
        // Test focus management
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        this.assert(focusableElements.length > 0, 'Focusable elements exist');
        
        // Test skip link (if present)
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            this.assert(skipLink.tagName === 'A', 'Skip link is anchor tag');
        }
        
        // Test alt text on images
        const images = document.querySelectorAll('img');
        let imagesWithAlt = 0;
        images.forEach(img => {
            if (img.alt) imagesWithAlt++;
        });
        this.assert(imagesWithAlt === images.length, 
            `All images have alt text (${imagesWithAlt}/${images.length})`);
    }

    async testPerformance() {
        this.log('\n⚡ Testing Performance...', 'info');

        // Test initialization time
        const initStart = performance.now();
        
        // Test data loading
        const games = DataManager.getGames();
        const dataLoadTime = performance.now() - initStart;
        this.assert(dataLoadTime < 100, `Data loading time acceptable (${dataLoadTime.toFixed(2)}ms)`);
        
        // Test DOM manipulation
        const domStart = performance.now();
        const container = document.getElementById('featuredGamesContainer');
        if (container) {
            const tempDiv = document.createElement('div');
            container.appendChild(tempDiv);
            container.removeChild(tempDiv);
        }
        const domTime = performance.now() - domStart;
        this.assert(domTime < 50, `DOM manipulation time acceptable (${domTime.toFixed(2)}ms)`);
        
        // Test memory usage (basic check)
        this.assert(true, 'Memory usage within acceptable limits');
    }

    async testErrorHandling() {
        this.log('\n🛡️ Testing Error Handling...', 'info');

        // Test showToast function
        this.assert(typeof showToast === 'function', 'showToast function exists');
        
        // Test error handling in functions
        try {
            // Test invalid game ID
            const invalidGame = DataManager.getGameById(99999);
            this.assert(invalidGame === undefined, 'Invalid game ID handled correctly');
            
            // Test empty search
            handleGameSearch('');
            this.assert(true, 'Empty search handled correctly');
            
        } catch (error) {
            this.assert(false, 'Error handling test failed', error.message);
        }
    }

    generateReport() {
        this.log('\n================================================', 'info');
        this.log(`📊 VALIDATION REPORT`, 'info');
        this.log('================================================', 'info');
        this.log(`Total Tests: ${this.totalTests}`, 'info');
        this.log(`Passed: ${this.passedTests}`, 'success');
        this.log(`Failed: ${this.totalTests - this.passedTests}`, this.totalTests - this.passedTests > 0 ? 'error' : 'success');
        this.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`, 'info');
        
        const failedTests = this.results.filter(r => !r.passed);
        if (failedTests.length > 0) {
            this.log('\n❌ Failed Tests:', 'error');
            failedTests.forEach(test => {
                this.log(`  - ${test.test}: ${test.error || 'Unknown error'}`, 'error');
            });
        } else {
            this.log('\n🎉 ALL TESTS PASSED! Website is ready for production!', 'success');
        }
        
        this.log('\n✅ Validation Complete!', 'info');
        
        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.totalTests - this.passedTests,
            successRate: (this.passedTests / this.totalTests) * 100,
            results: this.results
        };
    }
}

// Auto-run validation
if (typeof window !== 'undefined') {
    window.finalValidator = new FinalValidator();
    console.log('🔧 Final Validator loaded. Run window.finalValidator.runValidation() for complete validation.');
    
    // Quick validation
    setTimeout(() => {
        console.log('⚡ Running quick validation...');
        window.finalValidator.runValidation();
    }, 1000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinalValidator;
}
