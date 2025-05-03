/**
 * User Route History Manager
 * Handles storing and retrieving route history in a user-specific way
 */

// Namespace for UserRouteHistory
const UserRouteHistory = {
    // Maximum number of routes to store per user
    MAX_ROUTES: 5,
    
    // Get the current authenticated user's ID
    getCurrentUserId: function() {
        try {
            // SPECIFIC IMPLEMENTATION FOR THIS PROJECT
            
            // 1. PRIORITY: Check sessionStorage for the current logged-in user
            // This is the most reliable as it matches the current session
            const sessionUser = sessionStorage.getItem('user_uid');
            if (sessionUser) {
                console.log('Found user from session storage (PRIORITY SOURCE):', sessionUser);
                return sessionUser;
            }
            
            // 2. Try Firebase auth if available
            const user = window.getCurrentUser ? window.getCurrentUser() : null;
            if (user && user.uid) {
                console.log('Found user from Firebase auth:', user.uid);
                return user.uid;
            }
            
            // 3. Try to get user from the users localStorage item as fallback
            try {
                const usersJson = localStorage.getItem('users');
                if (usersJson) {
                    const users = JSON.parse(usersJson);
                    if (Array.isArray(users) && users.length > 0) {
                        // Use the first user in the array
                        const currentUser = users[0];
                        console.log('Found current user from localStorage users array:', currentUser.uid);
                        return currentUser.uid;
                    }
                }
            } catch (err) {
                console.warn('Error parsing users from localStorage:', err);
            }
            
            // 4. Try from userData localStorage
            try {
                const userDataJson = localStorage.getItem('userData');
                if (userDataJson) {
                    const userData = JSON.parse(userDataJson);
                    if (userData && userData.uid) {
                        console.log('Found user from userData:', userData.uid);
                        return userData.uid;
                    }
                }
            } catch (err) {
                console.warn('Error parsing userData from localStorage:', err);
            }
            
            console.warn('No user ID could be detected');
            return null;
        } catch (e) {
            console.error('Error getting current user ID:', e);
            return null;
        }
    },
    
    // Save a route for the current user
    saveRoute: function(fromStopId, toStopId) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('Cannot save route: No user ID available');
            return false;
        }
        
        console.log(`Saving route for user ${userId}: ${fromStopId} → ${toStopId}`);
        
        try {
            // Create the user-specific storage key
            const storageKey = `route_history_${userId}`;
            
            // Get existing routes or initialize empty array
            let routes = [];
            const existingRoutesJson = localStorage.getItem(storageKey);
            
            if (existingRoutesJson) {
                try {
                    routes = JSON.parse(existingRoutesJson);
                    if (!Array.isArray(routes)) {
                        routes = [];
                    }
                } catch (e) {
                    console.error('Error parsing existing routes, resetting:', e);
                    routes = [];
                }
            }
            
            // Create the new route entry
            const newRoute = {
                fromStopId: parseInt(fromStopId),
                toStopId: parseInt(toStopId),
                timestamp: new Date().toISOString(),
                userId: userId
            };
            
            // Check if this route already exists (avoid duplicates)
            const existingIndex = routes.findIndex(route => 
                route.fromStopId === newRoute.fromStopId && 
                route.toStopId === newRoute.toStopId
            );
            
            if (existingIndex >= 0) {
                // Route exists, update the timestamp and move to front
                routes.splice(existingIndex, 1);
            }
            
            // Add new route to beginning (most recent first)
            routes.unshift(newRoute);
            
            // Trim to maximum routes
            if (routes.length > this.MAX_ROUTES) {
                routes = routes.slice(0, this.MAX_ROUTES);
            }
            
            // Save back to localStorage
            localStorage.setItem(storageKey, JSON.stringify(routes));
            
            // Also update lastFromStopId and lastToStopId for backward compatibility
            localStorage.setItem('lastFromStopId', fromStopId);
            localStorage.setItem('lastToStopId', toStopId);
            
            console.log(`Saved ${routes.length} routes for user ${userId}`);
            return true;
        } catch (e) {
            console.error('Error saving route:', e);
            return false;
        }
    },
    
    // Get routes for the current user
    getRoutes: function() {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('Cannot get routes: No user ID available');
            return [];
        }
        
        try {
            // Create the user-specific storage key
            const storageKey = `route_history_${userId}`;
            
            // Get routes from localStorage
            const routesJson = localStorage.getItem(storageKey);
            if (!routesJson) {
                return [];
            }
            
            // Parse and return routes
            const routes = JSON.parse(routesJson);
            if (!Array.isArray(routes)) {
                return [];
            }
            
            console.log(`Retrieved ${routes.length} routes for user ${userId}`);
            return routes;
        } catch (e) {
            console.error('Error getting routes:', e);
            return [];
        }
    },
    
    // Get the most recent route for the current user
    getMostRecentRoute: function() {
        const routes = this.getRoutes();
        return routes.length > 0 ? routes[0] : null;
    },
    
    // Clear all routes for the current user
    clearRoutes: function() {
        const userId = this.getCurrentUserId();
        if (!userId) {
            return false;
        }
        
        try {
            const storageKey = `route_history_${userId}`;
            localStorage.removeItem(storageKey);
            return true;
        } catch (e) {
            console.error('Error clearing routes:', e);
            return false;
        }
    }
};

// Make available globally
window.UserRouteHistory = UserRouteHistory;
