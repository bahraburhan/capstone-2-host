// Simple internationalization system
const translations = {
    en: {
        // Common translations
        'common.language': 'Language',
        'app.name': 'Bus Schedule',
        'common.welcome': 'Welcome to',
        'app.slogan': 'Your reliable bus tracking companion',
        'common.startButton': 'Get Started',
        'common.contactUs': 'Contact Us',
        'auth.login': 'Login',
        'auth.loggingIn': 'Logging in...',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.dontHaveAccount': 'Don\'t have an account?',
        'auth.signup': 'Sign Up',
        'auth.firstName': 'First Name',
        'auth.lastName': 'Last Name',
        'auth.address': 'Address',
        'auth.createAccount': 'Create Account',
        'auth.creatingAccount': 'Creating account...',
        'auth.alreadyHaveAccount': 'Already have an account?',
        'Error.invalidCredentials': 'Invalid email or password. Please try again.',
        'Error.loginFailed': 'Error logging in. Please try again.',
        'Error.emailInUse': 'Email is already in use. Please try a different email or login.',
        'Error.weakPassword': 'Password is too weak. Please use at least 6 characters.',
        'Error.createAccount': 'Error creating account. Please try again.',
        // Menu translations
        'menu.schedule': 'Schedule',
        'menu.chooseDestination': 'Choose your destination and view schedules',
        'menu.home': 'Home',
        'menu.admin': 'Admin',
        'menu.adminDashboard': 'Admin Dashboard',
        'menu.viewRoute': 'View and plan your bus route',
        'menu.feedback': 'Feedback',
        'menu.shareFeedback': 'Share your experience with us',
        'menu.profile': 'Profile',
        'menu.manageProfile': 'Manage your profile settings',
        'auth.logout': 'Logout',
        // Schedule translations
        'schedule.searchTitle': 'Search Bus Schedule',
        'schedule.from': 'From',
        'schedule.to': 'To',
        'schedule.date': 'Date',
        'schedule.time': 'Time',
        'schedule.search': 'Search',
        'schedule.availableRoutes': 'Available Routes',
        'schedule.departure': 'Departure',
        'schedule.arrival': 'Arrival',
        'schedule.viewRoute': 'View Route',
        // Planner translations
        'planner.title': 'Bus Route Planner',
        'planner.selectStops': 'Click on bus stops to plan your route',
        'planner.findingRoute': 'Finding best route...',
        'planner.distance': 'Distance',
        'planner.duration': 'Duration',
        'planner.fare': 'Fare',
        'planner.transfers': 'Transfers',
        'planner.clear': 'Clear Route',
        // Feedback translations
        'feedback.howWasJourney': 'How was your journey?',
        'feedback.scheduleTiming': 'Schedule Timing',
        'feedback.busQuality': 'Bus Quality',
        'feedback.routeAccuracy': 'Route Accuracy',
        'feedback.comments': 'Comments',
        'feedback.shareExperience': 'Share your experience with us...',
        'feedback.submit': 'Submit Feedback',
        'feedback.submitting': 'Submitting...',
        'feedback.helpImprove': 'Your feedback helps us improve our service',
        'feedback.haveQuestion': 'Have a question?',
        'feedback.ask': 'Ask',
        'Error.failedToSubmit': 'Failed to submit feedback. Please try again.',
        // Feedback confirmation translations
        'feedback.thankYou': 'Thank You!',
        'feedback.feedbackReceived': 'Your feedback has been received. We appreciate your input!',
        'common.backToHome': 'Back to Home',
        'common.viewSchedule': 'View Schedule',
        'common.viewRoute': 'View Route',
        'common.fromTo': 'From - To',
        'common.loading': 'Loading...',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        // Profile translations
        'profile.title': 'Profile Settings',
        'profile.loading': 'Loading profile...',
        'profile.personalInfo': 'Personal Information',
        'profile.name': 'Name',
        'profile.email': 'Email',
        'profile.phone': 'Phone Number',
        'profile.address': 'Address',
        'profile.paymentMethod': 'Preferred Payment Method',
        'profile.cash': 'Cash',
        'profile.card': 'Card',
        'profile.mobile': 'Mobile Payment',
        'profile.edit': 'Edit Profile',
        'profile.save': 'Save Changes',
        'profile.changePassword': 'Change Password',
        'profile.currentPassword': 'Current Password',
        'profile.newPassword': 'New Password',
        'profile.confirmPassword': 'Confirm New Password',
        'profile.updatePassword': 'Update Password',
        'profile.cancel': 'Cancel',
        'profile.saveSuccess': 'Profile updated successfully.',
        'profile.passwordChangeSuccess': 'Password changed successfully.',
        'Error.nameRequired': 'Name is required.',
        'Error.failedToLoadProfile': 'Failed to load profile information. Please try again.',
        'Error.failedToSave': 'Failed to save changes. Please try again.',
        'Error.passwordMismatch': 'New passwords do not match.',
        'Error.failedToChangePassword': 'Failed to change password. Please try again.',
        'Error.invalidPassword': 'Invalid password. Please try again.',
        // Auth reauth modal
        'Auth.verifyIdentity': 'Verify your identity',
        'Auth.securityVerification': 'For security reasons, please enter your current password to continue with this sensitive action.',
        'Auth.currentPassword': 'Current Password',
        'Auth.verify': 'Verify',
        'Auth.signedOut': 'You have been signed out successfully.',
        'Auth.notAuthenticated': 'Please login to continue.',
        'navigation.back': 'Back',
    },
    ckb: {
        // Common translations
        'common.language': 'زمان',
        'app.name': 'خشتەی پاس',
        'common.welcome': 'بەخێربێن بۆ',
        'app.slogan': 'هاوڕێی متمانەپێکراوی چاودێریکردنی پاس',
        'common.startButton': 'دەستپێکردن',
        'common.contactUs': 'پەیوەندیمان پێوە بکە',
        'auth.login': 'چوونەژوورەوە',
        'auth.loggingIn': 'چوونەژوورەوە...',
        'auth.email': 'ئیمەیڵ',
        'auth.password': 'وشەی نهێنی',
        'auth.dontHaveAccount': 'هەژمارت نییە؟',
        'auth.signup': 'تۆماربوون',
        'auth.firstName': 'ناوی یەکەم',
        'auth.lastName': 'ناوی دووەم',
        'auth.address': 'ناونیشان',
        'auth.createAccount': 'دروستکردنی هەژمار',
        'auth.creatingAccount': 'دروستکردنی هەژمار...',
        'auth.alreadyHaveAccount': 'هەژمارت هەیە؟',
        'auth.logout': 'دەرچوون',
        'Error.invalidCredentials': 'ئیمەیڵ یان وشەی نهێنی نادروستە. تکایە دووبارە هەوڵبدەوە.',
        'Error.loginFailed': 'هەڵە لە چوونەژوورەوە. تکایە دووبارە هەوڵبدەوە.',
        'Error.emailInUse': 'ئیمەیڵەکە پێشتر بەکارهێنراوە. تکایە ئیمەیڵێکی جیاواز بەکاربهێنە.',
        'Error.weakPassword': 'وشەی نهێنی لاوازە. تکایە لانیکەم ۶ پیت بەکاربهێنە.',
        'Error.createAccount': 'هەڵە لە دروستکردنی هەژمار. تکایە دووبارە هەوڵبدەوە.',
        'Error.nameRequired': 'ناو پێویستە.',
        'Error.failedToLoadProfile': 'نەتوانرا زانیاری پرۆفایل بهێنرێت. تکایە دووبارە هەوڵبدەوە.',
        'Error.failedToSave': 'نەتوانرا گۆڕانکاریەکان پاشەکەوت بکرێن. تکایە دووبارە هەوڵبدەوە.',
        'Error.passwordMismatch': 'وشە نهێنیە نوێیەکان وەک یەک نین.',
        'Error.failedToChangePassword': 'نەتوانرا وشەی نهێنی بگۆڕدرێت. تکایە دووبارە هەوڵبدەوە.',
        'Error.invalidPassword': 'وشەی نهێنی نادروستە. تکایە دووبارە هەوڵبدەوە.',
        // Menu translations
        'menu.schedule': 'خشتە',
        'menu.chooseDestination': 'مەنزڵگەکەت هەڵبژێرە و خشتەکان ببینە',
        'menu.route': 'ڕێگا',
        'menu.viewRoute': 'ڕێگای پاسەکەت ببینە و پلانی بۆ دابنێ',
        'menu.feedback': 'ڕاوبۆچوون',
        'menu.shareFeedback': 'ئەزموونی خۆت لەگەڵمان بەشداری پێبکە',
        'menu.profile': 'پڕۆفایل',
        'menu.manageProfile': 'ڕێکخستنەکانی پڕۆفایلەکەت بەڕێوەببە',
        // Schedule translations
        'schedule.searchTitle': 'گەڕان بۆ خشتەی پاس',
        'schedule.from': 'لە',
        'schedule.to': 'بۆ',
        'schedule.date': 'بەروار',
        'schedule.time': 'کات',
        'schedule.search': 'گەڕان',
        'schedule.availableRoutes': 'ڕێگاکانی بەردەست',
        'schedule.departure': 'بەجێهێشتن',
        'schedule.arrival': 'گەیشتن',
        'schedule.viewRoute': 'بینینی ڕێگا',
        'schedule.noRoutesFound': 'هیچ ڕێگایەک نەدۆزرایەوە',
        'schedule.selectValidStops': 'تکایە وێستگەکانی دروست هەڵبژێرە',
        // Planner translations
        'planner.title': 'پلانەری ڕێگای پاس',
        'planner.selectStops': 'کرتە لەسەر وێستگەکانی پاس بکە بۆ پلانی ڕێگاکەت',
        'planner.findingRoute': 'دۆزینەوەی باشترین ڕێگا...',
        'planner.distance': 'دووری',
        'planner.duration': 'ماوە',
        'planner.fare': 'کرێ',
        'planner.transfers': 'گۆڕینەکان',
        'planner.clear': 'پاککردنەوەی ڕێگا',
        'planner.selectLocation': 'شوێنێک هەڵبژێرە',
        'planner.calculateRoute': 'ڕێگا دیاری بکە',
        'planner.routeDetails': 'وردەکاری ڕێگا',
        'planner.noRoute': 'هیچ ڕێگایەک نەدۆزرایەوە',
        'planner.from': 'لە',
        'planner.to': 'بۆ',
        'planner.stops': 'وێستگەکان',
        'planner.locationPanel': 'پانێڵی شوێن',
        // Feedback translations
        'feedback.howWasJourney': 'گەشتەکەت چۆن بوو؟',
        'feedback.scheduleTiming': 'کاتی خشتە',
        'feedback.busQuality': 'کوالێتی پاس',
        'feedback.routeAccuracy': 'دروستی ڕێگا',
        'feedback.comments': 'تێبینیەکان',
        'feedback.shareExperience': 'ئەزموونی خۆت لەگەڵمان بەشداری پێبکە...',
        'feedback.submit': 'ناردنی ڕاوبۆچوون',
        'feedback.submitting': 'دەنێردرێت...',
        'feedback.helpImprove': 'ڕاوبۆچوونەکانت یارمەتیمان دەدات خزمەتگوزاریەکەمان باشتر بکەین',
        'feedback.haveQuestion': 'پرسیارت هەیە؟',
        'feedback.ask': 'بپرسە',
        'Error.failedToSubmit': 'نەتوانرا ڕاوبۆچوونەکە بنێردرێت. تکایە دووبارە هەوڵبدەوە.',
        // Feedback confirmation translations
        'feedback.thankYou': 'سوپاس!',
        'feedback.feedbackReceived': 'ڕاوبۆچوونەکەت وەرگیرا. سوپاس بۆ بەشداریکردنت!',
        'common.backToHome': 'گەڕانەوە بۆ سەرەکی',
        'common.viewSchedule': 'بینینی خشتە',
        'common.viewRoute': 'بینینی ڕێگا',
        'common.fromTo': 'لە - بۆ',
        'common.loading': 'بارکردن...',
        'common.close': 'داخستن',
        'common.confirm': 'دڵنیاکردنەوە',
        // Profile translations
        'profile.title': 'ڕێکخستنەکانی پرۆفایل',
        'profile.loading': 'پرۆفایل دەهێنرێت...',
        'profile.personalInfo': 'زانیاری کەسی',
        'profile.name': 'ناو',
        'profile.email': 'ئیمەیڵ',
        'profile.phone': 'ژمارەی تەلەفۆن',
        'profile.address': 'ناونیشان',
        'profile.paymentMethod': 'ڕێگەی پارەدانی پەسەندکراو',
        'profile.cash': 'نەختینە',
        'profile.card': 'کارت',
        'profile.mobile': 'پارەدانی مۆبایل',
        'profile.edit': 'دەستکاری پرۆفایل',
        'profile.save': 'پاشەکەوتکردنی گۆڕانکاریەکان',
        'profile.changePassword': 'گۆڕینی وشەی نهێنی',
        'profile.currentPassword': 'وشەی نهێنی ئێستا',
        'profile.newPassword': 'وشەی نهێنی نوێ',
        'profile.confirmPassword': 'دڵنیاییکردنەوەی وشەی نهێنی نوێ',
        'profile.updatePassword': 'نوێکردنەوەی وشەی نهێنی',
        'profile.cancel': 'پاشگەزبوونەوە',
        'profile.saveSuccess': 'پرۆفایل بە سەرکەوتوویی نوێکرایەوە.',
        'profile.passwordChangeSuccess': 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا.',
        'Error.nameRequired': 'ناو پێویستە.',
        'Error.failedToLoadProfile': 'نەتوانرا زانیاری پرۆفایل بهێنرێت. تکایە دووبارە هەوڵبدەوە.',
        'Error.failedToSave': 'نەتوانرا گۆڕانکاریەکان پاشەکەوت بکرێن. تکایە دووبارە هەوڵبدەوە.',
        'Error.passwordMismatch': 'وشە نهێنیە نوێیەکان وەک یەک نین.',
        'Error.failedToChangePassword': 'نەتوانرا وشەی نهێنی بگۆڕدرێت. تکایە دووبارە هەوڵبدەوە.',
        'Error.invalidPassword': 'وشەی نهێنی نادروستە. تکایە دووبارە هەوڵبدەوە.',
        "app.name": "خشتەی پاس",
        "common.language": "زمان",
        "common.back": "گەڕانەوە",
        "common.menu": "لیستە",
        "common.search": "گەڕان",
        "common.loading": "چاوەڕوان بە...",
        
        "nav.menu": "مێنییو",
        "nav.schedule": "خشتە",
        "nav.planner": "پلانی ڕێگا",
        "nav.feedback": "ڕا و بۆچوون",
        "nav.profile": "پرۆفایل",
        
        "auth.logout": "دەرچوون",
        "auth.login": "چوونەژوورەوە",
        "auth.register": "تۆمارکردن",
        
        "menu.schedule": "خشتە",
        "menu.chooseDestination": "شوێنی مەبەست هەڵبژێرە و خشتەکان ببینە",
        "menu.route": "ڕێگا",
        "menu.viewRoute": "ڕێگای پاسەکەت ببینە و پلان دابنێ",
        "menu.feedback": "ڕاو بۆچوون",
        "menu.shareFeedback": "ئەزموونەکەت لەگەڵ ئێمە هاوبەش بکە",
        "menu.profile": "پرۆفایل",
        "menu.manageProfile": "ڕێکخستنەکانی پرۆفایلت بەڕێوە ببە",
        
        "schedule.searchTitle": "گەڕان لە خشتەی پاس",
        "schedule.from": "لە",
        "schedule.to": "بۆ",
        "schedule.date": "بەروار",
        "schedule.time": "کات",
        "schedule.search": "گەڕان",
        "schedule.availableRoutes": "ڕێگا بەردەستەکان",
        
        "route.departure": "بەجێهێشتن",
        "route.arrival": "گەیشتن",
        "route.express": "خێرا",
        "route.regular": "ئاسایی",
        "route.viewRoute": "بینینی ڕێگا",
        "route.line": "هێڵی",
        
        "planner.title": "پلانی ڕێگا",
        "planner.start": "شوێنی دەستپێک",
        "planner.end": "شوێنی کۆتایی",
        "planner.when": "کەی",
        "planner.plan": "پلانی ڕێگا",
        
        "profile.title": "پرۆفایل",
        "profile.name": "ناو",
        "profile.email": "ئیمەیل",
        "profile.phone": "ژمارەی تەلەفۆن",
        "profile.save": "پاشەکەوتکردن",
        
        "feedback.title": "ڕا و بۆچوون",
        "feedback.message": "نامە",
        "feedback.submit": "ناردن",
        
        "error.required": "ئەم خانەیە پێویستە",
        "error.invalidEmail": "ئیمەیلێکی دروست بنووسە",
        "error.selectStreet": "تکایە شەقامێک هەڵبژێرە",
        
        "success.saved": "پاشەکەوت کرا",
        "success.sent": "نێردرا",
        
        "select.street": "شەقامێک هەڵبژێرە"

        
    }
};

// Get browser language or default to 'en'
let currentLanguage = localStorage.getItem('language') || 'en';

// Handle legacy language code 'ku' and convert to 'ckb'
if (currentLanguage === 'ku') {
    console.log('Converting legacy Kurdish language code "ku" to "ckb"');
    currentLanguage = 'ckb';
    localStorage.setItem('language', 'ckb');
}

// Log the initial language loaded from localStorage
console.log('Loaded language from localStorage:', currentLanguage);

// Function to check if the language is RTL
function isRTL() {
    return currentLanguage === 'ckb' || currentLanguage === 'ku';
}

// Function to set the page language
function setLanguage(lang) {
    if (lang !== currentLanguage) {
        console.log('Setting language to:', lang);
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // Update the page
        updatePageTranslations();
        updatePageDirection();
        updateLanguageButtonText();
        
        // Broadcast language change event for other scripts to listen to
        document.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
        console.log('Language change event dispatched');
    }
}

// Update all translations on the page
function updatePageTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        } else if (translations['en'] && translations['en'][key]) {
            // Fallback to English if translation doesn't exist in current language
            element.textContent = translations['en'][key];
            console.log(`Fallback translation used for ${key} in language ${currentLanguage}`);
        }
    });
}
function updatePageDirection() {
    console.log('Updating page direction, RTL mode:', isRTL());
    
    // AGGRESSIVELY set RTL class and attributes on ALL layout elements
    document.body.classList.toggle('rtl', isRTL());
    document.documentElement.classList.toggle('rtl', isRTL());
    
    // Force direction attribute on HTML and BODY to ensure proper cascading
    document.documentElement.setAttribute('dir', isRTL() ? 'rtl' : 'ltr');
    document.body.setAttribute('dir', isRTL() ? 'rtl' : 'ltr');
    
    // Set lang attribute for proper font rendering
    document.documentElement.setAttribute('lang', currentLanguage);
    document.body.setAttribute('lang', currentLanguage);
    
    // Locate any existing RTL style element
    let style = document.getElementById('rtl-fix-style');
    
    // Remove existing RTL style to avoid duplication
    if (style) {
        style.parentNode.removeChild(style);
    }
    
    // Add comprehensive RTL fixes via inline styles for immediate effect
    if (isRTL()) {
        style = document.createElement('style');
        style.id = 'rtl-fix-style';
        style.textContent = `
            /* CORE RTL LAYOUT OVERRIDES - these affect the entire app */
            html[dir="rtl"],
            body[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: embed !important;
            }
            
            /* Main containers - ensure all views are properly mirrored */
            [dir="rtl"] .container,
            [dir="rtl"] .main-content,
            [dir="rtl"] .menu-container,
            [dir="rtl"] .schedule-container,
            [dir="rtl"] .planner-container,
            [dir="rtl"] .feedback-container,
            [dir="rtl"] .profile-container,
            [dir="rtl"] .confirmation-container,
            [dir="rtl"] .content-container,
            [dir="rtl"] .auth-container,
            [dir="rtl"] .admin-content {
                direction: rtl !important;
                text-align: right !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            /* Navbar and main navigation components */
            [dir="rtl"] .navbar,
            [dir="rtl"] .nav-actions {
                flex-direction: row-reverse !important;
                justify-content: flex-start !important;
            }
            
            /* Menu items and flex elements must be reversed */
            [dir="rtl"] .menu-item,
            [dir="rtl"] .d-flex,
            [dir="rtl"] .flex-row {
                flex-direction: row-reverse !important;
            }

            /* Icon and content positioning */
            [dir="rtl"] .menu-icon {
                margin-left: 1rem !important;
                margin-right: 0 !important;
                order: 3 !important;
            }
            [dir="rtl"] .menu-text {
                text-align: right !important;
                order: 2 !important;
            }
            [dir="rtl"] .menu-arrow {
                margin-right: 1rem !important;
                margin-left: 0 !important;
                order: 1 !important;
                transform: rotate(180deg) !important;
            }
            
            /* Button and interactive elements */
            [dir="rtl"] button,
            [dir="rtl"] .nav-button,
            [dir="rtl"] .burger-dropdown-item,
            [dir="rtl"] .burger-menu-btn,
            [dir="rtl"] #language-toggle {
                cursor: pointer !important;
                pointer-events: auto !important;
            }
            
            /* Form and input elements */
            [dir="rtl"] input,
            [dir="rtl"] select,
            [dir="rtl"] textarea {
                text-align: right !important;
            }
            
            /* Margin and padding mirroring */
            [dir="rtl"] .mr-auto {
                margin-right: 0 !important;
                margin-left: auto !important;
            }
            [dir="rtl"] .ml-auto {
                margin-left: 0 !important;
                margin-right: auto !important;
            }
        `;
        document.head.appendChild(style);
        
        // Force RTL on main content elements when needed
        for (const selector of [
            '.container', '.main-content', '.menu-container', '.schedule-container', 
            '.planner-container', '.feedback-container', '.profile-container', 
            '.navbar', '.menu-item', '.menu-icon', '.menu-text', '.menu-arrow'
        ]) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.direction = 'rtl';
                el.setAttribute('dir', 'rtl');
            });
        }
    }
    
    console.log('Page direction fully updated, RTL:', isRTL());
}

// Function to toggle between languages
function toggleLanguage() {
    console.log('Toggling language from:', currentLanguage);
    
    // Always explicitly check the current language to avoid issues
    if (currentLanguage === 'en') {
        setLanguage('ckb');
    } else {
        // For anything not English (Kurdish or any other), switch to English
        setLanguage('en');
    }
    
    console.log('Language toggled to:', currentLanguage);
    
    // Update street labels if on planner page before reloading
    if (window.updateStreetLabels && typeof window.updateStreetLabels === 'function') {
        console.log('Updating street labels for new language');
        window.updateStreetLabels();
    }
    
    // Add a forceful approach: reload the page to ensure full RTL/LTR change
    // We save the language in localStorage first, so when the page reloads
    // it will load with the new language and direction
    window.location.reload();
}

// Function to update language toggle button text
function updateLanguageButtonText() {
    console.log('Updating language toggle buttons with current language:', currentLanguage);
    
    // Regular navbar language button (main and all instances)
    const langButtons = document.querySelectorAll('#language-toggle, .language-button');
    langButtons.forEach(btn => {
        if (btn) {
            // Always show the OPPOSITE language (what you'll get if you click)
            btn.textContent = currentLanguage === 'en' ? 'کوردی' : 'English';
            
            // Make sure it's clickable
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
            console.log('Updated language button text to:', btn.textContent);
        }
    });
    
    // Mobile menu language buttons (burger menu and any with spans)
    const mobileButtons = document.querySelectorAll('#burger-language-toggle, .burger-language-toggle');
    mobileButtons.forEach(btn => {
        if (btn) {
            // Find the text span
            const textSpan = btn.querySelector('span');
            if (textSpan) {
                // Show opposite language name
                textSpan.textContent = currentLanguage === 'en' ? 'کوردی' : 'English';
                console.log('Updated mobile language button span to:', textSpan.textContent);
            } else {
                // If no span, update the whole button
                btn.textContent = currentLanguage === 'en' ? 'کوردی' : 'English';
                console.log('Updated mobile language button text to:', btn.textContent);
            }
            
            // Make sure it's clickable
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        }
    });
    
    console.log('All language buttons updated for:', currentLanguage);
}

// Initialize translations when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Apply the language stored in localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        console.log('Applying saved language from localStorage:', savedLanguage);
        currentLanguage = savedLanguage;
    }
    
    // Update the page with the current language
    updatePageTranslations();
    updatePageDirection();
    updateLanguageButtonText();
    
    console.log('i18n system initialized with language:', currentLanguage);
});

// Handle dynamically loaded content
document.addEventListener('components-loaded', () => {
    console.log('Components loaded, updating translations');
    updatePageTranslations();
    updateLanguageButtonText();
});

// Make functions available globally
window.toggleLanguage = toggleLanguage;
window.setLanguage = setLanguage;
window.currentLanguage = currentLanguage;
window.updatePageTranslations = updatePageTranslations;
window.updatePageDirection = updatePageDirection;
window.updateLanguageButtonText = updateLanguageButtonText;
