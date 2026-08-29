# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.2] - 2026-08-29

### Security

- Closed all 53 open Dependabot alerts (17 high, 31 moderate, 5 low) and one advisory that only `pnpm audit` reported. Every one of them sat in a transitive dependency, and all but `js-cookie` — pulled in by `react-cookie-consent` — were reachable only through `firebase-tools`, so nothing in the shipped bundle was affected. Bumping `firebase-tools` to 15.28.2 and `react-cookie-consent` to 10.0.2 brought fixed versions of `re2`, `tar`, `morgan`, `form-data`, `hono`, `@hono/node-server`, `ip-address`, `fast-uri`, `js-yaml` and `js-cookie`; refreshing the rest of the tree within the ranges their parents already allow moved `undici` to 7.29.0 and 6.28.0 and `brace-expansion` to 1.1.18 and 5.0.9. The direct dependency ranges came along to their current patch and minor releases; no major versions changed.
- Two advisories had no release that an update could reach, so `pnpm-workspace.yaml` now pins them. `gaxios@6` pins `uuid@^9` and never moved off it (GHSA-w5hq-g745-h8pq); it calls only `v4`, which v11 provides unchanged. `@google-cloud/pubsub@5` pins `@opentelemetry/core@^1` and is therefore stuck on GHSA-8988-4f7v-96qf; pubsub 6 is the release that moves to v2, and `firebase-tools` asks for `^5.2.0`, so the override raises it.

### Changed

- The project now requires Node 22 or newer. `@google-cloud/pubsub` 6 sets that floor where `firebase-tools` alone would still accept Node 20. CI already runs 22.x. Pubsub 6 also replaces `google-gax` 5, `google-auth-library` 10 and four smaller Google packages, all of them below `firebase-tools` and none of them in the app.

### Fixed

- `vite.config.ts` imports `package.json` with `with { type: 'json' }`. The bundled config loader had been rewriting that import; Vite 8 warns on every build that its native loader, which is planned to become the default, cannot, because Node refuses a JSON import without the attribute.
- `pnpm test` no longer prints a stack trace on a green run. Two tests drive an error path on purpose — a failing Firestore subscription and a failing presence heartbeat — and the production code reports both on the console, which Vitest forwards to the terminal. An expected `permission denied` trace reaching ten frames into react-dom reads like a real failure and buries an actual one. Both tests now capture the call and assert it, which keeps the output clean and turns the log into part of the contract.

## [3.1.1] - 2026-08-20

### Added

- Three maintenance scripts for the Firestore `games` collection, run from the command line against the project in `.env`: `pnpm games:list` prints every session with its document ID, name, deck, creation date, creator, lock flag and participant count (`--json` adds the participant names); `pnpm games:lock <id>` sets `isLocked: true` on a session; `pnpm games:delete <id> [<id> ...]` removes sessions together with their `players` subcollection. Until now the only way to see or clean up the stored sessions was the Firebase console, and the only way to protect one from the six-month cleanup was to edit the document by hand.
- The delete script refuses to touch a locked session and says so, lists what it is about to delete and asks for confirmation before writing — `--yes` skips the prompt, and without a terminal it aborts rather than assuming consent. The list script puts locked sessions at the end, so what is kept on purpose does not sit between the sessions that are candidates for deletion.

## [3.1.0] - 2026-08-20

### Changed

- Firestore connects through long polling from the start (`experimentalForceLongPolling`, with 10-second poll cycles) instead of the SDK's default streaming transport. The streaming channel is a request that stays open for up to a minute, and corporate proxies and TLS-inspecting firewalls stall exactly that kind of request; the SDK only worked around it after a detection phase that showed up as a 15–30 second hang on the first contact — typically for an invitee opening a join link from a company network. Forcing long polling skips the detection entirely, and the short cycles stay below typical proxy idle timeouts. The price is a little more request overhead for connections that never had the problem, which is negligible at the size of the documents this app moves.
- Joining a session no longer waits for the server. The join page used to spend four to five sequential round trips before the board appeared: read the session to validate the link, read the own player entry, read the session *again* inside the join call, write the new player and wait for the acknowledgement, then subscribe. Now the two validation reads run in parallel, the join call takes the session the page already loaded instead of reading it a second time, and the write is not awaited — Firestore's latency compensation shows the new player on the board immediately while the write syncs in the background, the same pattern the card click has always relied on. What remains in front of the board is one parallel read.
- The Firebase SDK moved from 12.13 to 12.18.

### Added

- The join page says what it is doing. While the session behind the link is being checked it shows "Session wird geprüft …", and if the check runs longer than eight seconds the text changes to a note that corporate networks (VPN/proxy) can slow down the first connection — the situation described above, where users had been staring at a form that looked finished but did not react.

## [3.0.4] - 2026-08-10

### Changed

- `public/logo192.png` and `public/logo512.png` carry the brand mark of the favicon — two offset cards on the accent tile — instead of the unrelated logo they had kept since the project was scaffolded. They are the icons the web app manifest hands to Chrome, so an installation under `chrome://apps` had been showing that old mark on the shelf and in the app window while every other surface already showed the new one. Both are rasterised from `public/favicon.svg` and keep a transparent corner outside the rounded tile, which is what Chrome expects for an icon it does not mask itself.

### Fixed

- `public/index.html` is gone. It was the template Create React App had left behind, with the old English title and description and `%PUBLIC_URL%` placeholders that Vite never substitutes — and, having no module script, no way to start the app. The build was never affected: Vite writes the generated `index.html` over the copied one, so `dist/` always held the real entry point, and that is the only thing nginx and Firebase Hosting ever serve. The dev server was, because it answers from the public directory before it reaches the HTML middleware: `/` came out correct while `/index.html` returned the template — same page, blank, depending on how it was addressed.

## [3.0.3] - 2026-08-06

### Changed

- "Session beitreten" and "Mehr" in the toolbar are drawn as buttons: they carry the hairline outline the quiet buttons elsewhere in the app have, and their label is in the regular text colour. Without a border at rest the two read as labels and only admitted to being controls once the pointer was already on them. "Neue Session" stays the only filled button and therefore the primary action.

## [3.0.2] - 2026-07-28

### Added

- An open session puts its name into the browser tab: "Planning Poker - \<session\>". The title is given back when the session is left, so a tab never keeps the name of a session that is no longer open.
- The seats sit on a poker table while the round runs, and a hidden card says what its participant is doing — an hourglass while they are thinking, a check once they have voted. Tables with more than eight participants switch to a tighter layout.
- The toolbar keeps its first two entries in the bar and moves the rest behind a "Mehr" menu, which is also what raised the point at which the whole navigation collapses into the drawer. The entry for the current page is marked as such.

### Changed

- The favicon is the brand mark of the header: two offset cards on the accent tile. The 16 and 24 px frames of the `.ico` are drawn with the tile colour cut in around the front card — at that size the two cards touch and melt into a single white blob otherwise. `public/favicon.svg` carries the plain mark for browsers that support it.
- `public/apple-touch-icon.png` replaces the unrelated logo that Safari and iOS had been using for bookmarks and the home screen. It is opaque, because iOS puts its own rounded mask over the icon and a transparent corner would come out black.
- The frames inside `favicon.ico` are classic DIB bitmaps rather than embedded PNGs, and the file stops at 64 px — anything larger is the SVG's job. Safari decodes an `.ico` through ImageIO, which does not read PNG-compressed entries and then shows no icon at all, while Chrome brings its own decoder and accepts both. For the same reason the `.ico` is declared before the SVG in `index.html` and carries a `sizes` attribute: Safari has no SVG favicons and takes the `.ico`, browsers that do prefer the sizeless SVG.

### Fixed

- An open session no longer keeps a processor core busy. The dot in the status pill pulsed for as long as a round ran, and a round runs for minutes: the compositor never came to rest, and every frame invalidated the blurred backdrop of the app bar above it. Measured on a table of twelve seats, Chrome's GPU process sat at ~45 % of a core on a page nobody was touching; it is ~2 % now. The pill still names the state in words, which is what carried the information.
- The seats no longer carry a `backdrop-filter`. A full table meant a dozen blurred layers, each re-sampled whenever anything above them changed — for an effect the opaque seat colour hid anyway. The app bar keeps its frosted glass: it is a single surface, and with no permanent animation left, nothing forces it to be recomputed.

## [3.0.1] - 2026-07-26

### Changed

- Both themes are built around `#2563eb` as the primary and accent colour, replacing the violet. Every token was converted to OKLCH, turned to the hue of the new blue and written back with its lightness and chroma untouched — including the greys, which carried a violet tint that would have sat beside a blue accent rather than under it. The documented steps of the dark ramp (page L\*7, cards L\*13, inset areas L\*18, borders L\*25) and every contrast ratio are therefore unchanged: accent on white 5.2:1, accent on a card in the dark theme 6.7:1, and the small labels still clear 4.5:1 on the surface they sit on.
- The MUI theme, the focus-ring fallback in `index.css` and `theme_color` in the web manifest follow the same values. The theme mirror matters: menus, dialogs and snackbars portal to `document.body` and would otherwise have stayed violet.

### Notes

- Green, amber and red keep their meaning — consensus, warning, deletion — and the pastel card faces of the decks are unchanged. Only the brand and the neutrals moved.

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
