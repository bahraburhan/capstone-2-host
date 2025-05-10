// Direct initialization approach - no waiting for multiple events
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing profile page after short delay');
    // Short timeout to ensure Firebase and other dependencies are ready
    setTimeout(initializeProfilePage, 500);
});

// Main initialization function
function initializeProfilePage() {
    console.log('Initializing profile page');
    
    // Get DOM elements - with null checks
    const loadingState = document.getElementById('loading-state');
    const profileContent = document.getElementById('profile-content');
    const profileForm = document.getElementById('profile-form');
    const displayNameInput = document.getElementById('displayName');
    const emailInput = document.getElementById('email');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const addressInput = document.getElementById('address');
    const editProfileButton = document.getElementById('edit-profile');
    const saveProfileButton = document.getElementById('save-profile');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Optional elements (password related)
    const passwordForm = document.getElementById('password-form');
    const changePasswordButton = document.getElementById('change-password');
    const cancelPasswordButton = document.getElementById('cancel-password');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const reAuthModal = document.getElementById('reauth-modal');
    const verifyButton = document.getElementById('verify-button');
    const cancelReAuthButton = document.getElementById('cancel-reauth');
    const reAuthPasswordInput = document.getElementById('reauth-password');

    // Verify critical elements exist
    if (!loadingState || !profileContent || !profileForm || !displayNameInput || !emailInput || 
        !editProfileButton || !saveProfileButton) {
        console.error('Critical page elements missing', {
            loadingState: !!loadingState,
            profileContent: !!profileContent,
            profileForm: !!profileForm,
            displayNameInput: !!displayNameInput,
            emailInput: !!emailInput,
            editProfileButton: !!editProfileButton,
            saveProfileButton: !!saveProfileButton
        });
        // Still try to continue but show error
        if (errorMessage) {
            errorMessage.textContent = 'Page loading error. Please refresh the page.';
            errorMessage.classList.remove('hidden');
        }
    }

    // State variables
    let editMode = false;
    let updating = false;
    let pendingAction = null;

    // Toggle edit mode
    function toggleEditMode(enabled) {
        console.log('Toggling edit mode:', enabled);
        editMode = enabled;
        
        // Safety check for inputs before modifying them
        const inputs = [displayNameInput, emailInput, phoneNumberInput, addressInput]
            .filter(input => input !== null);
            
        if (inputs.length === 0) {
            console.error('No input elements found to toggle edit mode');
            return;
        }
        
        inputs.forEach(input => {
            if (input) {
                input.disabled = !enabled;
                console.log(`Set ${input.id} disabled: ${!enabled}`);
            }
        });
        
        if (editProfileButton) {
            editProfileButton.classList.toggle('hidden', enabled);
            console.log('Edit button hidden:', enabled);
        }
        if (saveProfileButton) {
            saveProfileButton.classList.toggle('hidden', !enabled);
            console.log('Save button hidden:', !enabled);
        }
    }

    // Show error message
    function showError(message) {
        console.error('Error:', message);
        if (errorMessage) {
            // Clear any existing timeouts
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            // Hide success message if it's showing
            if (successMessage && !successMessage.classList.contains('hidden')) {
                successMessage.classList.add('hidden');
            }
            
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            
            // Auto-hide error message after 5 seconds
            window.statusMessageTimeout = setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 5000);
        } else {
            // Fallback if error element not found
            alert('Error: ' + message);
        }
    }

    // Show success message
    function showSuccess(message) {
        console.log('Success:', message);
        if (successMessage) {
            // Clear any existing timeouts
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            // Hide error message if it's showing
            if (errorMessage && !errorMessage.classList.contains('hidden')) {
                errorMessage.classList.add('hidden');
            }
            
            successMessage.textContent = message;
            successMessage.classList.remove('hidden');
            
            // Auto-hide success message after 5 seconds
            window.statusMessageTimeout = setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
            
            // Scroll to top if needed to ensure visibility
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Fallback if success element not found
            alert('Success: ' + message);
        }
    }

    // Clear messages
    function clearMessages() {
        if (errorMessage) errorMessage.classList.add('hidden');
        if (successMessage) successMessage.classList.add('hidden');
    }

    // Save profile changes
    async function saveProfile() {
        console.log('Save profile function called');
        
        // Safety check for required inputs
        if (!displayNameInput || !displayNameInput.value.trim()) {
            showError('Name is required.');
            return;
        }

        updating = true;
        if (saveProfileButton) saveProfileButton.disabled = true;
        clearMessages();
        
        try {
            console.log('Attempting to save profile changes...');
            
            // Check if email changed and needs re-auth
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            // If email is changed and reAuthModal exists, require re-authentication
            if (emailInput && user.email && emailInput.value !== user.email && reAuthModal) {
                console.log('Email changed, requiring re-authentication');
                pendingAction = 'updateProfile';
                reAuthModal.classList.remove('hidden');
                return;
            }
            
            // If no reauthentication is needed, proceed to save changes
            await updateDisplayNameAndSaveToFirestore();
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Failed to save changes. Please try again.');
        } finally {
            updating = false;
            if (saveProfileButton) saveProfileButton.disabled = false;
        }
    }

    // Update display name and save to Firestore
    async function updateDisplayNameAndSaveToFirestore() {
        try {
            updating = true;
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('You must be logged in to update your profile');
            }

            // Validate display name
            const newDisplayName = displayNameInput ? displayNameInput.value.trim() : '';
            if (!newDisplayName) {
                throw new Error('Display name cannot be empty');
            }

            // Get other form values with null checks
            const phoneNumber = phoneNumberInput ? phoneNumberInput.value.trim() : '';
            const address = addressInput ? addressInput.value.trim() : '';

            // Show a loading state or disable save button if you have one
            if (saveProfileButton) {
                saveProfileButton.disabled = true;
                saveProfileButton.textContent = 'Saving...';
            }

            // Update user profile in Firebase Auth
            await user.updateProfile({
                displayName: newDisplayName
            });

            // Get the most current email value from input or user object
            const currentEmail = (emailInput && emailInput.value.trim()) || user.email;
            
            // Update user data in Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                displayName: newDisplayName,
                email: currentEmail,
                phoneNumber: phoneNumber,
                address: address,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Update the navigation bar display name
            const userDisplayNameElement = document.getElementById('user-display-name');
            if (userDisplayNameElement) {
                userDisplayNameElement.textContent = newDisplayName;
            }

            // Reset save button
            if (saveProfileButton) {
                saveProfileButton.disabled = false;
                saveProfileButton.textContent = 'Save';
            }

            // Show success with translation support
            const successMsg = window.i18next ? 
                window.i18next.t('profile.updateSuccess', 'Profile updated successfully') : 
                'Profile updated successfully';
            showSuccess(successMsg);
            toggleEditMode(false);
        } catch (error) {
            showError('Failed to update profile: ' + error.message);
            // Reset save button on error too
            if (saveProfileButton) {
                saveProfileButton.disabled = false;
                saveProfileButton.textContent = 'Save';
            }
        } finally {
            updating = false;
        }
    }

    // Handle password change
    async function handlePasswordChange() {
        if (!newPasswordInput || !confirmPasswordInput) {
            showError('Password form elements not found.');
            return;
        }
        
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            showError('New passwords do not match.');
            return;
        }

        updating = true;
        clearMessages();

        try {
            pendingAction = 'updatePassword';
            if (reAuthModal) {
                reAuthModal.classList.remove('hidden');
            } else {
                showError('Re-authentication component not found.');
                updating = false;
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showError('Failed to change password. Please try again.');
            updating = false;
        }
    }

    // Complete password change after re-authentication
    async function completePasswordChange() {
        if (!newPasswordInput) {
            showError('Password input not found.');
            return;
        }
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('User not authenticated');
            
            await user.updatePassword(newPasswordInput.value);
            showSuccess('Password changed successfully.');
            
            if (passwordForm) {
                passwordForm.reset();
                passwordForm.classList.add('hidden');
            }
            if (profileForm) {
                profileForm.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            showError('Failed to change password. Please try again.');
        }
    }
    
    // Helper function to migrate user data between accounts
    async function migrateUserData(oldUid, newUid) {
        console.log(`Migrating user data from ${oldUid} to ${newUid}`);
        const db = firebase.firestore();
        
        try {
            // 1. Copy user feedback history
            const feedbackQuery = await db.collection('feedback')
                .where('userId', '==', oldUid)
                .get();
                
            if (!feedbackQuery.empty) {
                console.log(`Migrating ${feedbackQuery.size} feedback records`);
                const batch = db.batch();
                
                feedbackQuery.forEach(doc => {
                    const newFeedbackRef = db.collection('feedback').doc();
                    const feedbackData = {
                        ...doc.data(),
                        userId: newUid,
                        oldUserId: oldUid,
                        migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    batch.set(newFeedbackRef, feedbackData);
                });
                
                await batch.commit();
                console.log('Feedback data migration complete');
            }
            
            // 2. Copy user route history
            const routeHistoryQuery = await db.collection('routeHistory')
                .where('userId', '==', oldUid)
                .get();
                
            if (!routeHistoryQuery.empty) {
                console.log(`Migrating ${routeHistoryQuery.size} route history records`);
                const batch = db.batch();
                
                routeHistoryQuery.forEach(doc => {
                    const newRouteRef = db.collection('routeHistory').doc();
                    const routeData = {
                        ...doc.data(),
                        userId: newUid,
                        oldUserId: oldUid,
                        migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    batch.set(newRouteRef, routeData);
                });
                
                await batch.commit();
                console.log('Route history migration complete');
            }
            
            // 3. Create a migration record for reference
            await db.collection('userMigrations').doc().set({
                oldUid: oldUid,
                newUid: newUid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            });
            
            console.log('User data migration completed successfully');
            return true;
        } catch (migrationError) {
            console.error('Error during data migration:', migrationError);
            // Still return true - we don't want to fail the whole operation if migration has issues
            return false;
        }
    }

    // Re-authenticate user
    async function reAuthenticateUser() {
        if (!reAuthPasswordInput || !reAuthPasswordInput.value) {
            showError('Please enter your password.');
            return;
        }

        if (verifyButton) verifyButton.disabled = true;
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('User not authenticated');
            
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                reAuthPasswordInput.value
            );
            
            await user.reauthenticateWithCredential(credential);
            console.log('User re-authenticated successfully');

            if (pendingAction === 'updateProfile' && emailInput) {
                const newEmail = emailInput.value.trim();
                console.log('Processing email update to:', newEmail);
                
                // Verify the new email is different from the current one
                if (newEmail === user.email) {
                    toggleEditMode(false); // Close edit mode
                    return; // No need to update if email hasn't changed
                }
                
                try {
                    // Show loading state
                    if (saveProfileButton) {
                        saveProfileButton.textContent = 'Migrating Account...';
                        saveProfileButton.disabled = true;
                    }
                    
                    // 1. Get current user data
                    const oldUid = user.uid;
                    const newDisplayName = displayNameInput ? displayNameInput.value.trim() : user.displayName || '';
                    const phoneNumber = phoneNumberInput ? phoneNumberInput.value.trim() : '';
                    const address = addressInput ? addressInput.value.trim() : '';
                    
                    // 2. Get current user's Firestore data
                    console.log('Fetching current user data from Firestore...');
                    const userDoc = await firebase.firestore().collection('users').doc(oldUid).get();
                    let userData = {};
                    if (userDoc.exists) {
                        userData = userDoc.data();
                        console.log('Current user data retrieved:', userData);
                    }
                    
                    // 3. Create a new user account with the new email
                    console.log('Creating new account with email:', newEmail);
                    try {
                        // Get the current user's password from re-auth input field
                        const currentPassword = reAuthPasswordInput.value;
                        
                        // Create the new user account
                        const newUserCredential = await firebase.auth().createUserWithEmailAndPassword(newEmail, currentPassword);
                        const newUser = newUserCredential.user;
                        console.log('New user account created:', newUser.uid);
                        
                        // Update the display name on the new account
                        await newUser.updateProfile({ displayName: newDisplayName });
                        
                        // 4. Copy all user data to the new account in Firestore
                        await firebase.firestore().collection('users').doc(newUser.uid).set({
                            ...userData,
                            displayName: newDisplayName,
                            email: newEmail,
                            phoneNumber: phoneNumber,
                            address: address,
                            previousUid: oldUid, // Keep track of previous UID
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        // 5. Update any other collections that reference this user
                        // For example, copy user history, feedback, etc.
                        await migrateUserData(oldUid, newUser.uid);
                        
                        // 6. Success message will be shown after deletion attempt
                        
                        // 7. Delete the old user account
                        try {
                            // Get a new auth token to delete the old account
                            const oldUserAuth = firebase.auth.EmailAuthProvider.credential(
                                user.email,
                                currentPassword
                            );
                            
                            await user.reauthenticateWithCredential(oldUserAuth);
                            console.log('Re-authenticated for account deletion');
                            
                            // Delete the old user account
                            await user.delete();
                            console.log('Old user account deleted successfully');
                            
                            showSuccess('Email has been updated successfully! Your account has been migrated to the new email address ' + newEmail + ' Please login again.');
                        } catch (deleteError) {
                            console.error('Error deleting old account:', deleteError);
                            // Continue with sign out even if delete fails
                            showSuccess('Email has been updated successfully! Your account has been migrated to the new email address ' + newEmail + '. Please login again. ');
                        }
                        
                        // 8. Sign out and redirect to login page
                        setTimeout(() => {
                            firebase.auth().signOut().then(() => {
                                console.log('User signed out, redirecting to login');
                                // Clear all localStorage except language preference
                                const languagePref = localStorage.getItem('language');
                                localStorage.clear();
                                if (languagePref) localStorage.setItem('language', languagePref);
                                
                                // Redirect to login page
                                window.location.href = 'login.html?emailChanged=true&email=' + encodeURIComponent(newEmail);
                            });
                        }, 3000); // Give time to see the success message
                        
                        return; // Stop further processing
                    } catch (createError) {
                        console.error('Error creating new account:', createError);
                        
                        if (createError.code === 'auth/email-already-in-use') {
                            showError('This email is already in use by another account. Please choose a different email.');
                        } else {
                            showError('Failed to update email: ' + createError.message);
                        }
                        
                        // Revert input value to current email
                        if (emailInput) emailInput.value = user.email;
                        
                        // Reset button state
                        if (saveProfileButton) {
                            saveProfileButton.textContent = 'Save';
                            saveProfileButton.disabled = false;
                        }
                        return;
                    }
                } catch (error) {
                    console.error('Error during account migration:', error);
                    showError('Account migration failed: ' + error.message);
                    
                    // Revert input value to current email
                    if (emailInput) emailInput.value = user.email;
                    
                    // Reset button state
                    if (saveProfileButton) {
                        saveProfileButton.textContent = 'Save';
                        saveProfileButton.disabled = false;
                    }
                }
            } else if (pendingAction === 'updatePassword') {
                await completePasswordChange();
            }
            
            if (reAuthModal) {
                reAuthModal.classList.add('hidden');
            }
            if (reAuthPasswordInput) {
                reAuthPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Re-authentication error:', error);
            showError('Invalid password. Please try again.');
        } finally {
            if (verifyButton) verifyButton.disabled = false;
            updating = false;
        }
    }

    // Fetch user data
    async function fetchUserData() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            console.log('Fetching user data for:', user.uid);
            console.log('User auth data:', {
                displayName: user.displayName,
                email: user.email,
                phoneNumber: user.phoneNumber
            });
            
            const initialData = {
                displayName: user.displayName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: '',
                preferredPaymentMethod: 'cash'
            };

            // Try to get additional info from Firestore
            try {
                console.log('Attempting to fetch Firestore data for user:', user.uid);
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    console.log('Firestore data found:', userDoc.data());
                    const firestoreData = userDoc.data();
                    // Merge data, prioritizing Firestore data but keeping auth data for core fields
                    Object.assign(initialData, firestoreData, {
                        displayName: user.displayName || firestoreData.displayName || '',
                        email: user.email || firestoreData.email || ''
                    });
                } else {
                    console.log('No Firestore data found for user, creating default document');
                    // Create a default document if none exists
                    await firebase.firestore().collection('users').doc(user.uid).set({
                        displayName: user.displayName || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                        address: '',
                        preferredPaymentMethod: 'cash',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } catch (firestoreError) {
                console.error('Error fetching user data from Firestore:', firestoreError);
            }

            // Verify we have the form inputs before setting values
            if (!displayNameInput || !emailInput) {
                console.error('Critical form elements missing when trying to set values');
                if (loadingState) loadingState.classList.add('hidden');
                if (profileContent) profileContent.classList.remove('hidden');
                showError('Error loading profile data. Some form elements are missing.');
                return;
            }

            // Update form fields
            console.log('Setting form field values:', initialData);
            displayNameInput.value = initialData.displayName;
            emailInput.value = initialData.email;
            
            if (phoneNumberInput) phoneNumberInput.value = initialData.phoneNumber;
            if (addressInput) addressInput.value = initialData.address || '';
            
            // Make sure all inputs are properly disabled in view mode
            toggleEditMode(false);
            
            // Show profile content
            if (loadingState) loadingState.classList.add('hidden');
            if (profileContent) profileContent.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading profile:', error);
            showError('Failed to load profile information. Please try again.');
            
            // Still hide loading and show content
            if (loadingState) loadingState.classList.add('hidden');
            if (profileContent) profileContent.classList.remove('hidden');
        }
    }

    // Set up event listeners - with verification that elements exist
    if (editProfileButton) {
        console.log('Attaching click listener to edit button');
        editProfileButton.addEventListener('click', () => {
            console.log('Edit button clicked');
            clearMessages();
            toggleEditMode(true);
        });
    } else {
        console.error('Edit profile button not found');
    }
    
    if (saveProfileButton) {
        console.log('Attaching click listener to save button');
        saveProfileButton.addEventListener('click', () => {
            console.log('Save button clicked');
            clearMessages();
            saveProfile();
        });
    } else {
        console.error('Save profile button not found');
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Profile form submitted');
            saveProfile();
        });
    }

    // Password-related event listeners
    if (changePasswordButton && passwordForm) {
        changePasswordButton.addEventListener('click', () => {
            clearMessages();
            profileForm.classList.add('hidden');
            passwordForm.classList.remove('hidden');
        });
    }

    if (cancelPasswordButton && passwordForm && profileForm) {
        cancelPasswordButton.addEventListener('click', () => {
            clearMessages();
            passwordForm.reset();
            passwordForm.classList.add('hidden');
            profileForm.classList.remove('hidden');
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePasswordChange();
        });
    }

    if (verifyButton) {
        verifyButton.addEventListener('click', reAuthenticateUser);
    }

    if (cancelReAuthButton && reAuthModal) {
        cancelReAuthButton.addEventListener('click', () => {
            reAuthModal.classList.add('hidden');
            if (reAuthPasswordInput) reAuthPasswordInput.value = '';
            updating = false;
            pendingAction = null;
        });
    }

    // Check authentication and start fetching data
    const user = firebase.auth().currentUser;
    
    if (user) {
        console.log('User already authenticated:', user.email);
        fetchUserData();
    } else {
        console.log('Waiting for authentication...');
        firebase.auth().onAuthStateChanged(function(authUser) {
            if (authUser) {
                console.log('User authenticated:', authUser.email);
                fetchUserData();
            } else {
                console.log('No authenticated user, redirecting to login');
                window.location.href = 'login.html';
            }
        });
    }
}

// Fallback to ensure profile is initialized
setTimeout(() => {
    if (document.getElementById('loading-state') && 
        !document.getElementById('loading-state').classList.contains('hidden')) {
        console.log('Fallback initialization triggered');
        initializeProfilePage();
    }
}, 5000);