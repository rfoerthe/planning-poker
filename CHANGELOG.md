# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-25

### Added

- Presence indicator: a small green dot in the lower right corner of every participant card that currently has the session open. The dot appears within moments of joining and disappears about two minutes after a participant leaves.
- Presence tracking behind it: each open session refreshes its own `lastSeenAt` every 30 seconds, on entering, and whenever the tab becomes visible again. This is the first thing in the app that can tell a present participant from an entry whose browser is gone.

- Optional round timer. A moderator picks one of six durations (0:30, 1:00, 1:30, 2:00, 3:00, 5:00); the remaining time is shared through Firestore and counts down for every participant.
- Full-screen countdown for the last ten seconds of a round. It never blocks input, so participants can still pick or change a card while it counts.
- Automatic reveal when the timer expires. The connected browsers take turns 750 ms apart instead of relying on one designated browser, so the reveal happens even when participants are still listed but their browser is gone. Participants who voted in the current round take their turn first, which keeps the reveal immediate in the normal case and still produces a single write.
- `src/service/timer.ts` and the `useCountdown` hook, covered by unit and component tests.

### Changed

- `finishGame` and `resetGame` clear a running round timer.
- Added the `pnpm typecheck` script and wired it into CI, so type errors fail the build. `pnpm build` does not type check on its own.

### Fixed

- Repaired the project type declarations. `src/vite-env.d.ts` replaced Vite's own `ImportMetaEnv` without referencing `vite/client`, which hid the asset module declarations and the `VITE_FB_*` variables. The stale Create React App leftover `src/react-app-env.d.ts` was removed.
- Fixed 27 pre-existing TypeScript errors across `HomePage`, `AboutPage`, `AlertDialog`, `LanguageControl`, `TshirtSummary`, and `Toolbar`: `Box padding` replaced by `sx`, `Button color="default"` replaced by `inherit`, `Select` typed with `SelectChangeEvent`, `Menu` migrated from `MenuListProps` to `slotProps.list`, and the deprecated `toBeCalledWith` matcher replaced. No runtime behavior changed.

### Removed

- The session header no longer shows an average, and the stored `average` field is gone along with `getAverage`. The value was written once at reveal time and could therefore disagree with the votes on the table: a vote arriving between reading the players and writing the result left a number that matched no card. Every figure now comes from the estimate result card, which derives it from the current votes on each render. Existing documents keep the field; nothing reads it.

### Notes

- The timer is opt-in per round: nothing counts down until a moderator starts it, and stopping it never reveals the votes.
- A round without any vote is not revealed when the timer expires; the timer only stops. This matches the Reveal button, which stays disabled for such a round.

## [2.1.0] - 2026-07-24

### Added

- Estimate result card for revealed rounds with numeric decks (Short Fibonacci, Fibonacci), showing average, nearest deck card, median, range, vote distribution, and the number of participants who voted without an estimate.
- Consensus rating (`CONSENSUS`, `MODERATE SPREAD`, `CRITICAL SPREAD`) for numeric decks, calculated on card positions rather than raw values, mirroring the existing T-shirt result card.
- Outlier detection: votes at least two card positions away from the median card are named in the result card and framed in the participant list.
- `src/service/statistics.ts` with the round statistics, covered by unit and component tests.

### Notes

- Statistics are calculated in the browser after each reveal and are not persisted. Existing sessions are unaffected.
- The result card stays hidden until the moderator reveals the round, so no vote details can leak early.

## [2.0.5] and earlier

Released before this changelog was introduced. See the Git history for details.
