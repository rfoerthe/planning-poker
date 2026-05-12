# Project Overview

## Executive Summary

Planning Poker is a free, open-source web application that helps Agile and Scrum teams estimate user stories collaboratively. A moderator creates an estimation session, shares an invite link, and team members vote using configurable card decks. Votes stay hidden until the moderator reveals them, helping reduce anchoring bias and encouraging independent estimation.

## Why This Project Exists

Agile teams need a fast, accessible way to estimate work during refinement or planning ceremonies. Planning Poker provides a lightweight browser-based workflow that avoids requiring participants to install a dedicated app or coordinate cards outside the meeting.

The project is intended to:

- Support distributed teams during estimation conversations.
- Make voting status visible without revealing estimates too early.
- Let moderators quickly restart rounds and remove inactive participants.
- Offer common estimation systems such as Fibonacci, short Fibonacci, T-shirt sizing, mixed T-shirt/number decks, and custom cards.
- Provide an open-source implementation that contributors can inspect, extend, and deploy.

## What The Product Does

Planning Poker allows users to:

- Create an estimation session.
- Select a card configuration.
- Join an existing session through an invite flow.
- Vote on an estimate.
- See who has voted before results are revealed.
- Reveal all submitted estimates.
- Reset a session for the next story.
- Remove participants from a session.
- Delete sessions when they are no longer needed.
- Rejoin recent sessions from local browser history.

## Product Scope

### In Scope

- Browser-based Scrum planning poker sessions.
- Real-time session and player updates through Firestore.
- Moderator and optional member-managed session controls.
- Multi-language UI through i18n locale files.
- Local browser cache of recently joined games.
- Firebase Hosting deployment.
- Docker image build and Nginx serving path.

### Out of Scope

- Native mobile applications.
- User accounts and authentication.
- Long-term historical reporting.
- Payment, subscription, or organization management.
- Full project management system integration.

### Future Enhancements

- Timer support for estimation rounds.
- Export options for voting results.
- Voting history across rounds.
- User story title or description entry.
- Release automation and generated changelogs.

## Target Audiences

### End Users

Scrum team members, product owners, Scrum Masters, engineering managers, and other contributors who participate in estimation sessions.

### Moderators

Session facilitators who create sessions, invite participants, reveal votes, reset rounds, remove participants, and delete completed sessions.

### Developers

New and existing contributors who need to understand the React, TypeScript, Vite, Firebase, and testing structure before making changes.

### External Stakeholders

Project sponsors, open-source users, and evaluators who need to understand the product value, operational model, and deployment approach.

## Goals And Success Criteria

| Goal | Success Criteria | Measurement |
| --- | --- | --- |
| Fast session startup | A moderator can create and share a session in under one minute. | Manual UX check, user feedback |
| Clear voting workflow | Participants understand when to vote, wait, and review revealed cards. | User feedback, support issues |
| Reliable real-time sync | Session and player state updates appear without manual refresh. | Functional testing, Firestore stream behavior |
| Contributor-friendly codebase | New developers can install, test, and build locally using documented steps. | Onboarding feedback, CI pass rate |
| Maintainable releases | Pull requests run lint, test, and build checks before merge. | GitHub Actions results |

## Key Terms

| Term | Definition |
| --- | --- |
| Game | A Planning Poker estimation session stored as a Firestore `games` document. |
| Player | A participant stored under a game's `players` subcollection. |
| Moderator | The user who created the session, or another participant if member management is enabled. |
| Card deck | The configured set of estimation values available in a game. |
| Reveal | The moderator action that exposes all submitted votes and computes an average when applicable. |
| Reset | The moderator action that clears player votes for the next estimation round. |

## Open Questions

- `[Placeholder: Confirm whether "game" or "session" should be the preferred product term in user-facing copy.]`
- `[Placeholder: Define long-term data retention expectations beyond the current old-game cleanup utility.]`
- `[Placeholder: Confirm supported browsers and minimum device requirements.]`
- `[Placeholder: Confirm stakeholder reporting needs, if any.]`

