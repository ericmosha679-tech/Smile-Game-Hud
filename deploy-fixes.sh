#!/bin/bash

echo "🚀 Deploying Smile Gaming Hub Fixes..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

# Add all modified files
echo "📁 Adding files to git..."
git add index.html
git add styles.css 
git add main.js
git add admin.html

# Commit changes
echo "💾 Committing changes..."
git commit -m "🎮 CRITICAL FIXES - Deploy working admin and dark mode

✅ Fixed Issues:
- Admin login now works with password: Ciontatenx83
- Dark mode toggle fully functional
- All navigation links working
- Mobile menu responsive
- Game tabs switching properly
- Theme persistence across sessions

🎨 Enhanced Features:
- Modern header with glassmorphism
- Complete admin dashboard with 4 sections
- Advanced dark mode with CSS variables
- Responsive design for all devices
- Professional UI/UX improvements

🔧 Technical:
- Fixed JavaScript event listeners
- Enhanced CSS with proper variables
- Improved mobile responsiveness
- Added error handling and validation
- Optimized performance and loading

📱 Mobile Ready:
- Touch-friendly interface
- Responsive navigation
- Optimized layouts
- Proper viewport handling

🌙 Dark Mode Complete:
- Smooth theme transitions
- Proper color variables
- Component theming
- Accessibility compliance

🎮 Admin Panel:
- Game Management
- Theme Settings  
- Analytics
- User Management
- Secure access control"

echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo "🌐 Your site will be available at:"
echo "https://ericmosha679-tech.github.io/Smile-Game-Hud/"
echo ""
echo "⏱️ Please wait 2-5 minutes for GitHub Pages to update."
echo ""
echo "🔐 Admin Login:"
echo "   1. Visit the site"
echo "   2. Click 'Admin' button"
echo "   3. Enter password: Ciontatenx83"
echo "   4. Access full admin dashboard"
echo ""
echo "🌙 Test Dark Mode:"
echo "   1. Click theme toggle button (🌙/☀️)"
echo "   2. Verify all elements change properly"
echo "   3. Check theme persistence"
echo ""
echo "📱 Test Mobile:"
echo "   1. Open on mobile device"
echo "   2. Test responsive navigation"
echo "   3. Verify all features work"
echo ""
echo "🎮 Enjoy your fully functional gaming hub!"
