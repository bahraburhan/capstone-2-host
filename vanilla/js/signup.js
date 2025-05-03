document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signupButton = document.getElementById('signup-button');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const address = document.getElementById('address').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Disable button and show loading state
        signupButton.disabled = true;
        signupButton.innerHTML = `<span data-i18n="auth.creatingAccount">Creating account...</span>`;
        errorMessage.classList.add('hidden');

        console.log('Starting signup process with:', email);

        try {
            // Wait to ensure Firebase is fully loaded
            if (typeof firebase === 'undefined') {
                console.error('Firebase is not defined. Waiting...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase not available after waiting');
            }
            
            // Using direct Firebase authentication for clarity and debug
            console.log('Creating user account...');
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log('User created successfully:', userCredential);
            
            // Give Firebase a moment to register the new user
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update profile with display name (first and last name)
            console.log('Updating user profile...');
            if (firebase.auth().currentUser) {
                await firebase.auth().currentUser.updateProfile({
                    displayName: `${firstName} ${lastName}`
                });
                console.log('Profile updated with name:', `${firstName} ${lastName}`);
            } else {
                console.error('No current user found to update profile');
            }

            // Save additional user data to Firestore
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                console.log('Saving user data to Firestore...');
                try {
                    await firebase.firestore().collection('users').doc(userId).set({
                        displayName: `${firstName} ${lastName}`,
                        email: email,
                        address: address,
                        createdAt: new Date()
                    });
                    console.log('User data saved to Firestore');
                } catch (firestoreError) {
                    console.error('Error saving to Firestore:', firestoreError);
                    // Continue even if Firestore save fails
                }
            }

            console.log('Signup complete, redirecting to menu...');
            
            // Wait a moment to ensure auth state is properly set before navigation
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            let errorKey = 'Error.createAccount';
            
            if (error.code === 'auth/email-already-in-use') {
                errorKey = 'Error.emailInUse';
            } else if (error.code === 'auth/weak-password') {
                errorKey = 'Error.weakPassword';
            }

            const errorText = translations[currentLanguage][errorKey] || 'Error creating account. Please try again.';
            errorMessage.textContent = errorText;
            errorMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            signupButton.disabled = false;
            signupButton.innerHTML = `<span data-i18n="auth.createAccount">Create Account</span>`;
            updatePageTranslations();
        }
    });

    // Update translations
    updatePageTranslations();
});
