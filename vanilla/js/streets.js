// streets.js - Predefined streets in Sulaymaniyah for routing
// This file contains a list of major streets in Sulaymaniyah with their coordinates

// Define the streets with their coordinates (start and end points)
const SULAYMANIYAH_STREETS = [
    {
        id: 1,
        name: "Salim Street",
        kurdishName: "شەقامی سالم",
        startPoint: [45.4287, 35.5553],
        endPoint: [45.4412, 35.5619],
        description: "Main commercial street in the city center",
        isMainRoad: true
    },
    {
        id: 2,
        name: "Mawlawi Street",
        kurdishName: "شەقامی مەولەوی",
        startPoint: [45.4351, 35.5512],
        endPoint: [45.4421, 35.5582],
        description: "Historical street with traditional markets",
        isMainRoad: true
    },
    {
        id: 3,
        name: "Bakhtiari Street",
        kurdishName: "شەقامی بەختیاری",
        startPoint: [45.4476, 35.5591],
        endPoint: [45.4521, 35.5671],
        description: "Modern area with shopping centers",
        isMainRoad: true
    },
    {
        id: 4,
        name: "Malik Mahmud Ring Road",
        kurdishName: "ڕینگ ڕۆدی مەلیک مەحمود",
        startPoint: [45.4124, 35.5581],
        endPoint: [45.4321, 35.5487],
        description: "Main peripheral road",
        isMainRoad: true
    },
    {
        id: 5,
        name: "Ibrahim Pasha Street",
        kurdishName: "شەقامی ئیبراهیم پاشا",
        startPoint: [45.4351, 35.5691],
        endPoint: [45.4462, 35.5728],
        description: "Historical district with old architecture",
        isMainRoad: false
    },
    {
        id: 6,
        name: "Sarchinar Street",
        kurdishName: "شەقامی سەرچنار",
        startPoint: [45.4387, 35.5771],
        endPoint: [45.4498, 35.5812],
        description: "Green area with parks and resorts",
        isMainRoad: false
    },
    {
        id: 7,
        name: "Rizgary Street",
        kurdishName: "شەقامی ڕزگاری",
        startPoint: [45.4234, 35.5612],
        endPoint: [45.4298, 35.5698],
        description: "Modern residential district",
        isMainRoad: false
    },
    {
        id: 8,
        name: "Raparin Street",
        kurdishName: "شەقامی ڕاپەڕین",
        startPoint: [45.4187, 35.5542],
        endPoint: [45.4257, 35.5601],
        description: "Commercial and residential area",
        isMainRoad: true
    },
    {
        id: 9,
        name: "Kawa Street",
        kurdishName: "شەقامی کاوە",
        startPoint: [45.4412, 35.5519],
        endPoint: [45.4498, 35.5576],
        description: "Mixed commercial and residential district",
        isMainRoad: false
    },
    {
        id: 10,
        name: "Toyi Malik Street",
        kurdishName: "شەقامی تۆیی مەلیک",
        startPoint: [45.4365, 35.5434],
        endPoint: [45.4423, 35.5487],
        description: "Historical road with traditional markets",
        isMainRoad: false
    },
    {
        id: 11,
        name: "Azadi Street",
        kurdishName: "شەقامی ئازادی",
        startPoint: [45.4165, 35.5729],
        endPoint: [45.4267, 35.5798],
        description: "Major thoroughfare with government buildings",
        isMainRoad: true
    },
    {
        id: 12,
        name: "Kirkuk Road",
        kurdishName: "ڕێگای کەرکوک",
        startPoint: [45.4098, 35.5645],
        endPoint: [45.3987, 35.5721],
        description: "Major road connecting to Kirkuk",
        isMainRoad: true
    },
    {
        id: 13,
        name: "Ahmad Ismail Street",
        kurdishName: "شەقامی ئەحمەد ئیسماعیل",
        startPoint: [45.4398, 35.5823],
        endPoint: [45.4456, 35.5901],
        description: "University district with academic institutions",
        isMainRoad: false
    },
    {
        id: 14,
        name: "Majid Bag Street",
        kurdishName: "شەقامی مەجید بەگ",
        startPoint: [45.4532, 35.5547],
        endPoint: [45.4612, 35.5603],
        description: "Shopping district with modern malls",
        isMainRoad: false
    },
    {
        id: 15,
        name: "Garden City",
        kurdishName: "گاردن ستی",
        startPoint: [45.4321, 35.5876],
        endPoint: [45.4376, 35.5987],
        description: "Scenic road with mountain views",
        isMainRoad: false
    },
    {
        id: 16,
        name: "Azmar Road",
        kurdishName: "ڕێگای ازمەر",
        startPoint: [45.4400, 35.5900],
        endPoint: [45.5000, 35.6087],
        description: "Scenic road with mountain views",
        isMainRoad: false
    },
];

// Helper function to get a random point along a street
function getRandomPointOnStreet(street) {
    const t = Math.random(); // Random value between 0 and 1
    
    // Linear interpolation between start and end points
    const lng = street.startPoint[0] + t * (street.endPoint[0] - street.startPoint[0]);
    const lat = street.startPoint[1] + t * (street.endPoint[1] - street.startPoint[1]);
    
    return [lng, lat];
}

// Get street by ID
function getStreetById(id) {
    return SULAYMANIYAH_STREETS.find(street => street.id === id);
}

// Get a formatted street display name based on language
function getStreetDisplayName(street, language = 'en') {
    if (language === 'ckb') {
        return street.kurdishName;
    }
    return street.name;
}

// Export the streets for use in other files
window.SULAYMANIYAH_STREETS = SULAYMANIYAH_STREETS;
window.getRandomPointOnStreet = getRandomPointOnStreet;
window.getStreetById = getStreetById;
window.getStreetDisplayName = getStreetDisplayName;
