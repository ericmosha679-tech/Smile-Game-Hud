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
        
    } catch (error) {
        showToast('❌ Error loading application. Please refresh the page.', 'error');
    }
});

// ============ PROFESSIONAL FEATURES ============

function initializeProfessionalFeatures() {
    try {
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
        
    } catch (error) {
        // Silent error handling for production
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
        showToast('❌ An unexpected error occurred. Please try again.', 'error');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        showToast('❌ A network error occurred. Please check your connection.', 'error');
    });
}

function initializePerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            
            // Performance tracking without console logs
            if (loadTime > 3000) {
                // Handle slow load silently in production
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
        
        // Track user interactions (in real implementation, send to analytics service)
        if (interactionCount % 10 === 0) {
            // Analytics tracking without console logs
        }
    });
}

// ============ REAL-TIME FIREBASE LISTENER ============

function setupRealtimeGameListener() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        showToast('⚠️ Firebase not available - using local cache only', 'warning');
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
        if (!data) {
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

        // Optional local cache sync
        if (gamesArray.length > 0) {
            try {
                localStorage.setItem('gamesData', JSON.stringify(gamesArray));
            } catch (error) {
                // Silent cache error handling
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
        
    } catch (error) {
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
        return;
    }

    // Get the current background index (default to 0)
    const currentBgIndex = 0;
    const bgUrl = backgroundImages[currentBgIndex];

    if (!bgUrl) {
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
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) {
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
                // Silent error handling for individual game cards
            }
        });
        
        // Update category counts
        updateCategoryCounts(games);
        
    } catch (error) {
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
    const container = document.getElementById('featuredGamesContainer');
    
    if (!container) {
        return;
    }
    
    container.innerHTML = '';

    sortedGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'featured-game-card';
        card.innerHTML = `
            <img src="${game.imageUrl || `https://picsum.photos/seed/game${game.id}/400/200.jpg`}" alt="${game.title}" class="featured-game-poster">
            <div class="featured-game-info">
                <h3 class="featured-game-title">${game.title}</h3>
                <div class="featured-game-rating">
                    <div class="star-rating">
                        ${generateStarRating(game.rating)}
                    </div>
                    <span class="rating-number">${game.rating}</span>
                </div>
                <button class="featured-game-action" onclick="initiateDownload(${game.id}, '${game.title}')">
                    ${game.price === 0 ? 'Download Now' : '$' + game.price.toFixed(2)}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">⭐</span>';
    }
    if (hasHalfStar) {
        stars += '<span class="star">⭐</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">☆</span>';
    }
    return stars;
}

function clearAllFilters() {
    try {
        // Reset category filter
        currentCategory = 'all';
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === 'all') {
                btn.classList.add('active');
            }
        });

        // Reset search
        currentSearchQuery = '';
        const searchInput = document.getElementById('gameSearch');
        if (searchInput) {
            searchInput.value = '';
        }

        // Reset sort
        currentSortOption = 'default';
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.value = 'default';
        }

        // Reload games
        loadGamesGrid();
        
        showToast('Filters cleared', 'info');
    } catch (error) {
        showToast('Error clearing filters', 'error');
    }
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

    } catch (error) {
        // Silent category count update error
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
        
    } catch (error) {
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

// ============ PREMIUM ENHANCEMENTS ============

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

// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navRightContainer = document.querySelector('.nav-right-container');
    
    if (hamburgerMenu && navRightContainer) {
        hamburgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            navRightContainer.classList.toggle('mobile-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburgerMenu.contains(e.target) && !navRightContainer.contains(e.target)) {
                hamburgerMenu.classList.remove('active');
                navRightContainer.classList.remove('mobile-open');
            }
        });
    }
});

// Enhanced Admin CRUD Operations
class AdminGameManager {
    constructor() {
        this.games = [];
        this.init();
    }
    
    init() {
        this.loadGames();
        this.setupEventListeners();
    }
    
    loadGames() {
        // Load games from localStorage or API
        const savedGames = localStorage.getItem('adminGames');
        if (savedGames) {
            this.games = JSON.parse(savedGames);
        } else {
            // Initialize with sample games
            this.games = [
                {
                    id: 1,
                    title: "Cyberpunk Adventures",
                    category: "action",
                    rating: 4.8,
                    poster: "https://picsum.photos/seed/game1/400/200.jpg",
                    downloads: 15234,
                    description: "A thrilling cyberpunk adventure in a dystopian future."
                },
                {
                    id: 2,
                    title: "Racing Champions",
                    category: "racing",
                    rating: 4.5,
                    poster: "https://picsum.photos/seed/game2/400/200.jpg",
                    downloads: 12456,
                    description: "High-speed racing with realistic physics."
                },
                {
                    id: 3,
                    title: "Fantasy Quest",
                    category: "rpg",
                    rating: 4.9,
                    poster: "https://picsum.photos/seed/game3/400/200.jpg",
                    downloads: 18923,
                    description: "Epic fantasy RPG with deep character customization."
                },
                {
                    id: 4,
                    title: "Battle Arena",
                    category: "action",
                    rating: 4.3,
                    poster: "https://picsum.photos/seed/game4/400/200.jpg",
                    downloads: 9876,
                    description: "Intense multiplayer battle arena combat."
                },
                {
                    id: 5,
                    title: "Puzzle Master",
                    category: "puzzle",
                    rating: 4.6,
                    poster: "https://picsum.photos/seed/game5/400/200.jpg",
                    downloads: 11234,
                    description: "Challenging puzzles with beautiful graphics."
                }
            ];
            this.saveGames();
        }
    }
    
    saveGames() {
        localStorage.setItem('adminGames', JSON.stringify(this.games));
        this.updateUI();
    }
    
    setupEventListeners() {
        // Add event listeners for admin CRUD operations
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAdminPanel();
        });
    }
    
    setupAdminPanel() {
        // Check if admin is logged in
        if (window.location.pathname.includes('admin.html')) {
            this.renderGamesTable();
            this.setupAddGameForm();
        }
    }
    
    addGame(gameData) {
        const newGame = {
            id: Date.now(),
            ...gameData,
            downloads: 0,
            rating: parseFloat(gameData.rating) || 0
        };
        
        this.games.push(newGame);
        this.saveGames();
        this.showToast('✅ Game added successfully!', 'success');
        return newGame;
    }
    
    updateGame(id, gameData) {
        const index = this.games.findIndex(game => game.id === id);
        if (index !== -1) {
            this.games[index] = { ...this.games[index], ...gameData };
            this.saveGames();
            this.showToast('✅ Game updated successfully!', 'success');
            return this.games[index];
        }
        return null;
    }
    
    deleteGame(id) {
        const index = this.games.findIndex(game => game.id === id);
        if (index !== -1) {
            const deletedGame = this.games.splice(index, 1)[0];
            this.saveGames();
            this.showToast('🗑️ Game deleted successfully!', 'info');
            return deletedGame;
        }
        return null;
    }
    
    getGame(id) {
        return this.games.find(game => game.id === id);
    }
    
    getAllGames() {
        return this.games;
    }
    
    updateUI() {
        // Update featured games section
        this.updateFeaturedGames();
        // Update statistics
        this.updateStatistics();
    }
    
    updateFeaturedGames() {
        const featuredContainer = document.getElementById('featuredGamesContainer');
        if (!featuredContainer) return;
        
        const featuredGames = this.games.slice(0, 5);
        featuredContainer.innerHTML = featuredGames.map(game => `
            <div class="featured-game-card">
                <img src="${game.poster}" alt="${game.title}" class="featured-game-poster">
                <div class="featured-game-info">
                    <h3 class="featured-game-title">${game.title}</h3>
                    <div class="featured-game-rating">
                        <div class="star-rating">
                            ${this.generateStars(game.rating)}
                        </div>
                        <span class="rating-number">${game.rating}</span>
                    </div>
                    <button class="featured-game-action" onclick="downloadGame(${game.id})">Download Now</button>
                </div>
            </div>
        `).join('');
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star">⭐</span>';
        }
        
        if (hasHalfStar && fullStars < 5) {
            stars += '<span class="star">⭐</span>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star empty">⭐</span>';
        }
        
        return stars;
    }
    
    updateStatistics() {
        const statsElements = {
            totalGames: document.querySelector('.stat-number'),
            downloadsToday: document.querySelectorAll('.stat-number')[1],
            activeUsers: document.querySelectorAll('.stat-number')[2],
            newThisWeek: document.querySelectorAll('.stat-number')[3]
        };
        
        if (statsElements.totalGames) {
            statsElements.totalGames.textContent = `${this.games.length}+`;
        }
        
        if (statsElements.downloadsToday) {
            const totalDownloads = this.games.reduce((sum, game) => sum + game.downloads, 0);
            statsElements.downloadsToday.textContent = this.formatNumber(totalDownloads);
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    renderGamesTable() {
        const tableBody = document.querySelector('.admin-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.games.map(game => `
            <tr>
                <td>${game.title}</td>
                <td>${game.category}</td>
                <td>${game.rating}</td>
                <td>${game.downloads}</td>
                <td>
                    <button onclick="adminGameManager.editGame(${game.id})" class="btn btn-secondary">Edit</button>
                    <button onclick="adminGameManager.deleteGame(${game.id})" class="btn btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    }
    
    setupAddGameForm() {
        const addForm = document.getElementById('addGameForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(addForm);
                const gameData = {
                    title: formData.get('title'),
                    category: formData.get('category'),
                    rating: formData.get('rating'),
                    poster: formData.get('poster') || `https://picsum.photos/seed/game${Date.now()}/400/200.jpg`,
                    description: formData.get('description')
                };
                
                this.addGame(gameData);
                addForm.reset();
                this.renderGamesTable();
            });
        }
    }
    
    editGame(id) {
        const game = this.getGame(id);
        if (!game) return;
        
        // Populate edit form
        const editForm = document.getElementById('editGameForm');
        if (editForm) {
            editForm.title.value = game.title;
            editForm.category.value = game.category;
            editForm.rating.value = game.rating;
            editForm.poster.value = game.poster;
            editForm.description.value = game.description;
            
            // Set up update handler
            editForm.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(editForm);
                const gameData = {
                    title: formData.get('title'),
                    category: formData.get('category'),
                    rating: formData.get('rating'),
                    poster: formData.get('poster'),
                    description: formData.get('description')
                };
                
                this.updateGame(id, gameData);
                this.renderGamesTable();
                editForm.reset();
            };
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Pagination and Load More Functionality
class GamePagination {
    constructor() {
        this.currentPage = 1;
        this.gamesPerPage = 6;
        this.totalGames = 0;
        this.filteredGames = [];
    }
    
    updatePagination(totalGames, filteredGames = []) {
        this.totalGames = filteredGames.length > 0 ? filteredGames.length : totalGames;
        this.filteredGames = filteredGames.length > 0 ? filteredGames : [];
        this.currentPage = 1;
        
        this.updateUI();
    }
    
    loadMore() {
        if (this.currentPage * this.gamesPerPage >= this.totalGames) {
            return; // All games are already loaded
        }
        
        this.currentPage++;
        this.updateUI();
        this.renderNextBatch();
    }
    
    updateUI() {
        const countElement = document.getElementById('recentGamesCount');
        const loadMoreBtn = document.getElementById('loadMoreRecentBtn');
        
        if (countElement) {
            const shown = Math.min(this.currentPage * this.gamesPerPage, this.totalGames);
            countElement.textContent = `Showing ${shown} of ${this.totalGames} games`;
        }
        
        if (loadMoreBtn) {
            const allLoaded = this.currentPage * this.gamesPerPage >= this.totalGames;
            loadMoreBtn.disabled = allLoaded;
            loadMoreBtn.textContent = allLoaded ? 'All Games Loaded' : 'Load More';
        }
    }
    
    renderNextBatch() {
        // This will be implemented by the specific game loading function
        if (typeof loadMoreRecentGames === 'function') {
            loadMoreRecentGames();
        }
    }
    
    reset() {
        this.currentPage = 1;
        this.totalGames = 0;
        this.filteredGames = [];
    }
}

// Initialize pagination
const gamePagination = new GamePagination();

// Enhanced load more function
function loadMoreRecentGames() {
    gamePagination.loadMore();
}

// Filter games functionality
function filterGames(filter) {
    // Update active filter tag
    document.querySelectorAll('.filter-tag-enhanced').forEach(tag => {
        tag.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Filter and update pagination
    const allGames = adminGameManager.getAllGames();
    let filteredGames = allGames;
    
    if (filter !== 'all') {
        filteredGames = allGames.filter(game => {
            if (filter === 'free') return game.price === 0 || game.price === '0.00';
            if (filter === 'premium') return game.price > 0;
            if (filter === 'multiplayer') return game.category === 'multiplayer';
            if (filter === 'co-op') return game.category === 'co-op';
            if (filter === 'vr') return game.category === 'vr';
            if (filter === 'latest') return game.isNew;
            return true;
        });
    }
    
    gamePagination.updatePagination(allGames.length, filteredGames);
    
    // Re-render games with filter
    renderFilteredGames(filteredGames);
}

function renderFilteredGames(games) {
    const grid = document.getElementById('recentlyAddedGrid');
    if (!grid) return;
    
    const startIndex = (gamePagination.currentPage - 1) * gamePagination.gamesPerPage;
    const endIndex = startIndex + gamePagination.gamesPerPage;
    const gamesToShow = games.slice(startIndex, endIndex);
    
    grid.innerHTML = gamesToShow.map(game => `
        <div class="game-card">
            <img src="${game.poster}" alt="${game.title}" class="game-image">
            <div class="game-content">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <span class="game-category">${game.category}</span>
                    <span class="game-rating">⭐ ${game.rating}</span>
                </div>
                <button class="game-action-btn" onclick="downloadGame(${game.id})">Download</button>
            </div>
        </div>
    `).join('');
    
    // Add "New" badge for recent games (within 7 days)
    gamesToShow.forEach((game, index) => {
        const gameCard = grid.children[index];
        if (gameCard) {
            const isNewGame = (new Date() - new Date(game.addedDate || Date.now())) <= 7 * 24 * 60 * 60 * 1000;
            if (isNewGame) {
                const newBadge = document.createElement('span');
                newBadge.className = 'new-badge';
                newBadge.textContent = 'NEW';
                gameCard.appendChild(newBadge);
            }
        }
    });
}

// Payment Order Summary Functions
function updateOrderSummary(planType) {
    const planDetails = {
        free: {
            name: 'Free Trial',
            price: '$0.00',
            period: '/month',
            details: '1 month free trial with basic access',
            benefits: [
                '✓ Access to 3 games',
                '✓ 1 month free trial',
                '✓ Basic support',
                '✓ Standard downloads'
            ]
        },
        premium: {
            name: 'Premium',
            price: '$6.99',
            period: '/month',
            details: 'Monthly subscription with enhanced features',
            benefits: [
                '✓ Access to 6 free games',
                '✓ Fast downloads',
                '✓ Priority support',
                '✓ Exclusive deals',
                '✓ Ad-free experience'
            ]
        },
        pro: {
            name: 'Pro Premium',
            price: '$12.99',
            period: '/month',
            details: 'Monthly subscription with all features',
            benefits: [
                '✓ Access to 10 free games',
                '✓ Ultra-fast downloads',
                '✓ VIP support (24/7)',
                '✓ Early access to new games',
                '✓ Premium content'
            ]
        }
    };
    
    const plan = planDetails[planType] || planDetails.premium;
    
    // Update order summary elements
    document.getElementById('orderPlanName').textContent = plan.name;
    document.getElementById('orderPlanDetails').textContent = plan.details;
    document.getElementById('orderPlanPrice').textContent = plan.price;
    document.getElementById('orderBillingPeriod').textContent = plan.period;
    
    // Update benefits list
    const benefitsList = document.getElementById('orderBenefits');
    benefitsList.innerHTML = plan.benefits.map(benefit => `<li>${benefit}</li>`).join('');
    
    // Update totals
    const price = parseFloat(plan.price.replace('$', ''));
    const tax = price * 0.08; // 8% tax rate
    const total = price + tax;
    
    document.getElementById('orderSubtotal').textContent = `$${price.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

// Enhanced Payment Validation
function validatePaymentForm() {
    const paymentMethod = document.getElementById('paymentMethodSelect').value;
    let isValid = true;
    let errorMessage = '';
    
    if (paymentMethod === 'card') {
        const cardholderName = document.getElementById('cardholderName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardholderName) {
            errorMessage = 'Cardholder name is required';
            isValid = false;
        } else if (cardNumber.length < 13 || cardNumber.length > 19) {
            errorMessage = 'Invalid card number';
            isValid = false;
        } else if (!expiryDate) {
            errorMessage = 'Expiry date is required';
            isValid = false;
        } else if (!cvv || cvv.length !== 3) {
            errorMessage = 'CVV must be 3 digits';
            isValid = false;
        }
    } else if (paymentMethod === 'mobile') {
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const provider = document.getElementById('mobileProvider').value;
        
        if (!phoneNumber) {
            errorMessage = 'Phone number is required';
            isValid = false;
        } else if (!provider) {
            errorMessage = 'Please select a mobile money provider';
            isValid = false;
        }
    }
    
    // Show/hide error message
    const errorElement = document.getElementById('paymentError');
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = errorMessage ? 'block' : 'none';
    }
    
    return isValid;
}

// Format currency function
function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

// Initialize sample games data if not exists
function initializeSampleGames() {
    const existingGames = adminGameManager.getAllGames();
    if (existingGames.length === 0) {
        const sampleGames = [
            {
                id: 1,
                title: "Cyberpunk Adventures",
                poster: "https://picsum.photos/seed/game1/400/200.jpg",
                category: "action",
                price: 6.99,
                rating: 4.8,
                downloads: 15420,
                addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: true
            },
            {
                id: 2,
                title: "Racing Champions",
                poster: "https://picsum.photos/seed/game2/400/200.jpg",
                category: "racing",
                price: 0.00,
                rating: 4.5,
                downloads: 12350,
                addedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 3,
                title: "Fantasy Quest",
                poster: "https://picsum.photos/seed/game3/400/200.jpg",
                category: "rpg",
                price: 12.99,
                rating: 4.9,
                downloads: 18930,
                addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: true
            },
            {
                id: 4,
                title: "Battle Arena",
                poster: "https://picsum.photos/seed/game4/400/200.jpg",
                category: "multiplayer",
                price: 6.99,
                rating: 4.3,
                downloads: 8760,
                addedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 5,
                title: "Puzzle Master",
                poster: "https://picsum.photos/seed/game5/400/200.jpg",
                category: "puzzle",
                price: 0.00,
                rating: 4.6,
                downloads: 9870,
                addedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 6,
                title: "Strategy Empire",
                poster: "https://picsum.photos/seed/game6/400/200.jpg",
                category: "strategy",
                price: 12.99,
                rating: 4.7,
                downloads: 11200,
                addedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 7,
                title: "Sports Legends",
                poster: "https://picsum.photos/seed/game7/400/200.jpg",
                category: "sports",
                price: 6.99,
                rating: 4.4,
                downloads: 14560,
                addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: true
            },
            {
                id: 8,
                title: "Horror Nights",
                poster: "https://picsum.photos/seed/game8/400/200.jpg",
                category: "horror",
                price: 0.00,
                rating: 4.2,
                downloads: 6780,
                addedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 9,
                title: "Simulation City",
                poster: "https://picsum.photos/seed/game9/400/200.jpg",
                category: "simulation",
                price: 12.99,
                rating: 4.6,
                downloads: 13200,
                addedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 10,
                title: "Casual Fun",
                poster: "https://picsum.photos/seed/game10/400/200.jpg",
                category: "casual",
                price: 0.00,
                rating: 4.1,
                downloads: 9450,
                addedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            },
            {
                id: 11,
                title: "Adventure Quest 2",
                poster: "https://picsum.photos/seed/game11/400/200.jpg",
                category: "adventure",
                price: 6.99,
                rating: 4.8,
                downloads: 16780,
                addedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: true
            },
            {
                id: 12,
                title: "Indie Dreams",
                poster: "https://picsum.photos/seed/game12/400/200.jpg",
                category: "indie",
                price: 0.00,
                rating: 4.3,
                downloads: 7890,
                addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                isNew: false
            }
        ];
        
        sampleGames.forEach(game => adminGameManager.addGame(game));
    }
}

// Log duplicate image URLs for review
function logDuplicateImages() {
    const allGames = adminGameManager.getAllGames();
    const imageMap = {};
    const duplicates = [];
    
    allGames.forEach(game => {
        if (imageMap[game.poster]) {
            duplicates.push({
                imageUrl: game.poster,
                gameIds: [imageMap[game.poster], game.id]
            });
        } else {
            imageMap[game.poster] = game.id;
        }
    });
    
    if (duplicates.length > 0) {
        // Handle duplicate images silently in production
    }
}

// Standardize date formatting
function formatDate(dateString, format = 'human') {
    const date = new Date(dateString);
    
    if (format === 'iso') {
        return date.toISOString();
    } else if (format === 'human') {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    return dateString;
}

// Handle game request submission
function submitGameRequest(event) {
    event.preventDefault();
    
    const gameName = document.getElementById('requestGameName').value.trim();
    const platform = document.getElementById('requestPlatform').value;
    const email = document.getElementById('requestEmail').value.trim();
    const category = document.getElementById('requestCategory').value;
    const details = document.getElementById('requestDetails').value.trim();
    
    // Validation
    if (!gameName || !platform || !category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Store request (in real app, this would go to backend)
    const request = {
        gameName,
        platform,
        email,
        category,
        details,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save to localStorage for demo purposes
    const requests = JSON.parse(localStorage.getItem('gameRequests') || '[]');
    requests.push(request);
    localStorage.setItem('gameRequests', JSON.stringify(requests));
    
    // Show success message
    const statusElement = document.getElementById('requestStatus');
    statusElement.innerHTML = `
        <div class="status-message success">
            <h4>✅ Request Submitted Successfully!</h4>
            <p>Thank you for requesting "${gameName}". We'll review your request and notify you when it's available.</p>
            <p><strong>Request ID:</strong> #${requests.length}</p>
        </div>
    `;
    statusElement.style.display = 'block';
    
    // Reset form
    document.getElementById('requestForm').reset();
    
    showToast('Game request submitted successfully!', 'success');
    
    // Store request for admin review
}

// Initialize Admin Game Manager
const adminGameManager = new AdminGameManager();

// Header Component JavaScript
class HeaderComponent {
    constructor() {
        this.isMobileMenuOpen = false;
        this.isCategoryDropdownOpen = false;
        this.focusTrapElements = [];
        this.previousFocusElement = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupResponsiveBehavior();
        this.setupKeyboardNavigation();
    }
    
    setupEventListeners() {
        // Category dropdown functionality
        const categoryDropdownBtn = document.querySelector('.category-dropdown-btn');
        const categoryDropdownMenu = document.querySelector('.category-dropdown-menu');
        
        if (categoryDropdownBtn && categoryDropdownMenu) {
            categoryDropdownBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!categoryDropdownBtn.contains(e.target) && !categoryDropdownMenu.contains(e.target)) {
                    this.closeCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                }
            });
            
            // Keyboard navigation for dropdown
            categoryDropdownBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                } else if (e.key === 'Escape') {
                    this.closeCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                }
            });
            
            // Category item clicks
            const categoryItems = categoryDropdownMenu.querySelectorAll('.category-item');
            categoryItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleCategoryClick(item);
                    this.closeCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                });
                
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleCategoryClick(item);
                        this.closeCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                    }
                });
            });
        }
        
        // Mobile menu functionality
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        
        if (mobileMenuToggle && mobileMenuPanel) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Enhanced keyboard support for hamburger button
            mobileMenuToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMobileMenu();
                }
            });
        }
        
        if (mobileMenuClose && mobileMenuPanel) {
            mobileMenuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Mobile category toggle
        const mobileCategoryToggle = document.querySelector('.mobile-category-toggle');
        const mobileCategoryMenu = document.querySelector('.mobile-category-menu');
        
        if (mobileCategoryToggle && mobileCategoryMenu) {
            mobileCategoryToggle.addEventListener('click', () => {
                this.toggleMobileCategoryMenu(mobileCategoryToggle, mobileCategoryMenu);
            });
        }
        
        // Mobile menu item clicks
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
        
        // Mobile category item clicks
        const mobileCategoryItems = document.querySelectorAll('.mobile-category-item');
        mobileCategoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCategoryClick(item);
                this.closeMobileMenu();
            });
        });
        
        // Enhanced mobile utility buttons with modal integration
        const mobileUtilityButtons = document.querySelectorAll('.mobile-utility-btn');
        mobileUtilityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.handleMobileUtilityAction(action, btn);
            });
            
            // Keyboard support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const action = btn.getAttribute('data-action');
                    this.handleMobileUtilityAction(action, btn);
                }
            });
        });
        
        // Escape key to close menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
                if (this.isCategoryDropdownOpen) {
                    this.closeCategoryDropdown(categoryDropdownBtn, categoryDropdownMenu);
                }
            }
        });
        
        // Close mobile menu when clicking outside (only on small screens)
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && window.innerWidth <= 480) {
                if (!mobileMenuPanel.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
    }
    
    handleMobileUtilityAction(action, button) {
        // Store the button for potential focus restoration
        this.lastUtilityButton = button;
        
        switch (action) {
            case 'subscription':
                this.closeMobileMenu(() => {
                    // Open subscription modal or navigate to plans
                    this.openSubscriptionModal();
                });
                break;
                
            case 'login':
                this.closeMobileMenu(() => {
                    // Open login modal
                    this.openLoginModal();
                });
                break;
                
            case 'signup':
                this.closeMobileMenu(() => {
                    // Open signup modal
                    this.openSignupModal();
                });
                break;
                
            case 'admin':
                this.closeMobileMenu(() => {
                    // Open admin password modal
                    this.openAdminModal();
                });
                break;
                
            default:
                // Handle unknown actions silently
        }
    }
    
    openSubscriptionModal() {
        // Try to open subscription modal
        const subscriptionBtn = document.getElementById('subscriptionBtn');
        if (subscriptionBtn) {
            subscriptionBtn.click();
        } else {
            // Fallback: navigate to plans section
            window.location.hash = 'pricing';
        }
    }
    
    openLoginModal() {
        // Try to open login modal
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.click();
        } else {
            // Fallback: navigate to login section
            window.location.hash = 'login';
        }
    }
    
    openSignupModal() {
        // Try to open signup modal
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.click();
        } else {
            // Fallback: navigate to signup section
            window.location.hash = 'signup';
        }
    }
    
    openAdminModal() {
        // Try to open admin password modal
        const adminBtn = document.getElementById('adminAccessBtn');
        if (adminBtn) {
            adminBtn.click();
        } else {
            // Fallback: navigate to admin section
            window.location.hash = 'admin';
        }
    }
    
    setupResponsiveBehavior() {
        const checkResponsive = () => {
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const primaryNav = document.querySelector('.primary-nav');
            const headerUtilities = document.querySelector('.header-utilities');
            
            if (window.innerWidth <= 768) {
                // Mobile view
                if (mobileMenuToggle) mobileMenuToggle.style.display = 'flex';
                if (primaryNav) primaryNav.style.display = 'none';
                if (headerUtilities) {
                    // Hide some utility buttons on mobile
                    const authControls = document.querySelector('.auth-controls');
                    const adminBtn = document.querySelector('.admin-btn');
                    if (authControls) authControls.style.display = 'none';
                    if (adminBtn) adminBtn.style.display = 'none';
                }
            } else {
                // Desktop view
                if (mobileMenuToggle) mobileMenuToggle.style.display = 'none';
                if (primaryNav) primaryNav.style.display = 'flex';
                if (headerUtilities) {
                    const authControls = document.querySelector('.auth-controls');
                    const adminBtn = document.querySelector('.admin-btn');
                    if (authControls) authControls.style.display = 'flex';
                    if (adminBtn) adminBtn.style.display = 'flex';
                }
                // Close mobile menu if open
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        };
        
        // Initial check
        checkResponsive();
        
        // Listen for resize
        window.addEventListener('resize', checkResponsive);
    }
    
    setupKeyboardNavigation() {
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Ensure proper tab order
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const headerFocusableElements = document.querySelectorAll('.header ' + focusableElements);
        
        // Add focus management
        headerFocusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // Allow normal tab behavior
                    return;
                }
                
                // Arrow key navigation for navigation items
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    const navItems = Array.from(document.querySelectorAll('.primary-nav-item, .category-dropdown-btn'));
                    const currentIndex = navItems.indexOf(element);
                    
                    if (currentIndex !== -1) {
                        e.preventDefault();
                        let nextIndex;
                        
                        if (e.key === 'ArrowRight') {
                            nextIndex = (currentIndex + 1) % navItems.length;
                        } else {
                            nextIndex = currentIndex - 1 < 0 ? navItems.length - 1 : currentIndex - 1;
                        }
                        
                        navItems[nextIndex].focus();
                    }
                }
            });
        });
    }
    
    toggleCategoryDropdown(btn, menu) {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        
        if (isOpen) {
            this.closeCategoryDropdown(btn, menu);
        } else {
            this.openCategoryDropdown(btn, menu);
        }
    }
    
    openCategoryDropdown(btn, menu) {
        btn.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        this.isCategoryDropdownOpen = true;
        
        // Focus first menu item
        const firstItem = menu.querySelector('.category-item');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
    }
    
    closeCategoryDropdown(btn, menu) {
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        this.isCategoryDropdownOpen = false;
    }
    
    toggleMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');
        
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');
        
        // Store previous focus element
        this.previousFocusElement = document.activeElement;
        
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileMenuToggle.setAttribute('aria-label', 'Close main menu');
        mobileMenuPanel.setAttribute('aria-hidden', 'false');
        this.isMobileMenuOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Setup focus trap
        this.setupFocusTrap(mobileMenuPanel);
        
        // Focus first menu item (utility buttons first)
        const firstUtilityBtn = mobileMenuPanel.querySelector('.mobile-utility-btn');
        if (firstUtilityBtn) {
            setTimeout(() => firstUtilityBtn.focus(), 100);
        } else {
            // Fallback to first nav item
            const firstNavItem = mobileMenuPanel.querySelector('.mobile-nav-item');
            if (firstNavItem) {
                setTimeout(() => firstNavItem.focus(), 100);
            }
        }
    }
    
    closeMobileMenu(callback) {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');
        
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open main menu');
        mobileMenuPanel.setAttribute('aria-hidden', 'true');
        this.isMobileMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove focus trap
        this.removeFocusTrap();
        
        // Return focus to toggle button or previous element
        if (this.previousFocusElement && this.previousFocusElement !== document.body) {
            this.previousFocusElement.focus();
        } else if (mobileMenuToggle) {
            mobileMenuToggle.focus();
        }
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            setTimeout(callback, 150); // Small delay for animation
        }
    }
    
    setupFocusTrap(container) {
        // Get all focusable elements within the container
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        this.focusTrapElements = Array.from(focusableElements);
        
        if (this.focusTrapElements.length === 0) return;
        
        // Add keydown listener for focus trap
        this.focusTrapHandler = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                const firstElement = this.focusTrapElements[0];
                const lastElement = this.focusTrapElements[this.focusTrapElements.length - 1];
                
                if (e.shiftKey) {
                    // Shift + Tab (going backwards)
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                    } else {
                        const currentIndex = this.focusTrapElements.indexOf(document.activeElement);
                        const prevIndex = currentIndex - 1 < 0 ? this.focusTrapElements.length - 1 : currentIndex - 1;
                        this.focusTrapElements[prevIndex].focus();
                    }
                } else {
                    // Tab (going forwards)
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                    } else {
                        const currentIndex = this.focusTrapElements.indexOf(document.activeElement);
                        const nextIndex = (currentIndex + 1) % this.focusTrapElements.length;
                        this.focusTrapElements[nextIndex].focus();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', this.focusTrapHandler);
    }
    
    removeFocusTrap() {
        if (this.focusTrapHandler) {
            const mobileMenuPanel = document.getElementById('mobileMenuPanel');
            if (mobileMenuPanel) {
                mobileMenuPanel.removeEventListener('keydown', this.focusTrapHandler);
            }
            this.focusTrapHandler = null;
        }
        this.focusTrapElements = [];
    }
    
    toggleMobileCategoryMenu(toggle, menu) {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        
        if (isOpen) {
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');
        } else {
            toggle.setAttribute('aria-expanded', 'true');
            menu.setAttribute('aria-hidden', 'false');
        }
    }
    
    handleCategoryClick(item) {
        const category = item.getAttribute('data-category');
        
        // Trigger category filtering
        if (typeof filterGames === 'function') {
            filterGames(category);
        }
        
        // Update active state
        document.querySelectorAll('.category-item').forEach(catItem => {
            catItem.classList.remove('active');
        });
        item.classList.add('active');
    }
}

// Modern Header JavaScript
class ModernHeader {
    constructor() {
        this.isScrolled = false;
        this.init();
    }
    
    init() {
        this.setupScrollEffect();
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupThemeToggle();
        this.setupCart();
    }
    
    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.modern-header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    setupDropdowns() {
        // Handle dropdown hover and click
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Click to toggle on mobile
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const isOpen = menu.style.opacity === '1';
                    
                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown-menu').forEach(m => {
                        m.style.opacity = '0';
                        m.style.visibility = 'hidden';
                    });
                    
                    // Toggle current dropdown
                    if (!isOpen) {
                        menu.style.opacity = '1';
                        menu.style.visibility = 'visible';
                    }
                }
            });
            
            // Handle dropdown item clicks
            const items = dropdown.querySelectorAll('.dropdown-item');
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = item.getAttribute('data-category');
                    if (category) {
                        // Trigger category filtering
                        if (typeof filterGamesByCategory === 'function') {
                            filterGamesByCategory(category);
                        }
                    }
                    
                    // Close dropdown
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                });
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                });
            }
        });
    }
    
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        mobileToggle.addEventListener('click', () => {
            // Toggle mobile menu (existing functionality)
            if (typeof headerComponent !== 'undefined' && headerComponent.toggleMobileMenu) {
                headerComponent.toggleMobileMenu();
            }
        });
    }
    
    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle-btn');
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLightMode = document.body.classList.contains('light-mode');
            
            // Update icon
            themeToggle.querySelector('.theme-icon').textContent = isLightMode ? '☀️' : '🌙';
            
            // Save preference
            localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.querySelector('.theme-icon').textContent = '☀️';
        }
    }
    
    setupCart() {
        const cartBtn = document.querySelector('.cart-btn');
        const cartCount = document.querySelector('.cart-count');
        
        cartBtn.addEventListener('click', () => {
            // Open cart modal or navigate to cart page
            showToast('Cart functionality coming soon!', 'info');
        });
        
        // Update cart count (placeholder)
        this.updateCartCount(0);
    }
    
    updateCartCount(count) {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }
}

// Initialize modern header
const modernHeader = new ModernHeader();

// Initialize header component
const headerComponent = new HeaderComponent();

// Consolidated DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize data and games
        DataManager.init();
        initializeSampleGames();
        logDuplicateImages();
        
        // Initialize pagination with actual games
        const allGames = adminGameManager.getAllGames();
        gamePagination.updatePagination(allGames.length);
        renderFilteredGames(allGames);
        
        // Initialize UI components
        initializeUI();
        setupEventListeners();
        checkUserSession();
        
        // Initialize theme
        initializeTheme();
        
        // Initialize navigation and features
        initializeNavigation();
        initializeProfessionalFeatures();
        initializeEnhancedFeatures();
        initializeScrollAnimations();
        initializeSmoothScrolling();
        
        // Setup real-time listeners
        setupRealtimeGameListener();
        loadGamesGrid();
        
    } catch (error) {
        showToast('❌ Error loading application. Please refresh the page.', 'error');
    }
});

function initializeTheme() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    if (!darkModeToggle) {
        return;
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        darkModeToggle.textContent = '☀️';
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('light-mode');
        const isLightMode = body.classList.contains('light-mode');
        
        // Update icon
        this.textContent = isLightMode ? '☀️' : '🌙';
        
        // Save preference
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        
        // Add transition effect
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
    });
}

// Smooth scrolling functionality
function initializeSmoothScrolling() {
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
}

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
    // Load more games from server
    showToast('Loading more games...', 'info');
    
    setTimeout(() => {
        showToast('All games loaded!', 'success');
    }, 1000);
}

// Game Selection
function selectGame(gameTitle) {
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
    const submitBtn = document.querySelector('#adminModal .btn-primary');

    // Clear previous errors
    errorDiv.textContent = '';
    errorDiv.classList.remove('active');

    if (!password) {
        errorDiv.textContent = 'Please enter admin password';
        errorDiv.classList.add('active');
        document.getElementById('adminPassword').focus();
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    submitBtn.style.opacity = '0.7';

    // Simulate verification delay for better UX
    setTimeout(() => {
        if (password === 'Ciontatenx83') {
            // Success
            showToast('✅ Admin access granted! Redirecting...', 'success');
            
            // Clear password field
            document.getElementById('adminPassword').value = '';
            
            // Close modal
            closeModal('adminModal');
            
            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            // Error
            errorDiv.textContent = 'Incorrect password. Access denied.';
            errorDiv.classList.add('active');
            showToast('❌ Invalid admin password', 'error');
            
            // Clear password field on error
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Access Admin Panel';
            submitBtn.style.opacity = '1';
            
            // Add shake animation to modal
            const modal = document.querySelector('#adminModal .modal-content');
            modal.style.animation = 'shake 0.5s';
            setTimeout(() => {
                modal.style.animation = '';
            }, 500);
        }
    }, 800);
}

// Enhanced admin modal open function
function openAdminModal() {
    openModal('adminModal');
    
    // Focus on password field
    setTimeout(() => {
        const passwordField = document.getElementById('adminPassword');
        if (passwordField) {
            passwordField.focus();
            
            // Add enter key handler
            passwordField.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    verifyAdminPassword();
                }
            };
        }
    }, 100);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    .admin-modal .modal-content {
        animation: none;
    }
`;
document.head.appendChild(style);

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
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
