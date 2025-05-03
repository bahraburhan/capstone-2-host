// Enhanced Direct Navigation Handler
console.log('Enhanced direct navigation script loading');

// Function to fix language toggle buttons
function fixLanguageToggle() {
    console.log('Fixing language toggle functionality');
    
    // Get all language toggle buttons
    const languageButtons = document.querySelectorAll('#language-toggle, .language-button, #burger-language-toggle');
    
    languageButtons.forEach(button => {
        if (button) {
            // Remove any existing click handlers by cloning the button
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add a direct click handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Language toggle button clicked');
                
                // Call the toggleLanguage function directly
                if (typeof window.toggleLanguage === 'function') {
                    window.toggleLanguage();
                } else {
                    console.error('toggleLanguage function not found');
                    // Fallback implementation
                    const currentLang = localStorage.getItem('language') || 'en';
                    const newLang = currentLang === 'en' ? 'ckb' : 'en';
                    localStorage.setItem('language', newLang);
                    window.location.reload();
                }
            });
            
            // Update the button text based on current language
            const currentLang = localStorage.getItem('language') || 'en';
            const textSpan = newButton.querySelector('span');
            if (textSpan) {
                textSpan.textContent = currentLang === 'en' ? 'کوردی' : 'English';
            } else {
                newButton.textContent = currentLang === 'en' ? 'کوردی' : 'English';
            }
            
            // Make sure it's clickable
            newButton.style.pointerEvents = 'auto';
            newButton.style.cursor = 'pointer';
        }
    });
    
    console.log('Language toggle buttons fixed');
}

// Ensure navbar icons are properly loaded
function fixNavbarIcons() {
    console.log('Fixing navbar icons');
    
    // Check if the logo SVG is properly styled
    const logoSvg = document.querySelector('.nav-brand .logo-circle svg');
    if (logoSvg) {
        // Ensure the SVG has correct styling with !important to override any other styles
        logoSvg.style.cssText = 'color: var(--color-indigo-600) !important;';
        logoSvg.setAttribute('stroke', '#4338ca');
        logoSvg.setAttribute('stroke-width', '2');
        logoSvg.setAttribute('fill', 'none');
        
        // Also apply styles to any paths inside the SVG
        const svgPaths = logoSvg.querySelectorAll('path');
        svgPaths.forEach(path => {
            path.setAttribute('stroke', '#4338ca');
            path.setAttribute('fill', 'none');
        });
        
        // Make sure the logo circle is visible and properly styled
        const logoCircle = document.querySelector('.logo-circle');
        if (logoCircle) {
            logoCircle.style.cssText = `
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                background-color: var(--color-white, #ffffff) !important;
                border-radius: 9999px !important;
                width: 40px !important;
                height: 40px !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                overflow: visible !important;
            `;
        }
        
        // Make sure the app name is visible
   
        console.log('Navbar icon styles applied');
    } else {
        console.warn('Logo SVG not found, will retry');
        setTimeout(fixNavbarIcons, 500);
    }
}

// Function to handle direct navigation
function handleDirectNavigation() {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(`Found ${menuItems.length} menu items`);
    
    // Apply click handlers to menu items
    menuItems.forEach(button => {
        const path = button.getAttribute('data-path');
        if (!path) return;
        
        console.log(`Setting up direct navigation for: ${path}`);
        
        // Ensure the button is clickable
        button.style.cursor = 'pointer';
        button.style.pointerEvents = 'auto';
        button.style.userSelect = 'none';
        
        // Use a direct window.location approach for maximum reliability
        button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Navigating to: ${path}`);
            
            // Show loading overlay if it exists
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            // Use direct location change for guaranteed navigation
            window.location.href = path;
            return false;
        };
    });
    
    console.log('Direct navigation setup complete');
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced navigation');
    
    // Fix navbar icons first
    fixNavbarIcons();
    
    // Fix language toggle buttons
    fixLanguageToggle();
    
    // Then set up navigation
    setTimeout(handleDirectNavigation, 300);
});

// Also run on window load as a backup
window.addEventListener('load', function() {
    console.log('Window loaded, ensuring navigation is set up');
    
    // Fix navbar icons
    fixNavbarIcons();
    
    // Fix language toggle
    fixLanguageToggle();
    
    // Set up navigation
    handleDirectNavigation();
});

// For components-loaded events
document.addEventListener('components-loaded', function() {
    console.log('Components loaded, re-applying navigation fixes');
    fixNavbarIcons();
    fixLanguageToggle();
    handleDirectNavigation();
});

// Add a custom event that can be triggered from anywhere
document.addEventListener('fix-language-toggle', function() {
    console.log('Fix language toggle event received');
    fixLanguageToggle();
});

// Export the function for use by other scripts
window.fixLanguageToggle = fixLanguageToggle;

// Global navigation helper function
window.navigateTo = function(path) {
    console.log(`Global navigation to: ${path}`);
    window.location.href = path;
};