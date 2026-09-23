# User & Admin Manual

## Audience

This manual is for Planning Poker participants, session moderators, and support/admin users who help manage estimation sessions. The application UI is German; this manual describes its workflows in English.

## User Roles

| Role | Description | Common Actions |
| --- | --- | --- |
| Participant | A user who joins a Planning Poker session to vote. | Join session, choose a card, wait for reveal. |
| Moderator | The creator of a session, or a member with management permission. | Reveal votes, reset session, remove players, delete session. |
| Admin/Maintainer | A technical operator with repository or Firebase access. | Deploy app, manage old sessions, investigate production issues. |

## Getting Started As A Participant

1. Open the Planning Poker application.
2. Choose the join option or open an invite link from the moderator.
3. Enter the session ID if you did not follow an invite link, then enter your display name.
4. Join the session. The invite check shows a loading message and a slow-connection hint after eight seconds. A browser with an existing participant identity returns directly to the session.
5. Wait for the moderator to introduce the story or estimation item.
6. Select the card that represents your estimate.
7. Wait for the moderator to reveal all votes.
8. Discuss the result with the team.
9. Vote again after the moderator resets the session, if needed.

## Creating A Session As A Moderator

1. Open the Planning Poker application.
2. Choose the create session flow.
3. Enter a session name.
4. Enter your moderator display name.
5. Select a card type:

   - Short Fibonacci (♦)
   - Fibonacci (♥)
   - T-shirt (♠)
   - Custom (♣) — whole numbers from 0 to 999; the question-mark and break cards are added automatically

   Each deck carries one suit of a Skat deck as its mark, all four in the accent colour rather than the red and black of a real deck. The mark appears on the deck buttons, next to the session name during the round, and on the session's entry in the resume bar, so sessions with different decks can be told apart at a glance.

6. Choose whether members may manage the session (enabled by default).
7. Create the session.
8. Share the invite link with participants.

The default deck is Short Fibonacci. Custom decks accept up to 15 entries and require at least two distinct whole numbers; duplicate values prevent creation.

## Voting Workflow

### Before Reveal

Participants can select or change their card while the round is active. The app shows voting status for each participant without exposing selected values.

Common status indicators:

- Voting done
- Yet to vote

### Presence Indicator

A small green dot in the lower right corner of a participant card means that this participant currently has the session open.

- The dot appears within moments of somebody joining.
- It disappears about two minutes after a participant closes the session.
- Your own card always shows the dot.
- A card without a dot has no recent heartbeat. The participant may have left, or their browser or connection may have delayed updates. Moderators can remove stale entries.

The two-minute delay is deliberate. Browsers slow down background tabs, and a participant reading the story in another window is still taking part.

### Round Timer

The round timer is optional. Sessions that do not want time pressure simply never start it, and everything works as before.

1. The moderator selects the timer control in the session controls.
2. The moderator picks a duration: 0:30, 1:00, 1:30, 2:00, 3:00, or 5:00. The last used duration is marked in the menu.
3. All participants see the remaining time counting down.
4. During the last ten seconds a large countdown appears across the screen. It does not block anything; participants can still pick or change a card while it counts.
5. When the timer expires, the votes are revealed automatically.

Notes:

- The moderator can stop the timer at any time by selecting the timer control again. Stopping does not reveal the votes.
- Revealing or restarting the round also ends a running timer.
- If nobody voted when the timer expires, the round is not revealed; the timer simply stops. This matches the Reveal button, which is unavailable for a round without votes.
- Open session browsers take turns attempting the reveal, with delays of up to four seconds after their local countdown expires. Closed browsers do not prevent another participant from acting, but at least one open browser must be able to reach Firestore.
- Device clock differences can shift both the countdown and the reveal attempt. Network delivery determines when other participants see the revealed state; simultaneous display is not guaranteed.

### Reveal

When the moderator reveals the session:

- Submitted cards become visible, and the card picker stays disabled until the round is reset.
- Numeric decks get a result card with average, median, and spread.
- A round in which nobody gave an estimate still gets its result card, stating that there is nothing to evaluate.
- The team can discuss differences and decide on a final estimate.

### Estimate Result

For numeric decks (Short Fibonacci, Fibonacci, and current custom decks), a result card appears in the results area after reveal. Tap or hover over a statistic to see its calculation. Legacy custom decks whose labels do not match their stored numeric values are not evaluated.

| Value | Meaning | How to use it |
| --- | --- | --- |
| Average | Mean of submitted numeric estimates, with at most one decimal (a comma in the German UI). | Read together with the nearest card; the raw mean is often not a card of the deck. |
| Nearest card | The deck card closest to the average. Ties go to the higher card. | Use it as the proposal for the final estimate. |
| Median | Middle estimate of the round. | More robust than the average when single votes are extreme. |
| Range | Lowest and highest submitted card. | Shows how far apart the team is. |
| Consensus status | Rating of the spread across card positions. | See the table below. |
| Distribution | How often each card was chosen, plus participants who voted without an estimate. | Shows whether the team splits into camps or has one clear favourite. |
| Outliers | Participants whose numeric card is at least two positions away from the median rank, when at least three numeric estimates exist. | Ask these participants first; they usually know something the others do not. |

Outlier cards are also framed in red in the participant list.

| Consensus status | Meaning | Recommended action |
| --- | --- | --- |
| CONSENSUS | The team agrees, or is one card apart. | Accept the nearest card and move on. |
| MODERATE SPREAD | The estimates are two card positions apart. | Ask for a short clarification, then decide. |
| CRITICAL SPREAD | The estimates are three or more card positions apart, or scatter widely. | Discuss the story, then revote. |

The result card is calculated in the browser after each reveal and is not stored. T-shirt sessions keep their own T-shirt result card; the coffee and question cards count as "without estimate" and never influence the numbers.

### Reset

When the moderator resets the session:

- Player vote values are cleared.
- Player statuses return to not started.
- The session is ready for the next story or another vote.

## Session Controls

| Control | Purpose | Recommended Use |
| --- | --- | --- |
| Reveal | Shows all votes and completes the round. | Use after all or most participants have voted. |
| Timer | Starts or stops an optional round timer that reveals the votes when it expires. | Use to timebox discussion-heavy rounds; leave it unused otherwise. |
| Reset | Clears votes for another round. | Use after discussion or before estimating the next story. |
| Remove player | Removes another participant from the session. | Use for duplicate, inactive, or incorrect entries. |
| Delete session | Removes an unlocked session and its players after confirmation. | Available to every participant on the active session page. |
| Invite | Shows and copies the join link. | Available to every participant. |
| Leave | Returns to the home page. | Keeps the player document and recent-session reference so the browser can return. |

Reveal, timer management, reset, and removal of other players require moderator or member-management permission. Deletion on the active session page is controlled by the lock flag, not by moderator status.

## Managing Participants

Moderators should:

- Confirm that all expected participants have joined.
- Ask duplicate users to leave or remove duplicates manually.
- Wait for voting status before revealing, unless the team agrees to proceed.
- Reset the session after each story or after a revote is needed.

## Recent Games

The application stores recent session references in the browser. This lets users return to sessions they joined from the same browser.

Important notes:

- Recent games are stored locally in the browser.
- Clearing browser storage may remove recent game history.
- Recent games do not create user accounts.
- Stale entries can remain until revisited or removed; following a missing session clears its cached reference.
- The close control on an unlocked recent session asks to delete the shared session and its players; it is not just a local history removal. This control is shown for entries marked as moderator-accessible. Locked sessions show a lock indicator.

## Session Management Options

### Moderator-Only Management

The creator controls reveal, reset, timer management, and removal of other players. An unlocked session can still be deleted by any participant from the active session page. These UI permissions are not a server-side authorization boundary.

Use this mode when:

- A single facilitator is running the meeting.
- The team wants stricter control.
- The session involves external participants.

### Member-Managed Session

Members may manage the session when this option is enabled.

Use this mode when:

- The team self-facilitates.
- Any participant may reveal or reset.
- The meeting format is informal.

## Admin And Maintenance Tasks

### Command-Line Maintenance

With dependencies installed and `.env` configured, operators can run:

```bash
pnpm games:list
pnpm games:list --json
pnpm games:lock <document-id>
pnpm games:unlock <document-id>
pnpm games:delete <document-id> [<document-id>...]
```

The commands use the app's Firebase web configuration and Firestore rules. Listing provides document IDs; JSON also includes player names. Locking prevents the normal app deletion flow and CLI deletion but leaves voting and moderation available. Unlocking permits deletion again. Deletion prompts for confirmation and skips locked sessions. See [Session Data Maintenance](standard-operating-procedures.md#sop-session-data-maintenance) for batch and non-interactive usage.

### Session Retention

Sessions are not automatically deleted based on age. Use the session delete control or the CLI commands above to remove selected sessions. Both respect deletion locks. Review the target project and selected sessions before confirming deletion.

### Deployment Validation

After deployment, an admin should verify:

- The app loads.
- A session can be created.
- Another browser can join.
- Voting works.
- Reveal works.
- Reset works.
- German UI text renders correctly.
- Light, dark, and system theme preferences work.

## Troubleshooting For Users

| Problem | What To Try |
| --- | --- |
| Invite link does not work | Ask the moderator to resend the link and confirm the session still exists. |
| Your name appears twice | Ask the moderator to remove the duplicate participant. |
| Vote does not update | Refresh the page, rejoin the session, or check network connectivity. |
| Recent session is missing | Browser storage may have been cleared; use the invite link again. |
| Cards are not visible | Refresh the page and confirm the session is active. |
| Moderator controls are missing | Confirm you are the session creator or that member management is enabled. |
| The timer shows a different time than on another screen | Device clocks differ, which can also shift when a browser triggers the shared reveal. Check the system clocks. |
| The timer expired but nothing was revealed | Nobody had voted. Start the round again or reveal manually after the first vote. |
| Stale participants clutter the session | A missing dot means no recent heartbeat. Confirm who has left, then remove their entries as a moderator. |
| A participant is present but has no green dot | Ask them to reload the session. The dot returns within moments. |

## Appearance

Use the theme menu in the toolbar to choose light, dark, or system mode. System mode follows the device setting and is the default. The choice is saved in this browser.

## Accessibility And Usability Notes

- `[Placeholder: Document keyboard navigation expectations.]`
- `[Placeholder: Document screen reader support expectations.]`
- `[Placeholder: Document color contrast validation process.]`
- `[Placeholder: Document supported browser matrix.]`

## Support Escalation

When reporting an issue, include:

- Date and time of the issue.
- Browser and operating system.
- Session name or ID, if safe to share.
- Steps to reproduce.
- Screenshot or screen recording, if possible.
- Console errors, if available.

Send reports to `[Placeholder: support channel or issue tracker URL]`.

