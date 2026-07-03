import { useState } from 'react';
import { calculateRangeAnalytics } from '../../../domain/calculations/rangeAnalytics.js';
import { formatDuration } from '../../../domain/calculations/formatDuration.js';

/**
 * @param {{ shifts: import('../../../domain/entities/Shift.js').Shift[] }} props
 */
export function AnalyticsPanel({ shifts }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [result, setResult] = useState(null);

  const canCalculate = dateFrom && dateTo;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const from = new Date(`${dateFrom}T00:00:00`);
    const to = new Date(`${dateTo}T00:00:00`);
    setResult(calculateRangeAnalytics(shifts, from, to));
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
      <div className="toolbar" style={{ marginBottom: result ? 'var(--spacing-3)' : 0 }}>
        <div className="form-field" style={{ margin: 0 }}>
          <label>Дата от</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="form-field" style={{ margin: 0 }}>
          <label>Дата до</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
          Рассчитать
        </button>
      </div>

      {result && (
        <div className="summary-bar" style={{ marginBottom: 0 }}>
          <div className="summary-bar__item">
            <span className="summary-bar__value">{formatDuration(result.totalDrivingTime)}</span>
            <span className="summary-bar__label">Время за рулём</span>
          </div>
          <div className="summary-bar__item">
            <span className="summary-bar__value">{result.totalKm} км</span>
            <span className="summary-bar__label">Километраж</span>
          </div>
          <div className="summary-bar__item">
            <span className="summary-bar__value">{result.shiftsCount}</span>
            <span className="summary-bar__label">Смен</span>
          </div>
        </div>
      )}
    </div>
  );
}
