// busSchedule.js - Realistic bus scheduling system with defined routes
// This implements a more structured bus system with 15 bus stops and specific routes

// Define center coordinates for Sulaymaniyah
const SULAYMANIYAH_CENTER = [45.4351, 35.5658];

// Define the 15 bus stops with realistic names and relative coordinates
const BUS_STOPS = [
    { id: 1, name: "Main Terminal", position: [45.4351, 35.5658], isHub: true },
    { id: 2, name: "University", position: [45.4471, 35.5721] },
    { id: 3, name: "City Center", position: [45.4287, 35.5619], isHub: true },
    { id: 4, name: "Hospital", position: [45.4221, 35.5681] },
    { id: 5, name: "Market Square", position: [45.4318, 35.5593], isHub: true },
    { id: 6, name: "Sports Stadium", position: [45.4522, 35.5612] },
    { id: 7, name: "Residential Area", position: [45.4411, 35.5551] },
    { id: 8, name: "Industrial Zone", position: [45.4198, 35.5498] },
    { id: 9, name: "Park", position: [45.4376, 35.5732] },
    { id: 10, name: "Shopping Mall", position: [45.4281, 35.5677] },
    { id: 11, name: "School Complex", position: [45.4441, 35.5661] },
    { id: 12, name: "Cultural Center", position: [45.4312, 35.5711] },
    { id: 13, name: "Mosque", position: [45.4378, 35.5622] },
    { id: 14, name: "Tourist Area", position: [45.4491, 35.5571] },
    { id: 15, name: "Bus Depot", position: [45.4251, 35.5541], isHub: true }
];

// Define 4 bus routes, each with specific stops and schedules
const BUS_ROUTES = [
    {
        id: "A",
        name: "Red Line",
        color: "#e74c3c",
        stops: [1, 3, 5, 7, 11, 14, 6, 2, 1], // Circular route
        frequency: 30, // minutes per full cycle
        buses: ["RED-001", "RED-002", "RED-003"]
    },
    {
        id: "B",
        name: "Blue Line",
        color: "#3498db",
        stops: [1, 9, 12, 3, 10, 4, 15, 1], // Circular route
        frequency: 30, // minutes per full cycle
        buses: ["BLUE-001", "BLUE-002", "BLUE-003"]
    },
    {
        id: "C",
        name: "Green Line",
        color: "#2ecc71",
        stops: [15, 8, 5, 13, 3, 12, 15], // Circular route
        frequency: 30, // minutes per full cycle
        buses: ["GREEN-001", "GREEN-002", "GREEN-003"]
    },
    {
        id: "D",
        name: "Yellow Line",
        color: "#f1c40f",
        stops: [5, 10, 4, 3, 9, 2, 6, 14, 7, 5], // Circular route
        frequency: 30, // minutes per full cycle
        buses: ["YELLOW-001", "YELLOW-002", "YELLOW-003"]
    }
];

// Create the connections between stops based on the routes
function generateConnections() {
    // Initialize connections for each stop
    BUS_STOPS.forEach(stop => {
        stop.connections = [];
        stop.routes = [];
    });

    // Add connections based on routes
    BUS_ROUTES.forEach(route => {
        // Add route to each stop
        route.stops.forEach(stopId => {
            const stop = BUS_STOPS.find(s => s.id === stopId);
            if (stop && !stop.routes.includes(route.id)) {
                stop.routes.push(route.id);
            }
        });

        // Add connections between consecutive stops
        for (let i = 0; i < route.stops.length - 1; i++) {
            const fromStopId = route.stops[i];
            const toStopId = route.stops[i + 1];
            
            const fromStop = BUS_STOPS.find(s => s.id === fromStopId);
            const toStop = BUS_STOPS.find(s => s.id === toStopId);
            
            if (fromStop && toStop) {
                // Calculate distance and travel time
                const distance = calculateDistance(fromStop.position, toStop.position);
                const travelTime = calculateTravelTime(distance);
                
                // Check if connection already exists
                const existingConnection = fromStop.connections.find(c => c.stopId === toStopId);
                
                if (!existingConnection) {
                    // Create new connection with routes array instead of routeId
                    fromStop.connections.push({
                        stopId: toStopId,
                        routes: [route.id],  // Initialize as array immediately
                        distance: distance,
                        travelTime: travelTime
                    });
                } else {
                    // Check if routes property exists, if not create it
                    if (!existingConnection.routes) {
                        existingConnection.routes = [existingConnection.routeId || route.id];
                        delete existingConnection.routeId;
                    }
                    
                    // Now safely add the route if it's not already included
                    if (!existingConnection.routes.includes(route.id)) {
                        existingConnection.routes.push(route.id);
                    }
                }
            }
        }
    });
    
    // Fix connections to ensure proper object structure
    BUS_STOPS.forEach(stop => {
        stop.connections.forEach(conn => {
            if (!conn.routes) {
                conn.routes = [conn.routeId];
                delete conn.routeId;
            }
        });
    });
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

// Distance-based fare calculation function
function calculateDistanceBasedFare(distance) {
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

// Generate bus schedules based on routes and frequency
function generateSchedules() {
    const schedules = [];
    
    BUS_ROUTES.forEach(route => {
        const totalRouteTime = calculateRouteTime(route);
        const minutesPerStop = totalRouteTime / (route.stops.length - 1);
        
        route.buses.forEach((busId, busIndex) => {
            // Stagger the buses equally along the route
            const startOffsetMinutes = (busIndex * route.frequency) / route.buses.length;
            
            // Generate schedule for each stop
            route.stops.forEach((stopId, stopIndex) => {
                if (stopIndex < route.stops.length - 1) { // Skip the last stop as it's the same as first (circular)
                    const arrivalTime = (startOffsetMinutes + (stopIndex * minutesPerStop)) % route.frequency;
                    
                    schedules.push({
                        busId: busId,
                        routeId: route.id,
                        stopId: stopId,
                        arrivalMinute: Math.floor(arrivalTime)
                    });
                }
            });
        });
    });
    
    return schedules;
}

// Calculate total time for a route
function calculateRouteTime(route) {
    let totalTime = 0;
    
    for (let i = 0; i < route.stops.length - 1; i++) {
        const fromStopId = route.stops[i];
        const toStopId = route.stops[i + 1];
        
        const fromStop = BUS_STOPS.find(s => s.id === fromStopId);
        const toStop = BUS_STOPS.find(s => s.id === toStopId);
        
        if (fromStop && toStop) {
            const distance = calculateDistance(fromStop.position, toStop.position);
            totalTime += calculateTravelTime(distance);
        }
    }
    
    return totalTime;
}

// Find the shortest path between two stops
function findShortestPath(startStopId, endStopId) {
    // Initialize data structures
    const distances = {};
    const travelTimes = {};
    const previous = {};
    const unvisited = new Set();
    
    // Initialize with infinity for all stops except start
    BUS_STOPS.forEach(stop => {
        distances[stop.id] = stop.id === startStopId ? 0 : Infinity;
        travelTimes[stop.id] = stop.id === startStopId ? 0 : Infinity;
        previous[stop.id] = null;
        unvisited.add(stop.id);
    });
    
    while (unvisited.size > 0) {
        // Find the unvisited stop with the smallest distance
        let current = null;
        let minDistance = Infinity;
        
        for (const stopId of unvisited) {
            if (distances[stopId] < minDistance) {
                minDistance = distances[stopId];
                current = stopId;
            }
        }
        
        // If we've reached the end or there's no path
        if (current === endStopId || current === null || distances[current] === Infinity) {
            break;
        }
        
        // Remove current from unvisited
        unvisited.delete(current);
        
        // Find the current stop object
        const currentStop = BUS_STOPS.find(stop => stop.id === current);
        
        // Check each connection
        currentStop.connections.forEach(connection => {
            const neighbor = connection.stopId;
            const distance = distances[current] + connection.distance;
            const travelTime = travelTimes[current] + connection.travelTime;
            
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                travelTimes[neighbor] = travelTime;
                previous[neighbor] = {
                    stopId: current,
                    routes: connection.routes,
                    distance: connection.distance,
                    travelTime: connection.travelTime
                };
            }
        });
    }
    
    // If no path is found
    if (distances[endStopId] === Infinity) {
        return { path: [], totalDistance: 0, totalTravelTime: 0, totalFare: 0, transfers: 0 };
    }
    
    // Build the path
    const path = [];
    let current = endStopId;
    
    while (current !== null) {
        const stop = BUS_STOPS.find(s => s.id === current);
        
        if (previous[current]) {
            const prevStop = BUS_STOPS.find(s => s.id === previous[current].stopId);
            
            path.unshift({
                stopId: current,
                stop: stop,
                fromStop: prevStop,
                routes: previous[current].routes,
                distance: previous[current].distance,
                travelTime: previous[current].travelTime
            });
        } else {
            path.unshift({
                stopId: current,
                stop: stop,
                fromStop: null,
                routes: [],
                distance: 0,
                travelTime: 0
            });
        }
        
        current = previous[current]?.stopId || null;
    }
    
    // Calculate transfers
    let transfers = 0;
    let currentRoute = null;
    
    path.forEach(segment => {
        if (segment.routes && segment.routes.length > 0) {
            // If we don't have a current route, pick the first available
            if (currentRoute === null) {
                currentRoute = segment.routes[0];
            } 
            // If our current route isn't available for this segment, we need to transfer
            else if (!segment.routes.includes(currentRoute)) {
                transfers++;
                currentRoute = segment.routes[0];
            }
        }
    });
    
    // Calculate total fare using distance-based calculation
    const totalFare = calculateDistanceBasedFare(distances[endStopId]);
    
    return {
        path: path,
        totalDistance: distances[endStopId],
        totalTravelTime: travelTimes[endStopId],
        totalFare: totalFare,
        transfers: transfers
    };
}

// Get buses currently at or approaching a stop
function getCurrentBusesForStop(stopId, currentMinute = null) {
    // If no current minute is provided, use the current time
    if (currentMinute === null) {
        const now = new Date();
        currentMinute = now.getHours() * 60 + now.getMinutes();
    }
    
    // Get the schedules for this stop
    const stopSchedules = BUS_SCHEDULES.filter(schedule => schedule.stopId === stopId);
    const currentBuses = [];
    
    stopSchedules.forEach(schedule => {
        const route = BUS_ROUTES.find(r => r.id === schedule.routeId);
        
        // Calculate time to arrival based on current minute and schedule
        let timeToArrival = schedule.arrivalMinute - (currentMinute % route.frequency);
        if (timeToArrival < 0) {
            timeToArrival += route.frequency;
        }
        
        // Next stop in the route
        const stopIndex = route.stops.indexOf(stopId);
        const nextStopId = stopIndex < route.stops.length - 1 ? route.stops[stopIndex + 1] : null;
        const nextStop = nextStopId ? BUS_STOPS.find(s => s.id === nextStopId) : null;
        
        currentBuses.push({
            busId: schedule.busId,
            routeId: schedule.routeId,
            routeName: route.name,
            routeColor: route.color,
            timeToArrival: timeToArrival,
            nextStop: nextStop ? nextStop.name : "End of Line"
        });
    });
    
    // Sort by time to arrival
    return currentBuses.sort((a, b) => a.timeToArrival - b.timeToArrival);
}

// Initialize the connections
generateConnections();

// Generate the bus schedules
const BUS_SCHEDULES = generateSchedules();

// Make the functions and data available globally
window.BUS_STOPS = BUS_STOPS;
window.BUS_ROUTES = BUS_ROUTES;
window.BUS_SCHEDULES = BUS_SCHEDULES;
window.findShortestPath = findShortestPath;
window.getCurrentBusesForStop = getCurrentBusesForStop;
window.SULAYMANIYAH_CENTER = SULAYMANIYAH_CENTER;
window.calculateDistance = calculateDistance;
window.calculateTravelTime = calculateTravelTime;
window.calculateDistanceBasedFare = calculateDistanceBasedFare;