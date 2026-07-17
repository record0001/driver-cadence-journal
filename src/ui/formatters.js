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

/**
 * Преобразует длительность в минутах (например, drivingTime) в значение
 * для <input type="time">, чтобы вводить длительность в формате чч:мм
 * тем же нативным мобильным пикером, что и время начала/конца смены.
 *
 * ВАЖНО: это конвертация ДЛИТЕЛЬНОСТИ, а не момента времени — в отличие от
 * toTimeInputValue(date). Хранение drivingTime в Firestore/domain остаётся
 * числом минут, конвертация нужна только на границе UI.
 *
 * Ограничение платформы: нативный <input type="time"> поддерживает только
 * диапазон 00:00–23:59, то есть максимум 1439 минут. Значения свыше суток
 * (если такие когда-либо были сохранены через старый number-инпут) не могут
 * быть корректно отображены в этом контроле.
 *
 * @param {number|null} totalMinutes
 * @returns {string} "HH:MM" либо '' если значение отсутствует/некорректно
 */
export function minutesToTimeInputValue(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes === '') return '';
  const minutesNum = Number(totalMinutes);
  if (Number.isNaN(minutesNum) || minutesNum < 0) return '';
  const hours = Math.floor(minutesNum / 60);
  const minutes = Math.floor(minutesNum % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Обратное преобразование: значение <input type="time"> ("HH:MM") → число минут.
 * Используется для drivingTime вместо Number(value) при обычном number-инпуте.
 * @param {string} value "HH:MM"
 * @returns {number|null} null, если поле пустое (аналогично прежнему поведению '' → null)
 */
export function timeInputValueToMinutes(value) {
  if (!value) return null;
  const [hoursStr, minutesStr] = value.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}
