// Global variable to track initialization status
window.firebaseInitialized = false;

// Initialize Firebase (or use a fallback for demo purposes)
const initializeFirebase = () => {
    // Return a promise that resolves when Firebase is initialized
    return new Promise((resolve, reject) => {
        try {
            // Only initialize if not already initialized
            if (typeof firebase !== 'undefined' && !firebase.apps?.length) {
                const firebaseConfig = {
            apiKey: "AIzaSyAMcEDH5BQPl83OT1x_sQ3ORF8jz36Rwfo",
            authDomain: "capstone-2-32cf7.firebaseapp.com",
            projectId: "capstone-2-32cf7",
            storageBucket: "capstone-2-32cf7.appspot.com",
            messagingSenderId: "74061326326",
            appId: "1:74061326326:web:6a2cc2a20c98c311e309d7",
        };

                // Initialize Firebase
                try {
                    firebase.initializeApp(firebaseConfig);
                    
                    // Initialize Firebase Storage
                    const loadStorageScript = () => {
                        return new Promise((resolve, reject) => {
                            // Check if storage script is already loaded
                            if (typeof firebase.storage !== 'undefined') {
                                console.log('Firebase Storage already loaded');
                                resolve();
                                return;
                            }
                            
                            const script = document.createElement('script');
                            script.src = 'https://www.gstatic.com/firebasejs/9.19.1/firebase-storage-compat.js';
                            script.onload = () => {
                                console.log('Firebase Storage script loaded');
                                resolve();
                            };
                            script.onerror = (error) => {
                                console.error('Error loading Firebase Storage:', error);
                                reject(error);
                            };
                            document.head.appendChild(script);
                        });
                    };
                    
                    // Load Storage script if needed
                    loadStorageScript()
                        .then(() => {
                            console.log('Firebase initialized successfully with Storage');
                            window.firebaseInitialized = true;
                            // Disable email verification requirement
                            firebase.auth().settings.appVerificationDisabledForTesting = true;
                            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                            resolve(true);
                        })
                        .catch(error => {
                            console.warn('// Firebase configuration and initialization failed, but Firebase core is available:', error.message);
                            window.firebaseInitialized = true;
                            resolve(true);
                        });
                } catch (error) {
                    console.warn('Firebase initialization failed:', error.message);
                    reject(error);
                }
            } else if (firebase.apps?.length) {
                console.log('Firebase already initialized');
                window.firebaseInitialized = true;
                resolve(true);
            } else {
                console.warn('Firebase not available');
                reject(new Error('Firebase not available'));
            }
        } catch (error) {
            console.error('Error in initializeFirebase:', error);
            reject(error);
        }
    });
};

// Create mock Firebase if needed
const createMockFirebase = () => {
    if (typeof firebase === 'undefined') {
        console.warn('Creating mock Firebase for demo purposes');
        window.firebase = {
            apps: [],
            initializeApp: () => {
                window.firebase.apps.push({});
                return {};
            },
            auth: () => ({
                currentUser: null,
                onAuthStateChanged: (callback) => callback(null),
                setPersistence: () => Promise.resolve(),
                signInWithEmailAndPassword: async () => ({
                    user: { email: 'demo@example.com', uid: '123456', displayName: 'Demo User' }
                }),
                createUserWithEmailAndPassword: async () => ({
                    user: { email: 'demo@example.com', uid: '123456', displayName: 'Demo User' }
                }),
                signOut: async () => {}
            }),
            firestore: () => ({
                collection: (collectionName) => ({
                    doc: (docId) => ({
                        get: async () => {
                            // Check if this is a user document and if it contains 'admin' in the email
                            const isAdminCheck = collectionName === 'users' && 
                                                (sessionStorage.getItem('adminUser') === 'true' || 
                                                 sessionStorage.getItem('currentUser')?.includes('admin'));
                            console.log('Mock Firestore - Collection:', collectionName, 'DocId:', docId);
                            console.log('Mock Firestore - Admin check:', isAdminCheck);
                            console.log('Mock Firestore - Current user:', sessionStorage.getItem('currentUser'));
                            
                            return {
                                exists: true,
                                data: () => {
                                    const baseData = {
                                        displayName: sessionStorage.getItem('currentUser') || 'Demo User',
                                        email: sessionStorage.getItem('currentUser') || 'demo@example.com',
                                        phoneNumber: '',
                                        address: '',
                                        preferredPaymentMethod: 'cash'
                                    };
                                    
                                    // Add role field if this is an admin user
                                    if (isAdminCheck) {
                                        console.log('Mock Firestore - Returning admin role');
                                        baseData.role = 'admin';
                                    }
                                    
                                    return baseData;
                                }
                            };
                        },
                        set: async (data) => {
                            console.log('Mock Firestore - Setting data:', data);
                            // If setting role to admin, store in session
                            if (data.role === 'admin') {
                                sessionStorage.setItem('adminUser', 'true');
                            }
                        }
                    })
                })
            })
        };
        
        // Also add Auth.Persistence for mock
        window.firebase.auth.Auth = {
            Persistence: {
                LOCAL: 'LOCAL',
                SESSION: 'SESSION',
                NONE: 'NONE'
            }
        };
    }
};

// Wait for DOM to be ready and ensure Firebase is initialized
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Firebase...');
    // Try to create mock if needed
    createMockFirebase();
    // Then initialize
    initializeFirebase()
        .then(() => {
            console.log('Firebase initialization complete');
            // Dispatch a custom event to notify other scripts
            document.dispatchEvent(new CustomEvent('firebase-ready'));
        })
        .catch(error => {
            console.error('Firebase initialization failed:', error);
        });
});

// Export for immediate initialization if needed
window.initializeFirebase = initializeFirebase;
window.isFirebaseInitialized = () => window.firebaseInitialized;
