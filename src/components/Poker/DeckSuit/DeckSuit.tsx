import React from 'react';
import { useTranslation } from 'react-i18next';
import { GameType } from '../../../types/game';
import './DeckSuit.css';

interface DeckSuitProps {
  gameType: GameType | undefined;
  /** Set where the deck name is already written next to the suit. */
  decorative?: boolean;
  className?: string;
}

interface Suit {
  symbol: string;
  labelKey: string;
}

/*
 * The four suits of a Skat deck, in their ranking order, for the four decks in
 * the order the deck picker offers them. A suit is only a mark, so which one a
 * deck gets carries no meaning beyond staying the same everywhere.
 *
 * They all carry the accent colour rather than the red and black of a real
 * deck: red is the colour of a warning everywhere else in the app, and the
 * shapes alone tell the four decks apart.
 */
const deckSuits: Record<GameType, Suit> = {
  [GameType.ShortFibonacci]: { symbol: '♦', labelKey: 'createGame.decks.shortFibonacci' },
  [GameType.Fibonacci]: { symbol: '♥', labelKey: 'createGame.decks.fibonacci' },
  [GameType.TShirt]: { symbol: '♠', labelKey: 'createGame.decks.tshirt' },
  [GameType.Custom]: { symbol: '♣', labelKey: 'createGame.decks.custom' },
};

/** Sessions from before the deck choice ran on what is now Short Fibonacci. */
const getSuit = (gameType: GameType | undefined): Suit =>
  (gameType && deckSuits[gameType]) || deckSuits[GameType.ShortFibonacci];

/**
 * The mark of a card deck. Wherever a session shows up without its cards — the
 * deck picker, the session header, the resume bar — this is what tells the
 * decks apart at a glance.
 */
export const DeckSuit: React.FC<DeckSuitProps> = ({ gameType, decorative = false, className }) => {
  const { t } = useTranslation();
  const suit = getSuit(gameType);
  const label = t(suit.labelKey);

  return (
    <span
      className={className ? `DeckSuit ${className}` : 'DeckSuit'}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label, title: label })}
    >
      {suit.symbol}
    </span>
  );
};
