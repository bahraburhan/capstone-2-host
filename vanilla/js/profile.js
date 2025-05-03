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

            // Update user data in Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                displayName: newDisplayName,
                email: user.email,
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
            const successMsg = window.i18next ? window.i18next.t('profile.updateSuccess', 'Profile updated successfully') : 'Profile updated successfully';
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
    const handlePasswordChange = async () => {
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
    };

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
                console.log('Updating email to:', emailInput.value);
                await user.updateEmail(emailInput.value);
                await updateDisplayNameAndSaveToFirestore();
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