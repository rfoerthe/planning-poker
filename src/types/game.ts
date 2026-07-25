import { CardConfig } from '../components/Players/CardPicker/CardConfigs';
import { Status } from './status';

export interface Game {
  id: string;
  name: string;
  gameStatus: Status;
  gameType?: GameType | GameType.Fibonacci;
  isAllowMembersToManageSession?: boolean;
  cards: CardConfig[];
  createdBy: string;
  createdById: string;
  createdAt: Date;
  updatedAt?: Date;
  isLocked?: boolean;
  /** Last duration a moderator picked, kept as the default for the next round. */
  timerDurationSeconds?: number;
  /** Set while a round timer runs, cleared on reveal, restart, and stop. */
  timerEndsAt?: Date | null;
}

export interface NewGame {
  name: string;
  gameType: string;
  cards: CardConfig[];
  isAllowMembersToManageSession?: boolean;
  createdBy: string;
  createdAt: Date;
}

export enum GameType {
  Fibonacci = 'Fibonacci',
  ShortFibonacci = 'ShortFibonacci',
  TShirt = 'TShirt',
  TShirtAndNumber = 'TShirtAndNumber',
  Custom = 'Custom',
}
