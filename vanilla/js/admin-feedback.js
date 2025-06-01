/**
 * Admin Feedback Module
 * This file handles displaying and managing user feedback in the admin dashboard.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin feedback module initializing...');
    // Initialize feedback section
    const feedbacksContainer = document.getElementById('feedbacks-container');
    const feedbackSearch = document.getElementById('feedback-search');
    const feedbackFilter = document.getElementById('feedback-filter');
    
    console.log('Search element found:', feedbackSearch ? 'Yes' : 'No');
    console.log('Filter element found:', feedbackFilter ? 'Yes' : 'No');
    
    // Set section heading
    const feedbackNavItem = document.querySelector('li[data-section="feedbacks"]');
    if (feedbackNavItem) {
        feedbackNavItem.addEventListener('click', function() {
            console.log('Feedback section clicked');
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'User Feedback';
            }
            loadFeedbacks(); // Reload feedbacks when section is clicked
        });
    }
    
    // Initialize search functionality
    if (feedbackSearch) {
        console.log('Adding search input event listener');
        feedbackSearch.addEventListener('input', function() {
            console.log('Search input detected:', this.value);
            applyFilters();
        });
    } else {
        console.error('Feedback search element not found in DOM');
        // Try to initialize it after a slight delay
        setTimeout(() => {
            const delayedFeedbackSearch = document.getElementById('feedback-search');
            if (delayedFeedbackSearch) {
                console.log('Found search element after delay');
                delayedFeedbackSearch.addEventListener('input', function() {
                    console.log('Search input detected (delayed):', this.value);
                    applyFilters();
                });
            }
        }, 500);
    }
    
    // Initialize filter functionality
    if (feedbackFilter) {
        console.log('Adding filter change event listener');
        feedbackFilter.addEventListener('change', function() {
            console.log('Filter changed to:', this.value);
            applyFilters();
        });
    } else {
        console.error('Feedback filter element not found in DOM');
        // Try to initialize it after a slight delay
        setTimeout(() => {
            const delayedFeedbackFilter = document.getElementById('feedback-filter');
            if (delayedFeedbackFilter) {
                console.log('Found filter element after delay');
                delayedFeedbackFilter.addEventListener('change', function() {
                    console.log('Filter changed (delayed):', this.value);
                    applyFilters();
                });
            }
        }, 500);
    }
    
    // Add global event handler for when section becomes visible
    document.addEventListener('click', function(e) {
        if (e.target.closest('li[data-section="feedbacks"]')) {
            // When the feedback section is clicked, wait for it to become visible before initializing
            setTimeout(() => {
                const visibleSearch = document.getElementById('feedback-search');
                const visibleFilter = document.getElementById('feedback-filter');
                
                if (visibleSearch && !visibleSearch.hasEventListener) {
                    console.log('Adding search listener after section activation');
                    visibleSearch.addEventListener('input', function() {
                        console.log('Search input after activation:', this.value);
                        applyFilters();
                    });
                    visibleSearch.hasEventListener = true;
                }
                
                if (visibleFilter && !visibleFilter.hasEventListener) {
                    console.log('Adding filter listener after section activation');
                    visibleFilter.addEventListener('change', function() {
                        console.log('Filter changed after activation:', this.value);
                        applyFilters();
                    });
                    visibleFilter.hasEventListener = true;
                }
            }, 300);
        }
    });
    
    // Load feedbacks initially
    loadFeedbacks();
    
    // Setup feedback modal
    setupFeedbackModal();
});

/**
 * Load feedbacks from Firebase
 */
async function loadFeedbacks() {
    console.log('loadFeedbacks() called');
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    if (!feedbacksContainer) {
        console.error('Feedbacks container not found');
        return;
    }
    
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
        console.log('Fetching feedbacks from Firestore...');
        
        // Get feedbacks from Firestore, ordered by timestamp (newest first)
        const snapshot = await db.collection('feedback')
            .orderBy('timestamp', 'desc')
            .get();
        
        console.log('Received', snapshot.size, 'feedbacks from Firestore');
        
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
        
        console.log('Processed', window.allFeedbacks.length, 'feedbacks');
        
        // Make sure search and filter elements are initialized
        ensureFilterListeners();
        
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
    console.log('displayFeedbacks() called with', feedbacks.length, 'items');
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    if (!feedbacksContainer) {
        console.error('Feedbacks container not found in DOM');
        return;
    }
    
    // Force DOM reflow before clearing container
    feedbacksContainer.style.display = 'none';
    // Get the computed style to force a reflow
    window.getComputedStyle(feedbacksContainer).display;
    
    // Clear container
    feedbacksContainer.innerHTML = '';
    
    if (feedbacks.length === 0) {
        console.log('No feedbacks to display, showing empty state');
        feedbacksContainer.innerHTML = `
            <div class="no-feedbacks">
                <i class="fas fa-filter-slash"></i>
                <p>No feedbacks match your filters</p>
                <button class="secondary-button mt-3" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        // Make container visible again
        feedbacksContainer.style.display = 'grid';
        return;
    }
    
    console.log('Creating feedback cards for', feedbacks.length, 'items');
    
    // Create fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Create feedback cards
    feedbacks.forEach(feedback => {
        try {
            const card = createFeedbackCard(feedback);
            fragment.appendChild(card);
        } catch (error) {
            console.error('Error creating feedback card:', error, feedback);
        }
    });
    
    // Append all cards at once for better performance
    feedbacksContainer.appendChild(fragment);
    
    // Make container visible again and force reflow
    feedbacksContainer.style.display = 'grid';
    
    // Force browser to repaint
    setTimeout(() => {
        console.log('Forcing UI update');
        feedbacksContainer.style.opacity = '0.99';
        setTimeout(() => {
            feedbacksContainer.style.opacity = '1';
        }, 10);
    }, 0);
    
    console.log('Feedback display complete');
}

/**
 * Ensure filter listeners are attached
 */
function ensureFilterListeners() {
    console.log('Ensuring filter listeners are attached');
    
    const searchElement = document.getElementById('feedback-search');
    const filterElement = document.getElementById('feedback-filter');
    
    if (searchElement && !searchElement._hasListener) {
        searchElement.addEventListener('input', function() {
            console.log('Search input (direct):', this.value);
            applyFilters();
        });
        searchElement._hasListener = true;
        console.log('Added search listener');
    }
    
    if (filterElement && !filterElement._hasListener) {
        filterElement.addEventListener('change', function() {
            console.log('Filter changed (direct):', this.value);
            applyFilters();
        });
        filterElement._hasListener = true;
        console.log('Added filter listener');
    }
}

/**
 * Reset filters to default values
 */
function resetFilters() {
    console.log('Resetting filters');
    const searchElement = document.getElementById('feedback-search');
    const filterElement = document.getElementById('feedback-filter');
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    if (searchElement) searchElement.value = '';
    if (filterElement) filterElement.value = 'all';
    
    if (feedbacksContainer) {
        // Remove filtering state
        feedbacksContainer.removeAttribute('data-filtering');
        
        // Show all cards that might be hidden
        const allCards = document.querySelectorAll('.feedback-card');
        allCards.forEach(card => {
            card.classList.add('filtered-in');
            // Add a subtle animation
            card.style.animation = 'fadeIn 0.3s ease-in-out';
            setTimeout(() => {
                card.style.animation = '';
            }, 300);
        });
        
        console.log('All feedback cards reset and shown');
        
        // Update filter stats
        const totalShowing = document.getElementById('total-showing');
        if (totalShowing && window.allFeedbacks) {
            totalShowing.textContent = window.allFeedbacks.length;
        }
        
        // If there are no cards but we have feedbacks in memory, redisplay them
        if (allCards.length === 0 && window.allFeedbacks && window.allFeedbacks.length > 0) {
            console.log('No cards found in DOM, redisplaying all feedbacks');
            displayFeedbacks(window.allFeedbacks);
        }
    } else {
        // Fallback to reloading if container not found
        console.log('No feedbacks container found, reloading from Firebase');
        loadFeedbacks();
    }
}

/**
 * Create a feedback card element
 */
function createFeedbackCard(feedback) {
    console.log('Creating card for feedback:', feedback.id);
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.setAttribute('data-feedback-id', feedback.id);
    card.setAttribute('data-rating', feedback.overallRating || 0);
    
    // Add animation classes for filtering effect
    card.classList.add('card-animate-in');
    
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
    
    // Store important searchable content as data attributes for visibility
    card.setAttribute('data-user', (feedback.userId || '').toLowerCase());
    card.setAttribute('data-comments', (comments || '').toLowerCase());
    card.setAttribute('data-journey', (feedback.journeyId || '').toLowerCase());
    
    // Add a highlight class if this is a filtered result
    const searchElement = document.getElementById('feedback-search');
    if (searchElement && searchElement.value.trim()) {
        const searchTerm = searchElement.value.toLowerCase().trim();
        const searchWords = searchTerm.split(' ');
        const userId = (feedback.userId || '').toLowerCase();
        const feedbackComments = (feedback.comments || '').toLowerCase();
        const journeyId = (feedback.journeyId || '').toLowerCase();
        
        // Check if any search word is found in any field
        const isMatch = searchWords.some(word => 
            userId.includes(word) || 
            feedbackComments.includes(word) || 
            journeyId.includes(word)
        );
        
        if (isMatch) {
            card.classList.add('search-match');
        }
    }
    
    // Create card HTML
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
        <div class="feedback-card-footer">
            <button class="view-details-button">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;
    
    // Add click event to open modal with feedback details
    card.addEventListener('click', function() {
        console.log('Feedback card clicked:', feedback.id);
        openFeedbackModal(feedback.id);
    });
    
    // Add the animation with a small delay for a staggered effect
    setTimeout(() => {
        card.classList.add('visible');
    }, 10);
    
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
    console.log('applyFilters() called');
    if (!window.allFeedbacks) {
        console.warn('No feedbacks available to filter');
        return;
    }
    
    const searchElement = document.getElementById('feedback-search');
    const filterElement = document.getElementById('feedback-filter');
    
    if (!searchElement) {
        console.error('Search element not found when applying filters');
        return;
    }
    
    if (!filterElement) {
        console.error('Filter element not found when applying filters');
        return;
    }
    
    const searchTerm = searchElement.value.toLowerCase().trim();
    const ratingFilter = filterElement.value;
    
    console.log('Filtering with search term:', searchTerm, 'and rating:', ratingFilter);
    
    // Add visual feedback that filtering is happening
    const feedbacksContainer = document.getElementById('feedbacks-container');
    if (feedbacksContainer) {
        // Set a data attribute to mark filtering is in progress
        feedbacksContainer.setAttribute('data-filtering', 'true');
        // Add a quick flash effect to indicate filtering
        feedbacksContainer.classList.add('filtering');
    }
    
    // Use DOM-based filtering for better performance and visibility
    const allCards = document.querySelectorAll('.feedback-card');
    let matchCount = 0;
    
    // First, hide all cards
    allCards.forEach(card => {
        card.classList.remove('filtered-in');
    });
    
    // Apply filters directly to the DOM elements
    allCards.forEach(card => {
        const cardId = card.getAttribute('data-feedback-id');
        const cardRating = card.getAttribute('data-rating');
        const cardUser = card.getAttribute('data-user');
        const cardComments = card.getAttribute('data-comments');
        const cardJourney = card.getAttribute('data-journey');
        
        let matchesSearch = true;
        let matchesRating = true;
        
        // Apply search filter
        if (searchTerm) {
            const searchWords = searchTerm.split(' ');
            matchesSearch = searchWords.some(word => 
                (cardUser && cardUser.includes(word)) || 
                (cardComments && cardComments.includes(word)) || 
                (cardJourney && cardJourney.includes(word))
            );
            console.log(`Card ${cardId} matches search '${searchTerm}': ${matchesSearch}`);
        }
        
        // Apply rating filter
        if (ratingFilter !== 'all') {
            const ratingValue = parseInt(ratingFilter, 10);
            matchesRating = parseInt(cardRating) === ratingValue;
            console.log(`Card ${cardId} rating ${cardRating} matches filter ${ratingValue}: ${matchesRating}`);
        }
        
        // If card matches both filters, show it
        if (matchesSearch && matchesRating) {
            card.classList.add('filtered-in');
            matchCount++;
        }
    });
    
    console.log('Filtered cards count:', matchCount);
    
    // Show empty state if no matches
    if (matchCount === 0) {
        console.log('No feedbacks match filters, showing empty state');
        feedbacksContainer.innerHTML = `
            <div class="no-feedbacks">
                <i class="fas fa-filter-slash"></i>
                <p>No feedbacks match your filters</p>
                <button class="secondary-button mt-3" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
    }
    
    // Update filter stats
    const totalShowing = document.getElementById('total-showing');
    if (totalShowing) {
        totalShowing.textContent = matchCount;
    }
    
    // Remove filtering classes after a short delay
    setTimeout(() => {
        feedbacksContainer.classList.remove('filtering');
        feedbacksContainer.classList.add('filter-complete');
        setTimeout(() => {
            feedbacksContainer.classList.remove('filter-complete');
        }, 300);
    }, 300);
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
