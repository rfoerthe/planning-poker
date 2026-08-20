/**
 * Deletes sessions incl. their `players` subcollection.
 *
 *   pnpm games:delete <Document-ID> [<Document-ID> ...]
 *   pnpm games:delete <id>,<id> --yes    skip the confirmation prompt
 *
 * Documents with `isLocked: true` are never deleted (see `pnpm games:lock`).
 */
import { createInterface } from 'node:readline/promises';
import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import {
  closeFirestore,
  db,
  gamesCollectionName,
  playersCollectionName,
  toIsoString,
} from './firestore-client.mjs';

const args = process.argv.slice(2);
const skipConfirmation = args.includes('--yes') || args.includes('-y');
const gameIds = [
  ...new Set(
    args
      .filter((arg) => !arg.startsWith('-'))
      .flatMap((arg) => arg.split(','))
      .map((id) => id.trim())
      .filter(Boolean),
  ),
];

if (gameIds.length === 0) {
  console.error(
    'Usage: pnpm games:delete <Document-ID> [<Document-ID> ...] [--yes]   (list ids with: pnpm games:list)',
  );
  process.exit(1);
}

/** Splits the ids into what can be deleted, what is protected and what is gone. */
const inspect = async () => {
  const deletable = [];
  const locked = [];
  const missing = [];

  for (const gameId of gameIds) {
    const snapshot = await getDoc(doc(db, gamesCollectionName, gameId));
    if (!snapshot.exists()) {
      missing.push(gameId);
      continue;
    }
    const data = snapshot.data();
    const entry = {
      id: gameId,
      name: data.name ?? '',
      createdAt: toIsoString(data.createdAt),
      createdBy: data.createdBy ?? '',
    };
    if (data.isLocked === true) {
      locked.push(entry);
    } else {
      deletable.push(entry);
    }
  }

  return { deletable, locked, missing };
};

const confirm = async (games) => {
  console.log('The following documents will be deleted, including their players:');
  games.forEach((game) =>
    console.log(`  ${game.id}  ${game.name}  ${game.createdAt}  ${game.createdBy}`),
  );

  if (skipConfirmation) return true;
  if (!process.stdin.isTTY) {
    console.error('No interactive terminal — re-run with --yes to confirm the deletion.');
    return false;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Delete ${games.length} document(s)? [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === 'y';
};

/** Removes the players subcollection first, then the session itself. */
const deleteGame = async (gameId) => {
  const playersSnap = await getDocs(
    collection(db, gamesCollectionName, gameId, playersCollectionName),
  );
  await Promise.all(playersSnap.docs.map((playerDoc) => deleteDoc(playerDoc.ref)));
  await deleteDoc(doc(db, gamesCollectionName, gameId));
  return playersSnap.size;
};

try {
  const { deletable, locked, missing } = await inspect();

  missing.forEach((id) => console.warn(`Skipped ${id}: no such document.`));
  locked.forEach((game) => console.warn(`Skipped ${game.id} ("${game.name}"): locked.`));

  if (deletable.length === 0) {
    console.log('Nothing to delete.');
  } else if (!(await confirm(deletable))) {
    console.log('Aborted, nothing was deleted.');
  } else {
    for (const game of deletable) {
      const playerCount = await deleteGame(game.id);
      console.log(`Deleted ${game.id} ("${game.name}") and ${playerCount} player(s).`);
    }
    console.log(`\n${deletable.length} document(s) deleted.`);
  }

  if (missing.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(`Deletion failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeFirestore();
}
