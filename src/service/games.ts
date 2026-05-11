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
    roundId: 0,
  };
  const gameData = {
    ...newGame,
    id: ulid(),
    average: 0,
    createdById: player.id,
    gameStatus: Status.Started,
    isLocked: false,
    roundId: 0,
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

export const resetGame = async (gameId: string, expectedRoundId?: number) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    if (expectedRoundId !== undefined && (game.roundId ?? 0) !== expectedRoundId) {
      return false;
    }
    const nextRoundId = (game.roundId ?? 0) + 1;
    await updateGame(gameId, {
      average: 0,
      gameStatus: Status.NotStarted,
      roundId: nextRoundId,
    });
    await resetPlayers(gameId, nextRoundId);
    const updatedGame = {
      average: 0,
      gameStatus: Status.Started,
      roundId: nextRoundId,
    };
    await updateGame(gameId, updatedGame);
    return true;
  }
  return false;
};

export const finishGame = async (gameId: string, expectedRoundId?: number) => {
  const game = await getGameFromStore(gameId);

  if (game) {
    if (expectedRoundId !== undefined && (game.roundId ?? 0) !== expectedRoundId) {
      return false;
    }
    if (game.gameStatus !== Status.InProgress) {
      return false;
    }
    const roundId = game.roundId ?? 0;
    const players = await getPlayersFromStore(gameId);
    if (!players) {
      return false;
    }
    const currentRoundPlayers = players.filter((player) => (player.roundId ?? 0) === roundId);
    const updatedGame = {
      average: getAverage(currentRoundPlayers),
      gameStatus: Status.Finished,
      roundId,
    };
    await updateGame(gameId, updatedGame);
    return true;
  }
  return false;
};

export const getAverage = (players: Player[]): number => {
  let values = 0;
  let numberOfPlayersPlayed = 0;
  players.forEach((player) => {
    if (player.status === Status.Finished && player.value !== undefined && player.value >= 0) {
      values = values + player.value;
      numberOfPlayersPlayed++;
    }
  });
  if (numberOfPlayersPlayed === 0) {
    return 0;
  }
  return Math.round(values / numberOfPlayersPlayed);
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

export const updateGameStatus = async (gameId: string, expectedRoundId?: number): Promise<boolean> => {
  const game = await getGame(gameId);
  if (!game) {
    console.log('Game not found');
    return false;
  }
  if (expectedRoundId !== undefined && (game.roundId ?? 0) !== expectedRoundId) {
    return false;
  }
  if (game.gameStatus === Status.Finished) {
    return true;
  }
  const players = await getPlayersFromStore(gameId);
  if (players) {
    const currentRoundPlayers =
      expectedRoundId === undefined
        ? players
        : players.filter((player) => (player.roundId ?? 0) === expectedRoundId);
    const status = getGameStatus(currentRoundPlayers);
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
