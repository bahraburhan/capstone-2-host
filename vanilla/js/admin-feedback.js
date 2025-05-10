/**
 * Admin Feedback Module (Disabled)
 * This file keeps the feedback tab in the admin dashboard interface
 * but disables all actual functionality related to feedback.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback section with just a blank page and title
    const feedbacksContainer = document.getElementById('feedbacks-container');
    if (feedbacksContainer) {
        // Clear any existing content
        feedbacksContainer.innerHTML = '';
    }
    
    // Hide feedback filtering, search, and pagination
    const feedbackSearch = document.getElementById('feedback-search');
    const feedbackFilter = document.getElementById('feedback-filter');
    const prevButton = document.getElementById('feedback-prev-page');
    const nextButton = document.getElementById('feedback-next-page');
    
    if (feedbackSearch) feedbackSearch.style.display = 'none';
    if (feedbackFilter) feedbackFilter.style.display = 'none';
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    
    // Set section heading to just "Feedback"
    const feedbackNavItem = document.querySelector('li[data-section="feedbacks"]');
    if (feedbackNavItem) {
        feedbackNavItem.addEventListener('click', function() {
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Feedback';
            }
        });
    }
    
    // Hide all feedback-related content in analytics
    const totalFeedbacksElement = document.getElementById('total-feedbacks');
    const feedbacksChangeElement = document.getElementById('feedbacks-change');
    const avgRatingElement = document.getElementById('avg-rating');
    const ratingChangeElement = document.getElementById('rating-change');
    
    // Find analytics cards with feedback content and hide them
    const feedbackCard = document.querySelector('.analytics-card .feedback-icon');
    if (feedbackCard) {
        const card = feedbackCard.closest('.analytics-card');
        if (card) card.style.display = 'none';
    }
    
    const ratingCard = document.querySelector('.analytics-card .rating-icon');
    if (ratingCard) {
        const card = ratingCard.closest('.analytics-card');
        if (card) card.style.display = 'none';
    }
});
