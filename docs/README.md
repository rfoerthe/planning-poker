# Planning Poker Documentation

This folder contains the working documentation set for Planning Poker, a free and open-source web application for Scrum and Agile estimation sessions.

## Documentation Map

| Document | Purpose | Primary Audience |
| --- | --- | --- |
| [Project Overview](./project-overview.md) | Explains the product purpose, scope, audience, and success criteria. | New team members, stakeholders, contributors |
| [Technical Architecture](./technical-architecture.md) | Describes application structure, data flow, Firestore model, and API/service boundaries. | Developers, technical leads, maintainers |
| [Setup & Installation](./setup-installation.md) | Provides local setup, environment configuration, build, test, and Docker instructions. | Developers, QA, release engineers |
| [Standard Operating Procedures](./standard-operating-procedures.md) | Defines repeatable workflows for testing, contribution, deployment, releases, and maintenance. | Developers, maintainers, project managers |
| [User & Admin Manual](./user-admin-manual.md) | Explains how end users and moderators create, join, manage, and delete sessions. | Users, moderators, support teams |

## Project Snapshot

- **Project name:** Planning Poker
- **Application type:** Web application for Agile/Scrum estimation
- **Primary tech stack:** React, TypeScript, Vite, Material UI, Firebase Firestore
- **Hosting target:** Firebase Hosting and/or Docker-hosted Nginx container
- **Repository package manager:** pnpm
- **Primary branch:** `[Placeholder: confirm default branch, currently referenced as master in CI]`

## Documentation Standards

- Keep docs in Markdown.
- Prefer repo-relative links for files in this repository.
- Update related documentation in the same pull request as code changes.
- Use placeholders in the format `[Placeholder: ...]` when a detail is unknown or pending a team decision.
- Record operational decisions in [Standard Operating Procedures](./standard-operating-procedures.md).

