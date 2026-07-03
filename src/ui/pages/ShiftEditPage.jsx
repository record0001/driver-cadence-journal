import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useShifts } from '../../data/hooks/useShifts.js';
import { updateShiftDoc } from '../../data/repositories/shiftsRepository.js';
import { validateShift } from '../../domain/validators/shiftValidator.js';
import { AppShell } from '../layout/AppShell.jsx';
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from '../formatters.js';

/**
 * Полноценная страница редактирования — используется для сложных случаев
 * (например, когда нужно одновременно скорректировать начало, конец и
 * разобраться с соседними по времени сменами, видя больше контекста, чем в модалке).
 */
export function ShiftEditPage() {
  const { cadenceId, shiftId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shifts, isLoading } = useShifts(user?.uid, cadenceId);
  const shift = shifts.find((s) => s.id === shiftId);

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [drivingTime, setDrivingTime] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [note, setNote] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (shift && !initialized) {
    setStartDate(toDateInputValue(shift.startDateTime));
    setStartTime(toTimeInputValue(shift.startDateTime));
    setEndDate(toDateInputValue(shift.endDateTime));
    setEndTime(toTimeInputValue(shift.endDateTime));
    setDrivingTime(shift.drivingTime ?? '');
    setDistanceKm(shift.distanceKm ?? '');
    setNote(shift.note ?? '');
    setInitialized(true);
  }

  const draftShift = useMemo(
    () => ({
      id: shiftId,
      startDateTime: combineDateAndTime(startDate, startTime),
      endDateTime: combineDateAndTime(endDate, endTime),
      drivingTime: drivingTime === '' ? null : Number(drivingTime),
      distanceKm: distanceKm === '' ? null : Number(distanceKm),
      note,
    }),
    [startDate, startTime, endDate, endTime, drivingTime, distanceKm, note, shiftId]
  );

  const otherShifts = shifts.filter((s) => s.id !== shiftId);
  const validation = validateShift(draftShift, otherShifts);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation.isValid) return;
    await updateShiftDoc(user.uid, cadenceId, shiftId, draftShift);
    navigate('/');
  };

  if (isLoading) {
    return (
      <AppShell>
        <p>Загрузка…</p>
      </AppShell>
    );
  }

  if (!shift) {
    return (
      <AppShell>
        <p>Смена не найдена.</p>
        <button className="btn" onClick={() => navigate('/')}>
          Вернуться в журнал
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell showUserMenu={false}>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Редактирование смены</h2>

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
              <input type="number" min="0" value={drivingTime} onChange={(e) => setDrivingTime(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Километраж</label>
              <input type="number" min="0" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label>Примечание</label>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
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
            <button type="button" className="btn" onClick={() => navigate('/')}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={!validation.isValid}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
