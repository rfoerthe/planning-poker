import { PlayerGame } from '../types/player';

const playerGamesStoreName = 'playerGames';

export const getPlayerGamesFromCache = (): PlayerGame[] => {
  let playerGames: PlayerGame[] = [];

  const store = localStorage.getItem(playerGamesStoreName);
  if (store) {
    playerGames = JSON.parse(store);
  }
  return playerGames;
};

export const isGameInPlayerCache = (gameId: string): boolean => {
  const playerGames = getPlayerGamesFromCache();
  const found = playerGames.find((playerGames) => playerGames.id === gameId);
  if (found) {
    return true;
  }
  return !!found;
};

export const updatePlayerGamesInCache = (playerGames: PlayerGame[]) => {
  localStorage.setItem(playerGamesStoreName, JSON.stringify(playerGames));
};

/*
export const clearPlayerGamesFromCache = () => {
  localStorage.removeItem(playerGamesStoreName);
};
*/
