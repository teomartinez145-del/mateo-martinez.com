document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     IMAGE FALLBACKS
  ========================================================= */
  function applyImageFallback(img, message) {
    const div = document.createElement('div');
    div.className = 'image-fallback';
    div.textContent = message;
    img.replaceWith(div);
  }

  function watchImage(img, onError) {
    if (img.complete && img.naturalWidth === 0) {
      onError();
      return;
    }
    img.addEventListener('error', onError, { once: true });
  }

  const profilePhotoImg = document.querySelector('.profile-photo');
  if (profilePhotoImg) watchImage(profilePhotoImg, () => applyImageFallback(profilePhotoImg, 'Photo coming soon'));

  /* =========================================================
     Scroll reveal — cards fade/slide up in a cascade as each one
     enters the viewport. Groups of cards that sit side by side
     (header row, highlights, experience grid, footer grid) are
     staggered together; standalone cards (the section heading)
     reveal on their own. Pure IntersectionObserver + CSS
     transitions — no animation library needed.
  ========================================================= */
  const cards = Array.from(document.querySelectorAll('.reveal-card'));
  if (!cards.length) return;

  if (prefersReducedMotion) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  // Group cards by their immediate parent so siblings in the same row
  // (e.g. the 3 experience cards) stagger together instead of each
  // group re-triggering its own 0ms-delay reveal independently.
  const groups = new Map();
  cards.forEach((card) => {
    const parent = card.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(card);
  });

  groups.forEach((groupCards) => {
    groupCards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  cards.forEach((card) => observer.observe(card));
});