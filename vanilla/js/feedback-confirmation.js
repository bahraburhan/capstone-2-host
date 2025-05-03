document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Handle home button click
    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    // Handle schedule button click
    const scheduleButton = document.getElementById('schedule-button');
    scheduleButton.addEventListener('click', () => {
        window.location.href = 'schedule.html';
    });

    // Setup language toggle
    const languageToggle = document.getElementById('language-toggle');
    languageToggle.addEventListener('click', () => {
        const newLanguage = currentLanguage === 'en' ? 'ckb' : 'en';
        setLanguage(newLanguage);
    });

    // Setup logout button
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Initialize translations
    updatePageTranslations();
    updatePageDirection();
});
