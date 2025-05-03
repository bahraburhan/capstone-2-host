/**
 * Component loader utility
 * Loads footer component dynamically to ensure consistency across pages
 */

// Load component into a target element
function loadComponent(targetSelector, componentPath) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.error(`Target element ${targetSelector} not found!`);
        return;
    }

    // Fetch the component HTML
    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            targetElement.innerHTML = html;
            // Dispatch event for post-loading actions
            document.dispatchEvent(new CustomEvent('component-loaded', {
                detail: { targetSelector, componentPath }
            }));
        })
        .catch(error => {
            console.error('Error loading component:', error);
        });
}





// Handle logout
function handleLogout() {
    console.log('Logout button clicked');
    
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut()
            .then(() => {
                console.log('User signed out successfully');
                // Redirect to login page
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Error signing out:', error);
                alert('Error signing out. Please try again.');
            });
    } else {
        console.error('Firebase auth not available');
        // Fallback - just redirect to login
        window.location.href = 'login.html';
    }
}

// Load footer
function loadFooter() {
    const footerContainer = document.querySelector('.footer-container');
    if (footerContainer) {
        loadComponent('.footer-container', 'components/footer.html');
    }
}

// Make functions globally available
window.handleLogout = handleLogout;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadFooter();
});