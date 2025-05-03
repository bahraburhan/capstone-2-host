// Force visibility of the welcome text and start button immediately
document.addEventListener('DOMContentLoaded', () => {
    // Force main content visibility
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('visible');
        console.log('DOMContentLoaded: Added visible class to main content');
    }
    
    // Force welcome text visibility
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText) {
        welcomeText.style.display = 'block';
        welcomeText.style.visibility = 'visible';
        welcomeText.style.opacity = '1';
        console.log('DOMContentLoaded: Forced welcome text visibility');
    }
    
    // Force start button visibility
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.style.display = 'block';
        startButton.style.visibility = 'visible';
        startButton.style.opacity = '1';
        console.log('DOMContentLoaded: Forced start button visibility');
    }
});

// Also force visibility when window loads
window.addEventListener('load', () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('visible');
        console.log('Window load: Added visible class to main content');
    }
    
    // Force immediate visibility without animations or delays
    document.querySelectorAll('.welcome-text, #start-button').forEach(el => {
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            console.log('Window load: Forced visibility for', el.className || el.id);
        }
    });
});

// Handle start button click
function handleStart() {
    console.log('Start button clicked');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase not available, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Use direct Firebase auth to check current user
        // We need to wait a bit to ensure auth state is properly loaded
        firebase.auth().onAuthStateChanged((user) => {
            console.log('Auth state checked, user:', user);
            if (user) {
                console.log('User is signed in, redirecting to menu');
                window.location.href = 'menu.html';
            } else {
                console.log('User is not signed in, redirecting to login');
                window.location.href = 'login.html';
            }
        });
    } catch (error) {
        console.error('Error checking auth state:', error);
        // Fallback if there's an error with authentication
        window.location.href = 'login.html';
    }
}
