import { ulid } from 'ulid';
import {
  addGameToStore,
  addPlayerToGameInStore,
  getGameFromStore,
  getPlayersFromStore,
  removeGameFromStore,
  removeOldGameFromStore,
  streamData,
  streamPlayersFromStore,
  updateGameDataInStore,
} from '../repository/firebase';
import { NewGame } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';
import { removeGameFromCache, resetPlayers, updatePlayerGames } from './players';

export const addNewGame = async (newGame: NewGame): Promise<string> => {
  const player = {
    name: newGame.createdBy,
    id: ulid(),
    status: Status.NotStarted,
  };
  const gameData = {
    ...newGame,
    id: ulid(),
    createdById: player.id,
    gameStatus: Status.Started,
    isLocked: false,
  };
  await addGameToStore(gameData.id, gameData);
  await addPlayerToGameInStore(gameData.id, player);
  updatePlayerGames(
    gameData.id,
    gameData.name,
    gameData.createdBy,
    gameData.createdById,
    player.id,
  );

  return gameData.id;
};

export const streamGame = (id: string) => {
  return streamData(id);
};

export const streamPlayers = (id: string) => {
  return streamPlayersFromStore(id);
};

export const getGame = (id: string) => {
  return getGameFromStore(id);
};

export const updateGame = async (gameId: string, updatedGame: any): Promise<boolean> => {
  await updateGameDataInStore(gameId, updatedGame);
  return true;
};

export const resetGame = async (gameId: string) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    const updatedGame = {
      gameStatus: Status.Started,
      timerEndsAt: null,
    };
    await updateGame(gameId, updatedGame);
    await resetPlayers(gameId);
  }
};

export const finishGame = async (gameId: string) => {
  const game = await getGameFromStore(gameId);

  if (game) {
    const updatedGame = {
      gameStatus: Status.Finished,
      timerEndsAt: null,
    };
    await updateGame(gameId, updatedGame);
  }
};

/**
 * Starts an optional round timer. The end time is shared through Firestore so
 * every participant counts down towards the same moment.
 */
export const startTimer = async (gameId: string, durationSeconds: number) => {
  await updateGameDataInStore(gameId, {
    timerDurationSeconds: durationSeconds,
    timerEndsAt: new Date(Date.now() + durationSeconds * 1000),
  });
};

export const stopTimer = async (gameId: string) => {
  await updateGameDataInStore(gameId, { timerEndsAt: null });
};

export const getGameStatus = (players: Player[]): Status => {
  let numberOfPlayersPlayed = 0;
  players.forEach((player: Player) => {
    if (player.status === Status.Finished) {
      numberOfPlayersPlayed++;
    }
  });
  if (numberOfPlayersPlayed === 0) {
    return Status.Started;
  }
  return Status.InProgress;
};

export const updateGameStatus = async (gameId: string): Promise<boolean> => {
  const game = await getGame(gameId);
  if (!game) {
    console.log('Game not found');
    return false;
  }
  const players = await getPlayersFromStore(gameId);
  if (players) {
    const status = getGameStatus(players);
    const dataToUpdate = {
      gameStatus: status,
    };
    return await updateGameDataInStore(gameId, dataToUpdate);
  }
  return false;
};

export const removeGame = async (gameId: string) => {
  const game = await getGameFromStore(gameId)
  if (game?.isLocked) {
    return;
  }
  await removeGameFromStore(gameId);
  removeGameFromCache(gameId);
};

export const deleteOldGames = async () => {
  await removeOldGameFromStore();
};
