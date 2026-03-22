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
    initializeUI();
    loadGamesGrid();
    setupEventListeners();
    checkUserSession();
});

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

// ============ BACKGROUND THEME ============

function applyBackgroundTheme() {
    const backgroundImages = DataManager.getBackgroundImages();
    if (!backgroundImages || backgroundImages.length === 0) return;

    // Get the current background index (default to 0)
    const currentBgIndex = 0;
    const bgUrl = backgroundImages[currentBgIndex];

    // Remove existing style if present
    const styleTag = document.getElementById('bgShuffleStyle');
    if (styleTag) {
        styleTag.remove();
    }

    // Create a CSS rule for the body background
    const newStyle = document.createElement('style');
    newStyle.id = 'bgShuffleStyle';
    newStyle.textContent = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${bgUrl}');
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
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';

    if (games.length === 0) {
        gamesGrid.innerHTML = '<div class="no-results">No games found matching your criteria.</div>';
        return;
    }

    const currentUser = DataManager.getCurrentUser();
    games.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
        
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
    });
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    const releaseDate = new Date(game.releaseDate).toLocaleDateString();
    const isLatest = game.rating >= 4.7 && new Date(game.releaseDate) > new Date('2024-01-01'); // Example criteria for 'Latest'
    card.innerHTML = `
        <div class="game-thumbnail">
            <img src="${game.imageUrl}" alt="${game.title}" class="game-image" loading="lazy" onerror="this.src='https://via.placeholder.com/80x80?text=${encodeURIComponent(game.title)}'">
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-meta">
                <span class="game-release">${releaseDate}</span>
                ${isLatest ? '<span class="latest-tag">Latest</span>' : ''}
            </div>
        </div>
        <div class="game-actions">
            <button class="game-action-btn" onclick="initiateDownload(${game.id}, '${game.title}')">⬇️ Download</button>
            <button class="game-action-btn secondary" onclick="openGameDetails(${game.id})">ℹ️ Details</button>
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

function filterGamesByCategory(category) {
    currentCategory = category;
    applyAllFiltersAndSort();
}

function handleGameSearch(query) {
    currentSearchQuery = query.toLowerCase().trim();
    
    // If search box is empty, hide dropdown
    if (!query.trim()) {
        hideSearchDropdown();
        return;
    }
    
    // Show dropdown with filtered results
    showSearchResults(query);
    applyAllFiltersAndSort();
}

function showSearchResults(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    const searchResultsList = document.getElementById('searchResults');
    const games = DataManager.getGames();
    
    const matchedGames = games.filter(g => 
        g.title.toLowerCase().includes(query.toLowerCase()) ||
        g.description.toLowerCase().includes(query.toLowerCase()) ||
        g.category.toLowerCase().includes(query.toLowerCase())
    );
    
    searchResultsList.innerHTML = '';
    
    if (matchedGames.length === 0) {
        searchResultsList.innerHTML = '<div class="search-no-results">❌ No games match your search</div>';
    } else {
        matchedGames.slice(0, 8).forEach(game => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${game.imageUrl}" alt="${game.title}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-title">${game.title}</div>
                    <div class="search-result-meta">⭐ ${game.rating} • ${capitalizeFirst(game.category)}</div>
                </div>
            `;
            // Use mousedown instead of click to ensure it fires before blur event on input
            resultItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectSearchResult(game.id);
            });
            // Also support keyboard selection
            resultItem.addEventListener('click', (e) => {
                e.preventDefault();
                selectSearchResult(game.id);
            });
            searchResultsList.appendChild(resultItem);
        });
    }
    
    searchDropdown.style.display = 'block';
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

// ============ ADMIN ACCESS ============

function verifyAdminPassword() {
    const password = document.getElementById('adminPassword').value.trim();
    const errorDiv = document.getElementById('adminError');

    errorDiv.textContent = '';

    if (!password) {
        errorDiv.textContent = 'Please enter the admin password';
        return;
    }

    if (password === 'Ciontatenx83') {
        window.location.href = 'admin.html';
    } else {
        errorDiv.textContent = 'Incorrect password. Access denied.';
        showToast('❌ Invalid admin password', 'error');
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
    }
}

// ============ UTILITY FUNCTIONS ============

function scrollToCategories() {
    document.querySelector('.categories-section').scrollIntoView({ behavior: 'smooth' });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
