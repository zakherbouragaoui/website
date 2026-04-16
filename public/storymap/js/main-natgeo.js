/* =============================================================================
   MAIN — National Geographic Style Storymap
   Orchestrates map, scroll, and media components
   ============================================================================= */

import { initMap, updateMapForChapter, renderRoute, updateProgressBar } from './map-engine-natgeo.js';
import { initScrollEngine, initSubChapterScrolling, initGSAPScrollEffects } from './scroll-engine-natgeo.js';
import { loadMediaCatalog, initLazyLoading, initVideoPlayers } from './media-loader.js';

/* ─── Application State ───────────────────────────────────────────────────── */

const STATE = {
  map: null,
  currentChapter: null,
  route: null,
  waypoints: [],
  mediaData: null,
  routeLayer: null,
  waypointsLayer: null
};

/* ─── Initialization ──────────────────────────────────────────────────────── */

async function init() {
  console.log('🗺️  Initializing National Geographic Storymap...');

  // 1. Initialize map
  STATE.map = initMap('map');
  console.log('✓ Map initialized');

  // 2. Load and render route from GeoJSON
  try {
    const routeLayers = await renderRoute(STATE.map, 'data/route.geojson');
    if (routeLayers) {
      STATE.routeLayer = routeLayers.routeLayer;
      STATE.waypointsLayer = routeLayers.waypointsLayer;
      console.log('✓ Route and waypoints rendered');
    }
  } catch (error) {
    console.error('Failed to load route:', error);
  }

  // 3. Load media catalog (optional - for future dynamic content)
  STATE.mediaData = await loadMediaCatalog();
  if (STATE.mediaData) {
    console.log('✓ Media catalog loaded:', STATE.mediaData.project);
  }

  // 4. Initialize scroll engine
  const scroller = initScrollEngine({
    onChapterEnter: (chapterId) => {
      STATE.currentChapter = chapterId;
      updateMapForChapter(STATE.map, chapterId);
      console.log(`→ Chapter entered: ${chapterId}`);
    },
    onChapterProgress: (chapterId, progress) => {
      // Optional: use for additional effects
    }
  });

  console.log('✓ Scroll engine initialized');

  // 5. Initialize sub-chapter scrolling (for Chapter 3 and 5)
  const subScroller = initSubChapterScrolling({
    onSubChapterEnter: (subChapterId) => {
      updateMapForChapter(STATE.map, subChapterId);
      console.log(`  → Sub-chapter entered: ${subChapterId}`);
    }
  });

  console.log('✓ Sub-chapter scrolling initialized');

  // 6. Initialize GSAP scroll effects (if GSAP is loaded)
  initGSAPScrollEffects();
  console.log('✓ GSAP scroll effects initialized');

  // 7. Initialize lazy loading for images/videos
  initLazyLoading();
  console.log('✓ Lazy loading initialized');

  // 8. Initialize video player controls
  initVideoPlayers();
  console.log('✓ Video players initialized');

  // 9. Set up resize handler
  setupResizeHandler(scroller, subScroller);

  // 10. Hide loading indicator (if exists)
  hideLoadingIndicator();

  console.log('🎉 Storymap ready!');
}

/* ─── Helper Functions ─────────────────────────────────────────────────────── */

function setupResizeHandler(scroller, subScroller) {
  let resizeTimer;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      scroller.resize();
      subScroller.resize();
      console.log('↻ Scrollers resized');
    }, 250);
  });
}

function hideLoadingIndicator() {
  const loader = document.querySelector('.map-loading');
  if (loader) {
    loader.classList.add('hidden');
  }
}

/* ─── Route Animation Trigger ──────────────────────────────────────────────── */

// Trigger route animation when Chapter 3 (Transit Zone) is entered
function animateRoute() {
  if (STATE.routeLayer) {
    STATE.routeLayer.eachLayer(layer => {
      if (layer instanceof L.Polyline) {
        // Add animated class
        const path = layer.getElement();
        if (path) {
          path.classList.add('route-animated');
        }
      }
    });
  }
}

// Listen for Chapter 3 entry to trigger route animation
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.id === 'ch3-transit') {
        animateRoute();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const ch3 = document.getElementById('ch3-transit');
  if (ch3) {
    observer.observe(ch3);
  }
});

/* ─── Error Handling ───────────────────────────────────────────────────────── */

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

/* ─── Start Application ────────────────────────────────────────────────────── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ─── Export for debugging ─────────────────────────────────────────────────── */

window.STORYMAP_STATE = STATE;
