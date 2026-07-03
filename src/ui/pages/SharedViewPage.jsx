import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShareAccess } from '../../data/hooks/useShareAccess.js';
import { useCadences } from '../../data/hooks/useCadences.js';
import { useShifts } from '../../data/hooks/useShifts.js';
import { calculateCadenceSummary } from '../../domain/calculations/cadenceSummary.js';
import { AppShell } from '../layout/AppShell.jsx';
import { CadenceSelector } from '../components/CadenceSelector/CadenceSelector.jsx';
import { CadenceSummaryBar } from '../components/CadenceSummaryBar/CadenceSummaryBar.jsx';
import { AnalyticsPanel } from '../components/AnalyticsPanel/AnalyticsPanel.jsx';
import { ShiftsTable } from '../components/ShiftsTable/ShiftsTable.jsx';

export function SharedViewPage() {
  const { userId, token } = useParams();
  const { isValid, isLoading, ownerName } = useShareAccess(userId, token, 'view');
  const { cadences, defaultCadence } = useCadences(isValid ? userId : null);
  const [activeCadenceId, setActiveCadenceId] = useState(null);

  useEffect(() => {
    if (defaultCadence && !activeCadenceId) setActiveCadenceId(defaultCadence.id);
  }, [defaultCadence, activeCadenceId]);

  const { shifts, isLoading: shiftsLoading } = useShifts(
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

  return (
    <AppShell shareBanner={`Вы просматриваете журнал по общей ссылке · ${ownerName ?? ''}`} showUserMenu={false}>
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
      </div>

      {activeCadenceId && !shiftsLoading && (
        <>
          <CadenceSummaryBar summary={summary} hasPendingWrites={false} />
          <AnalyticsPanel shifts={shifts} />
          <ShiftsTable
            shifts={shifts}
            readOnly
            canDelete={false}
            onFieldSave={() => {}}
            onOpenEdit={() => {}}
            onDelete={() => {}}
          />
        </>
      )}
    </AppShell>
  );
}
