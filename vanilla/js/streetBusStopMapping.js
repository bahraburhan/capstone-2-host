// streetBusStopMapping.js - Maps streets to bus stops and handles direct routing
// This provides a direct 1:1 mapping between streets and bus stops

// This map stores the direct relationship between street IDs and bus stop IDs
// In this implementation, each street IS a bus stop (1:1 mapping)
const STREET_TO_BUS_STOP_MAP = {
    1: 1,  // Salim Street -> Bus Stop ID 1
    2: 2,  // Mawlawi Street -> Bus Stop ID 2
    3: 3,  // Bakhtiari Street -> Bus Stop ID 3
    4: 4,  // Malik Mahmud Ring Road -> Bus Stop ID 4
    5: 5,  // Ibrahim Pasha Street -> Bus Stop ID 5
    6: 6,  // Sarchinar Street -> Bus Stop ID 6
    7: 7,  // Rizgary Street -> Bus Stop ID 7
    8: 8,  // Raparin Street -> Bus Stop ID 8
    9: 9,  // Kawa Street -> Bus Stop ID 9
    10: 10, // Toyi Malik Street -> Bus Stop ID 10
    11: 11, // Azadi Street -> Bus Stop ID 11
    12: 12, // Kirkuk Road -> Bus Stop ID 12
    13: 13, // Ahmad Ismail Street -> Bus Stop ID 13
    14: 14, // Majid Bag Street -> Bus Stop ID 14
    15: 15,  // Garden City -> Bus Stop ID 15
    16:16   // Azmar Road -> Bus Stop ID 16
};

// Define bus lines (color-coded for UI)
const BUS_LINES = [
    { id: "A1", name: "Red Line", color: "#e74c3c" },
    { id: "B2", name: "Blue Line", color: "#3498db" },
    { id: "C3", name: "Green Line", color: "#2ecc71" },
    { id: "D4", name: "Yellow Line", color: "#f1c40f" },
    { id: "E5", name: "Purple Line", color: "#9b59b6" }
];

// Function to get the bus stop ID for a street (1:1 mapping)
function getBusStopIdForStreet(streetId) {
    // Convert to number if it's a string
    const id = typeof streetId === 'string' ? parseInt(streetId) : streetId;
    
    // Return the mapped bus stop ID or null if not found
    return STREET_TO_BUS_STOP_MAP[id] || null;
}

// Function to get the bus stop object for a street
function getBusStopForStreet(streetId) {
    const busStopId = getBusStopIdForStreet(streetId);
    
    // If no mapping found or no bus stops available, return null
    if (!busStopId || !window.BUS_STOPS) {
        console.log(`No bus stop mapping found for street ID ${streetId}`);
        return null;
    }
    
    // Find the bus stop with the matching ID
    const busStop = window.BUS_STOPS.find(stop => stop.id === busStopId);
    
    if (!busStop) {
        console.log(`Bus stop with ID ${busStopId} not found`);
        return null;
    }
    
    return busStop;
}

// Deterministic function to get a bus line for any two stops
// This ensures the same line is always returned for the same pair of stops
function getConsistentBusLineForRoute(fromStopId, toStopId) {
    // Create a unique route key that's the same regardless of direction
    const minId = Math.min(fromStopId, toStopId);
    const maxId = Math.max(fromStopId, toStopId);
    const routeKey = `${minId}-${maxId}`;
    
    // Use a hash function to consistently map the route key to a bus line
    let hash = 0;
    for (let i = 0; i < routeKey.length; i++) {
        hash = ((hash << 5) - hash) + routeKey.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure positive value
    hash = Math.abs(hash);
    
    // Map to one of our bus lines
    const lineIndex = hash % BUS_LINES.length;
    return BUS_LINES[lineIndex];
}

// Generate a direct route between any two bus stops
function generateDirectRoute(fromStopId, toStopId) {
    // Get the bus stops
    const fromStop = window.BUS_STOPS.find(stop => stop.id === fromStopId);
    const toStop = window.BUS_STOPS.find(stop => stop.id === toStopId);
    
    if (!fromStop || !toStop) {
        console.error('Cannot generate route: invalid bus stops');
        return null;
    }
    
    // Get the consistent bus line for this route
    const busLine = getConsistentBusLineForRoute(fromStopId, toStopId);
    
    // Calculate distance and travel time
    const distance = window.calculateDistance(fromStop.position, toStop.position);
    const travelTime = window.calculateTravelTime(distance);
    const fare = window.calculateDistanceBasedFare(distance);
    
    // Generate a consistent bus ID based on the line and stops
    const busId = `${busLine.id}-${Math.min(fromStopId, toStopId)}${Math.max(fromStopId, toStopId)}`;
    
    return {
        fromStop: fromStop,
        toStop: toStop,
        distance: distance,
        travelTime: travelTime,
        fare: fare,
        line: busLine.id,
        busId: busId,
        lineColor: busLine.color,
        lineName: busLine.name
    };
}

// Generate next available departure times for a route
function generateDepartureTimes(route, baseTime = null) {
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

// Make functions and data available globally
window.STREET_TO_BUS_STOP_MAP = STREET_TO_BUS_STOP_MAP;
window.BUS_LINES = BUS_LINES;
window.getBusStopIdForStreet = getBusStopIdForStreet;
window.getBusStopForStreet = getBusStopForStreet;
window.getConsistentBusLineForRoute = getConsistentBusLineForRoute;
window.generateDirectRoute = generateDirectRoute;
window.generateDepartureTimes = generateDepartureTimes;