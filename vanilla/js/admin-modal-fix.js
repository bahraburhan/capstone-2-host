// Fix for the advertisement modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Direct event listener for the "Add New Advertisement" button
    const addAdButton = document.getElementById('add-advertisement');
    if (addAdButton) {
        console.log('Found Add New Advertisement button, attaching event listener');
        addAdButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add New Advertisement button clicked');
            // Show the modal by adding the active class
            const modal = document.getElementById('advertisement-modal');
            if (modal) {
                modal.classList.add('active');
                console.log('Modal should be visible now');
            } else {
                console.error('Advertisement modal element not found');
            }
        });
    } else {
        console.error('Add New Advertisement button not found');
    }

    // Ensure close buttons work
    document.querySelectorAll('.close-modal, #cancel-ad-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Close button clicked');
            const modal = document.getElementById('advertisement-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
});
