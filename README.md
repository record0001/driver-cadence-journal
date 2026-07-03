# Driver Cadence Journal

Табличный журнал смен, рейсов и рабочих периодов (каденций) для одного водителя.
Личный учётный инструмент — не система соответствия нормативам труда/отдыха,
все расчёты строго математические.

## Стек

- React 18 + Vite (SPA, без SSR)
- Firebase Authentication (Google)
- Firestore (offline-first: `persistentLocalCache`, `persistentSingleTabManager`)
- Деплой: Vercel / Netlify (фронтенд) + Firebase (Auth, Firestore, Hosting для rules)

## Архитектура

```
src/
  domain/     — чистая бизнес-логика (без React/Firebase импортов)
  data/       — Firebase-адаптеры: repositories + hooks
  ui/         — React-компоненты, страницы, layout
  auth/       — Google Auth context
  router/     — react-router-dom маршруты
```

Правило слоёв: `domain` не импортирует `react`/`firebase`; `firebase` встречается
только внутри `data/`; UI вызывает domain-функции напрямую.

## Модель данных (Firestore)

```
users/{userId}
  displayName, email, photoURL
  shareTokens: { viewToken, editToken, isViewEnabled, isEditEnabled }

  cadences/{cadenceId}
    startDate, endDate (nullable), isAutoDetected, createdAt

    shifts/{shiftId}
      startDateTime, endDateTime (nullable)
      drivingTime, distanceKm, note
      createdAt, updatedAt
```

## Локальный запуск

1. Установить зависимости:
   ```
   npm install
   ```
2. Создать проект в [Firebase Console](https://console.firebase.google.com/):
   - Включить Authentication → Sign-in method → Google
   - Создать базу Firestore (production mode)
3. Скопировать `.env.example` в `.env` и заполнить значениями из Firebase Console
   (Project Settings → General → Your apps → Web app).
4. Задеплоить security rules:
   ```
   firebase deploy --only firestore:rules
   ```
5. Запустить dev-сервер:
   ```
   npm run dev
   ```

## Деплой

- Фронтенд: `npm run build`, затем деплой папки `dist/` на Vercel/Netlify.
- Firestore rules: `firebase deploy --only firestore:rules`.

## Известные ограничения MVP (сознательные упрощения)

- **Offline persistence** работает только в одной активной вкладке браузера
  (`persistentSingleTabManager`). Открытие журнала в нескольких вкладках
  одновременно может отключить синхронизацию в одной из них.
- **Гостевой доступ по ссылке** (`/shared/view/...`, `/shared/edit/...`)
  защищён на уровне Firestore Rules флагами `isViewEnabled`/`isEditEnabled`,
  а не криптографической проверкой самого токена — Firestore Security Rules
  не поддерживают сравнение произвольного клиентского параметра при чтении
  документов. Практическая защита — неугадываемость `userId` и `token` в URL.
  Если потребуется более строгая проверка (точное сопоставление токена на
  бэкенде) — необходима прослойка Cloud Functions, сознательно исключённая
  из текущей архитектуры по требованию простоты.
- **Пересечение смен** не блокирует сохранение — только предупреждение в UI.
- Валидация пересечений считается на клиенте по уже загрученным сменам
  каденции — при очень большом числе смен (тысячи) потребуется пересмотр
  подхода (пагинация/индексация), для типичного объёма данных одного
  водителя это не является проблемой.
