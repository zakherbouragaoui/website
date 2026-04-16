/* =============================================================================
   MAP ENGINE — National Geographic Style
   Handles map initialization, tile layers, route rendering, and chapter states
   ============================================================================= */

export function initMap(elementId) {
  const map = L.map(elementId, {
    center: [34.5, 9.8],
    zoom: 7,
    zoomControl: true,
    scrollWheelZoom: false,
    minZoom: 6,
    maxZoom: 16
  });

  // Add zoom control to bottom right
  map.zoomControl.setPosition('bottomright');

  // Stamen Terrain tiles via Stadia Maps
  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  return map;
}

/* ─── Chapter Map States ─────────────────────────────────────────────────── */

const CHAPTER_MAP_STATES = {
  'prologue': {
    center: [34.5, 9.8],
    zoom: 7,
    location: 'Overview',
    coords: ''
  },
  'ch1-belkhir': {
    center: [34.2895, 9.3903],
    zoom: 12,
    location: 'Bel Khir / Ardh El Talah',
    coords: '34°17\'22"N 9°23\'25"E'
  },
  'ch2-matmata': {
    center: [33.5417, 9.9731],
    zoom: 14,
    location: 'Old Matmata',
    coords: '33°32\'30"N 9°58\'23"E'
  },
  'ch3-transit': {
    center: [33.3, 9.9],
    zoom: 10,
    location: 'Transit Zone',
    coords: ''
  },
  'ch3a-kef-el-boum': {
    center: [33.3859, 10.0297],
    zoom: 13,
    location: 'Kef el Boum',
    coords: '33°23\'09"N 10°01\'47"E'
  },
  'ch3b-techine': {
    center: [33.4768, 10.0020],
    zoom: 13,
    location: 'Techine',
    coords: '33°28\'37"N 10°00\'07"E'
  },
  'ch3c-road-douz': {
    center: [33.0146, 9.7140],
    zoom: 12,
    location: 'Road to Douz',
    coords: '33°00\'53"N 9°42\'52"E'
  },
  'ch4-qsar-hotspot': {
    center: [32.99, 9.64],
    zoom: 13,
    location: 'Qsar Ghilen Hotspot',
    coords: '~32°59\'N 9°38\'E'
  },
  'ch4-qsar-grid': {
    center: [32.99, 9.64],
    zoom: 14,
    location: 'Qsar Ghilen Acoustic Grid',
    coords: '~32°59\'N 9°38\'E'
  },
  'ch4-qsar-dunes': {
    center: [32.99, 9.64],
    zoom: 14,
    location: 'Qsar Ghilen Dunes',
    coords: '~32°59\'N 9°38\'E'
  },
  'ch4-qsar-community': {
    center: [32.99, 9.64],
    zoom: 13,
    location: 'Qsar Ghilen Community',
    coords: '~32°59\'N 9°38\'E'
  },
  'ch4-qsar-archaeology': {
    center: [32.99, 9.64],
    zoom: 14,
    location: 'Qsar Ghilen Archaeological Site',
    coords: '~32°59\'N 9°38\'E'
  },
  'ch5-return': {
    center: [34.0, 9.5],
    zoom: 9,
    location: 'Return Journey',
    coords: ''
  },
  'ch5a-chott': {
    center: [33.9963, 9.1320],
    zoom: 11,
    location: 'Chott El Fejej',
    coords: '33°59\'46"N 9°07\'55"E'
  },
  'ch5b-conservation': {
    center: [33.5, 9.8],
    zoom: 10,
    location: 'Conservation Challenges',
    coords: ''
  },
  'epilogue': {
    center: [34.5, 9.8],
    zoom: 7,
    location: 'Overview',
    coords: ''
  }
};

export function updateMapForChapter(map, chapterId) {
  const state = CHAPTER_MAP_STATES[chapterId];

  if (state) {
    // Smooth fly animation to new location
    map.flyTo(state.center, state.zoom, {
      duration: 2,
      easeLinearity: 0.25
    });

    // Update map info overlay
    updateMapInfoOverlay(state.location, state.coords);
  }
}

function updateMapInfoOverlay(location, coords) {
  const locationEl = document.getElementById('current-location');
  const coordsEl = document.getElementById('current-coords');

  if (locationEl) {
    locationEl.textContent = location;
  }

  if (coordsEl) {
    coordsEl.textContent = coords;
    coordsEl.style.display = coords ? 'block' : 'none';
  }
}

/* ─── Route Rendering from GeoJSON ───────────────────────────────────────── */

export async function renderRoute(map, geojsonPath) {
  try {
    const response = await fetch(geojsonPath);
    const geojson = await response.json();

    const routeLayer = L.layerGroup().addTo(map);
    const waypointsLayer = L.layerGroup().addTo(map);

    // Filter features
    const routes = geojson.features.filter(f =>
      f.geometry.type === 'LineString' ||
      f.geometry.type === 'MultiLineString'
    );

    const points = geojson.features.filter(f =>
      f.geometry.type === 'Point' &&
      f.properties.name &&
      f.properties.name !== 'Unnamed'
    );

    // Draw route lines
    routes.forEach(route => {
      let coords;

      if (route.geometry.type === 'LineString') {
        coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      } else if (route.geometry.type === 'MultiLineString') {
        // Flatten multi-line strings
        coords = route.geometry.coordinates.flat().map(c => [c[1], c[0]]);
      }

      if (coords && coords.length > 0) {
        const polyline = L.polyline(coords, {
          color: '#D4874A', // --color-accent
          weight: 4,
          opacity: 0.9,
          className: 'route-line',
          smoothFactor: 1
        }).addTo(routeLayer);
      }
    });

    // Add waypoint markers
    points.forEach(point => {
      const coords = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
      const name = point.properties.name;

      // Determine marker type based on location name
      let markerClass = 'waypoint-marker';
      if (name.toLowerCase().includes('qsar') || name.toLowerCase().includes('ghilen')) {
        markerClass += ' primary';
      } else if (name.toLowerCase().includes('matmata')) {
        markerClass = 'cultural-marker';
      }

      // Create custom div icon
      const icon = L.divIcon({
        className: markerClass,
        iconSize: [12, 12]
      });

      const marker = L.marker(coords, { icon })
        .bindPopup(`<strong>${name}</strong>`)
        .addTo(waypointsLayer);
    });

    return { routeLayer, waypointsLayer };

  } catch (error) {
    console.error('Error loading route GeoJSON:', error);
    return null;
  }
}

/* ─── Add Special Markers ────────────────────────────────────────────────── */

export function addAudioMothMarkers(map, locations) {
  const markers = [];

  locations.forEach(loc => {
    const icon = L.divIcon({
      className: 'waypoint-marker primary',
      iconSize: [14, 14],
      html: '<div class="marker-pulse"></div>'
    });

    const marker = L.marker(loc.coords, { icon })
      .bindPopup(`<h3>${loc.name}</h3><p>AudioMoth Recording Station</p>`)
      .addTo(map);

    markers.push(marker);
  });

  return markers;
}

/* ─── Progress Bar Update ────────────────────────────────────────────────── */

export function updateProgressBar(percentage) {
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
}
