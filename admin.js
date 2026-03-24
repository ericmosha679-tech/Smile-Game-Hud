// ============================================
// ADMIN DASHBOARD FUNCTIONALITY
// ============================================

let currentEditingGameId = null;

// Firebase is initialized in admin.html

// Initialize database reference
let database = null;

function initializeDatabase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        database = firebase.database();
        console.log('Firebase database initialized successfully');
    } else {
        console.warn('Firebase database not available');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    verifyAdminAccess();
    loadAdminData();
    setupAdminEventListeners();
    applyAdminDeviceOptimizations();
});

// ============ DEVICE OPTIMIZATION ============

function applyAdminDeviceOptimizations() {
    const width = window.innerWidth;
    const isTablet = window.innerHeight < 1024 && width < 1024;
    const isMobile = width < 768;
    
    document.body.classList.add(`admin-device-${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`);
    
    if (isMobile) {
        // Adjust admin panels for mobile
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        if (sidebar) sidebar.style.maxHeight = '200px';
        if (main) main.style.padding = '1rem';
    }
}

// ============ ADMIN ACCESS VERIFICATION ============

function verifyAdminAccess() {
    try {
        // Check if admin access was already granted in this session
        const isAdminGranted = sessionStorage.getItem('adminAccessGranted') === 'true';
        
        if (!isAdminGranted) {
            // No admin access in this session, show password prompt
            const password = prompt('🔐 Enter Admin Password:', '');
            
            // Verify password (Admin password: Ciontatenx83)
            if (password === 'Ciontatenx83') {
                sessionStorage.setItem('adminAccessGranted', 'true');
                console.log('Admin access granted');
            } else {
                // Password incorrect or cancelled
                alert('❌ Invalid password or access denied!');
                window.location.href = 'index.html';
                return;
            }
        } else {
            console.log('Admin access already granted');
        }
    } catch (error) {
        console.error('Error verifying admin access:', error);
        alert('❌ Error verifying admin access!');
        window.location.href = 'index.html';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminAccessGranted');
    showToast('🚪 Admin logout successful', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ============ ADMIN DATA LOADING ============

function loadAdminData() {
    try {
        console.log('Loading admin data...');
        loadAdminGamesTable();
        loadAdminUsersTable();
        loadAnalytics();
        loadActivityLog();
        setupThemeControls();
        setupBackgroundControls();
        console.log('Admin data loaded successfully');
    } catch (error) {
        console.error('Error loading admin data:', error);
        showToast('❌ Error loading admin data', 'error');
    }
}

// ============ GAMES MANAGEMENT ============

function loadAdminGamesTable() {
    try {
        console.log('Loading admin games table...');
        
        // Check if DataManager is available
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available');
            return;
        }
        
        const games = DataManager.getGames();
        const tableBody = document.getElementById('adminGamesTable');
        
        if (!tableBody) {
            console.error('adminGamesTable element not found');
            return;
        }
        
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
        
        console.log(`Loaded ${games.length} games in admin table`);
    } catch (error) {
        console.error('Error loading admin games table:', error);
        showToast('❌ Error loading games table', 'error');
    }
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
    document.getElementById('gameImage').value = '';
    document.getElementById('gameImagePreview').style.display = 'none';
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
    document.getElementById('gameImage').value = '';
    document.getElementById('gameImagePreview').style.display = 'none';
    document.getElementById('gameError').classList.remove('active');

    openModal('gameModal');
}

function previewGameImage() {
    const fileInput = document.getElementById('gameImage');
    const preview = document.getElementById('gameImagePreview');
    const previewImg = document.getElementById('imagePreviewImg');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function saveGame() {
    const name = document.getElementById('gameName').value.trim();
    const category = document.getElementById('gameCategory').value;
    const price = parseFloat(document.getElementById('gamePrice').value);
    const rating = parseFloat(document.getElementById('gameRating').value);
    const description = document.getElementById('gameDescription').value.trim();
    const imageFile = document.getElementById('gameImage').files[0];
    const errorDiv = document.getElementById('gameError');

    errorDiv.classList.remove('active');

    // If no image, use placeholder
    if (!imageFile) {
        const placeholderGameData = {
            title: name,
            category: category,
            price: parseFloat(price.toFixed(2)),
            rating: parseFloat(rating.toFixed(1)),
            description: description,
            imageUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop' // Default placeholder
        };

        if (currentEditingGameId) {
            DataManager.updateGame(currentEditingGameId, placeholderGameData);
            if (database) firebase.database().ref('games/' + currentEditingGameId).set(placeholderGameData).catch(err => console.error(err));
            showToast(`✅ Game "${name}" updated successfully!`, 'success');
        } else {
            const newGame = DataManager.addGame(placeholderGameData);
            if (database) firebase.database().ref('games/' + newGame.id).set(newGame).catch(err => console.error(err));
            showToast(`✅ Game "${name}" added successfully!`, 'success');
        }
        closeModal('gameModal');
        loadAdminGamesTable();
        return;
    }

    // Read image file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const gameData = {
            title: name,
            category: category,
            price: parseFloat(price.toFixed(2)),
            rating: parseFloat(rating.toFixed(1)),
            description: description,
            imageUrl: e.target.result // Store as base64 data URL
        };

        // Save locally via DataManager
        if (currentEditingGameId) {
            DataManager.updateGame(currentEditingGameId, gameData);
            if (database) firebase.database().ref('games/' + currentEditingGameId).set(gameData).catch(err => console.error(err));
            showToast(`✅ Game "${name}" updated successfully!`, 'success');
        } else {
            const newGame = DataManager.addGame(gameData);
            if (database) firebase.database().ref('games/' + newGame.id).set(newGame).catch(err => console.error(err));
            showToast(`✅ Game "${name}" added successfully!`, 'success');
        }

        closeModal('gameModal');
        loadAdminGamesTable();
    };
    reader.onerror = function() {
        errorDiv.textContent = 'Error reading image file';
        errorDiv.classList.add('active');
    };
    reader.readAsDataURL(imageFile);
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
    try {
        console.log('Setting up theme controls...');
        
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available for theme controls');
            return;
        }
        
        const theme = DataManager.getTheme();
        
        // Check if theme elements exist
        const bgColor = document.getElementById('bgColor');
        const bgColorText = document.getElementById('bgColorText');
        const accentColor = document.getElementById('accentColor');
        const accentColorText = document.getElementById('accentColorText');
        const glassColor = document.getElementById('glassColor');
        const glassColorText = document.getElementById('glassColorText');
        
        if (!bgColor || !bgColorText || !accentColor || !accentColorText || !glassColor || !glassColorText) {
            console.warn('Theme control elements not found - skipping theme setup');
            return;
        }
        
        // Set color inputs
        bgColor.value = theme.bgColor;
        bgColorText.value = theme.bgColor;
        
        accentColor.value = theme.accentColor;
        accentColorText.value = theme.accentColor;
        
        glassColor.value = theme.glassColor;
        glassColorText.value = theme.glassColor;

        // Set up color input sync
        bgColor.addEventListener('input', () => {
            const value = bgColor.value;
            bgColorText.value = value;
            updateTheme();
        });
        bgColorText.addEventListener('input', () => {
            const value = bgColorText.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                bgColor.value = value;
                updateTheme();
            }
        });

        accentColor.addEventListener('input', () => {
            const value = accentColor.value;
            accentColorText.value = value;
            updateTheme();
        });
        accentColorText.addEventListener('input', () => {
            const value = accentColorText.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                accentColor.value = value;
                updateTheme();
            }
        });

        glassColor.addEventListener('input', () => {
            const value = glassColor.value;
            glassColorText.value = value;
            updateTheme();
        });
        glassColorText.addEventListener('input', () => {
            const value = glassColorText.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                glassColor.value = value;
                updateTheme();
            }
        });

        updateTheme();
        console.log('Theme controls set up successfully');
    } catch (error) {
        console.error('Error setting up theme controls:', error);
        showToast('❌ Error setting up theme controls', 'error');
    }
}

function updateTheme() {
    try {
        const bgColor = document.getElementById('bgColor');
        const accentColor = document.getElementById('accentColor');
        const glassColor = document.getElementById('glassColor');
        
        if (!bgColor || !accentColor || !glassColor) {
            console.warn('Theme color inputs not found');
            return;
        }
        
        // Update preview
        const preview = document.querySelector('.preview-hero');
        if (preview) {
            preview.style.background = `linear-gradient(135deg, ${bgColor.value} 0%, ${glassColor.value} 100%)`;
        }

        // Update live page
        const root = document.documentElement;
        root.style.setProperty('--primary-bg', bgColor.value);
        root.style.setProperty('--accent-color', accentColor.value);
        root.style.setProperty('--glass-color', glassColor.value);
    } catch (error) {
        console.error('Error updating theme:', error);
    }
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
    try {
        console.log('Setting up background controls...');
        
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available for background controls');
            return;
        }
        
        const bgImages = DataManager.getBackgroundImages();
        console.log('Background images from manager:', bgImages);
        
        if (bgImages && bgImages.length > 0) {
            backgroundImages = bgImages;
            currentBgIndex = 0;
            updateBgPreview();
            applyBackgroundToSite();
            
            // Start auto-shuffle if enabled
            const autoShuffle = DataManager.getAutoShuffle();
            if (autoShuffle && backgroundImages.length > 1) {
                startBackgroundShuffle();
            }
        } else {
            console.log('No background images to load');
        }
        
        console.log('Background controls set up successfully');
    } catch (error) {
        console.error('Error setting up background controls:', error);
        showToast('❌ Error setting up background controls', 'error');
    }
}

function handleBackgroundImageUpload() {
    const fileInput = document.getElementById('backgroundImageUpload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showToast('⚠️ Please select at least one image', 'warning');
        return;
    }
    
    backgroundImages = [];
    let filesProcessed = 0;
    
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            backgroundImages.push(e.target.result);
            filesProcessed++;
            
            if (filesProcessed === files.length) {
                // All files processed
                DataManager.saveBackgroundImages(backgroundImages);
                currentBgIndex = 0;
                updateBgPreview();
                displayUploadedImages();
                
                const autoShuffle = document.getElementById('autoShuffleToggle').checked;
                DataManager.setAutoShuffle(autoShuffle);
                
                if (autoShuffle && backgroundImages.length > 0) {
                    startBackgroundShuffle();
                }
                
                showToast(`✅ ${backgroundImages.length} background image(s) saved successfully!`, 'success');
            }
        };
        reader.readAsDataURL(files[i]);
    }
}

function displayUploadedImages() {
    const grid = document.getElementById('imagesGrid');
    const container = document.getElementById('uploadedImagesPreview');
    
    grid.innerHTML = '';
    
    if (backgroundImages.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    backgroundImages.forEach((img, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.style.cssText = 'position: relative; width: 100px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid var(--accent-color); cursor: pointer;';
        imgDiv.innerHTML = `
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" onclick="setCurrentBg(${index})">
            <span style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; padding: 2px 5px; border-radius: 4px; font-size: 10px;">${index + 1}</span>
        `;
        grid.appendChild(imgDiv);
    });
    
    container.style.display = 'block';
}

function setCurrentBg(index) {
    currentBgIndex = index;
    updateBgPreview();
    applyBackgroundToSite();
    showToast(`🖼️ Background changed to image ${index + 1}`, 'info');
}

function saveBackgroundImages() {
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
    
    showToast('💾 Background images saved successfully! (4 seconds auto-shuffle)', 'success');
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
    try {
        console.log('Loading analytics...');
        
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available for analytics');
            return;
        }
        
        const analytics = DataManager.getAnalytics();
        
        const totalGamesEl = document.getElementById('totalGames');
        const totalUsersEl = document.getElementById('totalUsers');
        const totalDownloadsEl = document.getElementById('totalDownloads');
        const totalCommentsEl = document.getElementById('totalComments');
        
        if (totalGamesEl) totalGamesEl.textContent = analytics.totalGames;
        if (totalUsersEl) totalUsersEl.textContent = analytics.totalUsers;
        if (totalDownloadsEl) totalDownloadsEl.textContent = analytics.totalDownloads;
        if (totalCommentsEl) totalCommentsEl.textContent = analytics.totalComments;
        
        console.log('Analytics loaded successfully');
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('❌ Error loading analytics', 'error');
    }
}

function loadActivityLog() {
    try {
        console.log('Loading activity log...');
        
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available for activity log');
            return;
        }
        
        const activities = DataManager.getActivities();
        const activityLog = document.getElementById('activityLog');
        
        if (!activityLog) {
            console.error('activityLog element not found');
            return;
        }
        
        activityLog.innerHTML = '';
        
        if (activities.length === 0) {
            activityLog.innerHTML = '<p class="empty-message">No recent activity</p>';
            return;
        }

        activities.forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <strong>${activity.message}</strong>
                <br>
                <small>${activity.timestamp}</small>
            `;
            activityLog.appendChild(item);
        });
        
        console.log('Activity log loaded successfully');
    } catch (error) {
        console.error('Error loading activity log:', error);
        showToast('❌ Error loading activity log', 'error');
    }
}

// ============ USER MANAGEMENT ============

function loadAdminUsersTable() {
    try {
        console.log('Loading admin users table...');
        
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not available for users table');
            return;
        }
        
        const users = DataManager.getUsers();
        const tableBody = document.getElementById('adminUsersTable');
        
        if (!tableBody) {
            console.error('adminUsersTable element not found');
            return;
        }
        
        tableBody.innerHTML = '';

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-message">No users yet</td></tr>';
            return;
        }

        const subscriptionLabels = {
            'free': 'Free Trial',
            'premium': 'Premium',
            'pro': 'Pro Premium'
        };

        users.forEach(user => {
            const row = document.createElement('tr');
            const isBlocked = user.blocked || false;
            const blockButtonText = isBlocked ? '✅ Unblock' : '🚫 Block';
            const blockButtonClass = isBlocked ? '' : 'delete';
            
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${subscriptionLabels[user.subscription] || 'Unknown'}</td>
                <td>${user.createdAt || 'N/A'}</td>
                <td style="color: ${isBlocked ? '#ff6b6b' : 'inherit'};">${isBlocked ? '(BLOCKED)' : 'Active'}</td>
                <td>
                    <button class="action-btn" onclick="viewUserDetails(${user.id})">👁️ View</button>
                    <button class="action-btn ${blockButtonClass}" onclick="toggleBlockUser(${user.id}, '${user.name}')">
                        ${blockButtonText}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        console.log(`Loaded ${users.length} users in admin table`);
    } catch (error) {
        console.error('Error loading admin users table:', error);
        showToast('❌ Error loading users table', 'error');
    }
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

function toggleBlockUser(userId, userName) {
    const currentUser = DataManager.getCurrentUser();
    const users = DataManager.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    const isBlocked = user.blocked || false;
    
    if (isBlocked) {
        if (!confirm(`Unblock user "${userName}"?`)) return;
        user.blocked = false;
        user.blockedReason = '';
        showToast(`✅ User "${userName}" has been unblocked`, 'success');
    } else {
        const reason = prompt(`Block user "${userName}"?\\n\\nReason (Bad behavior, Inappropriate content, Spam, Other):`);
        if (reason === null) return;
        user.blocked = true;
        user.blockedReason = reason;
        showToast(`🚫 User "${userName}" has been blocked`, 'warning');
    }
    
    // Update user in DataManager
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
        users[userIndex] = user;
        localStorage.setItem('usersData', JSON.stringify(users));
    }
    
    loadAdminUsersTable();
}

function refreshAdminData() {
    loadAdminGamesTable();
    loadAdminUsersTable();
    loadAnalytics();
    loadActivityLog();
    showToast('🔄 Admin data refreshed', 'success');
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
    
    // Find and activate the corresponding menu item
    const menuItem = document.querySelector(`.admin-menu-item[onclick*="${tab}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }

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
