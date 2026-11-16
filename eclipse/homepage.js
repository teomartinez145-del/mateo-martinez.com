/* =========================================================
   Eclipse Entertainment – Homepage script (homepage.js)
   Movie data lives in movie-list.js
   Header behavior lives in menu.js
   ========================================================= */

/* ---------- SETTINGS ---------- */
const LAST_WEEK_DAYS = 7;          // in the last 7 days of a month, next month's days are added
const SEAT_PAGE = "seats.html";    // page where the user picks seats

/* ---------- STATE ---------- */
const state = {
  dates: [],
  selectedIndex: 0,
  formatIndex: {}   // movie.id -> selected format index
};

const cards = [];   // { movie, el }

/* ---------- ELEMENTS ---------- */
const searchInput = document.getElementById("searchInput");
const dateList = document.getElementById("dateList");
const datePrev = document.getElementById("datePrev");
const dateNext = document.getElementById("dateNext");
const showtimesTitle = document.getElementById("showtimesTitle");
const movieGrid = document.getElementById("movieGrid");
const noResults = document.getElementById("noResults");

/* ---------- DATE FORMATS ---------- */
const weekdayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const monthDayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const titleFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });
const monthNameFmt = new Intl.DateTimeFormat("en-US", { month: "long" });

function selectedDate() {
  return state.dates[state.selectedIndex];
}

/* ---------- DATE STRIP ----------
   From today to the end of this month.
   In the last week of the month, all of next month is added too. */
function buildDates() {
  const today = startOfDay(new Date());
  const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const inLastWeek = today.getDate() > lastDayThisMonth - LAST_WEEK_DAYS;

  // day 0 of a month = last day of the month before it
  const end = new Date(today.getFullYear(), today.getMonth() + (inLastWeek ? 2 : 1), 0);

  state.dates = [];
  const d = new Date(today);
  while (d <= end) {
    state.dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
}

function renderDates() {
  dateList.innerHTML = "";

  state.dates.forEach((date, i) => {
    // Small month label where a new month starts
    if (i > 0 && date.getDate() === 1) {
      const label = document.createElement("span");
      label.className = "date-month";
      label.textContent = monthNameFmt.format(date);
      dateList.appendChild(label);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "date-btn";
    btn.setAttribute("role", "tab");
    btn.innerHTML = `
      <span class="date-top">${i === 0 ? "Today" : monthDayFmt.format(date)}</span>
      <span class="date-day">${weekdayFmt.format(date)}</span>
    `;
    btn.addEventListener("click", () => selectDate(i));
    dateList.appendChild(btn);
  });

  updateActiveDate();
}

function updateActiveDate() {
  dateList.querySelectorAll(".date-btn").forEach((btn, i) => {
    const active = i === state.selectedIndex;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active);
  });
  showtimesTitle.textContent = `Movie show times for ${titleFmt.format(selectedDate())}`;
}

function selectDate(index) {
  state.selectedIndex = index;
  updateActiveDate();
  updateAllTimes();
}

function updateDateArrows() {
  const maxScroll = dateList.scrollWidth - dateList.clientWidth;
  datePrev.disabled = dateList.scrollLeft <= 1;
  dateNext.disabled = dateList.scrollLeft >= maxScroll - 1;
}

datePrev.addEventListener("click", () => {
  dateList.scrollBy({ left: -dateList.clientWidth * 0.7, behavior: "smooth" });
});

dateNext.addEventListener("click", () => {
  dateList.scrollBy({ left: dateList.clientWidth * 0.7, behavior: "smooth" });
});

dateList.addEventListener("scroll", updateDateArrows, { passive: true });
window.addEventListener("resize", updateDateArrows);

/* ---------- MOVIE CARDS ---------- */
function createCard(movie, order) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.style.animationDelay = `${order * 60}ms`;

  const detailsId = `details-${movie.id}`;
  const trailerHTML = movie.trailer
    ? `<a class="trailer-link" href="${esc(movie.trailer)}" target="_blank" rel="noopener">▶ Watch trailer</a>`
    : "";

  card.innerHTML = `
    <div class="poster">
      <img src="${esc(movie.poster)}" alt="${esc(movie.title)} poster" loading="lazy">
    </div>

    <div class="card-body">
      <p class="genre">${esc(movie.genre)}</p>
      <h3 class="movie-title">${esc(movie.title)}</h3>

      <div class="meta">
        <span class="rating">${esc(movie.rating)}</span>
        <span class="duration">${esc(movie.duration)}</span>
      </div>

      <div class="format-switch">
        <button type="button" class="format-arrow" data-dir="-1" aria-label="Previous format">&#10094;</button>
        <span class="format-name"></span>
        <button type="button" class="format-arrow" data-dir="1" aria-label="Next format">&#10095;</button>
      </div>

      <div class="times"></div>
    </div>

    <button type="button" class="details-toggle" aria-expanded="false" aria-controls="${detailsId}">
      <span>Synopsis and trailers</span>
      <span class="plus" aria-hidden="true"></span>
    </button>

    <div class="details" id="${detailsId}">
      <div class="details-inner">
        <div class="details-content">
          <p>${esc(movie.synopsis)}</p>
          ${trailerHTML}
        </div>
      </div>
    </div>
  `;

  // Format arrows
  card.querySelectorAll(".format-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const total = movie.formats.length;
      const current = state.formatIndex[movie.id] ?? 0;
      const dir = Number(btn.dataset.dir);
      state.formatIndex[movie.id] = (current + dir + total) % total;
      renderTimes(card, movie);
    });
  });

  // Synopsis toggle
  const toggle = card.querySelector(".details-toggle");
  const details = card.querySelector(".details");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    details.classList.toggle("open", !open);
  });

  renderTimes(card, movie);
  return card;
}

function renderTimes(card, movie) {
  const index = state.formatIndex[movie.id] ?? 0;
  const format = movie.formats[index];
  const day = selectedDate();
  const now = new Date();

  card.querySelector(".format-name").textContent = format.name;
  card.querySelectorAll(".format-arrow").forEach((btn) => {
    btn.disabled = movie.formats.length < 2;
  });

  const timesEl = card.querySelector(".times");
  timesEl.innerHTML = "";

  format.times.forEach((time) => {
    const label = formatTime(time);

    if (showtimeDate(day, time) < now) {
      // Showtime already passed
      const span = document.createElement("span");
      span.className = "time-pill is-past";
      span.textContent = label;
      span.title = "This showtime has passed";
      span.setAttribute("aria-disabled", "true");
      timesEl.appendChild(span);
    } else {
      // Link to the seat selection page
      const params = new URLSearchParams({
        movie: movie.id,
        date: toISODate(day),
        time: time,
        format: format.name
      });
      const link = document.createElement("a");
      link.className = "time-pill";
      link.href = `${SEAT_PAGE}?${params.toString()}`;
      link.textContent = label;
      link.setAttribute("aria-label", `${movie.title}, ${label}, ${format.name}`);
      timesEl.appendChild(link);
    }
  });
}

function renderMovies() {
  movieGrid.innerHTML = "";
  cards.length = 0;
  movies.forEach((movie, i) => {
    const el = createCard(movie, i);
    cards.push({ movie, el });
    movieGrid.appendChild(el);
  });
}

function updateAllTimes() {
  cards.forEach(({ movie, el }) => renderTimes(el, movie));
}

/* ---------- SEARCH (live filter) ---------- */
function applySearch(query) {
  const q = query.trim().toLowerCase();
  let visible = 0;

  cards.forEach(({ movie, el }) => {
    const match = !q
      || movie.title.toLowerCase().includes(q)
      || movie.genre.toLowerCase().includes(q);
    el.hidden = !match;
    if (match) visible++;
  });

  noResults.hidden = visible > 0;
}

searchInput.addEventListener("input", () => applySearch(searchInput.value));

/* ---------- INIT ---------- */
buildDates();
renderDates();
renderMovies();
updateDateArrows();

// Search coming from another page (index.html?search=...)
const initialSearch = new URLSearchParams(window.location.search).get("search");
if (initialSearch) {
  searchInput.value = initialSearch;
  applySearch(initialSearch);
}

// Refresh every minute so past showtimes turn grey automatically
setInterval(updateAllTimes, 60 * 1000);