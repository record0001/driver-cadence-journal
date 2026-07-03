import { useState } from 'react';
import { formatDate } from '../../formatters.js';

/**
 * Упрощённое решение: показывает только диапазон дат каждой каденции,
 * без итогов по каждой (иначе пришлось бы подписываться на смены ВСЕХ
 * каденций одновременно ради дропдауна — неоправданная сложность для MVP,
 * принцип простоты из спецификации).
 *
 * @param {{
 *   cadences: import('../../../domain/entities/Cadence.js').Cadence[],
 *   activeCadenceId: string|null,
 *   onSelect: (cadenceId: string) => void,
 *   onCreateNew: () => void,
 *   allowCreate?: boolean,
 * }} props
 */
export function CadenceSelector({ cadences, activeCadenceId, onSelect, onCreateNew, allowCreate = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCadence = cadences.find((c) => c.id === activeCadenceId);

  return (
    <div className="cadence-selector">
      <button className="btn" onClick={() => setIsOpen((v) => !v)}>
        {activeCadence
          ? `${formatDate(activeCadence.startDate)} – ${activeCadence.endDate ? formatDate(activeCadence.endDate) : 'сейчас'}`
          : 'Выбрать каденцию'}{' '}
        ▾
      </button>

      {isOpen && (
        <div className="cadence-selector__dropdown">
          {cadences.map((cadence) => (
            <button
              key={cadence.id}
              className="cadence-option"
              onClick={() => {
                onSelect(cadence.id);
                setIsOpen(false);
              }}
            >
              <div>
                {formatDate(cadence.startDate)} – {cadence.endDate ? formatDate(cadence.endDate) : 'сейчас'}
              </div>
              {cadence.id === activeCadenceId && (
                <div className="cadence-option__meta">Текущая каденция</div>
              )}
            </button>
          ))}
          {allowCreate && (
            <button
              className="cadence-option"
              style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: 'none' }}
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
            >
              + Создать новую каденцию
            </button>
          )}
        </div>
      )}
    </div>
  );
}
