/**
 * Debug helper for route history
 * This script adds a debug button to help diagnose user-specific route history issues
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Route History Debugger Loaded');
    
    // Create debug button
    const debugButton = document.createElement('button');
    debugButton.innerText = 'Debug Route History';
    debugButton.className = 'debug-button';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '20px';
    debugButton.style.left = '20px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '8px 12px';
    debugButton.style.backgroundColor = '#f44336';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.cursor = 'pointer';
    debugButton.style.fontWeight = 'bold';
    
    // Add debug button to the page (only in non-production environments)
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('capstone-2-32cf7')) {
        document.body.appendChild(debugButton);
    }
    
    // Handle debug button click
    debugButton.addEventListener('click', () => {
        // Output current user and route history information
        showDebugInfo();
    });
    
    // Function to show debug info
    function showDebugInfo() {
        console.log('=== ROUTE HISTORY DEBUG INFO ===');
        
        // 1. Check current user detection methods
        const userInfo = {
            // Try all methods of getting user info
            fromFirebase: window.getCurrentUser ? window.getCurrentUser() : null,
            fromSessionStorage: {
                email: sessionStorage.getItem('user_email'),
                uid: sessionStorage.getItem('user_uid'),
                signedIn: sessionStorage.getItem('user_signed_in')
            },
            fromLocalStorage: {
                users: getUsersFromLocalStorage(),
                userData: getUserDataFromLocalStorage()
            }
        };
        
        console.log('User Detection Methods:', userInfo);
        
        // 2. Check user route history
        let userRouteHistory = null;
        if (window.UserRouteHistory) {
            const userId = window.UserRouteHistory.getCurrentUserId();
            console.log('Detected User ID:', userId);
            
            if (userId) {
                const routes = window.UserRouteHistory.getRoutes();
                console.log('User Routes:', routes);
                
                // Check localStorage directly
                const directKey = `route_history_${userId}`;
                const directRoutes = localStorage.getItem(directKey);
                console.log('Direct localStorage route key:', directKey);
                console.log('Direct localStorage routes:', directRoutes);
                
                userRouteHistory = {
                    userId: userId,
                    routes: routes,
                    directRoutes: directRoutes
                };
            } else {
                console.warn('No user ID detected for route history');
            }
        } else {
            console.error('UserRouteHistory manager not available');
        }
        
        // 3. Check generic route storage
        const genericRoutes = {
            lastFromStopId: localStorage.getItem('lastFromStopId'),
            lastToStopId: localStorage.getItem('lastToStopId')
        };
        
        console.log('Generic Routes:', genericRoutes);
        
        // 4. Display debug info on page
        showDebugModal({
            user: userInfo,
            routeHistory: userRouteHistory,
            genericRoutes: genericRoutes,
            allStorage: getAllLocalStorage()
        });
    }
    
    // Helper to get users from localStorage
    function getUsersFromLocalStorage() {
        try {
            const usersJson = localStorage.getItem('users');
            return usersJson ? JSON.parse(usersJson) : null;
        } catch (e) {
            return `Error parsing: ${e.message}`;
        }
    }
    
    // Helper to get userData from localStorage
    function getUserDataFromLocalStorage() {
        try {
            const userDataJson = localStorage.getItem('userData');
            return userDataJson ? JSON.parse(userDataJson) : null;
        } catch (e) {
            return `Error parsing: ${e.message}`;
        }
    }
    
    // Get all localStorage items
    function getAllLocalStorage() {
        const storage = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const value = localStorage.getItem(key);
                storage[key] = value;
            } catch (e) {
                storage[key] = `Error reading: ${e.message}`;
            }
        }
        return storage;
    }
    
    // Create and show debug modal
    function showDebugModal(data) {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'debug-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // Create modal content
        const content = document.createElement('div');
        content.className = 'debug-modal-content';
        content.style.backgroundColor = 'white';
        content.style.padding = '20px';
        content.style.borderRadius = '10px';
        content.style.width = '80%';
        content.style.maxWidth = '800px';
        content.style.maxHeight = '80vh';
        content.style.overflow = 'auto';
        
        // Add header
        const header = document.createElement('h2');
        header.innerText = 'Route History Debug Info';
        header.style.color = '#333';
        content.appendChild(header);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#ddd';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        content.appendChild(closeButton);
        
        // Add debug data
        const dataContainer = document.createElement('div');
        dataContainer.style.marginTop = '20px';
        
        // Add user info section
        const userSection = document.createElement('div');
        userSection.innerHTML = `
            <h3>Current User</h3>
            <pre>${JSON.stringify(data.user, null, 2)}</pre>
            
            <h3>User Route History</h3>
            <pre>${JSON.stringify(data.routeHistory, null, 2)}</pre>
            
            <h3>Generic Routes</h3>
            <pre>${JSON.stringify(data.genericRoutes, null, 2)}</pre>
            
            <h3>All localStorage Items</h3>
            <pre>${JSON.stringify(data.allStorage, null, 2)}</pre>
        `;
        dataContainer.appendChild(userSection);
        
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy Debug Data';
        copyButton.style.padding = '10px 15px';
        copyButton.style.backgroundColor = '#4CAF50';
        copyButton.style.color = 'white';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.marginTop = '20px';
        copyButton.addEventListener('click', () => {
            const debugText = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(debugText)
                .then(() => {
                    alert('Debug data copied to clipboard');
                })
                .catch(err => {
                    console.error('Could not copy debug data:', err);
                });
        });
        dataContainer.appendChild(copyButton);
        
        // Add to modal
        content.appendChild(dataContainer);
        modal.appendChild(content);
        
        // Add to page
        document.body.appendChild(modal);
    }
});
