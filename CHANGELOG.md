# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-07-26

### Added

- Aurora design across every screen: start page, session, result panels, dialogs and footer. The design tokens live in `src/styles/styles.css` and are mirrored into the MUI theme, so components that portal to `document.body` — menus, dialogs, snackbars — resolve the same values as the rest of the app.
- Round status panel while the votes are still hidden: how many have voted, how many are open, and the remaining time. It never shows anything about the estimates themselves.
- The consensus verdict became its own block below the figures, with the spread, the standard deviation and the ratio spelled out next to it.
- An explanation behind every figure of the result panels. Hovering or tapping a value opens a popup with the actual arithmetic of that round — median, average, recommendation, range, abstentions, outliers, standard deviation, spread, ratio, and the verdict itself, including which threshold decided it.
- Each of the four decks carries one suit of a Skat deck as its mark, in the deck picker, next to the session name and on the entries of the resume bar.
- A result panel for numeric decks even when nobody gave an estimate. Previously the panel was simply absent, which read as a defect rather than as an empty round.
- `preview-deploy` script, deploying to a Firebase preview channel that expires after 14 days.

### Changed

- The custom deck takes whole numbers from 0 to 999 only. Entries are checked while typing, duplicates are marked, and the question-mark and break cards are added automatically. The card now carries the entered number as its value instead of the position of the input field, which is what lets a custom deck be evaluated like any other numeric deck.
- The UI is German only, and the translations are compiled into the bundle instead of being fetched at runtime. No request on first paint and no flash of untranslated keys.
- New brand mark: two offset cards on a plain accent tile, replacing the spade on a violet-to-teal gradient. The gradient sat a hue away from the accent the deck suits are drawn in.
- The resume bar removes an entry with the same circular close control as the player cards, instead of a red bin.
- The T-shirt effort ratio compares the middles of the two effort ranges. It used to hold the top of one range against the bottom of another, which made neighbouring sizes look four times apart.
- The consensus thresholds are shared between the numeric and the T-shirt panel, so the two can no longer drift apart, and the explanations name the same numbers the rule uses.

### Fixed

- Safari usually accepted only the first click on an estimate card, then ignored the deck for a few seconds. Recording a vote read the player back from Firestore before writing, and that round trip sat between the click and any visible reaction. The write now goes out directly, which keeps the click on Firestore's latency compensation.
- The outlier badge on a player card swallowed clicks meant for the card underneath it.
- The rounded intermediate values in the standard-deviation walkthrough no longer add up to something other than the result shown.
- German plural forms in the verdict details ("1 Schritt" instead of "1 Schritte").

### Removed

- The "T-shirt and numbers" deck, from the UI, the code and the documentation. Sessions still carrying that type are no longer run through the numeric evaluation: the deck check names the numeric decks instead of excluding the others, so a type this version does not know cannot fall through to "numeric".
- The language switch and the English, Brazilian Portuguese and Chinese (Traditional) translation files, along with the `i18next-http-backend` and `i18next-browser-languagedetector` dependencies.
- `getGameStatus` and `updateGameStatus`, which nothing called any more.

### Notes

- Existing sessions keep working. Only the removed deck loses its result panel, and no stored document is migrated or rewritten.
- Major version because the app dropped a deck and three languages — nothing about the data in Firestore changed.

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
