// Admin Dashboard - Advertisement Management
// Create a self-contained module for advertisement management
const AdModule = (function() {
    console.log('Initializing Advertisement Module');
    
    // Private module variables
    const state = {
        allAdvertisements: [],
        currentAdvertisements: [],
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 6,
        currentEditId: null
    };
    
    // Initialize Firebase Storage if not available
    function mockFirebaseStorage() {
        console.log('Checking if Firebase Storage needs to be mocked');
        
        if (typeof firebase === 'undefined') {
            console.warn('Firebase is not defined at all, cannot mock Storage');
            return;
        }
        
        if (!firebase.storage || typeof firebase.storage !== 'function') {
            console.log('Firebase Storage not available, creating mock implementation');
            firebase.storage = function() {
                console.log('Mock storage function called');
                return {
                    ref: function(path) {
                        console.log('Mock storage ref created for path:', path);
                        return {
                            put: async function(file) {
                                console.log('Mock Storage - Uploading file to path:', path);
                                return {
                                    ref: {
                                        getDownloadURL: async function() {
                                            const url = `https://via.placeholder.com/300?text=${encodeURIComponent(file.name || 'Mock+Image')}`;
                                            console.log('Mock Storage - Generated URL:', url);
                                            return url;
                                        }
                                    }
                                };
                            },
                            delete: async function() {
                                console.log('Mock Storage - Deleting file at path:', path);
                                return Promise.resolve();
                            },
                            getDownloadURL: async function() {
                                const url = `https://via.placeholder.com/300?text=Mock+Image`;
                                console.log('Mock Storage - Generated URL:', url);
                                return url;
                            }
                        };
                    }
                };
            };
            console.log('Firebase Storage mock successfully created');
        } else {
            console.log('Firebase Storage is already available, no need to mock');
        }
    }

    // Initialize event listeners for the advertisements section
    function initAdsSectionEvents() {
        console.log('Initializing advertisement section event listeners');
        
        // Add advertisement button
        const addButton = document.getElementById('add-advertisement');
        if (addButton) {
            console.log('Add advertisement button found, adding event listener');
            addButton.addEventListener('click', function() {
                console.log('Add advertisement button clicked');
                openAddAdModal();
            });
        } else {
            console.warn('Add advertisement button not found');
        }
        
        // Add event listeners for all close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                console.log('Close modal button clicked');
                // Find the parent modal and remove the active class
                const modal = this.closest('.admin-modal');
                if (modal) {
                    modal.classList.remove('active');
                    console.log('Modal closed:', modal.id);
                } else {
                    console.warn('Parent modal not found for close button');
                }
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('ad-search');
        if (searchInput) {
            console.log('Search input found, adding event listener');
            searchInput.addEventListener('input', function() {
                const query = this.value.trim().toLowerCase();
                console.log('Search query:', query);
                searchAdvertisements(query);
            });
        } else {
            console.warn('Search input not found');
        }
        
        // Cancel button in modal
        const cancelButton = document.getElementById('cancel-ad-edit');
        if (cancelButton) {
            console.log('Cancel button found, adding event listener');
            cancelButton.addEventListener('click', function() {
                console.log('Cancel button clicked');
                document.getElementById('advertisement-modal').classList.remove('active');
            });
        } else {
            console.warn('Cancel button not found');
        }
        
        // Save advertisement button
        const saveButton = document.getElementById('save-advertisement');
        if (saveButton) {
            console.log('Save button found, adding event listener');
            saveButton.addEventListener('click', function() {
                console.log('Save advertisement button clicked');
                saveAdvertisement();
            });
        } else {
            console.warn('Save button not found');
        }
        
        // Image preview on file select
        const imageInput = document.getElementById('ad-image');
        if (imageInput) {
            console.log('Image input found, adding event listener');
            imageInput.addEventListener('change', function(e) {
                console.log('Image file selected');
                previewImage(e.target);
            });
        } else {
            console.warn('Image input not found');
        }
        
        // Pagination buttons
        const prevPageBtn = document.getElementById('ad-prev-page');
        if (prevPageBtn) {
            console.log('Previous page button found, adding event listener');
            prevPageBtn.addEventListener('click', function() {
                console.log('Previous page button clicked');
                if (state.currentPage > 1) {
                    state.currentPage--;
                    console.log('Moving to page:', state.currentPage);
                    displayAdvertisements();
                }
            });
        } else {
            console.warn('Previous page button not found');
        }
        
        const nextPageBtn = document.getElementById('ad-next-page');
        if (nextPageBtn) {
            console.log('Next page button found, adding event listener');
            nextPageBtn.addEventListener('click', function() {
                console.log('Next page button clicked');
                if (state.currentPage < state.totalPages) {
                    state.currentPage++;
                    console.log('Moving to page:', state.currentPage);
                    displayAdvertisements();
                }
            });
        } else {
            console.warn('Next page button not found');
        }
        
        console.log('All advertisement section event listeners initialized');
    }

    // Load advertisements from Firestore
    function loadAdvertisements() {
        console.log('Loading advertisements...');
        
        const adContainer = document.getElementById('advertisements-container');
        if (!adContainer) {
            console.error('Advertisement container not found');
            return;
        }
        
        adContainer.innerHTML = `
            <div class="ad-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading advertisements...</p>
            </div>
        `;
        
        // Check if Firebase and Firestore are available
        if (!firebase || !firebase.firestore) {
            console.error('Firebase or Firestore is not available');
            adContainer.innerHTML = `
                <div class="ad-loading">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error: Firebase Firestore is not available</p>
                </div>
            `;
            return;
        }
        
        console.log('Fetching advertisements from Firestore');
        
        firebase.firestore().collection('advertisements')
            .get()
            .then((querySnapshot) => {
                console.log(`Got ${querySnapshot.size} advertisements from Firestore`);
                state.allAdvertisements = [];
                
                querySnapshot.forEach((doc) => {
                    const adData = doc.data();
                    console.log('Loaded advertisement:', doc.id, adData);
                    state.allAdvertisements.push({
                        id: doc.id,
                        ...adData
                    });
                });
                
                // Sort by timestamp if available
                state.allAdvertisements.sort((a, b) => {
                    return (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
                });
                
                console.log('Sorted advertisements, displaying now');
                displayAdvertisements();
            })
            .catch((error) => {
                console.error('Error loading advertisements:', error);
                adContainer.innerHTML = `
                    <div class="ad-loading">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error loading advertisements: ${error.message}</p>
                    </div>
                `;
            });
    }

    // Display advertisements with pagination
    function displayAdvertisements(adsToDisplay) {
        console.log('Displaying advertisements');
        
        const adContainer = document.getElementById('advertisements-container');
        if (!adContainer) {
            console.error('Advertisement container not found');
            return;
        }
        
        // Determine which ads to display (filtered or all)
        const ads = adsToDisplay || state.allAdvertisements;
        console.log(`Displaying ${ads.length} advertisements`);
        
        // Calculate pagination
        state.totalPages = Math.ceil(ads.length / state.itemsPerPage);
        if (state.currentPage > state.totalPages) {
            state.currentPage = state.totalPages || 1;
        }
        
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        state.currentAdvertisements = ads.slice(start, end);
        
        console.log(`Page ${state.currentPage} of ${state.totalPages}, showing ${state.currentAdvertisements.length} ads`);
        
        // Update pagination controls if they exist
        const prevPageBtn = document.getElementById('ad-prev-page');
        const nextPageBtn = document.getElementById('ad-next-page');
        const pageInfo = document.getElementById('ad-page-info');
        
        if (prevPageBtn) prevPageBtn.disabled = state.currentPage <= 1;
        if (nextPageBtn) nextPageBtn.disabled = state.currentPage >= state.totalPages;
        if (pageInfo) pageInfo.textContent = `Page ${state.currentPage} of ${state.totalPages || 1}`;
        
        // Display ads or empty state
        if (state.currentAdvertisements.length === 0) {
            console.log('No advertisements to display');
            adContainer.innerHTML = `
                <div class="ad-loading">
                    <i class="fas fa-ad"></i>
                    <p>No advertisements found. Add your first advertisement!</p>
                </div>
            `;
            return;
        }
        
        // Generate HTML for ads
        let html = '';
        state.currentAdvertisements.forEach((ad) => {
            const locationLabel = getLocationLabel(ad.location);
            console.log(`Generating HTML for ad ${ad.id}: ${ad.title}`);
            
            html += `
                <div class="ad-card" data-id="${ad.id}">
                    <div class="ad-image">
                        ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}">` : '<i class="fas fa-image"></i>'}
                    </div>
                    <h3 class="ad-title">${ad.title}</h3>
                    <p class="ad-description">${ad.description}</p>
                    <div class="ad-meta">
                        <span class="ad-location">${locationLabel}</span>
                        <a href="${ad.link}" target="_blank" class="ad-link">
                            <i class="fas fa-external-link-alt"></i> Visit
                        </a>
                    </div>
                    <div class="ad-actions">
                        <button class="action-btn edit" onclick="editAdvertisement('${ad.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteAdvertisement('${ad.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        adContainer.innerHTML = html;
        console.log('Advertisement HTML generated and displayed');
    }

    // Get human-readable label for location
    function getLocationLabel(location) {
        const locations = {
            'index': 'Home Page',
            'menu': 'Menu Page',
            'route': 'Route Page'
        };
        
        return locations[location] || location;
    }

    // Search advertisements
    function searchAdvertisements(query) {
        console.log('Searching advertisements for:', query);
        
        if (!query) {
            console.log('Empty search query, showing all advertisements');
            displayAdvertisements();
            return;
        }
        
        console.log(`Filtering ${state.allAdvertisements.length} advertisements`);
        
        const filteredAds = state.allAdvertisements.filter(ad => {
            return ad.title.toLowerCase().includes(query) || 
                   ad.description.toLowerCase().includes(query);
        });
        
        console.log(`Found ${filteredAds.length} matching advertisements`);
        
        // Reset to page 1 for search results
        state.currentPage = 1;
        displayAdvertisements(filteredAds);
    }

    // Open modal for adding a new advertisement
    function openAddAdModal() {
        console.log('Opening add advertisement modal');
        
        // Reset form and modal state
        state.currentEditId = null;
        
        const modalTitle = document.getElementById('ad-modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Advertisement';
        } else {
            console.warn('Modal title element not found');
        }
        
        // Reset form if it exists
        const form = document.getElementById('advertisement-form');
        if (form) {
            console.log('Resetting advertisement form');
            form.reset();
        } else {
            console.warn('Advertisement form not found');
        }
        
        // Reset image preview
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            console.log('Resetting image preview');
            imagePreview.innerHTML = '<i class="fas fa-image"></i><p>No image selected</p>';
            imagePreview.classList.remove('has-image');
        } else {
            console.warn('Image preview element not found');
        }
        
        // Show the modal
        const modal = document.getElementById('advertisement-modal');
        if (modal) {
            console.log('Showing advertisement modal');
            modal.classList.add('active');
        } else {
            console.error('Advertisement modal not found');
        }
    }

    // Open modal for editing an advertisement
    function editAdvertisement(adId) {
        console.log('Editing advertisement with ID:', adId);
        
        state.currentEditId = adId;
        
        // Find the advertisement
        const ad = state.allAdvertisements.find(a => a.id === adId);
        if (!ad) {
            console.error('Advertisement not found:', adId);
            return;
        }
        
        console.log('Found advertisement:', ad);
        
        // Set form values
        document.getElementById('ad-title').value = ad.title || '';
        document.getElementById('ad-description').value = ad.description || '';
        document.getElementById('ad-link').value = ad.link || '';
        document.getElementById('ad-location').value = ad.location || 'index';
        
        // Set image preview if available
        const imagePreview = document.getElementById('image-preview');
        if (ad.imageUrl) {
            console.log('Setting image preview with URL:', ad.imageUrl);
            imagePreview.innerHTML = `<img src="${ad.imageUrl}" alt="${ad.title}">`;
            imagePreview.classList.add('has-image');
        } else {
            console.log('No image URL available, showing default preview');
            imagePreview.innerHTML = '<i class="fas fa-image"></i><p>No image selected</p>';
            imagePreview.classList.remove('has-image');
        }
        
        // Update modal title
        document.getElementById('ad-modal-title').textContent = 'Edit Advertisement';
        
        // Show the modal
        document.getElementById('advertisement-modal').classList.add('active');
        console.log('Advertisement edit modal displayed');
    }

    // Preview selected image in the modal
    function previewImage(input) {
        console.log('Previewing selected image');
        
        const imagePreview = document.getElementById('image-preview');
        if (!imagePreview) {
            console.error('Image preview element not found');
            return;
        }
        
        if (input.files && input.files[0]) {
            console.log('File selected:', input.files[0].name, 'Size:', input.files[0].size, 'Type:', input.files[0].type);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                console.log('File loaded, updating preview');
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.classList.add('has-image');
            };
            
            reader.onerror = function(e) {
                console.error('Error reading file:', e);
                imagePreview.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>Error loading image</p>';
            };
            
            console.log('Starting file read');
            reader.readAsDataURL(input.files[0]);
        } else {
            console.log('No file selected, showing default preview');
            imagePreview.innerHTML = '<i class="fas fa-image"></i><p>No image selected</p>';
            imagePreview.classList.remove('has-image');
        }
    }

    // Save advertisement (create or update)
    async function saveAdvertisement() {
        console.log('Saving advertisement');
        
        // Get advertisement data from form
        const form = document.getElementById('ad-form');
        if (!form) {
            console.error('Advertisement form not found');
            return;
        }
        
        // Clear previous error messages
        const errorElement = document.getElementById('ad-form-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Get form values with detailed logging
        console.log('Getting form values...');
        const titleElement = document.getElementById('ad-title');
        const descriptionElement = document.getElementById('ad-description');
        const linkElement = document.getElementById('ad-link');
        const locationElement = document.getElementById('ad-location');
        const imageElement = document.getElementById('ad-image');
        
        if (!titleElement || !descriptionElement || !linkElement || !locationElement) {
            console.error('One or more form elements not found');
            alert('Error: Form elements not found. Please refresh the page and try again.');
            return;
        }
        
        const title = titleElement.value || '';
        const description = descriptionElement.value || '';
        const link = linkElement.value || '';
        const location = locationElement.value || 'index';
        
        console.log('Form values obtained:', { title, description, link, location });
        
        // Check if image file exists
        let imageFile = null;
        if (imageElement && imageElement.files && imageElement.files.length > 0) {
            imageFile = imageElement.files[0];
            console.log('Image file selected:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
        } else {
            console.log('No image file selected');
        }
        
        // Validate form
        if (!title || !description || !link) {
            console.log('Form validation failed - missing required fields');
            alert('Please fill out all required fields.');
            return;
        }
        
        // Show loading state
        const saveButton = document.getElementById('save-advertisement');
        if (!saveButton) {
            console.error('Save button not found');
            alert('Error: Save button not found. Please refresh the page and try again.');
            return;
        }
        
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveButton.disabled = true;
        
        // Ensure Firebase Storage is available (use mock if needed)
        mockFirebaseStorage();
        
        try {
            console.log('Creating advertisement data object...');
            const adData = {
                title: title,
                description: description,
                link: link,
                location: location,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Add last update timestamp
            };
            
            // If creating new advertisement, add createdAt timestamp
            if (!state.currentEditId) {
                console.log('Creating new advertisement - adding createdAt timestamp');
                adData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Only set creation time for new ads
            } else {
                console.log('Updating existing advertisement ID:', state.currentEditId);
            }
            
            console.log('Advertisement data prepared:', adData);
            
            // Let user know we are saving even without an image
            if (!imageFile) {
                console.log('Proceeding to save advertisement without image');
            }
            
            // Upload image if selected
            if (imageFile) {
                console.log('Image file exists, attempting upload...');
                try {
                    const imageUrl = await uploadImage(imageFile, state.currentEditId);
                    console.log('Image uploaded successfully, URL:', imageUrl);
                    adData.imageUrl = imageUrl;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image: ' + error.message + '. The advertisement will be saved without an image.');
                }
            }
            
            console.log('Proceeding to save advertisement to Firestore...');
            try {
                // Verify Firebase and Firestore are available
                if (!firebase || !firebase.firestore) {
                    throw new Error('Firebase Firestore is not available');
                }
                
                // Get the correct reference to Firestore
                let adRef;
                if (state.currentEditId) {
                    // Update existing ad
                    console.log('Updating existing advertisement with ID:', state.currentEditId);
                    adRef = firebase.firestore().collection('advertisements').doc(state.currentEditId);
                    await adRef.update(adData);
                    console.log('Advertisement updated successfully');
                    alert('Advertisement updated successfully!');
                } else {
                    // Create new ad
                    console.log('Creating new advertisement');
                    adRef = firebase.firestore().collection('advertisements').doc();
                    await adRef.set(adData);
                    console.log('New advertisement created successfully with ID:', adRef.id);
                    alert('New advertisement created successfully!');
                }
                
                // Close modal and reload advertisements
                const modal = document.getElementById('advertisement-modal');
                if (modal) {
                    modal.classList.remove('active');
                    console.log('Closed advertisement modal');
                } else {
                    console.warn('Advertisement modal not found when trying to close it');
                }
                
                // Reload the advertisements list
                console.log('Reloading advertisements list...');
                loadAdvertisements();
                
            } catch (firestoreError) {
                console.error('Error saving to Firestore:', firestoreError);
                alert(`Error saving to Firestore: ${firestoreError.message}. Please try again.`);
                throw firestoreError; // Re-throw to be caught by the main try-catch
            }
        } catch (error) {
            console.error('Error saving advertisement:', error);
            alert(`Error saving advertisement: ${error.message}`);
        } finally {
            // Reset button state
            console.log('Resetting save button state');
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    // Upload image to Firebase Storage with fallback to Data URLs if CORS issues occur
    async function uploadImage(file, adId) {
        console.log('Starting image upload process...');
        
        // Function to get a placeholder image based on the file
        function getPlaceholderImage(file) {
            const fileName = file?.name || 'advertisement';
            const url = `https://via.placeholder.com/800x400?text=${encodeURIComponent(fileName)}`;
            console.log('Using placeholder image:', url);
            return url;
        }
        
        // Function to create a data URL directly from the file (client-side solution that bypasses CORS)
        function createDataURLFromFile(file) {
            return new Promise((resolve) => {
                console.log('Creating data URL from file to bypass CORS...');
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    console.log('File read complete, data URL created successfully');
                    resolve(event.target.result);
                };
                
                reader.onerror = function() {
                    console.error('Error reading file to create data URL');
                    resolve(getPlaceholderImage(file));
                };
                
                reader.readAsDataURL(file);
            });
        }
        
        try {
            // Check that Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('Firebase is not defined, using data URL instead');
                return await createDataURLFromFile(file);
            }
            
            if (!firebase.storage || typeof firebase.storage !== 'function') {
                console.warn('Firebase Storage is not available, using data URL instead');
                return await createDataURLFromFile(file);
            }
            
            // Try using Firebase Storage first
            try {
                console.log('Attempting Firebase Storage upload...');
                
                // Create a unique filename using a timestamp and the original filename
                const timestamp = new Date().getTime();
                const fileName = file?.name ? `${timestamp}_${file.name}` : `${timestamp}_advertisement.jpg`;
                const storagePath = `advertisements/${adId || 'new'}/${fileName}`;
                
                console.log(`Uploading to path: ${storagePath}`);
                
                // Detect CORS issues early using a custom promise with timeout
                const uploadWithTimeout = (timeout = 15000) => {
                    return new Promise(async (resolve, reject) => {
                        // Add timeout for CORS issues that might hang
                        const timeoutId = setTimeout(() => {
                            console.warn('Upload timed out - likely CORS issue');
                            reject(new Error('Upload timed out - possible CORS issue'));
                        }, timeout);
                        
                        try {
                            const storageRef = firebase.storage().ref(storagePath);
                            const uploadTask = await storageRef.put(file);
                            const downloadURL = await uploadTask.ref.getDownloadURL();
                            
                            clearTimeout(timeoutId); // Clear timeout on success
                            console.log('Firebase upload successful, URL:', downloadURL);
                            resolve(downloadURL);
                        } catch (error) {
                            clearTimeout(timeoutId); // Clear timeout on error
                            console.error('Firebase upload error:', error);
                            reject(error);
                        }
                    });
                };
                
                try {
                    return await uploadWithTimeout();
                } catch (error) {
                    // If it looks like a CORS error, try data URL instead
                    if (error.message?.includes('CORS') || 
                        error.message?.includes('timed out') || 
                        error.code === 'storage/unauthorized') {
                        console.log('Detected CORS issue, switching to data URL approach...');
                        return await createDataURLFromFile(file);
                    }
                    throw error; // Re-throw other errors
                }
                
            } catch (error) {
                console.error('Error in Firebase upload:', error);
                console.log('Falling back to data URL...');
                return await createDataURLFromFile(file);
            }
        } catch (error) {
            console.error('Error handling image upload:', error);
            // Return placeholder as last resort
            return getPlaceholderImage(file);
        }
    }

    // Delete advertisement function - fixed to be outside uploadImage function
    function deleteAdvertisement(adId) {
        console.log('Deleting advertisement with ID:', adId);
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this advertisement?')) {
            console.log('Deletion cancelled by user');
            return;
        }
        
        // Find the advertisement
        const ad = state.allAdvertisements.find(a => a.id === adId);
        if (!ad) {
            console.error('Advertisement not found:', adId);
            return;
        }
        
        console.log('Advertisement found, proceeding with delete');
        
        firebase.firestore().collection('advertisements').doc(adId).delete()
            .then(() => {
                console.log('Advertisement deleted from Firestore');
                
                // If there's an image, delete it from storage
                if (ad.imageUrl) {
                    console.log('Advertisement has an image URL, attempting to delete from storage');
                    deleteImage(ad.imageUrl)
                        .then(() => {
                            console.log('Image deleted successfully');
                        })
                        .catch(error => {
                            console.warn('Error deleting image:', error);
                        });
                }
                
                // Reload advertisements
                console.log('Reloading advertisements list');
                loadAdvertisements();
            })
            .catch((error) => {
                console.error('Error deleting advertisement:', error);
                alert(`Error deleting advertisement: ${error.message}`);
            });
    }

    // Delete image from Firebase Storage
    async function deleteImage(imageUrl) {
        console.log('Deleting image with URL:', imageUrl);
        
        try {
            // Extract the path from the URL
            const urlObj = new URL(imageUrl);
            const pathname = urlObj.pathname;
            console.log('Image pathname:', pathname);
            
            // Tokens typically look like /v0/b/bucket-name.appspot.com/o/path%2Fto%2Fimage.jpg
            const match = pathname.match(/\/o\/(.+?)(?:\?|$)/);
            if (match && match[1]) {
                const imagePath = decodeURIComponent(match[1]);
                console.log('Extracted image path:', imagePath);
                
                const storageRef = firebase.storage().ref(imagePath);
                await storageRef.delete();
                console.log('Image deleted successfully:', imagePath);
            } else {
                console.warn('Could not parse image path from URL:', imageUrl);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    // Initialize the module
    function init() {
        console.log('Initializing Advertisement Module');
        mockFirebaseStorage();
        
        // Set up initialization on DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM loaded, initializing ads section events');
                initAdsSectionEvents();
                loadAdvertisements();
            });
        } else {
            // DOM already loaded
            console.log('DOM already loaded, initializing ads section events');
            initAdsSectionEvents();
            loadAdvertisements();
        }
    }

    // Expose public methods and state
    return {
        init: init,
        loadAdvertisements: loadAdvertisements,
        openAddAdModal: openAddAdModal,
        editAdvertisement: editAdvertisement,
        deleteAdvertisement: deleteAdvertisement,
        previewImage: previewImage,
        saveAdvertisement: saveAdvertisement,
        // Expose limited state
        get currentPage() { return state.currentPage; },
        set currentPage(value) { state.currentPage = value; },
        get totalPages() { return state.totalPages; },
        get currentEditId() { return state.currentEditId; }
    };
})();

// Initialize the advertisement module and expose its functions globally
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AdModule');
    // Create global references for functions that need to be called from HTML
    window.editAdvertisement = function(adId) {
        AdModule.editAdvertisement(adId);
    };
    
    window.deleteAdvertisement = function(adId) {
        AdModule.deleteAdvertisement(adId);
    };
    
    // Initialize the module
    AdModule.init();
    
    console.log('AdModule initialized and global functions exposed');
});