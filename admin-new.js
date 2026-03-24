// ============================================
// PROFESSIONAL ADMIN DASHBOARD - COMPLETE REWRITE
// ============================================

// Global State Management
class AdminPanel {
    constructor() {
        this.state = {
            currentTab: 'games',
            games: [],
            users: [],
            analytics: null,
            theme: null,
            backgroundImages: [],
            isLoading: false,
            notifications: [],
            currentEditingGame: null,
            currentEditingUser: null
        };
        
        this.firebase = null;
        this.database = null;
        this.backgroundShuffleInterval = null;
        
        this.init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
        try {
            console.log('🚀 Initializing Professional Admin Panel...');
            
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup UI
            this.setupUI();
            
            // Apply device optimizations
            this.applyDeviceOptimizations();
            
            console.log('✅ Admin Panel initialized successfully');
            this.showNotification('Admin Panel loaded successfully', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize admin panel:', error);
            this.showNotification('Failed to load admin panel', 'error');
        }
    }
    
    async initializeFirebase() {
        try {
            if (typeof firebase !== 'undefined') {
                this.firebase = firebase;
                this.database = firebase.database();
                console.log('✅ Firebase initialized successfully');
            } else {
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            // Fallback to localStorage only
            this.showNotification('Using offline mode - Firebase unavailable', 'warning');
        }
    }
    
    async loadInitialData() {
        this.setLoading(true);
        
        try {
            // Load games
            await this.loadGames();
            
            // Load users
            await this.loadUsers();
            
            // Load theme
            await this.loadTheme();
            
            // Load background images
            await this.loadBackgroundImages();
            
            // Load analytics
            await this.loadAnalytics();
            
            // Update all UI sections
            this.updateAllSections();
            
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            this.showNotification('Error loading data', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // ============================================
    // DATA MANAGEMENT
    // ============================================
    
    async loadGames() {
        try {
            if (typeof DataManager !== 'undefined') {
                this.state.games = DataManager.getGames();
                console.log(`📊 Loaded ${this.state.games.length} games`);
            } else {
                // Fallback data
                this.state.games = this.getDefaultGames();
                console.log('📊 Using default games data');
            }
        } catch (error) {
            console.error('❌ Error loading games:', error);
            this.state.games = [];
        }
    }
    
    async loadUsers() {
        try {
            if (typeof DataManager !== 'undefined') {
                this.state.users = DataManager.getUsers();
                console.log(`👥 Loaded ${this.state.users.length} users`);
            } else {
                this.state.users = this.getDefaultUsers();
                console.log('👥 Using default users data');
            }
        } catch (error) {
            console.error('❌ Error loading users:', error);
            this.state.users = [];
        }
    }
    
    async loadTheme() {
        try {
            if (typeof DataManager !== 'undefined') {
                this.state.theme = DataManager.getTheme();
                this.applyThemeToUI();
                console.log('🎨 Theme loaded and applied');
            }
        } catch (error) {
            console.error('❌ Error loading theme:', error);
        }
    }
    
    async loadBackgroundImages() {
        try {
            if (typeof DataManager !== 'undefined') {
                this.state.backgroundImages = DataManager.getBackgroundImages();
                this.setupBackgroundControls();
                console.log(`🖼️ Loaded ${this.state.backgroundImages.length} background images`);
            }
        } catch (error) {
            console.error('❌ Error loading background images:', error);
        }
    }
    
    async loadAnalytics() {
        try {
            if (typeof DataManager !== 'undefined') {
                this.state.analytics = DataManager.getAnalytics();
                this.updateAnalyticsDisplay();
                console.log('📈 Analytics loaded');
            }
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
        }
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.admin-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.target.closest('.admin-menu-item').dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Theme controls
        this.setupThemeEventListeners();
        
        // Background controls
        this.setupBackgroundEventListeners();
        
        // Form submissions
        this.setupFormListeners();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Window events
        window.addEventListener('resize', () => this.applyDeviceOptimizations());
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    setupThemeEventListeners() {
        const colorInputs = ['bgColor', 'accentColor', 'glassColor'];
        const textInputs = ['bgColorText', 'accentColorText', 'glassColorText'];
        
        colorInputs.forEach((id, index) => {
            const input = document.getElementById(id);
            const textInput = document.getElementById(textInputs[index]);
            
            if (input && textInput) {
                input.addEventListener('input', (e) => {
                    textInput.value = e.target.value;
                    this.updateTheme();
                });
                
                textInput.addEventListener('input', (e) => {
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        input.value = e.target.value;
                        this.updateTheme();
                    }
                });
            }
        });
    }
    
    setupBackgroundEventListeners() {
        const fileInput = document.getElementById('backgroundImageUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleBackgroundUpload(e));
        }
        
        const autoShuffleToggle = document.getElementById('autoShuffleToggle');
        if (autoShuffleToggle) {
            autoShuffleToggle.addEventListener('change', (e) => this.toggleAutoShuffle(e.target.checked));
        }
    }
    
    setupFormListeners() {
        // Add game form
        const addGameForm = document.getElementById('addGameForm');
        if (addGameForm) {
            addGameForm.addEventListener('submit', (e) => this.handleAddGame(e));
        }
        
        // Edit game form
        const editGameForm = document.getElementById('editGameForm');
        if (editGameForm) {
            editGameForm.addEventListener('submit', (e) => this.handleEditGame(e));
        }
        
        // Add user form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAllChanges();
            }
            
            // Ctrl/Cmd + R to refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // ============================================
    // UI MANAGEMENT
    // ============================================
    
    switchTab(tabName) {
        try {
            console.log(`🔄 Switching to ${tabName} tab`);
            
            // Update state
            this.state.currentTab = tabName;
            
            // Update menu items
            document.querySelectorAll('.admin-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`)?.classList.add('active');
            
            // Load tab-specific data
            this.loadTabData(tabName);
            
            console.log(`✅ Switched to ${tabName} tab`);
            
        } catch (error) {
            console.error('❌ Error switching tab:', error);
            this.showNotification('Error switching tab', 'error');
        }
    }
    
    loadTabData(tabName) {
        switch (tabName) {
            case 'games':
                this.updateGamesTable();
                break;
            case 'theme':
                this.updateThemePreview();
                break;
            case 'analytics':
                this.updateAnalyticsDisplay();
                break;
            case 'users':
                this.updateUsersTable();
                break;
        }
    }
    
    updateAllSections() {
        this.updateGamesTable();
        this.updateUsersTable();
        this.updateAnalyticsDisplay();
        this.updateThemePreview();
        this.updateActivityLog();
    }
    
    // ============================================
    // GAMES MANAGEMENT
    // ============================================
    
    updateGamesTable() {
        const tableBody = document.getElementById('adminGamesTable');
        if (!tableBody) return;
        
        try {
            tableBody.innerHTML = '';
            
            if (this.state.games.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <div class="empty-icon">🎮</div>
                            <div class="empty-text">No games found</div>
                            <button class="btn btn-primary" onclick="adminPanel.openAddGameModal()">
                                Add Your First Game
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }
            
            this.state.games.forEach(game => {
                const row = this.createGameRow(game);
                tableBody.appendChild(row);
            });
            
            console.log(`✅ Updated games table with ${this.state.games.length} games`);
            
        } catch (error) {
            console.error('❌ Error updating games table:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="error-state">
                        <div class="error-icon">❌</div>
                        <div class="error-text">Error loading games</div>
                        <button class="btn btn-secondary" onclick="adminPanel.updateGamesTable()">
                            Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    }
    
    createGameRow(game) {
        const row = document.createElement('tr');
        row.className = 'game-row';
        row.innerHTML = `
            <td class="game-title-cell">
                <div class="game-info">
                    <img src="${game.imageUrl}" alt="${game.title}" class="game-thumbnail" 
                         onerror="this.src='https://via.placeholder.com/40x40?text=${encodeURIComponent(game.title)}'">
                    <div class="game-details">
                        <div class="game-name">${game.title}</div>
                        <div class="game-meta">⭐ ${game.rating} • ${game.downloads || 0} downloads</div>
                    </div>
                </div>
            </td>
            <td class="category-cell">
                <span class="category-badge ${game.category}">${this.capitalizeFirst(game.category)}</span>
            </td>
            <td class="price-cell">
                <span class="price-tag ${game.price === 0 ? 'free' : 'paid'}">
                    ${game.price === 0 ? 'FREE' : '$' + game.price.toFixed(2)}
                </span>
            </td>
            <td class="downloads-cell">
                <div class="downloads-count">${game.downloads || 0}</div>
            </td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="adminPanel.editGame(${game.id})" title="Edit Game">
                        ✏️
                    </button>
                    <button class="btn-icon btn-duplicate" onclick="adminPanel.duplicateGame(${game.id})" title="Duplicate Game">
                        📋
                    </button>
                    <button class="btn-icon btn-delete" onclick="adminPanel.deleteGame(${game.id})" title="Delete Game">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        return row;
    }
    
    async handleAddGame(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const gameData = {
                id: Date.now(),
                title: formData.get('title'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                rating: parseFloat(formData.get('rating')),
                downloads: 0,
                description: formData.get('description'),
                imageUrl: formData.get('imageUrl') || `https://via.placeholder.com/150x150?text=${encodeURIComponent(formData.get('title'))}`,
                releaseDate: new Date().toISOString().split('T')[0]
            };
            
            // Validate
            if (!gameData.title || !gameData.category) {
                throw new Error('Title and category are required');
            }
            
            // Add to state
            this.state.games.push(gameData);
            
            // Save to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveGames(this.state.games);
            }
            
            // Update UI
            this.updateGamesTable();
            
            // Close modal
            this.closeModal('addGameModal');
            
            // Reset form
            event.target.reset();
            
            this.showNotification('Game added successfully', 'success');
            console.log('✅ Game added:', gameData);
            
        } catch (error) {
            console.error('❌ Error adding game:', error);
            this.showNotification(error.message || 'Error adding game', 'error');
        }
    }
    
    async handleEditGame(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const gameId = parseInt(formData.get('gameId'));
            const gameIndex = this.state.games.findIndex(g => g.id === gameId);
            
            if (gameIndex === -1) {
                throw new Error('Game not found');
            }
            
            // Update game data
            this.state.games[gameIndex] = {
                ...this.state.games[gameIndex],
                title: formData.get('title'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                rating: parseFloat(formData.get('rating')),
                description: formData.get('description'),
                imageUrl: formData.get('imageUrl')
            };
            
            // Save to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveGames(this.state.games);
            }
            
            // Update UI
            this.updateGamesTable();
            
            // Close modal
            this.closeModal('editGameModal');
            
            this.showNotification('Game updated successfully', 'success');
            console.log('✅ Game updated:', this.state.games[gameIndex]);
            
        } catch (error) {
            console.error('❌ Error editing game:', error);
            this.showNotification(error.message || 'Error editing game', 'error');
        }
    }
    
    editGame(gameId) {
        const game = this.state.games.find(g => g.id === gameId);
        if (!game) {
            this.showNotification('Game not found', 'error');
            return;
        }
        
        // Populate edit form
        const form = document.getElementById('editGameForm');
        if (form) {
            form.gameId.value = game.id;
            form.title.value = game.title;
            form.category.value = game.category;
            form.price.value = game.price;
            form.rating.value = game.rating;
            form.description.value = game.description || '';
            form.imageUrl.value = game.imageUrl;
        }
        
        // Open modal
        this.openModal('editGameModal');
    }
    
    duplicateGame(gameId) {
        const game = this.state.games.find(g => g.id === gameId);
        if (!game) {
            this.showNotification('Game not found', 'error');
            return;
        }
        
        const duplicatedGame = {
            ...game,
            id: Date.now(),
            title: game.title + ' (Copy)',
            downloads: 0
        };
        
        this.state.games.push(duplicatedGame);
        
        if (typeof DataManager !== 'undefined') {
            DataManager.saveGames(this.state.games);
        }
        
        this.updateGamesTable();
        this.showNotification('Game duplicated successfully', 'success');
    }
    
    async deleteGame(gameId) {
        const game = this.state.games.find(g => g.id === gameId);
        if (!game) {
            this.showNotification('Game not found', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${game.title}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            // Remove from state
            this.state.games = this.state.games.filter(g => g.id !== gameId);
            
            // Save to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveGames(this.state.games);
            }
            
            // Update UI
            this.updateGamesTable();
            
            this.showNotification('Game deleted successfully', 'success');
            console.log('✅ Game deleted:', game);
            
        } catch (error) {
            console.error('❌ Error deleting game:', error);
            this.showNotification('Error deleting game', 'error');
        }
    }
    
    // ============================================
    // THEME MANAGEMENT
    // ============================================
    
    updateTheme() {
        try {
            const bgColor = document.getElementById('bgColor')?.value || '#0d1b2a';
            const accentColor = document.getElementById('accentColor')?.value || '#ff6b35';
            const glassColor = document.getElementById('glassColor')?.value || '#3b5998';
            
            const theme = {
                bgColor,
                accentColor,
                glassColor
            };
            
            // Apply to CSS variables
            document.documentElement.style.setProperty('--primary-bg', bgColor);
            document.documentElement.style.setProperty('--accent-color', accentColor);
            document.documentElement.style.setProperty('--glass-color', glassColor);
            
            // Update preview
            this.updateThemePreview();
            
            // Save to state
            this.state.theme = theme;
            
            // Save to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveTheme(theme);
            }
            
            console.log('✅ Theme updated:', theme);
            
        } catch (error) {
            console.error('❌ Error updating theme:', error);
        }
    }
    
    applyThemeToUI() {
        if (!this.state.theme) return;
        
        const { bgColor, accentColor, glassColor } = this.state.theme;
        
        document.documentElement.style.setProperty('--primary-bg', bgColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.documentElement.style.setProperty('--glass-color', glassColor);
        
        // Update form inputs
        const bgColorInput = document.getElementById('bgColor');
        const accentColorInput = document.getElementById('accentColor');
        const glassColorInput = document.getElementById('glassColor');
        
        if (bgColorInput) bgColorInput.value = bgColor;
        if (accentColorInput) accentColorInput.value = accentColor;
        if (glassColorInput) glassColorInput.value = glassColor;
        
        // Update text inputs
        const bgColorText = document.getElementById('bgColorText');
        const accentColorText = document.getElementById('accentColorText');
        const glassColorText = document.getElementById('glassColorText');
        
        if (bgColorText) bgColorText.value = bgColor;
        if (accentColorText) accentColorText.value = accentColor;
        if (glassColorText) glassColorText.value = glassColor;
    }
    
    updateThemePreview() {
        const preview = document.getElementById('themePreview');
        if (!preview) return;
        
        const bgColor = document.getElementById('bgColor')?.value || '#0d1b2a';
        const accentColor = document.getElementById('accentColor')?.value || '#ff6b35';
        
        const previewHero = preview.querySelector('.preview-hero');
        if (previewHero) {
            previewHero.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${accentColor}33 100%)`;
        }
    }
    
    // ============================================
    // BACKGROUND MANAGEMENT
    // ============================================
    
    setupBackgroundControls() {
        if (this.state.backgroundImages.length > 0) {
            this.displayUploadedImages();
            this.updateBackgroundPreview();
            
            // Start auto-shuffle if enabled
            const autoShuffleEnabled = document.getElementById('autoShuffleToggle')?.checked;
            if (autoShuffleEnabled && this.state.backgroundImages.length > 1) {
                this.startBackgroundShuffle();
            }
        }
    }
    
    async handleBackgroundUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            this.showNotification('Please select images to upload', 'warning');
            return;
        }
        
        try {
            this.setLoading(true);
            const newImages = [];
            
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    const imageUrl = await this.fileToDataUrl(file);
                    newImages.push(imageUrl);
                }
            }
            
            if (newImages.length === 0) {
                throw new Error('No valid images found');
            }
            
            // Add to state
            this.state.backgroundImages = [...this.state.backgroundImages, ...newImages];
            
            // Save to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveBackgroundImages(this.state.backgroundImages);
            }
            
            // Update UI
            this.displayUploadedImages();
            this.updateBackgroundPreview();
            
            // Show preview container
            const previewContainer = document.getElementById('uploadedImagesPreview');
            if (previewContainer) {
                previewContainer.style.display = 'block';
            }
            
            this.showNotification(`${newImages.length} images uploaded successfully`, 'success');
            console.log(`✅ Uploaded ${newImages.length} background images`);
            
        } catch (error) {
            console.error('❌ Error uploading backgrounds:', error);
            this.showNotification('Error uploading images', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    displayUploadedImages() {
        const grid = document.getElementById('imagesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.state.backgroundImages.forEach((imageUrl, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'uploaded-image-container';
            imageContainer.innerHTML = `
                <img src="${imageUrl}" alt="Background ${index + 1}" class="uploaded-image">
                <div class="image-overlay">
                    <button class="btn-icon btn-select" onclick="adminPanel.selectBackground(${index})" title="Select">
                        ✓
                    </button>
                    <button class="btn-icon btn-delete" onclick="adminPanel.deleteBackground(${index})" title="Delete">
                        ✕
                    </button>
                </div>
            `;
            grid.appendChild(imageContainer);
        });
    }
    
    selectBackground(index) {
        this.updateBackgroundPreview(index);
        this.showNotification('Background selected', 'info');
    }
    
    deleteBackground(index) {
        if (!confirm('Are you sure you want to delete this background image?')) {
            return;
        }
        
        this.state.backgroundImages.splice(index, 1);
        
        if (typeof DataManager !== 'undefined') {
            DataManager.saveBackgroundImages(this.state.backgroundImages);
        }
        
        this.displayUploadedImages();
        this.updateBackgroundPreview();
        
        this.showNotification('Background deleted', 'success');
    }
    
    updateBackgroundPreview(index = 0) {
        const previewBox = document.getElementById('bgPreviewBox');
        if (!previewBox || this.state.backgroundImages.length === 0) return;
        
        const imageUrl = this.state.backgroundImages[index];
        previewBox.style.backgroundImage = `url('${imageUrl}')`;
        previewBox.style.backgroundSize = 'cover';
        previewBox.style.backgroundPosition = 'center';
    }
    
    toggleAutoShuffle(enabled) {
        if (enabled && this.state.backgroundImages.length > 1) {
            this.startBackgroundShuffle();
        } else {
            this.stopBackgroundShuffle();
        }
        
        // Save preference
        if (typeof DataManager !== 'undefined') {
            DataManager.setAutoShuffle(enabled);
        }
    }
    
    startBackgroundShuffle() {
        this.stopBackgroundShuffle(); // Clear any existing interval
        
        let currentIndex = 0;
        this.backgroundShuffleInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % this.state.backgroundImages.length;
            this.updateBackgroundPreview(currentIndex);
        }, 4000);
        
        console.log('✅ Background shuffle started');
    }
    
    stopBackgroundShuffle() {
        if (this.backgroundShuffleInterval) {
            clearInterval(this.backgroundShuffleInterval);
            this.backgroundShuffleInterval = null;
            console.log('⏹️ Background shuffle stopped');
        }
    }
    
    // ============================================
    // USERS MANAGEMENT
    // ============================================
    
    updateUsersTable() {
        const tableBody = document.getElementById('adminUsersTable');
        if (!tableBody) return;
        
        try {
            tableBody.innerHTML = '';
            
            if (this.state.users.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-icon">👥</div>
                            <div class="empty-text">No users found</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            this.state.users.forEach(user => {
                const row = this.createUserRow(user);
                tableBody.appendChild(row);
            });
            
            console.log(`✅ Updated users table with ${this.state.users.length} users`);
            
        } catch (error) {
            console.error('❌ Error updating users table:', error);
        }
    }
    
    createUserRow(user) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="user-name">${user.name || user.email}</td>
            <td class="user-email">${user.email}</td>
            <td class="user-subscription">
                <span class="subscription-badge ${user.subscription || 'none'}">
                    ${this.capitalizeFirst(user.subscription || 'none')}
                </span>
            </td>
            <td class="user-downloads">${user.downloads || 0}</td>
            <td class="user-status">
                <span class="status-badge ${user.status || 'active'}">
                    ${this.capitalizeFirst(user.status || 'active')}
                </span>
            </td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="adminPanel.editUser(${user.id})" title="Edit User">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="adminPanel.deleteUser(${user.id})" title="Delete User">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        return row;
    }
    
    // ============================================
    // ANALYTICS
    // ============================================
    
    updateAnalyticsDisplay() {
        const container = document.getElementById('analyticsContainer');
        if (!container) return;
        
        try {
            const analytics = this.state.analytics || this.generateDefaultAnalytics();
            
            container.innerHTML = `
                <div class="analytics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-value">${analytics.totalUsers || 0}</div>
                        <div class="metric-label">Total Users</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">🎮</div>
                        <div class="metric-value">${analytics.totalGames || this.state.games.length}</div>
                        <div class="metric-label">Total Games</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">⬇️</div>
                        <div class="metric-value">${analytics.totalDownloads || 0}</div>
                        <div class="metric-label">Total Downloads</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">💰</div>
                        <div class="metric-value">$${(analytics.totalRevenue || 0).toFixed(2)}</div>
                        <div class="metric-label">Total Revenue</div>
                    </div>
                </div>
            `;
            
            console.log('✅ Analytics display updated');
            
        } catch (error) {
            console.error('❌ Error updating analytics:', error);
        }
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        const loadingElements = document.querySelectorAll('.loading-overlay');
        loadingElements.forEach(element => {
            element.style.display = isLoading ? 'flex' : 'none';
        });
        
        // Update cursor
        document.body.style.cursor = isLoading ? 'wait' : 'default';
    }
    
    showNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        
        this.state.notifications.push(notification);
        this.displayNotification(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    }
    
    displayNotification(notification) {
        const container = document.getElementById('notificationsContainer') || this.createNotificationsContainer();
        
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.id = `notification-${notification.id}`;
        element.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close" onclick="adminPanel.removeNotification(${notification.id})">
                    ✕
                </button>
            </div>
        `;
        
        container.appendChild(element);
        
        // Animate in
        setTimeout(() => element.classList.add('show'), 10);
    }
    
    removeNotification(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => element.remove(), 300);
        }
        
        this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    }
    
    createNotificationsContainer() {
        const container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.classList.remove('modal-open');
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    applyDeviceOptimizations() {
        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        
        document.body.classList.toggle('mobile-device', isMobile);
        document.body.classList.toggle('tablet-device', isTablet);
        document.body.classList.toggle('desktop-device', !isMobile && !isTablet);
    }
    
    // ============================================
    // DEFAULT DATA
    // ============================================
    
    getDefaultGames() {
        return [
            {
                id: 1,
                title: "Space Adventure",
                category: "action",
                price: 9.99,
                rating: 4.5,
                downloads: 1500,
                description: "An exciting space exploration game",
                imageUrl: "https://via.placeholder.com/150x150?text=Space+Adventure",
                releaseDate: "2024-01-15"
            },
            {
                id: 2,
                title: "Puzzle Master",
                category: "puzzle",
                price: 0,
                rating: 4.2,
                downloads: 2300,
                description: "Challenging puzzle game",
                imageUrl: "https://via.placeholder.com/150x150?text=Puzzle+Master",
                releaseDate: "2024-02-20"
            }
        ];
    }
    
    getDefaultUsers() {
        return [
            {
                id: 1,
                name: "Admin User",
                email: "admin@smilegaming.com",
                subscription: "premium",
                downloads: 25,
                status: "active"
            },
            {
                id: 2,
                name: "Test User",
                email: "test@example.com",
                subscription: "free",
                downloads: 5,
                status: "active"
            }
        ];
    }
    
    generateDefaultAnalytics() {
        return {
            totalUsers: this.state.users.length,
            totalGames: this.state.games.length,
            totalDownloads: this.state.games.reduce((sum, game) => sum + (game.downloads || 0), 0),
            totalRevenue: this.state.games.reduce((sum, game) => sum + (game.price || 0), 0)
        };
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    
    cleanup() {
        this.stopBackgroundShuffle();
        console.log('🧹 Admin panel cleanup completed');
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    async refreshData() {
        console.log('🔄 Refreshing admin data...');
        await this.loadInitialData();
        this.showNotification('Data refreshed successfully', 'success');
    }
    
    async saveAllChanges() {
        try {
            this.setLoading(true);
            
            // Save all data to DataManager
            if (typeof DataManager !== 'undefined') {
                DataManager.saveGames(this.state.games);
                DataManager.saveUsers(this.state.users);
                DataManager.saveTheme(this.state.theme);
                DataManager.saveBackgroundImages(this.state.backgroundImages);
            }
            
            // Sync to Firebase if available
            if (this.database) {
                await this.syncToFirebase();
            }
            
            this.showNotification('All changes saved successfully', 'success');
            console.log('✅ All changes saved');
            
        } catch (error) {
            console.error('❌ Error saving changes:', error);
            this.showNotification('Error saving changes', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async syncToFirebase() {
        if (!this.database) return;
        
        const updates = {
            games: this.state.games,
            users: this.state.users,
            theme: this.state.theme,
            backgroundImages: this.state.backgroundImages
        };
        
        await this.database.ref('/').update(updates);
        console.log('✅ Data synced to Firebase');
    }
}

// ============================================
// INITIALIZATION
// ============================================

let adminPanel;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verify admin access
        await verifyAdminAccess();
        
        // Initialize admin panel
        adminPanel = new AdminPanel();
        
        // Make available globally
        window.adminPanel = adminPanel;
        
    } catch (error) {
        console.error('❌ Failed to initialize admin panel:', error);
        
        // Show error message
        document.body.innerHTML = `
            <div class="error-page">
                <div class="error-content">
                    <h1>❌ Admin Panel Error</h1>
                    <p>Failed to load the admin panel. Please try refreshing the page.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
});

// ============================================
// ADMIN ACCESS VERIFICATION
// ============================================

async function verifyAdminAccess() {
    const isAdminGranted = sessionStorage.getItem('adminAccessGranted') === 'true';
    
    if (!isAdminGranted) {
        const password = prompt('🔐 Enter Admin Password:');
        
        if (password === 'Ciontatenx83') {
            sessionStorage.setItem('adminAccessGranted', 'true');
            console.log('✅ Admin access granted');
        } else {
            alert('❌ Invalid password or access denied!');
            window.location.href = 'index.html';
            throw new Error('Admin access denied');
        }
    } else {
        console.log('✅ Admin access already granted');
    }
}

// ============================================
// GLOBAL FUNCTIONS (for onclick handlers)
// ============================================

function switchAdminTab(tab) {
    if (adminPanel) {
        adminPanel.switchTab(tab);
    }
}

function refreshAdminData() {
    if (adminPanel) {
        adminPanel.refreshData();
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminAccessGranted');
    window.location.href = 'index.html';
}

function openAddGameModal() {
    if (adminPanel) {
        adminPanel.openModal('addGameModal');
    }
}

function updateTheme() {
    if (adminPanel) {
        adminPanel.updateTheme();
    }
}

function handleBackgroundImageUpload() {
    // This will be handled by the event listener in AdminPanel
}

function toggleAutoShuffle() {
    if (adminPanel) {
        const enabled = document.getElementById('autoShuffleToggle')?.checked;
        adminPanel.toggleAutoShuffle(enabled);
    }
}

function saveBackgroundImages() {
    if (adminPanel) {
        adminPanel.showNotification('Background images saved', 'success');
    }
}

function saveTheme() {
    if (adminPanel) {
        adminPanel.showNotification('Theme saved', 'success');
    }
}

function resetTheme() {
    if (adminPanel) {
        const defaultTheme = {
            bgColor: '#0d1b2a',
            accentColor: '#ff6b35',
            glassColor: '#3b5998'
        };
        
        adminPanel.state.theme = defaultTheme;
        adminPanel.applyThemeToUI();
        adminPanel.updateTheme();
        
        adminPanel.showNotification('Theme reset to default', 'success');
    }
}
