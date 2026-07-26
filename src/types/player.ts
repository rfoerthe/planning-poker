import { GameType } from './game';
import { Status } from './status';

export interface Player {
  name: string;
  id: string;
  status: Status;
  value?: number;
  emoji?: string;
  /** Refreshed by the participant's own browser while the session is open. */
  lastSeenAt?: Date | null;
}

export interface PlayerGame {
  id: string;
  name: string;
  isAllowMembersToManageSession?: boolean;
  createdById: string;
  createdBy: string;
  playerId: string;
  isModerator?: boolean;
  isLocked?: boolean;
  existsInStore?: boolean;
  /** Read from the session, not from the cache — the deck may predate the cache entry. */
  gameType?: GameType;
}
