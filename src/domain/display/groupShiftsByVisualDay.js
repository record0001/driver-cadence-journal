import { calculateShiftDuration } from '../calculations/shiftDuration.js';
import { calculateRestBetween } from '../calculations/restBetweenShifts.js';
import { crossesMidnight, isShiftCompleted } from '../entities/Shift.js';

/**
 * @typedef {Object} ShiftDisplayRow
 * @property {string} rowId          // уникальный ключ строки (для React key)
 * @property {string|null} shiftId   // id исходной смены (null для строк-заглушек пропущенных дней)
 * @property {Date} date             // календарный день, к которому относится строка
 * @property {boolean} isStartRow    // в этой строке показывается время начала
 * @property {boolean} isEndRow      // в этой строке показывается время окончания
 * @property {Date|null} startTime   // выводится только если isStartRow
 * @property {Date|null} endTime     // выводится только если isEndRow
 * @property {number|null} durationMinutes // только на isEndRow (правило проекта)
 * @property {number|null} restMinutes     // отдых ПОСЛЕ этой смены, до начала следующей —
 *                                          // показывается только на isEndRow ПРЕДЫДУЩЕЙ смены
 *                                          // (ROADMAP 3.5). Проставляется постфактум, когда
 *                                          // становится известна следующая смена.
 * @property {number|null} drivingTime     // показывается на "содержательной" строке (isEndRow либо единственной)
 * @property {number|null} distanceKm
 * @property {string} note
 * @property {boolean} hasOverlapWarning
 * @property {boolean} [isGapDay]    // true = визуальная строка-заглушка пропущенного дня (нет реальной смены)
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
 * Нормализует дату к началу календарного дня. Используется только для
 * СРАВНЕНИЯ дат при поиске пропущенных дней — не используется для
 * отображения и не мутирует исходные объекты Date строк.
 * @param {Date} date
 * @returns {Date}
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Разница между двумя датами в целых календарных днях (b - a).
 * @param {Date} a
 * @param {Date} b
 * @returns {number}
 */
function diffInCalendarDays(a, b) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

/**
 * Создаёт визуальную строку-заглушку для календарного дня, в котором нет
 * ни одной реальной смены. НЕ создаёт Shift, ничего не пишет в Firestore —
 * это чисто отображаемый объект той же формы ShiftDisplayRow.
 * @param {Date} date
 * @returns {ShiftDisplayRow}
 */
function createGapRow(date) {
  return {
    rowId: `gap-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    shiftId: null,
    date,
    isStartRow: false,
    isEndRow: false,
    startTime: null,
    endTime: null,
    durationMinutes: null,
    restMinutes: null,
    drivingTime: null,
    distanceKm: null,
    note: '',
    hasOverlapWarning: false,
    isGapDay: true,
  };
}

/**
 * Вставляет строки-заглушки пропущенных календарных дней СТРОГО между уже
 * существующими визуальными строками (не добавляет дни до первой и после
 * последней строки). Работает над уже готовым, хронологически
 * отсортированным списком строк — не трогает исходные Shift и не влияет
 * на порядок реальных строк.
 * @param {ShiftDisplayRow[]} rows
 * @returns {ShiftDisplayRow[]}
 */
function insertMissingDays(rows) {
  if (rows.length < 2) return rows;

  const result = [rows[0]];

  for (let i = 1; i < rows.length; i += 1) {
    const prevRow = rows[i - 1];
    const currentRow = rows[i];
    const dayGap = diffInCalendarDays(prevRow.date, currentRow.date);

    // dayGap === 1 — соседние дни, разрыва нет.
    // dayGap <= 0 — тот же день или смены идут не по возрастанию дат
    // (например, пересекающиеся смены) — заглушки не нужны и не вставляются.
    for (let offset = 1; offset < dayGap; offset += 1) {
      const gapDate = startOfDay(prevRow.date);
      gapDate.setDate(gapDate.getDate() + offset);
      result.push(createGapRow(gapDate));
    }

    result.push(currentRow);
  }

  return result;
}

/**
 * Преобразует плоский список смен в список строк для таблицы, разбивая
 * смены, пересекающие полночь, на несколько визуальных строк — без
 * изменения исходных данных (смена в БД остаётся единой сущностью).
 * Дополнительно заполняет визуальными строками-заглушками пропущенные
 * календарные дни МЕЖДУ уже существующими сменами (ROADMAP 3.1).
 *
 * Отдых между сменами (ROADMAP 3.5): значение calculateRestBetween(prevShift,
 * shift) относится к промежутку между окончанием ПРЕДЫДУЩЕЙ смены и началом
 * ТЕКУЩЕЙ. Визуально оно показывается в последней (конечной) строке
 * ПРЕДЫДУЩЕЙ смены — так как именно там заканчивается "рабочий" интервал,
 * после которого начинается отдых. Поэтому значение проставляется
 * постфактум: пока обрабатывается текущая смена, ещё до того как для неё
 * будут созданы собственные строки, найденное restMinutes записывается в
 * уже отправленную в rows последнюю строку предыдущей смены. Сама формула
 * расчёта (calculateRestBetween) не меняется — меняется только то, к какой
 * строке привязывается уже готовое значение.
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
    const durationMinutes = calculateShiftDuration(shift);
    const hasOverlapWarning = overlappingShiftIds.has(shift.id);

    const completed = isShiftCompleted(shift);
    const spansMultipleDays = completed && crossesMidnight(shift);

    // Перед первой сменой отдыха нет (prevShift === null — пропускаем).
    // Иначе — отдых относится к предыдущей смене и проставляется в её
    // уже существующую последнюю строку (rows на этот момент содержит
    // все строки предыдущей смены, но ещё не содержит строк текущей).
    if (prevShift) {
      const restMinutes = calculateRestBetween(prevShift, shift);
      const prevShiftLastRow = rows[rows.length - 1];
      if (prevShiftLastRow) {
        prevShiftLastRow.restMinutes = restMinutes;
      }
    }

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
        // Отдых ПОСЛЕ этой смены будет проставлен позже, при обработке
        // следующей смены (или останется null, если смена последняя).
        restMinutes: null,
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
        // Отдых ПОСЛЕ этой смены будет проставлен позже, при обработке
        // следующей смены — и попадёт именно в последнюю (isLastDay) строку,
        // так как rows[rows.length - 1] на тот момент указывает на неё.
        restMinutes: null,
        // Время за рулём / км / примечание — ручные поля всей смены,
        // показываем на итоговой (последней) строке, чтобы не дублировать.
        drivingTime: isLastDay ? shift.drivingTime : null,
        distanceKm: isLastDay ? shift.distanceKm : null,
        note: isLastDay ? shift.note : '',
        hasOverlapWarning,
      });
    });
  });

  return insertMissingDays(rows);
}
