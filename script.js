document.addEventListener("DOMContentLoaded", () => {

/* ================= BASIS ================= */

let date = new Date();
let data = JSON.parse(localStorage.getItem("shifts")) || {};
let cyclePattern = JSON.parse(localStorage.getItem("cyclePattern")) || [];
let selectedShift = "frueh";
let editMode = false;


/* ================= ELEMENTE ================= */

const calendar   = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const todayText  = document.getElementById("todayText");
const todayBtn = document.getElementById("todayBtn");


const prevMonth  = document.getElementById("prevMonth");
const nextMonth  = document.getElementById("nextMonth");

const menu       = document.getElementById("menu");
const menuBtn    = document.getElementById("menuBtn");
const closeMenu  = document.getElementById("closeMenu");

const openCycle  = document.getElementById("openCycle");
const cycleView  = document.getElementById("cycleView");
const closeCycle = document.getElementById("closeCycle");

const cycleType  = document.getElementById("cycleType");
const cycleDays  = document.getElementById("cycleDays");
const cycleStart = document.getElementById("cycleStart");
const addCycle   = document.getElementById("addCycle");
const applyCycle = document.getElementById("applyCycle");
const clearCycle = document.getElementById("clearCycle");
const cycleList  = document.getElementById("cycleList");

const openYear   = document.getElementById("openYear");
const yearView   = document.getElementById("yearView");
const closeYear  = document.getElementById("closeYear");
const yearGrid   = document.getElementById("yearGrid");
const yearSelect = document.getElementById("yearSelect");

/* ===== Sicherheit: nichts sichtbar beim Start ===== */
menu.classList.add("hidden");
cycleView.classList.add("hidden");
yearView.classList.add("hidden");

/* ================= HELFER ================= */

function key(y, m, d) {
  return `${y}-${m}-${d}`;
}

/* ================= MONATSKALENDER ================= */

function render() {
  calendar.innerHTML = "";

  const y = date.getFullYear();
  const m = date.getMonth();

  monthTitle.textContent =
    date.toLocaleString("de-DE", { month: "long", year: "numeric" });

  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const days  = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < first; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= days; d++) {
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = d;

    const k = key(y, m, d);
    if (data[k]) div.classList.add(data[k]);

   div.onclick = () => {
  if (!editMode) return;   // ⛔ außerhalb Zyklus-Modus gesperrt

  data[k] = selectedShift;
  localStorage.setItem("shifts", JSON.stringify(data));
  render();
};


    if (
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear()
    ) {
      div.classList.add("today");

      todayText.textContent =
        "Heute: " + today.toLocaleDateString("de-DE");
    }

    calendar.appendChild(div);
  }
}

/* ================= NAVIGATION ================= */

prevMonth.onclick = () => {
  date.setMonth(date.getMonth() - 1);
  render();
};

nextMonth.onclick = () => {
  date.setMonth(date.getMonth() + 1);
  render();
};
todayBtn.onclick = () => {
  date = new Date();   // springt auf echtes heutiges Datum
  render();
};


/* ================= SCHICHT AUSWAHL ================= */

document.querySelectorAll(".shift-picker button").forEach(btn => {
  btn.onclick = () => {
    selectedShift = btn.dataset.shift;
  };
});

/* ================= MENÜ ================= */

menuBtn.onclick   = () => menu.classList.remove("hidden");
closeMenu.onclick = () => menu.classList.add("hidden");

/* ================= ZYKLUS ================= */

openCycle.onclick = () => {
  menu.classList.add("hidden");
  cycleView.classList.remove("hidden");
  editMode = true;  
};


closeCycle.onclick = () => {
  cycleView.classList.add("hidden");
};

addCycle.onclick = () => {
  const t = cycleType.value;
  const d = Number(cycleDays.value);
  if (!d) return;

  cyclePattern.push({ type: t, days: d });
  localStorage.setItem("cyclePattern", JSON.stringify(cyclePattern));
  cycleDays.value = "";
  drawCycle();
};

function drawCycle() {
  cycleList.innerHTML = "";
  cyclePattern.forEach((c, i) => {
    const div = document.createElement("div");
    div.textContent = `${c.days} Tage ${c.type}`;
    div.className = c.type;
    div.onclick = () => {
      cyclePattern.splice(i, 1);
      localStorage.setItem("cyclePattern", JSON.stringify(cyclePattern));
      drawCycle();
    };
    cycleList.appendChild(div);
  });
}

applyCycle.onclick = () => {
  const start = cycleStart.value;
  if (!start || !cyclePattern.length) return;

  const total = cyclePattern.reduce((a, b) => a + b.days, 0);

  for (let i = 0; i < 365 * 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);

    let mod = i % total;
    let sum = 0;

    for (const c of cyclePattern) {
      sum += c.days;
      if (mod < sum) {
        data[key(d.getFullYear(), d.getMonth(), d.getDate())] = c.type;
        break;
      }
    }
  }

  localStorage.setItem("shifts", JSON.stringify(data));
  cycleView.classList.add("hidden");
  render();
};

clearCycle.onclick = () => {
  cyclePattern = [];
  localStorage.removeItem("cyclePattern");
  drawCycle();
};

/* ================= JAHRESKALENDER ================= */

openYear.onclick = () => {
  menu.classList.add("hidden");
  yearView.classList.remove("hidden");

  yearSelect.innerHTML = "";
  for (let y = 2026; y <= 2040; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  yearSelect.value = date.getFullYear();
  drawYear(Number(yearSelect.value));
};

closeYear.onclick = () => {
  yearView.classList.add("hidden");
};

yearSelect.onchange = () => {
  drawYear(Number(yearSelect.value));
};

function drawYear(year) {
  yearGrid.innerHTML = "";

  const months = [
    "Jan","Feb","Mär","Apr","Mai","Jun",
    "Jul","Aug","Sep","Okt","Nov","Dez"
  ];

  for (let m = 0; m < 12; m++) {
    const box = document.createElement("div");
    box.className = "year-month";

    const h = document.createElement("h3");
    h.textContent = months[m];
    box.appendChild(h);

    const grid = document.createElement("div");
    grid.className = "year-days";

    const days = new Date(year, m + 1, 0).getDate();

    for (let d = 1; d <= days; d++) {
      const day = document.createElement("div");
      day.className = "year-day";

      const k = key(year, m, d);
      if (data[k]) day.classList.add(data[k]);

      grid.appendChild(day);
    }

    box.onclick = () => {
      date = new Date(year, m, 1);
      yearView.classList.add("hidden");
      render();
    };

    box.appendChild(grid);
    yearGrid.appendChild(box);
  }
}

/* ================= START ================= */

drawCycle();
render();

});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
