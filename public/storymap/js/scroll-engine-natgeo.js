/* =============================================================================
   SCROLL ENGINE — National Geographic Style
   Uses Scrollama for chapter detection and triggers map updates
   ============================================================================= */

export function initScrollEngine(callbacks) {
  // Initialize Scrollama
  const scroller = scrollama();

  scroller
    .setup({
      step: '.chapter',
      offset: 0.5, // Trigger when chapter reaches middle of viewport
      debug: false,
      progress: true // Enable progress tracking
    })
    .onStepEnter((response) => {
      const chapterId = response.element.id;

      // Call chapter enter callback
      if (callbacks.onChapterEnter) {
        callbacks.onChapterEnter(chapterId);
      }

      // Add active class to current chapter
      response.element.classList.add('is-active');

      // Update progress bar
      updateProgressIndicator(response.index, getTotalChapters());
    })
    .onStepExit((response) => {
      // Remove active class
      response.element.classList.remove('is-active');
    })
    .onStepProgress((response) => {
      // Optional: use progress for parallax effects
      if (callbacks.onChapterProgress) {
        callbacks.onChapterProgress(response.element.id, response.progress);
      }
    });

  // Handle window resize
  window.addEventListener('resize', () => {
    scroller.resize();
  });

  return scroller;
}

/* ─── Helper Functions ────────────────────────────────────────────────────── */

function getTotalChapters() {
  return document.querySelectorAll('.chapter').length;
}

function updateProgressIndicator(currentIndex, totalChapters) {
  const percentage = ((currentIndex + 1) / totalChapters) * 100;
  const progressFill = document.getElementById('progress-fill');

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
}

/* ─── Sub-chapter Handling (for Chapter 3 and 5) ──────────────────────────── */

export function initSubChapterScrolling(callbacks) {
  const subChapterScroller = scrollama();

  subChapterScroller
    .setup({
      step: '.sub-chapter',
      offset: 0.6,
      debug: false
    })
    .onStepEnter((response) => {
      const subChapterId = response.element.id;

      if (callbacks.onSubChapterEnter) {
        callbacks.onSubChapterEnter(subChapterId);
      }

      response.element.classList.add('is-active');
    })
    .onStepExit((response) => {
      response.element.classList.remove('is-active');
    });

  window.addEventListener('resize', () => {
    subChapterScroller.resize();
  });

  return subChapterScroller;
}

/* ─── GSAP Integration (optional enhanced version) ────────────────────────── */

export function initGSAPScrollEffects() {
  // Only proceed if GSAP and ScrollTrigger are loaded
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded, skipping enhanced scroll effects');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Parallax effect on glassmorphic panels
  gsap.utils.toArray('.chapter-inner').forEach((panel, index) => {
    gsap.to(panel, {
      y: -50,
      opacity: 0.95,
      scrollTrigger: {
        trigger: panel,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        markers: false
      }
    });
  });

  // Fade in media on scroll
  gsap.utils.toArray('.chapter-media').forEach((media) => {
    gsap.from(media, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      scrollTrigger: {
        trigger: media,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Gallery items stagger animation
  gsap.utils.toArray('.media-gallery').forEach((gallery) => {
    const items = gallery.querySelectorAll('.gallery-item');

    gsap.from(items, {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      scrollTrigger: {
        trigger: gallery,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Data visualization reveal
  gsap.utils.toArray('.data-viz-section .viz-image').forEach((viz) => {
    gsap.from(viz, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      scrollTrigger: {
        trigger: viz,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}
