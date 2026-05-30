import { Card, CardContent, Grow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
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
export const CardPicker: React.FC<CardPickerProps> = ({ game, players, currentPlayerId }) => {
  const [randomEmoji, setRandomEmoji] = useState(getRandomEmoji);
  const playPlayer = (gameId: string, playerId: string, card: CardConfig) => {
    if (game.gameStatus !== Status.Finished) {
      void updatePlayerValue(gameId, playerId, card.value, randomEmoji);
    }
  };

  useEffect(() => {
    if (game.gameStatus === Status.Started) {
      setRandomEmoji(getRandomEmoji);
    }
  }, [game.gameStatus]);

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
                  disabled={game.gameStatus === Status.Finished}
                  onClick={() => playPlayer(game.id, currentPlayerId, card)}
                  style={getCardStyle(players, currentPlayerId, card, game.gameStatus)}
                >
                  <CardContent className='CardContent' component='span'>
                    {card.value >= 0 && (
                      <>
                        <Typography component='span' className='CardContentTop' variant='caption'>
                          {card.displayValue}
                        </Typography>

                        <Typography
                          component='span'
                          className='CardContentMiddle'
                          variant={card.displayValue.length < 2 ? 'h4' : 'h5'}
                        >
                          {card.displayValue}
                        </Typography>
                        <Typography component='span' className='CardContentBottom' variant='caption'>
                          {card.displayValue}
                        </Typography>
                      </>
                    )}
                    {card.value === -1 && (
                      <Typography component='span' className='CardContentMiddle' variant='h3'>
                        {randomEmoji}
                      </Typography>
                    )}
                    {card.value === -2 && (
                      <Typography component='span' className='CardContentMiddle' variant='h3'>
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
) => {

  const baseStyle = {
    backgroundColor: card.color,
    color: getCardTextColor(card.color),
  };

  const selectedStyle = {
    marginTop: '-15px',
    zIndex: 5,
    border: '2px dashed black',
    boxShadow: '0 0px 12px 0 grey',
  };

  const finishedStyle = {
    backgroundColor: 'var(--color-background-secondary)',
    filter: 'grayscale(100%)',
    color: 'var(--color-text-secondary)',
  };

  const player = players.find((player) => player.id === playerId);
  const isSelected = player && player.value !== undefined && player.value === card.value;
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
