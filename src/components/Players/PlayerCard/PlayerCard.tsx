import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  isOutlier?: boolean;
  isActive?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  game,
  player,
  currentPlayerId,
  isOutlier,
  isActive,
}) => {
  const { t } = useTranslation();
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

  const isCurrentPlayer = player.id === currentPlayerId;
  const canRemovePlayer =
    isModerator(game.createdById, currentPlayerId, game.isAllowMembersToManageSession) &&
    !isCurrentPlayer;
  const cardColor = getCardColor(game, player.value);
  const face = getCardFace(player, game);

  const seatClassNames = ['Seat'];
  if (isCurrentPlayer) {
    seatClassNames.push('SeatIsMe');
  }
  if (isOutlier) {
    seatClassNames.push('SeatIsOutlier');
  }

  return (
    <article
      className={seatClassNames.join(' ')}
      title={isOutlier ? t('playerCard.outlierTitle') : undefined}
      data-testid={isOutlier ? 'outlier-player-card' : undefined}
    >
      {isOutlier && <span className='SeatOutlierBadge'>{t('playerCard.outlier')}</span>}

      {canRemovePlayer && (
        <IconButton
          title={t('playerCard.remove')}
          aria-label={t('playerCard.remove')}
          className='SeatRemove CircleRemove'
          size='small'
          onClick={() => removeUser(game.id, player.id)}
          data-testid='remove-button'
        >
          <CloseIcon className='CircleRemoveIcon' />
        </IconButton>
      )}

      <div
        className={face.isEmoji ? 'SeatFace EmojiGlyph' : 'SeatFace'}
        style={{ backgroundColor: cardColor, color: getCardTextColor(cardColor) }}
      >
        {face.text}
      </div>

      <div className='SeatFooter'>
        <div className='SeatIdentity'>
          {isActive && (
            <span
              className='SeatPresence'
              role='img'
              aria-label={t('playerCard.presence')}
              title={t('playerCard.presence')}
              data-testid='presence-indicator'
            />
          )}
          {isEditing && isCurrentPlayer ? (
            <input
              aria-label={t('playerCard.nameLabel')}
              className='SeatNameInput'
              type='text'
              value={editName}
              autoFocus
              maxLength={30}
              onBlur={handleSave}
              onChange={(event) => setEditName(event.target.value)}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSave();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  handleCancel();
                }
              }}
            />
          ) : (
            <button
              className={isCurrentPlayer ? 'SeatName SeatNameEditable' : 'SeatName'}
              // The name is the control itself — see SeatNameEditable in the
              // stylesheet for the affordance that replaces the former icon.
              title={isCurrentPlayer ? t('playerCard.rename') : undefined}
              aria-label={
                isCurrentPlayer ? t('playerCard.renameNamed', { name: player.name }) : undefined
              }
              onClick={isCurrentPlayer ? startEditing : undefined}
              type='button'
              data-testid={isCurrentPlayer ? 'update-button' : undefined}
            >
              {player.name}
            </button>
          )}
        </div>
      </div>

      <div className='SeatRole'>{getRoleLabel(game, player, currentPlayerId, t)}</div>
    </article>
  );
};

const getCardColor = (game: Game, value: number | undefined): string => {
  if (game.gameStatus !== Status.Finished) {
    return 'var(--color-background-secondary)';
  }
  const card = getCards(game.gameType).find((card) => card.value === value);
  return card ? card.color : 'var(--color-background-secondary)';
};

/** What the card shows, and whether it needs the colour-emoji font. */
const getCardFace = (player: Player, game: Game): { text: string; isEmoji: boolean } => {
  if (game.gameStatus !== Status.Finished) {
    return { text: player.status === Status.Finished ? '👍' : '🤔', isEmoji: true };
  }

  if (player.status === Status.Finished) {
    if (player.value && player.value === -1) {
      return { text: player.emoji || '☕', isEmoji: true };
    }
    return { text: getCardDisplayValue(game, player.value), isEmoji: false };
  }
  return { text: '🤔', isEmoji: true };
};

const getCardDisplayValue = (game: Game, cardValue: number | undefined): string => {
  const cards = game.cards?.length > 0 ? game.cards : getCards(game.gameType);
  return (
    cards.find((card) => card.value === cardValue)?.displayValue || cardValue?.toString() || ''
  );
};

const getRoleLabel = (
  game: Game,
  player: Player,
  currentPlayerId: string,
  t: (key: string) => string,
): string => {
  const parts: string[] = [];

  // Only worth pointing out while moderating is one person's job — once every
  // participant may reveal and restart, the creator holds no special role.
  const hasSingleModerator = !game.isAllowMembersToManageSession;

  if (hasSingleModerator && player.id === game.createdById) {
    parts.push(t('playerCard.moderator'));
  }
  if (player.id === currentPlayerId) {
    parts.push(t('playerCard.you'));
  }

  if (parts.length > 0) {
    return parts.join(' · ');
  }

  if (game.gameStatus === Status.Finished) {
    return player.status === Status.Finished && player.value === -1
      ? t('playerCard.abstained')
      : '';
  }

  return player.status === Status.Finished ? t('playerCard.voted') : t('playerCard.thinking');
};
