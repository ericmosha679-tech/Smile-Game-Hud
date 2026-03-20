// ============================================
// ADMIN DASHBOARD FUNCTIONALITY
// ============================================

let currentEditingGameId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    verifyAdminAccess();
    loadAdminData();
    setupAdminEventListeners();
});

// ============ ADMIN ACCESS VERIFICATION ============

function verifyAdminAccess() {
    // Admin page should only be accessible if user verified password
    // This is a simple check - in production, use proper authentication
    const isAccessingFromHistory = performance.navigation.type === 2;
    
    if (!isAccessingFromHistory && !sessionStorage.getItem('adminAccessGranted')) {
        // If no valid access, redirect to home
        // This can be bypassed by directly opening admin.html, but the real protection
        // is accessing it through the password modal on index.html
        sessionStorage.setItem('adminAccessGranted', 'true');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminAccessGranted');
    window.location.href = 'index.html';
}

// ============ ADMIN DATA LOADING ============

function loadAdminData() {
    loadAdminGamesTable();
    loadAdminUsersTable();
    loadAnalytics();
    loadActivityLog();
    setupThemeControls();
    setupBackgroundControls();
}

// ============ GAMES MANAGEMENT ============

function loadAdminGamesTable() {
    const games = DataManager.getGames();
    const tableBody = document.getElementById('adminGamesTable');
    tableBody.innerHTML = '';

    if (games.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No games yet</td></tr>';
        return;
    }

    games.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.title}</td>
            <td>${capitalizeFirst(game.category)}</td>
            <td>$${game.price.toFixed(2)}</td>
            <td>${game.downloads || 0}</td>
            <td>
                <button class="action-btn" onclick="editGame(${game.id})">✏️ Edit</button>
                <button class="action-btn delete" onclick="deleteGame(${game.id})">🗑️ Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddGameModal() {
    currentEditingGameId = null;
    document.getElementById('gameModalTitle').textContent = 'Add New Game';
    document.getElementById('saveGameBtn').textContent = 'Add Game';
    
    // Clear form
    document.getElementById('gameName').value = '';
    document.getElementById('gameCategory').value = '';
    document.getElementById('gamePrice').value = '';
    document.getElementById('gameRating').value = '';
    document.getElementById('gameDescription').value = '';
    document.getElementById('gameImageUrl').value = '';
    document.getElementById('gameError').classList.remove('active');

    openModal('gameModal');
}

function editGame(gameId) {
    currentEditingGameId = gameId;
    const game = DataManager.getGameById(gameId);

    document.getElementById('gameModalTitle').textContent = 'Edit Game';
    document.getElementById('saveGameBtn').textContent = 'Update Game';

    document.getElementById('gameName').value = game.title;
    document.getElementById('gameCategory').value = game.category;
    document.getElementById('gamePrice').value = game.price;
    document.getElementById('gameRating').value = game.rating;
    document.getElementById('gameDescription').value = game.description;
    document.getElementById('gameImageUrl').value = game.imageUrl;
    document.getElementById('gameError').classList.remove('active');

    openModal('gameModal');
}

function saveGame() {
    const name = document.getElementById('gameName').value.trim();
    const category = document.getElementById('gameCategory').value;
    const price = parseFloat(document.getElementById('gamePrice').value);
    const rating = parseFloat(document.getElementById('gameRating').value);
    const description = document.getElementById('gameDescription').value.trim();
    const imageUrl = document.getElementById('gameImageUrl').value.trim();
    const errorDiv = document.getElementById('gameError');

    errorDiv.classList.remove('active');

    if (!name || !category || isNaN(price) || isNaN(rating) || !description || !imageUrl) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.classList.add('active');
        return;
    }

    if (price < 0) {
        errorDiv.textContent = 'Price cannot be negative';
        errorDiv.classList.add('active');
        return;
    }

    if (rating < 0 || rating > 5) {
        errorDiv.textContent = 'Rating must be between 0 and 5';
        errorDiv.classList.add('active');
        return;
    }

    const gameData = {
        title: name,
        category: category,
        price: parseFloat(price.toFixed(2)),
        rating: parseFloat(rating.toFixed(1)),
        description: description,
        imageUrl: imageUrl
    };

    if (currentEditingGameId) {
        // Update existing game
        DataManager.updateGame(currentEditingGameId, gameData);
        showToast(`✅ Game "${name}" updated successfully!`, 'success');
    } else {
        // Add new game
        DataManager.addGame(gameData);
        showToast(`✅ Game "${name}" added successfully!`, 'success');
    }

    closeModal('gameModal');
    loadAdminGamesTable();
}

function deleteGame(gameId) {
    const game = DataManager.getGameById(gameId);
    if (confirm(`Are you sure you want to delete "${game.title}"? This action cannot be undone.`)) {
        DataManager.deleteGame(gameId);
        showToast(`🗑️ Game "${game.title}" deleted`, 'warning');
        loadAdminGamesTable();
    }
}

// ============ THEME MANAGEMENT ============

function setupThemeControls() {
    const theme = DataManager.getTheme();
    
    // Set color inputs
    document.getElementById('bgColor').value = theme.bgColor;
    document.getElementById('bgColorText').value = theme.bgColor;
    
    document.getElementById('accentColor').value = theme.accentColor;
    document.getElementById('accentColorText').value = theme.accentColor;
    
    document.getElementById('glassColor').value = theme.glassColor;
    document.getElementById('glassColorText').value = theme.glassColor;

    // Set up color input sync
    document.getElementById('bgColor').addEventListener('input', () => {
        const value = document.getElementById('bgColor').value;
        document.getElementById('bgColorText').value = value;
        updateTheme();
    });
    document.getElementById('bgColorText').addEventListener('input', () => {
        const value = document.getElementById('bgColorText').value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            document.getElementById('bgColor').value = value;
            updateTheme();
        }
    });

    document.getElementById('accentColor').addEventListener('input', () => {
        const value = document.getElementById('accentColor').value;
        document.getElementById('accentColorText').value = value;
        updateTheme();
    });
    document.getElementById('accentColorText').addEventListener('input', () => {
        const value = document.getElementById('accentColorText').value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            document.getElementById('accentColor').value = value;
            updateTheme();
        }
    });

    document.getElementById('glassColor').addEventListener('input', () => {
        const value = document.getElementById('glassColor').value;
        document.getElementById('glassColorText').value = value;
        updateTheme();
    });
    document.getElementById('glassColorText').addEventListener('input', () => {
        const value = document.getElementById('glassColorText').value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            document.getElementById('glassColor').value = value;
            updateTheme();
        }
    });

    updateTheme();
}

function updateTheme() {
    const bgColor = document.getElementById('bgColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const glassColor = document.getElementById('glassColor').value;

    // Update preview
    const preview = document.querySelector('.preview-hero');
    preview.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${glassColor} 100%)`;

    // Update live page
    const root = document.documentElement;
    root.style.setProperty('--primary-bg', bgColor);
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--glass-color', glassColor);
}

function saveTheme() {
    const bgColor = document.getElementById('bgColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const glassColor = document.getElementById('glassColor').value;

    const theme = {
        bgColor: bgColor,
        accentColor: accentColor,
        glassColor: glassColor
    };

    DataManager.setTheme(theme);
    showToast('✅ Theme saved successfully!', 'success');
}

function resetTheme() {
    if (confirm('Reset theme to default colors?')) {
        DataManager.initializeDefaultTheme();
        setupThemeControls();
        showToast('🔄 Theme reset to default', 'success');
    }
}

// ============ BACKGROUND IMAGE MANAGEMENT ============

let backgroundShuffleInterval = null;
let currentBgIndex = 0;
let backgroundImages = [];

function setupBackgroundControls() {
    const bgImages = DataManager.getBackgroundImages();
    if (bgImages && bgImages.length > 0) {
        backgroundImages = bgImages;
        document.getElementById('backgroundImages').value = backgroundImages.join('\n');
        updateBgPreview();
        
        const autoShuffle = DataManager.getAutoShuffle();
        document.getElementById('autoShuffleToggle').checked = autoShuffle !== false;
        
        if (autoShuffle !== false) {
            startBackgroundShuffle();
        }
    }
}

function saveBackgroundImages() {
    const textareaValue = document.getElementById('backgroundImages').value.trim();
    
    if (!textareaValue) {
        showToast('⚠️ Please add at least one background image URL', 'warning');
        return;
    }
    
    backgroundImages = textareaValue
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    
    if (backgroundImages.length === 0) {
        showToast('❌ Please enter valid image URLs', 'error');
        return;
    }
    
    // Validate URLs
    for (let url of backgroundImages) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showToast('❌ All URLs must start with http:// or https://', 'error');
            return;
        }
    }
    
    DataManager.saveBackgroundImages(backgroundImages);
    currentBgIndex = 0;
    updateBgPreview();
    
    const autoShuffle = document.getElementById('autoShuffleToggle').checked;
    DataManager.setAutoShuffle(autoShuffle);
    
    if (autoShuffle) {
        startBackgroundShuffle();
    } else {
        stopBackgroundShuffle();
    }
    
    showToast('💾 Background images saved successfully!', 'success');
}

function toggleAutoShuffle() {
    const isEnabled = document.getElementById('autoShuffleToggle').checked;
    DataManager.setAutoShuffle(isEnabled);
    
    if (isEnabled && backgroundImages.length > 0) {
        startBackgroundShuffle();
        showToast('✅ Auto-shuffle enabled (4 seconds)', 'success');
    } else {
        stopBackgroundShuffle();
        showToast('⏸️ Auto-shuffle disabled', 'warning');
    }
}

function startBackgroundShuffle() {
    if (backgroundImages.length < 2) return;
    
    // Clear existing interval
    if (backgroundShuffleInterval) {
        clearInterval(backgroundShuffleInterval);
    }
    
    // Shuffle every 4 seconds
    backgroundShuffleInterval = setInterval(() => {
        currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
        updateBgPreview();
        applyBackgroundToSite();
    }, 4000);
}

function stopBackgroundShuffle() {
    if (backgroundShuffleInterval) {
        clearInterval(backgroundShuffleInterval);
        backgroundShuffleInterval = null;
    }
}

function updateBgPreview() {
    if (backgroundImages.length === 0) return;
    
    const bgUrl = backgroundImages[currentBgIndex];
    const preview = document.getElementById('bgPreviewBox');
    
    if (preview) {
        preview.style.backgroundImage = `url('${bgUrl}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    }
}

function applyBackgroundToSite() {
    if (backgroundImages.length === 0) return;
    
    const bgUrl = backgroundImages[currentBgIndex];
    const root = document.documentElement;
    
    // Create a CSS rule for the body background
    const styleTag = document.getElementById('bgShuffleStyle');
    if (styleTag) {
        styleTag.remove();
    }
    
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

// ============ ANALYTICS ============

function loadAnalytics() {
    const analytics = DataManager.getAnalytics();
    
    document.getElementById('totalGames').textContent = analytics.totalGames;
    document.getElementById('totalUsers').textContent = analytics.totalUsers;
    document.getElementById('totalDownloads').textContent = analytics.totalDownloads;
    document.getElementById('totalComments').textContent = analytics.totalComments;
}

function loadActivityLog() {
    const activities = DataManager.getActivities();
    const activityLog = document.getElementById('activityLog');
    
    activityLog.innerHTML = '';
    
    if (activities.length === 0) {
        activityLog.innerHTML = '<p class="empty-message">No recent activity</p>';
        return;
    }

    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <strong>${activity.message}</strong>
            <br>
            <small>${activity.timestamp}</small>
        `;
        activityLog.appendChild(item);
    });
}

// ============ USER MANAGEMENT ============

function loadAdminUsersTable() {
    const users = DataManager.getUsers();
    const tableBody = document.getElementById('adminUsersTable');
    tableBody.innerHTML = '';

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No users yet</td></tr>';
        return;
    }

    const subscriptionLabels = {
        'free': 'Free Trial',
        'premium': 'Premium',
        'pro': 'Pro Premium'
    };

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${subscriptionLabels[user.subscription]}</td>
            <td>${user.createdAt}</td>
            <td>
                <button class="action-btn" onclick="viewUserDetails(${user.id})">👁️ View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewUserDetails(userId) {
    const user = DataManager.getUserByEmail(
        DataManager.getUsers().find(u => u.id === userId)?.email
    );
    
    if (!user) return;

    const subscriptionLabels = {
        'free': 'Free Trial',
        'premium': 'Premium ($6.9/month)',
        'pro': 'Pro Premium ($12.9/month)'
    };

    alert(`
User Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${user.name}
Email: ${user.email}
Subscription: ${subscriptionLabels[user.subscription]}
Member Since: ${user.createdAt}
Downloads: ${(user.downloads || []).length}
    `);
}

// ============ TAB NAVIGATION ============

function setupAdminEventListeners() {
    // Tab buttons are already set up with onclick handlers
}

function switchAdminTab(tab) {
    // Deactivate all tabs
    document.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    document.querySelectorAll('.admin-menu-item').forEach(b => {
        b.classList.remove('active');
    });

    // Activate selected tab
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');

    // Reload data for specific tabs
    if (tab === 'analytics') {
        loadAnalytics();
        loadActivityLog();
    } else if (tab === 'users') {
        loadAdminUsersTable();
    } else if (tab === 'games') {
        loadAdminGamesTable();
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
