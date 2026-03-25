// ============================================
// MAIN PUBLIC PAGE FUNCTIONALITY
// ============================================

let currentRating = 0;
let currentPaymentGameId = null;
let currentCommentsGameId = null;
let currentPaymentMethod = 'card';
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSortOption = 'default';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 Initializing Smile Gaming Hub...');
        
        // Initialize core functionality
        applySavedThemeMode();
        checkFirebaseStatus();
        initializeUI();
        setupRealtimeGameListener();
        loadGamesGrid();
        setupEventListeners();
        checkUserSession();
        
        // Initialize professional features
        initializeProfessionalFeatures();
        
        console.log('✅ Smile Gaming Hub initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showToast('❌ Error loading application. Please refresh the page.', 'error');
    }
});

// ============ PROFESSIONAL FEATURES ============

function initializeProfessionalFeatures() {
    try {
        console.log('🔧 Initializing professional features...');
        
        // Initialize loading states
        initializeLoadingStates();
        
        // Initialize error handling
        initializeErrorHandling();
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
        
        // Initialize accessibility features
        initializeAccessibilityFeatures();
        
        // Initialize analytics tracking
        initializeAnalyticsTracking();
        
        console.log('✅ Professional features initialized');
    } catch (error) {
        console.error('❌ Error initializing professional features:', error);
    }
}

function initializeLoadingStates() {
    // Add loading indicators for better UX
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        gamesGrid.innerHTML = '<div class="loading-spinner">Loading games...</div>';
    }
}

function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showToast('❌ An unexpected error occurred. Please try again.', 'error');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showToast('❌ A network error occurred. Please check your connection.', 'error');
    });
}

function initializePerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`📊 Page load time: ${loadTime}ms`);
            
            if (loadTime > 3000) {
                console.warn('⚠️ Slow page load detected');
            }
        });
    }
}

function initializeAccessibilityFeatures() {
    // Add keyboard navigation support
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Close any open modal on Escape
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Add ARIA labels dynamically
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent || 'Button');
        }
    });
}

function initializeAnalyticsTracking() {
    // Track user interactions
    let interactionCount = 0;
    
    document.addEventListener('click', () => {
        interactionCount++;
        
        // Log interaction data (in real implementation, send to analytics service)
        if (interactionCount % 10 === 0) {
            console.log(`📈 User interactions: ${interactionCount}`);
        }
    });
}

// ============ REAL-TIME FIREBASE LISTENER ============

function setupRealtimeGameListener() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        showToast('⚠️ Firebase not available - using local cache only', 'warning');
        console.warn('Firebase not initialized. Skipping real-time game listener.');
        return;
    }

    firebase.database().ref('games/').on('value', (snapshot) => {
        const data = snapshot.val();
        updateUI(data);
    });
}

function checkFirebaseStatus() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        showToast('⚠️ Operating in offline mode - data may not sync to server', 'warning');
        return false;
    }
    return true;
}

function updateUI(data) {
    try {
        console.log('🔄 Updating UI with new data...');
        
        if (!data) {
            console.warn('⚠️ No data received, showing empty state');
            displayGames([]);
            displayFeaturedGames([]);
            return;
        }

        let gamesArray = [];
        if (Array.isArray(data)) {
            gamesArray = data.filter(Boolean);
        } else if (typeof data === 'object') {
            gamesArray = Object.keys(data).map(key => {
                const game = data[key];
                return {
                    id: parseInt(key) || Math.random(),
                    title: game.title || 'Untitled',
                    category: game.category || 'other',
                    price: parseFloat(game.price) || 0,
                    rating: parseFloat(game.rating) || 0,
                    downloads: parseInt(game.downloads) || 0,
                    description: game.description || '',
                    imageUrl: game.imageUrl || 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop'
                };
            });
        }

        // Validate game data
        gamesArray = gamesArray.filter(game => {
            return game && game.title && game.category;
        });

        console.log(`📊 Processed ${gamesArray.length} valid games`);

        // Optional local cache sync
        if (gamesArray.length > 0) {
            try {
                localStorage.setItem('gamesData', JSON.stringify(gamesArray));
                console.log('💾 Games cached locally');
            } catch (error) {
                console.warn('⚠️ Failed to cache games locally:', error);
            }
        }

        // Refresh current UI (filtered/sorted view)
        applyAllFiltersAndSort();
        displayFeaturedGames(gamesArray);
        
        // Remove loading state
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid && gamesGrid.querySelector('.loading-spinner')) {
            gamesGrid.innerHTML = '';
        }
        
        console.log('✅ UI updated successfully');
    } catch (error) {
        console.error('❌ Error updating UI:', error);
        showToast('❌ Error loading games. Please refresh the page.', 'error');
        
        // Show error state
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.innerHTML = `
                <div class="error-boundary">
                    <h3>❌ Unable to Load Games</h3>
                    <p>We're having trouble loading our game catalog. Please check your internet connection and try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
        }
    }
}

// ============ INITIALIZATION ============

function initializeUI() {
    // Apply saved theme
    const theme = DataManager.getTheme();
    DataManager.applyTheme(theme);

    // Apply background theme
    applyBackgroundTheme();

    // Set up category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            filterGamesByCategory(category);
        });
    });
}

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('subscriptionBtn').addEventListener('click', toggleSubscription);
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('signupBtn').addEventListener('click', () => openModal('signupModal'));
    document.getElementById('dashboardBtn').addEventListener('click', () => openModal('dashboardModal'));
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    document.getElementById('adminAccessBtn').addEventListener('click', () => openModal('adminModal'));
    document.getElementById('themeToggleBtn').addEventListener('click', toggleThemeMode);
    document.getElementById('exploreBtn').addEventListener('click', scrollToCategories);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function checkUserSession() {
    const currentUser = DataManager.getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        dashboardBtn.style.display = 'block';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        dashboardBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// ============ THEME MODE TOGGLE ============

function applySavedThemeMode() {
    const theme = localStorage.getItem('siteThemeMode') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeToggleBtn').textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        document.getElementById('themeToggleBtn').textContent = '☀️';
    }
}

function toggleThemeMode() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('siteThemeMode', isLight ? 'light' : 'dark');
    document.getElementById('themeToggleBtn').textContent = isLight ? '🌙' : '☀️';
}

// ============ BACKGROUND THEME ============

function applyBackgroundTheme() {
    const backgroundImages = DataManager.getBackgroundImages();
    if (!backgroundImages || backgroundImages.length === 0) {
        console.log('No background images found');
        return;
    }

    // Get the current background index (default to 0)
    const currentBgIndex = 0;
    const bgUrl = backgroundImages[currentBgIndex];

    if (!bgUrl) {
        console.warn('Background URL is empty');
        return;
    }

    // Remove existing style if present
    const styleTag = document.getElementById('bgShuffleStyle');
    if (styleTag) {
        styleTag.remove();
    }

    // Create a CSS rule for the body background
    const newStyle = document.createElement('style');
    newStyle.id = 'bgShuffleStyle';
    // Handle both base64 data URLs and regular URLs
    const bgImageUrl = bgUrl.startsWith('data:') || bgUrl.startsWith('http')
        ? bgUrl
        : `url('${bgUrl}')`;
    
    newStyle.textContent = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: ${bgUrl.startsWith('data:') || bgUrl.startsWith('http') ? `url('${bgUrl}')` : `url('${bgUrl}')`};
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            opacity: 0.15;
            z-index: -1;
            pointer-events: none;
        }
    `;
    document.head.appendChild(newStyle);
}

// ============ DEVICE DETECTION & OPTIMIZATION ============

function detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    return {
        isMobile: isMobile,
        isTablet: isTablet,
        isDesktop: isDesktop,
        isTouchDevice: () => {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        },
        isLandscape: () => {
            return window.innerHeight < window.innerWidth;
        },
        screenSize: {
            width: window.innerWidth,
            height: window.innerHeight,
            type: getScreenSizeType()
        }
    };
}

function getScreenSizeType() {
    const width = window.innerWidth;
    if (width < 480) return 'small-mobile';
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1200) return 'tablet-landscape';
    return 'desktop';
}

// Detect device and apply optimizations
const deviceInfo = detectDeviceType();

// Add device class to body for CSS targeting
document.addEventListener('DOMContentLoaded', () => {
    const screenType = getScreenSizeType();
    document.body.classList.add(`device-${screenType}`);
    
    if (deviceInfo.isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
    
    if (deviceInfo.isTablet) {
        document.body.classList.add('tablet-device');
    }
    
    if (deviceInfo.isDesktop) {
        document.body.classList.add('desktop-device');
    }
    
    // Prevent accidental zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300 && event.touches.length === 0) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    // Re-layout elements after orientation change
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);
});

// Optimize for landscape mode
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = height < width;
    
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero');
    
    if (isLandscape && width < 768) {
        // Reduce padding and height for mobile landscape
        if (hero) hero.style.minHeight = '200px';
    } else if (hero) {
        hero.style.minHeight = '';
    }
});

// ============ GAMES DISPLAY & FILTERING ============

function loadGamesGrid() {
    applyAllFiltersAndSort();
    displayFeaturedGames(DataManager.getGames());
}

function displayGames(games) {
    try {
        console.log(`🎮 Displaying ${games.length} games`);
        
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) {
            console.error('❌ Games grid element not found');
            return;
        }
        
        gamesGrid.innerHTML = '';

        if (!games || games.length === 0) {
            gamesGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🎮</div>
                    <h3>No Games Found</h3>
                    <p>Try adjusting your filters or search terms to find games.</p>
                    <button class="btn btn-secondary" onclick="clearAllFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        const currentUser = DataManager.getCurrentUser();
        let validGamesCount = 0;
        
        games.forEach((game, index) => {
            try {
                // Validate game data
                if (!game || !game.id || !game.title) {
                    console.warn('⚠️ Invalid game data:', game);
                    return;
                }
                
                const gameCard = createGameCard(game);
                if (gameCard) {
                    gamesGrid.appendChild(gameCard);
                    validGamesCount++;
                    
                    // Add subscription info if user is logged in
                    if (currentUser && currentUser.subscription) {
                        const subInfo = DataManager.getUserSubscriptionInfo(currentUser.id);
                        const subInfoElement = document.getElementById(`subInfo-${game.id}`);
                        if (subInfoElement && subInfo.tier !== 'none') {
                            const tierEmoji = {
                                'free': '🎯',
                                'premium': '⭐',
                                'pro': '👑'
                            };
                            const tierName = subInfo.tier ? subInfo.tier.toUpperCase() : 'UNKNOWN';
                            subInfoElement.innerHTML = `${tierEmoji[subInfo.tier] || ''} ${tierName}: ${subInfo.remaining} games remaining`;
                            subInfoElement.className = subInfo.remaining <= 1 ? 'remaining warning' : 'remaining';
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error creating game card for game ${game.id}:`, error);
            }
        });
        
        console.log(`✅ Successfully displayed ${validGamesCount} games`);
        
        // Update category counts
        updateCategoryCounts(games);
        
    } catch (error) {
        console.error('❌ Error displaying games:', error);
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.innerHTML = `
                <div class="error-boundary">
                    <h3>❌ Error Displaying Games</h3>
                    <p>We encountered an error while loading games. Please try again.</p>
                    <button class="btn btn-primary" onclick="loadGamesGrid()">Retry</button>
                </div>
            `;
        }
    }
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    // Parse date safely - handle both YYYY-MM-DD and other formats
    let releaseDate = 'N/A';
    if (game.releaseDate) {
        const dateParts = game.releaseDate.split('-');
        if (dateParts.length === 3) {
            const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            if (!isNaN(date.getTime())) {
                releaseDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }
    }
    
    const isLatest = game.rating >= 4.7 && game.releaseDate && game.releaseDate > '2024-01-01';
    
    card.innerHTML = `
        <div class="game-card-image">
            <img src="${game.imageUrl}" alt="${game.title}" class="game-image" loading="lazy" onerror="this.src='https://via.placeholder.com/150x150?text=${encodeURIComponent(game.title)}'">
        </div>
        <div class="game-card-footer">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-meta">
                <span class="game-release">${releaseDate}</span>
                ${isLatest ? '<span class="latest-tag">Latest</span>' : ''}
            </div>
            <div class="game-actions">
                <button class="game-action-btn" onclick="initiateDownload(${game.id}, '${game.title}')" title="Download">⬇️</button>
                <button class="game-action-btn secondary" onclick="openGameDetails(${game.id})" title="Details">ℹ️</button>
            </div>
        </div>
    `;
    card.id = `game-card-${game.id}`;
    return card;
}

function displayFeaturedGames(games) {
    const sortedGames = [...games].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const tableBody = document.getElementById('featuredTable');
    tableBody.innerHTML = '';

    sortedGames.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${game.title}</strong></td>
            <td>${capitalizeFirst(game.category)}</td>
            <td>⭐ ${game.rating}</td>
            <td>${game.price === 0 ? 'FREE' : '$' + game.price.toFixed(2)}</td>
            <td>${game.downloads}</td>
            <td>
                <button class="table-action-btn" onclick="initiateDownload(${game.id}, '${game.title}')">Download</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateCategoryCounts(games) {
    try {
        // Count games by category
        const categoryCounts = {
            all: games.length,
            action: 0,
            rpg: 0,
            puzzle: 0,
            strategy: 0,
            sports: 0,
            adventure: 0,
            simulation: 0,
            casual: 0,
            indie: 0,
            multiplayer: 0,
            horror: 0
        };

        games.forEach(game => {
            if (categoryCounts.hasOwnProperty(game.category)) {
                categoryCounts[game.category]++;
            }
        });

        // Update UI with counts
        const allGamesCount = document.getElementById('allGamesCount');
        if (allGamesCount) {
            allGamesCount.textContent = categoryCounts.all;
        }

        // Update category button counts
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            if (category && categoryCounts[category] !== undefined) {
                const countSpan = button.querySelector('span');
                if (countSpan) {
                    countSpan.textContent = categoryCounts[category];
                }
            }
        });

        console.log('📊 Category counts updated:', categoryCounts);
    } catch (error) {
        console.error('❌ Error updating category counts:', error);
    }
}

function filterGamesByCategory(category) {
    currentCategory = category;
    applyAllFiltersAndSort();
}

function handleGameSearch(query) {
    try {
        currentSearchQuery = query.toLowerCase().trim();
        
        // If search box is empty, hide dropdown
        if (!query.trim()) {
            hideSearchDropdown();
            return;
        }
        
        // Show dropdown with filtered results
        showSearchResults(query);
        applyAllFiltersAndSort();
        
        console.log(`🔍 Searching for: "${query}"`);
    } catch (error) {
        console.error('❌ Error handling search:', error);
        showToast('❌ Search error. Please try again.', 'error');
    }
}

function showSearchDropdown() {
    const query = document.getElementById('gameSearch').value;
    if (query.trim()) {
        showSearchResults(query);
    }
}

function hideSearchDropdown() {
    const searchDropdown = document.getElementById('searchDropdown');
    searchDropdown.style.display = 'none';
}

function selectSearchResult(gameId) {
    const game = DataManager.getGameById(gameId);
    if (!game) return;
    
    // Update search to show only this game
    document.getElementById('gameSearch').value = game.title;
    hideSearchDropdown();
    
    // Scroll to game and highlight it
    applyAllFiltersAndSort();
    const gameCard = document.getElementById(`game-card-${gameId}`);
    if (gameCard) {
        gameCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        gameCard.style.boxShadow = '0 0 30px rgba(255, 107, 53, 0.6)';
        setTimeout(() => {
            gameCard.style.boxShadow = '';
        }, 2000);
    }
}

function handleGameSort(sortOption) {
    currentSortOption = sortOption;
    applyAllFiltersAndSort();
}

function applyAllFiltersAndSort() {
    let games = DataManager.getGames();
    
    // Apply category filter
    if (currentCategory !== 'all') {
        games = games.filter(g => g.category === currentCategory);
    }
    
    // Apply search filter
    if (currentSearchQuery) {
        games = games.filter(g => 
            g.title.toLowerCase().includes(currentSearchQuery) ||
            g.description.toLowerCase().includes(currentSearchQuery) ||
            g.category.toLowerCase().includes(currentSearchQuery)
        );
    }
    
    // Apply sorting
    games = sortGames(games, currentSortOption);
    
    // Update All Games count
    updateAllGamesCount(games.length);
    
    // Display results
    displayGames(games);
    
    // Update result count
    const resultCount = games.length;
    if (currentSearchQuery) {
        showToast(`Found ${resultCount} game${resultCount === 1 ? '' : 's'}`, 'info');
    }
}

function sortGames(games, sortOption) {
    const sorted = [...games];
    
    switch(sortOption) {
        case 'rating-high':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'rating-low':
            return sorted.sort((a, b) => a.rating - b.rating);
        case 'downloads-high':
            return sorted.sort((a, b) => b.downloads - a.downloads);
        case 'downloads-low':
            return sorted.sort((a, b) => a.downloads - b.downloads);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        default:
            return sorted;
    }
}

function updateAllGamesCount(count) {
    const countElement = document.getElementById('allGamesCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// ============ DOWNLOAD & PAYMENT ============

function initiateDownload(gameId, gameTitle) {
    const currentUser = DataManager.getCurrentUser();
    
    if (!currentUser) {
        showToast('Please log in to download games', 'warning');
        setTimeout(() => openModal('loginModal'), 500);
        return;
    }

    // Check subscription and access
    const subInfo = DataManager.getUserSubscriptionInfo(currentUser.id);
    
    if (subInfo.status === 'inactive') {
        showToast('Please choose a subscription plan to download games', 'warning');
        setTimeout(() => toggleSubscription(), 500);
        return;
    }

    if (subInfo.status === 'expired') {
        showToast('Your subscription has expired. Please renew your subscription.', 'warning');
        setTimeout(() => toggleSubscription(), 500);
        return;
    }

    // Check if user has reached game limit
    if (subInfo.remaining <= 0) {
        const message = subInfo.tier === 'free' 
            ? 'You have reached your free trial limit. Please upgrade your subscription.' 
            : 'You have reached your game access limit. Please check back next month.';
        showToast(message, 'warning');
        return;
    }

    const game = DataManager.getGameById(gameId);
    
    // Check if it's free
    if (game.price === 0) {
        completeDownload(gameId, gameTitle);
        return;
    }

    // Show payment modal
    currentPaymentGameId = gameId;
    showPaymentModal(game);
}

function showPaymentModal(game) {
    const gameInfo = document.getElementById('gameInfo');
    gameInfo.innerHTML = `
        <h4>${game.title}</h4>
        <p><strong>Category:</strong> ${capitalizeFirst(game.category)}</p>
        <p><strong>Total Price:</strong> <span style="color: #ff6b35; font-weight: bold;">$${game.price.toFixed(2)}</span></p>
    `;
    
    // Reset payment form
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardholderName').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCVV').value = '';
    document.getElementById('phoneName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('mobileProvider').value = '';
    document.getElementById('paymentMethodSelect').value = 'card';
    document.getElementById('paymentError').classList.remove('active');

    // Reset card type icons
    document.querySelectorAll('.card-icon').forEach(icon => icon.classList.remove('active'));
    document.querySelector('.visa-icon').classList.add('active');

    // Reset provider badge
    const providerBadge = document.getElementById('providerBadge');
    if (providerBadge) {
        providerBadge.innerHTML = '';
        providerBadge.classList.remove('active');
    }

    currentPaymentMethod = 'card';
    switchPaymentMethod('card');
    openModal('paymentModal');
}

function switchPaymentTab(method) {
    currentPaymentMethod = method;
    
    document.querySelectorAll('.payment-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    document.getElementById(method === 'card' ? 'cardPayment' : 'mobilePayment').classList.add('active');
}

function switchPaymentMethod(method) {
    currentPaymentMethod = method;
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    document.getElementById(method === 'card' ? 'cardPayment' : 'mobilePayment').classList.add('active');
}

// ============ CARD PAYMENT FEATURES ============

function detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const visaIcon = document.querySelector('.visa-icon');
    const mastercardIcon = document.querySelector('.mastercard-icon');
    const jcbIcon = document.querySelector('.jcb-icon');

    // Reset all icons to inactive
    [visaIcon, mastercardIcon, jcbIcon].forEach(icon => {
        if (icon) icon.classList.remove('active');
    });

    // Detect card type by first digit
    if (cleaned.startsWith('4')) {
        // Visa
        if (visaIcon) visaIcon.classList.add('active');
    } else if (cleaned.startsWith('5')) {
        // Mastercard
        if (mastercardIcon) mastercardIcon.classList.add('active');
    } else if (cleaned.startsWith('35')) {
        // JCB
        if (jcbIcon) jcbIcon.classList.add('active');
    }
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 4 digits
    if (value.length > 4) {
        value = value.slice(0, 4);
    }
    
    // Auto-format MM/YY
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    input.value = value;
}

// ============ COUNTRY & PROVIDER DETECTION ============

// Country code to providers mapping
const countryProviderMap = {
    '255': { 'country': 'Tanzania', 'flag': '🇹🇿', 'providers': ['airtel', 'vodafone', 'mtn', 'other'] },
    '256': { 'country': 'Uganda', 'flag': '🇺🇬', 'providers': ['airtel', 'mtn', 'other'] },
    '254': { 'country': 'Kenya', 'flag': '🇰🇪', 'providers': ['airtel', 'vodafone', 'other'] },
    '27': { 'country': 'South Africa', 'flag': '🇿🇦', 'providers': ['vodafone', 'other'] },
    '233': { 'country': 'Ghana', 'flag': '🇬🇭', 'providers': ['airtel', 'vodafone', 'other'] },
    '234': { 'country': 'Nigeria', 'flag': '🇳🇬', 'providers': ['airtel', 'mtn', 'other'] },
    '265': { 'country': 'Malawi', 'flag': '🇲🇼', 'providers': ['airtel', 'vodafone', 'other'] },
    '260': { 'country': 'Zambia', 'flag': '🇿🇲', 'providers': ['airtel', 'vodafone', 'mtn', 'other'] },
    '263': { 'country': 'Zimbabwe', 'flag': '🇿🇼', 'providers': ['vodafone', 'other'] },
    '1': { 'country': 'USA/Canada', 'flag': '🇺🇸', 'providers': ['airtel', 'vodafone', 'mtn', 'other'] },
    '44': { 'country': 'United Kingdom', 'flag': '🇬🇧', 'providers': ['vodafone', 'other'] },
    '33': { 'country': 'France', 'flag': '🇫🇷', 'providers': ['other'] },
    '49': { 'country': 'Germany', 'flag': '🇩🇪', 'providers': ['vodafone', 'other'] },
    '39': { 'country': 'Italy', 'flag': '🇮🇹', 'providers': ['vodafone', 'other'] },
    '34': { 'country': 'Spain', 'flag': '🇪🇸', 'providers': ['vodafone', 'other'] },
    '31': { 'country': 'Netherlands', 'flag': '🇳🇱', 'providers': ['vodafone', 'other'] },
    '32': { 'country': 'Belgium', 'flag': '🇧🇪', 'providers': ['vodafone', 'other'] },
    '46': { 'country': 'Sweden', 'flag': '🇸🇪', 'providers': ['vodafone', 'other'] },
    '47': { 'country': 'Norway', 'flag': '🇳🇴', 'providers': ['vodafone', 'other'] },
    '45': { 'country': 'Denmark', 'flag': '🇩🇰', 'providers': ['vodafone', 'other'] },
    '61': { 'country': 'Australia', 'flag': '🇦🇺', 'providers': ['vodafone', 'other'] },
    '64': { 'country': 'New Zealand', 'flag': '🇳🇿', 'providers': ['vodafone', 'other'] },
    '86': { 'country': 'China', 'flag': '🇨🇳', 'providers': ['other'] },
    '81': { 'country': 'Japan', 'flag': '🇯🇵', 'providers': ['other'] },
    '82': { 'country': 'South Korea', 'flag': '🇰🇷', 'providers': ['other'] },
    '91': { 'country': 'India', 'flag': '🇮🇳', 'providers': ['airtel', 'vodafone', 'mtn', 'other'] },
    '92': { 'country': 'Pakistan', 'flag': '🇵🇰', 'providers': ['airtel', 'vodafone', 'other'] },
    '880': { 'country': 'Bangladesh', 'flag': '🇧🇩', 'providers': ['airtel', 'vodafone', 'other'] },
};

// Provider details mapping
const providerDetailsMap = {
    'airtel': { 'emoji': '🔴', 'name': 'Airtel Money', 'color': '#dc143c' },
    'vodafone': { 'emoji': '🔴', 'name': 'Vodafone Cash', 'color': '#dc143c' },
    'mtn': { 'emoji': '🟡', 'name': 'MTN Money', 'color': '#ffd700' },
    'globus': { 'emoji': '💚', 'name': 'Globus Money', 'color': '#228b22' },
    'other': { 'emoji': '📱', 'name': 'Other Provider', 'color': '#999999' }
};

function detectCountryAndProviders(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const countryFlag = document.getElementById('countryFlag');
    const countryName = document.getElementById('countryName');
    const providerSelect = document.getElementById('mobileProvider');
    
    let detectedCountry = null;
    
    // Try to match country codes (longest first for accuracy)
    const sortedCodes = Object.keys(countryProviderMap).sort((a, b) => b.length - a.length);
    
    for (const code of sortedCodes) {
        if (cleanPhone.startsWith(code)) {
            detectedCountry = countryProviderMap[code];
            break;
        }
    }
    
    if (detectedCountry) {
        // Display country flag and name
        countryFlag.innerHTML = detectedCountry.flag;
        countryFlag.classList.add('active');
        countryName.innerHTML = `📍 ${detectedCountry.country}`;
        countryName.classList.remove('hidden');
        
        // Update provider dropdown with country-specific options
        updateProviderOptions(detectedCountry.providers);
    } else {
        // Reset if no country detected
        countryFlag.innerHTML = '';
        countryFlag.classList.remove('active');
        countryName.classList.add('hidden');
        
        // Show all providers as default
        updateProviderOptions(['airtel', 'vodafone', 'mtn', 'globus', 'other']);
    }
}

function updateProviderOptions(availableProviders) {
    const providerSelect = document.getElementById('mobileProvider');
    
    // Clear current options except the first placeholder
    while (providerSelect.options.length > 1) {
        providerSelect.remove(1);
    }
    
    // Add only available providers for the detected country
    availableProviders.forEach(providerKey => {
        const provider = providerDetailsMap[providerKey];
        const option = document.createElement('option');
        option.value = providerKey;
        option.textContent = `${provider.emoji} ${provider.name}`;
        providerSelect.appendChild(option);
    });
    
    // Reset provider selection
    providerSelect.value = '';
    const badge = document.getElementById('providerBadge');
    if (badge) {
        badge.innerHTML = '';
        badge.classList.remove('active');
    }
}

function detectProviderType(provider) {
    const badge = document.getElementById('providerBadge');
    badge.classList.remove('active');
    
    if (provider && providerDetailsMap[provider]) {
        badge.innerHTML = providerDetailsMap[provider].emoji;
        badge.classList.add('active');
        badge.title = providerDetailsMap[provider].name;
    } else {
        badge.innerHTML = '';
    }
}

function processPayment() {
    const errorDiv = document.getElementById('paymentError');
    errorDiv.classList.remove('active');

    if (currentPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardholder = document.getElementById('cardholderName').value.trim();
        const expiry = document.getElementById('cardExpiry').value.trim();
        const cvv = document.getElementById('cardCVV').value.trim();

        // Validate all fields are filled
        if (!cardNumber || !cardholder || !expiry || !cvv) {
            errorDiv.textContent = '❌ Please fill in all card details';
            errorDiv.classList.add('active');
            return;
        }

        // Validate cardholder name (not empty, at least 2 characters)
        if (cardholder.length < 2) {
            errorDiv.textContent = '❌ Cardholder name must be at least 2 characters';
            errorDiv.classList.add('active');
            return;
        }

        // Validate card number (16 digits)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
            errorDiv.textContent = '❌ Card number must be 16 digits';
            errorDiv.classList.add('active');
            return;
        }

        // Validate expiry date format (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            errorDiv.textContent = '❌ Expiry date must be in MM/YY format';
            errorDiv.classList.add('active');
            return;
        }

        // Validate expiry date is not in the past
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            errorDiv.textContent = '❌ Card has expired';
            errorDiv.classList.add('active');
            return;
        }

        // Validate CVV (3 or 4 digits)
        if (!/^\d{3,4}$/.test(cvv)) {
            errorDiv.textContent = '❌ CVV must be 3 or 4 digits';
            errorDiv.classList.add('active');
            return;
        }
    } else {
        // Mobile payment validation
        const name = document.getElementById('phoneName').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const provider = document.getElementById('mobileProvider').value;

        if (!name || !phone || !provider) {
            errorDiv.textContent = '❌ Please fill in all mobile money details';
            errorDiv.classList.add('active');
            return;
        }

        if (name.length < 2) {
            errorDiv.textContent = '❌ Name must be at least 2 characters';
            errorDiv.classList.add('active');
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            errorDiv.textContent = '❌ Please enter a valid phone number';
            errorDiv.classList.add('active');
            return;
        }
    }

    // Simulate payment processing
    showToast('Processing payment...', 'warning');
    setTimeout(() => {
        completeDownload(currentPaymentGameId, DataManager.getGameById(currentPaymentGameId).title);
        closeModal('paymentModal');
    }, 1500);
}

function completeDownload(gameId, gameTitle) {
    const currentUser = DataManager.getCurrentUser();
    
    if (currentUser) {
        DataManager.addDownloadToUser(currentUser.id, gameId);
        DataManager.increaseDownloadCount(gameId);
        
        // Track game access for subscription users
        if (currentUser.subscription) {
            DataManager.addGameAccess(currentUser.id);
        }
        
        // Update current user session
        const updatedUser = DataManager.getUserByEmail(currentUser.email);
        DataManager.setCurrentUser(updatedUser);
    } else {
        DataManager.increaseDownloadCount(gameId);
    }

    showToast(`✅ ${gameTitle} downloaded successfully!`, 'success');
    loadGamesGrid();
}

// ============ AUTHENTICATION ============

function signupUser() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const errorDiv = document.getElementById('signupError');

    errorDiv.classList.remove('active');

    if (!name || !email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.classList.add('active');
        return;
    }

    if (!email.includes('@')) {
        errorDiv.textContent = 'Please enter a valid email';
        errorDiv.classList.add('active');
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.classList.add('active');
        return;
    }

    const existingUser = DataManager.getUserByEmail(email);
    if (existingUser) {
        errorDiv.textContent = 'User with this email already exists';
        errorDiv.classList.add('active');
        return;
    }

    const newUser = DataManager.addUser({
        name: name,
        email: email,
        password: password
    });

    showToast(`✅ Welcome ${name}! Account created successfully!`, 'success');
    closeModal('signupModal');
    
    // Auto login
    DataManager.setCurrentUser(newUser);
    checkUserSession();
    
    // Reset form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');

    errorDiv.classList.remove('active');

    if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.classList.add('active');
        return;
    }

    const user = DataManager.getUserByEmail(email);
    if (!user || user.password !== password) {
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.classList.add('active');
        return;
    }

    DataManager.setCurrentUser(user);
    showToast(`✅ Welcome back, ${user.name}!`, 'success');
    closeModal('loginModal');
    checkUserSession();

    // Reset form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function logoutUser() {
    DataManager.setCurrentUser(null);
    showToast('👋 Logged out successfully', 'success');
    checkUserSession();
}

// ============ USER DASHBOARD ============

function openDashboard() {
    const currentUser = DataManager.getCurrentUser();
    if (!currentUser) {
        showToast('Please log in first', 'warning');
        return;
    }

    loadProfileInfo();
    loadDownloadsList();
    loadMyComments();
    openModal('dashboardModal');
}

function loadProfileInfo() {
    const currentUser = DataManager.getCurrentUser();
    const subscriptionMap = {
        'free': 'Free Trial',
        'premium': 'Premium ($6.9/month)',
        'pro': 'Pro Premium ($12.9/month)'
    };

    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userEmailDisplay').textContent = currentUser.email;
    
    // Handle both old format (string) and new format (object with tier property)
    const subscriptionTier = typeof currentUser.subscription === 'object' && currentUser.subscription.tier 
        ? currentUser.subscription.tier 
        : currentUser.subscription;
    
    document.getElementById('userSubscriptionDisplay').textContent = subscriptionMap[subscriptionTier] || 'No Subscription';
    document.getElementById('userDateDisplay').textContent = currentUser.createdAt;
}

function loadDownloadsList() {
    const currentUser = DataManager.getCurrentUser();
    const downloadsList = document.getElementById('downloadsList');
    const games = DataManager.getGames();
    
    const userDownloads = currentUser.downloads || [];
    
    if (userDownloads.length === 0) {
        downloadsList.innerHTML = '<p class="empty-message">No downloads yet. Start downloading games!</p>';
        return;
    }

    downloadsList.innerHTML = '';
    userDownloads.forEach(gameId => {
        const game = games.find(g => g.id === gameId);
        if (game) {
            const item = document.createElement('div');
            item.className = 'download-item';
            item.innerHTML = `
                <h4>${game.title}</h4>
                <p class="download-date">Category: ${capitalizeFirst(game.category)}</p>
            `;
            downloadsList.appendChild(item);
        }
    });
}

function loadMyComments() {
    const currentUser = DataManager.getCurrentUser();
    const myCommentsList = document.getElementById('myCommentsList');
    const games = DataManager.getGames();
    
    const userComments = DataManager.getUserComments(currentUser.id);
    
    if (userComments.length === 0) {
        myCommentsList.innerHTML = '<p class="empty-message">No comments yet. Leave a review on a game!</p>';
        return;
    }

    myCommentsList.innerHTML = '';
    userComments.forEach(comment => {
        const game = games.find(g => g.id === comment.gameId);
        const item = document.createElement('div');
        item.className = 'comment-item-dashboard';
        item.innerHTML = `
            <h4>${game ? game.title : 'Unknown Game'}</h4>
            <p>⭐ ${comment.rating}/5</p>
            <p>${comment.text}</p>
            <p class="download-date">${comment.createdAt}</p>
        `;
        myCommentsList.appendChild(item);
    });
}

function switchDashboardTab(tab) {
    document.querySelectorAll('.dashboard-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dashboard-tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

// ============ COMMENTS & RATINGS ============

function openCommentsModal(gameId, gameTitle) {
    document.getElementById('commentsGameTitle').textContent = `${gameTitle} - Reviews`;
    currentCommentsGameId = gameId;
    currentRating = 0;
    
    loadComments(gameId);
    
    // Reset comment form
    document.getElementById('commentText').value = '';
    document.querySelectorAll('#ratingInput .star').forEach(s => s.classList.remove('active'));
    document.getElementById('ratingValue').textContent = '0';
    document.getElementById('commentError').classList.remove('active');

    openModal('commentsModal');
}

function loadComments(gameId) {
    const comments = DataManager.getGameComments(gameId);
    const container = document.getElementById('commentsContainer');
    
    if (comments.length === 0) {
        container.innerHTML = '<p class="empty-message">No comments yet. Be the first to review!</p>';
        return;
    }

    container.innerHTML = '';
    comments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-date">${comment.createdAt}</span>
            </div>
            <div class="comment-rating">⭐ ${comment.rating}/5 Stars</div>
            <div class="comment-text">${comment.text}</div>
        `;
        container.appendChild(item);
    });
}

function setRating(rating) {
    currentRating = rating;
    document.getElementById('ratingValue').textContent = rating;
    
    document.querySelectorAll('#ratingInput .star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitComment() {
    const currentUser = DataManager.getCurrentUser();
    const commentText = document.getElementById('commentText').value.trim();
    const errorDiv = document.getElementById('commentError');

    errorDiv.classList.remove('active');

    if (!currentUser) {
        errorDiv.textContent = 'Please log in to leave a comment';
        errorDiv.classList.add('active');
        return;
    }

    if (!commentText) {
        errorDiv.textContent = 'Please write a comment';
        errorDiv.classList.add('active');
        return;
    }

    if (currentRating === 0) {
        errorDiv.textContent = 'Please select a rating';
        errorDiv.classList.add('active');
        return;
    }

    const comment = {
        gameId: currentCommentsGameId,
        userId: currentUser.id,
        userName: currentUser.name,
        rating: currentRating,
        text: commentText
    };

    DataManager.addComment(comment);
    showToast('✅ Comment posted successfully!', 'success');
    
    // Reload comments
    loadComments(currentCommentsGameId);
    
    // Reset form
    document.getElementById('commentText').value = '';
    setRating(0);
}

// ============ SUBSCRIPTION ============

function toggleSubscription() {
    const section = document.getElementById('subscriptionSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
    
    if (section.style.display === 'block') {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function selectSubscription(tier) {
    const currentUser = DataManager.getCurrentUser();
    
    if (!currentUser) {
        showToast('Please log in to select a subscription', 'warning');
        setTimeout(() => openModal('loginModal'), 500);
        return;
    }

    const tierNames = {
        'free': 'Free Trial',
        'premium': 'Premium',
        'pro': 'Pro Premium'
    };

    DataManager.updateUserSubscription(currentUser.id, tier);
    const updatedUser = DataManager.getUserByEmail(currentUser.email);
    DataManager.setCurrentUser(updatedUser);

    showToast(`✅ Upgraded to ${tierNames[tier]} subscription!`, 'success');
    toggleSubscription();
}

// ============ PROFESSIONAL ENHANCEMENTS ============

// Professional Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Professional Smooth Scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navigation Dropdown Functionality
    initializeNavigation();
    
    // Initialize enhanced features
    initializeEnhancedFeatures();
    
    // Add scroll animations
    initializeScrollAnimations();
    
    // Initialize professional loading
    initializeProfessionalLoading();
});

function initializeNavigation() {
    // Handle navigation dropdowns
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');
        const content = dropdown.querySelector('.nav-dropdown-content');
        
        if (btn && content) {
            // Mouse events
            dropdown.addEventListener('mouseenter', () => {
                content.style.display = 'block';
                setTimeout(() => {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 10);
            });
            
            dropdown.addEventListener('mouseleave', () => {
                content.style.opacity = '0';
                content.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    content.style.display = 'none';
                }, 300);
            });
            
            // Touch events for mobile
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isVisible = content.style.display === 'block';
                if (isVisible) {
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        content.style.display = 'none';
                    }, 300);
                } else {
                    content.style.display = 'block';
                    setTimeout(() => {
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }, 10);
                }
            });
        }
    });
    
    // Handle category dropdown items
    const categoryItems = document.querySelectorAll('.nav-dropdown-item[data-category]');
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            if (typeof filterGamesByCategory === 'function') {
                filterGamesByCategory(category);
            }
            
            // Add visual feedback
            this.style.background = 'rgba(255, 107, 53, 0.3)';
            setTimeout(() => {
                this.style.background = '';
            }, 200);
        });
    });
}

function initializeScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe all cards
    document.querySelectorAll('.card, .game-card, .popular-game-card, .recently-added-card').forEach(card => {
        observer.observe(card);
    });
}

function initializeProfessionalLoading() {
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="btn-spinner"></span> Loading...';
                this.disabled = true;
                
                // Simulate loading (remove this in production)
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });
}

// Professional Button Loading Spinner
const style = document.createElement('style');
style.textContent = `
    .btn.loading {
        position: relative;
        color: transparent !important;
    }
    
    .btn-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Navigation Dropdown Functionality
function initializeEnhancedFeatures() {
    // Handle navigation dropdowns
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');
        const content = dropdown.querySelector('.nav-dropdown-content');
        
        if (btn && content) {
            // Mouse events
            dropdown.addEventListener('mouseenter', () => {
                content.style.display = 'block';
            });
            
            dropdown.addEventListener('mouseleave', () => {
                content.style.display = 'none';
            });
            
            // Touch events for mobile
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        }
    });
    
    // Handle category dropdown items
    const categoryItems = document.querySelectorAll('.nav-dropdown-item[data-category]');
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            if (typeof filterGamesByCategory === 'function') {
                filterGamesByCategory(category);
            }
        });
    });
    
    // Initialize enhanced features
    initializeEnhancedFeatures();
});

function initializeEnhancedFeatures() {
    // Initialize filter tags
    initializeFilterTags();
    
    // Initialize recently added games
    loadRecentlyAddedGames();
    
    // Initialize popular games
    loadPopularGames();
    
    // Initialize request system
    initializeRequestSystem();
    
    // Initialize download statistics
    initializeDownloadStats();
}

// Filter Tags Functionality
function initializeFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            console.log('Filter selected:', filter);
            
            // Apply filter to games
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    const games = document.querySelectorAll('.game-card');
    games.forEach(game => {
        if (filter === 'all') {
            game.style.display = 'block';
        } else {
            // Check if game has the filter attribute
            const gameFilters = game.dataset.filters || '';
            if (gameFilters.includes(filter)) {
                game.style.display = 'block';
            } else {
                game.style.display = 'none';
            }
        }
    });
}

// Recently Added Games
function loadRecentlyAddedGames() {
    const recentGrid = document.getElementById('recentlyAddedGrid');
    if (!recentGrid) return;
    
    const recentGames = [
        {
            title: "Merchant of the Six Kingdoms",
            version: "v6.3",
            category: "Strategy",
            date: "March 24, 2026",
            size: "2.5 GB",
            multiplayer: false
        },
        {
            title: "DEATH STRANDING 2: ON THE BEACH",
            version: "v1.0.48.0",
            dlc: "ALL DLCs",
            category: "Action • Adventure",
            date: "March 23, 2026",
            size: "75 GB",
            multiplayer: true
        },
        {
            title: "Black Myth: Wukong",
            version: "v1.0.21.23831",
            dlc: "4 DLCs",
            category: "RPG • Action",
            date: "March 22, 2026",
            size: "85 GB",
            multiplayer: false
        },
        {
            title: "Hi-Fi RUSH",
            dlc: "Incl. ALL DLCs",
            category: "Action • Rhythm",
            date: "March 21, 2026",
            size: "12 GB",
            multiplayer: false
        },
        {
            title: "Minecraft: Bedrock Edition",
            version: "v1.21.130",
            category: "Simulation • Multiplayer",
            date: "March 20, 2026",
            size: "1.2 GB",
            multiplayer: true
        },
        {
            title: "Slay the Spire 2",
            version: "v0.99.1",
            category: "Strategy • Card Game",
            date: "March 19, 2026",
            size: "1.8 GB",
            multiplayer: false
        }
    ];
    
    recentGrid.innerHTML = recentGames.map(game => `
        <div class="recently-added-card" onclick="selectGame('${game.title}')">
            <div class="game-date">${game.date}</div>
            <div class="game-title">
                ${game.title}
                ${game.version ? `<span class="version-tag">${game.version}</span>` : ''}
                ${game.dlc ? `<span class="dlc-tag">${game.dlc}</span>` : ''}
            </div>
            <div class="game-info">${game.category} • ${game.multiplayer ? 'Multiplayer' : 'Single Player'} • ${game.size}</div>
            ${game.multiplayer ? '<div class="multiplayer-badge">Multiplayer</div>' : ''}
        </div>
    `).join('');
}

// Popular Games
function loadPopularGames() {
    const popularGrid = document.getElementById('popularGamesGrid');
    if (!popularGrid) return;
    
    const popularGames = [
        { title: "Elden Ring Deluxe Edition", category: "RPG • Open World", multiplayer: true },
        { title: "Hollow Knight: Silksong", category: "Action • Platformer", multiplayer: false },
        { title: "The Sims 4", category: "Simulation • Life Sim", multiplayer: true },
        { title: "Forza Horizon 5 Premium", category: "Racing • Open World", multiplayer: true },
        { title: "Cyberpunk 2077", category: "RPG • Sci-Fi", multiplayer: false },
        { title: "Dying Light 2", category: "Horror • Survival", multiplayer: true },
        { title: "Palworld", category: "Survival • Crafting", multiplayer: true },
        { title: "Baldur's Gate 3", category: "RPG • Turn-Based", multiplayer: true }
    ];
    
    popularGrid.innerHTML = popularGames.map(game => `
        <div class="popular-game-card" onclick="selectGame('${game.title}')">
            <div class="game-title">${game.title}</div>
            <div class="game-info">${game.category}</div>
            ${game.multiplayer ? '<div class="multiplayer-badge">Multiplayer</div>' : ''}
        </div>
    `).join('');
}

// Request System
function initializeRequestSystem() {
    const requestForm = document.getElementById('requestForm');
    if (!requestForm) return;
    
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const gameName = document.getElementById('requestGameName').value;
        const platform = document.getElementById('requestPlatform').value;
        const email = document.getElementById('requestEmail').value;
        const details = document.getElementById('requestDetails').value;
        
        // Validate required fields
        if (!gameName.trim()) {
            showRequestStatus('Please enter a game name', 'error');
            return;
        }
        
        // Simulate request submission
        showRequestStatus('Submitting request...', 'info');
        
        setTimeout(() => {
            // Store request (in real app, this would send to server)
            const request = {
                gameName,
                platform,
                email,
                details,
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            console.log('Game request submitted:', request);
            
            showRequestStatus('✅ Game request submitted successfully! We\'ll notify you when it\'s available.', 'success');
            requestForm.reset();
        }, 1500);
    });
}

function showRequestStatus(message, type) {
    const statusDiv = document.getElementById('requestStatus');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `request-status ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'request-status';
        }, 5000);
    }
}

// Download Statistics
function initializeDownloadStats() {
    // Simulate real-time statistics updates
    setInterval(() => {
        updateDownloadStats();
    }, 5000);
}

function updateDownloadStats() {
    const downloadsToday = document.getElementById('downloadsToday');
    const activeUsers = document.getElementById('activeUsers');
    const newThisWeek = document.getElementById('newThisWeek');
    
    if (downloadsToday) {
        const current = parseFloat(downloadsToday.textContent.replace('K', '')) * 1000;
        const increment = Math.floor(Math.random() * 10) + 1;
        const newTotal = current + increment;
        downloadsToday.textContent = (newTotal / 1000).toFixed(1) + 'K';
    }
    
    if (activeUsers) {
        const current = parseInt(activeUsers.textContent);
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newTotal = Math.max(850, current + change);
        activeUsers.textContent = newTotal;
    }
    
    if (newThisWeek) {
        const current = parseInt(newThisWeek.textContent);
        const increment = Math.random() > 0.7 ? 1 : 0; // 30% chance to increase
        const newTotal = current + increment;
        newThisWeek.textContent = newTotal;
    }
}

// Load More Games
function loadMoreRecentGames() {
    console.log('Loading more recent games...');
    // In a real app, this would load more games from the server
    showToast('Loading more games...', 'info');
    
    setTimeout(() => {
        showToast('All games loaded!', 'success');
    }, 1000);
}

// Game Selection
function selectGame(gameTitle) {
    console.log('Game selected:', gameTitle);
    // Open game details modal or navigate to game page
    if (typeof openGameDetails === 'function') {
        // Find the game and open details
        const games = DataManager.getGames();
        const game = games.find(g => g.title === gameTitle);
        if (game) {
            openGameDetails(game.id);
        }
    } else {
        showToast(`Selected: ${gameTitle}`, 'info');
    }
}

// ============ ADMIN ACCESS ============

function verifyAdminPassword() {
    const password = document.getElementById('adminPassword').value.trim();
    const errorDiv = document.getElementById('adminError');

    errorDiv.textContent = '';

    if (!password) {
        errorDiv.textContent = 'Please enter a admin password';
        return;
    }

    if (password === 'Ciontatenx83') {
        showToast('✅ Admin access granted!', 'success');
        // Clear password field
        document.getElementById('adminPassword').value = '';
        // Redirect to admin panel
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 500);
    } else {
        errorDiv.textContent = 'Incorrect password. Access denied.';
        showToast('❌ Invalid admin password', 'error');
        // Clear password field on error
        document.getElementById('adminPassword').value = '';
    }
}

// ============ GAME DETAILS & WISHLIST ============

let currentGameDetailsId = null;

function openGameDetails(gameId) {
    const game = DataManager.getGameById(gameId);
    if (!game) return;
    
    currentGameDetailsId = gameId;
    
    // Populate modal
    document.getElementById('gameDetailsTitle').textContent = game.title;
    document.getElementById('gameDetailsImage').src = game.imageUrl;
    document.getElementById('gameDetailsCategory').textContent = capitalizeFirst(game.category);
    document.getElementById('gameDetailsRating').textContent = `⭐ ${game.rating}/5`;
    document.getElementById('gameDetailsPrice').textContent = game.price === 0 ? 'FREE' : `$${game.price.toFixed(2)}`;
    document.getElementById('gameDetailsDownloads').textContent = `${game.downloads.toLocaleString()} downloads`;
    document.getElementById('gameDetailsDescription').textContent = game.description;
    
    // Update wishlist indicator
    const currentUser = DataManager.getCurrentUser();
    const wishlistIndicator = document.getElementById('wishlistIndicator');
    if (currentUser) {
        const isInWishlist = DataManager.isGameInWishlist(currentUser.id, gameId);
        wishlistIndicator.classList.toggle('active', isInWishlist);
        wishlistIndicator.innerHTML = isInWishlist ? '❤️ Added to Wishlist' : '';
    } else {
        wishlistIndicator.classList.remove('active');
        wishlistIndicator.innerHTML = '';
    }
    
    document.getElementById('gameDetailsDownloadBtn').textContent = `⬇️ Download`;
    
    openModal('gameDetailsModal');
}

function toggleWishlist() {
    const currentUser = DataManager.getCurrentUser();
    
    if (!currentUser) {
        showToast('Please log in to use wishlist', 'warning');
        setTimeout(() => openModal('loginModal'), 500);
        return;
    }
    
    if (!currentGameDetailsId) return;
    
    const game = DataManager.getGameById(currentGameDetailsId);
    const isInWishlist = DataManager.isGameInWishlist(currentUser.id, currentGameDetailsId);
    
    if (isInWishlist) {
        DataManager.removeFromWishlist(currentUser.id, currentGameDetailsId);
        showToast(`❌ Removed "${game.title}" from wishlist`, 'info');
    } else {
        DataManager.addToWishlist(currentUser.id, currentGameDetailsId);
        showToast(`❤️ Added "${game.title}" to wishlist`, 'success');
    }
    
    // Update indicator
    const wishlistIndicator = document.getElementById('wishlistIndicator');
    const newIsInWishlist = DataManager.isGameInWishlist(currentUser.id, currentGameDetailsId);
    wishlistIndicator.classList.toggle('active', newIsInWishlist);
    wishlistIndicator.innerHTML = newIsInWishlist ? '❤️ Added to Wishlist' : '';
}

// ============ MODALS ============

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Clear admin password field when closing admin modal
        if (modalId === 'adminModal') {
            const passwordField = document.getElementById('adminPassword');
            const errorDiv = document.getElementById('adminError');
            if (passwordField) passwordField.value = '';
            if (errorDiv) errorDiv.textContent = '';
        }
    }
}

// ============ UTILITY FUNCTIONS ============

function scrollToCategories() {
    document.querySelector('.categories-section').scrollIntoView({ behavior: 'smooth' });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    // Optional: Update button text or styling
    const button = input.closest('.password-input-wrapper')?.querySelector('.password-toggle');
    if (button) {
        button.textContent = isPassword ? '🙈' : '👁️';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element with id "toast" not found');
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
