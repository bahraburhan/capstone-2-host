// Admin Analytics Functionality
let timeFilter = 30; // Default to 30 days

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the time filter dropdown
    const timeFilterSelect = document.getElementById('time-range');
    if (timeFilterSelect) {
        timeFilterSelect.addEventListener('change', function() {
            timeFilter = parseInt(this.value);
            loadAnalytics();
        });
    }
});

// Load analytics data
async function loadAnalytics() {
    try {
        // Get analytics data from Firestore
        const analyticsRef = firebase.firestore().collection('analytics').doc('summary');
        const analyticsDoc = await analyticsRef.get();
        
        if (!analyticsDoc.exists) {
            initializeDefaultAnalytics();
            return;
        }
        
        const analyticsData = analyticsDoc.data();
        
        // Update total users card with correct IDs
        updateStatsCard(
            'total-users', 
            analyticsData.totalUsers || 0,
            'users-change',
            analyticsData.userGrowth || 0
        );
        
        // Update total feedbacks card with correct IDs
        updateStatsCard(
            'total-feedbacks',
            analyticsData.totalFeedbacks || 0,
            'feedbacks-change',
            analyticsData.feedbackGrowth || 0
        );
        
        // Update average rating card with correct IDs
        updateStatsCard(
            'avg-rating',
            (analyticsData.avgRating || 0).toFixed(1),
            'rating-change',
            analyticsData.ratingGrowth || 0
        );
        
        // Update active users card with correct IDs
        updateStatsCard(
            'active-users',
            analyticsData.activeUsers || 0,
            'active-change',
            analyticsData.activeGrowth || 0
        );
        
        // Update charts
        updateUserGrowthChart(analyticsData.userGrowthData || getDefaultGrowthData());
        updateFeedbackChart(analyticsData.feedbackData || getDefaultFeedbackData());
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        displayAnalyticsError('Error loading analytics data: ' + error.message);
    }
}

// Update statistics card
function updateStatsCard(cardId, value, growthElementId, growth) {
    const valueElement = document.getElementById(cardId);
    const growthElement = document.getElementById(growthElementId);
    
    if (valueElement) {
        valueElement.textContent = value;
    }
    
    if (growthElement) {
        // Create a new growth icon if it doesn't exist
        let growthIcon = growthElement.querySelector('i');
        if (!growthIcon) {
            growthIcon = document.createElement('i');
            growthElement.appendChild(growthIcon);
        }
        
        // Clear the element content first
        growthElement.textContent = '';
        
        // Add the text node first
        growthElement.appendChild(document.createTextNode(`${Math.abs(growth)}% `));
        
        if (growth >= 0) {
            growthElement.classList.remove('negative');
            growthElement.classList.add('positive');
            growthIcon.className = 'fas fa-arrow-up';
        } else {
            growthElement.classList.remove('positive');
            growthElement.classList.add('negative');
            growthIcon.className = 'fas fa-arrow-down';
        }
        
        // Append the icon
        growthElement.appendChild(growthIcon);
    }
}

// Update user growth chart
function updateUserGrowthChart(data) {
    const chartContainer = document.getElementById('user-growth-chart');
    if (!chartContainer) return;
    
    // Clear previous chart content
    chartContainer.innerHTML = '';
    
    // Filter data based on time period
    const filteredData = filterDataByTime(data);
    
    // Display chart (in a real app, you would use a charting library)
    const chartContent = document.createElement('div');
    chartContent.className = 'chart-placeholder';
    
    // Create a simple chart representation
    const max = Math.max(...filteredData.map(d => d.value));
    
    let chartHTML = '<div class="simple-chart">';
    filteredData.forEach(item => {
        const height = (item.value / max) * 100;
        chartHTML += `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${height}%;" title="${item.label}: ${item.value}"></div>
                <div class="chart-label">${item.label}</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartContent.innerHTML = chartHTML;
    chartContainer.appendChild(chartContent);
}

// Update feedback chart
function updateFeedbackChart(data) {
    const chartContainer = document.getElementById('feedback-chart');
    if (!chartContainer) return;
    
    // Clear previous chart content
    chartContainer.innerHTML = '';
    
    // Filter data based on time period
    const filteredData = filterDataByTime(data);
    
    // Create chart (similar to user growth chart)
    const chartContent = document.createElement('div');
    chartContent.className = 'chart-placeholder';
    
    // Simple line representation
    const max = Math.max(...filteredData.map(d => d.value));
    
    let chartHTML = '<div class="simple-chart line-chart">';
    filteredData.forEach((item, index) => {
        const height = (item.value / max) * 100;
        chartHTML += `
            <div class="chart-point-container">
                <div class="chart-point" style="bottom: ${height}%;" title="${item.label}: ${item.value}"></div>
                <div class="chart-label">${item.label}</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartContent.innerHTML = chartHTML;
    chartContainer.appendChild(chartContent);
}

// Filter data based on time period
function filterDataByTime(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return getDefaultGrowthData();
    }
    
    // If data has more elements than we need, slice it
    if (data.length > timeFilter) {
        return data.slice(-timeFilter);
    }
    
    return data;
}

// Initialize default analytics data
function initializeDefaultAnalytics() {
    const analyticsData = {
        totalUsers: 48,
        userGrowth: 12,
        totalFeedbacks: 32,
        feedbackGrowth: 8,
        avgRating: 4.5,
        ratingGrowth: 5,
        activeUsers: 18,
        activeGrowth: 15,
        userGrowthData: getDefaultGrowthData(),
        feedbackData: getDefaultFeedbackData()
    };
    
    // Update UI with default data using the new function signature
    updateStatsCard('total-users', analyticsData.totalUsers, 'users-change', analyticsData.userGrowth);
    updateStatsCard('total-feedbacks', analyticsData.totalFeedbacks, 'feedbacks-change', analyticsData.feedbackGrowth);
    updateStatsCard('avg-rating', analyticsData.avgRating.toFixed(1), 'rating-change', analyticsData.ratingGrowth);
    updateStatsCard('active-users', analyticsData.activeUsers, 'active-change', analyticsData.activeGrowth);
    
    // Update charts
    updateUserGrowthChart(analyticsData.userGrowthData);
    updateFeedbackChart(analyticsData.feedbackData);
    
    // Store default data in Firestore for future use
    try {
        firebase.firestore().collection('analytics').doc('summary').set(analyticsData);
    } catch (error) {
        console.error('Error storing default analytics:', error);
    }
}

// Get default growth data
function getDefaultGrowthData() {
    const data = [];
    const days = timeFilter;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        data.push({
            label: `${month}/${day}`,
            value: Math.floor(Math.random() * 10) + 30 + (days - i)
        });
    }
    
    return data;
}

// Get default feedback data
function getDefaultFeedbackData() {
    const data = [];
    const days = timeFilter;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        data.push({
            label: `${month}/${day}`,
            value: (Math.random() * 2 + 3).toFixed(1) // Random value between 3.0 and 5.0
        });
    }
    
    return data;
}

// Display error in analytics section
function displayAnalyticsError(message) {
    const elements = [
        document.getElementById('user-growth-chart'),
        document.getElementById('feedback-chart')
    ];
    
    elements.forEach(el => {
        if (el) {
            el.innerHTML = `<p class="error-message">${message}</p>`;
        }
    });
    
    // Also update cards to show error
    updateStatsCard('total-users', 'Error', 0);
    updateStatsCard('avg-rating', 'Error', 0);
}

// Add CSS styles for the charts
function addChartStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .simple-chart {
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            height: 200px;
            padding: 10px;
        }
        
        .chart-bar-container, .chart-point-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
            flex: 1;
            position: relative;
        }
        
        .chart-bar {
            width: 80%;
            background-color: #4a6cf7;
            border-radius: 4px 4px 0 0;
            transition: height 0.5s;
        }
        
        .chart-point {
            width: 10px;
            height: 10px;
            background-color: #4a6cf7;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .chart-label {
            margin-top: 5px;
            font-size: 10px;
            text-align: center;
        }
        
        .line-chart .chart-point::before {
            content: "";
            position: absolute;
            width: 120%;
            height: 2px;
            background-color: #4a6cf7;
            left: 50%;
            z-index: -1;
        }
        
        .error-message {
            color: #e74c3c;
            text-align: center;
            padding: 20px;
        }
    `;
    
    document.head.appendChild(style);
}

// Call this when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add chart styles
    addChartStyles();
});

// Make loadAnalytics available globally
window.loadAnalytics = loadAnalytics;
