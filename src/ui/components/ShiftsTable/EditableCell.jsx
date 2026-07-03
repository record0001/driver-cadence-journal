import { useState } from 'react';

/**
 * Универсальная inline-редактируемая ячейка: клик -> input, Enter/blur -> сохранить,
 * Escape -> отмена. Используется для "Время за рулём", "Километраж", "Примечание".
 * @param {{ value: string|number, displayValue: string, type?: 'text'|'number', onSave: (newValue: string) => void, disabled?: boolean, placeholder?: string }} props
 */
export function EditableCell({ value, displayValue, type = 'text', onSave, disabled, placeholder = '—' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  if (disabled) {
    return <span>{displayValue}</span>;
  }

  if (!isEditing) {
    return (
      <span
        className="editable-cell"
        onClick={() => {
          setDraft(value ?? '');
          setIsEditing(true);
        }}
        title="Нажмите, чтобы изменить"
      >
        {displayValue || placeholder}
      </span>
    );
  }

  const commit = () => {
    setIsEditing(false);
    onSave(draft);
  };

  return (
    <input
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setIsEditing(false);
      }}
    />
  );
}
