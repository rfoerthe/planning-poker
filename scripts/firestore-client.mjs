/**
 * Firestore access for the maintenance scripts. Uses the same web SDK config as
 * the app (VITE_FB_* from .env), so the scripts see the database exactly as a
 * browser client does — no service account needed.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, terminate } from 'firebase/firestore';

const requiredKeys = ['VITE_FB_API_KEY', 'VITE_FB_PROJECT_ID', 'VITE_FB_APP_ID'];

const missing = requiredKeys.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing environment variables: ${missing.join(', ')}\n` +
      'Run the script via pnpm (it passes --env-file=.env) and make sure .env is filled.',
  );
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.VITE_FB_API_KEY,
  authDomain: process.env.VITE_FB_AUTH_DOMAIN,
  projectId: process.env.VITE_FB_PROJECT_ID,
  storageBucket: process.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FB_APP_ID,
  measurementId: process.env.VITE_FB_MEASUREMENT_ID,
});

export const db = getFirestore(app);

export const gamesCollectionName = 'games';
export const playersCollectionName = 'players';

/** Closes the Firestore connection so the script's process can exit. */
export const closeFirestore = () => terminate(db);

/** Firestore Timestamp, Date or undefined -> ISO string. */
export const toIsoString = (value) => {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
};
