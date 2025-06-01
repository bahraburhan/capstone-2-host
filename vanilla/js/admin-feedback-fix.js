/**
 * Direct DOM filter approach - this file will patch the existing admin-feedback.js
 */
(function() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin feedback patch loading...');
        initFilterFix();
    });

    function initFilterFix() {
        // Patch the search and filter functionality
        const searchInput = document.getElementById('feedback-search');
        const filterSelect = document.getElementById('feedback-filter');
        
        if (searchInput) {
            console.log('Patching search input with direct DOM filter');
            searchInput.addEventListener('input', function() {
                directFilter();
            });
        }
        
        if (filterSelect) {
            console.log('Patching filter select with direct DOM filter');
            filterSelect.addEventListener('change', function() {
                directFilter();
            });
        }
        
        // Add a global click handler to handle section switching
        document.addEventListener('click', function(event) {
            // Check if feedback section is active
            const feedbackSection = document.querySelector('.admin-section[data-section="feedbacks"]:not(.hidden)');
            if (feedbackSection) {
                // Re-attach event listeners when feedback section is active
                initFilterFix();
            }
        });
    }
    
    function directFilter() {
        const searchTerm = (document.getElementById('feedback-search')?.value || '').toLowerCase().trim();
        const ratingFilter = document.getElementById('feedback-filter')?.value || 'all';
        
        console.log('DIRECT FILTER - Search:', searchTerm, 'Rating:', ratingFilter);
        
        // Get all feedback cards
        const cards = document.querySelectorAll('.feedback-card');
        let visibleCount = 0;
        
        if (cards.length === 0) {
            console.log('No feedback cards found in DOM');
            return;
        }
        
        // Process each card
        cards.forEach(card => {
            let showCard = true;
            
            // Apply search filter
            if (searchTerm) {
                const userId = (card.querySelector('.feedback-user span')?.textContent || '').toLowerCase();
                const comments = (card.querySelector('.feedback-comments p')?.textContent || '').toLowerCase();
                
                // Check if search term is in any text content
                const cardText = card.textContent.toLowerCase();
                showCard = cardText.includes(searchTerm);
            }
            
            // Apply rating filter
            if (ratingFilter !== 'all' && showCard) {
                const stars = card.querySelectorAll('.overall-rating i.filled');
                const starCount = stars.length;
                showCard = starCount === parseInt(ratingFilter, 10);
            }
            
            // Show or hide card
            if (showCard) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update the count
        const totalElement = document.getElementById('total-showing');
        if (totalElement) {
            totalElement.textContent = visibleCount;
        }
        
        // Show empty state if no results
        const container = document.querySelector('.feedbacks-container');
        if (container) {
            if (visibleCount === 0) {
                // Remove any existing no-results message
                const existingMessage = container.querySelector('.no-results');
                if (!existingMessage) {
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2rem; background: #f9fafb; border-radius: 0.5rem; border: 1px dashed #e5e7eb;';
                    noResults.innerHTML = `
                        <i class="fas fa-filter-slash" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
                        <p style="margin-bottom: 1rem;">No feedbacks match your filters</p>
                        <button onclick="resetFilters()" class="secondary-button" 
                                style="background: #f3f4f6; color: #4f46e5; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer;">
                            Reset Filters
                        </button>
                    `;
                    
                    // Clear container and append no results message
                    Array.from(container.children).forEach(child => {
                        if (!child.classList.contains('no-results')) {
                            child.style.display = 'none';
                        }
                    });
                    container.appendChild(noResults);
                }
            } else {
                // Remove any existing no-results message
                const existingMessage = container.querySelector('.no-results');
                if (existingMessage) {
                    existingMessage.remove();
                }
            }
        }
        
        console.log('DIRECT FILTER - Visible count:', visibleCount);
    }
    
    // Override the original resetFilters function
    window.resetFilters = function() {
        console.log('DIRECT RESET - Resetting filters');
        const searchInput = document.getElementById('feedback-search');
        const filterSelect = document.getElementById('feedback-filter');
        
        if (searchInput) searchInput.value = '';
        if (filterSelect) filterSelect.value = 'all';
        
        // Show all cards
        const cards = document.querySelectorAll('.feedback-card');
        cards.forEach(card => {
            card.style.display = '';
        });
        
        // Update count
        const totalElement = document.getElementById('total-showing');
        if (totalElement) {
            totalElement.textContent = cards.length;
        }
        
        // Remove any no-results message
        const container = document.querySelector('.feedbacks-container');
        if (container) {
            const existingMessage = container.querySelector('.no-results');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
    };
    
    console.log('Admin feedback patch loaded successfully');
})();
