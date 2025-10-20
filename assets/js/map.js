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

// Heart marker
function createHeartMarker(layer, size = 'medium') {
    const sizeMap = {
        'small': 16,
        'medium': 20,
        'large': 24,
        'xlarge': 28
    };
    const heartSize = sizeMap[size] || 20;
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            position: relative;
            width: ${heartSize}px;
            height: ${heartSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
          <svg width="${heartSize}" height="${heartSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.414 14.414C21 12.828 22 11.5 22 9.50002C22 8.38722 21.6624 7.30061 21.0319 6.38369C20.4013 5.46677 19.5075 4.76268 18.4684 4.36442C17.4293 3.96616 16.2938 3.89247 15.212 4.15307C14.1301 4.41367 13.1528 4.9963 12.409 5.82402M19.414 14.414C19.2168 14.6113 18.9826 14.7678 18.7249 14.8745C18.4672 14.9813 18.191 15.0362 17.912 15.0362C17.633 15.0362 17.3568 14.9813 17.0991 14.8745C16.8414 14.7678 16.6072 14.6113 16.41 14.414C16.6235 14.6071 16.7956 14.8416 16.9157 15.1033C17.0358 15.3649 17.1015 15.6483 17.1087 15.9361C17.116 16.2239 17.0646 16.5102 16.9578 16.7776C16.851 17.0449 16.6909 17.2878 16.4873 17.4913C16.2837 17.6949 16.0409 17.855 15.7735 17.9618C15.5062 18.0686 15.2199 18.12 14.9321 18.1128C14.6443 18.1055 14.3609 18.0399 14.0993 17.9198C13.8376 17.7996 13.6031 17.6276 13.41 17.414C13.6074 17.6107 13.7641 17.8443 13.8712 18.1015C13.9782 18.3588 14.0335 18.6346 14.0339 18.9132C14.0342 19.1918 13.9797 19.4678 13.8733 19.7253C13.767 19.9828 13.6109 20.2169 13.414 20.414C13.224 20.6041 12.9976 20.7539 12.7484 20.8546C12.4991 20.9552 12.2322 21.0046 11.9635 20.9997C11.6947 20.9948 11.4297 20.9359 11.1843 20.8263C10.9389 20.7168 10.718 20.5588 10.535 20.362L5 15C3.5 13.5 2 11.8 2 9.50002C2.00022 8.38731 2.33794 7.30083 2.96856 6.38407C3.59917 5.4673 4.49303 4.76338 5.53208 4.36524C6.57112 3.96711 7.7065 3.8935 8.78826 4.15412C9.87002 4.41475 10.8473 4.99737 11.591 5.82502C11.7022 5.92836 11.8484 5.98571 12.0002 5.98552C12.152 5.98534 12.2981 5.92763 12.409 5.82402M19.414 14.414C19.7889 14.039 19.9996 13.5304 19.9996 13C19.9996 12.4697 19.7889 11.9611 19.414 11.586L17.533 9.70402C17.3092 9.48012 17.0435 9.30251 16.751 9.18133C16.4585 9.06015 16.1451 8.99778 15.8285 8.99778C15.5119 8.99778 15.1985 9.06015 14.906 9.18133C14.6135 9.30251 14.3478 9.48012 14.124 9.70402L12.414 11.414C12.0389 11.789 11.5303 11.9996 11 11.9996C10.4697 11.9996 9.96106 11.789 9.586 11.414C9.21106 11.039 9.00043 10.5304 9.00043 10C9.00043 9.46969 9.21106 8.96108 9.586 8.58602L12.409 5.82402" stroke="#FEC400" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>`,
        iconSize: [heartSize, heartSize],
        iconAnchor: [heartSize/2, heartSize/2]
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
            icon: layerType === 'voices' ? createHeartMarker(layerType, markerSize) : createMarker(layerType, markerSize)
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
