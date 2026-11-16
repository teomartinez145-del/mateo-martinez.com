document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- image fallback for files you haven't uploaded yet ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const onError = () => {
      const div = document.createElement('div');
      div.className = 'kickoff-imgfallback';
      div.textContent = img.dataset.slot || img.alt || 'Image coming soon';
      div.style.aspectRatio = getComputedStyle(img).aspectRatio || 'auto';
      img.replaceWith(div);
    };
    if (img.complete && img.naturalWidth === 0) onError();
    else img.addEventListener('error', onError, { once: true });
  });

  /* ---------- scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          entry.target.style.setProperty('--reveal-delay', delay);
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealTargets.forEach((el) => io.observe(el));

    // in case something is already in view on load (e.g. the hero)
    revealTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('is-visible');
    });
  }

  /* ---------- palette: save colors straight into a folder ----------
     A web page can't write into Figma itself, but it CAN write files into a
     folder on your computer (Chrome / Edge: you pick the folder once, then
     every click saves there directly). Files are SVG swatches, so you can
     drag them into Figma. Browsers without folder access (Safari, Firefox,
     phones) fall back to a normal download. */
  const toast = document.createElement('div');
  toast.className = 'kickoff-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800);
  };

  const swatches = Array.from(document.querySelectorAll('.kickoff-swatch'));
  const palette = swatches.map((sw) => ({
    el: sw,
    hex: sw.getAttribute('data-hex'),
    name: sw.getAttribute('data-name') || sw.getAttribute('data-hex')
  }));

  // readable label color for a given background
  const textOn = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6 ? '#1a1a1a' : '#ffffff';
  };
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const slug = (t) => t.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

  const swatchSvg = ({ hex, name }) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">` +
    `<rect id="${esc(name)}" width="800" height="800" fill="${hex}"/>` +
    `<text x="48" y="720" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="${textOn(hex)}">${esc(name)}</text>` +
    `<text x="48" y="764" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="${textOn(hex)}">${hex}</text></svg>`;

  const paletteSvg = (list) => {
    const w = 400, h = 520;
    const rects = list.map((c, i) =>
      `<g id="${esc(c.name)}"><rect x="${i * w}" width="${w}" height="${h}" fill="${c.hex}"/>` +
      `<text x="${i * w + 28}" y="${h - 56}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="${textOn(c.hex)}">${esc(c.name)}</text>` +
      `<text x="${i * w + 28}" y="${h - 22}" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${textOn(c.hex)}">${c.hex}</text></g>`
    ).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * list.length}" height="${h}" viewBox="0 0 ${w * list.length} ${h}">${rects}</svg>`;
  };

  const canPickFolder = typeof window.showDirectoryPicker === 'function' && window.isSecureContext;
  let dirHandle = null; // remembered for this visit, so the folder is only asked once

  const getFolder = async () => {
    if (dirHandle) return dirHandle;
    dirHandle = await window.showDirectoryPicker({ id: 'kickoff-palette', mode: 'readwrite', startIn: 'documents' });
    return dirHandle;
  };
  const writeToFolder = async (files) => {
    const dir = await getFolder();
    for (const f of files) {
      const fh = await dir.getFileHandle(f.name, { create: true });
      const w = await fh.createWritable();
      await w.write(f.content);
      await w.close();
    }
    return dir.name;
  };
  const downloadFiles = (files) => {
    files.forEach((f, i) => setTimeout(() => {
      const url = URL.createObjectURL(new Blob([f.content], { type: 'image/svg+xml' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, i * 250));
  };

  const saveFiles = async (files, label, swatchEl) => {
    try {
      let msg;
      if (canPickFolder) {
        try {
          const folder = await writeToFolder(files);
          msg = `${label} saved in folder “${folder}” — drag it into Figma`;
        } catch (err) {
          if (err && err.name === 'AbortError') { dirHandle = null; return; } // closed the picker
          dirHandle = null;
          throw err;
        }
      } else {
        downloadFiles(files);
        msg = `${label} downloaded — drag it into Figma`;
      }
      showToast(msg);
      if (swatchEl) {
        const lab = swatchEl.querySelector('.kickoff-swatch__copy');
        const restore = lab ? lab.textContent : '';
        swatchEl.classList.add('is-copied');
        if (lab) lab.textContent = 'Saved ✓';
        setTimeout(() => { swatchEl.classList.remove('is-copied'); if (lab) lab.textContent = restore; }, 1600);
      }
    } catch (e) {
      // folder access refused or failed: a normal download still works
      downloadFiles(files);
      showToast(`${label} downloaded — drag it into Figma`);
    }
  };

  /* ---------- send to Figma ----------
     Figma can't be written to from a web page (that needs your private
     account token). The closest thing that works for every visitor: copy the
     color as SVG, open Figma, and one paste (Ctrl/Cmd + V) drops it on the
     canvas as a shape with that exact fill. Set FIGMA_URL to your own file. */
  const FIGMA_URL = 'https://www.figma.com/files/';
  const flash = (el, text) => {
    const lab = el && el.querySelector('.kickoff-swatch__copy');
    if (!el) return;
    const restore = lab ? lab.textContent : '';
    el.classList.add('is-copied');
    if (lab) lab.textContent = text;
    setTimeout(() => { el.classList.remove('is-copied'); if (lab) lab.textContent = restore; }, 1800);
  };
  const sendToFigma = async (svg, label, el) => {
    window.open(FIGMA_URL, '_blank', 'noopener'); // open first so popup blockers allow it
    try {
      await navigator.clipboard.writeText(svg);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = svg; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* nothing else to try */ }
      ta.remove();
    }
    showToast(`${label} copied — paste it in Figma (Ctrl/Cmd + V)`);
    flash(el, 'Copied ✓');
  };

  // Phones / tablets have no hover, so the can animation would never show.
  // There the first tap opens the color (can appears) and a second tap sends it.
  const noHover = window.matchMedia('(hover: none)');
  const closeSwatches = (except) => palette.forEach((c) => {
    if (c.el === except || !c.el.classList.contains('is-open')) return;
    c.el.classList.remove('is-open');
    const lab = c.el.querySelector('.kickoff-swatch__copy');
    if (lab && lab.dataset.rest) lab.textContent = lab.dataset.rest;
  });
  palette.forEach((c) => {
    c.el.addEventListener('click', () => {
      if (noHover.matches && !c.el.classList.contains('is-open')) {
        closeSwatches(c.el);
        c.el.classList.add('is-open');
        const lab = c.el.querySelector('.kickoff-swatch__copy');
        if (lab) { lab.dataset.rest = lab.dataset.rest || lab.textContent; lab.textContent = 'Tap again: send to Figma'; }
        return;
      }
      const lab = c.el.querySelector('.kickoff-swatch__copy');
      if (lab && lab.dataset.rest) lab.textContent = lab.dataset.rest;
      sendToFigma(swatchSvg(c), c.name, c.el);
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.kickoff-swatch')) closeSwatches(); });
  const figmaAll = document.getElementById('kickoff-figma-all');
  if (figmaAll) figmaAll.addEventListener('click', () => sendToFigma(paletteSvg(palette), 'Full palette'));

  const saveAll = document.getElementById('kickoff-save-all');
  if (saveAll) {
    saveAll.addEventListener('click', () => {
      saveFiles([{ name: 'KickOff-color-palette.svg', content: paletteSvg(palette) }], 'Full palette');
    });
    if (!canPickFolder) saveAll.textContent = 'Download palette (SVG)';
  }

  /* ---------- brand story: word-by-word reveal on scroll ---------- */
  const storyText = document.getElementById('kickoff-story-text');
  if (storyText) {
    const words = storyText.textContent.trim().split(/\s+/);
    storyText.innerHTML = words.map((w) => `<span class="kw">${w}</span>`).join(' ');
    const wordEls = storyText.querySelectorAll('.kw');

    if (prefersReducedMotion) {
      wordEls.forEach((w) => w.classList.add('is-lit'));
    } else {
      const storyIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wordEls.forEach((w, i) => setTimeout(() => w.classList.add('is-lit'), i * 35));
            storyIo.disconnect();
          }
        });
      }, { threshold: 0.4 });
      storyIo.observe(storyText);
    }
  }

  /* ---------- logo cycle: auto-loops through the real flavor-color logo files, like a gif ---------- */
  const logoCycle = document.querySelector('.kickoff-logo-cycle');
  if (logoCycle) {
    const frames = Array.from(logoCycle.querySelectorAll('.kickoff-logo-frame'));
    let frameIndex = 0;

    const showFrame = (i) => {
      frames.forEach((f, idx) => f.classList.toggle('is-active', idx === i));
    };

    if (prefersReducedMotion) {
      showFrame(0);
    } else {
      setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        showFrame(frameIndex);
      }, 900);
    }
  }

  /* ---------- website: drag to compare wireframe vs final design ----------
     Pages whose images are not uploaded yet are removed (the first page stays
     as an empty slot), so it works with 1, 2, 3 or 4 pages. */
  const web = document.getElementById('kickoff-web');
  if (web) {
    const pillsEl = web.querySelector('.kickoff-web__pills');
    let pages = Array.from(web.querySelectorAll('.kickoff-compare'));
    let pills = Array.from(web.querySelectorAll('.kickoff-web__pill'));

    const setPos = (cmp, p) => {
      p = Math.max(0, Math.min(100, p));
      cmp.style.setProperty('--pos', `${p}%`);
      cmp.querySelector('.kickoff-compare__handle').setAttribute('aria-valuenow', Math.round(p));
      cmp.dataset.pos = p;
    };

    pages.forEach((cmp) => {
      const handle = cmp.querySelector('.kickoff-compare__handle');
      const fromEvent = (e) => {
        const r = cmp.getBoundingClientRect();
        setPos(cmp, ((e.clientX - r.left) / r.width) * 100);
      };
      let dragging = false;
      handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); e.preventDefault(); });
      handle.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
      ['pointerup', 'pointercancel'].forEach((ev) => handle.addEventListener(ev, () => { dragging = false; }));
      handle.addEventListener('keydown', (e) => {
        const cur = parseFloat(cmp.dataset.pos || '50');
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(cmp, cur - 5); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPos(cmp, cur + 5); }
        if (e.key === 'Home') { e.preventDefault(); setPos(cmp, 0); }
        if (e.key === 'End') { e.preventDefault(); setPos(cmp, 100); }
      });
      setPos(cmp, 50);
    });

    const showPage = (i) => {
      pages.forEach((cmp, idx) => {
        cmp.hidden = idx !== i;
        if (idx === i) { setPos(cmp, 50); cmp.querySelector('.kickoff-compare__scroll').scrollTop = 0; }
      });
      pills.forEach((pl, idx) => {
        pl.classList.toggle('is-active', idx === i);
        pl.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
    };
    const wirePills = () => pills.forEach((pl, i) => { pl.onclick = () => showPage(i); });
    wirePills();

    // after images had a chance to load: drop pages that have no design image
    const prune = () => {
      const missingFinal = (cmp) => !cmp.querySelector('.kickoff-compare__final');
      const missingWire = (cmp) => !cmp.querySelector('.kickoff-compare__top img');
      const keep = pages.filter((cmp, i) => i === 0 || !missingFinal(cmp));
      pages.forEach((cmp, i) => { if (!keep.includes(cmp)) { cmp.remove(); pills[i].remove(); } });
      pills = pills.filter((pl) => pl.isConnected);
      pages = keep;
      pages.forEach((cmp) => cmp.classList.toggle('is-single', missingFinal(cmp) || missingWire(cmp)));
      pillsEl.hidden = pages.length < 2;
      wirePills();
      if (!pages.some((cmp) => !cmp.hidden)) showPage(0);
    };
    window.addEventListener('load', () => setTimeout(prune, 400), { once: true });

    // small nudge the first time it comes into view, so people see it moves
    if (!prefersReducedMotion) {
      const nudgeIo = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        nudgeIo.disconnect();
        const cmp = pages.find((c) => !c.hidden);
        if (!cmp || cmp.classList.contains('is-single')) return;
        let t0 = 0;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1400);
          setPos(cmp, 50 + Math.sin(k * Math.PI * 2) * 14);
          if (k < 1) requestAnimationFrame(step); else setPos(cmp, 50);
        };
        setTimeout(() => requestAnimationFrame((t) => { t0 = t; step(t); }), 500);
      }, { threshold: 0.35 });
      nudgeIo.observe(web.querySelector('.kickoff-web__stage'));
    }
  }

  /* ---------- video: show a note if the file isn't uploaded yet ---------- */
  document.querySelectorAll('.kickoff-video__player').forEach((video) => {
    const wrap = video.parentElement;
    const toggle = wrap.querySelector('.kickoff-video__toggle');
    const showMissing = () => {
      video.hidden = true;
      if (toggle) toggle.hidden = true;
      const msg = wrap.querySelector('.kickoff-video__missing');
      if (msg) msg.hidden = false;
    };
    // click anywhere on the picture = play / pause (the bar below keeps its own controls)
    if (toggle) {
      toggle.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
      const sync = () => {
        wrap.classList.toggle('is-playing', !video.paused);
        toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      };
      ['play', 'pause', 'ended'].forEach((ev) => video.addEventListener(ev, sync));
    }
    const src = video.querySelector('source');
    if (src) src.addEventListener('error', showMissing, { once: true });
    video.addEventListener('error', showMissing, { once: true });
    // the source may already have failed before the listeners above existed
    const checkNow = () => { if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showMissing(); };
    checkNow();
    window.addEventListener('load', () => setTimeout(checkNow, 300), { once: true });
  });
});