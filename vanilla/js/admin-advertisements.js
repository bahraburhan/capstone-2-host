/**
 * Admin Advertisements Module
 * This file handles the advertisements tab in the admin dashboard
 * Allows admins to create, edit, and manage advertisements
 * Advertisements are displayed as pop-ups on the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize advertisements section
    const advertisementsContainer = document.getElementById('advertisements-container');
    const addAdvertisementBtn = document.getElementById('add-advertisement-btn');
    const adSearchInput = document.getElementById('ad-search');
    const adStatusFilter = document.getElementById('ad-status-filter');
    
    // Set the section title when clicked
    const advertisementsNavItem = document.querySelector('li[data-section="advertisements"]');
    if (advertisementsNavItem) {
        advertisementsNavItem.addEventListener('click', function() {
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Advertisements';
            }
            loadAdvertisements(); // Reload advertisements when section is clicked
        });
    }
    
    // Add new advertisement button
    if (addAdvertisementBtn) {
        addAdvertisementBtn.addEventListener('click', function() {
            openAdvertisementModal();
        });
    }
    
    // Initialize search functionality
    if (adSearchInput) {
        adSearchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    // Initialize filter functionality
    if (adStatusFilter) {
        adStatusFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    // Set up advertisement modal
    setupAdvertisementModal();
    
    // Load advertisements initially
    loadAdvertisements();
});

/**
 * Global variable to store all advertisements
 */
window.allAdvertisements = [];

/**
 * Load advertisements from Firebase
 */
async function loadAdvertisements() {
    const advertisementsContainer = document.getElementById('advertisements-container');
    
    if (!advertisementsContainer) return;
    
    // Show loading state
    advertisementsContainer.innerHTML = `
        <div class="ads-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading advertisements...</p>
        </div>
    `;
    
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firebase is not initialized');
        }
        
        const db = firebase.firestore();
        
        // Get advertisements from Firestore, ordered by timestamp (newest first)
        const snapshot = await db.collection('advertisements')
            .orderBy('timestamp', 'desc')
            .get();
        
        if (snapshot.empty) {
            advertisementsContainer.innerHTML = `
                <div class="no-ads">
                    <i class="fas fa-ad"></i>
                    <p>No advertisements found</p>
                    <button id="create-first-ad" class="primary-button">
                        <i class="fas fa-plus"></i> Create Your First Ad
                    </button>
                </div>
            `;
            
            const createFirstAdBtn = document.getElementById('create-first-ad');
            if (createFirstAdBtn) {
                createFirstAdBtn.addEventListener('click', function() {
                    openAdvertisementModal();
                });
            }
            
            return;
        }
        
        // Clear container
        advertisementsContainer.innerHTML = '';
        
        // Store all advertisements in a global variable for filtering
        window.allAdvertisements = [];
        
        // Process each advertisement
        snapshot.forEach(doc => {
            const advertisement = {
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to JS Date
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
            };
            
            window.allAdvertisements.push(advertisement);
        });
        
        // Display all advertisements
        displayAdvertisements(window.allAdvertisements);
        
    } catch (error) {
        console.error('Error loading advertisements:', error);
        advertisementsContainer.innerHTML = `
            <div class="ads-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading advertisements: ${error.message}</p>
                <button class="retry-button" onclick="loadAdvertisements()">Retry</button>
            </div>
        `;
    }
}

/**
 * Display advertisements in the container
 */
function displayAdvertisements(advertisements) {
    const advertisementsContainer = document.getElementById('advertisements-container');
    
    if (!advertisementsContainer) return;
    
    // Clear container
    advertisementsContainer.innerHTML = '';
    
    if (advertisements.length === 0) {
        advertisementsContainer.innerHTML = `
            <div class="no-ads">
                <i class="fas fa-filter-slash"></i>
                <p>No advertisements match your filters</p>
            </div>
        `;
        return;
    }
    
    // Create advertisement cards
    advertisements.forEach(advertisement => {
        const card = createAdvertisementCard(advertisement);
        advertisementsContainer.appendChild(card);
    });
}

/**
 * Create an advertisement card element
 */
function createAdvertisementCard(advertisement) {
    const card = document.createElement('div');
    card.className = 'ad-card';
    card.setAttribute('data-ad-id', advertisement.id);
    
    // Format date
    const date = advertisement.timestamp instanceof Date ? 
        advertisement.timestamp : 
        new Date(advertisement.timestamp);
    
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Status badge
    const statusClass = advertisement.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = advertisement.status === 'active' ? 'Active' : 'Inactive';
    
    // Pages display
    const pages = advertisement.pages || [];
    const pagesText = pages.length > 0 ? 
        pages.map(page => page.charAt(0).toUpperCase() + page.slice(1)).join(', ') : 
        'No pages selected';
    
    card.innerHTML = `
        <div class="ad-card-header">
            <h4 class="ad-title">${advertisement.title}</h4>
            <span class="ad-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="ad-card-image">
            ${advertisement.imageUrl ? 
                `<img src="${advertisement.imageUrl}" alt="${advertisement.title}">` : 
                `<div class="no-image">
                    <i class="fas fa-image"></i>
                    <span>No image</span>
                </div>`
            }
        </div>
        
        <div class="ad-card-body">
            <p class="ad-description">${advertisement.description || 'No description'}</p>
            
            <div class="ad-details">
                <div class="ad-detail">
                    <i class="fas fa-link"></i>
                    <span>${advertisement.link ? 'Has link' : 'No link'}</span>
                </div>
                
                <div class="ad-detail">
                    <i class="fas fa-file"></i>
                    <span title="${pagesText}">${pages.length} page(s)</span>
                </div>
                
                <div class="ad-detail">
                    <i class="far fa-calendar-alt"></i>
                    <span>${formattedDate}</span>
                </div>
            </div>
        </div>
        
        <div class="ad-card-footer">
            <button class="edit-ad-btn action-btn edit" onclick="openAdvertisementModal('${advertisement.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="preview-ad-btn action-btn" onclick="previewAdvertisement('${advertisement.id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="delete-ad-btn action-btn delete" onclick="deleteAdvertisement('${advertisement.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Apply search and filter to advertisements
 */
function applyFilters() {
    if (!window.allAdvertisements) return;
    
    const searchTerm = document.getElementById('ad-search').value.toLowerCase();
    const statusFilter = document.getElementById('ad-status-filter').value;
    
    let filteredAds = window.allAdvertisements;
    
    // Apply search filter
    if (searchTerm) {
        filteredAds = filteredAds.filter(ad => {
            const title = (ad.title || '').toLowerCase();
            const description = (ad.description || '').toLowerCase();
            
            return title.includes(searchTerm) || description.includes(searchTerm);
        });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredAds = filteredAds.filter(ad => {
            return ad.status === statusFilter;
        });
    }
    
    // Display filtered advertisements
    displayAdvertisements(filteredAds);
}

/**
 * Set up the advertisement modal
 */
function setupAdvertisementModal() {
    const modal = document.getElementById('advertisement-modal');
    if (!modal) return;
    
    // Close modal when clicking the close button
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
            resetAdvertisementForm();
        });
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetAdvertisementForm();
        }
    });
    
    // Set up image source tabs
    const uploadTabBtn = document.getElementById('upload-tab-btn');
    const urlTabBtn = document.getElementById('url-tab-btn');
    const uploadTab = document.getElementById('upload-tab');
    const urlTab = document.getElementById('url-tab');
    
    if (uploadTabBtn && urlTabBtn && uploadTab && urlTab) {
        // Switch to upload tab
        uploadTabBtn.addEventListener('click', function() {
            uploadTabBtn.classList.add('active');
            urlTabBtn.classList.remove('active');
            uploadTab.style.display = 'block';
            urlTab.style.display = 'none';
        });
        
        // Switch to URL tab
        urlTabBtn.addEventListener('click', function() {
            urlTabBtn.classList.add('active');
            uploadTabBtn.classList.remove('active');
            urlTab.style.display = 'block';
            uploadTab.style.display = 'none';
        });
    }
    
    // Handle image upload preview
    const imageUploadInput = document.getElementById('ad-image-upload');
    const imagePreview = document.getElementById('ad-image-preview');
    
    if (imageUploadInput && imagePreview) {
        imageUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Advertisement Preview">`;
                    imagePreview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle image URL preview
    const imageUrlInput = document.getElementById('ad-image-url');
    const previewUrlBtn = document.getElementById('preview-url-btn');
    
    if (imageUrlInput && previewUrlBtn && imagePreview) {
        previewUrlBtn.addEventListener('click', function() {
            const imageUrl = imageUrlInput.value.trim();
            if (imageUrl) {
                // Preview the image
                imagePreview.innerHTML = `<img src="${imageUrl}" alt="Advertisement Preview" onerror="this.onerror=null;this.src='';this.alt='Error loading image';this.parentElement.classList.add('error')">`;
                imagePreview.classList.add('has-image');
                
                // Switch to upload tab to show the preview
                if (uploadTabBtn && uploadTab) {
                    uploadTabBtn.click();
                }
            } else {
                alert('Please enter a valid image URL');
            }
        });
    }
    
    // Handle form submission
    const form = document.getElementById('advertisement-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            await saveAdvertisement();
        });
    }
}

/**
 * Open advertisement modal for creating or editing
 */
function openAdvertisementModal(adId = null) {
    const modal = document.getElementById('advertisement-modal');
    const modalTitle = document.getElementById('ad-modal-title');
    const form = document.getElementById('advertisement-form');
    
    if (!modal || !modalTitle || !form) return;
    
    // Reset form first
    resetAdvertisementForm();
    
    // Set form data if editing existing advertisement
    if (adId) {
        modalTitle.textContent = 'Edit Advertisement';
        form.setAttribute('data-ad-id', adId);
        
        // Find the ad data
        const ad = window.allAdvertisements.find(a => a.id === adId);
        if (ad) {
            // Fill form with advertisement data
            document.getElementById('ad-title').value = ad.title || '';
            document.getElementById('ad-description').value = ad.description || '';
            document.getElementById('ad-link').value = ad.link || '';
            document.getElementById('ad-status').value = ad.status || 'active';
            
            // Set image preview if available
            const imagePreview = document.getElementById('ad-image-preview');
            if (imagePreview && ad.imageUrl) {
                imagePreview.innerHTML = `<img src="${ad.imageUrl}" alt="${ad.title}">`;
                imagePreview.classList.add('has-image');
            }
            
            // Set page checkboxes
            const pages = ad.pages || [];
            pages.forEach(page => {
                const checkbox = document.getElementById(`ad-${page}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        modalTitle.textContent = 'Add New Advertisement';
        form.removeAttribute('data-ad-id');
    }
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Reset advertisement form
 */
function resetAdvertisementForm() {
    const form = document.getElementById('advertisement-form');
    if (!form) return;
    
    form.reset();
    form.removeAttribute('data-ad-id');
    
    // Reset image preview
    const imagePreview = document.getElementById('ad-image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = `
            <i class="fas fa-image"></i>
            <span>No image selected</span>
        `;
        imagePreview.classList.remove('has-image');
    }
}

/**
 * Save advertisement to Firebase
 */
async function saveAdvertisement() {
    try {
        const form = document.getElementById('advertisement-form');
        if (!form) return;
        
        // Get form data
        const adId = form.getAttribute('data-ad-id');
        const title = document.getElementById('ad-title').value;
        const description = document.getElementById('ad-description').value;
        const link = document.getElementById('ad-link').value;
        const status = document.getElementById('ad-status').value;
        
        // Get selected pages
        const pages = [];
        ['schedule', 'planner'].forEach(page => {
            const checkbox = document.getElementById(`ad-${page}`);
            if (checkbox && checkbox.checked) {
                pages.push(page);
            }
        });
        
        // Validate form
        if (!title) {
            alert('Please enter a title for the advertisement');
            return;
        }
        
        if (pages.length === 0) {
            alert('Please select at least one page to display the advertisement');
            return;
        }
        
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firebase is not initialized');
        }
        
        const db = firebase.firestore();
        const storage = firebase.storage();
        
        // Prepare advertisement data
        const adData = {
            title,
            description,
            link,
            status,
            pages,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Show loading state
        const saveButton = document.getElementById('save-advertisement');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
        }
        
        // Check active tab to determine image source
        const urlTabBtn = document.getElementById('url-tab-btn');
        const isUrlTabActive = urlTabBtn && urlTabBtn.classList.contains('active');
        
        // Handle image URL if that tab is active
        if (isUrlTabActive) {
            const imageUrl = document.getElementById('ad-image-url').value.trim();
            if (imageUrl) {
                // Use the entered URL directly
                adData.imageUrl = imageUrl;
                console.log('Using image URL:', imageUrl);
            }
        } 
        // Handle image upload if a new image is selected
        else {
            const imageInput = document.getElementById('ad-image-upload');
            if (imageInput && imageInput.files && imageInput.files[0]) {
                try {
                    const file = imageInput.files[0];
                    const imageRef = storage.ref().child(`advertisements/${adId || Date.now()}_${file.name}`);
                    
                    // Update loading message
                    if (saveButton) {
                        saveButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading image...`;
                    }
                    
                    // Upload image
                    const snapshot = await imageRef.put(file);
                    const imageUrl = await snapshot.ref.getDownloadURL();
                    
                    // Add image URL to advertisement data
                    adData.imageUrl = imageUrl;
                    console.log('Image uploaded successfully:', imageUrl);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    // Continue without image if upload fails
                    alert('Image upload failed due to CORS issues. Please use the Image URL option instead.');
                    
                    // Stop the save process if no previous image exists
                    if (!adId) {
                        throw new Error('Image upload failed. Please use the Image URL option instead.');
                    }
                }
            }
        }
        
        // Update loading message
        if (saveButton) {
            saveButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving to database...`;
        }
        
        // Save to Firestore
        if (adId) {
            // Update existing advertisement
            await db.collection('advertisements').doc(adId).update(adData);
        } else {
            // Create new advertisement
            adData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('advertisements').add(adData);
        }
        
        // Close modal and refresh advertisements
        const modal = document.getElementById('advertisement-modal');
        if (modal) modal.style.display = 'none';
        
        // Success message
        alert('Advertisement saved successfully!');
        
        // Reload advertisements
        loadAdvertisements();
        
    } catch (error) {
        console.error('Error saving advertisement:', error);
        alert(`Error saving advertisement: ${error.message}`);
    } finally {
        // Reset button state regardless of success or failure
        const saveButton = document.getElementById('save-advertisement');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = `Save Advertisement`;
        }
    }
}

/**
 * Delete advertisement from Firebase
 */
async function deleteAdvertisement(adId) {
    if (!adId) return;
    
    const confirmation = confirm('Are you sure you want to delete this advertisement?');
    if (!confirmation) return;
    
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firebase is not initialized');
        }
        
        const db = firebase.firestore();
        
        // Get the advertisement data for image deletion
        const adDoc = await db.collection('advertisements').doc(adId).get();
        const adData = adDoc.data();
        
        // Delete advertisement document
        await db.collection('advertisements').doc(adId).delete();
        
        // Delete image if exists
        if (adData && adData.imageUrl) {
            try {
                const storage = firebase.storage();
                const imageRef = storage.refFromURL(adData.imageUrl);
                await imageRef.delete();
            } catch (imageError) {
                console.warn('Error deleting image:', imageError);
                // Continue even if image deletion fails
            }
        }
        
        // Reload advertisements
        loadAdvertisements();
        
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        alert(`Error deleting advertisement: ${error.message}`);
    }
}

/**
 * Preview advertisement
 */
function previewAdvertisement(adId) {
    if (!window.allAdvertisements || !adId) return;
    
    const ad = window.allAdvertisements.find(a => a.id === adId);
    if (!ad) return;
    
    // Create advertisement popup in the current page
    showAdPopup(ad);
}

/**
 * Show advertisement popup
 */
function showAdPopup(adData) {
    console.log('Admin Preview: Creating popup for ad:', adData.title);
    
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
        console.log('Admin Preview: Closing popup');
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
            console.error('Admin Preview: Failed to load image:', adData.imageUrl);
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
    console.log('Admin Preview: Popup is now visible and will remain until closed by user');
}

/**
 * Load and display advertisements on public pages
 */
function loadPublicAdvertisements() {
    // Only run on public pages, not in admin
    if (window.location.href.includes('admin-dashboard.html')) return;
    
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('Firebase not initialized, cannot load advertisements');
            return;
        }
        
        // Get current page
        let currentPage = 'home'; // Default to home
        
        if (window.location.href.includes('schedule.html')) {
            currentPage = 'schedule';
        } else if (window.location.href.includes('live-tracking.html')) {
            currentPage = 'live';
        } else if (window.location.href.includes('support.html')) {
            currentPage = 'support';
        }
        
        const db = firebase.firestore();
        
        // Get active advertisements for the current page
        db.collection('advertisements')
            .where('status', '==', 'active')
            .where('pages', 'array-contains', currentPage)
            .get()
            .then(snapshot => {
                if (snapshot.empty) return;
                
                // Get random advertisement from the results
                const ads = [];
                snapshot.forEach(doc => {
                    ads.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                if (ads.length > 0) {
                    // Show random advertisement
                    const randomIndex = Math.floor(Math.random() * ads.length);
                    const adToShow = ads[randomIndex];
                    
                    // Delay showing ad by 2 seconds to let page load
                    setTimeout(() => {
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

// Load public advertisements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize
    if (document.readyState === 'complete') {
        // If page is already loaded
        setTimeout(loadPublicAdvertisements, 1000);
    } else {
        // Wait for page to load
        window.addEventListener('load', function() {
            setTimeout(loadPublicAdvertisements, 1000);
        });
    }
});
