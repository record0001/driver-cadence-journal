import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useCadences } from '../../data/hooks/useCadences.js';
import { useShifts } from '../../data/hooks/useShifts.js';
import { subscribeToUserDoc } from '../../data/repositories/userRepository.js';
import {
  createShiftDoc,
  updateShiftDoc,
  deleteShiftDoc,
} from '../../data/repositories/shiftsRepository.js';
import { createCadenceDoc } from '../../data/repositories/cadencesRepository.js';
import { calculateCadenceSummary } from '../../domain/calculations/cadenceSummary.js';
import { AppShell } from '../layout/AppShell.jsx';
import { CadenceSelector } from '../components/CadenceSelector/CadenceSelector.jsx';
import { CadenceSummaryBar } from '../components/CadenceSummaryBar/CadenceSummaryBar.jsx';
import { AnalyticsPanel } from '../components/AnalyticsPanel/AnalyticsPanel.jsx';
import { ShiftsTable } from '../components/ShiftsTable/ShiftsTable.jsx';
import { ShiftFormModal } from '../components/ShiftFormModal/ShiftFormModal.jsx';
import { ShareSettings } from '../components/ShareSettings/ShareSettings.jsx';

export function JournalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cadences, defaultCadence, isLoading: cadencesLoading } = useCadences(user?.uid);

  const [activeCadenceId, setActiveCadenceId] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (defaultCadence && !activeCadenceId) {
      setActiveCadenceId(defaultCadence.id);
    }
  }, [defaultCadence, activeCadenceId]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToUserDoc(user.uid, setUserDoc);
  }, [user]);

  const { shifts, hasPendingWrites, isLoading: shiftsLoading } = useShifts(
    user?.uid,
    activeCadenceId
  );

  const summary = calculateCadenceSummary(shifts);
  const editingShift = shifts.find((s) => s.id === editingShiftId) ?? null;

  const handleSaveShift = async (draftShift) => {
    if (draftShift.id) {
      await updateShiftDoc(user.uid, activeCadenceId, draftShift.id, draftShift);
    } else {
      await createShiftDoc(user.uid, activeCadenceId, draftShift);
    }
    // Модалка сама покажет экран подтверждения и закроется через onClose
    // после того, как пользователь нажмёт «ОК» — здесь форму не закрываем.
  };

  const handleFieldSave = async (shiftId, field, rawValue) => {
    const patch = {};
    if (field === 'drivingTime' || field === 'distanceKm') {
      patch[field] = rawValue === '' ? null : Number(rawValue);
    } else {
      patch[field] = rawValue;
    }
    await updateShiftDoc(user.uid, activeCadenceId, shiftId, patch);
  };

  const handleDelete = async (shiftId) => {
    const confirmed = window.confirm('Удалить эту смену? Действие необратимо.');
    if (confirmed) {
      await deleteShiftDoc(user.uid, activeCadenceId, shiftId);
    }
  };

  const handleCreateCadence = async () => {
    const startDateStr = window.prompt('Дата начала новой каденции (ГГГГ-ММ-ДД):');
    if (!startDateStr) return;
    const startDate = new Date(`${startDateStr}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) {
      window.alert('Неверный формат даты.');
      return;
    }
    const newId = await createCadenceDoc(user.uid, { startDate, endDate: null });
    setActiveCadenceId(newId);
  };

  if (cadencesLoading) {
    return (
      <AppShell>
        <p>Загрузка…</p>
      </AppShell>
    );
  }

  return (
    <AppShell onOpenShareSettings={() => setIsShareOpen(true)}>
      <div className="toolbar">
        {cadences.length > 0 ? (
          <CadenceSelector
            cadences={cadences}
            activeCadenceId={activeCadenceId}
            onSelect={setActiveCadenceId}
            onCreateNew={handleCreateCadence}
          />
        ) : (
          <button className="btn btn-primary" onClick={handleCreateCadence}>
            + Создать первую каденцию
          </button>
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
          <ShiftsTable
            shifts={shifts}
            readOnly={false}
            canDelete
            onFieldSave={handleFieldSave}
            onOpenEdit={(shiftId) => {
              setEditingShiftId(shiftId);
              setIsFormOpen(true);
            }}
            onDelete={handleDelete}
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
          onOpenFullEditPage={
            editingShift
              ? () => {
                  setIsFormOpen(false);
                  navigate(`/shift/${activeCadenceId}/${editingShift.id}/edit`);
                }
              : undefined
          }
        />
      )}

      {isShareOpen && userDoc?.shareTokens && (
        <ShareSettings
          userId={user.uid}
          shareTokens={userDoc.shareTokens}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </AppShell>
  );
}
