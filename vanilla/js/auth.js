// Firebase Auth Management
// Safely get the auth instance
let auth = null;

// Safely initialize auth after making sure Firebase is loaded
const initAuth = () => {
    return new Promise((resolve, reject) => {
        console.log('Initializing auth module...');
        try {
            // Check if Firebase is available and initialized
            if (typeof firebase !== 'undefined' && (firebase.apps?.length > 0 || window.firebaseInitialized)) {
                console.log('Firebase found, initializing auth...');
                auth = firebase.auth();
                
                // Set default auth settings
                auth.useDeviceLanguage();
                
                // Explicitly enable session persistence for all browsers
                // Try to set persistence to LOCAL (survives browser restarts)
                if (firebase.auth?.Auth?.Persistence?.LOCAL) {
                    console.log('Setting auth persistence to LOCAL...');
                    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                        .then(() => {
                            console.log('Auth persistence set successfully');
                            // Store flag in localStorage as a backup indicator of persistence
                            try {
                                localStorage.setItem('auth_persistence_set', 'true');
                                console.log('Auth persistence flag set in localStorage');
                            } catch (e) {
                                console.warn('Unable to set localStorage flag for auth persistence');
                            }
                            resolve(auth);
                        })
                        .catch(error => {
                            console.error('Error setting persistence:', error);
                            // Still resolve since auth is initialized
                            resolve(auth);
                        });
                } else {
                    console.warn('Auth persistence not available, but auth is initialized');
                    resolve(auth);
                }
                
                console.log('Auth initialized successfully');
            } else {
                console.error('Firebase not available for auth initialization yet');
                reject(new Error('Firebase not available yet'));
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            reject(error);
        }
    });
};

// Function to ensure auth is initialized before use
const getAuthInstance = async () => {
    if (auth !== null) {
        return auth;
    }
    
    // Try to initialize auth
    try {
        return await initAuth();
    } catch (error) {
        console.error('Failed to get auth instance:', error);
        throw error;
    }
};

// Wait for firebase-ready event
document.addEventListener('firebase-ready', () => {
    console.log('Received firebase-ready event, initializing auth...');
    initAuth()
        .then(() => console.log('Auth initialized after firebase-ready event'))
        .catch(error => console.error('Auth initialization failed after firebase-ready:', error));
});

// Check if Firebase is already available
if (window.isFirebaseInitialized && window.isFirebaseInitialized()) {
    console.log('Firebase already initialized, initializing auth immediately...');
    initAuth()
        .then(() => console.log('Auth initialized immediately'))
        .catch(error => console.error('Immediate auth initialization failed:', error));
}

function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Sign in with email and password
async function signInWithEmailAndPassword(email, password) {
    try {
        const authInstance = await getAuthInstance();
        
        // Ensure persistence is set before sign in
        try {
            if (firebase.auth?.Auth?.Persistence?.LOCAL) {
                await authInstance.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log('Auth persistence set before sign in');
            }
        } catch (e) {
            console.warn('Could not set persistence before sign in:', e);
        }
        
        console.log('Attempting to sign in user:', email);
        const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
        console.log('Sign in successful for:', email);
        
        // Store session info as backup
        try {
            sessionStorage.setItem('user_email', userCredential.user.email);
            sessionStorage.setItem('user_uid', userCredential.user.uid);
            sessionStorage.setItem('user_signed_in', 'true');
            console.log('User session backup created');
        } catch (e) {}
        
        return userCredential.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

// Sign up with email and password
async function createUserWithEmailAndPassword(email, password) {
    try {
        const authInstance = await getAuthInstance();
        
        console.log('Attempting to create user:', email);
        const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
        console.log('User creation successful for:', email);
        return userCredential.user;
    } catch (error) {
        console.error('Auth error in createUserWithEmailAndPassword:', error);
        throw error;
    }
}

// Sign out
async function signOut() {
    try {
        const authInstance = await getAuthInstance();
        
        console.log('Attempting to sign out user');
        await authInstance.signOut();
        console.log('Sign out successful');
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

// Set up auth state observer once auth is ready
const setupAuthObserver = async () => {
    try {
        const authInstance = await getAuthInstance();
        
        // Check for redirect result in case redirect sign-in was used
        try {
            const result = await authInstance.getRedirectResult();
            if (result.user) {
                console.log('User signed in after redirect:', result.user.email);
                
                // If we're on the login page and user is authenticated, redirect to menu
                if (window.location.pathname.includes('login.html')) {
                    console.log('Redirecting to menu page from login page');
                    window.location.href = 'menu.html';
                }
            }
        } catch (e) {
            console.log('No redirect result or error occurred:', e.message);
        }
        
        // Set up auth observer
        authInstance.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                console.log('User is signed in:', user.email);
                
                // For debugging: Log persistence state if possible
                try {
                    const persistenceState = localStorage.getItem('auth_persistence_set');
                    console.log('Auth persistence state:', persistenceState);
                } catch (e) {}
                
                // Save info to sessionStorage as a backup auth mechanism
                try {
                    sessionStorage.setItem('user_email', user.email);
                    sessionStorage.setItem('user_uid', user.uid);
                    sessionStorage.setItem('user_signed_in', 'true');
                    console.log('User info stored in session storage');
                } catch (e) {
                    console.warn('Unable to store user info in session storage');
                }
                
                // If on login page and already authenticated, redirect to menu page
                if (window.location.pathname.includes('login.html')) {
                    console.log('Already authenticated, redirecting from login to menu');
                    window.location.href = 'menu.html';
                    return;
                }
                
                // Dispatch a custom event that can be listened to by other scripts
                document.dispatchEvent(new CustomEvent('user-signed-in', { detail: user }));
            } else {
                // Check if we have backup auth info in sessionStorage
                try {
                    const isSignedIn = sessionStorage.getItem('user_signed_in');
                    if (isSignedIn === 'true') {
                        console.warn('Firebase reports user is signed out but session storage indicates user should be signed in');
                        // Don't trigger sign-out event in this case
                        return;
                    }
                } catch (e) {}
                
                // User is signed out
                console.log('User is signed out');
                document.dispatchEvent(new CustomEvent('user-signed-out'));
            }
        });
        
        console.log('Auth state observer set up successfully');
    } catch (error) {
        console.error('Error setting up auth observer:', error);
        // Try again later if auth isn't ready
        setTimeout(setupAuthObserver, 1000);
    }
};

// Start observer setup when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase is ready, setting up auth observer...');
    setupAuthObserver();
});

// Also try to set up observer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit longer to make sure Firebase is ready
    setTimeout(setupAuthObserver, 1000);
});
