/**
 * ULTRA STORAGE CLEANER - Emergency cleanup during logout
 * Direct targeting of all known localStorage keys with redundant clearing methods
 */

/**
 * Ultra clean storage utility - removes all user-specific data while preserving
 * essential app settings like language preferences
 */

window.ultraCleanStorage = function() {
    console.log('%c ULTRA CLEANUP STARTING ', 'background: red; color: white; font-size: 16px;');
    
    // Save language preference before clearing
    const languagePref = localStorage.getItem('language');
    console.log('Preserving language preference:', languagePref);
    
    // Get all keys in localStorage
    const keysToRemove = [];
    const keysToPreserve = ['language']; // Add any other keys to preserve here
    
    try {
        // Get the current user ID to ensure we clean their route history
        let currentUserId = null;
        try {
            currentUserId = sessionStorage.getItem('user_uid');
            if (currentUserId) {
                console.log('Found current user ID to clean routes for:', currentUserId);
            }
        } catch (e) {
            console.warn('Could not get current user ID:', e);
        }
        
        // List all keys before clearing for debugging
        console.log('Keys before clearing:', Object.keys(localStorage));
        
        // DIRECTLY TARGET CRITICAL ROUTE HISTORY KEYS
        const routeHistoryPattern = /^route_history_/;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Skip preserved keys
            if (keysToPreserve.includes(key)) {
                continue;
            }
            
            // Add to removal list
            keysToRemove.push(key);
            
            // Immediately remove route history keys for reporting
            if (routeHistoryPattern.test(key)) {
                console.log(`Found user route history to remove: ${key}`);
                localStorage.removeItem(key);
            }
        }
        
        // Critical route data to clear
        const criticalKeys = [
            'routeDebugMap', 'routeLineMapping', 'selectedRoute',
            'lastFromStopId', 'lastToStopId', 'driverFeedback',
            'feedback', 'localFeedback', 'userData', 'users',
            'auth_persistence_set'
        ];
        
        console.log('Directly removing critical keys:', criticalKeys);
        criticalKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear all localStorage except language
        console.log('Removing all other localStorage keys...');
        localStorage.clear();
        
        // Restore language preference
        if (languagePref) {
            localStorage.setItem('language', languagePref);
        }
        
        // Clear sessionStorage completely
        console.log('Clearing sessionStorage...');
        sessionStorage.clear();
        
        // Check for alternate domain localStorage to clear if needed
        // This handles scenarios where the app might be running on multiple domains
        try {
            const altDomains = [
                'http://localhost:5500',
                'https://capstone-2-32cf7.web.app'
            ];
            
            console.log('Attempting to clear localStorage for alternate domains:', altDomains);
            altDomains.forEach(domain => {
                try {
                    // Create a hidden iframe to access the other domain
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = `${domain}/storage-clear.html`;
                    document.body.appendChild(iframe);
                    console.log(`Added iframe for clearing storage on: ${domain}`);
                    
                    // Clean up iframe after a short delay
                    setTimeout(() => {
                        try {
                            document.body.removeChild(iframe);
                            console.log(`Removed cleanup iframe for: ${domain}`);
                        } catch (e) {
                            console.warn(`Error removing iframe for ${domain}:`, e);
                        }
                    }, 2000);
                } catch (e) {
                    console.error(`Error setting up storage clearing for domain ${domain}:`, e);
                }
            });
        } catch (e) {
            console.error('Error during alternate domain storage clearing:', e);
        }
        
        // Triple validation - check if any items still exist
        const remainingKeys = Object.keys(localStorage);
        console.log('Remaining keys after clearing:', remainingKeys);
        const nonLanguageKeys = remainingKeys.filter(key => key !== 'language');
        if (nonLanguageKeys.length > 0) {
            console.warn('Failed to clear some keys:', nonLanguageKeys);
            // Try one more time with the most direct approach
            nonLanguageKeys.forEach(key => localStorage.removeItem(key));
        } else {
            console.log('Successfully cleared all non-language keys');
        }
    } catch (error) {
        console.error('Error during ultra cleanup:', error);
    }
    
    console.log('%c ULTRA CLEANUP COMPLETE ', 'background: green; color: white; font-size: 16px;');
};

// Make function globally available with both names for backward compatibility
window.deepCleanStorage = window.ultraCleanStorage;

// Auto-execute on page load to ensure cleaning happens immediately
document.addEventListener('DOMContentLoaded', () => {
    // Check for logout flag
    if (localStorage.getItem('logout_in_progress') === 'true') {
        console.log('Logout in progress detected - executing cleanup');
        window.ultraCleanStorage();
        localStorage.removeItem('logout_in_progress');
    }
});

