/* =========================================================
   "← Back to portfolio" button, fixed in the top-left corner.
   Self-contained (adds its own markup + styles), so any project
   page gets it with one line. This file lives next to index.html:

     page in a subfolder:   <script src="../back-button.js"></script>
     page next to index:    <script src="back-button.js"></script>

   The link always points to index.html#projects next to this file.
========================================================= */
(function () {
  const script = document.currentScript;
  const home = new URL('index.html#projects', script ? script.src : window.location.href).href;
  const ACCENT = '#5DA9E9';

  const style = document.createElement('style');
  style.textContent = `
    .portfolio-back {
      position: fixed;
      top: 18px;
      left: clamp(14px, 4vw, 40px);
      z-index: 9000;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Archivo', -apple-system, 'Segoe UI', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1;
      text-decoration: none;
      color: #ffffff;
      background: rgba(20, 23, 28, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 10px 16px;
      border-radius: 999px;
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      transition: background 0.25s ease, transform 0.25s ease;
    }
    .portfolio-back:hover,
    .portfolio-back:focus-visible {
      background: ${ACCENT};
      color: #0d0d0d;
      transform: translateX(-3px);
      outline: none;
    }
    @media screen and (max-width: 767px) {
      .portfolio-back { top: 12px; font-size: 0.75rem; padding: 8px 13px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .portfolio-back { transition: none; }
    }
  `;
  document.head.appendChild(style);

  const add = () => {
    if (document.querySelector('.portfolio-back')) return;
    const link = document.createElement('a');
    link.className = 'portfolio-back';
    link.href = home;
    link.innerHTML = '&larr; Back to portfolio';
    document.body.appendChild(link);
  };
  if (document.body) add();
  else document.addEventListener('DOMContentLoaded', add);
})();