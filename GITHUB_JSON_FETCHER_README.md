# 🔗 GitHub JSON Fetcher

A lightweight, configurable JavaScript library for fetching JSON data from GitHub raw URLs and dynamically updating webpage elements. Perfect for displaying live data, configuration files, or static content from GitHub repositories.

## ✨ Features

- 📡 **Fetch from GitHub** - Load JSON directly from GitHub raw URLs
- 🎨 **Multiple Display Formats** - Lists, tables, objects, or custom renderers
- ⏱️ **Auto-Refresh** - Optionally refresh data at intervals
- 🔧 **Fully Configurable** - URLs, data types, refresh rates, and more
- ⚠️ **Error Handling** - Automatic error display in the UI
- 📦 **No Dependencies** - Pure vanilla JavaScript
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Lightweight** - ~4.2 KB (minified)

## 📦 Installation

### Option 1: Direct Include
```html
<script src="path/to/github-json-fetcher.js"></script>
```

### Option 2: Module Import
```javascript
import GitHubJSONFetcher from './github-json-fetcher.js';
```

### Option 3: Node.js
```javascript
const GitHubJSONFetcher = require('./github-json-fetcher.js');
```

## 🚀 Quick Start

### 1. Basic List Display
```html
<!-- HTML -->
<div id="my-list"></div>

<script src="github-json-fetcher.js"></script>
<script>
  const fetcher = new GitHubJSONFetcher({
    url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
    elementId: 'my-list',
    dataType: 'list'
  });
</script>
```

### 2. Table Display
```html
<div id="my-table"></div>

<script>
  const fetcher = new GitHubJSONFetcher({
    url: 'https://raw.githubusercontent.com/user/repo/main/users.json',
    elementId: 'my-table',
    dataType: 'table'
  });
</script>
```

### 3. Auto-Refresh Data
```html
<div id="live-data"></div>

<script>
  const fetcher = new GitHubJSONFetcher({
    url: 'https://raw.githubusercontent.com/user/repo/main/stats.json',
    elementId: 'live-data',
    dataType: 'list',
    refreshInterval: 30000 // Refresh every 30 seconds
  });
</script>
```

## 📖 Configuration Options

```javascript
new GitHubJSONFetcher({
  // REQUIRED
  url: 'https://raw.githubusercontent.com/...',    // GitHub raw JSON URL
  elementId: 'container-id',                        // Target DOM element ID

  // OPTIONAL
  dataType: 'list',                                 // 'list', 'table', 'object', or 'custom'
  customRenderer: (element, data) => {...},         // Custom rendering function
  refreshInterval: 0,                               // Auto-refresh interval in ms (0 = disabled)
  showLoadingState: true,                           // Show loading indicator
  cacheBust: true                                   // Add timestamp to prevent caching
});
```

### Configuration Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | — | **Required.** GitHub raw content URL |
| `elementId` | string | — | **Required.** Target HTML element ID |
| `dataType` | string | `'list'` | Display format: `'list'`, `'table'`, `'object'`, `'custom'` |
| `customRenderer` | function | `null` | Custom rendering function for `dataType: 'custom'` |
| `refreshInterval` | number | `0` | Auto-refresh interval in milliseconds (0 = disabled) |
| `showLoadingState` | boolean | `true` | Show loading spinner while fetching |
| `cacheBust` | boolean | `true` | Add timestamp to URL to bypass browser cache |

## 🎯 Data Type Examples

### List (Array of Strings)
```json
[
  "Item 1",
  "Item 2",
  "Item 3"
]
```
**Renders as:** Unordered list with items

### Table (Array of Objects)
```json
[
  { "name": "Alice", "email": "alice@example.com", "role": "Developer" },
  { "name": "Bob", "email": "bob@example.com", "role": "Designer" }
]
```
**Renders as:** HTML table with headers

### Object
```json
{
  "project": "My Project",
  "version": "1.0.0",
  "author": "John Doe"
}
```
**Renders as:** Definition list

### Custom Renderer
```javascript
customRenderer: (element, data) => {
  const html = data.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    </div>
  `).join('');
  element.innerHTML = html;
}
```

## 📋 API Methods

### `fetch()`
Manually fetch data from the configured URL.
```javascript
fetcher.fetch();
```

### `refresh()`
Alias for `fetch()`.
```javascript
fetcher.refresh();
```

### `updateConfig(newConfig)`
Update configuration options.
```javascript
fetcher.updateConfig({
  url: 'https://new-url.com/data.json',
  refreshInterval: 60000
});
```

### `startAutoRefresh()`
Start automatic refresh timer.
```javascript
fetcher.startAutoRefresh();
```

### `stopAutoRefresh()`
Stop automatic refresh timer.
```javascript
fetcher.stopAutoRefresh();
```

### `destroy()`
Clean up and remove the fetcher.
```javascript
fetcher.destroy();
```

## 🔗 GitHub Raw URL Format

### Standard Format
```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path/to/file}
```

### Examples
```
https://raw.githubusercontent.com/octocat/Hello-World/main/README.md
https://raw.githubusercontent.com/facebook/react/main/package.json
https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/base/common/uri.ts
```

### User/Organization Repos
```
https://raw.githubusercontent.com/username/repo-name/main/data.json
```

### Pro Tips
- Use `main` or `master` as the branch (varies by repo)
- Check the repo for the correct default branch
- Raw URLs bypass authentication, so don't store sensitive data
- Cache the response on your server if possible

## 🎨 Styling

The library generates semantic HTML with CSS classes for easy styling:

```css
/* List container */
.github-json-list { }

/* List items */
.github-json-item { }

/* Table */
.github-json-table { }

/* Object/definition list */
.github-json-object { }

/* Loading state */
.github-json-loading { }

/* Error state */
.github-json-error { }
```

### Example Custom Styling
```css
.github-json-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.github-json-table th {
  background: #333;
  color: white;
  padding: 12px;
  text-align: left;
}

.github-json-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.github-json-error {
  background: #fee;
  color: #c33;
  padding: 20px;
  border-radius: 4px;
}
```

## 🧪 Testing & Examples

See `github-json-fetcher-examples.html` for:
- List display
- Table display
- Object display
- Auto-refresh
- Custom renderers
- Error handling
- URL configuration

Run the examples:
```bash
python3 -m http.server 8000
# Open http://localhost:8000/github-json-fetcher-examples.html
```

## ⚠️ Error Handling

Errors are automatically caught and displayed in the target element:

```
⚠️ Error loading data
HTTP 404: Not Found
```

No need for try-catch unless you want custom error handling:

```javascript
const fetcher = new GitHubJSONFetcher({
  url: 'https://...',
  elementId: 'container'
});

// Errors are logged to console automatically
```

## 🔒 Security Notes

- URLs are **public** — don't expose sensitive data
- GitHub may cache responses for up to 5 minutes
- Consider rate limits for high-frequency auto-refresh
- Best for static/public content only
- No authentication supported (uses public raw URLs)

## 🚀 Advanced Usage

### Multiple Fetchers on One Page
```javascript
const fetcher1 = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/.../users.json',
  elementId: 'users-table',
  dataType: 'table'
});

const fetcher2 = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/.../settings.json',
  elementId: 'settings-object',
  dataType: 'object'
});
```

### Conditional Rendering
```javascript
const fetcher = new GitHubJSONFetcher({
  url: 'https://...',
  elementId: 'data',
  dataType: 'custom',
  customRenderer: (element, data) => {
    if (!data.length) {
      element.innerHTML = '<p>No data available</p>';
      return;
    }
    // Render your data
  }
});
```

### Dynamic URL Updates
```javascript
document.getElementById('url-input').addEventListener('change', (e) => {
  fetcher.updateConfig({ url: e.target.value });
  fetcher.refresh();
});
```

### Refresh on Button Click
```javascript
document.getElementById('refresh-btn').addEventListener('click', () => {
  fetcher.refresh();
});
```

## 📊 Performance Tips

1. **Use cache busting for live data** (default enabled)
2. **Avoid very short refresh intervals** (causes API hammering)
3. **Cache response on your server** for production
4. **Use CDN** to serve JSON files
5. **Minify and gzip** for production

## 🐛 Troubleshooting

### Data not loading
- Check GitHub URL is correct
- Verify JSON is valid and public
- Check browser console for network errors
- Ensure `elementId` exists in HTML

### Table displays incorrectly
- Verify data is array of objects
- Check all objects have same keys
- Large nested objects may display poorly

### Auto-refresh not working
- Check `refreshInterval` is > 0
- Verify URL is still valid
- Check browser console for errors

### CORS Issues
- GitHub raw URLs should work fine
- If using from different domain, check CORS headers
- Most browsers allow cross-origin requests to GitHub

## 📝 License

Free to use and modify for any purpose.

## 🤝 Contributing

Improvements welcome! Consider:
- Adding pagination support
- CSV export functionality
- Search/filter capabilities
- Advanced sorting options

## 📚 Resources

- **GitHub API Docs**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- **Raw Content URL**: https://github.com/{owner}/{repo}/raw/{branch}/{path}
- **JavaScript Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

**Made with ❤️ for the open web**
