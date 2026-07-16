import { useMemo, useState } from 'react';
import { validateShift } from '../../../domain/validators/shiftValidator.js';
import { createShift } from '../../../domain/entities/Shift.js';
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from '../../formatters.js';

/**
 * Модальное окно — основной способ добавления и редактирования смены.
 * Поддерживает переход через полночь (отдельные date-поля для начала и конца).
 *
 * @param {{
 *   initialShift?: import('../../../domain/entities/Shift.js').Shift|null,
 *   existingShifts: import('../../../domain/entities/Shift.js').Shift[],
 *   onSave: (shift: import('../../../domain/entities/Shift.js').Shift) => void,
 *   onClose: () => void,
 *   onOpenFullEditPage?: () => void,
 * }} props
 */
export function ShiftFormModal({ initialShift, existingShifts, onSave, onClose, onOpenFullEditPage }) {
  const base = initialShift ?? createShift();

  const [startDate, setStartDate] = useState(toDateInputValue(base.startDateTime));
  const [startTime, setStartTime] = useState(toTimeInputValue(base.startDateTime));
  const [endDate, setEndDate] = useState(toDateInputValue(base.endDateTime));
  const [endTime, setEndTime] = useState(toTimeInputValue(base.endDateTime));
  const [drivingTime, setDrivingTime] = useState(base.drivingTime ?? '');
  const [distanceKm, setDistanceKm] = useState(base.distanceKm ?? '');
  const [note, setNote] = useState(base.note ?? '');

  const draftShift = useMemo(
    () => ({
      id: base.id,
      startDateTime: combineDateAndTime(startDate, startTime),
      endDateTime: combineDateAndTime(endDate, endTime),
      drivingTime: drivingTime === '' ? null : Number(drivingTime),
      distanceKm: distanceKm === '' ? null : Number(distanceKm),
      note,
    }),
    [startDate, startTime, endDate, endTime, drivingTime, distanceKm, note, base.id]
  );

  const validation = validateShift(draftShift, existingShifts);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validation.isValid) return;
    onSave(draftShift);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box__header">
          <h2>{initialShift ? 'Редактировать смену' : 'Новая смена'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Дата начала</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Время начала</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Дата окончания</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Время окончания</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Время за рулём (минуты)</label>
              <input
                type="number"
                min="0"
                placeholder="напр. 450"
                value={drivingTime}
                onChange={(e) => setDrivingTime(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Километраж</label>
              <input
                type="number"
                min="0"
                placeholder="напр. 340"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Примечание</label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {validation.errors.length > 0 && (
            <div className="form-errors">
              {validation.errors.map((err) => (
                <div key={err}>{err}</div>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="form-warnings">
              {validation.warnings.map((warn) => (
                <div key={warn}>{warn}</div>
              ))}
            </div>
          )}

          <div className="modal-box__footer">
            {initialShift && onOpenFullEditPage && (
              <button type="button" className="btn" onClick={onOpenFullEditPage}>
                Сложное редактирование
              </button>
            )}
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={!validation.isValid}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
