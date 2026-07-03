import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';
import { cadencesPath, cadenceDocPath } from '../firebase/firestoreCollections.js';

function fromFirestore(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(),
    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : null,
    isAutoDetected: data.isAutoDetected ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  };
}

/**
 * Подписка на список каденций пользователя, отсортированный по дате начала (новые сверху).
 * @param {string} userId
 * @param {(cadences: import('../../domain/entities/Cadence.js').Cadence[]) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToCadences(userId, callback) {
  const cadencesQuery = query(
    collection(db, cadencesPath(userId)),
    orderBy('startDate', 'desc')
  );
  return onSnapshot(cadencesQuery, (snapshot) => {
    callback(snapshot.docs.map(fromFirestore));
  });
}

/**
 * Создаёт новую каденцию (владелец задаёт start/end вручную).
 * @param {string} userId
 * @param {{ startDate: Date, endDate: Date|null, isAutoDetected?: boolean }} cadence
 * @returns {Promise<string>}
 */
export async function createCadenceDoc(userId, cadence) {
  const ref = await addDoc(collection(db, cadencesPath(userId)), {
    startDate: Timestamp.fromDate(cadence.startDate),
    endDate: cadence.endDate ? Timestamp.fromDate(cadence.endDate) : null,
    isAutoDetected: cadence.isAutoDetected ?? false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Закрывает каденцию (проставляет endDate) — например, при уходе в отпуск.
 * @param {string} userId
 * @param {string} cadenceId
 * @param {Date} endDate
 */
export async function closeCadenceDoc(userId, cadenceId, endDate) {
  await updateDoc(doc(db, cadenceDocPath(userId, cadenceId)), {
    endDate: Timestamp.fromDate(endDate),
  });
}
