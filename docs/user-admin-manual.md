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
   - T-shirt and numbers
   - Custom

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

### Reveal

When the moderator reveals the session:

- Submitted cards become visible.
- Numeric estimates are used to calculate the session average.
- The team can discuss differences and decide on a final estimate.

### Reset

When the moderator resets the session:

- Player vote values are cleared.
- Player statuses return to not started.
- The session is ready for the next story or another vote.

## Moderator Controls

| Control | Purpose | Recommended Use |
| --- | --- | --- |
| Reveal | Shows all votes and completes the round. | Use after all or most participants have voted. |
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

