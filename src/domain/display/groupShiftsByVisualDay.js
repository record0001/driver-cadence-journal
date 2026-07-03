import { calculateShiftDuration } from '../calculations/shiftDuration.js';
import { calculateRestBetween } from '../calculations/restBetweenShifts.js';
import { crossesMidnight, isShiftCompleted } from '../entities/Shift.js';

/**
 * @typedef {Object} ShiftDisplayRow
 * @property {string} rowId          // уникальный ключ строки (для React key)
 * @property {string} shiftId        // id исходной смены (для редактирования/удаления)
 * @property {Date} date             // календарный день, к которому относится строка
 * @property {boolean} isStartRow    // в этой строке показывается время начала
 * @property {boolean} isEndRow      // в этой строке показывается время окончания
 * @property {Date|null} startTime   // выводится только если isStartRow
 * @property {Date|null} endTime     // выводится только если isEndRow
 * @property {number|null} durationMinutes // только на isEndRow (правило проекта)
 * @property {number|null} restMinutes     // только на isStartRow (отдых ПЕРЕД началом)
 * @property {number|null} drivingTime     // показывается на "содержательной" строке (isEndRow либо единственной)
 * @property {number|null} distanceKm
 * @property {string} note
 * @property {boolean} hasOverlapWarning
 */

/**
 * Возвращает список дат от start до end включительно (по календарным дням).
 * @param {Date} start
 * @param {Date} end
 * @returns {Date[]}
 */
function enumerateDays(start, end) {
  const days = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/**
 * Преобразует плоский список смен в список строк для таблицы, разбивая
 * смены, пересекающие полночь, на несколько визуальных строк — без
 * изменения исходных данных (смена в БД остаётся единой сущностью).
 *
 * Сортировка строго хронологическая: старые смены сверху, новые снизу.
 *
 * @param {import('../entities/Shift.js').Shift[]} shifts
 * @param {Set<string>} [overlappingShiftIds] // id смен, помеченных как пересекающиеся
 * @returns {ShiftDisplayRow[]}
 */
export function groupShiftsByVisualDay(shifts, overlappingShiftIds = new Set()) {
  const sorted = [...shifts].sort(
    (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
  );

  const rows = [];

  sorted.forEach((shift, index) => {
    const prevShift = index > 0 ? sorted[index - 1] : null;
    const restMinutes = calculateRestBetween(prevShift, shift);
    const durationMinutes = calculateShiftDuration(shift);
    const hasOverlapWarning = overlappingShiftIds.has(shift.id);

    const completed = isShiftCompleted(shift);
    const spansMultipleDays = completed && crossesMidnight(shift);

    if (!spansMultipleDays) {
      // Смена в пределах одного дня (или ещё не завершена) — одна строка.
      rows.push({
        rowId: `${shift.id}-single`,
        shiftId: shift.id,
        date: shift.startDateTime,
        isStartRow: true,
        isEndRow: completed,
        startTime: shift.startDateTime,
        endTime: shift.endDateTime,
        durationMinutes: completed ? durationMinutes : null,
        restMinutes,
        drivingTime: shift.drivingTime,
        distanceKm: shift.distanceKm,
        note: shift.note,
        hasOverlapWarning,
      });
      return;
    }

    // Смена пересекает полночь — дробим только для отображения.
    const days = enumerateDays(shift.startDateTime, shift.endDateTime);

    days.forEach((day, dayIndex) => {
      const isFirstDay = dayIndex === 0;
      const isLastDay = dayIndex === days.length - 1;

      rows.push({
        rowId: `${shift.id}-day${dayIndex}`,
        shiftId: shift.id,
        date: day,
        isStartRow: isFirstDay,
        isEndRow: isLastDay,
        startTime: isFirstDay ? shift.startDateTime : null,
        endTime: isLastDay ? shift.endDateTime : null,
        // Длительность — строго только в строке окончания (зафиксированное правило).
        durationMinutes: isLastDay ? durationMinutes : null,
        // Отдых относится к началу смены — показываем только на первой строке.
        restMinutes: isFirstDay ? restMinutes : null,
        // Время за рулём / км / примечание — ручные поля всей смены,
        // показываем на итоговой (последней) строке, чтобы не дублировать.
        drivingTime: isLastDay ? shift.drivingTime : null,
        distanceKm: isLastDay ? shift.distanceKm : null,
        note: isLastDay ? shift.note : '',
        hasOverlapWarning,
      });
    });
  });

  return rows;
}
