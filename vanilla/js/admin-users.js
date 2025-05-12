// Admin Users Management Functionality
let usersList = [];
let currentPage = 1;
let totalPages = 1;
const usersPerPage = 10;
let currentUserData = null;

// Load users from Firebase Auth and Firestore
async function loadUsers() {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) {
        console.error('users-table-body element not found');
        return;
    }
    usersTableBody.innerHTML = '<tr class="user-loading"><td colspan="6">Loading users...</td></tr>';
    
    try {
        // First get users from Firestore to get roles and other custom data
        const usersSnapshot = await firebase.firestore().collection('users').get();
        const usersMap = {};
        
        // Create a map of user data from Firestore
        usersSnapshot.forEach(doc => {
            usersMap[doc.id] = {
                id: doc.id,
                ...doc.data()
            };
        });
        
        // Now get users from Auth (this would typically be a Cloud Function in production)
        // Since client-side JS can't list all users directly from Firebase Auth,
        // we'll use Firestore as our source of truth for this demo
        usersList = Object.values(usersMap);
        
        // Sort by creation date (newest first)
        usersList.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.seconds : 0;
            const dateB = b.createdAt ? b.createdAt.seconds : 0;
            return dateB - dateA;
        });
        
        // Calculate pagination
        totalPages = Math.ceil(usersList.length / usersPerPage);
        if (totalPages === 0) totalPages = 1;
        currentPage = 1;
        
        // Display users
        displayUsers();
        updatePagination();
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableBody.innerHTML = `<tr><td colspan="6">Error loading users: ${error.message}</td></tr>`;
    }
}

// Display users with pagination
function displayUsers() {
    const usersTableBody = document.getElementById('users-table-body');
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, usersList.length);
    const usersToDisplay = usersList.slice(startIndex, endIndex);
    
    if (usersToDisplay.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
        return;
    }
    
    // Generate table rows
    usersTableBody.innerHTML = usersToDisplay.map(user => {
        // Format creation date
        const createdDate = user.createdAt 
            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() 
            : 'N/A';
        
        // Format user ID for display
        const displayId = user.id.length > 8 ? `${user.id.substring(0, 8)}...` : user.id;
        
        // Determine if current user is an admin (don't allow deleting admins)
        const isAdmin = user.role === 'admin';
        
        return `
            <tr>
                <td title="${user.id}">${displayId}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.displayName || 'N/A'}</td>
                <td><span class="user-role ${user.role || 'user'}">${user.role || 'user'}</span></td>
                <td>${createdDate}</td>
                <td>
                    <div class="user-actions">
                        <button class="action-btn edit" data-user-id="${user.id}" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isAdmin ? `
                        <button class="action-btn delete" data-user-id="${user.id}" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners for edit/delete buttons
    addUserActionListeners();
}

// Add event listeners to user action buttons
function addUserActionListeners() {
    // Edit user buttons
    document.querySelectorAll('.action-btn.edit').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            openUserEditModal(userId);
        });
    });
    
    // Delete user buttons
    document.querySelectorAll('.action-btn.delete').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId);
            }
        });
    });
}

// Update pagination controls
function updatePagination() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Add null checks for all elements
    if (!prevButton || !nextButton || !pageInfo) {
        console.warn('Pagination elements not found in the DOM');
        return;
    }
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
            updatePagination();
        }
    };
    
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
            updatePagination();
        }
    };
}

// Open user edit modal
function openUserEditModal(userId) {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;
    
    currentUserData = user;
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Edit User';
    
    // Fill form fields
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-name').value = user.displayName || '';
    document.getElementById('user-role').value = user.role || 'user';
    document.getElementById('user-status').value = user.status || 'active';
    
    // Show modal
    document.getElementById('user-modal').classList.add('active');
    
    // Add save handler
    document.getElementById('save-user').onclick = saveUserChanges;
}

// Save user changes
async function saveUserChanges() {
    if (!currentUserData) return;
    
    try {
        const userId = currentUserData.id;
        const displayName = document.getElementById('user-name').value;
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // Show loading state
        const saveButton = document.getElementById('save-user');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        
        // Update user in Firestore
        await firebase.firestore().collection('users').doc(userId).update({
            displayName,
            role,
            status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // In a real application, you would use Firebase Admin SDK via a Cloud Function 
        // to update user attributes in Firebase Auth as well
        // For example, to disable/enable the account based on status
        
        // Update local data
        const userIndex = usersList.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            usersList[userIndex] = {
                ...usersList[userIndex],
                displayName,
                role,
                status,
                updatedAt: {
                    seconds: Math.floor(Date.now() / 1000),
                    nanoseconds: 0
                }
            };
        }
        
        // Reset button
        saveButton.textContent = originalText;
        saveButton.disabled = false;
        
        // Close modal
        document.getElementById('user-modal').classList.remove('active');
        
        // Refresh display
        displayUsers();
        
        // Reset current user
        currentUserData = null;
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + error.message);
        
        // Reset button
        const saveButton = document.getElementById('save-user');
        saveButton.textContent = 'Save Changes';
        saveButton.disabled = false;
    }
}

// Delete user
async function deleteUser(userId) {
    try {
        // Get the user to delete
        const userToDelete = usersList.find(u => u.id === userId);
        if (!userToDelete) return;
        
        // Prevent deleting admin users
        if (userToDelete.role === 'admin') {
            alert('Cannot delete admin users.');
            return;
        }
        
        // Delete the user from Firestore
        await firebase.firestore().collection('users').doc(userId).delete();
        
        // In a production environment, you would use Firebase Admin SDK 
        // via a Cloud Function to delete the user from Firebase Auth as well
        // firebase.auth().deleteUser(userId) - requires admin SDK
        
        // You could call a custom Cloud Function like this:
        // const deleteUserFn = firebase.functions().httpsCallable('deleteUser');
        // await deleteUserFn({ userId });
        
        // Remove from local array
        usersList = usersList.filter(user => user.id !== userId);
        
        // Recalculate pagination
        totalPages = Math.ceil(usersList.length / usersPerPage);
        if (totalPages === 0) totalPages = 1;
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        
        // Refresh display
        displayUsers();
        updatePagination();
        
        // Show success message
        alert('User deleted successfully.');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    }
}

// Handle user search
document.addEventListener('DOMContentLoaded', function() {
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // If search is cleared, reload all users
                loadUsers();
                return;
            }
            
            // Filter users based on search term
            const filteredUsers = usersList.filter(user => {
                return (
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
                    (user.role && user.role.toLowerCase().includes(searchTerm)) ||
                    (user.id && user.id.toLowerCase().includes(searchTerm))
                );
            });
            
            // Update display with filtered users
            const tempList = usersList;
            usersList = filteredUsers;
            
            // Calculate pagination for filtered results
            totalPages = Math.ceil(usersList.length / usersPerPage);
            if (totalPages === 0) totalPages = 1;
            currentPage = 1;
            
            // Display filtered users
            displayUsers();
            updatePagination();
            
            // Restore original list for next search
            usersList = tempList;
        });
    }
});

// Helper function to create a new user (for future implementation)
async function createNewUser(userData) {
    try {
        // In a real application, you would use Firebase Admin SDK via a Cloud Function
        // to create users in Firebase Auth
        
        // For now, we'll just create a user record in Firestore
        const newUserRef = firebase.firestore().collection('users').doc();
        
        // Create user data with defaults
        const newUserData = {
            id: newUserRef.id,
            email: userData.email,
            displayName: userData.displayName || '',
            role: userData.role || 'user',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add to Firestore
        await newUserRef.set(newUserData);
        
        // Add to local list and refresh display
        usersList.unshift({
            ...newUserData,
            createdAt: {
                seconds: Math.floor(Date.now() / 1000),
                nanoseconds: 0
            }
        });
        
        // Recalculate pagination
        totalPages = Math.ceil(usersList.length / usersPerPage);
        currentPage = 1;
        
        // Refresh display
        displayUsers();
        updatePagination();
        
        return newUserRef.id;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Export functions for use in other modules
window.loadUsers = loadUsers;
window.createNewUser = createNewUser;
