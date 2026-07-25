import React from 'react';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard/PlayerCard';
import './Players.css';

interface PlayersProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
  outlierPlayerIds?: Set<string>;
  activePlayerIds?: Set<string>;
}
export const Players: React.FC<PlayersProps> = ({
  game,
  players,
  currentPlayerId,
  outlierPlayerIds,
  activePlayerIds,
}) => {
  return (
    <div className='PlayersGrid'>
      {players.map((player: Player) => (
        <PlayerCard
          key={player.id}
          game={game}
          player={player}
          currentPlayerId={currentPlayerId}
          isOutlier={outlierPlayerIds?.has(player.id)}
          isActive={activePlayerIds?.has(player.id)}
        />
      ))}
    </div>
  );
};
