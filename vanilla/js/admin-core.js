// Admin Dashboard Core Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Add logout functionality
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Initialize modal close buttons
    document.querySelectorAll('.close-modal, #cancel-edit, #close-feedback').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.admin-modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Initialize admin content after authentication
    document.addEventListener('admin-initialized', handleAdminInitialized);
});

// Initialize navigation between sections
function initNavigation() {
    const navItems = document.querySelectorAll('.admin-nav li[data-section]');
    const sections = document.querySelectorAll('.admin-section');
    const sectionTitle = document.getElementById('section-title');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Update navigation
            navItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            
            // Update section visibility
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                }
            });
            
            // Update section title
            const titles = {
                'users': 'User Management',
                'analytics': 'System Analytics',
                'feedbacks': 'User Feedbacks'
            };
            sectionTitle.textContent = titles[targetSection] || '';
        });
    });
}

// Handle admin initialization
function handleAdminInitialized(event) {
    // Get admin user data
    const user = event.detail.user;
    
    // Update UI with admin info
    const adminUserName = document.getElementById('admin-user-name');
    if (adminUserName) {
        adminUserName.textContent = user.displayName || user.email;
    }
    
    // Load initial data for each section
    if (typeof loadUsers === 'function') {
        loadUsers();
    }
    
    if (typeof loadAnalytics === 'function') {
        loadAnalytics();
    }
    
    if (typeof loadFeedbacks === 'function') {
        loadFeedbacks();
    }
}

// Handle logout
function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Admin logged out');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Error logging out:', error);
            alert('Error logging out: ' + error.message);
        });
}
