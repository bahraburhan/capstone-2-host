// Wait for Firebase to be ready before initializing feedback logic
function initializeFeedbackPage() {
    console.log("Initializing feedback page...");
    
    // Get journey data from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const journeyData = urlParams.get('journeyId') ? {
        id: urlParams.get('journeyId')
    } : null;

    // Initialize ratings
    let overallRating = 0;
    let scheduleTiming = 0;
    let busQuality = 0;
    let routeAccuracy = 0;
    
    // Make sure submit button is visible
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.style.display = 'block';
        submitButton.disabled = true; // Initially disabled until rating is given
    }

    // Create star rating components
    console.log("Creating star ratings...");
    createStarRating('overall-rating', (rating) => {
        overallRating = rating;
        updateSubmitButton();
    }, true);

    createStarRating('schedule-timing-rating', (rating) => {
        scheduleTiming = rating;
    });

    createStarRating('bus-quality-rating', (rating) => {
        busQuality = rating;
    });

    createStarRating('route-accuracy-rating', (rating) => {
        routeAccuracy = rating;
    });

    // Ensure textarea is editable
    const commentsInput = document.getElementById('comments');
    if (commentsInput) {
        console.log("Making textarea writable...");
        commentsInput.disabled = false;
        commentsInput.readOnly = false;
        commentsInput.style.pointerEvents = 'auto';
        
        // Force enable the textarea
        setTimeout(() => {
            commentsInput.disabled = false;
            commentsInput.readOnly = false;
        }, 500);
    }

    // Handle form submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = document.getElementById('submit-button');
            const submitText = submitButton.querySelector('.submit-text');
            const submitLoading = submitButton.querySelector('.submit-loading');

            // Show loading state
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
            submitButton.disabled = true;

            try {
                // Get comments
                const comments = document.getElementById('comments').value;

                // Submit feedback
                const result = await submitAppFeedback({
                    overallRating,
                    scheduleTiming,
                    busQuality,
                    routeAccuracy,
                    comments,
                    journeyId: journeyData?.id || null
                }, window.currentUserUid || 'anonymous');

                // Check if it was saved locally due to permission issues
                if (result.isLocal) {
                    alert('Your feedback has been saved locally. Thank you!');
                    // Reset UI instead of redirecting
                    submitText.classList.remove('hidden');
                    submitLoading.classList.add('hidden');
                    submitButton.disabled = false;
                    
                    // Reset the form
                    document.getElementById('comments').value = '';
                    updateStars(document.querySelectorAll('#overall-rating .star'), 0);
                    updateStars(document.querySelectorAll('#schedule-timing-rating .star'), 0);
                    updateStars(document.querySelectorAll('#bus-quality-rating .star'), 0);
                    updateStars(document.querySelectorAll('#route-accuracy-rating .star'), 0);
                    overallRating = scheduleTiming = busQuality = routeAccuracy = 0;
                    updateSubmitButton();
                } else {
                    // Normal flow - navigate to confirmation page
                    window.location.href = 'feedback-confirmation.html';
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
                alert('Failed to submit feedback. Please try again.');

                // Reset loading state
                submitText.classList.remove('hidden');
                submitLoading.classList.add('hidden');
                submitButton.disabled = false;
            }
        });
    }

    // Handle back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Handle ask button
    const askButton = document.getElementById('ask-button');
    if (askButton) {
        askButton.addEventListener('click', () => {
            window.location.href = 'support.html';
        });
    }

    // Setup language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', () => {
            const newLanguage = currentLanguage === 'en' ? 'ckb' : 'en';
            setLanguage(newLanguage);
        });
    }

    // Setup logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }

    // Initialize translations
    updatePageTranslations();
    updatePageDirection();

    // Update submit button state
    function updateSubmitButton() {
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.disabled = overallRating === 0;
            submitButton.style.backgroundColor = overallRating === 0 ? '#9ca3af' : '#4f46e5';
            submitButton.style.cursor = overallRating === 0 ? 'not-allowed' : 'pointer';
            console.log(`Submit button ${overallRating === 0 ? 'disabled' : 'enabled'}`);
        }
    }
}

// Create star rating component
function createStarRating(containerId, onRatingChange, isLarge = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Star rating container #${containerId} not found`);
        return;
    }
    
    console.log(`Creating star rating for ${containerId}...`);
    
    // Clear container first
    container.innerHTML = "";
    const stars = [];

    // Create and append stars
    for (let i = 0; i < 5; i++) {
        // Create star SVG
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = isLarge ? '2rem' : '1.5rem';
        star.style.height = isLarge ? '2rem' : '1.5rem';
        star.style.cursor = 'pointer';
        star.style.display = 'inline-block';
        star.style.color = '#d1d5db'; // Light gray color
        star.style.marginRight = '0.25rem';

        // Use simpler HTML entity star instead of SVG path
        star.innerHTML = '★';
        star.style.fontSize = isLarge ? '2rem' : '1.5rem';
        
        // Add click listener
        star.addEventListener('click', () => {
            const rating = i + 1;
            console.log(`Star ${i+1} clicked, setting rating to ${rating}`);
            updateStars(stars, rating);
            onRatingChange(rating);
        });

        // Add hover effects
        star.addEventListener('mouseover', () => {
            star.style.transform = 'scale(1.1)';
        });
        
        star.addEventListener('mouseout', () => {
            star.style.transform = 'scale(1)';
        });

        stars.push(star);
        container.appendChild(star);
        console.log(`Star ${i+1} added to ${containerId}`);
    }
}

// Update star colors
function updateStars(stars, rating) {
    console.log(`Updating stars to rating: ${rating}`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
            star.style.color = '#fbbf24'; // Yellow/gold color
            console.log(`Star ${index + 1} filled`);
        } else {
            star.classList.remove('filled');
            star.style.color = '#d1d5db'; // Light gray color
            console.log(`Star ${index + 1} unfilled`);
        }
    });
}

// Wait for Firebase and auth before initializing feedback page
function waitForFirebaseAndAuth() {
    console.log("Waiting for Firebase and auth...");
    
    function tryInit() {
        console.log("Trying to initialize...");
        
        if (typeof getCurrentUser !== 'function') {
            console.error("getCurrentUser is not a function, retrying...");
            setTimeout(tryInit, 300);
            return;
        }
        
        getCurrentUser().then(user => {
            if (!user) {
                console.log("No user found, redirecting to login...");
                window.location.href = 'login.html';
                return;
            }
            console.log("User authenticated:", user.uid);
            window.currentUserUid = user.uid;
            initializeFeedbackPage();
        }).catch((error) => {
            console.error("Error getting current user:", error);
            // Retry after a short delay if Firebase/auth not ready
            setTimeout(tryInit, 300);
        });
    }
    
    if (window.isFirebaseInitialized && window.isFirebaseInitialized()) {
        console.log("Firebase already initialized");
        tryInit();
    } else {
        console.log("Waiting for firebase-ready event");
        document.addEventListener('firebase-ready', tryInit);
        
        // Fallback initialization after 3 seconds if event doesn't fire
        setTimeout(() => {
            console.log("Fallback initialization after timeout");
            if (typeof getCurrentUser === 'function') {
                tryInit();
            } else {
                console.error("Firebase initialization failed, manually initializing page");
                // Initialize with anonymous/demo mode
                window.currentUserUid = 'anonymous-' + Date.now();
                initializeFeedbackPage();
            }
        }, 3000);
    }
}

// Simple translation function since getTranslation is not defined
function getTranslation(key, fallback) {
    return fallback;
}

// Submit app feedback with error handling
async function submitAppFeedback(feedbackData, userId) {
    try {
        console.log('Submitting feedback:', feedbackData);
        
        // Check if we're running in demo mode (no Firebase)
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.log('Demo mode: Simulating feedback submission');
            // Simulate successful submission in demo mode
            return { id: 'demo-' + Date.now() };
        }
        
        const db = firebase.firestore();
        
        try {
            // Try to add to Firestore (may fail due to permissions)
            const result = await db.collection('feedback').add({
                ...feedbackData,
                userId: userId || 'anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Feedback submitted successfully with ID:', result.id);
            return { id: result.id };
        } catch (firestoreError) {
            // Handle Firestore permission errors by storing locally
            console.warn('Firestore submission failed, storing locally:', firestoreError);
            
            // Save to localStorage as fallback
            const localFeedback = JSON.parse(localStorage.getItem('localFeedback') || '[]');
            const feedbackEntry = {
                ...feedbackData,
                userId: userId || 'anonymous',
                timestamp: new Date().toISOString(),
                id: 'local-' + Date.now()
            };
            localFeedback.push(feedbackEntry);
            localStorage.setItem('localFeedback', JSON.stringify(localFeedback));
            
            console.log('Feedback stored locally with ID:', feedbackEntry.id);
            return { id: feedbackEntry.id, isLocal: true };
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }
}

// Direct initialization for testing
function forceInitializePage() {
    console.log("Force initializing page without authentication");
    initializeFeedbackPage();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing page");
    
    // Remove potentially conflicting event handler from HTML
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.onclick = null;
    }
    
    // Check star containers
    document.querySelectorAll('.star-rating-container').forEach(container => {
        console.log('Star container found:', container.id);
    });
    
    // Add CSS fix for stars and textarea with more specific styling
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .star {
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
            color: #d1d5db;
            transition: color 0.2s, transform 0.2s;
            display: inline-block !important;
            text-align: center;
            line-height: 1;
            font-size: 1.5rem;
        }
        .star.filled {
            color: #fbbf24 !important;
        }
        #submit-button {
            display: block !important;
            width: 100%;
            padding: 0.75rem;
            background-color: #4f46e5;
            color: white;
            border-radius: 0.5rem;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        #submit-button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }
        .star-rating-container {
            display: flex !important;
            gap: 0.25rem !important;
            justify-content: center !important;
        }
        .comments-section textarea {
            pointer-events: auto !important;
            opacity: 1 !important;
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }

    `;
    document.head.appendChild(styleElement);
    
    // Try to wait for Firebase
    waitForFirebaseAndAuth();
    
    // Fallback direct initialization if nothing happens after 5 seconds
    setTimeout(() => {
        const starsExist = document.querySelector('.star');
        if (!starsExist) {
            console.log("Stars still not created after timeout, forcing initialization");
            forceInitializePage();
        }
    }, 5000);
});