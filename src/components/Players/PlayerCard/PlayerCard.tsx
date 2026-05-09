import DeleteForeverIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import { blue, red } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { removePlayer, updatePlayerName } from '../../../service/players';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { isModerator } from '../../../utils/isModerator';
import { getCards, getCardTextColor } from '../CardPicker/CardConfigs';
import './PlayerCard.css';

interface PlayerCardProps {
  game: Game;
  player: Player;
  currentPlayerId: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ game, player, currentPlayerId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);

  const removeUser = (gameId: string, playerId: string) => {
    removePlayer(gameId, playerId);
  };
  const updateUserName = (gameId: string, playerId: string, name: string) => {
    updatePlayerName(gameId, playerId, name);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) {
      setEditName(player.name);
    }
  }, [isEditing, player.name]);

  const startEditing = () => {
    setEditName(player.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const nextName = editName.trim();

    if (!nextName) {
      setEditName(player.name);
      setIsEditing(false);
      return;
    }

    if (nextName !== player.name) {
      updateUserName(game.id, player.id, nextName);
      return;
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(player.name);
  };

  const canEditCurrentPlayer = player.id === currentPlayerId;

  return (
    <Card
      variant='outlined'
      className='PlayerCard'
      style={{
        backgroundColor: getCardColor(game, player.value),
        color: getCardTextColor(getCardColor(game, player.value)),
      }}
    >
      <CardHeader
        className={player.id !== currentPlayerId ? 'PlayerCardTitle' : 'PlayerCardTitle PlayerCardTitleActive'}
        title={
          isEditing && canEditCurrentPlayer ? (
            <input
              aria-label='Player name'
              className='PlayerCardTitleInput'
              type='text'
              value={editName}
              autoFocus
              maxLength={30}
              onBlur={handleSave}
              onChange={(e) => setEditName(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            />
          ) : (
            <button
              className={canEditCurrentPlayer ? 'PlayerCardName PlayerCardNameEditable' : 'PlayerCardName'}
              aria-label={canEditCurrentPlayer ? 'Rename player' : undefined}
              onClick={canEditCurrentPlayer ? startEditing : undefined}
              type='button'
            >
              {player.name}
            </button>
          )
        }
        slotProps={{ title: { variant: 'subtitle2', noWrap: true } }}
        action={
          (isModerator(game.createdById, currentPlayerId, game.isAllowMembersToManageSession) &&
          player.id !== currentPlayerId && (
            <IconButton
              title='Remove'
              className='RemoveButton'
              onClick={() => removeUser(game.id, player.id)}
              data-testid='remove-button'
              color='primary'
            >
              <DeleteForeverIcon fontSize='small' style={{ color: red[300] }} />
            </IconButton>
          )) ||
          (player.id === currentPlayerId && !isEditing &&
            (
            <IconButton
              title='Edit'
              className='EditButton'
              onClick={startEditing}
              data-testid='update-button'
              color='primary'
            >
              <EditIcon fontSize='small' style={{ color: blue[800] }} />
            </IconButton>
          ))
        }
      />
      <CardContent className='PlayerCardContent'>
        <Typography
          variant={getCardValue(player, game)?.length < 2 ? 'h2' : 'h3'}
          className='PlayerCardContentMiddle'
        >
          {getCardValue(player, game)}
        </Typography>
      </CardContent>
    </Card>
  );
};

const getCardColor = (game: Game, value: number | undefined): string => {
  if (game.gameStatus !== Status.Finished) {
    return 'var(--color-background-secondary)';
  }
  const card = getCards(game.gameType).find((card) => card.value === value);
  return card ? card.color : 'var(--color-background-secondary)';
};

const getCardValue = (player: Player, game: Game) => {
  if (game.gameStatus !== Status.Finished) {
    return player.status === Status.Finished ? '👍' : '🤔';
  }

  if (game.gameStatus === Status.Finished) {
    if (player.status === Status.Finished) {
      if (player.value && player.value === -1) {
        return player.emoji || '☕'; // coffee emoji
      }
      return getCardDisplayValue(game, player.value);
    }
    return '🤔';
  }
  return '';
};

const getCardDisplayValue = (game: Game, cardValue: number | undefined): string => {
  const cards = game.cards?.length > 0 ? game.cards : getCards(game.gameType);
  return (
    cards.find((card) => card.value === cardValue)?.displayValue || cardValue?.toString() || ''
  );
};
