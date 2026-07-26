import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { addNewGame } from '../../../service/games';
import { GameType, NewGame } from '../../../types/game';
import { getCards, getCustomCards } from '../../Players/CardPicker/CardConfigs';
import './CreateGame.css';

const customOptionCount = 15;
const minimumCustomOptions = 2;

const deckOptions: { gameType: GameType; labelKey: string; values?: string }[] = [
  {
    gameType: GameType.ShortFibonacci,
    labelKey: 'createGame.decks.shortFibonacci',
    values: '0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 40',
  },
  {
    gameType: GameType.Fibonacci,
    labelKey: 'createGame.decks.fibonacci',
    values: '0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · 55 · 89',
  },
  {
    gameType: GameType.TShirt,
    labelKey: 'createGame.decks.tshirt',
    values: 'XXS · XS · S · M · L · XL · XXL',
  },
  {
    gameType: GameType.Custom,
    labelKey: 'createGame.decks.custom',
  },
];

export const CreateGame = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [gameName, setGameName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [gameType, setGameType] = useState<GameType>(GameType.ShortFibonacci);
  const [loading, setLoading] = useState(false);
  const [allowMembersToManageSession, setAllowMembersToManageSession] = useState(true);
  const [customOptions, setCustomOptions] = useState<string[]>(
    Array(customOptionCount).fill('') as string[],
  );
  const [error, setError] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (gameType === GameType.Custom) {
      const filledOptions = customOptions.filter((option) => option && option.trim() !== '').length;
      setError(filledOptions < minimumCustomOptions);
      if (filledOptions < minimumCustomOptions) {
        return;
      }
    }
    setLoading(true);
    const game: NewGame = {
      name: gameName,
      createdBy: createdBy,
      gameType: gameType,
      isAllowMembersToManageSession: allowMembersToManageSession,
      cards: gameType === GameType.Custom ? getCustomCards(customOptions) : getCards(gameType),
      createdAt: new Date(),
    };
    const newGameId = await addNewGame(game);
    if (newGameId) {
      setLoading(false);
    }
    navigate(`/game/${newGameId}`);
  };

  const selectedDeck =
    deckOptions.find((option) => option.gameType === gameType) ?? deckOptions[0];

  const handleCustomOptionChange = (index: number, value: string) => {
    const newCustomOptions = [...customOptions];
    newCustomOptions[index] = value;
    setCustomOptions(newCustomOptions);
  };

  return (
    <form onSubmit={handleSubmit} className='Panel FormPanel'>
      <div className='FormPanelHead'>
        <h2 className='FormPanelTitle'>{t('createGame.title')}</h2>
        <p className='FormPanelSubtitle'>{t('createGame.subtitle')}</p>
      </div>

      <div className='FormPanelBody'>
        <div className='FormField'>
          <label className='FormLabel' htmlFor='sessionNamerequired'>
            {t('createGame.sessionName')}
          </label>
          <input
            className='FormInput'
            id='sessionNamerequired'
            name='sessionName'
            required
            maxLength={60}
            placeholder={t('createGame.sessionNamePlaceholder')}
            value={gameName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setGameName(event.target.value)}
          />
        </div>

        <div className='FormField'>
          <label className='FormLabel' htmlFor='playerNameRequired'>
            {t('createGame.yourName')}
          </label>
          <input
            className='FormInput'
            id='playerNameRequired'
            name='playerName'
            required
            maxLength={30}
            placeholder={t('createGame.yourNamePlaceholder')}
            value={createdBy}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setCreatedBy(event.target.value)}
          />
        </div>

        <div className='FormField'>
          <span className='FormLabel'>{t('createGame.deckLabel')}</span>
          <div className='DeckChips' role='radiogroup' aria-label={t('createGame.deckLabel')}>
            {deckOptions.map((option) => (
              <label
                key={option.gameType}
                className={gameType === option.gameType ? 'DeckChip IsSelected' : 'DeckChip'}
                data-testid={`deck-option-${option.gameType}`}
              >
                <input
                  type='radio'
                  name='gameType'
                  value={option.gameType}
                  aria-label={t(option.labelKey)}
                  checked={gameType === option.gameType}
                  onChange={() => setGameType(option.gameType)}
                />
                {t(option.labelKey)}
              </label>
            ))}
          </div>
          <p className='DeckValues'>{selectedDeck.values ?? t('createGame.deckValues.custom')}</p>
        </div>

        {gameType === GameType.Custom && (
          <div className='FormField'>
            <span className='FormLabel'>{t('createGame.customLabel')}</span>
            <div className='CustomOptionGrid'>
              {customOptions.map((option, index) => (
                <input
                  key={index}
                  className='FormInput CustomOptionInput'
                  id={`custom-option-${index}`}
                  data-testid={`custom-option-${index}`}
                  aria-label={`${t('createGame.customLabel')} ${index + 1}`}
                  maxLength={3}
                  type='text'
                  value={option}
                  onChange={(event) => handleCustomOptionChange(index, event.target.value)}
                />
              ))}
            </div>
            {error ? (
              <p className='FormError'>{t('createGame.customError')}</p>
            ) : (
              <p className='FormHint'>{t('createGame.customHint')}</p>
            )}
          </div>
        )}

        <div className='SwitchRow'>
          <button
            type='button'
            className='SwitchControl'
            role='switch'
            name='allowMembersToManageSession'
            aria-checked={allowMembersToManageSession}
            aria-label={t('createGame.allowMembers')}
            onClick={() => setAllowMembersToManageSession(!allowMembersToManageSession)}
          />
          <span className='SwitchText'>
            {t('createGame.allowMembers')}
            <small>{t('createGame.allowMembersHint')}</small>
          </span>
        </div>

        <button
          type='submit'
          className='AuroraButton AuroraButtonPrimary AuroraButtonBlock'
          data-testid='loading'
          disabled={loading}
        >
          {loading ? t('createGame.submitting') : t('createGame.submit')}
        </button>
      </div>
    </form>
  );
};
