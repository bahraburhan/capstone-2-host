/**
 * Admin Advertisements Module
 * This file handles the advertisements tab in the admin dashboard
 * Shows a blank page with just the title
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize advertisements section with a blank page
    const advertisementsContainer = document.getElementById('advertisements-container');
    if (advertisementsContainer) {
        // Ensure it's empty
        advertisementsContainer.innerHTML = '';
    }
    
    // Set the section title when clicked
    const advertisementsNavItem = document.querySelector('li[data-section="advertisements"]');
    if (advertisementsNavItem) {
        advertisementsNavItem.addEventListener('click', function() {
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Advertisements';
            }
        });
    }
});
