/* =============================================================================
   MAIN CONTROLLER — Desert Speaks Storymap
   Coordinates scroll engine, map updates, and media integration
   ============================================================================= */

// ─── Global State ─────────────────────────────────────────────────────────

const STATE = {
  map: null,
  markers: {},
  route: null,
  currentChapter: null,
  mediaData: null
};

// ─── Configuration ─────────────────────────────────────────────────────────

const CONFIG = {
  mapboxToken: 'pk.eyJ1IjoiZGVzZXJ0c3BlYWtzIiwiYSI6ImNscHdoMzR5cTBiZDkyanRjNXJ3YmM2OGcifQ.example', // Replace with actual token
  initialView: {
    center: [9.72, 33.48], // Qsar Ghilen approximate
    zoom: 9,
    pitch: 0,
    bearing: 0
  },
  chapters: [
    {
      id: 'prologue',
      center: [9.72, 33.48],
      zoom: 8,
      pitch: 0,
      bearing: 0,
      duration: 2000
    },
    {
      id: 'chapter-1',
      title: 'The Oasis',
      center: [9.72, 33.48],
      zoom: 12,
      pitch: 30,
      bearing: 0,
      duration: 2000
    },
    {
      id: 'chapter-2',
      title: 'Dawn Chorus',
      center: [9.72, 33.48],
      zoom: 13,
      pitch: 45,
      bearing: 90,
      duration: 2000
    },
    {
      id: 'chapter-3',
      title: 'The Algorithm',
      center: [9.72, 33.48],
      zoom: 11,
      pitch: 0,
      bearing: 0,
      duration: 2000
    },
    {
      id: 'chapter-4',
      title: 'Community Knowledge',
      center: [9.72, 33.48],
      zoom: 12,
      pitch: 20,
      bearing: -45,
      duration: 2000
    },
    {
      id: 'chapter-5',
      title: 'Conservation Futures',
      center: [9.72, 33.48],
      zoom: 10,
      pitch: 0,
      bearing: 0,
      duration: 2000
    },
    {
      id: 'epilogue',
      center: [9.72, 33.48],
      zoom: 8,
      pitch: 0,
      bearing: 0,
      duration: 2000
    }
  ]
};

// ─── Initialization ────────────────────────────────────────────────────────

async function init() {
  console.log('🏜️ Initializing Desert Speaks Storymap...');

  try {
    // Load media catalog
    await loadMediaCatalog();

    // Initialize map
    initMap();

    // Initialize scroll engine
    initScrollEngine();

    // Set up event listeners
    setupEventListeners();

    console.log('✅ Storymap initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
}

// ─── Media Catalog Loading ─────────────────────────────────────────────────

async function loadMediaCatalog() {
  try {
    const response = await fetch('data/media_catalog.json');
    STATE.mediaData = await response.json();
    console.log(`📸 Loaded ${STATE.mediaData.photos.length} photos and ${STATE.mediaData.videos.length} videos`);
  } catch (error) {
    console.error('Failed to load media catalog:', error);
  }
}

// ─── Map Initialization ────────────────────────────────────────────────────

function initMap() {
  // Using Leaflet instead of Mapbox for simplicity
  STATE.map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([CONFIG.initialView.center[1], CONFIG.initialView.center[0]], CONFIG.initialView.zoom);

  // Add tile layer - using Stadia Maps (no API key required for dev)
  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20
  }).addTo(STATE.map);

  // Add sample markers for key locations
  addLocationMarkers();

  console.log('🗺️ Map initialized');
}

function addLocationMarkers() {
  const locations = [
    { name: 'Qsar Ghilen', coords: [33.48, 9.72], type: 'primary' },
    { name: 'Old Matmata', coords: [33.5417, 9.9672], type: 'cultural' },
    { name: 'Bel Khir', coords: [34.2895, 9.3903], type: 'ecological' }
  ];

  locations.forEach(loc => {
    const marker = L.circleMarker([loc.coords[0], loc.coords[1]], {
      radius: 8,
      fillColor: loc.type === 'primary' ? '#4CAF6A' : '#D4874A',
      fillOpacity: 0.8,
      color: '#F0EBE3',
      weight: 2
    }).addTo(STATE.map);

    marker.bindPopup(`<strong>${loc.name}</strong>`);
    STATE.markers[loc.name] = marker;
  });
}

// ─── Scroll Engine ─────────────────────────────────────────────────────────

function initScrollEngine() {
  // Using Scrollama for scroll-driven interactions
  const scroller = scrollama();

  scroller
    .setup({
      step: '.chapter',
      offset: 0.5,
      debug: false
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  // Resize handler
  window.addEventListener('resize', scroller.resize);

  console.log('📜 Scroll engine initialized');
}

function handleStepEnter(response) {
  const chapterId = response.element.id;
  STATE.currentChapter = chapterId;

  console.log(`📍 Entered: ${chapterId}`);

  // Update map view based on chapter
  const chapterConfig = CONFIG.chapters.find(ch => ch.id === chapterId);
  if (chapterConfig && STATE.map) {
    STATE.map.flyTo(
      [chapterConfig.center[1], chapterConfig.center[0]],
      chapterConfig.zoom,
      {
        duration: chapterConfig.duration / 1000
      }
    );
  }

  // Highlight active marker if applicable
  updateMarkerStates(chapterId);

  // Add active class to chapter
  response.element.classList.add('is-active');
}

function handleStepExit(response) {
  response.element.classList.remove('is-active');
}

function updateMarkerStates(chapterId) {
  // Reset all markers
  Object.values(STATE.markers).forEach(marker => {
    marker.setStyle({ radius: 8 });
  });

  // Highlight relevant marker based on chapter
  if (chapterId.includes('chapter-1') && STATE.markers['Qsar Ghilen']) {
    STATE.markers['Qsar Ghilen'].setStyle({ radius: 12 });
  } else if (chapterId.includes('chapter-4') && STATE.markers['Old Matmata']) {
    STATE.markers['Old Matmata'].setStyle({ radius: 12 });
  }
}

// ─── Event Listeners ───────────────────────────────────────────────────────

function setupEventListeners() {
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (STATE.map) {
        STATE.map.invalidateSize();
      }
    }, 250);
  });

  // Handle media item clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.media-item')) {
      handleMediaClick(e.target.closest('.media-item'));
    }
  });
}

function handleMediaClick(mediaElement) {
  // Future: Open lightbox or expanded view
  console.log('Media clicked:', mediaElement.dataset.filename);
}

// ─── Utility Functions ─────────────────────────────────────────────────────

function getMediaByType(type) {
  if (!STATE.mediaData) return [];
  return STATE.mediaData.photos.filter(photo => photo.type === type);
}

function getFeaturedMedia() {
  if (!STATE.mediaData) return [];
  return STATE.mediaData.photos.filter(photo => photo.featured === true);
}

// ─── Start Application ─────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
