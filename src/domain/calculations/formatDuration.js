/**
 * Форматирует длительность в минутах в человекочитаемый вид "7ч 30м".
 * @param {number|null} totalMinutes
 * @returns {string}
 */
export function formatDuration(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || Number.isNaN(totalMinutes)) {
    return '—';
  }
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${hours}ч ${String(minutes).padStart(2, '0')}м`;
}

/**
 * Разница между двумя датами в минутах.
 * @param {Date} from
 * @param {Date} to
 * @returns {number}
 */
export function diffInMinutes(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 60000);
}
