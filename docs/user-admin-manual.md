# User & Admin Manual

## Audience

This manual is for Planning Poker participants, session moderators, and support/admin users who help manage estimation sessions.

## User Roles

| Role | Description | Common Actions |
| --- | --- | --- |
| Participant | A user who joins a Planning Poker session to vote. | Join session, choose a card, wait for reveal. |
| Moderator | The creator of a session, or a member with management permission. | Reveal votes, reset session, remove players, delete session. |
| Admin/Maintainer | A technical operator with repository or Firebase access. | Deploy app, manage old sessions, investigate production issues. |

## Getting Started As A Participant

1. Open the Planning Poker application.
2. Choose the join option or open an invite link from the moderator.
3. Enter your display name.
4. Join the session.
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

   - Short Fibonacci
   - Fibonacci
   - T-shirt
   - Custom (whole numbers from 0 to 999; the question-mark and break cards are added automatically)

6. Choose whether members may manage the session.
7. Create the session.
8. Share the invite link with participants.

`[Placeholder: Add exact UI labels after product copy is finalized.]`

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
- A card without a dot is an entry whose browser is gone. Moderators can remove such entries.

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
- Participants who are still listed but whose browser is closed do not hold up the reveal. Any participant who is still connected performs it, within about four seconds of the timer expiring.
- The remaining time may differ by a few seconds between participants when their device clocks differ. The reveal itself happens once, for everybody at the same time.

### Reveal

When the moderator reveals the session:

- Submitted cards become visible.
- Numeric decks get a result card with average, median, and spread.
- The team can discuss differences and decide on a final estimate.

### Estimate Result

For numeric decks (Short Fibonacci, Fibonacci), a result card appears below the moderator controls after the reveal. It answers the three questions a team usually asks next.

| Value | Meaning | How to use it |
| --- | --- | --- |
| Average | Mean of all submitted estimates, with one decimal. | Read together with the nearest card; the raw mean is often not a card of the deck. |
| Nearest card | The deck card closest to the average. Ties go to the higher card. | Use it as the proposal for the final estimate. |
| Median | Middle estimate of the round. | More robust than the average when single votes are extreme. |
| Range | Lowest and highest submitted card. | Shows how far apart the team is. |
| Consensus status | Rating of the spread across card positions. | See the table below. |
| Distribution | How often each card was chosen, plus participants who voted without an estimate. | Shows whether the team splits into camps or has one clear favourite. |
| Outliers | Participants whose card is at least two positions away from the median card. | Ask these participants first; they usually know something the others do not. |

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

## Moderator Controls

| Control | Purpose | Recommended Use |
| --- | --- | --- |
| Reveal | Shows all votes and completes the round. | Use after all or most participants have voted. |
| Timer | Starts or stops an optional round timer that reveals the votes when it expires. | Use to timebox discussion-heavy rounds; leave it unused otherwise. |
| Reset | Clears votes for another round. | Use after discussion or before estimating the next story. |
| Remove player | Removes a participant from the session. | Use for duplicate, inactive, or incorrect entries. |
| Delete session | Removes the session. | Use when the session is complete and no longer needed. |

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
- If a game no longer exists in Firestore, it may appear as unavailable or stale.

## Session Management Options

### Moderator-Only Management

The creator controls reveal, reset, player removal, and deletion.

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

### Delete Old Games

The app includes a maintenance path for removing games older than six months.

Recommended admin procedure:

1. Confirm the Firebase project.
2. Confirm deletion approval.
3. Run in a non-production environment first.
4. Verify the deletion count.
5. Run in production if approved.
6. Record the cleanup.

### Deployment Validation

After deployment, an admin should verify:

- The app loads.
- A session can be created.
- Another browser can join.
- Voting works.
- Reveal works.
- Reset works.
- Localization still loads.

## Troubleshooting For Users

| Problem | What To Try |
| --- | --- |
| Invite link does not work | Ask the moderator to resend the link and confirm the session still exists. |
| Your name appears twice | Ask the moderator to remove the duplicate participant. |
| Vote does not update | Refresh the page, rejoin the session, or check network connectivity. |
| Recent session is missing | Browser storage may have been cleared; use the invite link again. |
| Cards are not visible | Refresh the page and confirm the session is active. |
| Moderator controls are missing | Confirm you are the session creator or that member management is enabled. |
| The timer shows a different time than on another screen | Device clocks differ. The automatic reveal is still triggered once for the whole session. |
| The timer expired but nothing was revealed | Nobody had voted. Start the round again or reveal manually after the first vote. |
| Stale participants clutter the session | Cards without a green dot are entries whose browser is gone. Remove them as a moderator. They do not block the automatic reveal. |
| A participant is present but has no green dot | Ask them to reload the session. The dot returns within moments. |

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

