/**
 * Public Advertisements Module
 * This file handles showing advertisement pop-ups on public pages
 */

console.log('Advertisement module loaded');

// Load public advertisements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get the current page URL
    const currentUrl = window.location.href;
    
    // Only show ads on schedule and planner pages
    if (currentUrl.includes('schedule.html') || currentUrl.includes('planner.html')) {
        console.log('Advertisement module: Page eligible for ads, initializing...');
        
        // Wait for Firebase to initialize
        const checkFirebase = setInterval(() => {
            if (window.firebase && firebase.firestore) {
                clearInterval(checkFirebase);
                loadPublicAdvertisements();
            }
        }, 100);
    } else {
        console.log('Advertisement module: Page not eligible for ads, skipping initialization');
        window.addEventListener('load', function() {
            console.log('Advertisement module: Window load event triggered');
            setTimeout(loadPublicAdvertisements, 1000);
        });
    }
});

/**
 * Load and display advertisements on public pages
 */
function loadPublicAdvertisements() {
    console.log('Loading public advertisements...');
    
    // Only run on public pages, not in admin
    if (window.location.href.includes('admin-dashboard.html')) {
        console.log('Advertisement module: Skipping ads on admin page');
        return;
    }
    
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined') {
            console.error('Advertisement module: Firebase is undefined');
            return;
        }
        
        if (!firebase.firestore) {
            console.error('Advertisement module: Firebase Firestore is not loaded');
            return;
        }
        
        // Get current page
        let currentPage = 'index'; // Default to index.html (home page)
        const currentUrl = window.location.href;
        console.log('Advertisement module: Current URL is', currentUrl);
        
        // Determine the current page based on the URL
        if (currentUrl.includes('schedule.html')) {
            currentPage = 'schedule';
        } else if (currentUrl.includes('planner.html')) {
            currentPage = 'planner';
        } else if (currentUrl.includes('profile.html')) {
            currentPage = 'profile';
        }
        
        // Special case for index.html or root path
        if (currentUrl.endsWith('/') || 
            currentUrl.endsWith('/index.html') || 
            currentUrl.match(/\/[^/]*$/)[0] === '/index.html') {
            currentPage = 'index';
        }
        
        console.log('Advertisement module: Detected page type:', currentPage);
        
        const db = firebase.firestore();
        console.log('Advertisement module: Firestore reference obtained');
        
        // Get active advertisements for the current page
        console.log(`Advertisement module: Querying for ads with status=active and pages containing ${currentPage}`);
        
        db.collection('advertisements')
            .where('status', '==', 'active')
            .where('pages', 'array-contains', currentPage)
            .get()
            .then(snapshot => {
                console.log('Advertisement module: Query completed');
                
                if (snapshot.empty) {
                    console.log('Advertisement module: No matching advertisements found');
                    return;
                }
                
                // Get random advertisement from the results
                const ads = [];
                snapshot.forEach(doc => {
                    const adData = doc.data();
                    console.log('Advertisement module: Found ad:', adData.title);
                    ads.push({
                        id: doc.id,
                        ...adData
                    });
                });
                
                console.log(`Advertisement module: Found ${ads.length} matching advertisements`);
                
                if (ads.length > 0) {
                    // Show random advertisement
                    const randomIndex = Math.floor(Math.random() * ads.length);
                    const adToShow = ads[randomIndex];
                    console.log(`Advertisement module: Selected ad: ${adToShow.title}`);
                    
                    // Delay showing ad by 2 seconds to let page load
                    console.log('Advertisement module: Scheduling ad display in 2 seconds');
                    setTimeout(() => {
                        console.log('Advertisement module: Now showing ad popup');
                        showAdPopup(adToShow);
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error loading public advertisements:', error);
            });
            
    } catch (error) {
        console.error('Error in loadPublicAdvertisements:', error);
    }
}

/**
 * Show advertisement popup
 */
function showAdPopup(adData) {
    console.log('Advertisement module: Creating popup for ad:', adData.title);
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'ad-popup-overlay';
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'ad-popup';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'ad-popup-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close advertisement');
    
    // Close function to handle cleanup
    const closeAd = function() {
        console.log('Advertisement module: Closing popup');
        popup.classList.remove('show');
        overlay.classList.remove('show');
        
        // Remove elements after animation completes
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 400); // Match transition duration
    };
    
    // Set up close handlers
    closeButton.addEventListener('click', closeAd);
    overlay.addEventListener('click', closeAd);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'ad-popup-content';
    
    // Add image if available
    if (adData.imageUrl) {
        const image = document.createElement('img');
        image.src = adData.imageUrl;
        image.alt = adData.title;
        image.onerror = function() {
            console.error('Advertisement module: Failed to load image:', adData.imageUrl);
            this.style.display = 'none';
        };
        content.appendChild(image);
    }
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = adData.title;
    content.appendChild(title);
    
    // Add description if available
    if (adData.description) {
        const description = document.createElement('p');
        description.textContent = adData.description;
        content.appendChild(description);
    }
    
    // Add link if available
    if (adData.link) {
        const link = document.createElement('a');
        link.href = adData.link;
        link.target = '_blank';
        link.textContent = 'Learn More';
        link.className = 'ad-popup-link';
        content.appendChild(link);
    }
    
    // Assemble popup
    popup.appendChild(closeButton);
    popup.appendChild(content);
    
    // Add to body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Show popup with animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            popup.classList.add('show');
        });
    });
    
    // No auto-close timer - user must close manually
    console.log('Advertisement module: Popup is now visible and will remain until closed by user');
}
