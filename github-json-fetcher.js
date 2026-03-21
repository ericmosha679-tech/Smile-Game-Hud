/**
 * GitHub JSON Fetcher
 * Fetches JSON from GitHub raw URLs and dynamically updates webpage elements
 * 
 * Features:
 * - Configurable GitHub URLs
 * - Auto-refresh on page load
 * - Error handling with user feedback
 * - Loading states with visual feedback
 * - Multiple data type support (arrays, objects, nested structures)
 * - Cache busting with timestamps
 */

class GitHubJSONFetcher {
  /**
   * Initialize the fetcher with configuration
   * @param {Object} config - Configuration object
   * @param {string} config.url - GitHub raw URL
   * @param {string} config.elementId - Target DOM element ID
   * @param {string} config.dataType - 'list', 'table', or 'custom'
   * @param {Function} config.customRenderer - Custom rendering function (optional)
   * @param {number} config.refreshInterval - Auto-refresh interval in ms (0 = no auto-refresh)
   * @param {boolean} config.showLoadingState - Show loading indicator (default: true)
   * @param {boolean} config.cacheBust - Add timestamp to prevent caching (default: true)
   */
  constructor(config) {
    this.config = {
      dataType: 'list',
      refreshInterval: 0,
      showLoadingState: true,
      cacheBust: true,
      ...config
    };

    this.element = document.getElementById(this.config.elementId);
    this.refreshTimer = null;

    if (!this.element) {
      console.error(`Element with ID "${this.config.elementId}" not found`);
      return;
    }

    // Fetch data on initialization
    this.fetch();

    // Set up auto-refresh if configured
    if (this.config.refreshInterval > 0) {
      this.startAutoRefresh();
    }
  }

  /**
   * Fetch JSON from GitHub and update the element
   */
  async fetch() {
    const url = this.config.url;

    if (!url) {
      console.error('GitHub URL not configured');
      return;
    }

    try {
      // Show loading state
      if (this.config.showLoadingState) {
        this.showLoading();
      }

      // Fetch with cache busting
      const fetchUrl = this.config.cacheBust 
        ? `${url}?t=${Date.now()}` 
        : url;

      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Render based on configured type
      this.render(data);

      console.log('✓ Data fetched and rendered successfully', data);
    } catch (error) {
      this.showError(error.message);
      console.error('Fetch error:', error);
    }
  }

  /**
   * Render data based on configured data type
   * @param {*} data - Parsed JSON data
   */
  render(data) {
    const { dataType, customRenderer } = this.config;

    if (dataType === 'custom' && customRenderer) {
      // Use custom renderer
      customRenderer(this.element, data);
    } else if (Array.isArray(data)) {
      // Default array rendering (list or table)
      if (dataType === 'table') {
        this.renderTable(data);
      } else {
        this.renderList(data);
      }
    } else if (typeof data === 'object' && data !== null) {
      // Object rendering
      this.renderObject(data);
    } else {
      // Fallback for primitives
      this.element.textContent = String(data);
    }
  }

  /**
   * Render array as unordered list
   * @param {Array} data - Array of items
   */
  renderList(data) {
    const ul = document.createElement('ul');
    ul.className = 'github-json-list';

    data.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'github-json-item';

      if (typeof item === 'object') {
        // Display object as formatted text
        li.innerHTML = this.objectToHTML(item);
      } else {
        // Simple string/number
        li.textContent = String(item);
      }

      ul.appendChild(li);
    });

    this.element.innerHTML = '';
    this.element.appendChild(ul);
  }

  /**
   * Render array of objects as table
   * @param {Array} data - Array of row objects
   */
  renderTable(data) {
    if (!data.length) {
      this.element.innerHTML = '<p>No data available</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'github-json-table';

    // Get column headers from first object
    const headers = Object.keys(data[0]);

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    data.forEach((row) => {
      const tr = document.createElement('tr');

      headers.forEach((header) => {
        const td = document.createElement('td');
        const value = row[header];

        if (typeof value === 'object') {
          td.textContent = JSON.stringify(value);
        } else {
          td.textContent = String(value || '—');
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    this.element.innerHTML = '';
    this.element.appendChild(table);
  }

  /**
   * Render plain object as definition list or JSON
   * @param {Object} data - Object to render
   */
  renderObject(data) {
    const dl = document.createElement('dl');
    dl.className = 'github-json-object';

    Object.entries(data).forEach(([key, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = key;
      dl.appendChild(dt);

      const dd = document.createElement('dd');

      if (typeof value === 'object') {
        dd.innerHTML = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
      } else {
        dd.textContent = String(value || '—');
      }

      dl.appendChild(dd);
    });

    this.element.innerHTML = '';
    this.element.appendChild(dl);
  }

  /**
   * Convert object/array to HTML string for list display
   * @param {*} item - Item to convert
   * @returns {string} HTML string
   */
  objectToHTML(item) {
    if (Array.isArray(item)) {
      return `<strong>[Array: ${item.length} items]</strong>`;
    }

    const entries = Object.entries(item).map(([key, val]) => {
      let displayVal = val;
      if (typeof val === 'object') {
        displayVal = JSON.stringify(val);
      }
      return `<span class="github-json-field"><strong>${key}:</strong> ${displayVal}</span>`;
    });

    return entries.join(' • ');
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.element.innerHTML = `
      <div class="github-json-loading">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>
    `;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.element.innerHTML = `
      <div class="github-json-error">
        <strong>⚠️ Error loading data</strong>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);

    this.refreshTimer = setInterval(() => {
      console.log('Auto-refreshing GitHub data...');
      this.fetch();
    }, this.config.refreshInterval);

    console.log(`Auto-refresh started (${this.config.refreshInterval}ms)`);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Auto-refresh stopped');
    }
  }

  /**
   * Manually refresh data
   */
  refresh() {
    this.fetch();
  }

  /**
   * Update configuration
   * @param {Object} newConfig - Configuration to update
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Destroy the fetcher and clean up
   */
  destroy() {
    this.stopAutoRefresh();
    if (this.element) {
      this.element.innerHTML = '';
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubJSONFetcher;
}
