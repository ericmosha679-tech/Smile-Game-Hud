// ============================================
// DATA MANAGEMENT WITH LOCALSTORAGE
// ============================================

let database = null;

function initFirebaseDatabase() {
    if (window.firebase && firebase.database) {
        database = firebase.database();
    }
}

const DataManager = {
    // Initialize localStorage with default data
    init() {
        initFirebaseDatabase();
        if (!localStorage.getItem('gamesData')) {
            this.initializeDefaultGames();
        }
        if (!localStorage.getItem('usersData')) {
            localStorage.setItem('usersData', JSON.stringify([]));
        }
        if (!localStorage.getItem('commentsData')) {
            localStorage.setItem('commentsData', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
        if (!localStorage.getItem('themeData')) {
            this.initializeDefaultTheme();
        }
    },

    // Initialize with 12 default games covering all categories
    initializeDefaultGames() {
        const defaultGames = [
            {
                id: 1,
                title: 'Blaze Warriors',
                category: 'action',
                price: 4.99,
                rating: 4.8,
                downloads: 15420,
                releaseDate: '2024-01-15',
                description: 'An intense action game with fast-paced combat and stunning graphics. Fight through waves of enemies in this adrenaline-pumping adventure.',
                imageUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop'
            },
            {
                id: 2,
                title: 'Quest of Ages',
                category: 'rpg',
                price: 7.99,
                rating: 4.6,
                downloads: 12350,
                releaseDate: '2023-11-20',
                description: 'An epic RPG with a massive world, deep character customization, and an engaging story. Create your legend in this immersive fantasy world.',
                imageUrl: 'https://images.unsplash.com/photo-1538481143235-25879b10029f?w=400&h=300&fit=crop'
            },
            {
                id: 3,
                title: 'Puzzle Master',
                category: 'puzzle',
                price: 2.99,
                rating: 4.4,
                downloads: 28900,
                releaseDate: '2024-02-10',
                description: 'Challenging puzzles that will test your brain. Over 500 levels of mind-bending gameplay with beautiful minimalist design.',
                imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop'
            },
            {
                id: 4,
                title: 'Tactics Empire',
                category: 'strategy',
                price: 5.99,
                rating: 4.7,
                downloads: 9870,
                releaseDate: '2023-09-05',
                description: 'Build your empire and lead your troops to victory. Strategic gameplay with complex mechanics and engaging AI opponents.',
                imageUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop'
            },
            {
                id: 5,
                title: 'Goal Master',
                category: 'sports',
                price: 3.99,
                rating: 4.5,
                downloads: 18760,
                releaseDate: '2024-03-01',
                description: 'Experience the thrill of competitive sports. Play as your favorite teams and compete against players worldwide.',
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=300&fit=crop'
            },
            {
                id: 6,
                title: 'Lost Dimensions',
                category: 'adventure',
                price: 6.99,
                rating: 4.7,
                downloads: 14560,
                releaseDate: '2023-12-18',
                description: 'Embark on an epic adventure across mysterious lands. Discover secrets, solve puzzles, and uncover the truth about reality.',
                imageUrl: 'https://images.unsplash.com/photo-1538481143235-25879b10029f?w=400&h=300&fit=crop'
            },
            {
                id: 7,
                title: 'Flight Sim Pro',
                category: 'simulation',
                price: 8.99,
                rating: 4.9,
                downloads: 7234,
                releaseDate: '2023-08-22',
                description: 'The most realistic flight simulator. Master various aircraft and fly across the world with stunning visuals and accurate physics.',
                imageUrl: 'https://images.unsplash.com/photo-1579373903362-469c39944d96?w=400&h=300&fit=crop'
            },
            {
                id: 8,
                title: 'Zen Garden',
                category: 'casual',
                price: 1.99,
                rating: 4.6,
                downloads: 35620,
                releaseDate: '2024-02-28',
                description: 'A relaxing casual game perfect for unwinding. Beautiful graphics and soothing music create the perfect gaming experience.',
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=300&fit=crop'
            },
            {
                id: 9,
                title: 'Pixel Dreams',
                category: 'indie',
                price: 2.99,
                rating: 4.8,
                downloads: 22100,
                releaseDate: '2024-01-08',
                description: 'An indie masterpiece with unique gameplay and charming pixel art. A heartwarming story wrapped in engaging mechanics.',
                imageUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop'
            },
            {
                id: 10,
                title: 'Arena Squad',
                category: 'multiplayer',
                price: 0.00,
                rating: 4.7,
                downloads: 45230,
                releaseDate: '2024-03-15',
                description: 'Team up with friends in this multiplayer action game. Fast-paced matches with competitive rankings and seasonal rewards.',
                imageUrl: 'https://images.unsplash.com/photo-1538481143235-25879b10029f?w=400&h=300&fit=crop'
            },
            {
                id: 11,
                title: 'Shadow Manor',
                category: 'horror',
                price: 4.99,
                rating: 4.4,
                downloads: 11230,
                releaseDate: '2023-10-31',
                description: 'A terrifying horror experience. Unravel dark mysteries in an atmospheric haunted mansion with immersive sound design.',
                imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop'
            },
            {
                id: 12,
                title: 'Champion\'s Peak',
                category: 'action',
                price: 3.99,
                rating: 4.5,
                downloads: 19876,
                releaseDate: '2024-03-10',
                description: 'Climb to the top in this competitive action platformer. Challenging levels, smooth controls, and endless fun await.',
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=300&fit=crop'
            }
        ];

        localStorage.setItem('gamesData', JSON.stringify(defaultGames));
    },

    // Initialize default theme
    initializeDefaultTheme() {
        const defaultTheme = {
            bgColor: '#0d1b2a',
            accentColor: '#ff6b35',
            glassColor: '#3b5998'
        };
        localStorage.setItem('themeData', JSON.stringify(defaultTheme));
    },

    // ============ GAMES OPERATIONS ============
    getGames() {
        const games = localStorage.getItem('gamesData');
        return games ? JSON.parse(games) : [];
    },

    getGameById(id) {
        const games = this.getGames();
        return games.find(game => game.id === parseInt(id));
    },

    addGame(game) {
        const games = this.getGames();
        game.id = Math.max(...games.map(g => g.id), 0) + 1;
        game.downloads = 0;
        games.push(game);
        localStorage.setItem('gamesData', JSON.stringify(games));
        // Also save to Firebase
        if (database) {
            database.ref('games/' + game.id).set(game).catch(error => {
                console.error('Error saving to Firebase:', error);
            });
        }
        this.addActivity(`Added new game: ${game.title}`);
        return game;
    },

    updateGame(id, updatedGame) {
        const games = this.getGames();
        const index = games.findIndex(g => g.id === parseInt(id));
        if (index !== -1) {
            games[index] = { ...games[index], ...updatedGame, id: parseInt(id) };
            localStorage.setItem('gamesData', JSON.stringify(games));
            // Save to Firebase
            if (database) {
                database.ref('games/' + id).set(games[index]).catch(error => {
                    console.error('Error updating Firebase:', error);
                });
            }
            this.addActivity(`Updated game: ${updatedGame.title}`);
            return games[index];
        }
        return null;
    },

    deleteGame(id) {
        const games = this.getGames();
        const gameTitle = games.find(g => g.id === parseInt(id))?.title;
        const filtered = games.filter(g => g.id !== parseInt(id));
        localStorage.setItem('gamesData', JSON.stringify(filtered));
        // Delete from Firebase
        if (database) {
            database.ref('games/' + id).remove().catch(error => {
                console.error('Error deleting from Firebase:', error);
            });
        }
        this.addActivity(`Deleted game: ${gameTitle}`);
    },

    increaseDownloadCount(id) {
        const games = this.getGames();
        const game = games.find(g => g.id === parseInt(id));
        if (game) {
            game.downloads = (game.downloads || 0) + 1;
            localStorage.setItem('gamesData', JSON.stringify(games));
        }
    },

    // ============ USERS OPERATIONS ============
    getUsers() {
        const users = localStorage.getItem('usersData');
        return users ? JSON.parse(users) : [];
    },

    addUser(user) {
        const users = this.getUsers();
        user.id = Math.max(...users.map(u => u.id), 0) + 1;
        user.createdAt = new Date().toLocaleDateString();
        user.subscription = 'free';
        user.downloads = [];
        user.wishlist = [];
        user.trialUsed = false;
        users.push(user);
        localStorage.setItem('usersData', JSON.stringify(users));
        // Save to Firebase
        database.ref('users/' + user.id).set(user).catch(error => {
            console.error('Error saving user to Firebase:', error);
        });
        this.addActivity(`New user registered: ${user.name}`);
        return user;
    },

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('usersData', JSON.stringify(users));
            // Save to Firebase
            database.ref('users/' + userId).set(users[index]).catch(error => {
                console.error('Error updating user in Firebase:', error);
            });
            return users[index];
        }
        return null;
    },

    addDownloadToUser(userId, gameId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.downloads) user.downloads = [];
            if (!user.downloads.includes(gameId)) {
                user.downloads.push(gameId);
                localStorage.setItem('usersData', JSON.stringify(users));
                const game = this.getGameById(gameId);
                this.addActivity(`User downloaded: ${game?.title}`);
            }
        }
    },

    // ============ COMMENTS OPERATIONS ============
    getComments() {
        const comments = localStorage.getItem('commentsData');
        return comments ? JSON.parse(comments) : [];
    },

    getGameComments(gameId) {
        const comments = this.getComments();
        return comments.filter(c => c.gameId === parseInt(gameId));
    },

    addComment(comment) {
        const comments = this.getComments();
        comment.id = Math.max(...comments.map(c => c.id), 0) + 1;
        comment.createdAt = new Date().toLocaleString();
        comments.push(comment);
        localStorage.setItem('commentsData', JSON.stringify(comments));
        // Save to Firebase
        database.ref('comments/' + comment.id).set(comment).catch(error => {
            console.error('Error saving comment to Firebase:', error);
        });
        this.addActivity(`New comment on game ID ${comment.gameId}`);
        return comment;
    },

    deleteComment(commentId) {
        const comments = this.getComments();
        const filtered = comments.filter(c => c.id !== parseInt(commentId));
        localStorage.setItem('commentsData', JSON.stringify(filtered));
        // Delete from Firebase
        database.ref('comments/' + commentId).remove().catch(error => {
            console.error('Error deleting comment from Firebase:', error);
        });
    },

    getUserComments(userId) {
        const comments = this.getComments();
        return comments.filter(c => c.userId === userId);
    },

    // ============ ACTIVITY LOG OPERATIONS ============
    addActivity(message) {
        let activities = localStorage.getItem('activitiesData');
        activities = activities ? JSON.parse(activities) : [];
        
        const activity = {
            id: Math.max(...activities.map(a => a.id || 0), 0) + 1,
            message: message,
            timestamp: new Date().toLocaleString()
        };
        
        activities.unshift(activity);
        if (activities.length > 20) activities = activities.slice(0, 20);
        
        localStorage.setItem('activitiesData', JSON.stringify(activities));
    },

    getActivities() {
        const activities = localStorage.getItem('activitiesData');
        return activities ? JSON.parse(activities) : [];
    },

    // ============ THEME OPERATIONS ============
    getTheme() {
        const theme = localStorage.getItem('themeData');
        return theme ? JSON.parse(theme) : {
            bgColor: '#0d1b2a',
            accentColor: '#ff6b35',
            glassColor: '#3b5998'
        };
    },

    setTheme(theme) {
        localStorage.setItem('themeData', JSON.stringify(theme));
        // Save to Firebase
        if (database) {
            database.ref('theme').set(theme).catch(error => {
                console.error('Error saving theme to Firebase:', error);
            });
        }
        this.applyTheme(theme);
        this.addActivity('Theme updated');
    },

    applyTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-bg', theme.bgColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        root.style.setProperty('--glass-color', theme.glassColor);
    },

    // ============ SUBSCRIPTION OPERATIONS ============
    updateUserSubscription(userId, subscription) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user) return null;

        // Check if user already used free trial
        if (subscription === 'free' && user.trialUsed) {
            return { error: 'Free trial has already been used and cannot be used again' };
        }

        const subscriptionData = {
            tier: subscription,
            startDate: new Date().toISOString(),
            expiryDate: null,
            trialUsed: subscription === 'free' ? true : false,
            gamesAccessed: 0,
            maxGames: this.getMaxGamesForTier(subscription)
        };

        // Set expiry date based on subscription tier
        if (subscription === 'free') {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            subscriptionData.expiryDate = expiryDate.toISOString();
        } else {
            // Premium and Pro auto-renew, set monthly expiry
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            subscriptionData.expiryDate = expiryDate.toISOString();
        }

        return this.updateUser(userId, { subscription: subscriptionData });
    },

    getMaxGamesForTier(tier) {
        switch(tier) {
            case 'free': return 3;
            case 'premium': return 6;
            case 'pro': return 10;
            default: return 0;
        }
    },

    canAccessGame(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user || !user.subscription) return false;

        const subscription = user.subscription;
        
        // Check if subscription has expired
        if (subscription.expiryDate) {
            const expiryDate = new Date(subscription.expiryDate);
            if (new Date() > expiryDate) {
                return false;
            }
        }

        // Check if user has reached game limit
        if (subscription.gamesAccessed >= subscription.maxGames) {
            return false;
        }

        return true;
    },

    addGameAccess(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user && user.subscription) {
            user.subscription.gamesAccessed = (user.subscription.gamesAccessed || 0) + 1;
            localStorage.setItem('usersData', JSON.stringify(users));
        }
    },

    getUserSubscriptionInfo(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user || !user.subscription) {
            return {
                tier: 'none',
                maxGames: 0,
                gamesAccessed: 0,
                remaining: 0,
                status: 'inactive'
            };
        }

        const subscription = user.subscription;
        
        // Handle both old format (string) and new format (object)
        if (typeof subscription === 'string') {
            // Old format - convert to new format
            const maxGames = this.getMaxGamesForTier(subscription);
            return {
                tier: subscription,
                maxGames: maxGames,
                gamesAccessed: 0,
                remaining: maxGames,
                status: 'active',
                expiryDate: null,
                trialUsed: false
            };
        }
        
        // New format (object)
        const remaining = Math.max(0, subscription.maxGames - subscription.gamesAccessed);
        
        // Check if expired
        let status = 'active';
        if (subscription.expiryDate) {
            const expiryDate = new Date(subscription.expiryDate);
            if (new Date() > expiryDate) {
                status = 'expired';
            }
        }

        return {
            tier: subscription.tier || 'none',
            maxGames: subscription.maxGames || 0,
            gamesAccessed: subscription.gamesAccessed || 0,
            remaining: remaining,
            status: status,
            expiryDate: subscription.expiryDate,
            trialUsed: subscription.trialUsed
        };
    },

    // ============ WISHLIST OPERATIONS ============
    isGameInWishlist(userId, gameId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user || !user.wishlist) return false;
        return user.wishlist.includes(parseInt(gameId));
    },

    addToWishlist(userId, gameId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.wishlist) user.wishlist = [];
            if (!user.wishlist.includes(parseInt(gameId))) {
                user.wishlist.push(parseInt(gameId));
                localStorage.setItem('usersData', JSON.stringify(users));
                const game = this.getGameById(gameId);
                this.addActivity(`User added to wishlist: ${game?.title}`);
            }
        }
    },

    removeFromWishlist(userId, gameId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user && user.wishlist) {
            user.wishlist = user.wishlist.filter(id => id !== parseInt(gameId));
            localStorage.setItem('usersData', JSON.stringify(users));
            const game = this.getGameById(gameId);
            this.addActivity(`User removed from wishlist: ${game?.title}`);
        }
    },

    getUserWishlist(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user || !user.wishlist || user.wishlist.length === 0) return [];
        return user.wishlist.map(gameId => this.getGameById(gameId)).filter(game => game !== undefined);
    },

    // ============ BACKGROUND IMAGE OPERATIONS ============
    getBackgroundImages() {
        const images = localStorage.getItem('backgroundImages');
        return images ? JSON.parse(images) : [];
    },

    saveBackgroundImages(images) {
        localStorage.setItem('backgroundImages', JSON.stringify(images));
        // Save to Firebase
        if (database) {
            database.ref('backgroundImages').set(images).catch(error => {
                console.error('Error saving background images to Firebase:', error);
            });
        }
        this.addActivity('Background images updated');
    },

    getAutoShuffle() {
        const shuffle = localStorage.getItem('autoShuffle');
        return shuffle ? JSON.parse(shuffle) : false;
    },

    setAutoShuffle(enabled) {
        localStorage.setItem('autoShuffle', JSON.stringify(enabled));
        // Save to Firebase
        if (database) {
            database.ref('autoShuffle').set(enabled).catch(error => {
                console.error('Error saving autoShuffle to Firebase:', error);
            });
        }
    },

    // ============ ANALYTICS OPERATIONS ============
    getAnalytics() {
        const games = this.getGames();
        const users = this.getUsers();
        const comments = this.getComments();
        const totalDownloads = games.reduce((sum, game) => sum + (game.downloads || 0), 0);

        return {
            totalGames: games.length,
            totalUsers: users.length,
            totalDownloads: totalDownloads,
            totalComments: comments.length
        };
    }
};

// Initialize on page load
DataManager.init();

// Apply saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const theme = DataManager.getTheme();
    DataManager.applyTheme(theme);
});
