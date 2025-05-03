// Advertisement Component
console.log('Advertisement.js loaded');

// Helper function to check if Firebase Firestore is available
function isFirestoreAvailable() {
    return typeof firebase !== 'undefined' && 
           typeof firebase.firestore === 'function' && 
           firebase.apps && 
           firebase.apps.length > 0;
}

// Try to initialize Firebase Firestore if it doesn't exist
function ensureFirestore() {
    console.log('Ad system: Checking Firebase availability');
    if (!isFirestoreAvailable()) {
        console.log('Ad system: Firebase not fully initialized yet, waiting...');
        return false;
    }
    
    try {
        // Test if we can actually query Firestore
        firebase.firestore().collection('test');
        console.log('Ad system: Firebase Firestore is available and working');
        return true;
    } catch (e) {
        console.error('Ad system: Error testing Firestore:', e);
        return false;
    }
}

// Initialize with multiple fallbacks
let adInitAttempts = 0;
function attemptAdInitialization() {
    adInitAttempts++;
    console.log(`Ad system: Initialization attempt ${adInitAttempts}`);
    
    if (adInitAttempts > 10) {
        console.error('Ad system: Giving up after 10 attempts');
        return;
    }
    
    if (isFirestoreAvailable()) {
        console.log('Ad system: Firebase ready, initializing ads');
        initializeAdvertisements();
    } else {
        console.log('Ad system: Firebase not ready, will retry in 1 second');
        setTimeout(attemptAdInitialization, 1000);
    }
}

// Start initialization process after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ad system: DOM loaded, setting up listeners');
    
    // Initialize ads when Firebase is ready
    document.addEventListener('firebase-ready', function() {
        console.log('Ad system: firebase-ready event received');
        setTimeout(attemptAdInitialization, 500); // Short delay after event
    });
    
    // Also start a delayed initialization attempt regardless of the event
    setTimeout(attemptAdInitialization, 2000);
});

// Initialize advertisements for the current page
function initializeAdvertisements() {
    console.log('Ad system: Initializing advertisements');
    
    // Avoid duplicate initialization
    if (window.adsInitialized) {
        console.log('Ad system: Advertisements already initialized');
        return;
    }
    window.adsInitialized = true;
    
    // Determine current page
    const currentPage = getCurrentPage();
    console.log('Ad system: Current page identified as:', currentPage);
    
    // Create modal container if it doesn't exist
    createAdModalContainer();
    
    // Load advertisements for this page
    loadAdvertisements(currentPage);
}

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    
    // Map filenames to page identifiers
    const pageMap = {
        'index': 'index',
        '': 'index', // For root URL
        'menu': 'menu',
        'planner': 'route',
        'route': 'route'
    };
    
    return pageMap[filename] || 'index';
}

// Load advertisements from Firestore based on the current page
function loadAdvertisements(pageId) {
    console.log('Ad system: Loading advertisements for page:', pageId);
    
    // Get the modal container
    const modalContainer = document.getElementById('ad-modal-container');
    if (!modalContainer) {
        console.error('Ad system: Ad modal container not found, creating it now');
        createAdModalContainer();
        return setTimeout(() => loadAdvertisements(pageId), 100);
    }
    
    // FOR TESTING: Clear the session storage for ads to ensure they show every page load
    // Comment this out after testing
    sessionStorage.removeItem(`ad_shown_${pageId}`);
    
    // Check if we've already shown an ad in this session
    const sessionKey = `ad_shown_${pageId}`;
    if (sessionStorage.getItem(sessionKey)) {
        console.log('Ad system: Ad already shown in this session for page:', pageId);
        return;
    }
    
    // Manual mock for testing if Firebase is not available
    if (!isFirestoreAvailable()) {
        console.log('Ad system: Firebase Firestore not available, using mock data');
        const mockAd = {
            id: 'mock-id-123',
            title: 'TEST ADVERTISEMENT',
            description: 'This is a test advertisement. Firebase Firestore is not available.',
            link: 'https://example.com',
            imageUrl: 'https://via.placeholder.com/500x300?text=TEST+ADVERTISEMENT'
        };
        displayAdModal(mockAd);
        sessionStorage.setItem(sessionKey, 'true');
        return;
    }
    
    console.log('Ad system: Querying Firestore for ads with location:', pageId);
    
    try {
        // Debug - print ads collection to verify it exists
        console.log('Ad system: DEBUG - Attempting to access advertisements collection');
        
        // Query Firestore for advertisements for this location
        firebase.firestore().collection('advertisements')
            .where('location', '==', pageId)
            .get()
            .then(querySnapshot => {
                console.log('Ad system: Found', querySnapshot.size, 'advertisements for page:', pageId);
                
                if (querySnapshot.empty) {
                    console.log('Ad system: No advertisements found for page:', pageId);
                    
                    // DEBUG: Try a general query to see if any ads exist
                    console.log('Ad system: DEBUG - Checking if any ads exist at all');
                    firebase.firestore().collection('advertisements').get().then(allSnapshot => {
                        console.log('Ad system: DEBUG - Found', allSnapshot.size, 'total advertisements in database');
                        allSnapshot.forEach(doc => {
                            console.log('Ad system: DEBUG - Ad found with location:', doc.data().location);
                        });
                    }).catch(err => console.error('Ad system: DEBUG - Error fetching all ads:', err));
                    
                    return;
                }
                
                // Convert to array and sort by createdAt timestamp (if available)
                const ads = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    ads.push({
                        id: doc.id,
                        ...data
                    });
                    console.log('Ad system: Found ad:', doc.id, data.title, 'with location:', data.location);
                });
                
                // Sort ads by createdAt (newest first) if available
                ads.sort((a, b) => {
                    if (!a.createdAt && !b.createdAt) return 0;
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return b.createdAt.seconds - a.createdAt.seconds;
                });
                
                if (ads.length > 0) {
                    console.log('Ad system: Displaying latest ad:', ads[0].title);
                    displayAdModal(ads[0]);
                    
                    // Mark that we've shown an ad in this session
                    sessionStorage.setItem(sessionKey, 'true');
                }
            })
            .catch(error => {
                console.error("Ad system: Error loading advertisements:", error);
            });
    } catch (e) {
        console.error("Ad system: Fatal error in loadAdvertisements:", e);
    }
}

// Create the ad modal container if it doesn't exist
function createAdModalContainer() {
    if (!document.getElementById('ad-modal-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'ad-modal-container';
        modalContainer.className = 'ad-modal-container';
        document.body.appendChild(modalContainer);
        
        // Add styles for the modal
        if (!document.getElementById('ad-modal-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'ad-modal-styles';
            styleElement.textContent = `.ad-modal-container{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.75);z-index:10000;justify-content:center;align-items:center;opacity:0;transition:opacity 0.4s ease;backdrop-filter:blur(5px)}.ad-modal-container.active{display:flex;opacity:1}.ad-modal{background-color:white;border-radius:12px;max-width:550px;width:90%;max-height:80vh;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);position:relative;animation:adModalAppear 0.4s cubic-bezier(0.19,1,0.22,1)}@keyframes adModalAppear{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}.ad-modal-content{display:flex;flex-direction:column;padding:0}.ad-modal img{width:100%;max-height:300px;object-fit:cover;display:block}.ad-modal-text{padding:24px}.ad-modal-close{position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;display:flex;justify-content:center;align-items:center;z-index:10;opacity:0.8;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.2)}.ad-modal-close:hover{opacity:1;transform:scale(1.05);background:rgba(0,0,0,0.8)}.ad-modal-close.disabled{background:rgba(150,150,150,0.6);cursor:not-allowed}.ad-modal-timer{position:absolute;top:12px;left:12px;background:rgba(0,0,0,0.6);color:white;border-radius:16px;padding:4px 10px;font-size:12px;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,0.2)}.ad-modal-title{font-size:24px;margin:0 0 12px 0;color:#2d3748;font-weight:600;line-height:1.3}.ad-modal-description{font-size:16px;color:#4a5568;margin-bottom:16px;line-height:1.5}.ad-modal-cta{display:inline-block;margin-top:8px;padding:8px 16px;background-color:#4f46e5;color:white;border-radius:6px;text-decoration:none;font-weight:500;transition:background-color 0.2s}.ad-modal-cta:hover{background-color:#4338ca}@media(max-width:640px){.ad-modal{width:95%;max-height:90vh}.ad-modal-text{padding:16px}.ad-modal-title{font-size:20px}}`;
            document.head.appendChild(styleElement);
        }
    }
}

// Display advertisement as a modal popup
function displayAdModal(ad) {
    const modalContainer = document.getElementById('ad-modal-container');
    if (!modalContainer) return;
    
    const adHtml = `
        <div class="ad-modal" data-id="${ad.id}">
            <div class="ad-modal-timer">Closes in 3s</div>
            <button class="ad-modal-close disabled" disabled title="Close (available in 3s)">×</button>
            <a href="${ad.link}" target="_blank" class="ad-link" aria-label="${ad.title}">
                <div class="ad-modal-content">
                    ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}">` : ''}
                    <div class="ad-modal-text">
                        <h3 class="ad-modal-title">${ad.title}</h3>
                        <p class="ad-modal-description">${ad.description}</p>
                        <span class="ad-modal-cta">Learn More</span>
                    </div>
                </div>
            </a>
        </div>
    `;
    
    modalContainer.innerHTML = adHtml;
    
    // Display the modal with a small delay
    setTimeout(() => {
        modalContainer.classList.add('active');
    }, 300);
    
    // Set up the timer
    const timerElement = modalContainer.querySelector('.ad-modal-timer');
    const closeButton = modalContainer.querySelector('.ad-modal-close');
    let secondsLeft = 3;
    
    // Update the timer every second
    const timerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            timerElement.textContent = `Closes in ${secondsLeft}s`;
        } else {
            timerElement.textContent = 'You can close now';
            closeButton.classList.remove('disabled');
            closeButton.disabled = false;
            clearInterval(timerInterval);
        }
    }, 1000);
    
    // Set up close button handler
    closeButton.addEventListener('click', (e) => {
        if (!closeButton.disabled) {
            e.preventDefault();
            e.stopPropagation();
            modalContainer.classList.remove('active');
            setTimeout(() => {
                modalContainer.innerHTML = '';
            }, 300);
        }
    });
    
    // Track ad impression
    trackAdImpression(ad.id);
}

// Track ad impression (can be expanded for analytics)
function trackAdImpression(adId) {
    console.log(`Ad impression: ${adId}`);
    // Here you could implement actual tracking/analytics
}

// Shuffle array randomly - Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Add advertisement container to page (utility function that can be called from page scripts)
function addAdvertisementContainer(targetSelector) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.warn(`Target element not found: ${targetSelector}`);
        return;
    }
    
    const adContainer = document.createElement('div');
    adContainer.className = 'advertisement-container';
    targetElement.appendChild(adContainer);
}

// Export functions to global scope
window.initializeAdvertisements = initializeAdvertisements;
window.addAdvertisementContainer = addAdvertisementContainer;
window.createAdModalContainer = createAdModalContainer;
window.displayAdModal = displayAdModal;
