import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';
import { userDocPath } from '../firebase/firestoreCollections.js';

/**
 * Генерирует случайный токен для share-ссылки.
 * Используется crypto.randomUUID (доступно во всех современных браузерах),
 * без внешних зависимостей.
 * @returns {string}
 */
function generateToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * Создаёт документ пользователя при первом входе через Google, если его ещё нет.
 * Сразу генерирует shareTokens — чтобы "Поделиться" работало без промежуточного шага.
 * @param {{ uid: string, displayName: string, email: string, photoURL: string }} authUser
 */
export async function ensureUserDocExists(authUser) {
  const userRef = doc(db, userDocPath(authUser.uid));
  const existing = await getDoc(userRef);
  if (existing.exists()) return;

  await setDoc(userRef, {
    displayName: authUser.displayName ?? '',
    email: authUser.email ?? '',
    photoURL: authUser.photoURL ?? '',
    shareTokens: {
      viewToken: generateToken(),
      editToken: generateToken(),
      isViewEnabled: true,
      isEditEnabled: false,
    },
  });
}

/**
 * Подписка на профиль пользователя (включая shareTokens) в реальном времени.
 * @param {string} userId
 * @param {(userDoc: object|null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserDoc(userId, callback) {
  return onSnapshot(doc(db, userDocPath(userId)), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/**
 * Включает/выключает view или edit доступ (не меняя сам токен).
 * @param {string} userId
 * @param {'isViewEnabled'|'isEditEnabled'} field
 * @param {boolean} value
 */
export async function setShareEnabled(userId, field, value) {
  await updateDoc(doc(db, userDocPath(userId)), {
    [`shareTokens.${field}`]: value,
  });
}

/**
 * Перегенерирует токен (view или edit) — необратимо инвалидирует старую ссылку.
 * @param {string} userId
 * @param {'viewToken'|'editToken'} field
 * @returns {Promise<string>} новый токен
 */
export async function regenerateShareToken(userId, field) {
  const newToken = generateToken();
  await updateDoc(doc(db, userDocPath(userId)), {
    [`shareTokens.${field}`]: newToken,
  });
  return newToken;
}

/**
 * Получает публичный профиль владельца (для гостевых страниц) — только то,
 * что можно безопасно показать: имя. Токены сверяются в security rules,
 * не возвращаются наружу этой функцией напрямую в UI-логике.
 * @param {string} userId
 */
export async function getUserDocOnce(userId) {
  const snap = await getDoc(doc(db, userDocPath(userId)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
