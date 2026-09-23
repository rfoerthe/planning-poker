# Setup & Installation

## Prerequisites

Install the following tools before working on Planning Poker:

| Tool | Required Version | Notes |
| --- | --- | --- |
| Node.js | Current 22.x, at least `22.13.0`, or a compatible newer LTS release | `package.json` declares `>=22`, but the locked ESLint and jsdom versions require at least 22.13.0 on Node 22. CI uses 22.x. |
| pnpm | `11.1.1` | Use the version pinned in `packageManager`; the declared engine floor is `>=9.0.0`. |
| Git | A version with worktree support | Required for source control and isolated feature work. |
| Firebase project | Your development project with Firestore enabled | Required for real sessions; `.env.example` contains dummy values. |
| Docker | Optional | Required only for container builds. |

## Clone The Repository

```bash
git clone https://github.com/rfoerthe/planning-poker.git
cd planning-poker
```

For forks or private mirrors, replace the URL with `[Placeholder: repository URL]`.

## Install Dependencies

```bash
pnpm install
```

Use the lockfile when installing in CI:

```bash
pnpm install --frozen-lockfile
```

## Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Update `.env` with Firebase configuration:

```text
VITE_FB_API_KEY=[Placeholder: Firebase API key]
VITE_FB_AUTH_DOMAIN=[Placeholder: Firebase auth domain]
VITE_FB_PROJECT_ID=[Placeholder: Firebase project ID]
VITE_FB_STORAGE_BUCKET=[Placeholder: Firebase storage bucket]
VITE_FB_MESSAGING_SENDER_ID=[Placeholder: Firebase messaging sender ID]
VITE_FB_APP_ID=[Placeholder: Firebase app ID]
VITE_FB_MEASUREMENT_ID=[Placeholder: Firebase measurement ID]
```

Keep local environment files out of version control. Vite embeds `VITE_*` values in the browser build, so these variables must not contain private server secrets. Firebase access protection depends on Firestore rules, not on hiding the web configuration.

The app does not sign users in or connect to a Firestore emulator automatically. Configure rules for your target project separately; no Firestore rules file is shipped in this repository.

## Start Local Development

```bash
pnpm run dev
```

Open the local app:

```text
http://localhost:5173
```

Vite opens the default browser automatically. Setting `PORT` selects a different port and disables automatic browser opening.

## Run Tests

```bash
pnpm test
```

Tests use Vitest and Testing Library.

## Run Linting

```bash
pnpm lint
```

Run linting before opening a pull request.

## Run Type Checking

```bash
pnpm typecheck
```

`pnpm build` does not type check, so run this separately. CI runs it on every push and pull request.

## Build For Production

```bash
pnpm build
```

The production build output is generated in:

```text
dist/
```

## Preview Production Build

```bash
pnpm preview
```

The configured preview command serves on:

```text
http://localhost:5000
```

## Docker Setup

### Build Docker Image

The Dockerfile expects `.env` to be mounted as a build secret.

```bash
docker build --secret id=myenv,src=.env -t planning-poker .
```

### Run Docker Container

```bash
docker run -d -p 8080:80 --name planning-poker planning-poker
```

Open:

```text
http://localhost:8080
```

### Stop And Remove Container

```bash
docker stop planning-poker
docker rm planning-poker
```

## Firebase Hosting Setup

The repository includes `firebase.json` configured for a single-page application:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

The Firebase CLI is installed as a development dependency. `.firebaserc` selects `planning-poker-1d6fd` as the default project. Use an explicit project ID when deploying your own instance; this target is independent of `VITE_FB_PROJECT_ID`, which selects the app's database.

```bash
pnpm exec firebase login
pnpm build
pnpm exec firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

For maintainers with access to the configured default project, `pnpm run deploy` cleans `dist`, builds, and runs `firebase deploy`. `pnpm run preview-deploy` does the same build and deploys to the `preview` Hosting channel with a 14-day expiry. Both use `.firebaserc` unless a project override is passed. A preview build still uses the Firebase database configured at build time; a preview channel does not isolate session data.

For a preview of your own project:

```bash
pnpm build
pnpm exec firebase hosting:channel:deploy preview --expires 14d --project YOUR_FIREBASE_PROJECT_ID
```

## Localization Setup

The application currently ships in German only. `src/locales/de.ts` contains the translations, and `src/config/i18n.ts` imports them into the bundle with `de` as the active, fallback, and only supported language. There is no language switch or runtime locale-file fetch.

To add a language, create a resource alongside `de.ts`, register it in `resources` and `supportedLngs`, and implement language selection. Check all translation keys and UI layouts. Markdown documentation remains English.

## Troubleshooting

| Issue | Likely Cause | Resolution |
| --- | --- | --- |
| App starts but Firestore calls fail | Missing or invalid `.env` values | Confirm Firebase variables and restart Vite. |
| Build fails with dependency mismatch | pnpm lockfile or Node version drift | Use a current Node 22.x release and run `pnpm install --frozen-lockfile`. |
| Tests fail in CI but pass locally | Environment or dependency version mismatch | Match CI Node version and run clean install. |
| Docker build cannot find Firebase config | Build secret missing | Pass `--secret id=myenv,src=.env`. |
| Routes 404 after deploy | SPA rewrites missing | Confirm `firebase.json` rewrite to `/index.html`. |

