document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- image fallback for files you haven't uploaded yet ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const onError = () => {
      const div = document.createElement('div');
      div.className = 'gw-imgfallback';
      div.textContent = img.alt || 'Image coming soon';
      div.style.aspectRatio = getComputedStyle(img).aspectRatio || 'auto';
      img.replaceWith(div);
    };
    if (img.complete && img.naturalWidth === 0) onError();
    else img.addEventListener('error', onError, { once: true });
  });

  /* ---------- video fallback if the file isn't uploaded yet ---------- */
  document.querySelectorAll('.gw-video__player').forEach((video) => {
    const showMissing = () => {
      video.hidden = true;
      const msg = video.parentElement.querySelector('.gw-video__missing');
      if (msg) msg.hidden = false;
    };
    const src = video.querySelector('source');
    if (src) src.addEventListener('error', showMissing, { once: true });
    video.addEventListener('error', showMissing, { once: true });
    // the source may already have failed before the listeners above existed
    const checkNow = () => { if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showMissing(); };
    checkNow();
    window.addEventListener('load', () => setTimeout(checkNow, 300), { once: true });
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

  /* ---------- color palette: accordion + copy + Figma ----------
     A website can't write into someone's Figma file, so "Copy & open Figma"
     copies the value and opens Figma in a new tab, ready to paste into a
     fill. Set FIGMA_URL to your own Figma file/palette link if you have one. */
  const FIGMA_URL = 'https://www.figma.com/';

  const hexToRgb = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgbToHsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  };
  const rgbToCmyk = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return [0, 0, 0, 100];
    const c = (1 - r - k) / (1 - k), m = (1 - g - k) / (1 - k), y = (1 - b - k) / (1 - k);
    return [c, m, y, k].map((v) => Math.round(v * 100));
  };

  const toast = document.createElement('div');
  toast.className = 'gw-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };

  const copyText = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    legacyCopy(text);
    return Promise.resolve();
  };
  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* nothing else to try */ }
    ta.remove();
  }

  const colorBands = Array.from(document.querySelectorAll('.gw-color'));
  colorBands.forEach((band) => {
    const hex = band.dataset.hex;
    const rgb = hexToRgb(hex);
    const values = [
      ['HEX', hex.replace('#', '')],
      ['RGB', rgb.join(', ')],
      ['HSL', rgbToHsl(rgb).map((v, i) => (i ? v + '%' : v + '°')).join(', ')],
      ['CMYK', rgbToCmyk(rgb).join(', ')]
    ];
    const details = band.querySelector('.gw-color__details');
    values.forEach(([label, val]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gw-value';
      btn.setAttribute('aria-label', `Copy ${label} ${val}`);
      btn.innerHTML = `<small>${label}</small><span>${val}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyText(label === 'HEX' ? hex : val).then(() => showToast(`${label} copied`));
      });
      details.appendChild(btn);
    });

    const actions = document.createElement('div');
    actions.className = 'gw-color__actions';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'gw-action';
    copyBtn.textContent = 'Copy HEX';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyText(hex).then(() => showToast(`${hex} copied`));
    });
    const figmaBtn = document.createElement('button');
    figmaBtn.type = 'button';
    figmaBtn.className = 'gw-action';
    figmaBtn.textContent = 'Copy & open Figma';
    figmaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(FIGMA_URL, '_blank', 'noopener'); // open first so popup blockers allow it
      copyText(hex).then(() => showToast(`${hex} copied — paste it in Figma`));
    });
    actions.append(copyBtn, figmaBtn);
    details.appendChild(actions);

    const side = document.createElement('span');
    side.className = 'gw-color__side';
    side.setAttribute('aria-hidden', 'true');
    side.textContent = 'GreenWave';
    band.appendChild(side);
  });

  const activateBand = (band) => {
    colorBands.forEach((b) => {
      const on = b === band;
      b.classList.toggle('is-active', on);
      b.querySelectorAll('button').forEach((btn) => { btn.tabIndex = on ? 0 : -1; });
    });
  };
  colorBands.forEach((band) => {
    band.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activateBand(band); });
    band.addEventListener('click', () => activateBand(band));
    band.addEventListener('focus', () => activateBand(band));
    band.addEventListener('keydown', (e) => {
      if (e.target !== band) return;
      const i = colorBands.indexOf(band);
      if (e.key === 'ArrowDown' && colorBands[i + 1]) { e.preventDefault(); colorBands[i + 1].focus(); }
      if (e.key === 'ArrowUp' && colorBands[i - 1]) { e.preventDefault(); colorBands[i - 1].focus(); }
    });
  });
  if (colorBands.length) activateBand(colorBands[0]);

  /* ---------- stationery carousel ----------
     Auto-advances every data-interval ms, loops, moves left -> right.
     The progress bar on the active dot drives the timing (its CSS animation
     ends -> next slide), so hovering/focusing pauses everything for free.
     Slides whose image is missing are dropped, so it works with any number
     of uploaded images (with just one, it simply shows it). */
  const carousel = document.getElementById('gw-carousel');
  if (carousel) {
    const interval = parseInt(carousel.dataset.interval, 10) || 5000;
    carousel.style.setProperty('--gw-interval', `${interval}ms`);
    const dotsEl = carousel.querySelector('.gw-carousel__dots');
    let slides = Array.from(carousel.querySelectorAll('.gw-slide'));
    let dots = [];
    let idx = 0;

    const buildDots = () => {
      dotsEl.innerHTML = '';
      dots = slides.map((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'gw-dot';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
        return d;
      });
    };

    const paintDots = () => {
      dots.forEach((d, i) => {
        d.classList.remove('is-active', 'is-done');
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        if (i === idx) { void d.offsetWidth; d.classList.add('is-active'); } // restart the fill
        else if (i < idx) d.classList.add('is-done');
      });
    };

    function goTo(next) {
      if (slides.length < 2) return;
      next = (next + slides.length) % slides.length;
      if (next === idx) { paintDots(); return; }
      const leaving = slides[idx];
      leaving.classList.remove('is-active');
      leaving.classList.add('is-leaving');
      setTimeout(() => leaving.classList.remove('is-leaving'), 1000);
      slides[next].classList.add('is-active');
      idx = next;
      paintDots();
    }

    const setup = () => {
      slides = slides.filter((sl) => sl.isConnected);
      if (!slides.some((sl) => sl.classList.contains('is-active')) && slides[0]) slides[0].classList.add('is-active');
      idx = Math.max(0, slides.findIndex((sl) => sl.classList.contains('is-active')));
      buildDots();
      paintDots();
    };

    // the generic <img> fallback (top of file) swaps broken images for a
    // placeholder div; treat those slides as missing and remove them
    const pruneMissing = () => {
      let removed = false;
      slides.forEach((sl) => {
        if (sl.querySelector('.gw-imgfallback')) { sl.remove(); removed = true; }
      });
      if (removed) setup();
    };

    dotsEl.addEventListener('animationend', (e) => {
      if (e.animationName === 'gw-dot-fill' && !prefersReducedMotion) goTo(idx + 1);
    });
    // tab-key / mouse pause
    ['mouseenter', 'focusin'].forEach((ev) => carousel.addEventListener(ev, () => carousel.classList.add('is-paused')));
    ['mouseleave', 'focusout'].forEach((ev) => carousel.addEventListener(ev, () => carousel.classList.remove('is-paused')));

    // swipe
    let sx = null;
    carousel.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 60) goTo(idx + (dx > 0 ? -1 : 1));
    }, { passive: true });

    setup();
    window.addEventListener('load', () => setTimeout(pruneMissing, 400), { once: true });
    setTimeout(pruneMissing, 1500);
  }

  /* ---------- website design: page switcher ---------- */
  const webStage = document.getElementById('gw-web-stage');
  if (webStage) {
    const tabs = Array.from(document.querySelectorAll('.gw-web__tab'));
    const pages = Array.from(webStage.querySelectorAll('.gw-web__page'));
    const countEl = document.getElementById('gw-web-count');
    let current = 0;

    const show = (next, focusTab) => {
      next = (next + pages.length) % pages.length;
      if (next === current) return;
      webStage.dataset.dir = next < current ? 'back' : 'forward';
      const leaving = pages[current];
      leaving.classList.add('is-leaving');
      leaving.classList.remove('is-active');
      setTimeout(() => leaving.classList.remove('is-leaving'), 700);
      pages[next].classList.add('is-active');
      pages[next].querySelectorAll('.gw-web__frame').forEach((f) => { f.scrollTop = 0; });
      tabs.forEach((t, i) => {
        const on = i === next;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (focusTab) tabs[next].focus();
      current = next;
      if (countEl) countEl.textContent = `0${current + 1} / 0${pages.length}`;
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => show(i));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, true); }
      });
    });
    document.getElementById('gw-web-next').addEventListener('click', () => show(current + 1));
    document.getElementById('gw-web-prev').addEventListener('click', () => show(current - 1));

    // swipe on touch screens
    let startX = null;
    webStage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    webStage.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- brand story: word-by-word reveal on scroll ---------- */
  const storyText = document.getElementById('gw-story-text');
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

});