import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';
import { shiftsPath, shiftDocPath } from '../firebase/firestoreCollections.js';

/**
 * Конвертация Firestore-документа в domain-объект Shift (Timestamp -> Date).
 * Это единственное место, где Firestore-специфика "просачивается" в обычные Date.
 */
function fromFirestore(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    startDateTime: data.startDateTime instanceof Timestamp ? data.startDateTime.toDate() : null,
    endDateTime: data.endDateTime instanceof Timestamp ? data.endDateTime.toDate() : null,
    drivingTime: data.drivingTime ?? null,
    distanceKm: data.distanceKm ?? null,
    note: data.note ?? '',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

/**
 * Конвертация domain-объекта Shift в формат для записи в Firestore (Date -> Timestamp).
 */
function toFirestore(shift) {
  return {
    startDateTime: shift.startDateTime ? Timestamp.fromDate(shift.startDateTime) : null,
    endDateTime: shift.endDateTime ? Timestamp.fromDate(shift.endDateTime) : null,
    drivingTime: shift.drivingTime,
    distanceKm: shift.distanceKm,
    note: shift.note ?? '',
    updatedAt: serverTimestamp(),
  };
}

/**
 * Подписка на смены конкретной каденции в реальном времени (включая offline-кэш).
 * Callback получает { shifts, hasPendingWrites } — hasPendingWrites используется
 * в UI для индикатора "сохранено локально, ждёт синхронизации".
 * @param {string} userId
 * @param {string} cadenceId
 * @param {(result: { shifts: import('../../domain/entities/Shift.js').Shift[], hasPendingWrites: boolean }) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToShifts(userId, cadenceId, callback) {
  const shiftsQuery = query(
    collection(db, shiftsPath(userId, cadenceId)),
    orderBy('startDateTime', 'asc') // хронологический порядок: старые сверху
  );

  return onSnapshot(shiftsQuery, { includeMetadataChanges: true }, (snapshot) => {
    const shifts = snapshot.docs.map(fromFirestore);
    const hasPendingWrites = snapshot.docs.some((d) => d.metadata.hasPendingWrites);
    callback({ shifts, hasPendingWrites });
  });
}

/**
 * Создаёт новую смену.
 * @param {string} userId
 * @param {string} cadenceId
 * @param {import('../../domain/entities/Shift.js').Shift} shift
 * @returns {Promise<string>} id созданного документа
 */
export async function createShiftDoc(userId, cadenceId, shift) {
  const ref = await addDoc(collection(db, shiftsPath(userId, cadenceId)), {
    ...toFirestore(shift),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Обновляет существующую смену (полностью или частично — partial patch).
 * @param {string} userId
 * @param {string} cadenceId
 * @param {string} shiftId
 * @param {Partial<import('../../domain/entities/Shift.js').Shift>} patch
 */
export async function updateShiftDoc(userId, cadenceId, shiftId, patch) {
  const updateData = { updatedAt: serverTimestamp() };
  if ('startDateTime' in patch) {
    updateData.startDateTime = patch.startDateTime ? Timestamp.fromDate(patch.startDateTime) : null;
  }
  if ('endDateTime' in patch) {
    updateData.endDateTime = patch.endDateTime ? Timestamp.fromDate(patch.endDateTime) : null;
  }
  if ('drivingTime' in patch) updateData.drivingTime = patch.drivingTime;
  if ('distanceKm' in patch) updateData.distanceKm = patch.distanceKm;
  if ('note' in patch) updateData.note = patch.note;

  await updateDoc(doc(db, shiftDocPath(userId, cadenceId, shiftId)), updateData);
}

/**
 * Удаляет смену. ВАЖНО: вызывается только из владельческого UI —
 * гостевой edit-интерфейс не должен рендерить кнопку, ведущую сюда.
 * Финальная защита — на уровне security rules (delete только для auth.uid == userId).
 * @param {string} userId
 * @param {string} cadenceId
 * @param {string} shiftId
 */
export async function deleteShiftDoc(userId, cadenceId, shiftId) {
  await deleteDoc(doc(db, shiftDocPath(userId, cadenceId, shiftId)));
}
