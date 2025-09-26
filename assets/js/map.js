// Initialize the map centered on the US
const map = L.map('map').setView([39.8283, -98.5795], 4, {
    minZoom: 1,
    maxZoom: 18,
    dragging: false
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layer groups for different data types
const layerGroups = {
    all: L.layerGroup(),
    broadcast: L.layerGroup(),
    podcast: L.layerGroup(),
    technology: L.layerGroup(),
    voices: L.layerGroup()
};

// Add all locations layer to map by default
layerGroups.all.addTo(map);

// Colors for different layers
const layerColors = {
    broadcast: '#0089BD80',
    podcast: '#04773B80',
    technology: '#804E4980',
    voices: '#ECA72C80'
};

// Global variables for data management
let csvData = [];
let isDataLoaded = false;

// Disable scroll wheel and touch zoom initially, enable on click/touch
(function () {
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();

    var enableMapInteraction = function () {
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();
        map.dragging.enable(); // Also enable dragging on interaction
    }

    // Using vanilla JavaScript instead of jQuery
    document.getElementById('map').addEventListener('click', enableMapInteraction);
    document.getElementById('map').addEventListener('touchstart', enableMapInteraction);
})();

// Function to create custom markers
    function createMarker(layer, size = 'medium') {
    const color = layerColors[layer] || layerColors.broadcast;

    // Define size mappings with proper iconSize and anchor values
    const sizeMap = {
        'small': { width: 10, height: 10, iconSize: 10, anchor: 5 },
        'medium': { width: 20, height: 20, iconSize: 20, anchor: 10 },
        'large': { width: 30, height: 30, iconSize: 30, anchor: 15 },
        'xlarge': { width: 40, height: 40, iconSize: 40, anchor: 20 },
    };

    // Get size configuration, default to medium if size not recognized
    const sizeConfig = sizeMap[size] || sizeMap['medium'];

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${color};
            width: ${sizeConfig.width}px;
            height: ${sizeConfig.height}px;
            border-radius: 50%;
            border: 1px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        ">`,
        iconSize: [sizeConfig.iconSize, sizeConfig.iconSize],
        iconAnchor: [sizeConfig.anchor, sizeConfig.anchor]
    });
}

// Function to update status indicator
function updateStatus(status, message) {
    const indicator = document.getElementById('status-indicator');
    indicator.className = `status-indicator status-${status}`;
    indicator.textContent = message;
}

// Function to load data from map.csv
async function loadCSVData() {
    try {
        updateStatus('loading', 'Loading map.csv...');
        console.log('Loading data from map.csv...');

        // Fetch the CSV file
        const response = await fetch('/assets/js/map.csv');

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the CSV text
        const csvText = await response.text();

        // Parse CSV data
        csvData = parseCSV(csvText);
        isDataLoaded = true;

        console.log(`Successfully loaded ${csvData.length} records from map.csv`);
        updateStatus('success', `${csvData.length} locations`);

        // Process the data and add to map
        processCSVData();
        updateDataStats();

    } catch (error) {
        console.error('Error loading map.csv:', error);
        updateStatus('error', 'Failed to load data');
        showErrorMessage('Could not load map.csv. Make sure the file exists in the same folder and you are running from a local server.');
    }
}

// Simple CSV parser function
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines

        const values = parseCSVLine(lines[i]);
        const row = {};

        headers.forEach((header, index) => {
            let value = values[index] || '';

            // Try to convert numbers
            if (!isNaN(value) && value !== '' && value !== null) {
                value = parseFloat(value);
            }

            row[header] = value;
        });

        // Only add rows that have valid lat and lng coordinates
        if (row.lat && row.lng && !isNaN(row.lat) && !isNaN(row.lng)) {
            data.push(row);
        } else {
            console.warn(`Skipping row ${i + 1}: Missing or invalid lat/lng coordinates`);
        }
    }

    return data;
}

// Function to parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Function to process CSV data and add to map layers
function processCSVData() {
    if (!isDataLoaded || !csvData || csvData.length === 0) {
        return;
    }

    // Clear all existing layers
    Object.keys(layerGroups).forEach(key => {
        layerGroups[key].clearLayers();
    });

    csvData.forEach(item => {
        // Determine which layer this item belongs to
        let layerType = 'broadcast'; // default layer

        if (item.type) {
            switch(item.type.toLowerCase()) {
                case 'podcast':
                case 'Podcast':
                    layerType = 'podcast';
                    break;
                case 'technology':
                case 'Technology':
                    layerType = 'technology';
                    break;
                case 'voices':
                case 'Voices':
                    layerType = 'voices';
                    break;
                default:
                    layerType = 'broadcast';
            }
        }

        // Create marker (in processCSVData function, replace the existing marker creation)
        const markerSize = item.size || 'small'; // Get size from CSV, default to small
        const marker = L.marker([item.lat, item.lng], {
            icon: createMarker(layerType, markerSize)
        });

        // Create popup content
        const popupContent = createPopupContent(item);
        marker.bindPopup(popupContent);

        // Add to both 'all' layer and specific layer
        layerGroups.all.addLayer(marker);
        layerGroups[layerType].addLayer(marker);
    });

    console.log(`Processed ${csvData.length} locations from map.csv`);
}
// Function to create popup content
function createPopupContent(item) {
    let content = `<div class="popup-content">
        <div class="popup-title">${item.name || 'Unknown Location'}${item['Primary Market'] ? ' ' + item['Primary Market'] : ''}</div>`;

    // Add audio component if audio URL exists
    if (item.audio && item.audio.trim() !== '') {
        const audioPath = `audio/${item.audio}`;
        content += `
        <div class="show-audio" style="margin: 15px 0; padding: 10px; background: rgba(0,137,189,0.1); border-radius: 8px;">
            <audio controls style="width: 100%; margin-bottom: 10px;">
                <source src="${audioPath}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <button type="button" class="show-audio--button" onclick="toggleAudio(this)" style="
                background: #0089BD;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
            ">
                <span class="play-icon" aria-label="Play">▶️</span>
                <span class="show-audio--button--label">Featured Episode</span>
            </button>
        </div>`;
    }

    // Add all available fields to popup (except lat, lng, name, type, and audio)
    Object.keys(item).forEach(key => {
        if (key !== 'lat' && key !== 'lng' && key !== 'name' && key !== 'type' && key !== 'audio' && key !== 'Primary Market' && key !== 'size' && item[key] !== '' && item[key] !== null) {
            const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            content += `<div class="popup-detail"><strong>${displayKey}:</strong> ${item[key]}</div>`;
        }
    });

    content += '</div>';
    return content;
}

// Function to toggle audio playback
function toggleAudio(button) {
  const audioElement = button.parentElement.querySelector('audio');
  const playIcon = button.querySelector('.play-icon');

  if (audioElement.paused) {
      audioElement.play();
      playIcon.textContent = '⏸️';
  } else {
      audioElement.pause();
      playIcon.textContent = '▶️';
  }
}

// Function to update data statistics
function updateDataStats() {

  if (!isDataLoaded) return;
  // Check if the element exists before trying to update it
  const statsDiv = document.getElementById('data-stats');
  if (!statsDiv) {
      console.warn('data-stats element not found, skipping stats update');
      return;
  }

  const stats = {
      total: csvData.length,
      broadcast: csvData.filter(item => !item.type || item.type.toLowerCase() === 'Broadcast').length,
      podcast: csvData.filter(item => item.type && (item.type.toLowerCase() === 'Podcast' || item.type.toLowerCase() === 'podcast')).length,
      technology: csvData.filter(item => item.type && (item.type.toLowerCase() === 'Technology' || item.type.toLowerCase() === 'technology')).length,
      voices: csvData.filter(item => item.type && item.type.toLowerCase() === 'Voices').length
  };

  statsDiv.innerHTML = `
      <p><strong>Data Summary:</strong></p>
      <ul>
          <li>Total Locations: ${stats.total}</li>
          <li>Broadcast Reach: ${stats.broadcast}</li>
          <li>Podcasts: ${stats.podcast}</li>
          <li>Technology: ${stats.technology}</li>
          <li>Voices: ${stats.voices}</li>
      </ul>
  `;
}

// Function to show error messages
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
      <strong>Error:</strong> ${message}
      <button onclick="this.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          float: right;
          cursor: pointer;
          font-size: 18px;
          margin-top: -5px;
      ">×</button>
  `;
  document.querySelector('.container').insertBefore(errorDiv, document.getElementById('map'));
}

// Handle layer button clicks
document.querySelectorAll('.layer-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const layer = this.dataset.layer;

    // Toggle button active state
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    // Remove all layers from map
    Object.keys(layerGroups).forEach(key => {
        map.removeLayer(layerGroups[key]);
    });

    // Add selected layer to map
    if (layerGroups[layer]) {
        layerGroups[layer].addTo(map);
    }
  });
});

// Load CSV data when page loads
loadCSVData();

// Add map interaction features
map.on('click', function(e) {
  console.log('Map clicked at:', e.latlng);
});

// Add a scale control
L.control.scale().addTo(map);
