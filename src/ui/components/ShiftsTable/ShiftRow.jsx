import { formatDate, formatWeekday, formatTime, isWeekend } from '../../formatters.js';
import { formatDuration } from '../../../domain/calculations/formatDuration.js';
import { EditableCell } from './EditableCell.jsx';

/**
 * @param {{
 *   row: import('../../../domain/display/groupShiftsByVisualDay.js').ShiftDisplayRow,
 *   index: number,
 *   readOnly: boolean,
 *   canDelete: boolean,
 *   onFieldSave: (shiftId: string, field: string, rawValue: string) => void,
 *   onOpenEdit: (shiftId: string) => void,
 *   onDelete: (shiftId: string) => void,
 * }} props
 */
export function ShiftRow({ row, index, readOnly, canDelete, onFieldSave, onOpenEdit, onDelete }) {
  // Подсветка выходных — чисто визуальный признак на основе row.date,
  // которое уже присутствует в любой строке (включая gap-day заглушки).
  // Предупреждение о пересечении (row-overlap) имеет приоритет и задаёт
  // фон через !important — конфликта с row-weekend нет.
  const rowClassName =
    [row.hasOverlapWarning ? 'row-overlap' : null, isWeekend(row.date) ? 'row-weekend' : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <tr className={rowClassName}>
      <td>{index + 1}</td>
      <td className="col-date">
        {formatDate(row.date)}
        {row.hasOverlapWarning && (
          <span className="overlap-badge" title="Пересекается с другой сменой">
            ⚠
          </span>
        )}
      </td>
      <td>{formatWeekday(row.date)}</td>
      <td>{row.isStartRow ? formatTime(row.startTime) : '—'}</td>
      <td>{row.isEndRow ? formatTime(row.endTime) : '—'}</td>
      <td>{row.isEndRow ? formatDuration(row.durationMinutes) : '—'}</td>
      {/* Отдых относится к промежутку ПОСЛЕ этой смены — показывается в
          конечной строке (isEndRow), а не в начальной (ROADMAP 3.5). */}
      <td>{row.isEndRow ? formatDuration(row.restMinutes) : '—'}</td>
      <td>
        {row.isEndRow ? (
          <div className="cell-two-line">
            <EditableCell
              value={row.drivingTime ? row.drivingTime : ''}
              displayValue={row.drivingTime ? formatDuration(row.drivingTime) : '—'}
              type="number"
              disabled={readOnly}
              onSave={(v) => onFieldSave(row.shiftId, 'drivingTime', v)}
            />
            <span className="cell-two-line__secondary">
              <EditableCell
                value={row.distanceKm ?? ''}
                displayValue={row.distanceKm !== null ? `${row.distanceKm} км` : '—'}
                type="number"
                disabled={readOnly}
                onSave={(v) => onFieldSave(row.shiftId, 'distanceKm', v)}
              />
            </span>
          </div>
        ) : (

      /**
ячейка часов и км 
      **/
      <div className="cell-two-line">
  <span>—</span>
  <span className="cell-two-line__secondary">—</span>
</div>
/**
ячейка часов и км
**/
      
        )}
      </td>
      <td>
        {row.isEndRow ? (
          <EditableCell
            value={row.note ?? ''}
            displayValue={row.note || '—'}
            disabled={readOnly}
            onSave={(v) => onFieldSave(row.shiftId, 'note', v)}
          />
        ) : (
          '—'
        )}
      </td>
      {!readOnly && (
        <td>
          {row.isGapDay ? (
            '—'
          ) : (
            <div className="row-actions">
              <button className="btn" onClick={() => onOpenEdit(row.shiftId)}>
                Изменить
              </button>
              {canDelete && (
                <button className="btn btn-danger" onClick={() => onDelete(row.shiftId)}>
                  Удалить
                </button>
              )}
            </div>
          )}
        </td>
      )}
    </tr>
  );
}
