import { formatDuration } from '../../../domain/calculations/formatDuration.js';

/**
 * @param {{ summary: { totalDrivingTime: number, totalKm: number, shiftsCount: number }, hasPendingWrites: boolean }} props
 */
export function CadenceSummaryBar({ summary, hasPendingWrites }) {
  return (
    <div>
      <div className="summary-bar">
        <div className="summary-bar__item">
          <span className="summary-bar__value">{formatDuration(summary.totalDrivingTime)}</span>
          <span className="summary-bar__label">Время за рулём</span>
        </div>
        <div className="summary-bar__item">
          <span className="summary-bar__value">{summary.totalKm} км</span>
          <span className="summary-bar__label">Километраж</span>
        </div>
        <div className="summary-bar__item">
          <span className="summary-bar__value">{summary.shiftsCount}</span>
          <span className="summary-bar__label">Смен</span>
        </div>
        {hasPendingWrites && (
          <div className="summary-bar__item">
            <span className="pending-indicator">
              <span className="pending-indicator__dot" />
              Сохранено локально, ждёт синхронизации
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
