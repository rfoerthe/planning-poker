/**
 * Allows a session to be deleted again by setting `isLocked: false`.
 *
 *   pnpm games:unlock <Document-ID>
 */
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { closeFirestore, db, gamesCollectionName, toIsoString } from './firestore-client.mjs';

const [gameId] = process.argv.slice(2);

if (!gameId) {
  console.error('Usage: pnpm games:unlock <Document-ID>   (list ids with: pnpm games:list)');
  process.exit(1);
}

try {
  const docRef = doc(db, gamesCollectionName, gameId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error(`No document "${gameId}" in the "games" collection.`);
    process.exitCode = 1;
  } else if (snapshot.data().isLocked !== true) {
    console.log(`"${snapshot.data().name ?? gameId}" (${gameId}) is already unlocked.`);
  } else {
    await updateDoc(docRef, { isLocked: false });
    const data = snapshot.data();
    console.log(
      `Unlocked "${data.name ?? gameId}" (${gameId}), created ${toIsoString(data.createdAt)} by ${data.createdBy ?? 'unknown'}.`,
    );
  }
} catch (error) {
  console.error(`Unlocking failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeFirestore();
}
