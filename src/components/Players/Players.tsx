import React from 'react';
import { useTranslation } from 'react-i18next';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { Status } from '../../types/status';
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
  const { t } = useTranslation();
  const isRevealed = game.gameStatus === Status.Finished;
  const isCrowded = players.length > 8;

  return (
    <section
      className={isCrowded ? 'PokerTable PokerTableCrowded' : 'PokerTable'}
      aria-label={t('session.tableLabel')}
      data-player-count={players.length}
    >
      <div className={isRevealed ? 'PlayersGrid PlayersGridIsRevealed' : 'PlayersGrid'}>
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
    </section>
  );
};
