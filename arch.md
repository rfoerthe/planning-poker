# Architecture Overview

## Introduction

This project is a free, open-source Scrum/Agile Planning Poker web application designed to help Agile teams estimate user stories efficiently. It features session management, real-time voting, and a modern, intuitive UI.

## High-Level Architecture

- **Frontend:** Built with React 19 and Material-UI 7, providing a responsive and interactive user interface.
- **State Management:** Utilizes React's built-in state and context, with some data cached in browser local storage for performance and offline support.
- **Routing:** Uses React Router for client-side navigation between pages (Home, Game, Join, About, Guide, etc.).
- **Internationalization:** Supports multiple languages using i18next.
- **Backend/Database:** Integrates with Google Firestore for real-time data storage and synchronization of game sessions and players.

## Main Components

- **App Entry (`src/index.tsx`, `src/App.tsx`):** Bootstraps the React app, sets up theming, routing, and global providers.
- **Pages:** Each major view (Home, Game, Join, About, Guide, Examples, DeleteOldGames) is a separate page component under `src/pages/`.
- **Components:** Reusable UI elements (Toolbar, Players, Poker, Dialogs, etc.) are organized under `src/components/`.
- **Services:** Business logic for games, players, and theming is encapsulated in `src/service/`.
- **Repository Layer:** All Firestore and local storage interactions are abstracted in `src/repository/`.
- **Types:** Shared TypeScript types for games, players, and status are defined in `src/types/`.

## Data Flow

1. **User Interaction:** Users interact with the UI, triggering state changes and service calls.
2. **Service Layer:** Services handle business logic and call repository functions for data persistence.
3. **Repository Layer:** Repository modules abstract Firestore and local storage operations, returning data to services/components.
4. **Real-Time Updates:** Firestore streams are used for real-time updates to game sessions and player lists.

## Build & Deployment

- **Build Tool:** Vite is used for fast development and production builds.
- **Testing:** Vitest is configured for unit and integration tests.
- **Deployment:** The app is designed for deployment on Firebase Hosting.

## Security & Privacy

- No sensitive data is stored on the server; user data is kept in Firestore and local storage. Cookie consent and privacy information are provided to users.

---
For more details, see the README.md and source code directories.
