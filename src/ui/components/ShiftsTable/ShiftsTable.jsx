import { useMemo } from 'react';
import { groupShiftsByVisualDay } from '../../../domain/display/groupShiftsByVisualDay.js';
import { shiftsOverlap } from '../../../domain/calculations/restBetweenShifts.js';
import { ShiftRow } from './ShiftRow.jsx';

/**
 * @param {{
 *   shifts: import('../../../domain/entities/Shift.js').Shift[],
 *   readOnly: boolean,
 *   canDelete: boolean,
 *   onFieldSave: (shiftId: string, field: string, rawValue: string) => void,
 *   onOpenEdit: (shiftId: string) => void,
 *   onDelete: (shiftId: string) => void,
 * }} props
 */
export function ShiftsTable({ shifts, readOnly, canDelete, onFieldSave, onOpenEdit, onDelete }) {
  const overlappingIds = useMemo(() => {
    const ids = new Set();
    shifts.forEach((shift) => {
      const others = shifts.filter((s) => s.id !== shift.id);
      if (shift.startDateTime && shiftsOverlap(shift, others)) {
        ids.add(shift.id);
      }
    });
    return ids;
  }, [shifts]);

  const rows = useMemo(
    () => groupShiftsByVisualDay(shifts, overlappingIds),
    [shifts, overlappingIds]
  );

  if (rows.length === 0) {
    return (
      <div className="card">
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          В этой каденции пока нет смен. Добавьте первую запись.
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="shifts-table">
        <thead>
          <tr>
            <th>№</th>
            <th className="col-date">Дата</th>
            <th>День</th>
            <th>Начало</th>
            <th>Конец</th>
            <th>Длит-сть</th>
            <th>Отдых</th>
            <th>Время / Км</th>
            <th>Примечание</th>
            {!readOnly && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ShiftRow
              key={row.rowId}
              row={row}
              index={index}
              readOnly={readOnly}
              canDelete={canDelete}
              onFieldSave={onFieldSave}
              onOpenEdit={onOpenEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
