/* =============================================================================
   MEDIA LOADER — Helper functions for loading media catalog
   ============================================================================= */

export async function loadMediaCatalog() {
  try {
    const response = await fetch('data/media_catalog.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading media catalog:', error);
    return null;
  }
}

export function getMediaForLocation(location, mediaData) {
  if (!mediaData) return { photos: [], videos: [] };

  return {
    photos: mediaData.photos.filter(p => p.location === location),
    videos: mediaData.videos.filter(v => v.location === location)
  };
}

export function getFeaturedPhotos(mediaData) {
  if (!mediaData) return [];
  return mediaData.photos.filter(p => p.featured === true);
}

export function getPhotosByType(type, mediaData) {
  if (!mediaData) return [];
  return mediaData.photos.filter(p => p.type === type);
}

/* ─── Lazy Loading Images ─────────────────────────────────────────────────── */

export function initLazyLoading() {
  // Use Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Load image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }

        // Load video
        if (img.tagName === 'VIDEO' && img.dataset.src) {
          img.src = img.dataset.src;
          img.load();
          img.removeAttribute('data-src');
        }

        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // Observe all images and videos with loading="lazy"
  document.querySelectorAll('img[loading="lazy"], video[preload="none"]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* ─── Video Player Controls ───────────────────────────────────────────────── */

export function initVideoPlayers() {
  const videos = document.querySelectorAll('video');

  videos.forEach(video => {
    // Pause video when scrolled out of view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      });
    }, {
      threshold: 0.5
    });

    videoObserver.observe(video);

    // Add click-to-play functionality
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
}

/* ─── Media Gallery Generation ────────────────────────────────────────────── */

export function createMediaGallery(photos, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !photos || photos.length === 0) return;

  const galleryHTML = photos.map(photo => `
    <div class="gallery-item">
      <img src="Pictures/${photo.filename}"
           alt="${photo.enhanced_description || 'Gallery image'}"
           loading="lazy">
      ${photo.enhanced_description ?
        `<p class="gallery-caption">${truncateText(photo.enhanced_description, 100)}</p>` : ''}
    </div>
  `).join('');

  container.innerHTML = galleryHTML;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
