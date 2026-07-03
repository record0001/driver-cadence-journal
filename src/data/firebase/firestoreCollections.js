/**
 * Единое место, где описана структура путей Firestore.
 * users/{userId}/cadences/{cadenceId}/shifts/{shiftId}
 */
export const usersPath = () => 'users';
export const userDocPath = (userId) => `users/${userId}`;
export const cadencesPath = (userId) => `users/${userId}/cadences`;
export const cadenceDocPath = (userId, cadenceId) =>
  `users/${userId}/cadences/${cadenceId}`;
export const shiftsPath = (userId, cadenceId) =>
  `users/${userId}/cadences/${cadenceId}/shifts`;
export const shiftDocPath = (userId, cadenceId, shiftId) =>
  `users/${userId}/cadences/${cadenceId}/shifts/${shiftId}`;
