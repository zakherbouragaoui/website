/* =============================================================================
   ENHANCED MAP ENGINE — Desert Speaks
   Loads complete route from GeoJSON with all waypoints
   ============================================================================= */

// ─── Map Configuration ─────────────────────────────────────────────────────

const mapConfig = {
    initialView: [33.5, 9.8],
    initialZoom: 8,
    routeColor: '#D4874A',
    waypointColor: '#4CAF6A',
    activeWaypointColor: '#C9924A'
};

let map, routeLayer, waypointsLayer;
const waypointMarkers = {};

// ─── Initialize Map ────────────────────────────────────────────────────────

function initializeMap() {
    // Create map
    map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: true,
        minZoom: 6,
        maxZoom: 16
    }).setView(mapConfig.initialView, mapConfig.initialZoom);

    // Dark themed tile layer (Stadia Maps)
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 20
    }).addTo(map);

    // Load route GeoJSON
    loadRouteData();
}

// ─── Load Route GeoJSON ────────────────────────────────────────────────────

async function loadRouteData() {
    try {
        const response = await fetch('data/route.geojson');
        const geojson = await response.json();

        console.log('📍 Loaded route data:', geojson.features.length, 'features');

        // Separate routes and points
        const routes = geojson.features.filter(f => f.properties.type === 'route');
        const points = geojson.features.filter(f => f.properties.type === 'point');

        // Add routes to map
        routes.forEach(route => {
            addRoute(route);
        });

        // Add waypoints to map
        points.forEach(point => {
            addWaypoint(point);
        });

        // Fit map to show all features
        if (routeLayer) {
            map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
        }

        console.log('✅ Map loaded with', routes.length, 'routes and', points.length, 'waypoints');

    } catch (error) {
        console.error('Failed to load route data:', error);
    }
}

// ─── Add Route Line ────────────────────────────────────────────────────────

function addRoute(routeFeature) {
    const coords = routeFeature.geometry.coordinates.map(c => [c[1], c[0]]); // Swap to [lat, lng]

    const routeLine = L.polyline(coords, {
        color: mapConfig.routeColor,
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'route-path'
    }).addTo(map);

    // Add animated dash effect
    const animatedRoute = L.polyline(coords, {
        color: '#FFF',
        weight: 2,
        opacity: 0.4,
        dashArray: '10, 20',
        dashOffset: '0',
        className: 'route-animated'
    }).addTo(map);

    // Animate the dashes
    let dashOffset = 0;
    setInterval(() => {
        dashOffset -= 1;
        animatedRoute.setStyle({ dashOffset: dashOffset.toString() });
    }, 100);

    routeLayer = routeLine;
}

// ─── Add Waypoint Markers ──────────────────────────────────────────────────

function addWaypoint(pointFeature) {
    const coords = [pointFeature.geometry.coordinates[1], pointFeature.geometry.coordinates[0]]; // [lat, lng]
    const name = pointFeature.properties.name || 'Waypoint';

    // Skip unnamed waypoints or create custom icons
    if (name === 'Unnamed' || name === 'Untitled placemark') {
        // Add as small dot
        const marker = L.circleMarker(coords, {
            radius: 4,
            fillColor: '#888',
            fillOpacity: 0.6,
            color: '#FFF',
            weight: 1
        }).addTo(map);
        return;
    }

    // Create custom marker
    const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: mapConfig.waypointColor,
        fillOpacity: 0.9,
        color: '#FFF',
        weight: 2,
        className: 'waypoint-marker'
    }).addTo(map);

    // Add popup
    marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 8px;">
            <strong style="color: #4CAF6A; font-size: 1.1em;">${name}</strong><br>
            <span style="font-size: 0.85em; color: #999;">
                ${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E
            </span>
        </div>
    `);

    // Add hover effect
    marker.on('mouseover', function() {
        this.setStyle({
            radius: 12,
            fillColor: mapConfig.activeWaypointColor
        });
    });

    marker.on('mouseout', function() {
        this.setStyle({
            radius: 8,
            fillColor: mapConfig.waypointColor
        });
    });

    // Store reference
    waypointMarkers[name] = marker;
}

// ─── Chapter-Based Map Updates ─────────────────────────────────────────────

function updateMapForChapter(chapterName, coords, zoom = 12) {
    if (!map) return;

    map.flyTo(coords, zoom, {
        duration: 2,
        easeLinearity: 0.25
    });

    // Highlight relevant waypoint
    Object.values(waypointMarkers).forEach(marker => {
        marker.setStyle({ fillColor: mapConfig.waypointColor, radius: 8 });
    });

    // Find and highlight specific waypoint if it exists
    const waypointNames = {
        'oasis': 'Qsar Ghilen',
        'matmata': 'Old Matmata',
        'techine': 'Techine',
        'chott': 'Chott el Fejej'
    };

    const waypointName = waypointNames[chapterName];
    if (waypointName && waypointMarkers[waypointName]) {
        waypointMarkers[waypointName].setStyle({
            fillColor: mapConfig.activeWaypointColor,
            radius: 14
        });
        waypointMarkers[waypointName].openPopup();
    }
}

// ─── Public API ────────────────────────────────────────────────────────────

window.EnhancedMap = {
    init: initializeMap,
    updateForChapter: updateMapForChapter,
    getMap: () => map
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMap);
} else {
    initializeMap();
}
