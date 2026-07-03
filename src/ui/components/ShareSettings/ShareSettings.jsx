import { setShareEnabled, regenerateShareToken } from '../../../data/repositories/userRepository.js';

/**
 * @param {{ userId: string, shareTokens: { viewToken: string, editToken: string, isViewEnabled: boolean, isEditEnabled: boolean }, onClose: () => void }} props
 */
export function ShareSettings({ userId, shareTokens, onClose }) {
  const baseUrl = window.location.origin;
  const viewUrl = `${baseUrl}/shared/view/${userId}/${shareTokens.viewToken}`;
  const editUrl = `${baseUrl}/shared/edit/${userId}/${shareTokens.editToken}`;

  const copy = (text) => navigator.clipboard.writeText(text);

  const handleRegenerate = async (field) => {
    const confirmed = window.confirm(
      'Старая ссылка перестанет работать. Продолжить?'
    );
    if (confirmed) {
      await regenerateShareToken(userId, field);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box__header">
          <h2>Доступ к журналу</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="toggle-row">
          <span>👁 Просмотр</span>
          <input
            type="checkbox"
            checked={shareTokens.isViewEnabled}
            onChange={(e) => setShareEnabled(userId, 'isViewEnabled', e.target.checked)}
          />
        </div>
        {shareTokens.isViewEnabled && (
          <div className="link-box">
            <span style={{ flex: 1 }}>{viewUrl}</span>
            <button className="btn" onClick={() => copy(viewUrl)}>
              Копировать
            </button>
            <button className="btn" onClick={() => handleRegenerate('viewToken')}>
              Новая
            </button>
          </div>
        )}

        <div className="toggle-row" style={{ marginTop: 'var(--spacing-3)' }}>
          <span>✏️ Редактирование</span>
          <input
            type="checkbox"
            checked={shareTokens.isEditEnabled}
            onChange={(e) => setShareEnabled(userId, 'isEditEnabled', e.target.checked)}
          />
        </div>
        {shareTokens.isEditEnabled && (
          <div className="link-box">
            <span style={{ flex: 1 }}>{editUrl}</span>
            <button className="btn" onClick={() => copy(editUrl)}>
              Копировать
            </button>
            <button className="btn" onClick={() => handleRegenerate('editToken')}>
              Новая
            </button>
          </div>
        )}

        <div className="modal-box__footer">
          <button className="btn btn-primary" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
