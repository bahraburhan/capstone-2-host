// Admin Guard - Protects admin routes by checking user role
// This script should be loaded before admin.js

let currentAdminUser = null;

// Function to check if user has admin role
async function checkAdminRole(user) {
    if (!user) {
        return false;
    }
    
    try {
        // Get user's custom claims or role from Firestore
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.role === 'admin';
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
    }
}

// Function to display loading, auth error, or admin dashboard
function updateUIBasedOnAuth(isAdmin) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const authError = document.getElementById('auth-error');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    // Hide loading
    loadingOverlay.classList.add('hidden');
    
    if (isAdmin) {
        // Show admin dashboard if user is admin
        authError.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
    } else {
        // Show auth error if user is not admin
        authError.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
}

// Function to initialize auth guard
async function initAdminGuard() {
    try {
        console.log('Initializing admin guard...');
        
        // Wait for Firebase and Auth to be ready
        if (typeof firebase === 'undefined') {
            console.log('Firebase not loaded yet, waiting...');
            setTimeout(initAdminGuard, 500);
            return;
        }
        
        // Check current user
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User is logged in, checking admin role...');
                const isAdmin = await checkAdminRole(user);
                
                if (isAdmin) {
                    console.log('User has admin role, allowing access');
                    currentAdminUser = user;
                    
                    // Update UI
                    updateUIBasedOnAuth(true);
                    
                    // Trigger admin initialized event
                    document.dispatchEvent(new CustomEvent('admin-initialized', { 
                        detail: { user }
                    }));
                } else {
                    console.log('User does not have admin role, blocking access');
                    updateUIBasedOnAuth(false);
                }
            } else {
                console.log('No user logged in, redirecting to login');
                updateUIBasedOnAuth(false);
            }
        });
    } catch (error) {
        console.error('Error in admin guard:', error);
        updateUIBasedOnAuth(false);
    }
}

// Get current admin user
function getAdminUser() {
    return currentAdminUser;
}

// Initialize admin guard when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing admin guard...');
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Check if Firebase is already initialized
    if (window.isFirebaseInitialized && window.isFirebaseInitialized()) {
        console.log('Firebase is already initialized, checking admin role...');
        initAdminGuard();
    } else {
        // Wait for Firebase to be initialized
        document.addEventListener('firebase-ready', () => {
            console.log('Firebase is ready, checking admin role...');
            initAdminGuard();
        });
    }
});

// Export functions
window.checkAdminRole = checkAdminRole;
window.getAdminUser = getAdminUser;
