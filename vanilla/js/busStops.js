// busStops.js - Bus stops based directly on streets
// This creates bus stops for each street in Sulaymaniyah

// Define the center coordinates for Sulaymaniyah
const SULAYMANIYAH_CENTER = [45.4351, 35.5658];

// Create bus stops directly from streets
function createBusStopsFromStreets() {
    // Make sure the streets are available
    if (!window.SULAYMANIYAH_STREETS || !Array.isArray(window.SULAYMANIYAH_STREETS)) {
        console.error('SULAYMANIYAH_STREETS not found or not an array');
        return [];
    }
    
    // Create one bus stop for each street
    const busStops = window.SULAYMANIYAH_STREETS.map(street => {
        // Calculate center point of the street for the bus stop position
        const position = [
            (street.startPoint[0] + street.endPoint[0]) / 2,
            (street.startPoint[1] + street.endPoint[1]) / 2
        ];
        
        // Create bus stop with same ID as street
        return {
            id: street.id,
            name: street.name,
            kurdishName: street.kurdishName,
            position: position,
            isHub: street.isMainRoad || false,
            streetId: street.id,
            connections: [] // Will be populated later
        };
    });
    
    // Create connections between all bus stops (fully connected graph)
    busStops.forEach(fromStop => {
        busStops.forEach(toStop => {
            // Don't connect stop to itself
            if (fromStop.id !== toStop.id) {
                // Calculate distance and travel time
                const distance = calculateDistance(fromStop.position, toStop.position);
                const travelTime = calculateTravelTime(distance);
                
                // Get the consistent bus line for this pair
                const busLine = getConsistentBusLineForRoute(fromStop.id, toStop.id);
                
                // Add connection
                fromStop.connections.push({
                    stopId: toStop.id,
                    distance: distance,
                    travelTime: travelTime,
                    line: busLine.id
                });
            }
        });
    });
    
    return busStops;
}

// Calculate distance between coordinates in kilometers
function calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const lat1 = pos1[1] * Math.PI / 180;
    const lat2 = pos2[1] * Math.PI / 180;
    const dLat = (pos2[1] - pos1[1]) * Math.PI / 180;
    const dLon = (pos2[0] - pos1[0]) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return parseFloat(distance.toFixed(1));
}

// Calculate travel time based on distance (estimated bus speed: 20km/h)
function calculateTravelTime(distance) {
    const averageSpeed = 20; // km per hour
    const travelTime = Math.ceil((distance / averageSpeed) * 60);
    
    // Add 1-3 minutes for stop time
    const stopTime = Math.floor(Math.random() * 3) + 1;
    
    return travelTime + stopTime;
}

// Helper function to get a consistent bus line for any pair of stops
function getConsistentBusLineForRoute(fromStopId, toStopId) {
    // REMOVED recursive call to prevent infinite recursion
    
    // Define our standard bus lines
    const busLines = [
        { id: "A1", name: "Red Line", color: "#e74c3c" },
        { id: "B2", name: "Blue Line", color: "#3498db" },
        { id: "C3", name: "Green Line", color: "#2ecc71" },
        { id: "D4", name: "Yellow Line", color: "#f1c40f" },
        { id: "E5", name: "Purple Line", color: "#9b59b6" }
    ];
    
    // Create a unique route key that's the same regardless of direction
    const minId = Math.min(fromStopId, toStopId);
    const maxId = Math.max(fromStopId, toStopId);
    const routeKey = `${minId}-${maxId}`;
    
    // Use a simple hash
    let hash = 0;
    for (let i = 0; i < routeKey.length; i++) {
        hash += routeKey.charCodeAt(i);
    }
    
    // Map to one of our bus lines
    const lineIndex = hash % busLines.length;
    return busLines[lineIndex];
}

// Create the bus stops
const BUS_STOPS = window.SULAYMANIYAH_STREETS 
    ? createBusStopsFromStreets() 
    : []; // Empty array as fallback

// Make available globally
window.BUS_STOPS = BUS_STOPS;
window.SULAYMANIYAH_CENTER = SULAYMANIYAH_CENTER;
window.calculateDistance = calculateDistance;
window.calculateTravelTime = calculateTravelTime;
window.getConsistentBusLineForRoute = getConsistentBusLineForRoute;

// Initialize bus stops if streets are loaded later
if (!window.SULAYMANIYAH_STREETS) {
    console.log('Streets not loaded yet, waiting...');
    // Check periodically if streets are loaded
    const checkInterval = setInterval(() => {
        if (window.SULAYMANIYAH_STREETS) {
            console.log('Streets loaded, creating bus stops');
            window.BUS_STOPS = createBusStopsFromStreets();
            clearInterval(checkInterval);
        }
    }, 200);
}