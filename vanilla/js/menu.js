// Script initialization and authentication management
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading indicator when Firebase and auth are ready
    document.addEventListener('firebase-ready', () => {
        console.log('Firebase ready event received in menu.js');
    });
    
    // Function to check if user has admin role
    async function checkUserRole(user) {
        console.log('Checking user role for:', user ? user.email : 'unknown user');
        
        try {
            // For demo/testing environment - hardcode admin access for specific emails
            if (user && (user.email === 'test2@gmail.com' || user.email === 'admin@example.com')) {
                console.log('ADMIN USER DETECTED based on email match:', user.email);
                try {
                    sessionStorage.setItem('user_role', 'admin');
                    console.log('Set admin role in session storage');
                } catch (e) {
                    console.warn('Failed to store admin role in session storage:', e);
                }
                return 'admin';
            }
            
            // First check if we have the role in session storage
            const storedRole = sessionStorage.getItem('user_role');
            if (storedRole) {
                console.log('Found user role in session storage:', storedRole);
                return storedRole;
            }
            
            // If not, check Firestore if available
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                console.log('Checking user role in Firestore');
                try {
                    const db = firebase.firestore();
                    // Add extra safety check for mock environment
                    if (!user || !user.uid) {
                        console.warn('No valid user UID for Firestore lookup');
                        return 'user';
                    }
                    
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    console.log('Firestore query completed');
                    
                    if (userDoc && userDoc.exists) {
                        const userData = userDoc.data();
                        console.log('User data from Firestore:', userData);
                        const role = userData.role || 'user';
                        
                        // Store role in session storage for future checks
                        try {
                            sessionStorage.setItem('user_role', role);
                            console.log('Stored user role in session storage:', role);
                        } catch (e) {
                            console.warn('Failed to store role in session storage:', e);
                        }
                        
                        console.log('User role from Firestore:', role);
                        return role;
                    } else {
                        console.log('User document not found in Firestore');
                    }
                } catch (firestoreError) {
                    console.error('Firestore query error:', firestoreError);
                }
            } else {
                console.warn('Firestore not available for role check');
            }

            // Special handling for mock environment
            console.log('Checking if we need to handle mock Firebase environment');
            const sessionUserEmail = sessionStorage.getItem('user_email');
            if (sessionUserEmail && (sessionUserEmail === 'test2@gmail.com' || sessionUserEmail === 'admin@example.com')) {
                console.log('ADMIN USER DETECTED in mock environment from session:', sessionUserEmail);
                sessionStorage.setItem('user_role', 'admin');
                return 'admin';
            }
            
            return 'user'; // Default role
        } catch (error) {
            console.error('Error checking user role:', error);
            return 'user'; // Default to user role on error
        }
    }

    // Function to redirect based on user role
    async function handleRoleBasedRedirection(user) {
        console.log('Handling role-based redirection for:', user ? user.email : 'unknown user');
        
        try {
            // Extra protection for broken environments - quick check for admin
            if (user && user.email === 'test2@gmail.com') {
                console.log('Quick admin check: admin user detected, redirecting...');
                window.location.href = 'admin-dashboard.html';
                return true;
            }
            
            const role = await checkUserRole(user);
            console.log('User role determined:', role);
            
            // Redirect based on role
            if (role === 'admin') {
                console.log('Admin user detected, redirecting to admin dashboard');
                // Force redirect to ensure it happens
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 100);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error in role-based redirection:', error);
            
            // Last resort check
            if (user && user.email === 'test2@gmail.com') {
                console.log('Post-error admin check: directing to admin dashboard');
                window.location.href = 'admin-dashboard.html';
                return true;
            }
            
            return false;
        }
    }

    // Listen for user authentication state changes
    document.addEventListener('user-signed-in', async (e) => {
        const user = e.detail;
        console.log('Auth event: User signed in detected in menu.js:', user.email);
        
        // Update user display name
        updateUserInfo(user);
        
        // Check role and redirect if admin
        const redirected = await handleRoleBasedRedirection(user);
        if (redirected) {
            console.log('User redirected based on role, skipping further initialization');
            return;
        }
        
        // User is authenticated, show the menu page
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    });
    
    document.addEventListener('user-signed-out', () => {
        console.log('Auth event: User signed out detected in menu.js');
        // Check if we might have a valid session still
        try {
            const sessionIsSignedIn = sessionStorage.getItem('user_signed_in');
            if (sessionIsSignedIn === 'true') {
                console.log('Ignoring sign-out event because session storage indicates user is still signed in');
                return; // Don't redirect if we think the user is still signed in
            }
        } catch (e) {}
        
        // Redirect to login
        console.log('Confirmed sign-out, redirecting to login');
        window.location.href = 'login.html';
    });
    
    // Legacy auth check (as backup)
    const checkAuth = async () => {
        console.log('Checking auth state in menu.js');
        // First check session storage for backup auth info
        try {
            const sessionUserEmail = sessionStorage.getItem('user_email');
            const sessionUserId = sessionStorage.getItem('user_uid');
            const isSignedIn = sessionStorage.getItem('user_signed_in');
            const userRole = sessionStorage.getItem('user_role');
            
            console.log('Session data:', { 
                email: sessionUserEmail, 
                uid: sessionUserId, 
                isSignedIn: isSignedIn,
                role: userRole 
            });
            
            // Direct check for test2@gmail.com admin
            if (sessionUserEmail === 'test2@gmail.com') {
                console.log('ADMIN USER test2@gmail.com detected in checkAuth, redirecting...');
                // Save admin role for future checks
                sessionStorage.setItem('user_role', 'admin');
                // Force redirect
                window.location.href = 'admin-dashboard.html';
                return; // Stop processing after redirect
            }
            
            if (isSignedIn === 'true' && sessionUserEmail) {
                console.log('Session storage indicates user is signed in:', sessionUserEmail);
                
                // Check if user is admin and redirect
                if (userRole === 'admin' || sessionUserEmail === 'test2@gmail.com' || sessionUserEmail === 'admin@example.com') {
                    console.log('Admin role detected from session storage, redirecting to admin dashboard');
                    // Save admin role for future checks
                    sessionStorage.setItem('user_role', 'admin');
                    // Force redirect
                    window.location.href = 'admin-dashboard.html';
                    return; // Stop processing after redirect
                }
                
                // Create a minimal user object for display
                const sessionUser = { 
                    email: sessionUserEmail,
                    uid: sessionUserId
                };
                updateUserInfo(sessionUser);
                // Hide loading overlay
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
                return; // Don't redirect, user has valid session
            }
        } catch (e) {
            console.warn('Error checking session storage:', e);
        }
        
        // Then check Firebase auth
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            const user = firebase.auth().currentUser;
            console.log('Current auth user in menu.js:', user);
            
            if (user) {
                console.log('User authenticated in menu.js:', user.email);
                
                // Check if user has admin role and redirect if needed
                handleRoleBasedRedirection(user).then(redirected => {
                    if (redirected) {
                        console.log('User redirected to admin dashboard, stopping further processing');
                        return; // Stop processing if redirected
                    }
                    
                    // Update user display name
                    updateUserInfo(user);
                    // Hide loading overlay if it's still showing
                    const loadingOverlay = document.getElementById('loading-overlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                });
            } else {
                console.log('No user found in menu.js, will check again...');
                // Wait a bit longer before giving up and redirecting
                setTimeout(() => {
                    // Check session storage again
                    try {
                        const sessionIsSignedIn = sessionStorage.getItem('user_signed_in');
                        if (sessionIsSignedIn === 'true') {
                            console.log('Session storage indicates user should be signed in');
                            // Don't redirect, user has valid session
                            const sessionEmail = sessionStorage.getItem('user_email') || 'Unknown User';
                            updateUserInfo({ email: sessionEmail });
                            // Hide loading overlay
                            const loadingOverlay = document.getElementById('loading-overlay');
                            if (loadingOverlay) {
                                loadingOverlay.style.display = 'none';
                            }
                            return;
                        }
                    } catch (e) {}
                    
                    // Final Firebase check
                    const user = firebase.auth().currentUser;
                    if (!user) {
                        console.log('Still no user found, redirecting to login');
                        window.location.href = 'login.html';
                    } else {
                        console.log('User found on second check:', user.email);
                        // Update user display name
                        updateUserInfo(user);
                        // Hide loading overlay
                        const loadingOverlay = document.getElementById('loading-overlay');
                        if (loadingOverlay) {
                            loadingOverlay.style.display = 'none';
                        }
                    }
                }, 2000); // Wait longer since this is a fallback
            }
        } else {
            console.log('Firebase not initialized yet in menu.js');
            // Try again in a bit
            setTimeout(checkAuth, 500);
        }
    };
    
    // Start auth check after a delay to give Firebase time to initialize
    setTimeout(checkAuth, 1000);

    // Function to update user info display
    const updateUserInfo = (user) => {
        try {
            console.log('Updating user info display for:', user?.email);
            const userDisplayName = document.getElementById('user-display-name');
            if (userDisplayName && user) {
                // Use display name if available, otherwise email or UID
                const displayText = user.displayName || user.email || user.uid.substring(0, 8);
                userDisplayName.textContent = displayText;
                console.log('Updated user display name to:', displayText);
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    };
    
    // Setup menu item navigation
    const setupMenuNavigation = () => {
        console.log('Setting up menu navigation');
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            // Make sure the item is clickable
            item.style.cursor = 'pointer';
            // Add specific pointer events for Safari compatibility
            item.style.pointerEvents = 'auto';
            
            item.addEventListener('click', (e) => {
                // Prevent any default behavior that might be blocking clicks
                e.preventDefault();
                e.stopPropagation();
                
                // Show loading overlay when navigating
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'flex';
                }
                
                const path = item.getAttribute('data-path');
                if (path) {
                    console.log('Navigating to:', path);
                    // Force navigation with small timeout to ensure the UI updates
                    setTimeout(() => {
                        window.location.href = path;
                    }, 50);
                }
            });
        });
        console.log('Menu navigation setup complete');
    };
    
    // Call setupMenuNavigation on page init
    setupMenuNavigation();

    // Setup language toggle
    const setupLanguageToggle = () => {
        console.log('Setting up language toggle');
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                // Toggle between English and Kurdish
                if (typeof currentLanguage !== 'undefined' && typeof setLanguage === 'function') {
                    const newLanguage = currentLanguage === 'en' ? 'ckb' : 'en';
                    setLanguage(newLanguage);
                    console.log('Language changed to:', newLanguage);
                } else {
                    console.error('Language functions not available');
                }
            });
        } else {
            console.error('Language toggle button not found');
        }
    };
    
    // Setup language toggle once i18n is loaded
    if (typeof currentLanguage !== 'undefined') {
        setupLanguageToggle();
    } else {
        // Wait for i18n to load
        const checkI18n = setInterval(() => {
            if (typeof currentLanguage !== 'undefined') {
                clearInterval(checkI18n);
                setupLanguageToggle();
            }
        }, 100);
    }

    // Setup logout button
    const setupLogoutButton = () => {
        console.log('Setting up logout button');
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    // Show loading overlay during logout
                    const loadingOverlay = document.getElementById('loading-overlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'flex';
                    }
                    
                    console.log('Logging out...');
                    // Try to use the direct Firebase method if available
                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        await firebase.auth().signOut();
                        console.log('Logged out successfully using Firebase');
                    } else if (typeof signOut === 'function') {
                        // Fallback to our wrapper function
                        await signOut();
                        console.log('Logged out successfully using wrapper');
                    } else {
                        console.error('Logout methods not available');
                    }
                    
                    // Redirect to index page
                    console.log('Redirecting to index.html');
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    // Still try to redirect on error
                    window.location.href = 'index.html';
                }
            });
        } else {
            console.error('Logout button not found');
        }
    };
    
    // Setup logout button when auth is available
    if (typeof firebase !== 'undefined') {
        setupLogoutButton();
    } else {
        // Wait for Firebase to load
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                setupLogoutButton();
            }
        }, 100);
    }

    // Initialize translations when i18n is loaded
    const initializeTranslations = () => {
        console.log('Initializing translations');
        if (typeof updatePageTranslations === 'function' && typeof updatePageDirection === 'function') {
            updatePageTranslations();
            updatePageDirection();
            console.log('Translations initialized');
        } else {
            console.log('Translation functions not available, will retry');
            setTimeout(initializeTranslations, 500);
        }
    };
    
    // Start initializing translations
    setTimeout(initializeTranslations, 500);
});

// Direct hardcoded check - run immediately
(function() {
    const email = sessionStorage.getItem('user_email');
    console.log('Immediate admin check for:', email);
    if (email === 'test2@gmail.com') {
        console.log('IMMEDIATE ADMIN CHECK: Redirecting to admin dashboard');
        window.location.href = 'admin-dashboard.html';
    }
})();

// Window load event handler (additional safety)
window.addEventListener('load', () => {
    console.log('Window loaded in menu.js');
    
    // One more check for admin user
    const email = sessionStorage.getItem('user_email');
    if (email === 'test2@gmail.com') {
        console.log('WINDOW LOAD: Admin user detected, redirecting...');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // Fix menu item styling to ensure clickability and set up direct click handlers as backup
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(`Found ${menuItems.length} menu items on window load`);
    
    menuItems.forEach(item => {
        // Style fixes
        item.style.cursor = 'pointer';
        item.style.pointerEvents = 'auto';
        
        // Direct click handler as backup
        const path = item.getAttribute('data-path');
        console.log('Setting up backup click handler for:', path);
        
        item.onclick = function(e) {
            console.log('Backup click handler triggered for:', path);
            if (path) {
                window.location.href = path;
                return false;
            }
        };
    });
    
    // Run setup again as a safety measure
    setupMenuNavigation();
    
    // Check for current user once more on window load
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
            // Check role and redirect if needed
            handleRoleBasedRedirection(user).then(redirected => {
                if (!redirected) {
                    updateUserInfo(user);
                }
            });
        }
    }
    
    // Hide loading overlay after a timeout (failsafe)
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            console.log('Hiding loading overlay (timeout failsafe)');
            loadingOverlay.style.display = 'none';
        }
    }, 5000);
    
    // Make sure menu buttons work with direct event attachment
    setTimeout(() => {
        document.querySelectorAll('.menu-item').forEach(btn => {
            const path = btn.getAttribute('data-path');
            if (path) {
                btn.onclick = function() { 
                    console.log('Final click handler triggered, going to:', path);
                    window.location.href = path; 
                    return false;
                };
            }
        });
        console.log('Final backup handlers attached');
    }, 1000);
});
