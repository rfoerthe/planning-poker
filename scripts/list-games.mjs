/**
 * Lists every session document of the `games` collection.
 *
 *   pnpm games:list           table output
 *   pnpm games:list --json    machine readable output (includes player names)
 */
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
  closeFirestore,
  db,
  gamesCollectionName,
  playersCollectionName,
  toIsoString,
} from './firestore-client.mjs';

const asJson = process.argv.slice(2).includes('--json');

const collectGames = async () => {
  const gamesSnap = await getDocs(
    query(collection(db, gamesCollectionName), orderBy('createdAt', 'desc')),
  );

  const games = await Promise.all(
    gamesSnap.docs.map(async (gameDoc) => {
      const data = gameDoc.data();
      const playersSnap = await getDocs(
        collection(db, gamesCollectionName, gameDoc.id, playersCollectionName),
      );

      return {
        id: gameDoc.id,
        name: data.name ?? '',
        gameType: data.gameType ?? '',
        createdAt: toIsoString(data.createdAt),
        createdBy: data.createdBy ?? '',
        isLocked: data.isLocked === true,
        players: playersSnap.size,
        playerNames: playersSnap.docs.map((playerDoc) => playerDoc.data().name ?? playerDoc.id),
      };
    }),
  );

  // Locked sessions are the ones kept on purpose, so they go last; within each
  // group the newest session stays on top.
  return [...games.filter((game) => !game.isLocked), ...games.filter((game) => game.isLocked)];
};

const printTable = (games) => {
  const columns = [
    { key: 'id', label: 'Document-ID' },
    { key: 'name', label: 'name' },
    { key: 'gameType', label: 'gameType' },
    { key: 'createdAt', label: 'createdAt' },
    { key: 'createdBy', label: 'createdBy' },
    { key: 'isLocked', label: 'isLocked' },
    { key: 'players', label: 'players' },
  ];

  const rows = games.map((game) => columns.map((column) => String(game[column.key] ?? '')));
  const widths = columns.map((column, index) =>
    Math.max(column.label.length, ...rows.map((row) => row[index].length), 0),
  );
  const line = (cells) =>
    cells
      .map((cell, i) => cell.padEnd(widths[i]))
      .join('  ')
      .trimEnd();

  console.log(line(columns.map((column) => column.label)));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  rows.forEach((row) => console.log(line(row)));
  console.log(`\n${games.length} document(s), ${games.filter((g) => g.isLocked).length} locked.`);
};

try {
  const games = await collectGames();
  if (asJson) {
    console.log(JSON.stringify(games, null, 2));
  } else if (games.length === 0) {
    console.log('No documents in the "games" collection.');
  } else {
    printTable(games);
  }
} catch (error) {
  console.error(`Listing failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeFirestore();
}
