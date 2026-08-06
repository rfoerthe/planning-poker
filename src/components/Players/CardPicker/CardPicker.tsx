import React, { CSSProperties, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePlayerValue } from '../../../service/players';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { CardConfig, getCards, getCardTextColor, getRandomEmoji } from './CardConfigs';
import './CardPicker.css';

interface CardPickerProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

/** Cards that carry no estimate and therefore show a symbol instead of a value. */
const unsureCardValue = -2;
const breakCardValue = -1;

export const CardPicker: React.FC<CardPickerProps> = ({ game, players, currentPlayerId }) => {
  const { t } = useTranslation();
  const [randomEmoji, setRandomEmoji] = useState(getRandomEmoji);

  const playPlayer = async (gameId: string, playerId: string, card: CardConfig) => {
    if (game.gameStatus === Status.Finished) {
      return;
    }
    try {
      await updatePlayerValue(gameId, playerId, card.value, randomEmoji, game.gameStatus);
    } catch (error) {
      // Only fails once the own entry is gone, and a removed participant is
      // sent out of the session anyway.
      console.debug('Failed to record the estimate', error);
    }
  };

  useEffect(() => {
    if (game.gameStatus === Status.Started) {
      setRandomEmoji(getRandomEmoji);
    }
  }, [game.gameStatus]);

  const cards = game.cards?.length ? game.cards : getCards(game.gameType);
  const isFinished = game.gameStatus === Status.Finished;
  const currentPlayer = players.find((player) => player.id === currentPlayerId);

  return (
    <section className='CardPickerSection' data-testid='card-picker'>
      <div className='CardPickerHead'>
        <h2 className='SectionLabel CardPickerTitle'>
          {isFinished ? t('cardPicker.lockedTitle') : t('cardPicker.title')}
        </h2>
        <p className='CardPickerHint'>
          {isFinished ? t('cardPicker.lockedHint') : t('cardPicker.hint')}
        </p>
      </div>

      <div className={isFinished ? 'CardPickerDeck CardPickerDeckLocked' : 'CardPickerDeck'}>
        {cards.map((card: CardConfig) => {
          const isSelected =
            currentPlayer?.value !== undefined && currentPlayer.value === card.value;

          return (
            <button
              key={card.value}
              id={`card-${card.displayValue}`}
              type='button'
              className={isSelected ? 'PickerCard PickerCardSelected' : 'PickerCard'}
              disabled={isFinished}
              aria-pressed={isSelected}
              aria-label={getCardLabel(card, t)}
              onClick={() => void playPlayer(game.id, currentPlayerId, card)}
              style={getCardStyle(card, isFinished)}
            >
              {card.value >= 0 ? (
                <>
                  <span className='PickerCardCorner'>{card.displayValue}</span>
                  <span className='PickerCardValue'>{card.displayValue}</span>
                </>
              ) : (
                <span className='PickerCardSymbol EmojiGlyph'>
                  {card.value === breakCardValue ? randomEmoji : '❓'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const getCardLabel = (card: CardConfig, t: (key: string) => string): string => {
  if (card.value === breakCardValue) {
    return t('cardPicker.break');
  }
  if (card.value === unsureCardValue) {
    return t('cardPicker.unsure');
  }
  return card.displayValue;
};

const getCardStyle = (card: CardConfig, isFinished: boolean): CSSProperties => {
  if (isFinished) {
    return {
      backgroundColor: 'var(--color-background-secondary)',
      color: 'var(--color-text-secondary)',
    };
  }

  return {
    backgroundColor: card.color,
    color: getCardTextColor(card.color),
  };
};
