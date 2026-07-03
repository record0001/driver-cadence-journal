import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShareAccess } from '../../data/hooks/useShareAccess.js';
import { useCadences } from '../../data/hooks/useCadences.js';
import { useShifts } from '../../data/hooks/useShifts.js';
import { createShiftDoc, updateShiftDoc } from '../../data/repositories/shiftsRepository.js';
import { calculateCadenceSummary } from '../../domain/calculations/cadenceSummary.js';
import { AppShell } from '../layout/AppShell.jsx';
import { CadenceSelector } from '../components/CadenceSelector/CadenceSelector.jsx';
import { CadenceSummaryBar } from '../components/CadenceSummaryBar/CadenceSummaryBar.jsx';
import { AnalyticsPanel } from '../components/AnalyticsPanel/AnalyticsPanel.jsx';
import { ShiftsTable } from '../components/ShiftsTable/ShiftsTable.jsx';
import { ShiftFormModal } from '../components/ShiftFormModal/ShiftFormModal.jsx';

export function SharedEditPage() {
  const { userId, token } = useParams();
  const { isValid, isLoading, ownerName } = useShareAccess(userId, token, 'edit');
  const { cadences, defaultCadence } = useCadences(isValid ? userId : null);
  const [activeCadenceId, setActiveCadenceId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);

  useEffect(() => {
    if (defaultCadence && !activeCadenceId) setActiveCadenceId(defaultCadence.id);
  }, [defaultCadence, activeCadenceId]);

  const { shifts, hasPendingWrites, isLoading: shiftsLoading } = useShifts(
    isValid ? userId : null,
    activeCadenceId
  );

  if (isLoading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p>Проверка доступа…</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h2>Доступ недействителен</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Ссылка недействительна или доступ был отключён владельцем журнала.
        </p>
      </div>
    );
  }

  const summary = calculateCadenceSummary(shifts);
  const editingShift = shifts.find((s) => s.id === editingShiftId) ?? null;

  const handleSaveShift = async (draftShift) => {
    if (draftShift.id) {
      await updateShiftDoc(userId, activeCadenceId, draftShift.id, draftShift);
    } else {
      await createShiftDoc(userId, activeCadenceId, draftShift);
    }
    setIsFormOpen(false);
    setEditingShiftId(null);
  };

  const handleFieldSave = async (shiftId, field, rawValue) => {
    const patch = {};
    if (field === 'drivingTime' || field === 'distanceKm') {
      patch[field] = rawValue === '' ? null : Number(rawValue);
    } else {
      patch[field] = rawValue;
    }
    await updateShiftDoc(userId, activeCadenceId, shiftId, patch);
  };

  return (
    <AppShell
      shareBanner={`Вы редактируете журнал по общей ссылке · ${ownerName ?? ''} · удаление недоступно`}
      showUserMenu={false}
    >
      <div className="toolbar">
        {cadences.length > 0 && (
          <CadenceSelector
            cadences={cadences}
            activeCadenceId={activeCadenceId}
            onSelect={setActiveCadenceId}
            onCreateNew={() => {}}
            allowCreate={false}
          />
        )}
        {activeCadenceId && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            + Добавить смену
          </button>
        )}
      </div>

      {activeCadenceId && !shiftsLoading && (
        <>
          <CadenceSummaryBar summary={summary} hasPendingWrites={hasPendingWrites} />
          <AnalyticsPanel shifts={shifts} />
          {/* canDelete=false: гость по edit-ссылке не может удалять смены — зафиксированное правило проекта */}
          <ShiftsTable
            shifts={shifts}
            readOnly={false}
            canDelete={false}
            onFieldSave={handleFieldSave}
            onOpenEdit={(shiftId) => {
              setEditingShiftId(shiftId);
              setIsFormOpen(true);
            }}
            onDelete={() => {}}
          />
        </>
      )}

      {isFormOpen && (
        <ShiftFormModal
          initialShift={editingShift}
          existingShifts={shifts}
          onSave={handleSaveShift}
          onClose={() => {
            setIsFormOpen(false);
            setEditingShiftId(null);
          }}
        />
      )}
    </AppShell>
  );
}
