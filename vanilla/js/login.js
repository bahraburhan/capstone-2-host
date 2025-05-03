document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Disable button and show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = `<span data-i18n="auth.loggingIn">Logging in...</span>`;
        errorMessage.classList.add('hidden');

        console.log('Attempting login for:', email);

        try {
            // Use direct Firebase call instead of the wrapper function
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user);
            
            // Wait a moment to ensure auth state is properly set
            setTimeout(async () => {
                // Check if user has admin role
                try {
                    const user = userCredential.user;
                    const db = firebase.firestore();
                    let isAdmin = false;
                    
                    // Store user email in session to ensure persistence
                    sessionStorage.setItem('currentUser', user.email);
                    
                    console.log('User role check - User:', user.email);
                    
                    try {
                        // For real Firebase implementation
                        const userDoc = await db.collection('users').doc(user.uid).get();
                        console.log('User document exists:', userDoc.exists);
                        
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            console.log('User data:', userData);
                            console.log('User role:', userData.role);
                            
                            if (userData.role === 'admin') {
                                isAdmin = true;
                            }
                        }
                    } catch (dbError) {
                        console.log('Using mock mode or error accessing Firestore:', dbError);
                        
                        // In mock mode, check for admin email pattern
                        // This is a demo implementation - in production, always use secure role-based checks
                        if (user.email && (user.email.includes('admin') || sessionStorage.getItem('adminUser') === 'true')) {
                            console.log('Mock mode: Admin detected by email pattern or session flag');
                            isAdmin = true;
                            // Set session flag for admin user
                            sessionStorage.setItem('adminUser', 'true');
                        }
                    }
                    
                    if (isAdmin) {
                        // User is an admin, redirect to admin dashboard
                        console.log('Admin user detected, redirecting to admin dashboard...');
                        window.location.href = 'admin-dashboard.html';
                        return; // Ensure we exit the function after redirect
                    }
                    
                    // Regular user, redirect to menu
                    console.log('Regular user, redirecting to menu page...');
                    window.location.href = 'menu.html';
                } catch (error) {
                    console.error('Error checking user role:', error);
                    // Default to menu page if there's an error
                    window.location.href = 'menu.html';
                }
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            const errorKey = error.code?.includes('auth/') ? 'Error.invalidCredentials' : 'Error.loginFailed';
            const errorText = translations[currentLanguage][errorKey] || 'Error logging in. Please try again.';
            
            errorMessage.textContent = errorText;
            errorMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            loginButton.disabled = false;
            loginButton.innerHTML = `<span data-i18n="auth.login">Login</span>`;
            updatePageTranslations();
        }
    });

    // Update translations
    updatePageTranslations();
});
