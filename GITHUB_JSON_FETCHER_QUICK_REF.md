# GitHub JSON Fetcher - Quick Reference Card

## Copy-Paste Solutions

### 1️⃣ Minimal Setup (List)
```javascript
new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'container'
});
```

### 2️⃣ Table Display
```javascript
new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'container',
  dataType: 'table'
});
```

### 3️⃣ With Refresh Button
```javascript
const fetcher = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'container',
  dataType: 'list'
});

document.getElementById('refresh-btn').addEventListener('click', () => {
  fetcher.refresh();
});
```

### 4️⃣ Auto-Refresh Every 30 Seconds
```javascript
new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/live.json',
  elementId: 'container',
  dataType: 'table',
  refreshInterval: 30000
});
```

### 5️⃣ Custom Card Display
```javascript
new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/items.json',
  elementId: 'container',
  dataType: 'custom',
  customRenderer: (element, data) => {
    const html = data.map(item => `
      <div class="card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
    element.innerHTML = html;
  }
});
```

### 6️⃣ Change URL Dynamically
```javascript
const fetcher = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'container'
});

document.getElementById('url-input').addEventListener('change', (e) => {
  fetcher.updateConfig({ url: e.target.value });
  fetcher.refresh();
});
```

### 7️⃣ Multiple Fetchers
```javascript
const users = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/users.json',
  elementId: 'users',
  dataType: 'table'
});

const settings = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/settings.json',
  elementId: 'settings',
  dataType: 'object'
});
```

### 8️⃣ With Error Handling Display
```javascript
const container = document.getElementById('data');
const fetcher = new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'data',
  showLoadingState: true
  // Errors are automatically shown in the container
});
```

### 9️⃣ Start/Stop Auto-Refresh
```javascript
let fetcher = null;

document.getElementById('start').addEventListener('click', () => {
  fetcher = new GitHubJSONFetcher({
    url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
    elementId: 'container',
    refreshInterval: 10000
  });
});

document.getElementById('stop').addEventListener('click', () => {
  if (fetcher) {
    fetcher.stopAutoRefresh();
  }
});
```

### 🔟 Filtered List Display
```javascript
new GitHubJSONFetcher({
  url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
  elementId: 'container',
  dataType: 'custom',
  customRenderer: (element, data) => {
    const filtered = data.filter(item => item.active);
    const html = filtered.map(item => `
      <li>${item.name}</li>
    `).join('');
    element.innerHTML = `<ul>${html}</ul>`;
  }
});
```

---

## HTML Boilerplate

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GitHub JSON Display</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    #container { margin-top: 20px; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 10px; text-align: left; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Data from GitHub</h1>
  
  <button onclick="fetcher.refresh()">🔄 Refresh</button>
  
  <div id="container"></div>

  <script src="github-json-fetcher.js"></script>
  <script>
    const fetcher = new GitHubJSONFetcher({
      url: 'https://raw.githubusercontent.com/user/repo/main/data.json',
      elementId: 'container',
      dataType: 'table'
    });
  </script>
</body>
</html>
```

---

## Configuration Cheat Sheet

```javascript
{
  url: 'STRING',                    // GitHub raw URL (REQUIRED)
  elementId: 'STRING',              // DOM element ID (REQUIRED)
  dataType: 'list|table|object|custom',  // Default: 'list'
  customRenderer: FUNCTION,         // For custom data type
  refreshInterval: NUMBER,          // milliseconds (0 = disabled)
  showLoadingState: true|false,     // Default: true
  cacheBust: true|false             // Default: true
}
```

---

## Methods

```javascript
const f = new GitHubJSONFetcher({...});

f.fetch()                           // Fetch now
f.refresh()                         // Alias for fetch()
f.startAutoRefresh()                // Start timer
f.stopAutoRefresh()                 // Stop timer
f.updateConfig({...})               // Update settings
f.destroy()                         // Cleanup
```

---

## Styling Classes

```css
.github-json-list     { }         /* List container */
.github-json-item     { }         /* List item */
.github-json-table    { }         /* Table */
.github-json-object   { }         /* Object/dl */
.github-json-field    { }         /* Field in list */
.github-json-loading  { }         /* Loading state */
.github-json-error    { }         /* Error state */
```

---

## GitHub URL Builder

```
https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/{PATH}

Examples:
https://raw.githubusercontent.com/torvalds/linux/master/README
https://raw.githubusercontent.com/facebook/react/main/package.json
https://raw.githubusercontent.com/microsoft/vscode/main/LICENSE.txt
```

---

## Common Data Formats

### Array (items are strings)
```json
["Item 1", "Item 2", "Item 3"]
```
Use: `dataType: 'list'`

### Array (items are objects)
```json
[
  {"name": "Alice", "role": "Dev"},
  {"name": "Bob", "role": "Design"}
]
```
Use: `dataType: 'table'`

### Single Object
```json
{"title": "My Project", "version": "1.0"}
```
Use: `dataType: 'object'`

### Anything Else
Use: `dataType: 'custom'` + `customRenderer`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not showing | Check URL is valid and public |
| Table has wrong columns | Ensure all objects have same keys |
| Auto-refresh not working | Check `refreshInterval > 0` |
| Console has fetch error | Likely a CORS or URL issue |
| Element empty | Verify `elementId` exists in HTML |

---

## Pro Tips

✅ GitHub caches responses (up to 5 minutes)  
✅ Use query string for cache busting: `?t=` + timestamp  
✅ Store fetcher in window object for global access  
✅ Combine with other libraries (React, Vue, etc.)  
✅ For sensitive data, use authenticated API with tokens  

---

**Ctrl+F to search this page for your use case! 🚀**
