import { CircularProgress } from '@mui/material';
import { onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { streamGame, streamPlayers } from '../../service/games';
import { getCurrentPlayerId } from '../../service/players';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { GameArea } from './GameArea/GameArea';
import './Poker.css';

export const Poker = () => {
  let { id } = useParams<{ id: string }>() as { id: string };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [players, setPlayers] = useState<Player[] | undefined>(undefined);
  const [loading, setIsLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let effectCleanup = true;

    if (effectCleanup) {
      const currentPlayerId = getCurrentPlayerId(id);
      if (!currentPlayerId) {
        navigate(`/join/${id}`);
      }

      setCurrentPlayerId(currentPlayerId);
      setHasError(false);
      setIsLoading(true);
    }

    const handleSnapshotError = (error: Error) => {
      console.error('Failed to receive Firebase updates', error);
      if (effectCleanup) {
        setHasError(true);
        setIsLoading(false);
      }
    };

    const unsubscribeGame = onSnapshot(
      streamGame(id),
      (snapshot) => {
        if (effectCleanup) {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data) {
              setGame(data as Game);
              setIsLoading(false);
              return;
            }
          }
          setIsLoading(false);
        }
      },
      handleSnapshotError,
    );

    const unsubscribePlayers = onSnapshot(
      streamPlayers(id),
      (snapshot) => {
        if (effectCleanup) {
          const players: Player[] = [];
          snapshot.forEach((snapshot) => {
            players.push(snapshot.data() as Player);
          });
          const currentPlayerId = getCurrentPlayerId(id);
          setPlayers(players);
          if (!players.find((player) => player.id === currentPlayerId)) {
            navigate(`/join/${id}`);
          }
        }
      },
      handleSnapshotError,
    );

    return () => {
      effectCleanup = false;
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className='PokerNotice'>
        <CircularProgress size={26} />
        <p className='PokerNoticeText'>{t('session.loading')}</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className='PokerNotice'>
        <p className='PokerNoticeText'>{t('session.updateError')}</p>
      </div>
    );
  }

  if (!game || !players || !currentPlayerId) {
    return (
      <div className='PokerNotice'>
        <p className='PokerNoticeText'>{t('session.notFound')}</p>
      </div>
    );
  }

  return <GameArea game={game} players={players} currentPlayerId={currentPlayerId} />;
};

export default Poker;
