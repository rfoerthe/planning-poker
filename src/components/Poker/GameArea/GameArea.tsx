import React, { useEffect, useRef, useState } from 'react';
import { finishGame, resetGame } from '../../../service/games';
import { updatePlayerValue } from '../../../service/players';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { CardPicker } from '../../Players/CardPicker/CardPicker';
import { CardConfig, getRandomEmoji } from '../../Players/CardPicker/CardConfigs';
import { Players } from '../../Players/Players';
import { GameController } from '../GameController/GameController';
import './GameArea.css';
import { TshirtLegend } from '../TshirtLegend/TshirtLegend';
import { TshirtSummary } from '../TshirtSummary/TshirtSummary';

interface GameAreaProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

interface PendingVote {
  card: CardConfig;
  emoji: string;
  roundId: number;
}

export const GameArea: React.FC<GameAreaProps> = ({ game, players, currentPlayerId }) => {
  const [randomEmoji, setRandomEmoji] = useState(getRandomEmoji);
  const [optimisticCardValue, setOptimisticCardValue] = useState<number | undefined>();
  const voteTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latestVoteRef = useRef<PendingVote | undefined>(undefined);
  const voteInFlightPromiseRef = useRef<Promise<void> | undefined>(undefined);

  const clearVoteTimeout = () => {
    if (voteTimeoutRef.current) {
      clearTimeout(voteTimeoutRef.current);
      voteTimeoutRef.current = undefined;
    }
  };

  const submitLatestVote = async (): Promise<void> => {
    if (voteInFlightPromiseRef.current) {
      await voteInFlightPromiseRef.current;
      return submitLatestVote();
    }

    const vote = latestVoteRef.current;
    if (!vote) {
      return;
    }

    latestVoteRef.current = undefined;
    const votePromise = updatePlayerValue(
      game.id,
      currentPlayerId,
      vote.card.value,
      vote.emoji,
      vote.roundId,
    )
      .then(() => undefined)
      .finally(() => {
        voteInFlightPromiseRef.current = undefined;
      });
    voteInFlightPromiseRef.current = votePromise;

    await votePromise;
    return submitLatestVote();
  };

  const queueVote = (card: CardConfig) => {
    const roundId = game.roundId ?? 0;
    setOptimisticCardValue(card.value);
    latestVoteRef.current = { card, emoji: randomEmoji, roundId };

    clearVoteTimeout();
    voteTimeoutRef.current = setTimeout(() => {
      void submitLatestVote();
    }, 120);
  };

  const revealGame = async () => {
    clearVoteTimeout();
    await submitLatestVote();
    await finishGame(game.id, game.roundId ?? 0);
  };

  const restartGame = async () => {
    clearVoteTimeout();
    latestVoteRef.current = undefined;
    await resetGame(game.id, game.roundId ?? 0);
  };

  useEffect(() => {
    if (game.gameStatus === 'Started') {
      setRandomEmoji(getRandomEmoji);
      setOptimisticCardValue(undefined);
      latestVoteRef.current = undefined;
    }
  }, [game.gameStatus, game.roundId]);

  useEffect(() => {
    return () => {
      clearVoteTimeout();
    };
  }, []);

  return (
    <>
      <div className='ContentArea'>
        <Players game={game} players={players} currentPlayerId={currentPlayerId} />
        <GameController
          game={game}
          currentPlayerId={currentPlayerId}
          onReveal={revealGame}
          onRestart={restartGame}
        />
        <TshirtSummary game={game} players={players} />
      </div>
      <div className='Footer'>
        <CardPicker
          game={game}
          players={players}
          currentPlayerId={currentPlayerId}
          randomEmoji={randomEmoji}
          selectedCardValue={optimisticCardValue}
          onCardPick={queueVote}
        />
      </div>
      { (game.gameType === GameType.TShirt || game.gameType === GameType.TShirtAndNumber) && (
        <div className='Footer'>
          <TshirtLegend></TshirtLegend>
        </div>
      )}
    </>
  );
};

export default GameArea;
