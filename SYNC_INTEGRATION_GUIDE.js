/**
 * INTEGRATION GUIDE: Cross-Device Data Synchronization
 * 
 * This file shows exactly how to integrate DataSyncManager into your existing
 * Smile Gaming Hub application to ensure phone and laptop stay in sync.
 */

// ============================================================
// STEP 1: Add this to your index.html (before other scripts)
// ============================================================

/*
  <script src="data-sync-manager.js"></script>
  <script src="github-json-fetcher.js"></script>
  <script src="data.js"></script>
*/

// ============================================================
// STEP 2: Add this initialization to main.js (at the very top)
// ============================================================

// Initialize the cross-device sync manager
const dataSyncManager = new DataSyncManager({
  syncInterval: 30000, // Check every 30 seconds
  enableCrosTabSync: true, // Sync across browser tabs
  remoteDataUrl: 'https://raw.githubusercontent.com/ericmosha679-tech/Smile-Game-Hud/main/sample-table.json',
  onDataUpdated: function(updateInfo) {
    console.log('📱 Data updated:', updateInfo);
    
    // Reload the current page view when data changes
    if (updateInfo.source === 'cross-tab' || updateInfo.source === 'remote') {
      // If we're on the games page, refresh the games list
      if (document.querySelector('.games-grid')) {
        window.location.reload(); // Or use a more elegant refresh
      }
    }
  }
});

// ============================================================
// STEP 3: Update admin.js - Add sync notifications
// ============================================================

// When admin UPDATES a game, add this call:
function updateGameInAdmin(gameId, updatedData) {
  // ... existing update logic ...
  
  // Record the change for sync
  dataSyncManager.recordAdminChange('game_updated', {
    gameId: gameId,
    changes: updatedData
  });
  
  // Force other devices to sync
  dataSyncManager.forceRefresh();
}

// When admin ADDS a game, add this call:
function addGameInAdmin(gameData) {
  // ... existing add logic ...
  
  dataSyncManager.recordAdminChange('game_added', {
    game: gameData
  });
  
  dataSyncManager.forceRefresh();
}

// When admin DELETES a game, add this call:
function deleteGameInAdmin(gameId) {
  // ... existing delete logic ...
  
  dataSyncManager.recordAdminChange('game_deleted', {
    gameId: gameId
  });
  
  dataSyncManager.forceRefresh();
}

// When admin UPDATES theme, add this call:
function updateTheme(themeName, colors) {
  // ... existing theme logic ...
  
  dataSyncManager.recordAdminChange('theme_updated', {
    themeName: themeName,
    colors: colors
  });
  
  dataSyncManager.forceRefresh();
}

// ============================================================
// STEP 4: Add a manual refresh button to your pages
// ============================================================

// HTML:
/*
  <button id="sync-all-devices" class="btn-sync" title="Sync data across all your devices">
    🔄 Sync Data
  </button>
*/

// JavaScript:
document.getElementById('sync-all-devices')?.addEventListener('click', () => {
  dataSyncManager.forceRefresh();
});

// ============================================================
// STEP 5: Add status display (optional)
// ============================================================

function showSyncStatus() {
  const status = dataSyncManager.getStatus();
  console.log('Sync Status:', {
    running: status.isRunning,
    lastSync: status.lastSyncTime,
    cacheAge: Math.round(status.cacheAge / 1000) + ' seconds',
    lastAdminChange: status.lastAdminChange || 'None'
  });
}

// ============================================================
// ADDITIONAL: Handle Storage Events (for cross-tab sync)
// ============================================================

// Listen for admin updates in other tabs
window.addEventListener('adminUpdate', (event) => {
  console.log('🔔 Admin update from another tab:', event.detail);
  // Optionally show notification
  dataSyncManager.showUpdateNotification(
    `Admin updated ${event.detail.type}`,
    'info'
  );
});

// ============================================================
// EXAMPLE: Complete flow when admin makes a change
// ============================================================

/*
  1. Admin updates game in admin.js:
     - Game data saved to localStorage
     - recordAdminChange() called
     - forceRefresh() called
  
  2. DataSyncManager broadcasts update:
     - Shows notification on current device
     - Updates timestamp in localStorage
     
  3. Other tabs/devices detect change:
     - storage event fires (cross-tab)
     - onDataUpdated callback invoked
     - Page reloads if needed
     
  4. Result: All devices show same data!
*/

// ============================================================
// TROUBLESHOOTING & CHECKS
// ============================================================

// Check if sync is working
function verifySyncWorking() {
  const checks = {
    '✓ Sync Manager Running': dataSyncManager && dataSyncManager.syncTimer !== null,
    '✓ localStorage Available': typeof(Storage) !== 'undefined',
    '✓ Last Sync Time': localStorage.getItem('lastSyncTime'),
    '✓ Last Admin Change': localStorage.getItem('lastAdminChangeTime'),
    '✓ Cross-Tab Sync Enabled': dataSyncManager.config.enableCrosTabSync,
    '✓ Auto-Sync Interval': dataSyncManager.config.syncInterval + 'ms'
  };
  
  console.table(checks);
  return checks;
}

// Run verification
verifySyncWorking();
