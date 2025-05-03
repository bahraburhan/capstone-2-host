// simplified-planner.js - Direct route planning between any two bus stops
// This implements the simplified routing logic where any two stops can be connected directly

document.addEventListener('DOMContentLoaded', () => {
    console.log('===== SIMPLIFIED-PLANNER.JS INITIALIZATION =====');
    
    // Global variables
    let map = null;
    let userMarker = null;
    let userPosition = null;
    let destinationMarker = null;
    let destinationPosition = null;
    let selectedRoute = null;
    let directRouteDisplayed = false;
    
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
        console.log('No authenticated user, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    console.log('User authenticated:', user.email);

    // Initialize Mapbox
    function initializeMap() {
        console.log('Initializing map');
        mapboxgl.accessToken = 'pk.eyJ1IjoiZHlhcnkwMTciLCJhIjoiY2wxaDhtams2MGJrcTNqbjJ5N2s2bTh5diJ9.cidFRjA1obU6y8MoJTy3RA';
        
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: SULAYMANIYAH_CENTER,
            zoom: 13
        });

        // Add navigation control
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Handle map load
        map.on('load', () => {
            console.log('Map loaded');
            initializeRouteLayers();
            addBusStopMarkers();
            addStreetLinesAndLabels();
            
            // Set user's current position (simulated)
            setUserCurrentPosition();
            
            // Check for URL parameters for direct route display
            processUrlParameters();
        });
        
        // Add error handler
        map.on('error', (e) => {
            console.log('Map error occurred', e.error);
        });
    }
    
    // Process URL parameters for direct route display
    function processUrlParameters() {
        console.log('Processing URL parameters');
        try {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Support both 'from'/'to' and 'fromStop'/'toStop' parameter formats
            let fromStopId = parseInt(urlParams.get('from'));
            let toStopId = parseInt(urlParams.get('to'));
            
            // If not found, try alternative parameter names
            if (isNaN(fromStopId)) {
                fromStopId = parseInt(urlParams.get('fromStop'));
                console.log('Using fromStop parameter instead:', fromStopId);
            }
            
            if (isNaN(toStopId)) {
                toStopId = parseInt(urlParams.get('toStop'));
                console.log('Using toStop parameter instead:', toStopId);
            }
            
            const departureTime = urlParams.get('time');
            const lineId = urlParams.get('line');
            const busId = urlParams.get('bus') || urlParams.get('busId');
            
            if (!isNaN(fromStopId) && !isNaN(toStopId)) {
                console.log('Found route parameters in URL', { fromStopId, toStopId, departureTime, lineId, busId });
                
                // Get current user ID for user-specific route history
                const user = getCurrentUser();
                if (user && user.uid) {
                    // Save these locations in localStorage with user-specific keys
                    const userRouteKey = `user_${user.uid}_routes`;
                    
                    // Get existing routes for this user or create a new array
                    let userRoutes = [];
                    try {
                        const existingRoutes = localStorage.getItem(userRouteKey);
                        if (existingRoutes) {
                            userRoutes = JSON.parse(existingRoutes);
                        }
                    } catch (e) {
                        console.error('Error parsing existing routes:', e);
                        userRoutes = [];
                    }
                    
                    // Add current route to user's history (if not already there)
                    const newRoute = {
                        fromStopId: fromStopId,
                        toStopId: toStopId,
                        timestamp: new Date().toISOString(),
                        userId: user.uid
                    };
                    
                    // Check if this exact route already exists for this user
                    const routeExists = userRoutes.some(route => 
                        route.fromStopId === fromStopId && route.toStopId === toStopId);
                        
                    if (!routeExists) {
                        // Add to beginning of array (most recent first)
                        userRoutes.unshift(newRoute);
                        
                        // Keep only the 5 most recent routes
                        if (userRoutes.length > 5) {
                            userRoutes = userRoutes.slice(0, 5);
                        }
                        
                        // Save updated routes
                        localStorage.setItem(userRouteKey, JSON.stringify(userRoutes));
                        console.log('Saved route to user history:', newRoute);
                    }
                    
                    // Also save as last route for backward compatibility
                    localStorage.setItem('lastFromStopId', fromStopId);
                    localStorage.setItem('lastToStopId', toStopId);
                } else {
                    console.log('No user ID available, using anonymous storage');
                    // Fallback to regular localStorage if no user ID available
                    localStorage.setItem('lastFromStopId', fromStopId);
                    localStorage.setItem('lastToStopId', toStopId);
                }
                    
                // Parse and set the fixed departure time if available
                if (departureTime) {
                    try {
                        // Get current date
                        const today = new Date();
                        
                        // Handle different time formats like "21:30" or "09:30 PM"
                        let hours = 0;
                        let minutes = 0;
                        let isPM = false;
                        
                        if (departureTime.includes(':')) {
                            // Extract hours and minutes
                            const timeParts = departureTime.split(':');
                            if (departureTime.includes('PM') || departureTime.includes('AM')) {
                                // Format like "09:30 PM"
                                hours = parseInt(timeParts[0]);
                                minutes = parseInt(timeParts[1].split(' ')[0]);
                                isPM = departureTime.includes('PM');
                                
                                // Convert 12-hour format to 24-hour format
                                if (isPM && hours < 12) hours += 12;
                                if (!isPM && hours === 12) hours = 0;
                            } else {
                                // Format like "21:30"
                                hours = parseInt(timeParts[0]);
                                minutes = parseInt(timeParts[1]);
                            }
                            
                            // Create the fixed departure time
                            const fixedTime = new Date(today);
                            fixedTime.setHours(hours, minutes, 0, 0);
                            fixedDepartureTime = fixedTime;
                            console.log('Set fixed departure time:', fixedDepartureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                        }
                    } catch (e) {
                        console.error('Error parsing departure time:', e);
                    }
                }
                
                // Wait a moment for bus stops to load
                setTimeout(() => {
                    console.log('Displaying route from URL parameters');
                    displayDirectRouteBetweenStops(fromStopId, toStopId);
                }, 1500); // Increased timeout to ensure everything is loaded
            } else {
                console.log('No valid route parameters found in URL');
                
                // Try to load routes using the UserRouteHistory manager
                if (window.UserRouteHistory) {
                    console.log('Using UserRouteHistory to retrieve user-specific routes');
                    const recentRoute = window.UserRouteHistory.getMostRecentRoute();
                    
                    if (recentRoute) {
                        console.log('Found user-specific route:', recentRoute);
                        
                        // Wait a moment for bus stops to load
                        setTimeout(() => {
                            console.log('Displaying route from user history');
                            displayDirectRouteBetweenStops(
                                recentRoute.fromStopId, 
                                recentRoute.toStopId
                            );
                            
                            // Also update the dropdowns if they exist
                            updateLocationDropdowns(
                                recentRoute.fromStopId, 
                                recentRoute.toStopId
                            );
                        }, 1500);
                    } else {
                        console.log('No user-specific routes found');
                        fallbackToGenericRoutes();
                    }
                } else {
                    console.warn('UserRouteHistory manager not available');
                    fallbackToGenericRoutes();
                }
                
                // Helper function for falling back to generic routes
                function fallbackToGenericRoutes() {
                    console.log('Falling back to generic saved routes');
                    // Check if we have previously saved locations in localStorage
                    const savedFromStopId = parseInt(localStorage.getItem('lastFromStopId'));
                    const savedToStopId = parseInt(localStorage.getItem('lastToStopId'));
                    
                    if (!isNaN(savedFromStopId) && !isNaN(savedToStopId)) {
                        console.log('Found saved locations in localStorage', { savedFromStopId, savedToStopId });
                        
                        // Wait a moment for bus stops to load
                        setTimeout(() => {
                            console.log('Displaying route from generic saved locations');
                            displayDirectRouteBetweenStops(savedFromStopId, savedToStopId);
                            
                            // Also update the dropdowns if they exist
                            updateLocationDropdowns(savedFromStopId, savedToStopId);
                        }, 1500);
                    } else {
                        console.log('No saved locations found in localStorage');
                    }
                }
            }
        } catch (error) {
            console.error('Error processing URL parameters:', error);
        }
    }
    
    // Helper function to update location dropdowns with saved values
    function updateLocationDropdowns(fromStopId, toStopId) {
        try {
            // Check if the dropdowns exist
            const fromDropdown = document.querySelector('#origin-dropdown');
            const toDropdown = document.querySelector('#destination-dropdown');
            
            if (fromDropdown) fromDropdown.value = fromStopId;
            if (toDropdown) toDropdown.value = toStopId;
            
            console.log('Updated location dropdowns with saved values');
        } catch (error) {
            console.error('Error updating dropdowns:', error);
        }
    }
    
    // Initialize route layers
    function initializeRouteLayers() {
        console.log('Initializing route layers');
        
        // Main route layer (will be populated later)
        map.addSource('main-route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            }
        });
        
        map.addLayer({
            id: 'main-route-layer',
            type: 'line',
            source: 'main-route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
            },
            paint: {
                'line-color': '#3498db',
                'line-width': 5,
                'line-opacity': 0.8
            }
        });
        
        console.log('Added main route layer');
    }
    
    // Set user's current position (simulated) - marker removed
    function setUserCurrentPosition() {
        console.log('Setting user current position (without marker)');
        
        // Simulate user's current position
        userPosition = [SULAYMANIYAH_CENTER[0] + 0.005, SULAYMANIYAH_CENTER[1] - 0.003];
        
        console.log('User position set to', userPosition);
        
        // Remove any existing user marker
        if (userMarker) {
            userMarker.remove();
            userMarker = null;
        }
        
        // Fly to center location
        map.flyTo({
            center: userPosition,
            zoom: 14,
            essential: true
        });
    }
    
    // Add bus stop markers at street locations - DISABLED per user request
    function addBusStopMarkers() {
        console.log('Bus stop markers disabled per user request');
        
        // Check if SULAYMANIYAH_STREETS are available
        if (!window.SULAYMANIYAH_STREETS || !Array.isArray(window.SULAYMANIYAH_STREETS)) {
            console.log('SULAYMANIYAH_STREETS not found or not an array, waiting...');
            
            // Check periodically if streets are loaded
            const checkInterval = setInterval(() => {
                if (window.SULAYMANIYAH_STREETS && Array.isArray(window.SULAYMANIYAH_STREETS)) {
                    console.log('SULAYMANIYAH_STREETS loaded');
                    clearInterval(checkInterval);
                    addBusStopMarkers();
                }
            }, 200);
            
            return;
        }
        
        console.log(`Processing ${SULAYMANIYAH_STREETS.length} streets data without adding markers`);
        
        // Store data without adding visual markers
        const busStopMarkers = [];
        
        // Process all streets
        SULAYMANIYAH_STREETS.forEach(street => {
            // Calculate midpoint of the street for the data
            const position = [
                (street.startPoint[0] + street.endPoint[0]) / 2,
                (street.startPoint[1] + street.endPoint[1]) / 2
            ];
            
            // Store the bus stop data in BUS_STOPS format for compatibility
            // This ensures the existing route display logic works without visual markers
            if (!window.BUS_STOPS) {
                window.BUS_STOPS = [];
            }
            
            // Add or update the bus stop data
            const stopIndex = window.BUS_STOPS.findIndex(stop => stop.id === street.id);
            const busStop = {
                id: street.id,
                name: street.name,
                kurdishName: street.kurdishName,
                position: position,
                isHub: street.isMainRoad || false,
                streetId: street.id,
                connections: [] // Will be populated later if needed
            };
            
            if (stopIndex >= 0) {
                window.BUS_STOPS[stopIndex] = busStop;
            } else {
                window.BUS_STOPS.push(busStop);
            }
        });
        
        window.busStopMarkers = busStopMarkers;
        console.log(`Processed ${SULAYMANIYAH_STREETS.length} streets data without adding visual markers`);
    }
        
    // Create connections between all bus stops
    function createBusStopConnections() {
        if (!window.BUS_STOPS || !Array.isArray(window.BUS_STOPS)) {
            return;
        }
        
        // Create connections between all bus stops
        window.BUS_STOPS.forEach(fromStop => {
            window.BUS_STOPS.forEach(toStop => {
                // Don't connect stop to itself
                if (fromStop.id !== toStop.id) {
                    // Calculate distance and travel time
                    const distance = calculateDistance(
                        fromStop.position[0], fromStop.position[1], 
                        toStop.position[0], toStop.position[1]
                    );
                    const travelTime = calculateTravelTime(distance);
                    
                    // Get a consistent bus line for this route
                    const busLineId = getConsistentBusLine(`${fromStop.id}-${toStop.id}`);
                    
                    // Add connection to fromStop
                    if (!fromStop.connections) {
                        fromStop.connections = [];
                    }
                    
                    fromStop.connections.push({
                        stopId: toStop.id,
                        distance: distance,
                        travelTime: travelTime,
                        line: busLineId
                    });
                }
            });
        });
        
        console.log('Bus stop connections created for direct routing');
    }
    
    // Handle bus stop click
    function handleStopClick(stop) {
        console.log('Bus stop clicked', {
            id: stop.id,
            name: stop.name,
            position: stop.position
        });
        
        // Set as destination
        destinationPosition = stop.position;
        
        // Add destination marker
        if (destinationMarker) {
            console.log('Removing existing destination marker');
            destinationMarker.remove();
        }
        
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'destination-marker';
        // Create a fallback for the missing image
        el.style.backgroundColor = '#2ecc71';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundSize = 'contain';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 0 2px #e74c3c';
        
        destinationMarker = new mapboxgl.Marker(el)
            .setLngLat(destinationPosition)
            .addTo(map);
            
        console.log('Added destination marker');
        
        // Reset direct route displayed flag
        directRouteDisplayed = false;
        
        // Find nearest bus stop to user's current position
        const fromStop = findNearestStopToPosition(userPosition);
        
        // Generate and display direct route
        displayDirectRouteBetweenStops(fromStop.id, stop.id);
    }
    
    // Find the nearest bus stop to a position
    function findNearestStopToPosition(position) {
        console.log('Finding nearest bus stop to position', position);
        
        if (!window.BUS_STOPS || !Array.isArray(window.BUS_STOPS)) {
            console.error('BUS_STOPS not found or not an array');
            return null;
        }
        
        let closestStop = null;
        let closestDistance = Infinity;
        
        BUS_STOPS.forEach(stop => {
            const distance = calculateDistance(position[0], position[1], stop.position[0], stop.position[1]);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestStop = stop;
            }
        });
        
        console.log('Found nearest bus stop', {
            id: closestStop.id,
            name: closestStop.name,
            position: closestStop.position,
            distance: closestDistance.toFixed(4) + ' km'
        });
        
        return closestStop;
    }
    
    // Find the nearest bus stop to a street
    function findNearestStopToStreet(street) {
        console.log('Finding nearest bus stop to street', street.name);
        
        // Calculate midpoint of the street
        const midpoint = [
            (street.startPoint[0] + street.endPoint[0]) / 2,
            (street.startPoint[1] + street.endPoint[1]) / 2
        ];
        
        // Find the nearest bus stop to this midpoint
        return findNearestStopToPosition(midpoint);
    }
    
    // Display direct route between two street/bus stops
    function displayDirectRouteBetweenStops(fromStopId, toStopId) {
        console.log('===== ROUTE DISPLAY PROCESS START =====');
        console.log('Displaying direct route between street locations:', {
            fromStopId: fromStopId,
            toStopId: toStopId
        });
        
        // Find the streets associated with these IDs
        let fromStreet, toStreet;
        
        if (window.SULAYMANIYAH_STREETS && Array.isArray(window.SULAYMANIYAH_STREETS)) {
            fromStreet = window.SULAYMANIYAH_STREETS.find(street => street.id === fromStopId);
            toStreet = window.SULAYMANIYAH_STREETS.find(street => street.id === toStopId);
        }
        
        // If streets are not found directly, use bus stops (for backward compatibility)
        let fromStop, toStop;
        if (!fromStreet || !toStreet) {
            // Verify bus stops are loaded
            if (!window.BUS_STOPS || window.BUS_STOPS.length === 0) {
                console.error('Street data and bus stops not available, waiting...');
                // Wait and retry
                setTimeout(() => displayDirectRouteBetweenStops(fromStopId, toStopId), 1000);
                return;
            }
            
            // Verify the stops exist
            fromStop = window.BUS_STOPS.find(stop => stop.id === fromStopId);
            toStop = window.BUS_STOPS.find(stop => stop.id === toStopId);
            
            if (!fromStop || !toStop) {
                console.error('Could not find streets or bus stops:', {
                    fromStopId, 
                    toStopId,
                    fromStreetFound: !!fromStreet,
                    toStreetFound: !!toStreet,
                    fromStopFound: !!fromStop,
                    toStopFound: !!toStop,
                    availableStops: window.BUS_STOPS ? window.BUS_STOPS.map(s => s.id) : []
                });
                return;
            }
            
            console.log('Found bus stop data:', {
                from: { id: fromStop.id, name: fromStop.name, position: fromStop.position },
                to: { id: toStop.id, name: toStop.name, position: toStop.position }
            });
        } else {
            // We found the streets directly
            console.log('Found street data:', {
                from: { id: fromStreet.id, name: fromStreet.name },
                to: { id: toStreet.id, name: toStreet.name }
            });
            
            // Create bus stop-like objects from streets for compatibility
            fromStop = {
                id: fromStreet.id,
                name: fromStreet.name,
                kurdishName: fromStreet.kurdishName,
                position: [
                    (fromStreet.startPoint[0] + fromStreet.endPoint[0]) / 2,
                    (fromStreet.startPoint[1] + fromStreet.endPoint[1]) / 2
                ],
                isHub: fromStreet.isMainRoad || false,
                streetId: fromStreet.id
            };
            
            toStop = {
                id: toStreet.id,
                name: toStreet.name,
                kurdishName: toStreet.kurdishName,
                position: [
                    (toStreet.startPoint[0] + toStreet.endPoint[0]) / 2,
                    (toStreet.startPoint[1] + toStreet.endPoint[1]) / 2
                ],
                isHub: toStreet.isMainRoad || false,
                streetId: toStreet.id
            };
        }
        
        // Generate the direct route
        const route = generateDirectRoute(fromStop, toStop);
        
        if (!route) {
            console.error('Failed to generate route');
            return;
        }
        
        console.log('Generated route:', {
            fromStop: route.fromStop.name,
            toStop: route.toStop.name,
            distance: route.distance,
            travelTime: route.travelTime,
            line: route.line,
            lineColor: route.lineColor
        });
        
        // Set selected route
        selectedRoute = route;
        
        // Save this route to user-specific history using the UserRouteHistory utility
        if (window.UserRouteHistory) {
            window.UserRouteHistory.saveRoute(fromStop.id, toStop.id);
            console.log('Route saved to user-specific history');
        } else {
            console.warn('UserRouteHistory not available, route will not be saved per-user');
        }
        
        // Clear any existing routes
        clearRoutes();
        
        // Ensure we have coordinate arrays in the correct format for GeoJSON
        // Mapbox expects coordinates as [longitude, latitude]
        let fromCoords = Array.isArray(route.fromStop.position) ? 
            route.fromStop.position : [route.fromStop.longitude, route.fromStop.latitude];
            
        let toCoords = Array.isArray(route.toStop.position) ? 
            route.toStop.position : [route.toStop.longitude, route.toStop.latitude];
        
        // Make sure we have valid coordinates
        console.log('Route coordinates', {
            from: fromCoords,
            to: toCoords
        });
        
        // Verify coordinates are valid numbers
        if (!isValidCoordinate(fromCoords) || !isValidCoordinate(toCoords)) {
            console.error('Invalid coordinates detected:', { fromCoords, toCoords });
            return;
        }
        
        try {
            // Create the GeoJSON data for the route
            const routeData = {
                type: 'Feature',
                properties: {
                    line: route.line,
                    busId: route.busId
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [fromCoords, toCoords]
                }
            };
            
            // Check if source already exists
            if (map.getSource('direct-route')) {
                // Update existing source data
                console.log('Updating existing direct-route source');
                map.getSource('direct-route').setData(routeData);
            } else {
                // Add new source
                console.log('Adding new direct-route source');
                map.addSource('direct-route', {
                    type: 'geojson',
                    data: routeData
                });
            }
            
            // Check if layer already exists
            if (!map.getLayer('direct-route-layer')) {
                console.log('Adding direct-route-layer');
                // Add layer for the direct route
                map.addLayer({
                    id: 'direct-route-layer',
                    type: 'line',
                    source: 'direct-route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                        'visibility': 'visible'
                    },
                    paint: {
                        'line-color': route.lineColor || '#3498db',
                        'line-width': 5,
                        'line-opacity': 0.8
                    }
                });
            } else {
                // Make sure the layer is visible
                console.log('direct-route-layer already exists, ensuring visibility');
                map.setLayoutProperty('direct-route-layer', 'visibility', 'visible');
                // Update the line color if needed
                map.setPaintProperty('direct-route-layer', 'line-color', route.lineColor || '#3498db');
            }
            
            console.log('Route line displayed with color:', route.lineColor || '#3498db');
            
            // Set the flag to indicate a route is displayed
            directRouteDisplayed = true;
            
            // Removed highlighting of stops per user request
            // highlightStopOnMap(fromStopId);
            // highlightStopOnMap(toStopId);
            
            console.log('===== ROUTE DISPLAY PROCESS COMPLETE =====');
            
        } catch (err) {
            console.error('Error adding direct route to map:', err.message);
            console.error('Stack trace:', err.stack);
        }
        
        // Generate departure times
        const departureTimes = generateDepartureTimes(route);
        
        // Update route summary in the panel
        const routeSummary = document.getElementById('route-summary');
        if (routeSummary) {
            let timesHtml = '';
            
            // Get the current language
            const currentLang = localStorage.getItem('language') || 'en';
            const useKurdishName = currentLang === 'ckb';
            
            // Use kurdishName when in Kurdish mode if available
            const fromStationName = useKurdishName && route.fromStop.kurdishName ? route.fromStop.kurdishName : route.fromStop.name;
            const toStationName = useKurdishName && route.toStop.kurdishName ? route.toStop.kurdishName : route.toStop.name;
            
            routeSummary.innerHTML = `
                <!-- Route details header removed per user request -->

                
                <div class="route-stations">
                    <div class="station from-station">${fromStationName}</div>
                    <div class="route-line-visual"></div>
                    <div class="station to-station">${toStationName}</div>
                </div>
                

                
                <div class="route-detail-row">
                    <div class="route-detail-label" data-i18n="planner.distance">Distance:</div>
                    <div class="route-detail-value">${route.distance.toFixed(1)} km</div>
                </div>
                
                <div class="route-detail-row">
                    <div class="route-detail-label">Departs: ${fixedDepartureTime ? fixedDepartureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}</div>
                    <div class="route-detail-value"></div>
                </div>
                <div class="route-detail-row">
                    <div class="route-detail-label">Arrives: ${calculateEstimatedArrival(route.travelTime)}</div>
                    <div class="route-detail-value"></div>
                </div>
                
                <div class="route-detail-row">
                    <div class="route-detail-label" data-i18n="planner.fare">Fare:</div>
                    <div class="route-detail-value">${route.fare} IQD</div>
                </div>
            `;
            
            console.log('Updated route summary panel');
            
            // Manually apply translations to the newly created elements
            if (typeof window.updatePageTranslations === 'function') {
                window.updatePageTranslations();
                console.log('Manually updated translations for route summary');
            }
        }
        
        // Fit map to show the entire route with both stops visible
        try {
            const bounds = new mapboxgl.LngLatBounds()
                .extend(fromCoords)
                .extend(toCoords);
                
            map.fitBounds(bounds, {
                padding: 100,
                maxZoom: 15
            });
            
            console.log('Map fitted to route bounds');
        } catch (err) {
            console.error('Error fitting map to bounds:', err.message);
        }
    }
    
    // Generate direct route between two street/bus stops
    function generateDirectRoute(fromStop, toStop) {
        // Do not call global window.generateDirectRoute to prevent infinite recursion
        console.log('Using local implementation of generateDirectRoute');
        
        // If we were passed IDs instead of stop objects, find the stop objects
        if (typeof fromStop === 'number' || typeof fromStop === 'string') {
            const fromStopId = parseInt(fromStop);
            fromStop = window.BUS_STOPS.find(stop => stop.id === fromStopId);
            if (!fromStop) {
                console.error(`Cannot generate route: invalid from stop ID ${fromStopId}`);
                return null;
            }
        }
        
        if (typeof toStop === 'number' || typeof toStop === 'string') {
            const toStopId = parseInt(toStop);
            toStop = window.BUS_STOPS.find(stop => stop.id === toStopId);
            if (!toStop) {
                console.error(`Cannot generate route: invalid to stop ID ${toStopId}`);
                return null;
            }
        }
        
        if (!fromStop || !toStop) {
            console.error('Cannot generate route: invalid bus stops');
            return null;
        }
        
        // Extract stop IDs early so they're available throughout the function
        const fromStopId = fromStop.id;
        const toStopId = toStop.id;
        
        // Get a consistent bus line
        let busLine = null;
        
        // Try to use global getConsistentBusLineForRoute
        if (typeof window.getConsistentBusLineForRoute === 'function') {
            busLine = window.getConsistentBusLineForRoute(fromStopId, toStopId);
        } else {
            // Simple fallback
            const BUS_LINES = [
                { id: "A1", name: "", color: "#e74c3c" },  
                { id: "B2", name: "", color: "#3498db" },
                { id: "C3", name: "", color: "#2ecc71" },
                { id: "D4", name: "", color: "#f1c40f" },
                { id: "E5", name: "", color: "#9b59b6" }
            ];
            
            // Use the already defined fromStopId and toStopId instead of redefining them
            const hash = (fromStopId * 31 + toStopId) % BUS_LINES.length;
            busLine = BUS_LINES[Math.abs(hash)];
        }
        
        // Make sure we have valid coordinates for both stops
        let fromCoordinates = Array.isArray(fromStop.position) ? 
            fromStop.position : [fromStop.longitude, fromStop.latitude];
            
        let toCoordinates = Array.isArray(toStop.position) ? 
            toStop.position : [toStop.longitude, toStop.latitude];
        
        // Calculate distance and travel time
    // Get raw distance first
    let rawDistance = calculateDistance(
        fromCoordinates[0], fromCoordinates[1], 
        toCoordinates[0], toCoordinates[1]
    );
    
    // Round to 1 decimal place - EXACT same approach as in schedule.js
    // This is critical for consistent calculations between pages
    const distance = parseFloat(rawDistance.toFixed(1));
    
    // Now calculate travel time and fare using the rounded distance
    const travelTime = calculateTravelTime(distance);
    const fare = calculateDistanceBasedFare(distance);
        
        // Generate a consistent bus ID
        const busId = `${busLine.id}-${Math.min(fromStopId, toStopId)}${Math.max(fromStopId, toStopId)}`;
        
        return {
            fromStop: fromStop,
            toStop: toStop,
            distance: distance,
            travelTime: travelTime,
            fare: fare,
            line: busLine.id,
            lineName: '', 
            lineColor: busLine.color,
            busId: busId
        };
    }
    
    // Calculate distance-based fare using the standard tiered approach
    function calculateDistanceBasedFare(distance) {
        // Do not call global window.calculateDistanceBasedFare to prevent infinite recursion
        console.log('Using standard tiered implementation of calculateDistanceBasedFare for distance:', distance, 'km');
        
        if (distance <= 5) {
            return 500; // 0-5km costs 500 IQD
        } else if (distance <= 10) {
            return 1000; // 5-10km costs 1000 IQD
        } else if (distance <= 15) {
            return 1500; // 10-15km costs 1500 IQD
        } else {
            return 2000; // More than 15km costs 2000 IQD (capped)
        }
    }
    
    // Calculate distance between two points
    function calculateDistance(lon1, lat1, lon2, lat2) {
        // This is an internal implementation of the Haversine formula
        // Do NOT call window.calculateDistance here - it causes infinite recursion
        
        // Earth's radius in km
        const R = 6371;
        
        // Convert latitude and longitude from degrees to radians
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        
        // Haversine formula
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km
        
        return distance;
    }
    
    // Calculate travel time based on distance (estimated bus speed: 20km/h)
    // CRITICAL: Must exactly match schedule.js calculation
    function calculateTravelTime(distance) {
        const averageSpeed = 20; // km per hour
        const timeInHours = distance / averageSpeed;
        
        // IMPORTANT: Use EXACT same calculation as schedule.js (line 320)
        // Using Math.round instead of Math.ceil, and adding exactly 5 minutes
        const travelTime = Math.round(timeInHours * 60 + 5);
        
        return travelTime;
    }
    
    // Global variable to store the fixed departure time from URL parameters
    let fixedDepartureTime = null;
    
    // Calculate estimated arrival time based on travel time in minutes
    // EXACT same implementation as in schedule.js for perfect consistency
    function calculateEstimatedArrival(travelTimeMinutes) {
        // Use the fixed departure time from URL parameters if available
        // This ensures exact matching with the schedule page
        let departureTime;
        
        if (fixedDepartureTime) {
            // Use the stored fixed departure time from URL parameters
            departureTime = new Date(fixedDepartureTime);
        } else {
            // Fallback to current time if no fixed time is available
            const now = new Date();
            const minutes = now.getMinutes();
            const remainder = minutes % 15;
            
            departureTime = new Date(now);
            if (remainder !== 0) {
                // Round up to the next 15-minute interval
                departureTime.setMinutes(minutes + (15 - remainder));
                departureTime.setSeconds(0);
                departureTime.setMilliseconds(0);
            }
        }
        
        // Calculate arrival time exactly like in schedule.js
        const arrivalTime = new Date(departureTime.getTime() + (travelTimeMinutes * 60 * 1000));
        
        // Format time exactly like in schedule.js
        // Use the browser's built-in formatter with 24-hour time
        const formattedArrivalTime = arrivalTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false  // Force 24-hour time format
        });
        
        return formattedArrivalTime;
    }

    // Generate departure times for a route
    function generateDepartureTimes(route, baseTime = null) {
        // Do not call global window.generateDepartureTimes to prevent infinite recursion
        
        console.log('Using local implementation of generateDepartureTimes');
        
        // If no base time provided, use current time
        if (!baseTime) {
            const now = new Date();
            baseTime = now.getHours() * 60 + now.getMinutes();
        }
        
        // Round up to the next 15-minute interval
        const roundedUpMinutes = Math.ceil(baseTime / 15) * 15;
        
        // Generate 4 departure times at 15-minute intervals
        const departureTimes = [];
        for (let i = 0; i < 4; i++) {
            const departureMinutes = roundedUpMinutes + (i * 15);
            const hours = Math.floor(departureMinutes / 60) % 24;
            const minutes = departureMinutes % 60;
            
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            departureTimes.push({
                time: formattedTime,
                departureMinutes: departureMinutes,
                route: route
            });
        }
        
        return departureTimes;
    }
    
    // Helper to check if coordinates are valid
    function isValidCoordinate(coord) {
        return Array.isArray(coord) && 
               coord.length === 2 && 
               !isNaN(coord[0]) && 
               !isNaN(coord[1]) &&
               typeof coord[0] === 'number' &&
               typeof coord[1] === 'number' &&
               isFinite(coord[0]) && 
               isFinite(coord[1]);
    }

    // Clear all routes from the map
    function clearRoutes() {
        console.log('Clearing all routes');
        
        try {
            // Try to set layer to invisible first instead of removing
            if (map.getLayer('direct-route-layer')) {
                // Just hide the layer - this is more efficient than removing
                map.setLayoutProperty('direct-route-layer', 'visibility', 'none');
                console.log('Set direct-route-layer to invisible');
            }
            
            // Optional: Remove the layer and source if needed
            // We're keeping the source and layer but just hiding them
            // This prevents errors when adding them back later
            
            directRouteDisplayed = false;
        } catch (err) {
            console.error('Error clearing routes:', err.message);
        }
    }
    
    // Function to add street labels to the map (without drawing street lines)
    function addStreetLinesAndLabels() {
        if (!window.SULAYMANIYAH_STREETS || !Array.isArray(window.SULAYMANIYAH_STREETS)) {
            console.log('SULAYMANIYAH_STREETS not found or not an array');
            return;
        }
        
        console.log(`Adding ${SULAYMANIYAH_STREETS.length} street labels without street lines`);
        
        // We're not adding street lines as per user request
        // Only street labels and markers will be shown
        
        // Get the current language
        const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : (window.currentLanguage || 'en'));
        
        // Loop through each street to add labels
        window.SULAYMANIYAH_STREETS.forEach((street) => {
            // Add HTML marker for the street label
            const midLng = (street.startPoint[0] + street.endPoint[0]) / 2;
            const midLat = (street.startPoint[1] + street.endPoint[1]) / 2;
            const labelName = lang === 'ckb' ? street.kurdishName : street.name;
            
            // Create label element
            const labelEl = document.createElement('div');
            labelEl.className = 'map-label street-label';
            labelEl.textContent = labelName;
            labelEl.style.backgroundColor = 'white';
            labelEl.style.padding = '4px 8px';
            labelEl.style.borderRadius = '4px';
            labelEl.style.border = '1px solid #ccc';
            labelEl.style.fontWeight = 'bold';
            labelEl.style.fontSize = '14px';
            labelEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            labelEl.style.zIndex = '1000';
            labelEl.style.pointerEvents = 'none';
            
            // Adjust text direction based on language
            if (lang === 'ckb') {
                labelEl.style.direction = 'rtl';
                labelEl.style.textAlign = 'right';
            } else {
                labelEl.style.direction = 'ltr';
                labelEl.style.textAlign = 'left';
            }
            
            // Add it to the map container
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.appendChild(labelEl);
            }
            
            // Position the label
            function updateLabelPosition() {
                if (!map) return;
                const pos = new mapboxgl.LngLat(midLng, midLat);
                const point = map.project(pos);
                labelEl.style.left = `${point.x - (labelEl.offsetWidth / 2)}px`;
                labelEl.style.top = `${point.y - (labelEl.offsetHeight / 2)}px`;
                labelEl.style.position = 'absolute';
            }
            
            // Update position initially and on map move
            updateLabelPosition();
            map.on('move', updateLabelPosition);
        });
        
        console.log('Street lines and labels added successfully');
    }
    
    // Get a consistent bus line based on route ID
    function getConsistentBusLine(routeId) {
        // DO NOT call window.getConsistentBusLine here to avoid potential infinite recursion
        
        const BUS_LINES = ["A1", "B2", "C3", "D4", "E5"];
        
        // Simple hash function to get a consistent bus line
        let hash = 0;
        for (let i = 0; i < routeId.length; i++) {
            hash = (hash * 31 + routeId.charCodeAt(i)) % BUS_LINES.length;
        }
        
        return BUS_LINES[Math.abs(hash)];
    }
    
    // Highlight a bus stop on the map - DISABLED per user request
    function highlightStopOnMap(stopId) {
        // Function intentionally left empty to disable bus stop highlighting
        console.log(`Bus stop highlighting disabled: ${stopId}`);
        return;
    }






    // Make some functions available globally
    window.map = map;
    window.clearRoutes = clearRoutes;
    window.displayDirectRouteBetweenStops = displayDirectRouteBetweenStops;
    window.calculateDistance = calculateDistance;
    window.calculateTravelTime = calculateTravelTime;
    window.findNearestStopToPosition = findNearestStopToPosition;
    window.findNearestStopToStreet = findNearestStopToStreet;
    window.getConsistentBusLine = getConsistentBusLine;
    window.debugBusStops = () => console.log('Available bus stops:', window.BUS_STOPS);
    
    // Initialize the map
    initializeMap();
    
    // Setup back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
});