/**
 * Cross-Device Data Synchronization System
 * Ensures all devices (phone, laptop, tablet) show the same data when admin makes changes
 * 
 * Features:
 * - Real-time sync across tabs on same device
 * - Periodic check for updates from remote source
 * - Manual refresh capability
 * - Update notifications to users
 * - Version tracking and timestamp-based updates
 */

class DataSyncManager {
  /**
   * Initialize the sync manager
   * @param {Object} config - Configuration
   * @param {Function} config.onDataUpdated - Callback when data is updated
   * @param {string} config.remoteDataUrl - URL to fetch fresh data (optional)
   * @param {number} config.syncInterval - Check interval in ms (default: 30000 = 30 seconds)
   * @param {boolean} config.enableCrosTabSync - Sync across tabs (default: true)
   */
  constructor(config = {}) {
    this.config = {
      syncInterval: 30000,
      enableCrosTabSync: true,
      remoteDataUrl: null,
      onDataUpdated: null,
      ...config
    };

    this.syncTimer = null;
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || Date.now().toString();
    this.dataVersion = JSON.parse(localStorage.getItem('dataVersion') || '{}');

    // Initialize
    this.setupCrossTabSync();
    this.startAutoSync();

    console.log('✓ DataSyncManager initialized');
  }

  /**
   * Setup cross-tab communication on same device
   */
  setupCrossTabSync() {
    if (!this.config.enableCrosTabSync) return;

    window.addEventListener('storage', (event) => {
      if (event.key === 'gamesData' || 
          event.key === 'usersData' || 
          event.key === 'commentsData' ||
          event.key === 'themeData') {
        
        console.log(`📱 Data updated on another tab: ${event.key}`);
        
        // Trigger callback to refresh UI
        if (this.config.onDataUpdated) {
          this.config.onDataUpdated({
            key: event.key,
            source: 'cross-tab',
            timestamp: Date.now()
          });
        }

        // Show notification
        this.showUpdateNotification('Data updated on another device');
      }

      if (event.key === 'adminUpdateTimestamp') {
        console.log('🔔 Admin update detected on another device');
        this.handleRemoteUpdate();
      }
    });
  }

  /**
   * Start automatic sync checking
   */
  startAutoSync() {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = setInterval(() => {
      this.checkForUpdates();
    }, this.config.syncInterval);

    console.log(`⏱️ Auto-sync started (every ${this.config.syncInterval}ms)`);
  }

  /**
   * Stop auto sync
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏱️ Auto-sync stopped');
    }
  }

  /**
   * Check if data has been updated since last sync
   */
  async checkForUpdates() {
    try {
      // Get current data version/timestamp
      const currentVersion = this.getDataChecksum();
      const lastVersion = localStorage.getItem('lastDataChecksum') || '';

      if (currentVersion !== lastVersion) {
        console.log('🔄 Local data changed, updating checksum');
        localStorage.setItem('lastDataChecksum', currentVersion);
      }

      // If remote URL provided, check for updates there
      if (this.config.remoteDataUrl) {
        await this.checkRemoteUpdates();
      }

      // Check for stale cache (older than 1 hour)
      const lastSync = parseInt(localStorage.getItem('lastSyncTime') || Date.now());
      const age = Date.now() - lastSync;
      const ONE_HOUR = 3600000;

      if (age > ONE_HOUR) {
        console.log('⚠️ Cache older than 1 hour, triggering refresh');
        this.forceRefresh();
      }

    } catch (error) {
      console.error('Sync check failed:', error);
    }
  }

  /**
   * Check remote source for updates
   */
  async checkRemoteUpdates() {
    if (!this.config.remoteDataUrl) return;

    try {
      const response = await fetch(`${this.config.remoteDataUrl}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const remoteData = await response.json();
      this.compareAndUpdate(remoteData);

    } catch (error) {
      console.warn('⚠️ Could not fetch remote data:', error.message);
    }
  }

  /**
   * Compare remote data with local and update if needed
   * @param {*} remoteData - Data from remote source
   */
  compareAndUpdate(remoteData) {
    try {
      // If remote data is an array (games list)
      if (Array.isArray(remoteData)) {
        const localGames = JSON.parse(localStorage.getItem('gamesData') || '[]');
        
        // Check if remote has more games or different data
        if (remoteData.length > localGames.length ||
            JSON.stringify(remoteData) !== JSON.stringify(localGames)) {
          
          console.log('🔄 Remote games differ, updating local cache');
          localStorage.setItem('gamesData', JSON.stringify(remoteData));
          localStorage.setItem('lastSyncTime', Date.now().toString());
          
          this.notifyUpdate('games', remoteData);
        }
      }
    } catch (error) {
      console.error('Comparison failed:', error);
    }
  }

  /**
   * Notify that data has been updated
   * @param {string} dataType - Type of data updated
   * @param {*} data - The new data
   */
  notifyUpdate(dataType, data) {
    if (this.config.onDataUpdated) {
      this.config.onDataUpdated({
        type: dataType,
        source: 'remote',
        timestamp: Date.now(),
        data: data
      });
    }

    this.showUpdateNotification(`${dataType} updated across all devices`);
  }

  /**
   * Handle remote update (called when admin updates on another device)
   */
  async handleRemoteUpdate() {
    console.log('🔄 Admin update detected, fetching fresh data...');
    await this.forceRefresh();
  }

  /**
   * Force refresh - clear cache and reload all data
   */
  async forceRefresh() {
    try {
      // Mark that refresh is in progress
      localStorage.setItem('isRefreshing', 'true');
      this.showLoadingState();

      // Clear old timestamps to force re-fetch
      localStorage.setItem('lastSyncTime', Date.now().toString());
      localStorage.setItem('dataRefreshTime', Date.now().toString());

      // Re-initialize data (will fetch fresh if available)
      if (typeof DataManager !== 'undefined') {
        // Re-fetch games from remote if available
        if (this.config.remoteDataUrl) {
          const response = await fetch(`${this.config.remoteDataUrl}?t=${Date.now()}&bust=${Math.random()}`);
          if (response.ok) {
            const freshData = await response.json();
            localStorage.setItem('gamesData', JSON.stringify(freshData));
            console.log('✓ Fresh data loaded from remote');
          }
        }

        // Notify that refresh is complete
        if (this.config.onDataUpdated) {
          this.config.onDataUpdated({
            type: 'refresh',
            source: 'manual',
            timestamp: Date.now()
          });
        }
      }

      localStorage.removeItem('isRefreshing');
      this.showUpdateNotification('✓ Data synced across all devices!', 'success');

    } catch (error) {
      console.error('Force refresh failed:', error);
      localStorage.removeItem('isRefreshing');
      this.showUpdateNotification('⚠️ Sync failed, please refresh manually', 'error');
    }
  }

  /**
   * Get checksum of current data (for change detection)
   */
  getDataChecksum() {
    const gamesData = localStorage.getItem('gamesData') || '';
    const usersData = localStorage.getItem('usersData') || '';
    const themeData = localStorage.getItem('themeData') || '';
    
    const combined = gamesData + usersData + themeData;
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Record when admin makes changes
   */
  recordAdminChange(changeType, details = {}) {
    const timestamp = Date.now();
    
    localStorage.setItem('adminUpdateTimestamp', timestamp.toString());
    localStorage.setItem('lastAdminChangeType', changeType);
    localStorage.setItem('lastAdminChangeTime', new Date(timestamp).toISOString());
    
    console.log(`📝 Admin change recorded: ${changeType}`, details);

    // Broadcast to other tabs
    window.dispatchEvent(new CustomEvent('adminUpdate', {
      detail: {
        type: changeType,
        timestamp: timestamp,
        details: details
      }
    }));
  }

  /**
   * Show notification to user
   * @param {string} message - Message to show
   * @param {string} type - 'info', 'success', 'error'
   */
  showUpdateNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `data-sync-notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('data-sync-styles')) {
      const style = document.createElement('style');
      style.id = 'data-sync-styles';
      style.textContent = `
        .data-sync-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-info {
          background: #e3f2fd;
          color: #1976d2;
          border-left: 4px solid #1976d2;
        }

        .notification-success {
          background: #e8f5e9;
          color: #388e3c;
          border-left: 4px solid #388e3c;
        }

        .notification-error {
          background: #ffebee;
          color: #d32f2f;
          border-left: 4px solid #d32f2f;
        }

        .notification-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .notification-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .notification-close:hover {
          opacity: 1;
        }

        .data-sync-loading {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          text-align: center;
          z-index: 10001;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .data-sync-notification {
            bottom: 10px;
            right: 10px;
            left: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Show loading state during sync
   */
  showLoadingState() {
    const existing = document.getElementById('data-sync-loading-state');
    if (existing) existing.remove();

    const loader = document.createElement('div');
    loader.id = 'data-sync-loading-state';
    loader.className = 'data-sync-loading';
    loader.innerHTML = `
      <div class="spinner"></div>
      <p>Syncing data across devices...</p>
    `;
    document.body.appendChild(loader);
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New config options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ DataSyncManager config updated', this.config);
  }

  /**
   * Destroy the sync manager
   */
  destroy() {
    this.stopAutoSync();
    console.log('🛑 DataSyncManager destroyed');
  }

  /**
   * Get sync status information
   */
  getStatus() {
    return {
      isRunning: !!this.syncTimer,
      lastSyncTime: new Date(parseInt(localStorage.getItem('lastSyncTime') || Date.now())),
      dataVersion: this.dataVersion,
      lastAdminChange: localStorage.getItem('lastAdminChangeTime'),
      cacheAge: Date.now() - parseInt(localStorage.getItem('lastSyncTime') || Date.now())
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataSyncManager;
}
