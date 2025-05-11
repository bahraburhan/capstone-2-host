/**
 * Enhanced Navbar and Mobile Menu functionality
 */

// Store DOM references to avoid repeated queries
let burgerMenuBtn;
let mobileMenu;
let menuOverlay;
let closeMenuBtn;
let languageToggles;
let logoutButtons;
let userDisplayName;
let navbarElement;

// Toggle mobile menu with animation
function toggleMenu() {
    if (!burgerMenuBtn || !mobileMenu || !menuOverlay) return;
    
    const isOpen = mobileMenu.classList.contains('open');
    
    if (isOpen) {
        closeMenu();
    } else {
        // Open menu
        burgerMenuBtn.classList.add('active');
        mobileMenu.classList.add('open');
        menuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Animate menu items entrance
        const menuItems = document.querySelectorAll('.mobile-menu-item');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50 * index);
        });
    }
}

// Close mobile menu with animation
function closeMenu() {
    if (!burgerMenuBtn || !mobileMenu || !menuOverlay) return;
    
    burgerMenuBtn.classList.remove('active');
    
    // Animate menu closing
    mobileMenu.style.width = mobileMenu.offsetWidth + 'px';
    
    // Force a reflow to ensure the width is applied before transitioning
    void mobileMenu.offsetWidth;
    
    // Start transition effect
    mobileMenu.style.width = '0';
    menuOverlay.classList.remove('open');
    
    // Wait for transition to finish before hiding completely
    setTimeout(() => {
        mobileMenu.classList.remove('open');
        mobileMenu.style.width = '';
        document.body.style.overflow = '';
    }, 300);
}

// Toggle language
function toggleLanguage() {
    const currentLang = localStorage.getItem('language') || 'en';
    const newLang = currentLang === 'en' ? 'ckb' : 'en';
    
    // Save the new language preference
    localStorage.setItem('language', newLang);
    
    // Show quick feedback before reload
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.padding = '1rem 2rem';
    feedback.style.backgroundColor = 'rgba(67, 56, 202, 0.9)';
    feedback.style.color = 'white';
    feedback.style.borderRadius = '8px';
    feedback.style.zIndex = '9999';
    feedback.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    feedback.style.transition = 'all 0.3s ease';
    feedback.textContent = newLang === 'en' ? 'Switching to English...' : 'گۆڕین بۆ کوردی...';
    
    document.body.appendChild(feedback);
    
    // Update dir attribute before reload
    document.documentElement.setAttribute('dir', newLang === 'ckb' ? 'rtl' : 'ltr');
    
    // Reload the page after showing feedback
    setTimeout(() => {
        window.location.reload();
    }, 600);
}

// Handle logout
function handleLogout() {
    // Show loading state on logout button
    const logoutButtons = document.querySelectorAll('.logout-button');
    logoutButtons.forEach(button => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<span style="display: inline-flex; align-items: center;">Logging out <span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%; background-color: white; margin-left: 4px; animation: pulse 1s infinite;"></span><span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%; background-color: white; margin-left: 4px; animation: pulse 1s infinite 0.2s;"></span><span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%; background-color: white; margin-left: 4px; animation: pulse 1s infinite 0.4s;"></span></span>';
        button.disabled = true;
    });
    
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut()
            .then(() => {
                // Show success message before redirecting
                const feedback = document.createElement('div');
                feedback.style.position = 'fixed';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.padding = '1rem 2rem';
                feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
                feedback.style.color = 'white';
                feedback.style.borderRadius = '8px';
                feedback.style.zIndex = '9999';
                feedback.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                feedback.textContent = 'Logged out successfully';
                
                document.body.appendChild(feedback);
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 800);
            })
            .catch(error => {
                console.error('Error signing out:', error);
                
                // Reset logout buttons if error
                logoutButtons.forEach(button => {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                });
                
                // Show error message
                alert('Error signing out. Please try again.');
            });
    } else {
        // Fallback - just redirect to login
        window.location.href = 'login.html';
    }
}

// Update user display name
function updateUserDisplayName() {
    if (!userDisplayName) return;
    
    // First try to get user from Firebase if available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
            // Try to get Firestore data for additional user info
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                db.collection('users').doc(user.uid)
                    .get()
                    .then(doc => {
                        if (doc.exists) {
                            const firestoreData = doc.data();
                            
                            // Use displayName from Firestore if available
                            if (firestoreData.displayName) {
                                userDisplayName.textContent = firestoreData.displayName;
                                
                                // Save the user data to localStorage for future use
                                localStorage.setItem('userData', JSON.stringify(firestoreData));
                                return;
                            }
                        }
                        // Fallback to auth user data if Firestore data not available
                        userDisplayName.textContent = user.displayName || user.email.split('@')[0] || user.uid.substring(0, 8);
                    })
                    .catch(error => {
                        userDisplayName.textContent = user.displayName || user.email.split('@')[0] || user.uid.substring(0, 8);
                    });
            } else {
                // If Firestore not available, just use auth user
                userDisplayName.textContent = user.displayName || user.email.split('@')[0] || user.uid.substring(0, 8);
            }
            return; // Exit if Firebase user was found
        }
    }
    
    // Fallback to localStorage if no Firebase user
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.displayName) {
            userDisplayName.textContent = userData.displayName;
        } else if (userData && userData.email) {
            const username = userData.email.split('@')[0];
            userDisplayName.textContent = username;
        } else if (userData && userData.username) {
            userDisplayName.textContent = userData.username;
        } else {
            // Try sessionStorage as last resort
            const sessionEmail = sessionStorage.getItem('user_email');
            if (sessionEmail) {
                userDisplayName.textContent = sessionEmail.split('@')[0];
            } else {
                userDisplayName.textContent = 'Guest';
            }
        }
    } catch (error) {
        userDisplayName.textContent = 'Guest';
    }
}

// Update language button text based on current language
function updateLanguageButtonText() {
    const currentLang = localStorage.getItem('language') || 'en';
    const languageButtons = document.querySelectorAll('.language-toggle, .language-button, #inline-language-toggle');
    
    languageButtons.forEach(button => {
        const languageText = button.querySelector('#language-text');
        if (languageText) {
            languageText.textContent = currentLang === 'en' ? 'کوردی' : 'English';
        }
    });
    
    // Ensure the HTML dir attribute is correctly set
    document.documentElement.setAttribute('dir', currentLang === 'ckb' ? 'rtl' : 'ltr');
}

// Setup current page indicator in mobile menu
function setupCurrentPageIndicator() {
    // Get current page path
    const currentPath = window.location.pathname;
    const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    // Find matching menu item and add active class
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href') || '';
        if (itemPath === fileName || (fileName === '' && itemPath === 'menu.html')) {
            item.classList.add('active');
        }
    });
}

// Initialize navbar with enhanced features
function initNavbar() {
    // Cache DOM elements
    navbarElement = document.querySelector('.navbar');
    burgerMenuBtn = document.querySelector('.burger-menu-btn');
    mobileMenu = document.querySelector('.mobile-menu');
    menuOverlay = document.querySelector('.menu-overlay');
    closeMenuBtn = document.querySelector('.close-menu-btn');
    languageToggles = document.querySelectorAll('.language-toggle, .language-button, #inline-language-toggle');  
    logoutButtons = document.querySelectorAll('.logout-button');
    userDisplayName = document.getElementById('user-display-name');
    
    // Setup burger menu toggle
    if (burgerMenuBtn) {
        // Remove any existing listeners by cloning
        const newBurgerBtn = burgerMenuBtn.cloneNode(true);
        burgerMenuBtn.parentNode.replaceChild(newBurgerBtn, burgerMenuBtn);
        burgerMenuBtn = newBurgerBtn;
        
        // Add fresh click listener
        burgerMenuBtn.addEventListener('click', function(e) {
            toggleMenu();
            e.stopPropagation();
        });
    }
    
    // Setup close menu button
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function(e) {
            closeMenu();
            e.stopPropagation();
        });
    }
    
    // Setup menu overlay click to close
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            closeMenu();
            e.stopPropagation();
        });
    }
    
    // Setup language toggle buttons
    languageToggles.forEach(button => {
        // Remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add fresh event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleLanguage();
        });
    });
    
    // Setup logout buttons
    logoutButtons.forEach(button => {
        // Remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add fresh event listener
        newButton.addEventListener('click', handleLogout);
    });
    
    // Update user display name
    updateUserDisplayName();
    
    // Update language button text
    updateLanguageButtonText();
    
    // Highlight current page in mobile menu
    setupCurrentPageIndicator();
    
    // Add scroll behavior for navbar
    window.addEventListener('scroll', function() {
        if (navbarElement) {
            if (window.scrollY > 10) {
                navbarElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            } else {
                navbarElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
            }
        }
    });
}

// Make functions globally available
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.toggleLanguage = toggleLanguage;
window.handleLogout = handleLogout;

// Initialize immediately if document is already interactive
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initNavbar();
    setRTLDirection();
}

// Also initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    setRTLDirection();
    
    // Add animation to main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('page-transition');
    }
});

// Set RTL direction based on current language
function setRTLDirection() {
    const currentLang = localStorage.getItem('language') || 'en';
    // Also check for legacy 'ku' code as mentioned in the memory
    const isKurdish = currentLang === 'ckb' || currentLang === 'ku';
    document.documentElement.setAttribute('dir', isKurdish ? 'rtl' : 'ltr');
    
    // Apply any additional RTL-specific adjustments
    const menuItems = document.querySelectorAll('.menu-item-content');
    menuItems.forEach(item => {
        const menuArrow = item.querySelector('.menu-arrow');
        if (menuArrow) {
            if (isKurdish) {
                menuArrow.style.marginLeft = '0';
                menuArrow.style.marginRight = '1rem';
            } else {
                menuArrow.style.marginLeft = '1rem';
                menuArrow.style.marginRight = '0';
            }
        }
    });
}

// Add CSS animation for dots
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
    </style>
`);