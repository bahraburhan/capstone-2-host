// Global authentication handler
console.log('Global authentication handler loaded');

// Function to check if a path requires authentication
function requiresAuth(path) {
    // Pages that don't require authentication
    const publicPaths = [
        '/index.html',
        '/login.html', 
        '/signup.html',
        '/index',
        '/login',
        '/signup',
        '/',
    ];
    
    // Convert to path only (no domain)
    const currentPath = path.split('?')[0]; // Remove query parameters
    const pathOnly = currentPath.split('/').pop(); // Get just the filename
    
    // Check if the current path is in the public paths
    return !publicPaths.some(publicPath => 
        currentPath.endsWith(publicPath) || 
        (pathOnly && publicPath.includes(pathOnly))
    );
}

// Function to handle authentication state changes
function handleAuthState() {
    // Get the current path
    const currentPath = window.location.pathname;
    
    console.log('Checking auth state for path:', currentPath);
    
    // Check if the current page requires authentication
    if (requiresAuth(currentPath)) {
        console.log('This page requires authentication');
        
        // Set up auth state observer
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('User is authenticated:', user.email);
                    // User is signed in, hide any loading overlays
                    const loadingOverlay = document.getElementById('loading-overlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                } else {
                    console.log('User is not authenticated, redirecting to login');
                    // User is not signed in, redirect to login
                    window.location.href = 'login.html';
                }
            });
        } else {
            console.log('Firebase auth not available yet, waiting...');
            // Wait for Firebase to initialize
            const checkFirebase = setInterval(() => {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    clearInterval(checkFirebase);
                    handleAuthState();
                }
            }, 100);
        }
    } else {
        console.log('This page does not require authentication');
        // If we're on a login/signup page and the user is already authenticated, redirect to menu
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user && (currentPath.includes('login') || currentPath.includes('signup'))) {
                console.log('User already authenticated, redirecting to menu');
                window.location.href = 'menu.html';
            }
        }
    }
}

// Initialize the auth check when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing global auth check');
    
    // Wait a moment to give Firebase a chance to initialize
    setTimeout(handleAuthState, 500);
});

// Function to handle logout from any page
function handleLogout() {
    console.log('Global logout handler called');
    
    // First try to initialize Firebase if it's not already initialized
    const tryInitializeFirebase = () => {
        if (typeof window.initializeFirebase === 'function') {
            console.log('Attempting to initialize Firebase before logout');
            return window.initializeFirebase();
        }
        return Promise.reject(new Error('Firebase initialization function not available'));
    };
    
    // Helper to clear session data and redirect
    const clearSessionAndRedirect = () => {
        console.log('EMERGENCY CLEANUP: Preparing for complete data wipe');
        
        try {
            // Set a flag that we're in logout process - this will trigger the auto-cleaner
            // in storage-cleaner.js if the page refreshes during logout
            localStorage.setItem('logout_in_progress', 'true');
            
            // Try using the direct ultra cleaning method first if available
            if (typeof window.ultraCleanStorage === 'function') {
                console.log('EMERGENCY CLEANUP: Using ultra cleaning method');
                window.ultraCleanStorage();
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300); 
                return;
            }
            
            // Otherwise, dynamically load the storage cleaner script
            console.log('EMERGENCY CLEANUP: Loading ultra cleaning script');
            const script = document.createElement('script');
            script.src = 'js/storage-cleaner.js?v=' + new Date().getTime(); // Cache busting
            
            script.onload = () => {
                console.log('EMERGENCY CLEANUP: Ultra cleaner loaded successfully');
                if (typeof window.ultraCleanStorage === 'function') {
                    window.ultraCleanStorage();
                } else if (typeof window.deepCleanStorage === 'function') {
                    window.deepCleanStorage();
                } else {
                    console.error('EMERGENCY CLEANUP: Cleaning functions not available!');
                    
                    // Emergency fallback - direct hardcore clearing
                    const languagePreference = localStorage.getItem('language');
                    
                    // First target the known problematic items from screenshot
                    const keysToRemove = [
                        'routeDebugMap', 'routeLineMapping', 'selectedRoute',
                        'lastFromStopId', 'lastToStopId', 'driverFeedback',
                        'feedback', 'localFeedback', 'userData', 'users',
                        'auth_persistence_set'
                    ];
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    // Then clear everything using both methods
                    Object.keys(localStorage).forEach(key => {
                        if (key !== 'language') localStorage.removeItem(key);
                    });
                    
                    localStorage.clear();
                    
                    // Restore language
                    if (languagePreference) {
                        localStorage.setItem('language', languagePreference);
                    }
                    
                    sessionStorage.clear();
                }
                
                // Redirect after cleaning is done
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300);
            };
            
            script.onerror = () => {
                console.error('EMERGENCY CLEANUP: Failed to load ultra cleaner');
                
                // Emergency direct clearing
                const languagePreference = localStorage.getItem('language');
                localStorage.clear();
                sessionStorage.clear();
                if (languagePreference) localStorage.setItem('language', languagePreference);
                
                window.location.href = 'index.html';
            };
            
            // Add the script to the page
            document.head.appendChild(script);
            
        } catch (e) {
            console.error('EMERGENCY CLEANUP: Critical error during cleanup:', e);
            // Force redirect as last resort
            window.location.href = 'index.html';
        }
    };
    
    // Check if Firebase is already available and initialized
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        console.log('Firebase available, attempting to sign out');
        try {
            firebase.auth().signOut()
                .then(() => {
                    console.log('Signed out successfully');
                    clearSessionAndRedirect();
                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                    clearSessionAndRedirect(); // Still redirect on error
                });
        } catch (e) {
            console.error('Exception during signOut attempt:', e);
            clearSessionAndRedirect(); // Still redirect on exception
        }
    } else {
        console.log('Firebase not initialized, attempting to initialize');
        // Try to initialize Firebase first
        tryInitializeFirebase()
            .then(() => {
                console.log('Firebase initialized, now attempting to sign out');
                return firebase.auth().signOut();
            })
            .then(() => {
                console.log('Signed out successfully after initialization');
                clearSessionAndRedirect();
            })
            .catch((error) => {
                console.error('Error during Firebase init or signOut:', error);
                clearSessionAndRedirect(); // Still redirect on error
            });
    }
}

// Export functions for use in other scripts
window.requiresAuth = requiresAuth;
window.handleAuthState = handleAuthState;
window.handleLogout = handleLogout;
