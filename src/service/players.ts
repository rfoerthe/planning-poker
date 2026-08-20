import { ulid } from 'ulid';
import {
  addPlayerToGameInStore,
  getGameFromStore,
  getPlayerFromStore,
  getPlayersFromStore,
  removePlayerFromGameInStore,
  updateGameDataInStore,
  updatePlayerFieldsInStore,
  updatePlayerInStore,
} from '../repository/firebase';
import { getPlayerGamesFromCache, updatePlayerGamesInCache } from '../repository/localStorage';
import { Game } from '../types/game';
import { Player, PlayerGame } from '../types/player';
import { Status } from '../types/status';
import { isModerator } from '../utils/isModerator';

export const addPlayer = async (gameId: string, player: Player) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    await addPlayerToGameInStore(gameId, player);
  }
};

export const removePlayer = async (gameId: string, playerId: string) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    await removePlayerFromGameInStore(gameId, playerId);
  }
};
/**
 * Records the own estimate.
 *
 * Nothing is read back first. The picked card only lights up once the write
 * reaches the listeners, so a read in front of it puts a server round trip
 * between the click and any visible reaction — on a slow connection the deck
 * simply looks dead for as long as that takes. Writing straight away keeps the
 * click on Firestore's latency compensation, which serves the local listeners
 * before the server has even answered.
 *
 * The round status comes from the caller's snapshot for the same reason: the
 * own vote is the first one exactly while the round has not started counting.
 */
export const updatePlayerValue = async (
  gameId: string,
  playerId: string,
  value: number,
  randomEmoji: string,
  gameStatus: Status,
) => {
  await updatePlayerFieldsInStore(gameId, playerId, {
    value: value,
    emoji: randomEmoji,
    status: Status.Finished,
  });

  if (gameStatus === Status.Started) {
    await updateGameDataInStore(gameId, { gameStatus: Status.InProgress });
  }
};
export const updatePlayerName = async (gameId: string, playerId: string, name: string) => {
  const player = await getPlayerFromStore(gameId, playerId);

  if (player) {
    const updatedPlayer = {
      ...player,
      name: name,
    };
    await updatePlayerInStore(gameId, updatedPlayer);
    return true;
  }
  return false;
};

export const getPlayerRecentGames = async (): Promise<PlayerGame[]> => {
  const playerGamesFromCache = getPlayerGamesFromCache();
  for (let playerGame of playerGamesFromCache) {
    const game = await getGameFromStore(playerGame.id);
    if (game) {
      playerGame.isLocked = game.isLocked;
      playerGame.gameType = game.gameType;
      playerGame.existsInStore = true;
      playerGame.isModerator = isModerator(
        playerGame.createdById,
        getCurrentPlayerId(playerGame.id),
        playerGame.isAllowMembersToManageSession)
    } else {
      playerGame.existsInStore = false;
      playerGame.isModerator = true;
      playerGame.isLocked = false;
    }
  }
  return playerGamesFromCache;
};

export const getCurrentPlayerId = (gameId: string): string | undefined => {
  let playerGames: PlayerGame[] = getPlayerGamesFromCache();

  const game = playerGames.find((playerGame) => playerGame.id === gameId);

  return game && game.playerId;
};

export const updatePlayerGames = (
  gameId: string,
  gameName: string,
  createdBy: string,
  createdById: string,
  playerId: string,
) => {
  let playerGames: PlayerGame[] = getPlayerGamesFromCache();

  playerGames.push({ id: gameId, name: gameName, createdById: createdById, createdBy: createdBy, playerId });

  updatePlayerGamesInCache(playerGames);
};

export const isCurrentPlayerInGame = async (gameId: string): Promise<boolean> => {
  const playerGames = getPlayerGamesFromCache();
  const found = playerGames.find((playerGames) => playerGames.id === gameId);
  if (found) {
    const player = await getPlayerFromStore(found.id, found.playerId);

    //Remove game from cache is player is no longer in the game
    if (!player) {
      removeGameFromCache(found.id);
      return false;
    }
    return true;
  }
  return false;
};

export const isPlayerInGameStore = async (gameId: string, playerId: string) => {
  const player = await getPlayerFromStore(gameId, playerId);
  return !!player;
};

export const removeGameFromCache = (gameId: string) => {
  const playerGames = getPlayerGamesFromCache();
  updatePlayerGamesInCache(playerGames.filter((playerGame) => playerGame.id !== gameId));
};

/**
 * Registers the player in the given game.
 *
 * Takes the game the caller has already loaded instead of reading it again —
 * the join page fetched it to validate the invite link, and on high-latency
 * connections a second read of the same document is a full round trip spent
 * on nothing.
 *
 * The write is deliberately not awaited. Firestore's latency compensation
 * serves the new player to the local listeners immediately, so the caller can
 * navigate to the board right away while the write syncs in the background —
 * the same pattern updatePlayerValue relies on. The SDK retries the write
 * across transient network failures on its own.
 */
export const addPlayerToGame = (game: Game, playerName: string): void => {
  const newPlayer = { name: playerName, id: ulid(), status: Status.NotStarted };

  updatePlayerGames(game.id, game.name, game.createdBy, game.createdById, newPlayer.id);
  addPlayerToGameInStore(game.id, newPlayer).catch((error) => {
    console.error('Failed to persist new player', error);
  });
};

export const resetPlayers = async (gameId: string) => {
  const players = await getPlayersFromStore(gameId);

  await Promise.all(players.map((player) => {
    const updatedPlayer: Player = {
      ...player,
      status: Status.NotStarted,
      value: -3,
    };
    return updatePlayerInStore(gameId, updatedPlayer);
  }));
};
