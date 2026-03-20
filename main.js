// ============================================
// MAIN PUBLIC PAGE FUNCTIONALITY
// ============================================

let currentRating = 0;
let currentPaymentGameId = null;
let currentPaymentMethod = 'card';

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
    const games = DataManager.getGames();
    displayGames(games);
    displayFeaturedGames(games);
}

function displayGames(games) {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';

    if (games.length === 0) {
        gamesGrid.innerHTML = '<p class="empty-message">No games found in this category.</p>';
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
            if (subInfoElement) {
                const tierEmoji = {
                    'free': '🎯',
                    'premium': '⭐',
                    'pro': '👑'
                };
                subInfoElement.innerHTML = `${tierEmoji[subInfo.tier] || ''} ${subInfo.tier.toUpperCase()}: ${subInfo.remaining} games remaining`;
                subInfoElement.className = subInfo.remaining <= 1 ? 'remaining warning' : 'remaining';
            }
        }
    });
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <div class="game-image-container">
            <img src="${game.imageUrl}" alt="${game.title}" class="game-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(game.title)}'">
            <div class="download-badge">
                <span class="download-icon">⬇️</span>
                <span class="download-count">${game.downloads}</span>
            </div>
        </div>
        <div class="game-content">
            <h3 class="game-title">${game.title}</h3>
            <span class="game-category">${capitalizeFirst(game.category)}</span>
            <p class="game-description">${game.description.substring(0, 100)}...</p>
            <div class="game-rating">⭐ ${game.rating}</div>
            <div class="game-footer">
                <div class="game-price">
                    ${game.price === 0 ? 'FREE' : '$' + game.price.toFixed(2)}
                </div>
                <div class="game-actions">
                    <button class="game-action-btn" onclick="initiateDownload(${game.id}, '${game.title}')">⬇️ Download</button>
                    <button class="game-action-btn secondary" onclick="openCommentsModal(${game.id}, '${game.title}')">💬 Reviews</button>
                </div>
            </div>
            <div class="subscription-info">
                <small id="subInfo-${game.id}"></small>
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

function filterGamesByCategory(category) {
    const games = DataManager.getGames();
    const filtered = category === 'all' ? games : games.filter(g => g.category === category);
    displayGames(filtered);
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
    document.getElementById('paymentError').classList.remove('active');

    currentPaymentMethod = 'card';
    switchPaymentTab('card');
    openModal('paymentModal');
}

function switchPaymentTab(method) {
    currentPaymentMethod = method;
    
    document.querySelectorAll('.payment-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(method === 'card' ? 'cardPayment' : 'mobilePayment').classList.add('active');
}

function processPayment() {
    const errorDiv = document.getElementById('paymentError');
    errorDiv.classList.remove('active');

    if (currentPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardholder = document.getElementById('cardholderName').value.trim();
        const expiry = document.getElementById('cardExpiry').value.trim();
        const cvv = document.getElementById('cardCVV').value.trim();

        if (!cardNumber || !cardholder || !expiry || !cvv) {
            errorDiv.textContent = 'Please fill in all card details';
            errorDiv.classList.add('active');
            return;
        }

        if (cardNumber.replace(/\s/g, '').length !== 16) {
            errorDiv.textContent = 'Card number must be 16 digits';
            errorDiv.classList.add('active');
            return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            errorDiv.textContent = 'CVV must be 3 or 4 digits';
            errorDiv.classList.add('active');
            return;
        }
    } else {
        const name = document.getElementById('phoneName').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const provider = document.getElementById('mobileProvider').value;

        if (!name || !phone || !provider) {
            errorDiv.textContent = 'Please fill in all mobile money details';
            errorDiv.classList.add('active');
            return;
        }

        if (phone.replace(/\D/g, '').length < 10) {
            errorDiv.textContent = 'Please enter a valid phone number';
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
    document.getElementById('userSubscriptionDisplay').textContent = subscriptionMap[currentUser.subscription];
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
    currentPaymentGameId = gameId;
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
        gameId: currentPaymentGameId,
        userId: currentUser.id,
        userName: currentUser.name,
        rating: currentRating,
        text: commentText
    };

    DataManager.addComment(comment);
    showToast('✅ Comment posted successfully!', 'success');
    
    // Reload comments
    loadComments(currentPaymentGameId);
    
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
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
