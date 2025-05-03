/**
 * Enhanced Schedule Page JavaScript
 * Handles searching for bus schedules and viewing routes directly between bus stops
 */

// Helper function to format time in a regular numeric format
function formatTimeReadable(dateObj) {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    
    // Format hours without leading zero
    let hourText = hours;
    
    // Format minutes with leading zero
    const minuteText = String(minutes).padStart(2, '0');
    
    // Combine hours and minutes in standard format
    return hourText + ":" + minuteText;
}

// Initialize date and time with current values
document.addEventListener('DOMContentLoaded', function() {
    console.log('Schedule.js loaded');
    
    // Set up current date and time
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    document.getElementById('searchDate').value = formattedDate;
    
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    document.getElementById('searchTime').value = `${hours}:${minutes}`;
    
    // Setup back button functionality
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'menu.html';
        });
    }
    
    // Populate bus stop dropdowns if the data is available
    if (window.BUS_STOPS && Array.isArray(window.BUS_STOPS) && window.BUS_STOPS.length > 0) {
        console.log('Bus stops data found with', window.BUS_STOPS.length, 'stops');
        populateBusStopDropdowns();
    } else {
        // If bus stops data isn't available yet, wait for it
        console.log('Bus stops data not available yet, waiting...');
        let retryCount = 0;
        const maxRetries = 20; // 4 seconds max wait time
        
        const checkInterval = setInterval(() => {
            retryCount++;
            console.log('Checking for bus stops data (attempt', retryCount, ')');
            
            if (window.BUS_STOPS && Array.isArray(window.BUS_STOPS) && window.BUS_STOPS.length > 0) {
                console.log('Bus stops data found with', window.BUS_STOPS.length, 'stops');
                populateBusStopDropdowns();
                clearInterval(checkInterval);
            } else if (retryCount >= maxRetries) {
                console.error('Failed to load bus stops data after', maxRetries, 'attempts');
                clearInterval(checkInterval);
                alert('Error loading bus stops data. Please refresh the page and try again.');
            }
        }, 200);
    }

    // Setup search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
    
    // Add the faster animation styles
    addFasterAnimationStyles();
});

// Populate bus stop dropdowns function
function populateBusStopDropdowns() {
    // Get the dropdown elements
    const fromStopSelect = document.getElementById('fromStreetSelect');
    const toStopSelect = document.getElementById('toStreetSelect');
    
    if (!fromStopSelect || !toStopSelect) {
        console.error('Bus stop dropdowns not found in the DOM');
        return;
    }
    
    if (!window.BUS_STOPS || !Array.isArray(window.BUS_STOPS) || window.BUS_STOPS.length === 0) {
        console.error('Bus stops data not available:', window.BUS_STOPS);
        return;
    }
    
    // Clear existing options except the first one
    fromStopSelect.innerHTML = '<option value="">Select a bus stop</option>';
    toStopSelect.innerHTML = '<option value="">Select a bus stop</option>';
    
    // Get current language
    const currentLanguage = localStorage.getItem('language') || 'en';
    console.log('Current language:', currentLanguage);
    
    // Add bus stop options
    window.BUS_STOPS.forEach(stop => {
        // Use street name if no bus stop name available
        let displayName;
        
        if (currentLanguage === 'ckb') {
            displayName = stop.kurdishName || (stop.streetId ? `Bus Stop at ${getStreetKurdishName(stop.streetId)}` : `Bus Stop ${stop.id}`);
        } else {
            displayName = stop.name || (stop.streetId ? `Bus Stop at ${getStreetName(stop.streetId)}` : `Bus Stop ${stop.id}`);
        }
        
        // Create option elements
        const fromOption = document.createElement('option');
        fromOption.value = stop.id;
        fromOption.textContent = displayName;
        
        const toOption = document.createElement('option');
        toOption.value = stop.id;
        toOption.textContent = displayName;
        
        // Add to selects
        fromStopSelect.appendChild(fromOption);
        toStopSelect.appendChild(toOption);
    });
    
    console.log('Bus stop dropdowns populated with', window.BUS_STOPS.length, 'stops');
}

// Helper functions to get street names
function getStreetName(streetId) {
    if (window.SULAYMANIYAH_STREETS) {
        const street = window.SULAYMANIYAH_STREETS.find(s => s.id == streetId);
        return street ? street.name : `Street ${streetId}`;
    }
    return `Street ${streetId}`;
}

function getStreetKurdishName(streetId) {
    if (window.SULAYMANIYAH_STREETS) {
        const street = window.SULAYMANIYAH_STREETS.find(s => s.id == streetId);
        return street ? street.kurdishName : `Street ${streetId}`;
    }
    return `Street ${streetId}`;
}

// Enhanced search function
function performSearch() {
    const fromStopId = document.getElementById('fromStreetSelect').value;
    const toStopId = document.getElementById('toStreetSelect').value;
    const searchDate = document.getElementById('searchDate').value;
    const searchTime = document.getElementById('searchTime').value;
    
    // Basic validation
    if (!fromStopId || !toStopId) {
        alert('Please select both from and to bus stops');
        return;
    }
    
    // Save selected locations to localStorage for persistence
    localStorage.setItem('lastFromStopId', fromStopId);
    localStorage.setItem('lastToStopId', toStopId);
    
    // Show loading state on button
    const searchButton = document.getElementById('searchButton');
    const originalButtonText = searchButton.innerHTML;
    searchButton.innerHTML = `
        <div class="spinner-animation">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 10" />
            </svg>
        </div>
        <span>Searching...</span>
    `;
    
    // Convert search time to base milliseconds for route generation
    const [hours, minutes] = searchTime.split(':').map(Number);
    const searchDateTime = new Date(searchDate);
    searchDateTime.setHours(hours, minutes, 0, 0);
    
    // Clear previous results
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    searchResults.style.opacity = 0;
    searchResults.classList.remove('hidden'); // Make sure the results container is not hidden
    
    // Simulate network delay
    setTimeout(() => {
        try {
            // Get the bus stops
            console.log('Searching for bus stops:', fromStopId, toStopId);
            console.log('BUS_STOPS available:', window.BUS_STOPS ? window.BUS_STOPS.length : 'none');
            
            const fromStop = window.BUS_STOPS.find(stop => stop.id == fromStopId);
            const toStop = window.BUS_STOPS.find(stop => stop.id == toStopId);
            
            if (!fromStop || !toStop) {
                throw new Error(`Bus stops not found: ${fromStopId} and/or ${toStopId}`);
            }
            
            console.log('Found bus stops:', fromStop, toStop);
            
            // Generate 4 route options with 15-minute intervals
            const routeOptions = generateRouteOptions(fromStop, toStop, searchDateTime.getTime());
            
            // Create the route display
            if (routeOptions && routeOptions.length > 0) {
                // Get current language for stop names
                const currentLanguage = localStorage.getItem('language') || 'en';
                const fromStopName = currentLanguage === 'ckb' ? fromStop.kurdishName : fromStop.name;
                const toStopName = currentLanguage === 'ckb' ? toStop.kurdishName : toStop.name;
                
                // Create a header for the results
                const resultsHeader = document.createElement('div');
                resultsHeader.className = 'results-header';
                resultsHeader.innerHTML = `<h3>Routes from ${fromStopName} to ${toStopName}</h3>`;
                searchResults.appendChild(resultsHeader);
                
                // Add each route option
                routeOptions.forEach(route => {
                    // Create the card
                    const card = document.createElement('div');
                    card.className = 'schedule-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="route-time">Departs at ${formatTimeReadable(route.departureTime)}</div>
                        </div>
                        <div class="card-body">
                            <div class="route-stops">
                                <div class="stop">
                                    <div class="stop-dot"></div>
                                    <div class="stop-name">${fromStopName}</div>
                                </div>
                                <div class="route-line"></div>
                                <div class="stop">
                                    <div class="stop-dot"></div>
                                    <div class="stop-name">${toStopName}</div>
                                    <div class="stop-time">Arrives: ${formatTimeReadable(route.arrivalTime)}</div>
                                </div>
                            </div>
                            <div class="route-details">
                                <div class="detail">
                                    <span>Distance</span>
                                    <span>${route.distance} km</span>
                                </div>

                                <div class="detail">
                                    <span>Fare</span>
                                    <span>${route.fare} IQD</span>
                                </div>
                                <div class="view-route-container">
                                    <button class="view-route-button" 
                                        data-from="${fromStopId}" 
                                        data-to="${toStopId}" 
                                        data-time="${route.formattedDepartureTime}"
                                        data-line="${route.line}"
                                        data-bus="${route.busId}"
                                    >
                                        View Route
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Add to results
                    searchResults.appendChild(card);
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No routes found between these bus stops.</div>';
            }
            
            // Show results with smooth animation
            setTimeout(() => {
                searchResults.style.opacity = 1;
                searchResults.classList.remove('hidden'); // Ensure visible
                
                // Add event listeners to view route buttons
                addViewRouteButtonListeners();
                
                // Scroll to the search results
                searchResults.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error('Error performing search:', err);
            searchResults.innerHTML = `<div class="error-message">Error finding routes: ${err.message}</div>`;
            searchResults.style.opacity = 1;
        }
        
        // Restore button
        searchButton.innerHTML = originalButtonText;
    }, 1000); // Simulated delay
}
function generateRouteOptions(fromStop, toStop, baseTime) {
    console.log(`Generating routes from stop ${fromStop.id} to ${toStop.id}`);
    
    // IMPORTANT: Use the exact same route generation logic as simplified-planner.js
    // to ensure consistent distance, travel time, and fare calculations
    
    // Calculate route using the same method as in simplified-planner.js's generateDirectRoute
    
    // Make sure we have valid coordinates for both stops
    let fromCoordinates = Array.isArray(fromStop.position) ? 
        fromStop.position : [fromStop.longitude, fromStop.latitude];
        
    let toCoordinates = Array.isArray(toStop.position) ? 
        toStop.position : [toStop.longitude, toStop.latitude];
    
    // Calculate distance using the Haversine formula (same as in simplified-planner.js)
    const distance = calculateDistance(
        fromCoordinates[0], fromCoordinates[1], 
        toCoordinates[0], toCoordinates[1]
    );
    
    // Calculate travel time using the same exact formula as in simplified-planner.js
    // Simple implementation: average speed of 20 km/h + 5 minutes for stops
    const speedKmPerHour = 20;
    const timeInHours = distance / speedKmPerHour;
    const travelTime = Math.round(timeInHours * 60 + 5); // Add 5 minutes for stops and delays
    
    // Get a consistent bus line using the same method as in simplified-planner.js
    // Use a hash of the stop IDs to deterministically select a line
    const fromStopId = fromStop.id;
    const toStopId = toStop.id;
    
    // Simple fallback using the same method as simplified-planner.js
    const BUS_LINES = [
        { id: "A1", name: "Red Line", color: "#e74c3c" },
        { id: "B2", name: "Blue Line", color: "#3498db" },
        { id: "C3", name: "Green Line", color: "#2ecc71" },
        { id: "D4", name: "Yellow Line", color: "#f1c40f" },
        { id: "E5", name: "Purple Line", color: "#9b59b6" }
    ];
    
    // Use the same hash function as in simplified-planner.js
    const hash = (fromStopId * 31 + toStopId) % BUS_LINES.length;
    const busLine = BUS_LINES[Math.abs(hash)];
    
    // Use the line ID just like in simplified-planner.js
    const line = busLine.id;
    
    // Calculate fare using the updated pricing model
    let fare;
    if (distance <= 5) {
        fare = 500; // 0-5km costs 500 IQD
    } else if (distance <= 10) {
        fare = 1000; // 5-10km costs 1000 IQD
    } else if (distance <= 15) {
        fare = 1500; // 10-15km costs 1500 IQD
    } else {
        fare = 2000; // More than 15km costs 2000 IQD (capped)
    }
    
    // Generate a consistent bus ID using the same method as in simplified-planner.js
    const busId = `${line}-${Math.min(fromStopId, toStopId)}${Math.max(fromStopId, toStopId)}`;
    console.log('Route details:', {
        fromStopId: fromStop.id,
        toStopId: toStop.id,
        distance,
        travelTime,
        fare,
        line,
        busId
    });
    
    // Generate 4 route options with 15-minute intervals
    // This part is specific to the schedule page but uses the same values from above
    const routeOptions = [];
    
    // Round to the next 15-minute interval first
    let startTime = new Date(baseTime);
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
        // Round up to the next 15-minute interval
        startTime.setMinutes(minutes + (15 - remainder));
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
    }
    
    for (let i = 0; i < 4; i++) {
        // Calculate departure time (add i * 15 minutes to base time)
        const departureTime = new Date(startTime.getTime() + (i * 15 * 60 * 1000));
        const formattedDepartureTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Calculate arrival time
        const arrivalTime = new Date(departureTime.getTime() + (travelTime * 60 * 1000));
        const formattedArrivalTime = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create route option object with the exact same values from our calculations above
        // Format the distance with exactly one decimal place to match simplified-planner.js
        routeOptions.push({
            fromStop: fromStop,
            toStop: toStop,
            distance: parseFloat(distance.toFixed(1)),
            travelTime: Math.round(travelTime), // Ensure consistent rounding
            fare: fare,
            line: line,
            busId: busId,
            departureTime: departureTime,
            formattedDepartureTime: formattedDepartureTime,
            arrivalTime: arrivalTime,
            formattedArrivalTime: formattedArrivalTime,
            lineColor: busLine.color, // Include line color from the bus line object
            lineName: busLine.name // Include line name for consistency
        });
    }
    
    console.log('Generated route options:', routeOptions.length);
    return routeOptions;
}

// Distance calculation helper function, matching the implementation in simplified-planner.js
function calculateDistance(pos1, pos2) {
    // Handle both array inputs and direct coordinate inputs
    let lon1, lat1, lon2, lat2;
    
    if (Array.isArray(pos1) && Array.isArray(pos2)) {
        // Using position arrays [longitude, latitude]
        lon1 = pos1[0];
        lat1 = pos1[1];
        lon2 = pos2[0];
        lat2 = pos2[1];
    } else {
        // Direct coordinate inputs
        lon1 = pos1;
        lat1 = pos2;
        lon2 = arguments[2];
        lat2 = arguments[3];
    }
    
    // Earth's radius in km
    const R = 6371;
    
    // Convert latitude and longitude from degrees to radians
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    // Haversine formula (same as in simplified-planner.js)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    return parseFloat(distance.toFixed(1));
}

// Function to add click listeners to all "View Route" buttons
function addViewRouteButtonListeners() {
    const viewRouteButtons = document.querySelectorAll('.view-route-button');
    
    viewRouteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get data attributes
            const fromStopId = this.getAttribute('data-from');
            const toStopId = this.getAttribute('data-to');
            const departTime = this.getAttribute('data-time');
            const line = this.getAttribute('data-line');
            const busId = this.getAttribute('data-bus');
            
            // Add visual feedback before navigation
            this.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                    <span style="margin-left: 8px;">Loading route...</span>
                </div>
            `;
            
            // Navigate to planner page with URL parameters for direct route display
            setTimeout(() => {
                const url = `planner.html?fromStop=${fromStopId}&toStop=${toStopId}&time=${departTime}&line=${line}&busId=${busId}`;
                window.location.href = url;
            }, 300);
        });
    });
}

// Add CSS to head to make animations faster and reduce delay
function addFasterAnimationStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .schedule-card {
            animation: fadeIn 0.2s ease forwards !important;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 16px;
            border: 1px solid #e0e0e0;
            overflow: hidden;
        }
        
        .card-header {
            background-color: #f5f5f5;
            padding: 12px 16px;
            font-weight: bold;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .card-body {
            padding: 16px;
        }
        
        .route-stops {
            margin-bottom: 20px;
        }
        
        .stop {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        
        .stop-dot {
            width: 12px;
            height: 12px;
            background-color: #4338ca;
            border-radius: 50%;
            margin-right: 12px;
        }
        
        .stop-name {
            font-weight: 500;
            flex: 1;
        }
        
        .stop-time {
            color: #4338ca;
            font-weight: 500;
        }
        
        .route-line {
            width: 2px;
            height: 30px;
            background-color: #4338ca;
            margin-left: 5px;
            margin-bottom: 8px;
            margin-top: 8px;
        }
        
        .route-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .detail {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .detail span:first-child {
            color: #666;
            font-size: 0.9em;
        }
        
        .detail span:last-child {
            font-weight: 500;
        }
        
        .view-route-container {
            grid-column: span 2;
            margin-top: 8px;
        }
        
        .view-route-button {
            width: 100%;
            background-color: #4338ca;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .view-route-button:hover {
            background-color: #3730a3;
        }
        
        .search-results {
            transition: none !important;
        }
    `;
    document.head.appendChild(styleElement);
}

// Handle Enter key press in form fields
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'fromStreetSelect' || 
            activeElement.id === 'toStreetSelect' ||
            activeElement.id === 'searchDate' ||
            activeElement.id === 'searchTime') {
            
            event.preventDefault();
            performSearch();
        }
    }
});