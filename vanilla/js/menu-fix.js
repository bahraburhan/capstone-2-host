// Menu Navigation Fix
console.log('Loading menu-fix.js to fix navigation issues');

// Track retry attempts to prevent infinite loops
let retryCount = 0;
const MAX_RETRIES = 10;

// Function to directly set up menu navigation
function fixMenuNavigation(forceRetry = false) {
    console.log('Fixing menu navigation');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (menuItems.length === 0) {
        retryCount++;
        
        if (retryCount >= MAX_RETRIES && !forceRetry) {
            console.log(`Giving up after ${retryCount} attempts to find menu items`);
            return;
        }
        
        console.log(`No menu items found yet, will retry in 500ms (attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(() => fixMenuNavigation(), 500);
        return;
    }
    
    // Reset retry counter when we find items
    retryCount = 0;
    
    console.log(`Found ${menuItems.length} menu items to fix`);
    
    menuItems.forEach(item => {
        const path = item.getAttribute('data-path');
        if (!path) return;
        
        console.log('Setting up direct navigation for:', path);
        
        // Make sure the item is styled as clickable
        item.style.cursor = 'pointer';
        item.style.pointerEvents = 'auto';
        
        // Apply direct onclick handler
        item.onclick = function(e) {
            console.log(`Menu item clicked: ${path}`);
            window.location.href = path;
            return false;
        };
    });
    
    console.log('Menu navigation fix applied successfully');
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in menu-fix.js');
    // Give time for other scripts to run first
    setTimeout(fixMenuNavigation, 500);
});

// Also run on window load as a backup
window.addEventListener('load', function() {
    console.log('Window loaded in menu-fix.js');
    // Reset retry counter on window load
    retryCount = 0;
    fixMenuNavigation();
    
    // Make double sure by trying again after a delay, but force retry regardless of counter
    setTimeout(() => fixMenuNavigation(true), 1000);
});

// For components-based pages, listen for the components-loaded event
document.addEventListener('components-loaded', function() {
    console.log('Components loaded event received in menu-fix.js');
    // Reset retry counter for components-loaded event
    retryCount = 0;
    fixMenuNavigation();
});
