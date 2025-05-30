/**
 * Admin Feedback Module
 * This file handles displaying and managing user feedback in the admin dashboard.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback section
    const feedbacksContainer = document.getElementById('feedbacks-container');
    const feedbackSearch = document.getElementById('feedback-search');
    const feedbackFilter = document.getElementById('feedback-filter');
    
    // Set section heading
    const feedbackNavItem = document.querySelector('li[data-section="feedbacks"]');
    if (feedbackNavItem) {
        feedbackNavItem.addEventListener('click', function() {
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'User Feedback';
            }
            loadFeedbacks(); // Reload feedbacks when section is clicked
        });
    }
    
    // Initialize search functionality
    if (feedbackSearch) {
        feedbackSearch.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    // Initialize filter functionality
    if (feedbackFilter) {
        feedbackFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    // Load feedbacks initially
    loadFeedbacks();
    
    // Setup feedback modal
    setupFeedbackModal();
});

/**
 * Load feedbacks from Firebase
 */
async function loadFeedbacks() {
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    if (!feedbacksContainer) return;
    
    // Show loading state
    feedbacksContainer.innerHTML = `
        <div class="feedback-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading feedbacks...</p>
        </div>
    `;
    
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firebase is not initialized');
        }
        
        const db = firebase.firestore();
        
        // Get feedbacks from Firestore, ordered by timestamp (newest first)
        const snapshot = await db.collection('feedback')
            .orderBy('timestamp', 'desc')
            .get();
        
        if (snapshot.empty) {
            feedbacksContainer.innerHTML = `
                <div class="no-feedbacks">
                    <i class="fas fa-comment-slash"></i>
                    <p>No feedbacks found</p>
                </div>
            `;
            return;
        }
        
        // Clear container
        feedbacksContainer.innerHTML = '';
        
        // Store all feedbacks in a global variable for filtering
        window.allFeedbacks = [];
        
        // Process each feedback
        snapshot.forEach(doc => {
            const feedback = {
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to JS Date
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
            };
            
            window.allFeedbacks.push(feedback);
        });
        
        // Display all feedbacks
        displayFeedbacks(window.allFeedbacks);
        
        // Update analytics if available
        updateFeedbackAnalytics(window.allFeedbacks);
        
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        feedbacksContainer.innerHTML = `
            <div class="feedback-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading feedbacks: ${error.message}</p>
                <button class="retry-button" onclick="loadFeedbacks()">Retry</button>
            </div>
        `;
    }
}

/**
 * Display feedbacks in the container
 */
function displayFeedbacks(feedbacks) {
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    if (!feedbacksContainer) return;
    
    // Clear container
    feedbacksContainer.innerHTML = '';
    
    if (feedbacks.length === 0) {
        feedbacksContainer.innerHTML = `
            <div class="no-feedbacks">
                <i class="fas fa-filter-slash"></i>
                <p>No feedbacks match your filters</p>
            </div>
        `;
        return;
    }
    
    // Create feedback cards
    feedbacks.forEach(feedback => {
        const card = createFeedbackCard(feedback);
        feedbacksContainer.appendChild(card);
    });
}

/**
 * Create a feedback card element
 */
function createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.setAttribute('data-feedback-id', feedback.id);
    
    // Format date
    const date = feedback.timestamp instanceof Date ? 
        feedback.timestamp : 
        new Date(feedback.timestamp);
    
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create star rating HTML
    const overallRating = createStarRatingHTML(feedback.overallRating || 0);
    
    // Truncate comments if too long
    const comments = feedback.comments || '';
    const truncatedComments = comments.length > 100 ? 
        comments.substring(0, 100) + '...' : 
        comments;
    
    card.innerHTML = `
        <div class="feedback-card-header">
            <div class="feedback-user">
                <i class="fas fa-user-circle"></i>
                <span>${feedback.userId || 'Anonymous'}</span>
            </div>
            <div class="feedback-date">
                <i class="far fa-calendar-alt"></i>
                <span>${formattedDate}</span>
            </div>
        </div>
        <div class="feedback-card-body">
            <div class="feedback-rating">
                <div class="overall-rating">
                    ${overallRating}
                </div>
            </div>
            <div class="feedback-comments">
                <p>${truncatedComments || 'No comments provided'}</p>
            </div>
        </div>
      
    `;
    
    return card;
}

/**
 * Create HTML for star rating display
 */
function createStarRatingHTML(rating) {
    let starsHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? 'fas fa-star filled' : 'far fa-star';
        starsHTML += `<i class="${starClass}"></i>`;
    }
    
    return starsHTML;
}

/**
 * Apply search and filter to feedbacks
 */
function applyFilters() {
    if (!window.allFeedbacks) return;
    
    const searchTerm = document.getElementById('feedback-search').value.toLowerCase();
    const ratingFilter = document.getElementById('feedback-filter').value;
    
    let filteredFeedbacks = window.allFeedbacks;
    
    // Apply search filter
    if (searchTerm) {
        filteredFeedbacks = filteredFeedbacks.filter(feedback => {
            const userId = (feedback.userId || '').toLowerCase();
            const comments = (feedback.comments || '').toLowerCase();
            
            return userId.includes(searchTerm) || comments.includes(searchTerm);
        });
    }
    
    // Apply rating filter
    if (ratingFilter !== 'all') {
        const ratingValue = parseInt(ratingFilter);
        filteredFeedbacks = filteredFeedbacks.filter(feedback => {
            return feedback.overallRating === ratingValue;
        });
    }
    
    // Display filtered feedbacks
    displayFeedbacks(filteredFeedbacks);
}

/**
 * Set up the feedback modal
 */
function setupFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    
    // Close modal when clicking the close button
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Open feedback modal with details
 */
function openFeedbackModal(feedbackId) {
    if (!window.allFeedbacks) return;
    
    const feedback = window.allFeedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    
    // Format date
    const date = feedback.timestamp instanceof Date ? 
        feedback.timestamp : 
        new Date(feedback.timestamp);
    
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update modal content
    document.getElementById('feedback-user-email').textContent = feedback.userId || 'Anonymous';
    document.getElementById('feedback-date').textContent = formattedDate;
    
    // Update ratings
    const scheduleTimingStars = createStarRatingHTML(feedback.scheduleTiming || 0);
    const busQualityStars = createStarRatingHTML(feedback.busQuality || 0);
    const routeAccuracyStars = createStarRatingHTML(feedback.routeAccuracy || 0);
    const overallRatingStars = createStarRatingHTML(feedback.overallRating || 0);
    
    document.querySelector('.schedule-timing-stars').innerHTML = scheduleTimingStars;
    document.querySelector('.bus-quality-stars').innerHTML = busQualityStars;
    document.querySelector('.route-accuracy-stars').innerHTML = routeAccuracyStars;
    document.querySelector('.overall-rating-stars').innerHTML = overallRatingStars;
    
    // Update comments
    const commentsElement = document.querySelector('.feedback-comments p');
    if (commentsElement) {
        commentsElement.textContent = feedback.comments || 'No comments provided';
    }
    
    // Show journey ID if available
    const journeyElement = document.getElementById('feedback-journey-id');
    if (journeyElement) {
        if (feedback.journeyId) {
            journeyElement.textContent = feedback.journeyId;
            journeyElement.parentElement.style.display = 'block';
        } else {
            journeyElement.parentElement.style.display = 'none';
        }
    }
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Update feedback analytics if analytics elements exist
 */
function updateFeedbackAnalytics(feedbacks) {
    // Total feedbacks count
    const totalFeedbacksElement = document.getElementById('total-feedbacks');
    if (totalFeedbacksElement) {
        totalFeedbacksElement.textContent = feedbacks.length;
    }
    
    // Average rating
    const avgRatingElement = document.getElementById('avg-rating');
    if (avgRatingElement) {
        const totalRating = feedbacks.reduce((sum, feedback) => {
            return sum + (feedback.overallRating || 0);
        }, 0);
        
        const avgRating = feedbacks.length > 0 ? 
            (totalRating / feedbacks.length).toFixed(1) : 
            '0.0';
        
        avgRatingElement.textContent = avgRating;
    }
}
