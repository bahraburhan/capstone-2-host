// Admin Feedback and Analytics Functionality
let feedbacksList = [];
let feedbackPage = 1;
let totalFeedbackPages = 1;
const feedbacksPerPage = 9;
let currentFeedbackData = null;

// Load all feedbacks from Firestore
async function loadFeedbacks() {
    const feedbacksContainer = document.getElementById('feedbacks-container');
    feedbacksContainer.innerHTML = `
        <div class="feedback-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading feedbacks...</p>
        </div>
    `;
    
    try {
        // Get all feedbacks from Firestore sorted by timestamp (newest first)
        const snapshot = await firebase.firestore().collection('feedback')
            .orderBy('timestamp', 'desc')
            .get();
        
        // Map Firestore documents to our data structure
        feedbacksList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Handle empty state
        if (feedbacksList.length === 0) {
            feedbacksContainer.innerHTML = `
                <div class="feedback-loading">
                    <i class="fas fa-comment-slash"></i>
                    <p>No feedbacks found</p>
                </div>
            `;
            return;
        }
        
        // Calculate pagination
        totalFeedbackPages = Math.ceil(feedbacksList.length / feedbacksPerPage);
        if (totalFeedbackPages === 0) totalFeedbackPages = 1;
        feedbackPage = 1;
        
        // Display feedbacks and update pagination
        displayFeedbacks();
        updateFeedbackPagination();
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        feedbacksContainer.innerHTML = `
            <div class="feedback-loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading feedbacks: ${error.message}</p>
            </div>
        `;
    }
}

// Display feedbacks with pagination
function displayFeedbacks() {
    const feedbacksContainer = document.getElementById('feedbacks-container');
    
    // Calculate pagination
    const startIndex = (feedbackPage - 1) * feedbacksPerPage;
    const endIndex = Math.min(startIndex + feedbacksPerPage, feedbacksList.length);
    const feedbacksToDisplay = feedbacksList.slice(startIndex, endIndex);
    
    if (feedbacksToDisplay.length === 0) {
        feedbacksContainer.innerHTML = `
            <div class="feedback-loading">
                <i class="fas fa-comment-slash"></i>
                <p>No feedbacks found</p>
            </div>
        `;
        return;
    }
    
    // Generate feedback cards
    feedbacksContainer.innerHTML = feedbacksToDisplay.map(feedback => {
        // Format date
        const date = feedback.timestamp 
            ? new Date(feedback.timestamp.seconds * 1000).toLocaleDateString() 
            : 'N/A';
        
        // Generate stars for overall rating
        const stars = Array(5).fill(0).map((_, index) => {
            return index < (feedback.overallRating || 0) ? 
                '<i class="fas fa-star"></i>' : 
                '<i class="far fa-star"></i>';
        }).join('');
        
        // Truncate comments
        const comments = feedback.comments || 'No comments provided';
        const truncatedComments = comments.length > 100 ? 
            comments.substring(0, 100) + '...' : 
            comments;
        
        // Try to get user email from userId
        const userIdDisplay = feedback.userId && feedback.userId !== 'anonymous' 
            ? feedback.userId.substring(0, 8) + '...' 
            : 'Anonymous';
        
        return `
            <div class="feedback-card" data-feedback-id="${feedback.id}">
                <div class="feedback-header">
                    <span class="feedback-user" title="${feedback.userId || 'Anonymous'}">${userIdDisplay}</span>
                    <span class="feedback-date">${date}</span>
                </div>
                <div class="feedback-rating">
                    <div class="feedback-stars">${stars}</div>
                    <span>Overall Rating: ${feedback.overallRating || 0}/5</span>
                </div>
                <div class="feedback-text">
                    ${truncatedComments}
                </div>
                <div class="feedback-footer">
                    <span class="view-details">
                        View Details <i class="fas fa-chevron-right"></i>
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for feedback cards
    addFeedbackCardListeners();
}

// Add event listeners to feedback cards
function addFeedbackCardListeners() {
    document.querySelectorAll('.feedback-card').forEach(card => {
        card.querySelector('.view-details').addEventListener('click', () => {
            const feedbackId = card.getAttribute('data-feedback-id');
            openFeedbackDetailsModal(feedbackId);
        });
    });
}

// Update feedback pagination controls
function updateFeedbackPagination() {
    const prevButton = document.getElementById('feedback-prev-page');
    const nextButton = document.getElementById('feedback-next-page');
    const pageInfo = document.getElementById('feedback-page-info');
    
    pageInfo.textContent = `Page ${feedbackPage} of ${totalFeedbackPages}`;
    prevButton.disabled = feedbackPage === 1;
    nextButton.disabled = feedbackPage === totalFeedbackPages || totalFeedbackPages === 0;
    
    prevButton.onclick = () => {
        if (feedbackPage > 1) {
            feedbackPage--;
            displayFeedbacks();
            updateFeedbackPagination();
        }
    };
    
    nextButton.onclick = () => {
        if (feedbackPage < totalFeedbackPages) {
            feedbackPage++;
            displayFeedbacks();
            updateFeedbackPagination();
        }
    };
}

// Open feedback details modal
function openFeedbackDetailsModal(feedbackId) {
    // Get feedback data
    const feedback = feedbacksList.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    currentFeedbackData = feedback;
    
    // Try to get user info if available
    firebase.firestore().collection('users').doc(feedback.userId).get()
        .then(userDoc => {
            let userEmail = 'Anonymous';
            
            if (userDoc.exists) {
                userEmail = userDoc.data().email || 'Anonymous';
            }
            
            // Update user info in modal
            document.getElementById('feedback-user-email').textContent = userEmail;
        })
        .catch(error => {
            console.error('Error getting user info:', error);
            document.getElementById('feedback-user-email').textContent = 'Anonymous';
        })
        .finally(() => {
            // Continue with other feedback details
            
            // Format and display date
            const date = feedback.timestamp 
                ? new Date(feedback.timestamp.seconds * 1000).toLocaleString() 
                : 'N/A';
            document.getElementById('feedback-date').textContent = date;
            
            // Display comments
            document.getElementById('feedback-comments-text').textContent = 
                feedback.comments || 'No comments provided';
            
            // Display ratings
            displayStars('modal-overall-rating', feedback.overallRating || 0);
            displayStars('modal-schedule-rating', feedback.scheduleTiming || 0);
            displayStars('modal-quality-rating', feedback.busQuality || 0);
            displayStars('modal-route-rating', feedback.routeAccuracy || 0);
            
            // Add delete handler
            document.getElementById('delete-feedback').onclick = () => {
                if (confirm('Are you sure you want to delete this feedback?')) {
                    deleteFeedback(feedbackId);
                }
            };
            
            // Show modal
            document.getElementById('feedback-modal').classList.add('active');
        });
}

// Display stars for ratings
function displayStars(containerId, rating) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= rating ? 'fas fa-star' : 'far fa-star';
        container.appendChild(star);
    }
}

// Delete feedback
async function deleteFeedback(feedbackId) {
    try {
        // Delete from Firestore
        await firebase.firestore().collection('feedback').doc(feedbackId).delete();
        
        // Remove from local array
        feedbacksList = feedbacksList.filter(feedback => feedback.id !== feedbackId);
        
        // Recalculate pagination
        totalFeedbackPages = Math.ceil(feedbacksList.length / feedbacksPerPage);
        if (totalFeedbackPages === 0) totalFeedbackPages = 1;
        if (feedbackPage > totalFeedbackPages) {
            feedbackPage = totalFeedbackPages;
        }
        
        // Close modal
        document.getElementById('feedback-modal').classList.remove('active');
        
        // Refresh display
        displayFeedbacks();
        updateFeedbackPagination();
        
        // Reset current feedback
        currentFeedbackData = null;
        
        // Update analytics after deletion
        loadAnalytics();
        
        // Show success message
        alert('Feedback deleted successfully.');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Error deleting feedback: ' + error.message);
    }
}

// Handle feedback filtering
document.addEventListener('DOMContentLoaded', function() {
    const feedbackFilter = document.getElementById('feedback-filter');
    if (feedbackFilter) {
        feedbackFilter.addEventListener('change', function() {
            const filterValue = this.value;
            
            // Store original list for future filtering
            const originalList = [...feedbacksList];
            
            if (filterValue === 'all') {
                // Reset to original data
                loadFeedbacks();
                return;
            }
            
            // Filter feedbacks based on rating
            const rating = parseInt(filterValue);
            feedbacksList = originalList.filter(feedback => {
                return feedback.overallRating === rating;
            });
            
            // Calculate pagination for filtered results
            totalFeedbackPages = Math.ceil(feedbacksList.length / feedbacksPerPage);
            if (totalFeedbackPages === 0) totalFeedbackPages = 1;
            feedbackPage = 1;
            
            // Display filtered feedbacks
            displayFeedbacks();
            updateFeedbackPagination();
        });
    }
    
    // Handle feedback search
    const feedbackSearch = document.getElementById('feedback-search');
    if (feedbackSearch) {
        feedbackSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // If search is cleared, reload all feedbacks
                loadFeedbacks();
                return;
            }
            
            // Store original list for future filtering
            const originalList = [...feedbacksList];
            
            // Filter feedbacks based on search term
            feedbacksList = originalList.filter(feedback => {
                return (
                    (feedback.userId && feedback.userId.toLowerCase().includes(searchTerm)) ||
                    (feedback.comments && feedback.comments.toLowerCase().includes(searchTerm))
                );
            });
            
            // Calculate pagination for filtered results
            totalFeedbackPages = Math.ceil(feedbacksList.length / feedbacksPerPage);
            if (totalFeedbackPages === 0) totalFeedbackPages = 1;
            feedbackPage = 1;
            
            // Display filtered feedbacks
            displayFeedbacks();
            updateFeedbackPagination();
        });
    }
});

// Load analytics data
async function loadAnalytics() {
    await loadAnalyticsCards();
    // loadAnalyticsCharts() - would require external chart library
}

// Load analytics cards with real data
async function loadAnalyticsCards() {
    try {
        const db = firebase.firestore();
        
        // Get time range for filtering
        const timeRangeSelect = document.getElementById('time-range');
        const daysRange = parseInt(timeRangeSelect.value) || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysRange);
        const cutoffTimestamp = firebase.firestore.Timestamp.fromDate(cutoffDate);
        
        // Total users count - get all users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('total-users').textContent = totalUsers;
        
        // Count users created within time range
        const recentUsersSnapshot = await db.collection('users')
            .where('createdAt', '>=', cutoffTimestamp)
            .get();
        const recentUsers = recentUsersSnapshot.size;
        
        // Calculate percentage change (if we have historical data)
        // For demo, we'll use a random percentage
        const userChange = Math.floor(Math.random() * 20);
        const userChangeEl = document.getElementById('users-change');
        userChangeEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${userChange}%`;
        userChangeEl.className = 'change-indicator positive';
        
        // Total feedbacks count
        const feedbacksSnapshot = await db.collection('feedback').get();
        const totalFeedbacks = feedbacksSnapshot.size;
        document.getElementById('total-feedbacks').textContent = totalFeedbacks;
        
        // Get recent feedbacks
        const recentFeedbacksSnapshot = await db.collection('feedback')
            .where('timestamp', '>=', cutoffTimestamp)
            .get();
        const recentFeedbacks = recentFeedbacksSnapshot.size;
        
        // Calculate feedback change (for demo, random percentage)
        const feedbackChange = Math.floor(Math.random() * 15);
        const feedbackChangeEl = document.getElementById('feedbacks-change');
        feedbackChangeEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${feedbackChange}%`;
        feedbackChangeEl.className = 'change-indicator positive';
        
        // Calculate average rating
        let totalRating = 0;
        let ratingCount = 0;
        
        feedbacksSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.overallRating) {
                totalRating += data.overallRating;
                ratingCount++;
            }
        });
        
        // Calculate and display average rating
        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A';
        document.getElementById('avg-rating').textContent = avgRating;
        
        // For demo, neutral rating change
        document.getElementById('rating-change').innerHTML = '<i class="fas fa-minus"></i> 0%';
        
        // Active users (simulated data)
        // In a real app, you would track active users with analytics
        const activeUsers = Math.floor(totalUsers * 0.7); // Assume 70% of users are active
        document.getElementById('active-users').textContent = activeUsers;
        
        // Active users change (random for demo)
        const activeChange = Math.floor(Math.random() * 10);
        const activeChangeEl = document.getElementById('active-change');
        activeChangeEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${activeChange}%`;
        activeChangeEl.className = 'change-indicator positive';
        
        // Update chart placeholders with real numbers
        document.querySelector('#user-growth-chart .chart-placeholder p').textContent = 
            `${totalUsers} total users, ${recentUsers} new in the last ${daysRange} days`;
            
        document.querySelector('#feedback-ratings-chart .chart-placeholder p').textContent = 
            `${totalFeedbacks} total feedbacks, avg rating: ${avgRating}/5`;
    } catch (error) {
        console.error('Error loading analytics:', error);
        
        // Show error in analytics cards
        document.getElementById('total-users').textContent = 'Error';
        document.getElementById('total-feedbacks').textContent = 'Error';
        document.getElementById('avg-rating').textContent = 'Error';
        document.getElementById('active-users').textContent = 'Error';
    }
}

// Time range filter for analytics
document.addEventListener('DOMContentLoaded', function() {
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            // Reload analytics with new time range
            loadAnalytics();
        });
    }
});

// Export functions for use in other modules
window.loadFeedbacks = loadFeedbacks;
window.loadAnalytics = loadAnalytics;
