import React, { useEffect, useMemo } from 'react';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { finishGame, stopTimer } from '../../../service/games';
import { getActivePlayerIds, presenceHeartbeatMs } from '../../../service/presence';
import { getNumericSummary } from '../../../service/statistics';
import {
  countdownThresholdSeconds,
  getRemainingSeconds,
  getTimerEndsAt,
  getTimerTakeoverDelayMs,
} from '../../../service/timer';
import { Status } from '../../../types/status';
import { useCountdown } from '../../../utils/useCountdown';
import { useNow } from '../../../utils/useNow';
import { usePresenceHeartbeat } from '../../../utils/usePresenceHeartbeat';
import { CardPicker } from '../../Players/CardPicker/CardPicker';
import { Players } from '../../Players/Players';
import { GameController } from '../GameController/GameController';
import './GameArea.css';
import { CountdownOverlay } from '../GameTimer/CountdownOverlay';
import { NumericSummary } from '../NumericSummary/NumericSummary';
import { TshirtLegend } from '../TshirtLegend/TshirtLegend';
import { TshirtSummary } from '../TshirtSummary/TshirtSummary';

interface GameAreaProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}
export const GameArea: React.FC<GameAreaProps> = ({ game, players, currentPlayerId }) => {
  // Stays undefined until the moderator revealed the votes, so nothing leaks early.
  const numericSummary = useMemo(() => getNumericSummary(game, players), [game, players]);
  const outlierPlayerIds = useMemo(
    () => new Set(numericSummary?.outliers.map((outlier) => outlier.playerId) ?? []),
    [numericSummary],
  );

  usePresenceHeartbeat(game.id, currentPlayerId);
  const nowMs = useNow(presenceHeartbeatMs / 2);
  const activePlayerIds = useMemo(
    () => getActivePlayerIds(players, nowMs, currentPlayerId),
    [players, nowMs, currentPlayerId],
  );

  const timerEndsAt = getTimerEndsAt(game);
  const remainingMs = useCountdown(timerEndsAt);
  const remainingSeconds = getRemainingSeconds(remainingMs);
  const takeoverDelayMs = getTimerTakeoverDelayMs(players, currentPlayerId);
  const gameId = game.id;
  const gameStatus = game.gameStatus;

  useEffect(() => {
    if (remainingMs === undefined || remainingMs > 0 || gameStatus === Status.Finished) {
      return;
    }

    // Every browser is a candidate, staggered by turn. Whoever acts first ends
    // the round, and the incoming status change clears the pending turns.
    const timeoutId = setTimeout(() => {
      if (gameStatus === Status.InProgress) {
        // Same rule as the Reveal button: only a round with votes can be revealed.
        void finishGame(gameId);
      } else {
        void stopTimer(gameId);
      }
    }, takeoverDelayMs);

    return () => clearTimeout(timeoutId);
  }, [remainingMs, takeoverDelayMs, gameId, gameStatus]);

  const showCountdown =
    remainingSeconds !== undefined &&
    remainingSeconds > 0 &&
    remainingSeconds <= countdownThresholdSeconds &&
    gameStatus !== Status.Finished;

  return (
    <>
      <div className='ContentArea'>
        <Players
          game={game}
          players={players}
          currentPlayerId={currentPlayerId}
          outlierPlayerIds={outlierPlayerIds}
          activePlayerIds={activePlayerIds}
        />
        <GameController game={game} currentPlayerId={currentPlayerId} remainingMs={remainingMs} />
        {numericSummary && <NumericSummary summary={numericSummary} />}
        <TshirtSummary game={game} players={players} />
      </div>
      <div className='Footer'>
        <CardPicker game={game} players={players} currentPlayerId={currentPlayerId} />
      </div>
      { (game.gameType === GameType.TShirt || game.gameType === GameType.TShirtAndNumber) && (
        <div className='Footer'>
          <TshirtLegend></TshirtLegend>
        </div>
      )}
      {showCountdown && <CountdownOverlay secondsLeft={remainingSeconds} />}
    </>
  );
};

export default GameArea;
