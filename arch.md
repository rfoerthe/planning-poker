# Architecture Overview

Planning Poker is a client-side React 19 application built with TypeScript, Vite, and Material UI. Firebase Firestore stores sessions and participants and synchronizes them between browsers. There is no separate application server or user authentication.

- **UI and routing:** React Router loads pages on demand with `React.lazy` and `Suspense`. Vite splits Firebase, Material UI/Emotion, React, and other vendor dependencies into separate chunks.
- **State and persistence:** React state and Firestore snapshots drive the session UI. Browser local storage remembers recent sessions, player IDs, and the theme preference; it is not a complete offline session store.
- **Services:** `src/service/` contains session, player, statistics, timer, presence, and theme logic. `src/repository/` wraps Firestore and local storage access. Components attach Firestore snapshot listeners to references returned by the services.
- **Language and appearance:** The UI is German only. i18next resources from `src/locales/de.ts` are bundled at build time. CSS design tokens and the Material UI theme support light, dark, and system preferences.
- **Operations:** Firebase Hosting and Docker/Nginx serve the static build. GitHub Actions checks lint, types, tests, and the build; deployment is separate. `scripts/` contains the session maintenance commands.
- **Access and privacy:** Firestore holds session names, participant names, votes, and presence timestamps. Vote hiding and moderator controls are client UI behavior; access control depends on the deployed Firestore rules, which are not included in this repository.

See [Technical Architecture](docs/technical-architecture.md) for the data model, routes, service APIs, and operational limitations, and [Setup & Installation](docs/setup-installation.md) for build and deployment instructions.
