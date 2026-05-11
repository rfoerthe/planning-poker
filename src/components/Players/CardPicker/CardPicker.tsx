import { Card, CardContent, Grow, Typography } from '@mui/material';
import React from 'react';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { CardConfig, getCards, getCardTextColor } from './CardConfigs';
import './CardPicker.css';

interface CardPickerProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
  randomEmoji?: string;
  selectedCardValue?: number;
  onCardPick?: (card: CardConfig) => void;
}

export const CardPicker: React.FC<CardPickerProps> = ({
  game,
  players,
  currentPlayerId,
  randomEmoji = '',
  selectedCardValue,
  onCardPick = () => {},
}) => {
  const playPlayer = (card: CardConfig) => {
    if (game.gameStatus === Status.Started || game.gameStatus === Status.InProgress) {
      onCardPick(card);
    }
  };

  const cards = game.cards?.length ? game.cards : getCards(game.gameType);

  return (
    <Grow in={true} timeout={200}>
      <div>
        <Typography variant='h6' className='CardPickerTitle'>
          {game.gameStatus !== Status.Finished
            ? 'Click on the card to vote'
            : 'Session not ready for Voting! Wait for moderator to press "Restart" button to start voting.'}
        </Typography>
        <div className='CardPickerContainer'>
          <div className='CardPickerGrid'>
            {cards.map((card: CardConfig) => (
              <div key={card.value} className='CardPickerGridItem'>
                <Card
                  id={`card-${card.displayValue}`}
                  className='CardPicker'
                  variant='outlined'
                  component='button'
                  type='button'
                  disabled={
                    game.gameStatus !== Status.Started && game.gameStatus !== Status.InProgress
                  }
                  onClick={() => playPlayer(card)}
                  style={getCardStyle(
                    players,
                    currentPlayerId,
                    card,
                    game.gameStatus,
                    selectedCardValue,
                  )}
                >
                  <CardContent className='CardContent' component='span'>
                    {card.value >= 0 && (
                      <>
                        <Typography className='CardContentTop' component='span' variant='caption'>
                          {card.displayValue}
                        </Typography>

                        <Typography
                          className='CardContentMiddle'
                          component='span'
                          variant={card.displayValue.length < 2 ? 'h4' : 'h5'}
                        >
                          {card.displayValue}
                        </Typography>
                        <Typography className='CardContentBottom' component='span' variant='caption'>
                          {card.displayValue}
                        </Typography>
                      </>
                    )}
                    {card.value === -1 && (
                      <Typography className='CardContentMiddle' component='span' variant='h3'>
                        {randomEmoji}
                      </Typography>
                    )}
                    {card.value === -2 && (
                      <Typography className='CardContentMiddle' component='span' variant='h3'>
                        ❓
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Grow>
  );
};

const getCardStyle = (
  players: Player[],
  playerId: string,
  card: CardConfig,
  gameStatus: Status,
  optimisticCardValue?: number,
) => {

  const baseStyle = {
    backgroundColor: card.color,
    color: getCardTextColor(card.color),
  };

  const selectedStyle = {
    transform: 'translateY(-15px)',
    zIndex: 5,
    border: '2px dashed black',
    boxShadow: '0 0px 12px 0 grey',
    position: 'relative' as const,
  };

  const finishedStyle = {
    backgroundColor: 'var(--color-background-secondary)',
    filter: 'grayscale(100%)',
    color: 'var(--color-text-secondary)',
  };

  const player = players.find((player) => player.id === playerId);
  const selectedValue = optimisticCardValue ?? player?.value;
  const isSelected = selectedValue !== undefined && selectedValue === card.value;
  const isFinished = gameStatus === Status.Finished;

  if (isSelected) {
    return {
      ...baseStyle,
      ...selectedStyle,
      ...(isFinished && finishedStyle),
    };
  }
  return {
    ...baseStyle,
    ...(isFinished && finishedStyle),
  };
};
