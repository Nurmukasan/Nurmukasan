import './style.css';
import { checkAvailability, RULES } from './availability';
import { BLOCKS, BOOKINGS, ROOM } from './data';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <main class="card">
    <header>
      <p class="eyebrow">Smart Campus</p>
      <h1>Room Availability Checker</h1>
      <p class="room">${ROOM.name} · ${ROOM.building} · ${ROOM.capacity} seats</p>
    </header>
    <form id="check-form" novalidate>
      <label>Date <input type="date" id="date" required /></label>
      <div class="row">
        <label>Start <input type="time" id="start" required step="900" /></label>
        <label>End <input type="time" id="end" required step="900" /></label>
      </div>
      <label>Purpose (optional) <input type="text" id="purpose" maxlength="60" placeholder="e.g. Study session" /></label>
      <button type="submit">Check availability</button>
      <p class="hint">Open ${RULES.openHour}:00–${RULES.closeHour}:00 · ${RULES.minMinutes}–${RULES.maxMinutes} min per booking</p>
    </form>
    <section id="result" aria-live="polite"></section>
    <section>
      <h2>Bookings on selected day</h2>
      <ul id="day-list"></ul>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#check-form')!;
const dateInput = document.querySelector<HTMLInputElement>('#date')!;
const startInput = document.querySelector<HTMLInputElement>('#start')!;
const endInput = document.querySelector<HTMLInputElement>('#end')!;
const purposeInput = document.querySelector<HTMLInputElement>('#purpose')!;
const result = document.querySelector<HTMLElement>('#result')!;
const dayList = document.querySelector<HTMLUListElement>('#day-list')!;

function renderDay(date: string) {
  const items = [
    ...BOOKINGS.filter((b) => b.start.startsWith(date)).map(
      (b) => `<li><span>${b.start.slice(11)}–${b.end.slice(11)}</span> ${b.title}</li>`,
    ),
    ...BLOCKS.filter((b) => b.start.startsWith(date)).map(
      (b) => `<li class="blocked"><span>${b.start.slice(11)}–${b.end.slice(11)}</span> Blocked: ${b.reason}</li>`,
    ),
  ];
  dayList.innerHTML = items.length ? items.join('') : '<li class="empty">No bookings.</li>';
}

dateInput.addEventListener('change', () => renderDay(dateInput.value));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const res = checkAvailability(
    { date: dateInput.value, startTime: startInput.value, endTime: endInput.value },
    BOOKINGS,
    BLOCKS,
  );
  const purpose = purposeInput.value ? ` for “${purposeInput.value}”` : '';
  result.className = res.available ? 'ok' : 'error';
  result.innerHTML = `<strong>${res.available ? 'Available' : 'Not available'}</strong>${purpose}<br />${res.message}`;
  renderDay(dateInput.value);
});
