const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
const TIME_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(date) {
  return date ? DATE_FORMATTER.format(date) : '—';
}

export function formatWeekday(date) {
  if (!date) return '—';
  const raw = WEEKDAY_FORMATTER.format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatTime(date) {
  return date ? TIME_FORMATTER.format(date) : '—';
}

/**
 * Преобразует Date в значение для <input type="date">.
 */
export function toDateInputValue(date) {
  if (!date) return '';
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

/**
 * Преобразует Date в значение для <input type="time">.
 */
export function toTimeInputValue(date) {
  if (!date) return '';
  return TIME_FORMATTER.format(date).padStart(5, '0');
}

/**
 * Собирает Date из отдельных значений date-input и time-input.
 * @param {string} dateStr "YYYY-MM-DD"
 * @param {string} timeStr "HH:mm"
 * @returns {Date|null}
 */
export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}
